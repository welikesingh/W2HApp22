const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const distDir = path.join(root, 'dist');

function copyDir(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

fs.rmSync(distDir, { recursive: true, force: true });
copyDir(publicDir, distDir);

const apiBaseUrl = process.env.HSA_API_BASE_URL || '';
fs.writeFileSync(
  path.join(distDir, 'runtime-config.js'),
  `window.HSA_API_BASE_URL = ${JSON.stringify(apiBaseUrl)};\n`
);

console.log(`Built frontend into ${distDir}`);
