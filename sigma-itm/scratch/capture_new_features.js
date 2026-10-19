const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();
  
  // 1. Ir a login
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  
  // 2. Iniciar sesión como estudiante
  await page.type('#username', 'estudiante1');
  await page.type('#password', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));
  
  const outDir = path.join(__dirname, '..', 'docs', 'img');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // 3. Capturar panel del estudiante con barra estandarizada y botones
  await page.screenshot({ path: path.join(outDir, 'panel_estudiante_barra_estandarizada.png') });
  console.log('Captura 1 guardada: panel_estudiante_barra_estandarizada.png');

  // 4. Abrir el modal de radicar documento
  const btnRadicar = await page.$('button ::-p-text(Radicar / Anexar Documento)');
  if (btnRadicar) {
    await btnRadicar.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outDir, 'panel_estudiante_modal_radicar.png') });
    console.log('Captura 2 guardada: panel_estudiante_modal_radicar.png');
  } else {
    console.log('No se encontró el botón de radicar por texto directo, buscando por selector...');
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
