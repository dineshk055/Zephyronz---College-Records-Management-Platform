import { pdfToPng } from 'pdf-to-png-converter';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
const pdfPath = path.join(__dirname, 'uploads', 'dummy.pdf');

// Ensure uploads dir exists
if (!fs.existsSync(path.dirname(pdfPath))) {
  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
}

console.log('Downloading test PDF...');
const file = fs.createWriteStream(pdfPath);
https.get(pdfUrl, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close(async () => {
      console.log('Download complete. Converting...');
      try {
        const pngPages = await pdfToPng(pdfPath, {
          viewportScale: 2.0,
          outputFolder: path.dirname(pdfPath),
          outputFileMask: 'dummy-page',
        });
        console.log('Conversion successful! Converted pages:', pngPages.map(p => p.name));
        
        // Clean up
        fs.unlinkSync(pdfPath);
        pngPages.forEach(p => {
          if (fs.existsSync(p.path)) {
            fs.unlinkSync(p.path);
          }
        });
        console.log('Clean up done.');
      } catch (err) {
        console.error('Conversion failed:', err);
      }
    });
  });
}).on('error', (err) => {
  console.error('Download failed:', err);
});
