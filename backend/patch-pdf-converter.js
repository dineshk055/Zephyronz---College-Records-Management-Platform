import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFile = path.join(__dirname, 'node_modules', 'pdf-to-png-converter', 'out', 'normalizePath.js');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  
  // The original block to replace
  const originalCode = `    const resolvedPath = (0, node_path_1.normalize)((0, node_path_1.resolve)(path));
    if (resolvedPath.endsWith('/') || resolvedPath.endsWith(node_path_1.sep)) {
        return resolvedPath;
    }
    return \`\${resolvedPath}\${node_path_1.sep}\`;`;
    
  // The Windows-compatible forward-slash patched block
  const patchedCode = `    const resolvedPath = (0, node_path_1.normalize)((0, node_path_1.resolve)(path));
    const normalized = resolvedPath.replace(/\\\\/g, '/');
    if (normalized.endsWith('/')) {
        return normalized;
    }
    return \`\${normalized}/\`;`;

  if (content.includes(originalCode)) {
    content = content.replace(originalCode, patchedCode);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Successfully patched pdf-to-png-converter for Windows path compatibility.');
  } else {
    // If it's already patched, don't do anything
    if (content.includes('resolvedPath.replace(/\\\\/g, \'/\')')) {
      console.log('pdf-to-png-converter normalizePath.js is already patched.');
    } else {
      console.log('pdf-to-png-converter normalizePath.js format has changed. Could not patch.');
    }
  }
} else {
  console.log('pdf-to-png-converter normalizePath.js not found.');
}
