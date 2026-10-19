import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outImg1 = path.join(__dirname, '..', 'docs', 'img', 'flujo_proceso_sigma_itm.png');
const outImg2 = path.join(__dirname, '..', 'docs', 'img', 'grafo_decisiones_sigma_itm.png');

// HTML 1: Infografía Institucional en TEMA CLARO con letras GRANDES y alta legibilidad
const htmlDiagrama1 = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=JetBrains+Mono:wght@600;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    width: 2200px;
    height: 1350px;
    background: #f8fafc;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    color: #0f172a;
    padding: 35px 45px;
    overflow: hidden;
  }

  /* Header Superior Institucional */
  .header {
    background: #011C5B;
    border-radius: 20px;
    padding: 22px 35px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 10px 25px -5px rgba(1, 28, 91, 0.25);
    margin-bottom: 25px;
  }

  .brand-group {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .logo-box {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.1);
    padding: 8px 18px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .logo-box span.title {
    font-size: 26px;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: -0.5px;
  }

  .logo-box span.itm-badge {
    background: linear-gradient(135deg, #661081, #4f46e5, #0ea5e9);
    color: #ffffff;
    font-size: 15px;
    font-weight: 900;
    padding: 4px 10px;
    border-radius: 6px;
  }

  .header-titles h1 {
    font-size: 25px;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: -0.5px;
  }

  .header-titles p {
    font-size: 14px;
    color: #93c5fd;
    font-weight: 600;
    margin-top: 3px;
  }

  /* Roles Legend */
  .roles-legend {
    display: flex;
    gap: 10px;
    background: rgba(255, 255, 255, 0.08);
    padding: 8px 14px;
    border-radius: 12px;
  }

  .legend-item {
    font-size: 12.5px;
    font-weight: 800;
    padding: 6px 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .leg-est { background: #e0f2fe; color: #0369a1; border: 1.5px solid #38bdf8; }
  .leg-adm { background: #f3e8ff; color: #6b21a8; border: 1.5px solid #c084fc; }
  .leg-ase { background: #dcfce7; color: #15803d; border: 1.5px solid #4ade80; }
  .leg-jur { background: #fef3c7; color: #b45309; border: 1.5px solid #fbbf24; }
  .leg-dev { background: #ffedd5; color: #c2410c; border: 1.5px dashed #fb923c; }

  /* 5 Columnas de Etapas */
  .stages-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    height: 1080px;
  }

  .stage-col {
    background: #ffffff;
    border-radius: 18px;
    border: 2px solid #e2e8f0;
    padding: 20px 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 8px 20px -4px rgba(15, 23, 42, 0.06);
  }

  .stage-col.s1 { border-top: 6px solid #0284c7; }
  .stage-col.s2 { border-top: 6px solid #7e22ce; }
  .stage-col.s3 { border-top: 6px solid #16a34a; }
  .stage-col.s4 { border-top: 6px solid #d97706; }
  .stage-col.s5 { border-top: 6px solid #059669; }

  .stage-header {
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 12px;
    margin-bottom: 14px;
  }

  .stage-tag {
    font-size: 11.5px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 6px;
    display: inline-block;
    margin-bottom: 6px;
  }

  .stage-title {
    font-size: 18px;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -0.3px;
  }

  .stage-status {
    font-size: 11.5px;
    font-family: 'JetBrains Mono', monospace;
    color: #64748b;
    font-weight: 700;
    display: block;
    margin-top: 3px;
  }

  .nodes-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
    justify-content: space-between;
  }

  .node-box {
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    padding: 14px 15px;
    position: relative;
  }

  .node-role-pill {
    position: absolute;
    top: 10px;
    right: 12px;
    font-size: 10.5px;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 6px;
  }

  .node-title-group {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }

  .node-step-circle {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 900;
    color: #fff;
    shrink: 0;
  }

  .node-title {
    font-size: 15px;
    font-weight: 800;
    color: #0f172a;
    padding-right: 65px;
  }

  .node-desc {
    font-size: 12.5px;
    color: #475569;
    line-height: 1.4;
  }

  .node-bullets {
    margin-top: 6px;
    padding-left: 18px;
    font-size: 12px;
    color: #334155;
    line-height: 1.45;
  }

  /* Compuertas de Decisión */
  .gateway-box {
    background: #fff;
    border: 2px solid #cbd5e1;
    border-radius: 12px;
    padding: 12px 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  }

  .gateway-title {
    font-size: 13px;
    font-weight: 800;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }

  .gateway-branches {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .branch {
    font-size: 11.5px;
    font-weight: 700;
    padding: 6px 10px;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .branch-ok { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
  .branch-dev { background: #fff7ed; color: #9a3412; border: 1.5px dashed #fdba74; }
  .branch-bad { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

  /* Conector troncal */
  .trans-bar {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    color: #0369a1;
    font-size: 11.5px;
    font-weight: 800;
    padding: 6px 10px;
    border-radius: 8px;
    text-align: center;
  }

  /* Footer con Reglas de Oro */
  .footer {
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 14px;
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  }

  .footer-title {
    font-size: 13px;
    font-weight: 900;
    color: #011C5B;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .footer-rules {
    display: flex;
    gap: 30px;
    font-size: 12.5px;
    color: #475569;
  }

  .footer-rules strong { color: #0f172a; }
</style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="brand-group">
      <div class="logo-box">
        <span class="title">SIGMA</span>
        <span class="itm-badge">ITM</span>
      </div>
      <div class="header-titles">
        <h1>ARQUITECTURA DE FLUJO DE ESTADOS, DECISIONES Y ROLES</h1>
        <p>Proceso Institucional de Modalidades de Grado · Flujo Secuencial Troncal con Subsanaciones Transversales</p>
      </div>
    </div>

    <div class="roles-legend">
      <div class="legend-item leg-est">🎓 Estudiante</div>
      <div class="legend-item leg-adm">👔 Administración</div>
      <div class="legend-item leg-ase">👨‍🏫 Docente Asesor</div>
      <div class="legend-item leg-jur">🏛️ Jurados / Comité</div>
      <div class="legend-item leg-dev">⚠️ Devolución / Subsanar</div>
    </div>
  </div>

  <!-- CONTENEDOR 5 ETAPAS -->
  <div class="stages-container">

    <!-- ETAPA 1 -->
    <div class="stage-col s1">
      <div class="stage-header">
        <span class="stage-tag" style="background: #e0f2fe; color: #0284c7;">ETAPA 1</span>
        <h2 class="stage-title">RADICACIÓN</h2>
        <span class="stage-status">ESTADO: POSTULACION</span>
      </div>

      <div class="nodes-stack">
        <div class="node-box">
          <span class="node-role-pill" style="background: #0284c7; color: #fff;">Estudiante</span>
          <div class="node-title-group">
            <div class="node-step-circle" style="background: #0284c7;">1</div>
            <div class="node-title">Registro de Propuesta</div>
          </div>
          <p class="node-desc">Diligenciamiento de formulario oficial:</p>
          <ul class="node-bullets">
            <li>Título y Modalidad seleccionada.</li>
            <li>Línea de investigación institucional.</li>
            <li>Alcance y resumen de objetivos.</li>
          </ul>
        </div>

        <div class="node-box">
          <span class="node-role-pill" style="background: #0284c7; color: #fff;">Estudiante</span>
          <div class="node-title-group">
            <div class="node-step-circle" style="background: #0284c7;">2</div>
            <div class="node-title">Carga de Documentos (4)</div>
          </div>
          <p class="node-desc">Soportes obligatorios según modalidad:</p>
          <ul class="node-bullets">
            <li>Propuesta técnica en formato ITM.</li>
            <li>Carta de aval o aceptación externa.</li>
            <li>Certificado de créditos aprobados.</li>
          </ul>
        </div>

        <div class="trans-bar">
          ➔ 1. Remisión a Coordinación
        </div>

        <div class="node-box" style="background: #f0fdf4; border-color: #bbf7d0;">
          <div class="node-title" style="font-size: 13.5px; color: #166534;">✓ Expediente Radicado</div>
          <p class="node-desc" style="font-size: 12px; margin-top: 3px;">Pasa automáticamente al buzón del Administrador para verificación.</p>
        </div>
      </div>
    </div>

    <!-- ETAPA 2 -->
    <div class="stage-col s2">
      <div class="stage-header">
        <span class="stage-tag" style="background: #f3e8ff; color: #7e22ce;">ETAPA 2</span>
        <h2 class="stage-title">AVAL Y ASIGNACIÓN</h2>
        <span class="stage-status">ESTADO: REVISION_DOCUMENTAL</span>
      </div>

      <div class="nodes-stack">
        <div class="node-box">
          <span class="node-role-pill" style="background: #7e22ce; color: #fff;">Admin</span>
          <div class="node-title-group">
            <div class="node-step-circle" style="background: #7e22ce;">3</div>
            <div class="node-title">Revisión de Requisitos</div>
          </div>
          <p class="node-desc">Auditoría de cumplimiento formal de documentos y formatos vigentes.</p>
        </div>

        <!-- DECISION 1 -->
        <div class="gateway-box" style="border-color: #c084fc;">
          <div class="gateway-title" style="color: #6b21a8;">
            <span>⚖️</span> ¿Requisitos Válidos?
          </div>
          <div class="gateway-branches">
            <div class="branch branch-dev">
              <span>⚠️ Incompleto / Errante</span>
              <strong>Devolver a Etapa 1</strong>
            </div>
            <div class="branch branch-ok">
              <span>✓ Requisitos Completos</span>
              <strong>Conceder Aval</strong>
            </div>
          </div>
        </div>

        <div class="node-box">
          <span class="node-role-pill" style="background: #7e22ce; color: #fff;">Admin</span>
          <div class="node-title-group">
            <div class="node-step-circle" style="background: #7e22ce;">4</div>
            <div class="node-title">Asignación de Asesor</div>
          </div>
          <p class="node-desc">Se vincula al Docente Asesor temático con directriz y notificación al correo.</p>
        </div>

        <div class="trans-bar">
          ➔ 2. Traspaso de Control a Asesor
        </div>
      </div>
    </div>

    <!-- ETAPA 3 -->
    <div class="stage-col s3">
      <div class="stage-header">
        <span class="stage-tag" style="background: #dcfce7; color: #16a34a;">ETAPA 3</span>
        <h2 class="stage-title">EJECUCIÓN Y TUTORÍA</h2>
        <span class="stage-status">ESTADO: EN_PROCESO</span>
      </div>

      <div class="nodes-stack">
        <div class="node-box">
          <span class="node-role-pill" style="background: #16a34a; color: #fff;">Asesor</span>
          <div class="node-title-group">
            <div class="node-step-circle" style="background: #16a34a;">5</div>
            <div class="node-title">Control de Tutoría</div>
          </div>
          <p class="node-desc">Supervisión exclusiva del desarrollo por parte del Asesor asignado.</p>
        </div>

        <div class="node-box">
          <span class="node-role-pill" style="background: #0284c7; color: #fff;">Estudiante</span>
          <div class="node-title-group">
            <div class="node-step-circle" style="background: #0284c7;">6</div>
            <div class="node-title">Carga de Avances</div>
          </div>
          <p class="node-desc">El estudiante entrega informes y borradores dirigidos <strong>100% al Asesor</strong>.</p>
        </div>

        <!-- BUCLE DE RETROALIMENTACION -->
        <div class="gateway-box" style="border-color: #ea580c; background: #fffaf5;">
          <div class="gateway-title" style="color: #c2410c;">
            <span>🔄</span> Bucle de Observaciones
          </div>
          <div class="gateway-branches">
            <div class="branch branch-dev">
              <span>⚠️ Pide Ajustes</span>
              <strong>Congela Etapa</strong>
            </div>
            <div class="branch" style="background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd;">
              <span>📝 Alumno Subsana</span>
              <strong>Retorna al Asesor</strong>
            </div>
            <div class="branch branch-ok">
              <span>✓ Avance Aprobado</span>
              <strong>Visto Bueno Final</strong>
            </div>
          </div>
        </div>

        <div class="trans-bar">
          ➔ 3. Aval para Sustentación
        </div>
      </div>
    </div>

    <!-- ETAPA 4 -->
    <div class="stage-col s4">
      <div class="stage-header">
        <span class="stage-tag" style="background: #fef3c7; color: #d97706;">ETAPA 4</span>
        <h2 class="stage-title">SUSTENTACIÓN</h2>
        <span class="stage-status">ESTADO: SUSTENTACION</span>
      </div>

      <div class="nodes-stack">
        <div class="node-box">
          <span class="node-role-pill" style="background: #16a34a; color: #fff;">Asesor</span>
          <div class="node-title-group">
            <div class="node-step-circle" style="background: #16a34a;">7</div>
            <div class="node-title">Citación Oficial</div>
          </div>
          <p class="node-desc">Asignación de fecha, hora, aula física / Teams y rúbrica evaluativa.</p>
        </div>

        <div class="node-box">
          <span class="node-role-pill" style="background: #d97706; color: #fff;">Jurados</span>
          <div class="node-title-group">
            <div class="node-step-circle" style="background: #d97706;">8</div>
            <div class="node-title">Defensa y Deliberación</div>
          </div>
          <p class="node-desc">Presentación oral ante jurados y calificación con acta oficial.</p>
        </div>

        <!-- DECISION SUSTENTACION -->
        <div class="gateway-box" style="border-color: #f59e0b;">
          <div class="gateway-title" style="color: #b45309;">
            <span>⚖️</span> Veredicto de Jurados
          </div>
          <div class="gateway-branches">
            <div class="branch branch-ok">
              <span>✓ Aprobada Directa</span>
              <strong>Acta Inmediata</strong>
            </div>
            <div class="branch branch-dev">
              <span>🛠️ Con Observaciones</span>
              <strong>Máx. 15 Días Subsanar</strong>
            </div>
            <div class="branch branch-bad">
              <span>❌ Reprobada / Aplazada</span>
              <strong>Cierre / Nueva Fecha</strong>
            </div>
          </div>
        </div>

        <div class="trans-bar">
          ➔ 4. Remisión de Acta a Comité
        </div>
      </div>
    </div>

    <!-- ETAPA 5 -->
    <div class="stage-col s5">
      <div class="stage-header">
        <span class="stage-tag" style="background: #ecfdf5; color: #059669;">ETAPA 5</span>
        <h2 class="stage-title">CIERRE Y GRADO</h2>
        <span class="stage-status">ESTADO: REVISION_COMITE ➔ FINALIZADO</span>
      </div>

      <div class="nodes-stack">
        <div class="node-box">
          <span class="node-role-pill" style="background: #d97706; color: #fff;">Comité</span>
          <div class="node-title-group">
            <div class="node-step-circle" style="background: #d97706;">9</div>
            <div class="node-title">Radicación Comité</div>
          </div>
          <p class="node-desc">El Comité recibe expediente completo con acta de calificación firmada.</p>
        </div>

        <div class="node-box">
          <span class="node-role-pill" style="background: #d97706; color: #fff;">Comité</span>
          <div class="node-title-group">
            <div class="node-step-circle" style="background: #d97706;">10</div>
            <div class="node-title">Ratificación Plenaria</div>
          </div>
          <p class="node-desc">Validación de antiplagio, paz y salvo y archivo en repositorio.</p>
        </div>

        <div class="node-box" style="background: #ecfdf5; border: 2px solid #10b981;">
          <span class="node-role-pill" style="background: #059669; color: #fff;">Grado</span>
          <div class="node-title-group">
            <div class="node-step-circle" style="background: #059669;">11</div>
            <div class="node-title" style="color: #065f46;">Paz y Salvo Oficial</div>
          </div>
          <p class="node-desc" style="color: #047857; font-weight: 600;">
            Generación del <strong>Certificado PDF con Código QR de Verificación</strong> institucional.
          </p>
          <ul class="node-bullets" style="color: #065f46;">
            <li>Estado final: <strong>FINALIZADO</strong>.</li>
            <li>Estudiante apto para ceremonia.</li>
          </ul>
        </div>
      </div>
    </div>

  </div>

  <!-- FOOTER -->
  <div class="footer" style="margin-top: 20px;">
    <div class="footer-title">
      <span>🛡️</span> Reglas Fundamentales del Flujo SIGMA ITM:
    </div>
    <div class="footer-rules">
      <div><strong>1. Secuencia Estricta:</strong> E1 ➔ E2 ➔ E3 ➔ E4 ➔ E5 sin omisión de etapas.</div>
      <div><strong>2. Autonomía de Tutoría:</strong> En Etapa 3 el estudiante interactúa exclusivamente con su Asesor.</div>
      <div><strong>3. Subsanación Transversal:</strong> Cualquier devolución retorna al mismo evaluador que observó.</div>
    </div>
  </div>

</body>
</html>
`;

// HTML 2: GRAFO DE DECISIONES Y RELACIONES (Diseño amplio, 2000x1250, en formato modular legible para que no quede diminuto)
const htmlDiagrama2 = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    width: 2100px;
    height: 1250px;
    background: #f8fafc;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #0f172a;
    padding: 35px 45px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .header {
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 18px;
    padding: 18px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.04);
  }

  .header h1 {
    font-size: 24px;
    font-weight: 900;
    color: #011C5B;
  }

  .header p {
    font-size: 13.5px;
    color: #64748b;
    font-weight: 600;
    margin-top: 2px;
  }

  .legend-pills {
    display: flex;
    gap: 12px;
  }

  .pill {
    font-size: 13px;
    font-weight: 800;
    padding: 6px 14px;
    border-radius: 8px;
  }

  /* Contenedor del Grafo en 2 Filas Amplias para Máxima Legibilidad */
  .graph-canvas {
    display: flex;
    flex-direction: column;
    gap: 24px;
    flex: 1;
    margin: 20px 0;
  }

  .graph-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 20px;
    padding: 24px 28px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.03);
    flex: 1;
  }

  /* Nodos del Grafo */
  .g-node {
    border-radius: 16px;
    padding: 22px 26px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 260px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.06);
    position: relative;
  }

  .g-node-title {
    font-size: 17.5px;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .g-node-sub {
    font-size: 13.5px;
    font-weight: 600;
    opacity: 0.95;
  }

  /* Rombos de Decisión Grandes */
  .g-diamond {
    background: #0f172a;
    color: #ffffff;
    border: 3px solid #38bdf8;
    border-radius: 18px;
    padding: 22px 26px;
    min-width: 280px;
    text-align: center;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.18);
  }

  .g-diamond h4 {
    font-size: 17px;
    font-weight: 900;
    color: #38bdf8;
    margin-bottom: 5px;
  }

  .g-diamond p {
    font-size: 13.5px;
    color: #94a3b8;
  }

  /* Flechas de Relación */
  .g-arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: #0284c7;
    font-size: 13.5px;
    font-weight: 800;
    text-align: center;
  }

  .g-arrow-line {
    width: 75px;
    height: 4px;
    background: #0284c7;
    position: relative;
    border-radius: 2px;
  }

  .g-arrow-line::after {
    content: "";
    position: absolute;
    right: -2px;
    top: -5px;
    border-left: 10px solid #0284c7;
    border-top: 7px solid transparent;
    border-bottom: 7px solid transparent;
  }

  .g-arrow.dashed {
    color: #ea580c;
  }

  .g-arrow.dashed .g-arrow-line {
    background: repeating-linear-gradient(90deg, #ea580c, #ea580c 6px, transparent 6px, transparent 12px);
  }

  .g-arrow.dashed .g-arrow-line::after {
    border-left-color: #ea580c;
  }

  /* Colores de Roles */
  .est-style { background: #0284c7; color: #fff; border: 2px solid #38bdf8; }
  .adm-style { background: #7e22ce; color: #fff; border: 2px solid #c084fc; }
  .ase-style { background: #15803d; color: #fff; border: 2px solid #4ade80; }
  .jur-style { background: #b45309; color: #fff; border: 2px solid #fbbf24; }
  .rec-style { background: #991b1b; color: #fff; border: 2px solid #f87171; }
  .fin-style { background: #047857; color: #fff; border: 3px solid #34d399; }
  .ret-style { background: #c2410c; color: #fff; border: 2px dashed #fdba74; }

  .subgraph-label {
    font-size: 14px;
    font-weight: 900;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: #f1f5f9;
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
  }
</style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div>
      <h1>MAPA RELACIONAL DE DECISIONES Y RETORNOS TRANSVERSALES</h1>
      <p>Representación de Grafos Interactivos · Compuertas Lógicas y Bucles de Corrección por Etapa</p>
    </div>

    <div class="legend-pills">
      <div class="pill est-style">🎓 Estudiante</div>
      <div class="pill adm-style">👔 Admin</div>
      <div class="pill ase-style">👨‍🏫 Asesor</div>
      <div class="pill jur-style">⚖️ Jurados</div>
      <div class="pill ret-style">⚠️ Subsanación</div>
      <div class="pill fin-style">✓ Aprobado</div>
    </div>
  </div>

  <!-- CANVAS EN 2 FILAS AMPLIAS -->
  <div class="graph-canvas">

    <!-- FILA SUPERIOR: FASE 1, FASE 2 Y BUCLE DE RETORNO -->
    <div class="graph-row">
      <div class="subgraph-label">Fase 1 ➔ Fase 2</div>

      <!-- N1 -->
      <div class="g-node est-style">
        <div class="g-node-title">🎓 1. Radicación</div>
        <div class="g-node-sub">Propuesta + 3 Anexos</div>
      </div>

      <div class="g-arrow">
        <span>Carga Formal</span>
        <div class="g-arrow-line"></div>
      </div>

      <!-- N2 -->
      <div class="g-node est-style">
        <div class="g-node-title">📤 2. Envío a Admin</div>
        <div class="g-node-sub">Genera N° Radicado</div>
      </div>

      <div class="g-arrow">
        <span>Turno Admin</span>
        <div class="g-arrow-line"></div>
      </div>

      <!-- ROMBO REQUISITOS -->
      <div class="g-diamond">
        <h4>⚖️ ¿Requisitos OK?</h4>
        <p>Validación de Formatos</p>
      </div>

      <!-- BIFURCACION -->
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="g-arrow dashed">
            <span>Incompleto</span>
            <div class="g-arrow-line"></div>
          </div>
          <div class="g-node ret-style" style="min-width: 200px;">
            <div class="g-node-title">⚠️ Devolución</div>
            <div class="g-node-sub">Retorna a Estudiante</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="g-arrow">
            <span>Aprobado</span>
            <div class="g-arrow-line"></div>
          </div>
          <div class="g-node adm-style" style="min-width: 200px;">
            <div class="g-node-title">👨‍🏫 3. Asignar Asesor</div>
            <div class="g-node-sub">Vinculación Formal</div>
          </div>
        </div>
      </div>

      <div class="g-arrow" style="color: #16a34a;">
        <span>Traspaso Tutor</span>
        <div class="g-arrow-line" style="background: #16a34a;"></div>
      </div>

      <!-- N5 -->
      <div class="g-node ase-style">
        <div class="g-node-title">👨‍🏫 4. Control Tutor</div>
        <div class="g-node-sub">Inicio Ejecución E3</div>
      </div>
    </div>

    <!-- FILA INFERIOR: FASE 3, FASE 4 Y FASE 5 -->
    <div class="graph-row">
      <div class="subgraph-label">Fase 3 ➔ Fase 4 ➔ Fase 5</div>

      <!-- CICLO TUTORIA E3 -->
      <div class="g-node ret-style">
        <div class="g-node-title">🔄 Bucle de Tutoría</div>
        <div class="g-node-sub">Avances ➔ Ajuste ➔ Subsana</div>
      </div>

      <div class="g-arrow" style="color: #16a34a;">
        <span>Aval para Sustentar</span>
        <div class="g-arrow-line" style="background: #16a34a;"></div>
      </div>

      <!-- CITACION -->
      <div class="g-node ase-style">
        <div class="g-node-title">📅 5. Citar Jurados</div>
        <div class="g-node-sub">Fecha, Aula y Rúbrica</div>
      </div>

      <div class="g-arrow" style="color: #b45309;">
        <span>Defensa Oral</span>
        <div class="g-arrow-line" style="background: #b45309;"></div>
      </div>

      <!-- ROMBO SUSTENTACION -->
      <div class="g-diamond" style="border-color: #fbbf24;">
        <h4 style="color: #fbbf24;">⚖️ Veredicto Jurados</h4>
        <p>Evaluación de Rúbrica</p>
      </div>

      <!-- RESULTADOS SUSTENTACION -->
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="g-arrow dashed" style="color: #ea580c;">
            <span>Ajustes</span>
            <div class="g-arrow-line" style="width: 40px;"></div>
          </div>
          <div class="g-node ret-style" style="min-width: 190px; padding: 10px 14px;">
            <div class="g-node-title" style="font-size: 13px;">🛠️ Obs. (15 días)</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="g-arrow" style="color: #dc2626;">
            <span>Fallo</span>
            <div class="g-arrow-line" style="width: 40px; background: #dc2626;"></div>
          </div>
          <div class="g-node rec-style" style="min-width: 190px; padding: 10px 14px;">
            <div class="g-node-title" style="font-size: 13px;">❌ Reprobada</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="g-arrow" style="color: #059669;">
            <span>Aprobada</span>
            <div class="g-arrow-line" style="width: 40px; background: #059669;"></div>
          </div>
          <div class="g-node fin-style" style="min-width: 190px; padding: 10px 14px;">
            <div class="g-node-title" style="font-size: 13px;">📝 Acta de Grado</div>
          </div>
        </div>
      </div>

      <div class="g-arrow" style="color: #059669;">
        <span>Remite Comité</span>
        <div class="g-arrow-line" style="background: #059669;"></div>
      </div>

      <!-- CIERRE FINAL -->
      <div class="g-node fin-style" style="border-width: 3px; box-shadow: 0 8px 24px rgba(5, 150, 105, 0.25);">
        <div class="g-node-title" style="font-size: 16px;">🎓 6. Paz y Salvo Oficial</div>
        <div class="g-node-sub">Certificado PDF + QR</div>
      </div>
    </div>

  </div>

  <!-- BARRA INFORMATIVA INFERIOR -->
  <div class="header" style="padding: 12px 24px;">
    <div style="font-size: 13px; font-weight: 800; color: #011C5B;">
      📌 Trazabilidad Garantizada: Cada compuerta de decisión genera un evento auditable en el historial del expediente.
    </div>
    <div style="font-size: 12.5px; color: #64748b; font-weight: 700;">
      SIGMA ITM · 2026
    </div>
  </div>

</body>
</html>
`;

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 2200, height: 1350, deviceScaleFactor: 1 }
  });

  // Renderizar Imagen 1 (Tema Claro, Grande y Legible)
  const page1 = await browser.newPage();
  await page1.setViewport({ width: 2200, height: 1350, deviceScaleFactor: 1 });
  await page1.setContent(htmlDiagrama1, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page1.screenshot({ path: outImg1, type: 'png' });
  console.log('Imagen 1 guardada:', outImg1);
  await page1.close();

  // Renderizar Imagen 2 (Grafo de Decisiones en 2 Filas Amplias)
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 2100, height: 1250, deviceScaleFactor: 1 });
  await page2.setContent(htmlDiagrama2, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page2.screenshot({ path: outImg2, type: 'png' });
  console.log('Imagen 2 guardada:', outImg2);
  await page2.close();

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
