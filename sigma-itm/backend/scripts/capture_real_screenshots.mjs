import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:5173";
const OUT_DIR = "c:\\Users\\liba-\\OneDrive\\Escritorio\\1.0ITM_2026-2\\Proyecto jorge\\sigma-itm-skeleton\\sigma-itm\\docs\\img";

async function run() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log("Iniciando navegador Chrome headless...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1366, height: 850 },
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();

  // 1. Landing Page
  console.log("Capturando Landing Page...");
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0", timeout: 15000 });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, "screenshot_landing.png") });
  console.log("✓ screenshot_landing.png guardada");

  // 2. Login Page
  console.log("Capturando Login Page...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0", timeout: 15000 });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, "screenshot_login.png") });
  console.log("✓ screenshot_login.png guardada");

  // 3. Iniciar sesión como estudiante
  console.log("Iniciando sesión como estudiante1...");
  await page.type('input[placeholder*="estudiante1"]', "estudiante1");
  await page.type('input[type="password"]', "sigma2026");
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 2000));

  // Capturar Panel Estudiante
  console.log("Capturando Panel del Estudiante...");
  await page.screenshot({ path: path.join(OUT_DIR, "screenshot_panel_estudiante.png") });
  console.log("✓ screenshot_panel_estudiante.png guardada");

  // 4. Panel de Aprobación (iniciar sesión como comite1)
  console.log("Iniciando sesión como comite1...");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0", timeout: 15000 });
  await page.type('input[placeholder*="estudiante1"]', "comite1");
  await page.type('input[type="password"]', "sigma2026");
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 2000));

  // Capturar Panel Aprobación
  console.log("Capturando Panel de Aprobación...");
  await page.screenshot({ path: path.join(OUT_DIR, "screenshot_panel_aprobacion.png") });
  console.log("✓ screenshot_panel_aprobacion.png guardada");

  // 5. Dashboard Analítico
  console.log("Capturando Dashboard...");
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle0", timeout: 15000 });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, "screenshot_dashboard.png") });
  console.log("✓ screenshot_dashboard.png guardada");

  await browser.close();
  console.log("Todas las capturas reales fueron tomadas exitosamente.");
}

run().catch((err) => {
  console.error("Error al capturar pantallas:", err);
  process.exit(1);
});
