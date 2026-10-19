import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, '..', 'docs', 'img');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

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

async function captureAll() {
  console.log('Iniciando captura integral de pantallas SIGMA ITM con CORS activo...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  // 1. Landing Inicio
  console.log('1. Capturando Landing Inicio...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '01_landing_inicio.png') });

  // 2. Landing Modalidades
  console.log('2. Capturando Landing Modalidades...');
  await page.evaluate(() => window.scrollBy(0, 700));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '02_landing_modalidades.png') });

  // 3. Login
  console.log('3. Capturando Login Principal...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '03_login_principal.png') });

  // 4. Registro de Usuario
  console.log('4. Capturando Registro de Usuario...');
  await page.goto('http://localhost:5174/registro', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '04_registro_usuario.png') });

  // 5-8: Estudiante
  console.log('5. Autenticando Estudiante (Jorge Bernal)...');
  await loginAs(page, 'Jorge Bernal');
  await page.screenshot({ path: path.join(outDir, '05_estudiante_panel_general.png') });

  console.log('6. Capturando Seguimiento de Trámite Estudiante...');
  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, '06_estudiante_seguimiento_tramite.png') });

  console.log('7. Capturando Carga de Documentos...');
  await page.evaluate(() => window.scrollBy(0, 600));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, '07_estudiante_carga_documentos.png') });

  console.log('8. Capturando Historial Estudiante...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, '08_estudiante_historial_procesos.png') });

  // 9-11: Comité Curricular
  console.log('9. Autenticando Comité Curricular...');
  await loginAs(page, 'Comité Principal');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, '09_comite_bandeja_gestion.png') });

  console.log('10. Capturando Expediente Detallado Comité...');
  await page.evaluate(() => window.scrollBy(0, 450));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, '10_comite_expediente_expandido.png') });

  console.log('11. Capturando Pestaña Historial y Trazabilidad Comité...');
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const buttons = Array.from(document.querySelectorAll('button'));
    const histBtn = buttons.find(b => b.textContent && b.textContent.includes('Historial'));
    if (histBtn) histBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, '11_comite_trazabilidad_historial.png') });

  // 12: Asesor
  console.log('12. Autenticando Docente Asesor...');
  await loginAs(page, 'Miguel Ojeda');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, '12_asesor_panel_proyectos.png') });

  // 13-15: Administrador
  console.log('13. Autenticando Administrador...');
  await loginAs(page, 'Admin General');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, '13_admin_panel_aprobaciones.png') });

  console.log('14. Capturando Dashboard Analítico...');
  await page.goto('http://localhost:5174/app/dashboard', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outDir, '14_admin_dashboard_analitica.png') });

  console.log('15. Capturando Gráfico Distribución Dashboard...');
  await page.evaluate(() => window.scrollBy(0, 450));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '15_admin_dashboard_distribucion.png') });

  await browser.close();
  console.log('¡TODAS LAS 15 CAPTURAS HAN SIDO COMPLETADAS CON ÉXITO!');
}

captureAll().catch(err => {
  console.error('Error durante la captura:', err);
  process.exit(1);
});
