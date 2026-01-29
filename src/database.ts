import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

export interface HistoryRecord {
    id: number;
    originalPath: string;
    originalName: string;
    originalData: string | null;
    processedData: string;
    timestamp: number;
}

let db: Database.Database | null = null;

export function initDatabase() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'history.db');

    console.log('📂 Database path:', dbPath);

    db = new Database(dbPath);

    // Create table if not exists
    db.exec(`
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            originalPath TEXT NOT NULL,
            originalName TEXT NOT NULL,
            originalData TEXT,
            processedData TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        )
    `);

    // Create index on timestamp for faster queries
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_timestamp ON history(timestamp DESC)
    `);

    console.log('✅ Database initialized');

    return db;
}

export function getDatabase(): Database.Database {
    if (!db) {
        console.warn('⚠️ Database not initialized, initializing now...');
        initDatabase();
    }
    return db!;
}

export function closeDatabase() {
    if (db) {
        db.close();
        db = null;
        console.log('✅ Database closed');
    }
}

// Database operations
export function addHistoryRecord(record: Omit<HistoryRecord, 'id'>): number {
    const db = getDatabase();
    const stmt = db.prepare(`
        INSERT INTO history (originalPath, originalName, originalData, processedData, timestamp)
        VALUES (?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
        record.originalPath,
        record.originalName,
        record.originalData,
        record.processedData,
        record.timestamp
    );

    return info.lastInsertRowid as number;
}

export function getHistoryRecords(limit = 50, offset = 0): HistoryRecord[] {
    const db = getDatabase();
    const stmt = db.prepare(`
        SELECT id, originalPath, originalName, originalData, processedData, timestamp
        FROM history
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
    `);

    return stmt.all(limit, offset) as HistoryRecord[];
}

export function getHistoryRecordById(id: number): HistoryRecord | null {
    const db = getDatabase();
    const stmt = db.prepare(`
        SELECT id, originalPath, originalName, originalData, processedData, timestamp
        FROM history
        WHERE id = ?
    `);

    return stmt.get(id) as HistoryRecord | null;
}

export function deleteHistoryRecord(id: number): boolean {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM history WHERE id = ?');
    const info = stmt.run(id);

    return info.changes > 0;
}

export function clearAllHistory(): number {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM history');
    const info = stmt.run();

    // Reset auto-increment counter
    db.exec("DELETE FROM sqlite_sequence WHERE name='history'");

    return info.changes;
}

export function getHistoryCount(): number {
    const db = getDatabase();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM history');
    const result = stmt.get() as { count: number };

    return result.count;
}

export function searchHistory(query: string, limit = 50): HistoryRecord[] {
    const db = getDatabase();
    const stmt = db.prepare(`
        SELECT id, originalPath, originalName, originalData, processedData, timestamp
        FROM history
        WHERE originalName LIKE ? OR originalPath LIKE ?
        ORDER BY timestamp DESC
        LIMIT ?
    `);

    const searchPattern = `%${query}%`;
    return stmt.all(searchPattern, searchPattern, limit) as HistoryRecord[];
}
