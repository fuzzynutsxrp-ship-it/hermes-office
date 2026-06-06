/**
 * ETHEREAL OFFICE LAYOUT CONFIG
 * ==============================
 * 
 * Human-readable furniture placement for the Claw3D ethereal cloud/angel office.
 * Edit this file to rearrange furniture — no raw coordinates needed.
 * 
 * HOW IT WORKS:
 *   1. ZONES define named areas of the office (e.g. "worker-desks", "meeting-hub")
 *   2. Each zone has a position on the 1800×1800 canvas grid
 *   3. FURNITURE lists items inside zones using simple grid offsets
 *   4. The engine converts zone + grid position → canvas coordinates automatically
 *
 * LAYOUT LOCK:
 *   This config is locked via LOCAL_LAYOUT_LOCK. When enabled, any remote layout
 *   sync or upstream defaults will be ignored in favor of this local config.
 * 
 * TO MOVE FURNITURE:
 *   - Change its `zone` to move it to a different area
 *   - Change its `grid` [col, row] to reposition within a zone (each cell ≈ 80 units)
 *   - Change its `facing` (0/90/180/270) to rotate it
 * 
 * TO ADD FURNITURE:
 *   - Add a new entry to the appropriate section below
 *   - Valid types: desk_cubicle, chair, round_table, couch, bookshelf, plant,
 *     computer, keyboard, mouse, server_rack, server_terminal, atm, phone_booth,
 *     sms_booth, jukebox, kanban_board, whiteboard, cabinet, fridge, stove,
 *     microwave, coffee_machine, wall_cabinet, sink, dishwasher, vending,
 *     pingpong, beanbag, table_rect, clock, lamp, trash, easel, wall, door,
 *     treadmill, weight_bench, dumbbell_rack, kettlebell_rack, exercise_bike,
 *     punching_bag, rowing_machine, yoga_mat, qa_terminal, device_rack, test_bench
 * 
 * SAVE & RELOAD:
 *   - Save this file → dev server hot-reloads automatically
 *   - If layout doesn't change, clear localStorage key "openclaw-office-furniture-v10"
 *     in browser DevTools (Application → Local Storage) and refresh
 */

// ─── LAYOUT LOCK ──────────────────────────────────────────────────────
// When LOCAL_LAYOUT_LOCK is true, any remote layout sync or upstream defaults
// will be ignored in favor of this local config.
export const LOCAL_LAYOUT_LOCK = true;
export const LAYOUT_VERSION = 'v1-ethereal-locked';
export const LOCKED_AT = '2026-06-06T00:00:00.000Z';

// ─── ZONE DEFINITIONS ────────────────────────────────────────────────
// Each zone is a named rectangular area on the office floor.
// x, y = top-left corner on the 1800×1800 canvas grid
// w, h = width and height of the zone

export const ZONES = {
  // ── Main floor (left side of office) ──
  "meeting-hub":    { x: 50,   y: 50,   w: 350, h: 250, label: "Meeting Hub" },
  "worker-desks":   { x: 100,  y: 320,  w: 700, h: 380, label: "Worker Desks" },
  "lounge":         { x: 750,  y: 420,  w: 300, h: 300, label: "Lounge & Recreation" },
  "kitchen":        { x: 750,  y: 20,   w: 300, h: 200, label: "Kitchen & Break Area" },
  "data-vault":     { x: 20,   y: 560,  w: 240, h: 160, label: "Data Vault (Server Room)" },

  // ── Special stations ──
  "kanban-wall":    { x: 420,  y: 0,    w: 200, h: 80,  label: "Kanban Board Wall" },
  "comms":          { x: 800,  y: 260,  w: 250, h: 140, label: "Communications" },
  "entrance":       { x: 380,  y: 0,    w: 200, h: 60,  label: "Entrance Area" },

  // ── East wing (structural — walls are hardcoded, furniture only) ──
  "gym":            { x: 1126, y: 40,   w: 176, h: 640, label: "Gym" },
  "qa-lab":         { x: 1358, y: 40,   w: 176, h: 640, label: "QA Lab" },
  "art-room":       { x: 260,  y: 40,   w: 178, h: 230, label: "Art Room" },
} as const;

