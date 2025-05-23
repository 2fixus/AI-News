
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config(); // To get DATABASE_URL

const dbPath = process.env.DATABASE_URL || './db/newsfeed.sqlite';
const dbDir = path.dirname(dbPath);

// Ensure the db directory exists
const fs = require('fs');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDB();
  }
});

const initializeDB = () => {
  const sql = `
  CREATE TABLE IF NOT EXISTS news_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    link TEXT UNIQUE NOT NULL,
    summary TEXT,
    sourceName TEXT,
    publishedDate TEXT, -- ISO 8601 format
    category TEXT,
    fetchedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    analyzedPoliticalBias TEXT, -- e.g., Republican, Democratic, Neutral, Unknown
    analyzedTruthfulnessScore INTEGER, -- 0-100
    analysisTimestamp TEXT
  );`;
  db.run(sql, (err) => {
    if (err) {
      console.error('Error creating table', err.message);
    } else {
      // console.log('news_articles table initialized or already exists.');
    }
  });
};

// If run directly with 'init' argument, initialize DB (for npm run init-db)
if (require.main === module && process.argv.includes('init')) {
  console.log('Initializing database schema...');
  initializeDB();
  // Close db after a short delay to allow init to complete
  setTimeout(() => db.close(), 500);
}

module.exports = db;
