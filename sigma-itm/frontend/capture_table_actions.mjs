import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, '..', 'docs', 'img');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  await page.type('input[placeholder*="estudiante1"]', 'estudiante1');
  await page.type('input[type="password"]', 'sigma2026');
  await page.click('button[type="submit"]');

  await new Promise(r => setTimeout(r, 3000));

  // Scroll directo a la tabla de documentos
  await page.evaluate(() => window.scrollBy(0, 950));
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(outDir, '24_estudiante_tabla_documentos_acciones.png') });
  console.log('Captura guardada: 24_estudiante_tabla_documentos_acciones.png');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