export type ZoneName = keyof typeof ZONES;

// ─── FURNITURE ITEM TYPE DEFINITIONS ─────────────────────────────────
// Describes the visual style and default size for each furniture type.

export const FURNITURE_TYPES = {
  "ethereal-desk":       { type: "desk_cubicle", w: 100, h: 55, desc: "Crystal-topped workstation" },
  "ethereal-chair":      { type: "chair", desc: "Silver-blue floating seat" },
  "crystal-monitor":     { type: "computer", desc: "Glowing crystal display" },
  "hologram-keyboard":   { type: "keyboard", desc: "Holographic input pad" },
  "light-mouse":         { type: "mouse", desc: "Light-orb pointer" },
  "cloud-table":         { type: "round_table", r: 90, desc: "Wispy cloud meeting table" },
  "mist-couch":          { type: "couch", desc: "Mist-woven lounge sofa" },
  "glow-shelf":          { type: "bookshelf", w: 80, h: 120, desc: "Luminous crystal shelf" },
  "crystal-plant":       { type: "plant", desc: "Bioluminescent crystal flora" },
  "data-rack":           { type: "server_rack", desc: "Floating server monolith" },
  "data-terminal":       { type: "server_terminal", desc: "Vault control console" },
  "neon-board":          { type: "kanban_board", w: 130, h: 65, desc: "Holographic task board" },
  "void-booth":          { type: "phone_booth", desc: "Sound-dampened comm pod" },
  "whisper-booth":       { type: "sms_booth", desc: "Silent message chamber" },
  "crystal-atm":         { type: "atm", desc: "Ethereal currency terminal" },
  "ether-jukebox":       { type: "jukebox", desc: "Ambient sound emitter" },
  "arcane-vending":      { type: "vending", desc: "Mystical refreshment unit" },
  "void-beanbag":        { type: "beanbag", desc: "Dark matter cushion" },
  "ether-fridge":        { type: "fridge", w: 40, h: 80, desc: "Cryo-chamber cooler" },
  "ether-stove":         { type: "stove", desc: "Plasma heating element" },
  "ether-microwave":     { type: "microwave", desc: "Quantum reheater" },
  "ether-cabinet":       { type: "cabinet", w: 80, h: 40, desc: "Floating storage" },
  "ether-coffee":        { type: "coffee_machine", desc: "Elixir brewer" },
  "ether-wall-cab":      { type: "wall_cabinet", w: 80, h: 20, elevation: 0.9, desc: "Hover cabinet" },
  "ether-sink":          { type: "sink", desc: "Purification basin" },
  "ether-dishwasher":    { type: "dishwasher", w: 40, h: 40, desc: "Cleansing unit" },
  "cloud-table-rect":    { type: "table_rect", desc: "Cloud-surface table" },
  "star-lamp":           { type: "lamp", desc: "Floating star light" },
  "void-trash":          { type: "trash", desc: "Void disposal unit" },
  "temporal-clock":      { type: "clock", desc: "Ethereal timepiece" },
  "crystal-whiteboard":  { type: "whiteboard", w: 10, h: 60, desc: "Crystal ideation surface" },
  "ping-pong":           { type: "pingpong", w: 100, h: 60, desc: "Gravity-defying table" },
  "ether-treadmill":     { type: "treadmill", desc: "Void runner" },
  "ether-weight-bench":  { type: "weight_bench", desc: "Gravity bench" },
  "ether-dumbbell-rack": { type: "dumbbell_rack", desc: "Void weights" },
  "ether-rowing":        { type: "rowing_machine", desc: "Ether rower" },
  "ether-kettlebell":    { type: "kettlebell_rack", desc: "Dark kettlebells" },
  "ether-bike":          { type: "exercise_bike", desc: "Void cycle" },
  "ether-bag":           { type: "punching_bag", desc: "Shadow bag" },
  "ether-yoga":          { type: "yoga_mat", desc: "Meditation mat", color: "#2a1860" },
  "ether-easel":         { type: "easel", desc: "Crystal canvas" },
  "ether-qa-terminal":   { type: "qa_terminal", desc: "QA control nexus" },
  "ether-device-rack":   { type: "device_rack", desc: "Testing device array" },
  "ether-test-bench":    { type: "test_bench", desc: "Analysis workstation" },
} as const;

