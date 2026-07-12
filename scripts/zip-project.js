import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const zip = new JSZip();

function addFilesRecursively(dir, zipFolder) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const dirName = path.basename(fullPath);
      if (
        dirName === 'node_modules' ||
        dirName === 'dist' ||
        dirName === '.git' ||
        dirName === '.next' ||
        dirName === 'public' ||
        dirName === 'scripts'
      ) {
        continue;
      }
      const newZipFolder = zipFolder.folder(file);
      addFilesRecursively(fullPath, newZipFolder);
    } else {
      const fileName = path.basename(fullPath);
      if (
        fileName === '.env' ||
        fileName === 'package-lock.json' ||
        fileName === 'app.zip' ||
        fileName === '.DS_Store'
      ) {
        continue;
      }
      const fileData = fs.readFileSync(fullPath);
      zipFolder.file(file, fileData);
    }
  }
}

// Ensure public directory exists
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

console.log('Generating project zip archive...');
try {
  addFilesRecursively('.', zip);

  zip.generateAsync({ type: 'nodebuffer' }).then((content) => {
    fs.writeFileSync('public/app.zip', content);
    console.log('Project zipped successfully to public/app.zip!');
  }).catch((err) => {
    console.error('Error generating zip:', err);
    process.exit(1);
  });
} catch (e) {
  console.error('Error scanning files:', e);
  process.exit(1);
}
