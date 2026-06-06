const http = require("node:http");
const https = require("node:https");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const next = require("next");

const { createAccessGate } = require("./access-gate");
const { createGatewayProxy } = require("./gateway-proxy");
const { assertPublicHostAllowed, resolveHosts } = require("./network-policy");
const { loadUpstreamGatewaySettings } = require("./studio-settings");

// ---------------------------------------------------------------------------
// Auto-start the Hermes Gateway Adapter (port 18789) + Worker
// ---------------------------------------------------------------------------

let adapterProcess = null;
let adapterStartAt = 0;

function spawnAdapter() {
  const adapterPath = path.join(__dirname, "hermes-gateway-adapter.js");
  if (!fs.existsSync(adapterPath)) {
    console.warn("[server] Adapter script not found, skipping auto-start.");
    return;
  }

  // Don't double-start if already running
  if (adapterProcess) {
    console.info("[server] Adapter already running, skipping.");
    return;
  }

  console.info("[server] Starting Hermes Gateway Adapter + Worker...");
  adapterStartAt = Date.now();
  adapterProcess = spawn(process.execPath, [adapterPath], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
  });

  adapterProcess.stdout.on("data", (data) => {
    for (const line of data.toString("utf8").trim().split("\n")) {
      if (line.trim()) console.info(`[adapter] ${line}`);
    }
  });

  adapterProcess.stderr.on("data", (data) => {
    for (const line of data.toString("utf8").trim().split("\n")) {
      if (line.trim()) console.error(`[adapter] ${line}`);
    }
  });

  adapterProcess.on("exit", (code, signal) => {
    const uptimeMs = Date.now() - adapterStartAt;
    adapterProcess = null;
    if (signal === "SIGINT" || signal === "SIGTERM") {
      console.info("[server] Adapter stopped gracefully.");
      return;
    }
    if (code !== 0) {
      // If it died within 5s of starting, likely EADDRINUSE (port already taken)
      // — don't restart in a loop, just log and continue.
      if (uptimeMs < 5_000) {
        console.warn(`[server] Adapter exited quickly (code ${code}). Port may already be in use. Skipping restart.`);
      } else {
        console.warn(`[server] Adapter exited with code ${code}. Restarting in 5s...`);
        setTimeout(spawnAdapter, 5_000);
      }
    }
  });

  adapterProcess.on("error", (err) => {
    console.error("[server] Failed to start adapter:", err.message);
    adapterProcess = null;
  });
}

function stopAdapter() {
  if (!adapterProcess) return;
  try { adapterProcess.kill("SIGTERM"); } catch {}
}

const resolvePort = () => {
  const raw = process.env.PORT?.trim() || "3000";
  const port = Number(raw);
  if (!Number.isFinite(port) || port <= 0) return 3000;
  return port;
};

const resolvePathname = (url) => {
  const raw = typeof url === "string" ? url : "";
  const idx = raw.indexOf("?");
  return (idx === -1 ? raw : raw.slice(0, idx)) || "/";
};

const CERT_DIR = require("node:path").join(__dirname, "..", ".certs");
const CERT_PATH = require("node:path").join(CERT_DIR, "localhost.crt");
const KEY_PATH = require("node:path").join(CERT_DIR, "localhost.key");

const generateHttpsCert = async () => {
  const fs = require("node:fs");

  // Re-use a saved cert so the browser only needs to trust it once.
  if (fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH)) {
    return {
      key: fs.readFileSync(KEY_PATH, "utf8"),
      cert: fs.readFileSync(CERT_PATH, "utf8"),
    };
  }

  const selfsigned = require("selfsigned");
  const attrs = [{ name: "commonName", value: "localhost" }];
  const pems = await selfsigned.generate(attrs, {
    days: 825,
    keySize: 2048,
    algorithm: "sha256",
    extensions: [
      {
        name: "subjectAltName",
        altNames: [
          { type: 2, value: "localhost" },
          { type: 7, ip: "127.0.0.1" },
        ],
      },
    ],
  });

  fs.mkdirSync(CERT_DIR, { recursive: true });
  fs.writeFileSync(CERT_PATH, pems.cert);
  fs.writeFileSync(KEY_PATH, pems.private);

  console.info(`\nCert saved to ${CERT_DIR}`);
  console.info("To make browsers trust it (macOS), run:");
  console.info(`  sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "${CERT_PATH}"\n`);

  return { key: pems.private, cert: pems.cert };
};