export type FurnitureTypeName = keyof typeof FURNITURE_TYPES;

// ─── FURNITURE PLACEMENT ─────────────────────────────────────────────
// This is the master list. Each entry places one item in a zone.
// Grid [col, row]: col=horizontal (0=left), row=vertical (0=top)
// Each grid cell ≈ 80 canvas units. facing: 0/90/180/270 degrees.

export interface LayoutItem {
  id: string;
  type: FurnitureTypeName;
  zone: ZoneName;
  grid: [number, number];   // [col, row] within zone
  facing?: number;           // 0 (default), 90, 180, 270
  w?: number;
  h?: number;
  r?: number;
  color?: string;
  elevation?: number;
}

// ── MEETING HUB: Central gathering point ──────────────────────────
const MEETING_HUB: LayoutItem[] = [
  { id: "meeting-table",   type: "cloud-table",      zone: "meeting-hub", grid: [2, 1], r: 90 },
  { id: "meeting-chair-1", type: "ethereal-chair",   zone: "meeting-hub", grid: [3, 1], facing: 0 },
  { id: "meeting-chair-2", type: "ethereal-chair",   zone: "meeting-hub", grid: [4, 2], facing: 325 },
  { id: "meeting-chair-3", type: "ethereal-chair",   zone: "meeting-hub", grid: [3, 3], facing: 240 },
  { id: "meeting-chair-4", type: "ethereal-chair",   zone: "meeting-hub", grid: [1, 1], facing: 105 },
  { id: "meeting-chair-5", type: "ethereal-chair",   zone: "meeting-hub", grid: [1, 2], facing: 60 },
  { id: "meeting-lamp",    type: "star-lamp",         zone: "meeting-hub", grid: [4, 0] },
  { id: "meeting-clock",   type: "temporal-clock",    zone: "meeting-hub", grid: [5, 0] },
];

