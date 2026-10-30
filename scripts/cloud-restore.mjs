#!/usr/bin/env node
/**
 * ORVEXI Workspace Restore Tool
 * 
 * Restores a codebase .zip archive from the backups directory or a custom path.
 * 
 * Usage:
 *   node scripts/cloud-restore.mjs [path-to-archive.zip]
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const BACKUP_DIR = path.join(ROOT_DIR, 'backups');

let archivePath = process.argv[2];

if (!archivePath) {
  if (fs.existsSync(BACKUP_DIR)) {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.zip'))
      .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 0) {
      archivePath = path.join(BACKUP_DIR, files[0].name);
    }
  }
}

if (!archivePath || !fs.existsSync(archivePath)) {
  console.error('No backup archive found to restore.');
  console.log('Usage: node scripts/cloud-restore.mjs [path-to-backup.zip]');
  process.exit(1);
}

console.log('====================================================');
console.log('  ORVEXI Workspace Restore Tool');
console.log('====================================================');
console.log(`Extracting: ${archivePath}`);

try {
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    const psCmd = `powershell.exe -NoProfile -Command "$ProgressPreference = 'SilentlyContinue'; Expand-Archive -Path '${archivePath}' -DestinationPath '${ROOT_DIR}' -Force"`;
    execSync(psCmd, { stdio: 'inherit', cwd: ROOT_DIR });
  } else {
    execSync(`unzip -o "${archivePath}" -d "${ROOT_DIR}"`, { stdio: 'inherit', cwd: ROOT_DIR });
  }

  console.log('Codebase restored successfully!');
  console.log('Run "npm install" if dependencies need to be re-installed.');
  console.log('====================================================');
} catch (err) {
  console.error('Restore failed:', err.message);
  process.exit(1);
}
