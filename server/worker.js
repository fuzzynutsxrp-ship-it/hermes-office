"use strict";

/**
 * Autonomous Worker Agent
 *
 * Polls the Kanban task store every 60 seconds.
 * When a 'todo' task is found, it:
 *   1. Claims it → status: 'in_progress', assignedAgentId: 'Hermes-Worker-1'
 *   2. Broadcasts a WebSocket event to Claw3D (agent walks to desk, glows)
 *   3. Simulates work (30-60s based on description keywords)
 *   4. Marks it done with result_notes
 *   5. Broadcasts completion event (agent returns to idle)
 *
 * Usage: node server/worker.js
 * Requires the hermes-gateway-adapter to be running on port 18789.
 */

const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const WORKER_AGENT_ID = "Hermes-Worker-1";
const POLL_INTERVAL_MS = 60_000; // 60 seconds
const ADAPTER_PORT = parseInt(process.env.HERMES_ADAPTER_PORT || "18789", 10);
const ADAPTER_URL = `ws://localhost:${ADAPTER_PORT}`;
const HOME = process.env.HOME || "/tmp";

// Task store path — must match src/lib/clawdbot/paths.ts resolveStateDir()
// which is used by src/lib/tasks/shared-store.ts
const LEGACY_STATE_DIRS = [".clawdbot", ".moltbot"];
const NEW_STATE_DIR = ".openclaw";

function resolveStateDir() {
  const override =
    (process.env.OPENCLAW_STATE_DIR || "").trim() ||
    (process.env.MOLTBOT_STATE_DIR || "").trim() ||
    (process.env.CLAWDBOT_STATE_DIR || "").trim();
  if (override) return override.startsWith("~") ? override.replace(/^~/, HOME) : override;
  const newPath = path.join(HOME, NEW_STATE_DIR);
  if (fs.existsSync(newPath)) return newPath;
  for (const legacy of LEGACY_STATE_DIRS) {
    const legacyPath = path.join(HOME, legacy);
    if (fs.existsSync(legacyPath)) return legacyPath;
  }
  return newPath; // default to new
}

const STORE_DIR = path.join(resolveStateDir(), "claw3d", "task-manager");
const STORE_FILE = path.join(STORE_DIR, "tasks.json");

// ---------------------------------------------------------------------------
// Task store helpers
// ---------------------------------------------------------------------------

function readStore() {
  try {
    if (!fs.existsSync(STORE_FILE)) return { schemaVersion: 1, updatedAt: new Date(0).toISOString(), tasks: [] };
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.tasks)) return { schemaVersion: 1, updatedAt: new Date(0).toISOString(), tasks: [] };
    return data;
  } catch {
    return { schemaVersion: 1, updatedAt: new Date(0).toISOString(), tasks: [] };
  }
}

function writeStore(store) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  const tmpPath = path.join(STORE_DIR, `.tasks-${Date.now()}.tmp`);
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2), "utf8");
    fs.renameSync(tmpPath, STORE_FILE);
  } catch (err) {
    try { fs.unlinkSync(tmpPath); } catch {}
    throw err;
  }
}

function findOldestTodoTask(store) {
  const todoTasks = store.tasks.filter((t) => t.status === "todo" && !t.isArchived);
  if (todoTasks.length === 0) return null;
  // Sort by createdAt ascending — oldest first
  todoTasks.sort((a, b) => {
    const aTime = Date.parse(a.createdAt) || 0;
    const bTime = Date.parse(b.createdAt) || 0;
    return aTime - bTime;
  });
  return todoTasks[0];
}