// ── WORKER DESKS: Two rows of 4 desks where agents work ──────────
const WORKER_DESKS: LayoutItem[] = [
  // Row 1 (top row — agents face upward / south)
  { id: "desk-0",  type: "ethereal-desk",     zone: "worker-desks", grid: [0, 0] },
  { id: "desk-0-chair", type: "ethereal-chair", zone: "worker-desks", grid: [0.25, -0.15], facing: 180 },
  { id: "desk-0-mon",   type: "crystal-monitor", zone: "worker-desks", grid: [0.25, -0.17] },
  { id: "desk-0-kb",    type: "hologram-keyboard", zone: "worker-desks", grid: [0.38, -0.07] },
  { id: "desk-0-mouse", type: "light-mouse",    zone: "worker-desks", grid: [0.65, -0.07] },
  { id: "desk-0-trash", type: "void-trash",     zone: "worker-desks", grid: [0.88, -0.12] },

  { id: "desk-1",  type: "ethereal-desk",     zone: "worker-desks", grid: [2, 0] },
  { id: "desk-1-chair", type: "ethereal-chair", zone: "worker-desks", grid: [2.25, -0.15], facing: 180 },
  { id: "desk-1-mon",   type: "crystal-monitor", zone: "worker-desks", grid: [2.25, -0.17] },
  { id: "desk-1-kb",    type: "hologram-keyboard", zone: "worker-desks", grid: [2.38, -0.07] },
  { id: "desk-1-mouse", type: "light-mouse",    zone: "worker-desks", grid: [2.65, -0.07] },
  { id: "desk-1-trash", type: "void-trash",     zone: "worker-desks", grid: [2.88, -0.12] },

  { id: "desk-2",  type: "ethereal-desk",     zone: "worker-desks", grid: [4, 0] },
  { id: "desk-2-chair", type: "ethereal-chair", zone: "worker-desks", grid: [4.25, -0.15], facing: 180 },
  { id: "desk-2-mon",   type: "crystal-monitor", zone: "worker-desks", grid: [4.25, -0.17] },
  { id: "desk-2-kb",    type: "hologram-keyboard", zone: "worker-desks", grid: [4.38, -0.07] },
  { id: "desk-2-mouse", type: "light-mouse",    zone: "worker-desks", grid: [4.65, -0.07] },
  { id: "desk-2-trash", type: "void-trash",     zone: "worker-desks", grid: [4.88, -0.12] },

  { id: "desk-3",  type: "ethereal-desk",     zone: "worker-desks", grid: [6, 0] },
  { id: "desk-3-chair", type: "ethereal-chair", zone: "worker-desks", grid: [6.25, -0.15], facing: 180 },
  { id: "desk-3-mon",   type: "crystal-monitor", zone: "worker-desks", grid: [6.25, -0.17] },
  { id: "desk-3-kb",    type: "hologram-keyboard", zone: "worker-desks", grid: [6.38, -0.07] },
  { id: "desk-3-mouse", type: "light-mouse",    zone: "worker-desks", grid: [6.65, -0.07] },
  { id: "desk-3-trash", type: "void-trash",     zone: "worker-desks", grid: [6.88, -0.12] },

  // Row 2 (bottom row — agents face downward / north)
  { id: "desk-4",  type: "ethereal-desk",     zone: "worker-desks", grid: [0, 3] },
  { id: "desk-4-mon",   type: "crystal-monitor", zone: "worker-desks", grid: [0.25, 2.82] },
  { id: "desk-4-kb",    type: "hologram-keyboard", zone: "worker-desks", grid: [0.38, 2.92] },
  { id: "desk-4-mouse", type: "light-mouse",    zone: "worker-desks", grid: [0.65, 2.95] },
  { id: "desk-4-trash", type: "void-trash",     zone: "worker-desks", grid: [0.88, 2.9] },

  { id: "desk-5",  type: "ethereal-desk",     zone: "worker-desks", grid: [2, 3] },
  { id: "desk-5-chair", type: "ethereal-chair", zone: "worker-desks", grid: [2.12, 2.88], facing: 180 },
  { id: "desk-5-mon",   type: "crystal-monitor", zone: "worker-desks", grid: [2.25, 2.82] },
  { id: "desk-5-kb",    type: "hologram-keyboard", zone: "worker-desks", grid: [2.38, 2.92] },
  { id: "desk-5-mouse", type: "light-mouse",    zone: "worker-desks", grid: [2.65, 2.95] },
  { id: "desk-5-trash", type: "void-trash",     zone: "worker-desks", grid: [2.88, 2.9] },

  { id: "desk-6",  type: "ethereal-desk",     zone: "worker-desks", grid: [4, 3] },
  { id: "desk-6-chair", type: "ethereal-chair", zone: "worker-desks", grid: [4.12, 2.88], facing: 180 },
  { id: "desk-6-mon",   type: "crystal-monitor", zone: "worker-desks", grid: [4.25, 2.82] },
  { id: "desk-6-kb",    type: "hologram-keyboard", zone: "worker-desks", grid: [4.38, 2.92] },
  { id: "desk-6-mouse", type: "light-mouse",    zone: "worker-desks", grid: [4.65, 2.95] },
  { id: "desk-6-trash", type: "void-trash",     zone: "worker-desks", grid: [4.88, 2.9] },

  { id: "desk-7",  type: "ethereal-desk",     zone: "worker-desks", grid: [6, 3] },
  { id: "desk-7-chair", type: "ethereal-chair", zone: "worker-desks", grid: [6.12, 2.88], facing: 180 },
  { id: "desk-7-mon",   type: "crystal-monitor", zone: "worker-desks", grid: [6.25, 2.82] },
  { id: "desk-7-kb",    type: "hologram-keyboard", zone: "worker-desks", grid: [6.38, 2.92] },
  { id: "desk-7-mouse", type: "light-mouse",    zone: "worker-desks", grid: [6.65, 2.95] },
  { id: "desk-7-trash", type: "void-trash",     zone: "worker-desks", grid: [6.88, 2.9] },

  // Aisles — whiteboard and plant for atmosphere
  { id: "worker-whiteboard", type: "crystal-whiteboard", zone: "worker-desks", grid: [-0.5, 1] },
  { id: "worker-plant-1",    type: "crystal-plant",      zone: "worker-desks", grid: [-0.5, 0] },
  { id: "worker-plant-2",    type: "crystal-plant",      zone: "worker-desks", grid: [8, 3] },
];

