import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, '..', 'docs', 'img');

async function loginAs(page, buttonNamePart) {
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate((name) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes(name));
    if (btn) btn.click();
  }, buttonNamePart);

  await new Promise(r => setTimeout(r, 2500));
}

async function captureInteractive() {
  console.log('Iniciando captura de modales interactivos y estados operativos...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  // 1. Estudiante - Modal / Formulario de Radicación de Proyecto
  console.log('1. Capturando Formulario de Radicación de Proyecto (Estudiante)...');
  await loginAs(page, 'Jorge Bernal');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && (b.textContent.includes('POSTULAR') || b.textContent.includes('Postular')));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const tituloInput = document.querySelector('#titulo-input');
    if (tituloInput) {
      tituloInput.value = 'Diseño e Implementación del Sistema Integral de Grados SIGMA ITM';
      tituloInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const descInput = document.querySelector('#descripcion-input');
    if (descInput) {
      descInput.value = 'Desarrollo de una solución web para la sistematización y seguimiento en tiempo real de las 10 modalidades de grado de la Facultad de Ingenierías del ITM.';
      descInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, '16_estudiante_modal_radicacion.png') });

  // 2. Estudiante - Alerta de Corrección Pendiente
  console.log('2. Capturando Alerta de Corrección Pendiente (Estudiante)...');
  await page.goto('http://localhost:5174/app', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => window.scrollBy(0, 400));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, '17_estudiante_alerta_correccion.png') });

  // 3. Estudiante - Modal de Subsanación
  console.log('3. Capturando Modal de Subsanación de Correcciones...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Subsanar'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = 'Se anexa la carta de aceptación de la empresa con fecha vigente y firma original del representante legal, cumpliendo con la observación emitida por el evaluador.';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, '18_estudiante_modal_subsanacion.png') });

  // 4. Comité - Modal Pedir Corrección
  console.log('4. Capturando Modal Pedir Corrección (Comité)...');
  await loginAs(page, 'Comité Principal');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Pedir Corrección'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = 'El anteproyecto presentado requiere profundizar en el marco metodológico y adjuntar el cronograma en el formato institucional aprobado por el Consejo de Facultad.';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, '19_comite_modal_solicitar_correccion.png') });

  // 5. Admin - Modal Enviar a Asesor (Asignación)
  console.log('5. Capturando Modal Enviar a Asesor (Admin)...');
  await loginAs(page, 'Admin General');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Enviar a Asesor'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = 'El estudiante debe enfocar el desarrollo del proyecto bajo la norma técnica institucional NTC-4144 y presentar reportes de avance cada 15 días al asesor asignado.';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, '20_admin_modal_enviar_asesor.png') });

  // 6. Asesor - Modal Notificar Sustentación
  console.log('6. Capturando Modal Notificar Sustentación (Asesor)...');
  await loginAs(page, 'Miguel Ojeda');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Notificar Sustentación'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = 'Defensa pública programada para el viernes 20 de noviembre a las 10:00 AM.\nLugar: Campus Robledo - Bloque E, Aula 302.\nJurados designados: Ing. Diana Cuervo e Ing. Andrés Bedoya.';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, '21_asesor_modal_programar_sustentacion.png') });

  // 7. Certificado Oficial PDF
  console.log('7. Capturando Certificado Oficial PDF en navegador...');
  const pdfFullPath = path.resolve(outDir, 'certificado_oficial_itm.pdf');
  const fileUrl = 'file:///' + pdfFullPath.replace(/\\/g, '/');
  console.log('Navegando a:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outDir, '22_certificado_oficial_pdf.png') });

  await browser.close();
  console.log('¡TODAS LAS CAPTURAS INTERACTIVAS Y MODALES COMPLETADAS!');
}

captureInteractive().catch(err => {
  console.error('Error durante la captura interactiva:', err);
  process.exit(1);
});
