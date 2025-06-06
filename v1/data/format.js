import fs from 'fs';
import Database from 'better-sqlite3';
import { match } from 'assert';
// Create or open the database file
const db = new Database('db.sqlite');

const stops = fs.readFileSync('metro.txt', 'utf8');
const pospoints = fs.readFileSync('pospoints.txt', 'utf8').split('\n');

// Tables
db.exec(`CREATE TABLE IF NOT EXISTS Stops(id INTEGER, name TEXT, line TEXT, is_terminal INTEGER, branch INTEGER, pos_x INTEGER, pos_y INTEGER)`);
db.exec(`CREATE TABLE IF NOT EXISTS Links(stop1 INTEGER, stop2 INTEGER, time INTEGER)`)


const insertStop = db.prepare('INSERT INTO Stops VALUES (?, ?, ?, ?, ?, ?, ?)');
const insertLink = db.prepare('INSERT INTO Links VALUES (?, ?, ?)');

/* Work of art, no AI */
const stopParser = /V +(\d+) +(.+) +;(\d+(?:bis)?) +;(True|False) +(\d)/gmi;

let parsed;

// To match the correct pospoint, based on stop name and occurence number of the stop (First Bastille from stops matches the first pospoint called Bastille)
let currentName = [null, 0];

while ((parsed = stopParser.exec(stops)) !== null) {
  const id = parseInt(parsed[1]);
  const name = parsed[2];
  if (name === currentName[0]) // Keep track of the occurence number of the stop name
    currentName[1]++;
  else 
    currentName = [name, 0];

  const line = parsed[3];
  const is_terminal = parsed[4] === 'True';
  const branch = parseInt(parsed[5]);
  
  // Helper to normalize names for comparison
  function normalize(str) {
    return str
      .replace(/@/g, ' ')
      .replace(/,/g, '')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  // Find all matching pospoints for the current stop name
  const matchingPospoints = pospoints.filter(raw => {
    const match = /\d+;\d+;(.+)/i.exec(raw);
    if (!match) return false;
    return normalize(match[1]) === normalize(name);
  });
  // Keep the pospoint of relevant index
  const pospoint = matchingPospoints[currentName[1]] || matchingPospoints[0];// If there are less posspoints than stops, fall back to the first pospoint
  const [pos_x, pos_y] = pospoint ? pospoint.split(';') : [null, null, null];
  // Insert the stop into the database
  insertStop.run(id, name, line, is_terminal ? 1 : 0, branch, parseInt(pos_x), parseInt(pos_y));
}

const linkParser = /E (\d+) (\d+) (\d+)/gmi;

while ((parsed = linkParser.exec(stops)) !== null) {
  const stop1 = parseInt(parsed[1]);
  const stop2 = parseInt(parsed[2]);
  const time = parseInt(parsed[3]);
  insertLink.run(stop1, stop2, time);
}