// ── DATA VAULT: Server room in bottom-left ────────────────────────
const DATA_VAULT: LayoutItem[] = [
  // Walls (3 sides — south wall + east walls with door gap)
  { id: "vault-wall-s",  type: "ethereal-desk", zone: "data-vault", grid: [0, 0], facing: 0 },
  // Note: vault walls are handled by structural walls in furnitureDefaults.
  // Only placing furniture items here.
  { id: "vault-rack-1",  type: "data-rack",     zone: "data-vault", grid: [0.4, 0.4] },
  { id: "vault-rack-2",  type: "data-rack",     zone: "data-vault", grid: [1.6, 0.4] },
  { id: "vault-terminal", type: "data-terminal", zone: "data-vault", grid: [1.2, 1.2], facing: 180 },
];

// ── LOUNGE: Bottom-right recreation area ──────────────────────────
const LOUNGE: LayoutItem[] = [
  { id: "lounge-couch-1", type: "mist-couch",       zone: "lounge", grid: [0.5, 0], w: 100, h: 40, facing: 90 },
  { id: "lounge-bean-1",  type: "void-beanbag",     zone: "lounge", grid: [0.5, 1.6], color: "#2a1860", facing: 90 },
  { id: "lounge-bean-2",  type: "void-beanbag",     zone: "lounge", grid: [0.5, 2.5], color: "#1a1040", facing: 90 },
  { id: "lounge-table",   type: "cloud-table-rect", zone: "lounge", grid: [0.5, 2], w: 60, h: 30, facing: 270 },
  { id: "lounge-couch-2", type: "mist-couch",       zone: "lounge", grid: [0, 4.5], w: 100, h: 40 },
  { id: "lounge-pingpong", type: "ping-pong",        zone: "lounge", grid: [1.5, 3], w: 100, h: 60 },
  { id: "lounge-lamp",    type: "star-lamp",         zone: "lounge", grid: [0, 0.5] },
];

// ── KITCHEN: Top-right break area ─────────────────────────────────
const KITCHEN: LayoutItem[] = [
  { id: "kitchen-cab-1",     type: "ether-cabinet",    zone: "kitchen", grid: [0, 0], w: 80, h: 40, elevation: 0 },
  { id: "kitchen-coffee",    type: "ether-coffee",     zone: "kitchen", grid: [0.5, 0], elevation: 0.56 },
  { id: "kitchen-wall-cab-1", type: "ether-wall-cab",  zone: "kitchen", grid: [1.2, 0], w: 80, h: 20, elevation: 0.9 },
  { id: "kitchen-wall-cab-2", type: "ether-wall-cab",  zone: "kitchen", grid: [0, -0.5], w: 80, h: 20, elevation: 0.9 },
  { id: "kitchen-stove",     type: "ether-stove",      zone: "kitchen", grid: [1.5, 0] },
  { id: "kitchen-sink",      type: "ether-sink",       zone: "kitchen", grid: [2, 0] },
  { id: "kitchen-dishwasher", type: "ether-dishwasher", zone: "kitchen", grid: [1.8, 0], w: 40, h: 40 },
  { id: "kitchen-cab-2",     type: "ether-cabinet",    zone: "kitchen", grid: [2.5, 0], w: 40, h: 40 },
  { id: "kitchen-microwave", type: "ether-microwave",  zone: "kitchen", grid: [2.8, 0] },
  { id: "kitchen-fridge",    type: "ether-fridge",     zone: "kitchen", grid: [3.2, 0], w: 40, h: 80 },
  { id: "kitchen-vending",   type: "arcane-vending",   zone: "kitchen", grid: [0, 1.5] },
  { id: "kitchen-table",     type: "cloud-table",      zone: "kitchen", grid: [2, 1.5], r: 50 },
  { id: "kitchen-chair-1",   type: "ethereal-chair",   zone: "kitchen", grid: [2.5, 1.5], facing: 0 },
  { id: "kitchen-chair-2",   type: "ethereal-chair",   zone: "kitchen", grid: [2.5, 2.5], facing: 180 },
  { id: "kitchen-chair-3",   type: "ethereal-chair",   zone: "kitchen", grid: [1.7, 1.8], facing: 90 },
  { id: "kitchen-chair-4",   type: "ethereal-chair",   zone: "kitchen", grid: [3, 1.8], facing: 270 },
  { id: "kitchen-trash",     type: "void-trash",       zone: "kitchen", grid: [3.5, 1.5] },
];

