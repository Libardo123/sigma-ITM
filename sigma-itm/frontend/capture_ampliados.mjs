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
    defaultViewport: { width: 1440, height: 950 }
  });
  const page = await browser.newPage();

  // 1. Iniciar sesión como Evaluador (asesor1 o comite1 o admin1) para abrir el modal "Pedir Corrección / Devolver al Alumno"
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  await page.type('input[placeholder*="estudiante1"]', 'asesor1');
  await page.type('input[type="password"]', 'sigma2026');
  await page.click('button[type="submit"]');

  await new Promise(r => setTimeout(r, 3000));

  // Abrir modal de devolución / corrección si hay botón disponible
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && (b.textContent.includes('Pedir Corrección') || b.textContent.includes('Devolver') || b.textContent.includes('Corrección')));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, '25_modal_correccion_campo_amplio.png') });
  console.log('Captura guardada: 25_modal_correccion_campo_amplio.png');

  // 2. Iniciar sesión como estudiante para capturar los modales de estudiante ampliados
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  await page.type('input[placeholder*="estudiante1"]', 'estudiante1');
  await page.type('input[type="password"]', 'sigma2026');
  await page.click('button[type="submit"]');

  await new Promise(r => setTimeout(r, 3000));

  // Abrir modal de radicar documento ampliado
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Radicar / Anexar Documento'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, '26_estudiante_modal_radicar_ampliado.png') });
  console.log('Captura guardada: 26_estudiante_modal_radicar_ampliado.png');

  // Cerrar modal de radicar y abrir modal de Reemplazar con descripción
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
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, '27_estudiante_modal_reemplazar_con_descripcion.png') });
  console.log('Captura guardada: 27_estudiante_modal_reemplazar_con_descripcion.png');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
