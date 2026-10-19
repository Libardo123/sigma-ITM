import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, '..', 'docs', 'img');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();

  // Iniciar sesión con credenciales reales de estudiante
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  await page.type('input[placeholder*="estudiante1"]', 'estudiante1');
  await page.type('input[type="password"]', 'sigma2026');
  await page.click('button[type="submit"]');

  await new Promise(r => setTimeout(r, 3000));

  // 1. Capturar Panel del Estudiante con la barra estandarizada morada y lista de documentos
  await page.screenshot({ path: path.join(outDir, '21_panel_estudiante_barra_estandarizada.png') });
  console.log('Captura guardada: 21_panel_estudiante_barra_estandarizada.png');

  // 2. Abrir Modal de Radicar / Anexar Documento
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Radicar / Anexar Documento'));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, '22_estudiante_modal_radicar_documento.png') });
  console.log('Captura guardada: 22_estudiante_modal_radicar_documento.png');

  // 3. Cerrar modal de radicar y abrir modal de Reemplazar
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Cerrar ventana"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Reemplazar'));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, '23_estudiante_modal_reemplazar_documento.png') });
  console.log('Captura guardada: 23_estudiante_modal_reemplazar_documento.png');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