// ── KANBAN WALL: Task management board ────────────────────────────
const KANBAN: LayoutItem[] = [
  { id: "kanban-board", type: "neon-board", zone: "kanban-wall", grid: [0.5, 0], facing: 180 },
];

// ── COMMS: Phone/SMS booths ───────────────────────────────────────
const COMMS: LayoutItem[] = [
  { id: "phone-booth", type: "void-booth",    zone: "comms", grid: [0, 0], facing: 270 },
  { id: "sms-booth",   type: "whisper-booth", zone: "comms", grid: [2, 0], facing: 0 },
];

// ── ENTRANCE: ATM and misc near the door ──────────────────────────
const ENTRANCE: LayoutItem[] = [
  { id: "atm-machine", type: "crystal-atm", zone: "entrance", grid: [0.5, 0], facing: 90 },
  { id: "entrance-plant-1", type: "crystal-plant", zone: "entrance", grid: [0, 0] },
  { id: "entrance-plant-2", type: "crystal-plant", zone: "entrance", grid: [2, 0] },
];

// ── JUKEBOX: Ambient music emitter ────────────────────────────────
const JUKEBOX_ITEM: LayoutItem[] = [
  { id: "jukebox", type: "ether-jukebox", zone: "meeting-hub", grid: [0, 3], facing: 90 },
];

// ── DECORATION: Plants and accents scattered around ───────────────
const DECOR: LayoutItem[] = [
  { id: "plant-lobby-1",  type: "crystal-plant", zone: "entrance",    grid: [-1, 0] },
  { id: "plant-kitchen",  type: "crystal-plant", zone: "kitchen",     grid: [4, 1.5] },
  { id: "plant-lounge-1", type: "crystal-plant", zone: "lounge",      grid: [3, 0] },
  { id: "plant-lounge-2", type: "crystal-plant", zone: "lounge",      grid: [3, 4] },
  { id: "plant-desk-1",   type: "crystal-plant", zone: "worker-desks", grid: [8, 0] },
  { id: "shelf-meeting",  type: "glow-shelf",    zone: "meeting-hub", grid: [5, 0] },
];

