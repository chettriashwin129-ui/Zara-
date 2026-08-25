import Database from 'better-sqlite3';
const db = new Database('./zara_memory.sqlite');
try {
  db.exec('ALTER TABLE messages ADD COLUMN action_request TEXT;');
  db.exec('ALTER TABLE messages ADD COLUMN action_result TEXT;');
} catch (e) {
  console.log(e);
}