async function main() {
  const dev = process.argv.includes("--dev");
  const useHttps = process.argv.includes("--https") || process.env.HTTPS === "true";

  // Auto-start the gateway adapter + worker (port 18789) before the UI server
  spawnAdapter();

  // Graceful shutdown — stop adapter when server exits
  const shutdown = () => { stopAdapter(); process.exit(0); };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  const hostnames = Array.from(new Set(resolveHosts(process.env)));
  const hostname = hostnames[0] ?? "127.0.0.1";
  const port = resolvePort();
  for (const host of hostnames) {
    assertPublicHostAllowed({
      host,
      studioAccessToken: process.env.STUDIO_ACCESS_TOKEN,
    });
  }

  const app = next({
    dev,
    hostname,
    port,
    ...(dev ? { webpack: true } : null),
  });
  const handle = app.getRequestHandler();

  const accessGate = createAccessGate({
    token: process.env.STUDIO_ACCESS_TOKEN,
  });

  const proxy = createGatewayProxy({
    loadUpstreamSettings: async () => {
      const settings = loadUpstreamGatewaySettings(process.env);
      return { url: settings.url, token: settings.token, adapterType: settings.adapterType };
    },
    log: (message) => console.info(message),
    logError: (message, error) => console.error(message, error),
    allowWs: (req) => {
      if (resolvePathname(req.url) !== "/api/gateway/ws") return false;
      return true;
    },
    verifyClient: (info) => accessGate.allowUpgrade(info.req),
  });

  await app.prepare();
  const handleUpgrade = app.getUpgradeHandler();
  const handleServerUpgrade = (req, socket, head) => {
    if (resolvePathname(req.url) === "/api/gateway/ws") {
      proxy.handleUpgrade(req, socket, head);
      return;
    }
    handleUpgrade(req, socket, head);
  };

  const httpsCert = useHttps ? await generateHttpsCert() : null;

  const createServer = () =>
    useHttps
      ? https.createServer(httpsCert, (req, res) => {
          if (accessGate.handleHttp(req, res)) return;
          handle(req, res);
        })
      : http.createServer((req, res) => {
          if (accessGate.handleHttp(req, res)) return;
          handle(req, res);
        });

  const servers = hostnames.map(() => createServer());

  const attachUpgradeHandlers = (server) => {
    server.on("upgrade", handleServerUpgrade);
    server.on("newListener", (eventName, listener) => {
      if (eventName !== "upgrade") return;
      if (listener === handleServerUpgrade) return;
      process.nextTick(() => {
        server.removeListener("upgrade", listener);
      });
    });
  };

  for (const server of servers) {
    attachUpgradeHandlers(server);
  }

  const listenOnHost = (server, host) =>
    new Promise((resolve, reject) => {
      const onError = (err) => {
        server.off("error", onError);
        reject(err);
      };
      server.once("error", onError);
      server.listen(port, host, () => {
        server.off("error", onError);
        resolve();
      });
    });

  const closeServer = (server) =>
    new Promise((resolve) => {
      if (!server.listening) return resolve();
      server.close(() => resolve());
    });

  try {
    await Promise.all(servers.map((server, index) => listenOnHost(server, hostnames[index])));
  } catch (err) {
    await Promise.all(servers.map((server) => closeServer(server)));
    throw err;
  }

  const hostForBrowser = hostnames.some((value) => value === "127.0.0.1" || value === "::1")
    ? "localhost"
    : hostname === "0.0.0.0" || hostname === "::"
      ? "localhost"
      : hostname;

  const protocol = useHttps ? "https" : "http";
  const browserUrl = `${protocol}://${hostForBrowser}:${port}`;
  console.info(`Open in browser: ${browserUrl}`);
  if (useHttps) {
    console.info("HTTPS mode: self-signed cert in use. You may need to accept a browser security warning once.");
    console.info(`Spotify redirect URI: ${browserUrl}/office`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