// ── EAST WING: Gym & QA Lab (structural walls stay, furniture only) ──
const GYM: LayoutItem[] = [
  { id: "gym-treadmill-1", type: "ether-treadmill",    zone: "gym", grid: [0.3, 0.5] },
  { id: "gym-treadmill-2", type: "ether-treadmill",    zone: "gym", grid: [0.3, 2.2] },
  { id: "gym-bench-1",     type: "ether-weight-bench", zone: "gym", grid: [0.7, 0.5] },
  { id: "gym-bench-2",     type: "ether-weight-bench", zone: "gym", grid: [0.7, 2.4] },
  { id: "gym-dumbbell-1",  type: "ether-dumbbell-rack",zone: "gym", grid: [1.1, 0.8] },
  { id: "gym-dumbbell-2",  type: "ether-dumbbell-rack",zone: "gym", grid: [1.1, 2] },
  { id: "gym-rowing",      type: "ether-rowing",       zone: "gym", grid: [0.3, 3.8] },
  { id: "gym-kettlebell",  type: "ether-kettlebell",   zone: "gym", grid: [1.1, 3.2] },
  { id: "gym-bike-1",      type: "ether-bike",         zone: "gym", grid: [0.4, 5.5] },
  { id: "gym-bike-2",      type: "ether-bike",         zone: "gym", grid: [0.4, 7] },
  { id: "gym-bag-1",       type: "ether-bag",          zone: "gym", grid: [1.3, 5.8] },
  { id: "gym-bag-2",       type: "ether-bag",          zone: "gym", grid: [1.3, 7.2] },
  { id: "gym-yoga-1",      type: "ether-yoga",         zone: "gym", grid: [0.6, 7.5] },
  { id: "gym-yoga-2",      type: "ether-yoga",         zone: "gym", grid: [0.6, 8.5] },
  { id: "gym-plant-1",     type: "crystal-plant",      zone: "gym", grid: [1.5, 0.3] },
  { id: "gym-plant-2",     type: "crystal-plant",      zone: "gym", grid: [1.5, 8.5] },
];

const QA_LAB: LayoutItem[] = [
  { id: "qa-terminal-1",   type: "ether-qa-terminal",  zone: "qa-lab", grid: [0.3, 0.5] },
  { id: "qa-device-1",     type: "ether-device-rack",  zone: "qa-lab", grid: [1, 0.5] },
  { id: "qa-device-2",     type: "ether-device-rack",  zone: "qa-lab", grid: [1, 2] },
  { id: "qa-bench-1",      type: "ether-test-bench",   zone: "qa-lab", grid: [0.3, 3.5] },
  { id: "qa-bench-2",      type: "ether-test-bench",   zone: "qa-lab", grid: [0.3, 5.5] },
  { id: "qa-plant-1",      type: "crystal-plant",      zone: "qa-lab", grid: [1.5, 0.3] },
  { id: "qa-plant-2",      type: "crystal-plant",      zone: "qa-lab", grid: [1.5, 8.5] },
];

const ART_ROOM: LayoutItem[] = [
  { id: "art-easel-1", type: "ether-easel", zone: "art-room", grid: [0.3, 0.5], facing: 90 },
  { id: "art-easel-2", type: "ether-easel", zone: "art-room", grid: [0.3, 1.8], facing: 90 },
  { id: "art-plant-1", type: "crystal-plant", zone: "art-room", grid: [0.5, 0.2] },
  { id: "art-plant-2", type: "crystal-plant", zone: "art-room", grid: [0.5, 2.8] },
];

// ─── MASTER LAYOUT (auto-assembled) ──────────────────────────────
// This is what the engine reads. Don't edit below — edit the sections above.

export const ETHEREAL_LAYOUT: LayoutItem[] = [
  ...MEETING_HUB,
  ...WORKER_DESKS,
  ...DATA_VAULT,
  ...LOUNGE,
  ...KITCHEN,
  ...KANBAN,
  ...COMMS,
  ...ENTRANCE,
  ...JUKEBOX_ITEM,
  ...DECOR,
  ...GYM,
  ...QA_LAB,
  ...ART_ROOM,
];

// ─── STRUCTURAL WALLS (not movable, for reference) ───────────────
// The server room, gym, and QA lab walls are defined in furnitureDefaults.ts
// as structural WALL_THICKNESS items. They aren't part of the zone system
// because they define the room boundaries themselves.
// 
// If you need to adjust wall positions, edit the DEFAULT_SERVER_ROOM_ITEMS,
// DEFAULT_GYM_ITEMS, and DEFAULT_QA_LAB_ITEMS arrays in furnitureDefaults.ts.