function claimTask(store, task) {
  const now = new Date().toISOString();
  const index = store.tasks.findIndex((t) => t.id === task.id);
  if (index < 0) return null;

  store.tasks[index] = {
    ...store.tasks[index],
    status: "in_progress",
    assignedAgentId: WORKER_AGENT_ID,
    updatedAt: now,
    lastActivityAt: now,
    notes: [
      ...store.tasks[index].notes,
      `[Worker] Claimed by ${WORKER_AGENT_ID} at ${now}`,
    ],
    history: [
      ...store.tasks[index].history,
      {
        at: now,
        type: "status_changed",
        note: `Claimed by ${WORKER_AGENT_ID}`,
        fromStatus: "todo",
        toStatus: "in_progress",
      },
    ],
  };
  store.updatedAt = now;
  writeStore(store);
  return store.tasks[index];
}

function completeTask(store, taskId, resultNotes) {
  const now = new Date().toISOString();
  const index = store.tasks.findIndex((t) => t.id === taskId);
  if (index < 0) return null;

  store.tasks[index] = {
    ...store.tasks[index],
    status: "done",
    updatedAt: now,
    lastActivityAt: now,
    notes: [
      ...store.tasks[index].notes,
      `[Worker] Completed at ${now}: ${resultNotes}`,
    ],
    history: [
      ...store.tasks[index].history,
      {
        at: now,
        type: "status_changed",
        note: resultNotes,
        fromStatus: "in_progress",
        toStatus: "done",
      },
    ],
  };
  store.updatedAt = now;
  writeStore(store);
  return store.tasks[index];
}

// ---------------------------------------------------------------------------
// Work simulation
// ---------------------------------------------------------------------------

function estimateWorkDuration(description) {
  const desc = (description || "").toLowerCase();
  // Complex tasks take longer
  const complexKeywords = ["deploy", "migrate", "refactor", "architect", "database", "security", "performance"];
  const mediumKeywords = ["fix", "update", "configure", "test", "review", "integrate"];

  const isComplex = complexKeywords.some((kw) => desc.includes(kw));
  const isMedium = mediumKeywords.some((kw) => desc.includes(kw));

  if (isComplex) return 45_000 + Math.random() * 15_000; // 45-60s
  if (isMedium) return 30_000 + Math.random() * 15_000;  // 30-45s
  return 20_000 + Math.random() * 10_000;                 // 20-30s
}

function generateResultNotes(task) {
  const desc = (task.description || task.title || "").toLowerCase();
  const templates = [
    `Task "${task.title}" analyzed and completed successfully.`,
    `Completed analysis of "${task.title}". All checks passed.`,
    `Task processed. "${task.title}" — no issues found.`,
    `Successfully handled "${task.title}". Results logged.`,
    `"${task.title}" — execution complete. Output verified.`,
  ];
  const index = Math.floor(Math.random() * templates.length);
  return templates[index];
}

// ---------------------------------------------------------------------------
// WebSocket bridge to Claw3D adapter
// ---------------------------------------------------------------------------

let wsClient = null;
let wsReady = false;
let reconnectTimer = null;

function connectToAdapter() {
  if (wsClient) {
    try { wsClient.close(); } catch {}
    wsClient = null;
    wsReady = false;
  }

  try {
    wsClient = new WebSocket(ADAPTER_URL);

    wsClient.on("open", () => {
      console.log("[worker] Connected to Claw3D adapter");
      // Send connect handshake
      wsClient.send(JSON.stringify({
        type: "req",
        id: "worker-connect",
        method: "connect",
        params: {},
      }));
      wsReady = true;
    });

    wsClient.on("message", (raw) => {
      try {
        const frame = JSON.parse(raw.toString("utf8"));
        if (frame.type === "res" && frame.id === "worker-connect" && frame.ok) {
          console.log("[worker] Adapter handshake complete");
        }
      } catch {}
    });

    wsClient.on("close", () => {
      wsReady = false;
      console.log("[worker] Disconnected from adapter. Reconnecting in 5s...");
      scheduleReconnect();
    });

    wsClient.on("error", (err) => {
      // Silently handle — adapter may not be running yet
      wsReady = false;
    });
  } catch {
    wsReady = false;
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectToAdapter();
  }, 5000);
}

