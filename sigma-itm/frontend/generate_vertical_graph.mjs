import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outPaths = [
  path.join(__dirname, '..', 'docs', 'img', 'grafo_flujo_vertical.png'),
  path.join(__dirname, '..', 'img', 'grafo_flujo_vertical.png'),
  path.join(__dirname, '..', '..', 'docs', 'img', 'grafo_flujo_vertical.png'),
  path.join(__dirname, '..', '..', 'img', 'grafo_flujo_vertical.png'),
];

const htmlGrafoVertical = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=JetBrains+Mono:wght@700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    width: 1200px;
    height: 1850px;
    background: #f8fafc;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    color: #0f172a;
    padding: 30px 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /* Header */
  .header {
    background: #011C5B;
    border-radius: 16px;
    padding: 20px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 8px 20px rgba(1, 28, 91, 0.2);
  }

  .header h1 {
    font-size: 22px;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: -0.3px;
  }

  .header p {
    font-size: 13px;
    color: #93c5fd;
    font-weight: 600;
    margin-top: 3px;
  }

  .roles-legend {
    display: flex;
    gap: 8px;
  }

  .leg-item {
    font-size: 11.5px;
    font-weight: 800;
    padding: 5px 10px;
    border-radius: 6px;
    color: #fff;
  }

  /* Contenedor del Grafo Vertical */
  .graph-stream {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 18px 0;
    flex: 1;
    justify-content: space-between;
  }

  /* Etapas en Bloques Horizontales Apilados */
  .stage-card {
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    padding: 18px 24px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.03);
    position: relative;
  }

  .stage-badge {
    position: absolute;
    top: -12px;
    left: 24px;
    font-size: 11.5px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 900;
    padding: 3px 12px;
    border-radius: 6px;
    color: #fff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }

  .stage-flow-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-top: 6px;
  }

  /* Nodos del Grafo */
  .node {
    border-radius: 12px;
    padding: 14px 18px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    flex: 1;
  }

  .node-title {
    font-size: 15px;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .node-desc {
    font-size: 12px;
    opacity: 0.95;
    font-weight: 600;
  }

  /* Rombo de Decisión */
  .diamond {
    background: #0f172a;
    border: 2.5px solid #38bdf8;
    color: #ffffff;
    border-radius: 14px;
    padding: 14px 18px;
    text-align: center;
    min-width: 220px;
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.15);
  }

  .diamond h4 {
    font-size: 14px;
    font-weight: 900;
    color: #38bdf8;
  }

  .diamond p {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 2px;
  }

  /* Flechas Horizontales */
  .arr-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 11px;
    font-weight: 800;
    color: #0284c7;
    gap: 2px;
  }

  .arr-line-h {
    width: 45px;
    height: 3px;
    background: #0284c7;
    position: relative;
    border-radius: 2px;
  }

  .arr-line-h::after {
    content: "";
    position: absolute;
    right: -2px;
    top: -4px;
    border-left: 8px solid #0284c7;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
  }

  /* Flechas Verticales entre Etapas */
  .flow-down-connector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: -6px 0;
  }

  .down-badge {
    background: #011C5B;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    padding: 5px 14px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1.5px solid rgba(255,255,255,0.2);
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  /* Estilos de Roles */
  .c-est { background: #0284c7; border: 2px solid #38bdf8; }
  .c-adm { background: #7e22ce; border: 2px solid #c084fc; }
  .c-ase { background: #15803d; border: 2px solid #4ade80; }
  .c-jur { background: #b45309; border: 2px solid #fbbf24; }
  .c-ret { background: #c2410c; border: 2px dashed #fdba74; }
  .c-rec { background: #991b1b; border: 2px solid #f87171; }
  .c-fin { background: #047857; border: 3px solid #34d399; }

  /* Footer */
  .footer {
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    font-weight: 700;
    color: #475569;
  }
</style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div>
      <h1>GRAFO DE DECISIONES Y FLUJO DE ETAPAS — SIGMA ITM</h1>
      <p>Secuencia Troncal con Compuertas de Decisión y Lazos de Subsanación Transversales</p>
    </div>
    <div class="roles-legend">
      <div class="leg-item c-est">🎓 Estudiante</div>
      <div class="leg-item c-adm">👔 Admin</div>
      <div class="leg-item c-ase">👨‍🏫 Asesor</div>
      <div class="leg-item c-jur">🏛️ Jurados / Comité</div>
    </div>
  </div>

  <!-- STREAM DEL GRAFO -->
  <div class="graph-stream">

    <!-- FASE 1 -->
    <div class="stage-card" style="border-top: 5px solid #0284c7;">
      <span class="stage-badge" style="background: #0284c7;">FASE 1: RADICACIÓN</span>
      <div class="stage-flow-row">
        <div class="node c-est">
          <div class="node-title">🎓 1. Registro Propuesta</div>
          <div class="node-desc">Título, modalidad y línea temática</div>
        </div>

        <div class="arr-right">
          <span>Adjuntos</span>
          <div class="arr-line-h"></div>
        </div>

        <div class="node c-est">
          <div class="node-title">📄 2. Carga 4 Soportes</div>
          <div class="node-desc">Propuesta técnica + Cartas obligatorias</div>
        </div>

        <div class="arr-right">
          <span>Radicación</span>
          <div class="arr-line-h"></div>
        </div>

        <div class="node" style="background: #f0fdf4; color: #166534; border: 2px solid #86efac;">
          <div class="node-title">📥 3. Envío Formal</div>
          <div class="node-desc">Expediente radicado a Coordinación</div>
        </div>
      </div>
    </div>

    <!-- CONECTOR 1 -->
    <div class="flow-down-connector">
      <div class="down-badge">↓ 1. Traspaso a Revisión de Administración</div>
    </div>

    <!-- FASE 2 -->
    <div class="stage-card" style="border-top: 5px solid #7e22ce;">
      <span class="stage-badge" style="background: #7e22ce;">FASE 2: VALIDACIÓN DOCUMENTAL Y ASIGNACIÓN</span>
      <div class="stage-flow-row">
        <div class="node c-adm" style="flex: 0.8;">
          <div class="node-title">👔 4. Revisión Admin</div>
          <div class="node-desc">Auditoría formal de requisitos</div>
        </div>

        <div class="arr-right" style="color: #7e22ce;">
          <span>Evalúa</span>
          <div class="arr-line-h" style="background: #7e22ce;"></div>
        </div>

        <!-- ROMBO DECISION 1 -->
        <div class="diamond">
          <h4>⚖️ ¿Requisitos OK?</h4>
          <p>Formatos y Créditos</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; flex: 1.2;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 11px; font-weight: 800; color: #ea580c; width: 80px;">NO VÁLIDO ➔</span>
            <div class="node c-ret" style="padding: 8px 12px;">
              <div class="node-title" style="font-size: 13px;">⚠️ Devolver a Fase 1</div>
              <div class="node-desc" style="font-size: 11px;">Estudiante subsana causales</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 11px; font-weight: 800; color: #16a34a; width: 80px;">APROBADO ➔</span>
            <div class="node c-adm" style="padding: 8px 12px;">
              <div class="node-title" style="font-size: 13px;">👨‍🏫 5. Asignar Asesor</div>
              <div class="node-desc" style="font-size: 11px;">Vinculación y directriz institucional</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CONECTOR 2 -->
    <div class="flow-down-connector">
      <div class="down-badge" style="background: #15803d;">↓ 2. Transferencia Exclusiva a Docente Asesor</div>
    </div>

    <!-- FASE 3 -->
    <div class="stage-card" style="border-top: 5px solid #16a34a;">
      <span class="stage-badge" style="background: #16a34a;">FASE 3: EJECUCIÓN ACADÉMICA Y TUTORÍAS</span>
      <div class="stage-flow-row">
        <div class="node c-est" style="flex: 0.9;">
          <div class="node-title">📁 6. Carga de Avances</div>
          <div class="node-desc">Informes entregados al Asesor</div>
        </div>

        <div class="arr-right" style="color: #16a34a;">
          <span>Revisa</span>
          <div class="arr-line-h" style="background: #16a34a;"></div>
        </div>

        <!-- BUCLE DE TUTORIA -->
        <div class="node c-ret" style="flex: 1.2; background: #fff7ed; color: #9a3412; border: 2px dashed #f97316;">
          <div class="node-title" style="font-size: 14px; color: #c2410c;">🔄 Ciclo de Observaciones</div>
          <div class="node-desc" style="color: #ea580c; font-size: 11.5px;">
            Asesor pide ajustes ➔ Congela trámite ➔ Estudiante subsana y retorna directo al Asesor.
          </div>
        </div>

        <div class="arr-right" style="color: #16a34a;">
          <span>Aval Final</span>
          <div class="arr-line-h" style="background: #16a34a;"></div>
        </div>

        <div class="node c-ase" style="flex: 0.9;">
          <div class="node-title">✓ 7. Proyecto Listo</div>
          <div class="node-desc">Visto bueno para sustentación</div>
        </div>
      </div>
    </div>

    <!-- CONECTOR 3 -->
    <div class="flow-down-connector">
      <div class="down-badge" style="background: #b45309;">↓ 3. Solicitud de Jurados y Citación a Sustentación</div>
    </div>

    <!-- FASE 4 -->
    <div class="stage-card" style="border-top: 5px solid #d97706;">
      <span class="stage-badge" style="background: #d97706;">FASE 4: EVALUACIÓN Y SUSTENTACIÓN</span>
      <div class="stage-flow-row">
        <div class="node c-ase" style="flex: 0.8;">
          <div class="node-title">📅 8. Citación Oficial</div>
          <div class="node-desc">Fecha, aula y rúbrica asignada</div>
        </div>

        <div class="arr-right" style="color: #b45309;">
          <span>Defensa</span>
          <div class="arr-line-h" style="background: #b45309;"></div>
        </div>

        <!-- ROMBO DECISION SUSTENTACION -->
        <div class="diamond" style="border-color: #fbbf24;">
          <h4 style="color: #fbbf24;">⚖️ Veredicto Jurados</h4>
          <p>Deliberación y Rúbrica</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; flex: 1.3;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; font-weight: 800; color: #16a34a; width: 90px;">APROBADA ➔</span>
            <div class="node c-fin" style="padding: 6px 10px; font-size: 12px;">
              <span style="font-weight: 900;">📝 9. Acta Aprobada</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; font-weight: 800; color: #ea580c; width: 90px;">OBSERVADA ➔</span>
            <div class="node c-ret" style="padding: 6px 10px; font-size: 12px;">
              <span style="font-weight: 900;">🛠️ Ajustes (Máx 15 Días)</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; font-weight: 800; color: #dc2626; width: 90px;">REPROBADA ➔</span>
            <div class="node c-rec" style="padding: 6px 10px; font-size: 12px;">
              <span style="font-weight: 900;">❌ Fallo No Aprobatorio</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CONECTOR 4 -->
    <div class="flow-down-connector">
      <div class="down-badge" style="background: #047857;">↓ 4. Remisión de Expediente y Acta Firmada a Comité</div>
    </div>

    <!-- FASE 5 -->
    <div class="stage-card" style="border-top: 5px solid #059669;">
      <span class="stage-badge" style="background: #059669;">FASE 5: CIERRE INSTITUCIONAL Y GRADO</span>
      <div class="stage-flow-row">
        <div class="node c-jur" style="flex: 0.9;">
          <div class="node-title">🏛️ 10. Radicación Comité</div>
          <div class="node-desc">Recepción de acta y expediente</div>
        </div>

        <div class="arr-right" style="color: #059669;">
          <span>Ratifica</span>
          <div class="arr-line-h" style="background: #059669;"></div>
        </div>

        <div class="node c-jur" style="flex: 0.9;">
          <div class="node-title">📜 11. Aval Institucional</div>
          <div class="node-desc">Revisión antiplagio y biblioteca</div>
        </div>

        <div class="arr-right" style="color: #059669;">
          <span>Certifica</span>
          <div class="arr-line-h" style="background: #059669;"></div>
        </div>

        <div class="node c-fin" style="flex: 1.2; box-shadow: 0 6px 18px rgba(5, 150, 105, 0.3);">
          <div class="node-title" style="font-size: 16px;">🎓 12. Paz y Salvo Oficial</div>
          <div class="node-desc">Certificado PDF con Código QR · Estado FINALIZADO</div>
        </div>
      </div>
    </div>

  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div><strong>Regla Institucional:</strong> Flujo auditado y secuencial — Ninguna etapa puede omitirse o cerrarse sin acta y aval registrado.</div>
    <div>SIGMA ITM · 2026</div>
  </div>

</body>
</html>
`;

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 1200, height: 1850, deviceScaleFactor: 1 }
  });

  const page = await browser.newPage();
  await page.setContent(htmlGrafoVertical, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));

  for (const p of outPaths) {
    await page.screenshot({ path: p, type: 'png' });
    console.log('Grafo vertical guardado en:', p);
  }

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
