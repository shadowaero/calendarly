#!/usr/bin/env node
// Unpacks the FD wave-weather payload inside the container.
// Input: /tmp/fdw-files.txt (pack minus line 1). Lines: ###FDWFILE:<path> then one base64 line.
const fs = require('fs');
const path = require('path');
const body = fs.readFileSync(process.env.FDW_FILES_PATH || '/tmp/fdw-files.txt', 'utf8').replace(/\r/g, '');
const lines = body.split('\n');
let i = 0, files = 0;
while (i < lines.length) {
  const L = lines[i];
  if (L.startsWith('###FDWFILE:')) {
    const p = L.slice(11);
    const b64 = (lines[i + 1] || '').trim();
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, Buffer.from(b64, 'base64'));
    files++;
    i += 2;
  } else i++;
}
console.log('FDW_UNPACK_OK files=' + files);