function broadcastToClaw3D(eventPayload) {
  if (!wsClient || wsClient.readyState !== WebSocket.OPEN || !wsReady) {
    console.log("[worker] Adapter not connected, skipping broadcast");
    return;
  }
  // Send a custom method that the adapter will broadcast
  wsClient.send(JSON.stringify({
    type: "req",
    id: `worker-${Date.now()}`,
    method: "office.workerEvent",
    params: eventPayload,
  }));
}

// ---------------------------------------------------------------------------
// Worker loop
// ---------------------------------------------------------------------------

let isProcessing = false;

async function workerTick() {
  if (isProcessing) {
    console.log("[worker] Already processing a task, skipping tick");
    return;
  }

  const store = readStore();
  const task = findOldestTodoTask(store);

  if (!task) {
    console.log("[worker] No todo tasks found. Waiting...");
    return;
  }

  isProcessing = true;
  console.log(`[worker] Found todo task: "${task.title}" (${task.id})`);

  // Step 1: Claim the task
  const claimed = claimTask(store, task);
  if (!claimed) {
    console.log("[worker] Failed to claim task (may have been taken)");
    isProcessing = false;
    return;
  }

  console.log(`[worker] Claimed: "${claimed.title}" → in_progress`);

  // Step 2: Broadcast "working" event to Claw3D
  broadcastToClaw3D({
    action: "task_claimed",
    taskId: claimed.id,
    taskTitle: claimed.title,
    agentId: WORKER_AGENT_ID,
    agentState: "working",
    deskZone: "worker-desks",
    timestamp: new Date().toISOString(),
  });

  // Step 3: Simulate work
  const workDuration = estimateWorkDuration(claimed.description);
  console.log(`[worker] Working on "${claimed.title}" for ${Math.round(workDuration / 1000)}s...`);

  await new Promise((resolve) => setTimeout(resolve, workDuration));

  // Step 4: Mark as done
  const resultNotes = generateResultNotes(claimed);
  const freshStore = readStore(); // Re-read in case of concurrent changes
  const completed = completeTask(freshStore, claimed.id, resultNotes);

  if (completed) {
    console.log(`[worker] Completed: "${completed.title}" → done`);

    // Step 5: Broadcast "idle" event to Claw3D
    broadcastToClaw3D({
      action: "task_completed",
      taskId: completed.id,
      taskTitle: completed.title,
      agentId: WORKER_AGENT_ID,
      agentState: "idle",
      resultNotes,
      timestamp: new Date().toISOString(),
    });
  } else {
    console.log("[worker] Failed to mark task as done (may have been deleted)");
  }

  isProcessing = false;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log(`\n[worker] ═══════════════════════════════════════════`);
console.log(`[worker]   Hermes Autonomous Worker Agent`);
console.log(`[worker]   Agent ID: ${WORKER_AGENT_ID}`);
console.log(`[worker]   Polling every ${POLL_INTERVAL_MS / 1000}s`);
console.log(`[worker]   Adapter: ${ADAPTER_URL}`);
console.log(`[worker] ═══════════════════════════════════════════\n`);

// Connect to adapter
connectToAdapter();

// Run first tick immediately
workerTick();

// Then poll every 60 seconds
setInterval(workerTick, POLL_INTERVAL_MS);

// Heartbeat — tell adapter we're alive every 15 seconds
function sendHeartbeat() {
  broadcastToClaw3D({
    action: "worker_heartbeat",
    agentId: WORKER_AGENT_ID,
    timestamp: new Date().toISOString(),
  });
}
setInterval(sendHeartbeat, 15_000);
// Send first heartbeat shortly after connecting
setTimeout(sendHeartbeat, 3_000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[worker] Shutting down...");
  if (wsClient) try { wsClient.close(); } catch {}
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n[worker] Shutting down...");
  if (wsClient) try { wsClient.close(); } catch {}
  process.exit(0);
});
