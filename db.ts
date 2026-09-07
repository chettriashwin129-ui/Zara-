import Database from 'better-sqlite3';
import fs from 'fs';

let db: ReturnType<typeof Database>;

function deleteDbFiles(dbPath: string) {
  const filesToDelete = [dbPath, `${dbPath}-wal`, `${dbPath}-shm`, `${dbPath}-journal`];
  for (const f of filesToDelete) {
    if (fs.existsSync(f)) {
      try {
        fs.unlinkSync(f);
      } catch (err) {
        console.warn(`Could not remove db file ${f}:`, err);
      }
    }
  }
}

export async function initDb() {
  const dbPath = './zara_memory.sqlite';

  const createAndInit = () => {
    try {
      if (db) {
        try { db.close(); } catch (_) {}
      }
      db = new Database(dbPath, { timeout: 5000 });
      db.pragma('journal_mode = WAL');
      // Test integrity
      const check = db.pragma('integrity_check') as Array<{ integrity_check: string }>;
      if (!check || check.length === 0 || check[0].integrity_check !== 'ok') {
        throw new Error('SQLite database disk image is malformed');
      }
    } catch (e) {
      console.log("Auto-recovering database from malformed state...");
      try { if (db) db.close(); } catch (_) {}
      deleteDbFiles(dbPath);
      db = new Database(dbPath, { timeout: 5000 });
      db.pragma('journal_mode = WAL');
    }
  };

  createAndInit();

  const runSchema = () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        content TEXT NOT NULL,
        importance INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        action_request TEXT,
        action_result TEXT,
        FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS planner_tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        due_date TEXT,
        priority TEXT DEFAULT 'medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT 0,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS learn_topics (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        notes TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS automations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        trigger TEXT NOT NULL,
        condition TEXT DEFAULT '',
        action TEXT NOT NULL,
        enabled BOOLEAN DEFAULT 1,
        lastRun DATETIME,
        nextRun DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS automation_logs (
        id TEXT PRIMARY KEY,
        automation_id TEXT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS autopilot_suggestions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        reason TEXT NOT NULL,
        action TEXT NOT NULL,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  };

  try {
    runSchema();
  } catch (err: any) {
    console.log("Auto-recovering database schema...");
    try { if (db) db.close(); } catch (_) {}
    deleteDbFiles(dbPath);
    createAndInit();
    runSchema();
  }

  // Seed sample automation and suggestion if empty
  try {
    const hasAutomations = db.prepare('SELECT COUNT(*) as count FROM automations').get() as { count: number };
    if (hasAutomations.count === 0) {
      db.prepare(`
        INSERT INTO automations (id, name, trigger, condition, action) 
        VALUES (?, ?, ?, ?, ?)
      `).run(Date.now().toString(), "Morning Priorities", "daily", "At 8:00 AM", "Show priority tasks for the day");
    }

    const hasSuggestions = db.prepare('SELECT COUNT(*) as count FROM autopilot_suggestions').get() as { count: number };
    if (hasSuggestions.count === 0) {
      db.prepare(`
        INSERT INTO autopilot_suggestions (id, type, title, reason, action, priority) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(Date.now().toString(), "task", "Continue Zara memory system", "This is an unfinished task in your active project.", "open_project", "high");
    }
  } catch (seedErr) {
    console.warn("Could not seed initial rows:", seedErr);
  }
}

export async function addMemory(category: string, content: string, importance: number = 1) {
  if (!db) await initDb();
  const stmt = db.prepare('INSERT INTO memories (category, content, importance) VALUES (?, ?, ?)');
  stmt.run(category, content, importance);
}

export async function getAllMemories() {
  if (!db) await initDb();
  const stmt = db.prepare('SELECT * FROM memories ORDER BY importance DESC, created_at DESC LIMIT 50');
  return stmt.all();
}

export async function searchMemories(query: string) {
  if (!db) await initDb();
  const stmt = db.prepare('SELECT * FROM memories WHERE content LIKE ? ORDER BY importance DESC LIMIT 20');
  return stmt.all(`%${query}%`);
}

export function runQuery(sql: string, params: any[] = []) {
  if (!db) throw new Error("DB not initialized");
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

export function execQuery(sql: string, params: any[] = []) {
  if (!db) throw new Error("DB not initialized");
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}
