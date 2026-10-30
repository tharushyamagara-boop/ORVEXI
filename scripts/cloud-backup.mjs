#!/usr/bin/env node
/**
 * ORVEXI Local Workspace Backup & Cloud Sync Tool
 * 
 * Packages the current codebase cleanly into a compressed .zip archive,
 * automatically excluding bloated and temporary folders:
 * - node_modules/
 * - dist/
 * - .git/
 * - .gemini/
 * - *.log
 * 
 * Usage:
 *   npm run backup:local   -> Creates clean timestamped zip in ./backups/
 *   npm run backup:cloud   -> Creates clean zip and prepares it for Cloud Vault sync
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const BACKUP_DIR = path.join(ROOT_DIR, 'backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const zipFileName = `orvexi-corporate-backup-${timestamp}.zip`;
const zipFilePath = path.join(BACKUP_DIR, zipFileName);

console.log('====================================================');
console.log('  ORVEXI Cloud Source Code Vault - Workspace Packager');
console.log('====================================================');
console.log(`[1/3] Scanning project directory: ${ROOT_DIR}`);

// Files and folders to include
const INCLUDED_ENTRIES = [
  'index.html',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'src',
  'public',
  'scripts',
  'README.md',
  '.github'
].filter(entry => fs.existsSync(path.join(ROOT_DIR, entry)));

console.log(`[2/3] Compressing clean source code (excluding node_modules, dist, .git)...`);

try {
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    // Use PowerShell Compress-Archive on Windows with SilentlyContinue to prevent console buffer errors
    const itemsArg = INCLUDED_ENTRIES.map(e => `'${e}'`).join(', ');
    const psCmd = `powershell.exe -NoProfile -Command "$ProgressPreference = 'SilentlyContinue'; Compress-Archive -Path ${itemsArg} -DestinationPath '${zipFilePath}' -Force"`;
    execSync(psCmd, { stdio: 'inherit', cwd: ROOT_DIR });
  } else {
    // Use zip on Unix / macOS
    const itemsArg = INCLUDED_ENTRIES.join(' ');
    execSync(`zip -r "${zipFilePath}" ${itemsArg}`, { stdio: 'inherit', cwd: ROOT_DIR });
  }

  const stats = fs.statSync(zipFilePath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`[3/3] Success! Backup package created:`);
  console.log(`      File: ${zipFilePath}`);
  console.log(`      Size: ${sizeMb} MB`);
  console.log('');
  console.log('  HOW TO STORE IN GOOGLE CLOUD:');
  console.log('  1. Open your browser to: http://localhost:5173/#admin');
  console.log('  2. Click the "Cloud Code Vault" tab.');
  console.log('  3. Drag and drop this .zip file into the upload area.');
  console.log('  4. Your codebase will be securely archived in Google Cloud Storage');
  console.log('     and accessible from any device worldwide!');
  console.log('====================================================');
} catch (err) {
  console.error('Error creating backup archive:', err.message);
  process.exit(1);
}
