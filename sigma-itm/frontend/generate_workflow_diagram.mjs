import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outPath = path.join(__dirname, '..', 'docs', 'img', 'flujo_proceso_sigma_itm.png');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    width: 2560px;
    height: 1440px;
    background: radial-gradient(circle at 15% 15%, #0d1a33 0%, #030a16 55%, #01040a 100%);
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #e2e8f0;
    padding: 45px 55px;
    overflow: hidden;
    position: relative;
  }

  /* Grid blueprint sutil */
  body::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  /* Header Superior */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 24px;
    margin-bottom: 30px;
    position: relative;
    z-index: 10;
  }

  .brand-group {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .itm-badge {
    background: #001340;
    border: 1.5px solid rgba(99, 102, 241, 0.4);
    padding: 10px 22px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 19, 64, 0.8);
  }

  .itm-badge span.name {
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -0.5px;
    color: #ffffff;
  }

  .itm-pill {
    background: linear-gradient(135deg, #661081, #4f46e5, #0ea5e9);
    color: #fff;
    padding: 4px 12px;
    border-radius: 8px;
    font-weight: 900;
    font-size: 15px;
    letter-spacing: 0.5px;
    border: 1px solid rgba(255, 255, 255, 0.25);
  }

  .header-titles h1 {
    font-size: 28px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.5px;
    line-height: 1.2;
  }

  .header-titles p {
    font-size: 14px;
    color: #94a3b8;
    font-weight: 500;
    margin-top: 4px;
  }

  /* Roles Legend */
  .roles-legend {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 10px 20px;
    border-radius: 16px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: 10px;
  }

  .role-estudiante { background: rgba(2, 132, 199, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); }
  .role-admin      { background: rgba(126, 34, 206, 0.15); color: #c084fc; border: 1px solid rgba(192, 132, 252, 0.4); }
  .role-asesor     { background: rgba(22, 163, 74, 0.15); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.4); }
  .role-jurados    { background: rgba(217, 119, 6, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.4); }
  .role-ajuste     { background: rgba(234, 88, 12, 0.15); color: #fdba74; border: 1px dashed rgba(253, 186, 116, 0.6); }

  /* Grid Principal de 5 Fases */
  .stages-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 22px;
    height: 1140px;
    position: relative;
    z-index: 10;
  }

  /* Card de Etapa */
  .stage-col {
    background: linear-gradient(180deg, rgba(13, 23, 42, 0.85) 0%, rgba(8, 14, 27, 0.95) 100%);
    border-radius: 20px;
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 24px 20px;
    position: relative;
    backdrop-filter: blur(16px);
    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
  }

  .stage-col.active-e1 { border-color: rgba(56, 189, 248, 0.35); }
  .stage-col.active-e2 { border-color: rgba(192, 132, 252, 0.35); }
  .stage-col.active-e3 { border-color: rgba(74, 222, 128, 0.35); }
  .stage-col.active-e4 { border-color: rgba(251, 191, 36, 0.35); }
  .stage-col.active-e5 { border-color: rgba(52, 211, 153, 0.45); }

  /* Encabezado de Etapa */
  .stage-header {
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .stage-num-badge {
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    display: inline-block;
    padding: 4px 10px;
    border-radius: 6px;
    margin-bottom: 8px;
  }

  .stage-title {
    font-size: 18px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.3px;
    line-height: 1.25;
  }

  .stage-state-tag {
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    color: #64748b;
    margin-top: 4px;
    display: block;
    font-weight: 600;
  }

  /* Tarjetas de Nodos / Acciones */
  .nodes-stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
  }

  .action-node {
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 14px 16px;
    position: relative;
    transition: all 0.2s;
  }

  .node-owner-pill {
    position: absolute;
    top: 12px;
    right: 14px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 3px 8px;
    border-radius: 6px;
  }

  .node-header-group {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .node-icon-box {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    shrink: 0;
  }

  .node-title {
    font-size: 14.5px;
    font-weight: 700;
    color: #f8fafc;
    line-height: 1.2;
    padding-right: 65px;
  }

  .node-desc {
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.45;
  }

  .node-bullets {
    margin-top: 8px;
    padding-left: 18px;
    font-size: 11.5px;
    color: #cbd5e1;
    line-height: 1.45;
  }

  .node-bullets li {
    margin-bottom: 4px;
  }

  /* Rombo / Compuerta de Decisión */
  .decision-gateway {
    background: rgba(30, 41, 59, 0.9);
    border: 1.5px solid #64748b;
    border-radius: 14px;
    padding: 14px;
    position: relative;
  }

  .decision-title {
    font-size: 13.5px;
    font-weight: 800;
    color: #f1f5f9;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .decision-branches {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .branch-item {
    font-size: 11.5px;
    padding: 8px 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
  }

  .branch-ok {
    background: rgba(22, 163, 74, 0.15);
    border: 1px solid rgba(74, 222, 128, 0.4);
    color: #86efac;
  }

  .branch-adjust {
    background: rgba(234, 88, 12, 0.18);
    border: 1px dashed rgba(253, 186, 116, 0.6);
    color: #fed7aa;
  }

  .branch-fail {
    background: rgba(220, 38, 38, 0.18);
    border: 1px solid rgba(248, 113, 113, 0.5);
    color: #fca5a5;
  }

  /* Flechas conectoras de etapas */
  .connector-tag {
    background: #0b1329;
    border: 1px solid rgba(99, 102, 241, 0.5);
    color: #a5b4fc;
    font-size: 11px;
    font-weight: 800;
    padding: 6px 12px;
    border-radius: 10px;
    text-align: center;
    margin: 8px 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }

  /* Footer de Reglas Institucionales */
  .footer-bar {
    position: absolute;
    bottom: 30px;
    left: 55px;
    right: 55px;
    background: rgba(15, 23, 42, 0.85);
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 14px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    backdrop-filter: blur(12px);
  }

  .rules-title {
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #38bdf8;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rules-list {
    display: flex;
    gap: 32px;
  }

  .rule-item {
    font-size: 12px;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rule-item strong {
    color: #f8fafc;
  }
</style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="brand-group">
      <div class="itm-badge">
        <span class="name">SIGMA</span>
        <span class="itm-pill">ITM</span>
      </div>
      <div class="header-titles">
        <h1>ARQUITECTURA DE FLUJO DE ESTADOS, DECISIONES Y ROLES</h1>
        <p>Ciclo de Vida de Trabajos de Grado · Flujo Secuencial Troncal con Compuertas de Validación y Ciclos de Subsanación Transversales</p>
      </div>
    </div>

    <!-- LEYENDA DE ROLES -->
    <div class="roles-legend">
      <div class="legend-item role-estudiante">🎓 Estudiante</div>
      <div class="legend-item role-admin">👔 Admin / Coordinación</div>
      <div class="legend-item role-asesor">👨‍🏫 Docente Asesor</div>
      <div class="legend-item role-jurados">🏛️ Jurados / Comité</div>
      <div class="legend-item role-ajuste">⚠️ Retorno a Corrección</div>
    </div>
  </div>

  <!-- CONTENEDOR DE 5 ETAPAS -->
  <div class="stages-container">

    <!-- ETAPA 1 -->
    <div class="stage-col active-e1">
      <div class="stage-header">
        <span class="stage-num-badge" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8;">ETAPA 1</span>
        <h2 class="stage-title">RADICACIÓN</h2>
        <span class="stage-state-tag">ESTADO: POSTULACION</span>
      </div>

      <div class="nodes-stack">
        <div class="action-node">
          <span class="node-owner-pill" style="background: #0369a1; color: #fff;">Estudiante</span>
          <div class="node-header-group">
            <div class="node-icon-box" style="background: #0284c7; color: #fff;">1</div>
            <div class="node-title">Registro de Propuesta</div>
          </div>
          <p class="node-desc">El estudiante diligencia los metadatos de su trabajo de grado:</p>
          <ul class="node-bullets">
            <li>Título y Modalidad académica.</li>
            <li>Línea de investigación institucional.</li>
            <li>Resumen de objetivos y alcance.</li>
          </ul>
        </div>

        <div class="action-node">
          <span class="node-owner-pill" style="background: #0369a1; color: #fff;">Estudiante</span>
          <div class="node-header-group">
            <div class="node-icon-box" style="background: #0284c7; color: #fff;">2</div>
            <div class="node-title">Carga Documental (4 Docs)</div>
          </div>
          <p class="node-desc">Adjunta los soportes requeridos obligatorios según modalidad:</p>
          <ul class="node-bullets">
            <li>Documento de Propuesta Técnica.</li>
            <li>Carta aval institucional / empresa.</li>
            <li>Certificado de notas / requisitos.</li>
          </ul>
        </div>

        <div class="connector-tag">
          ➔ 1. Remisión Formal a Coordinación
        </div>

        <div class="action-node" style="border-left: 3px solid #38bdf8; background: rgba(2, 132, 199, 0.08);">
          <div class="node-title" style="font-size: 13px;">Expediente Radicado</div>
          <p class="node-desc" style="font-size: 11.5px; margin-top: 4px;">El proyecto adquiere número de radicado oficial y se transfiere al buzón del Administrador.</p>
        </div>
      </div>
    </div>

    <!-- ETAPA 2 -->
    <div class="stage-col active-e2">
      <div class="stage-header">
        <span class="stage-num-badge" style="background: rgba(192, 132, 252, 0.2); color: #c084fc;">ETAPA 2</span>
        <h2 class="stage-title">AVAL Y ASIGNACIÓN</h2>
        <span class="stage-state-tag">ESTADO: REVISION_DOCUMENTAL</span>
      </div>

      <div class="nodes-stack">
        <div class="action-node">
          <span class="node-owner-pill" style="background: #7e22ce; color: #fff;">Administración</span>
          <div class="node-header-group">
            <div class="node-icon-box" style="background: #6b21a8; color: #fff;">3</div>
            <div class="node-title">Revisión de Requisitos</div>
          </div>
          <p class="node-desc">Coordinación de Grados audita la legalidad y suficiencia:</p>
          <ul class="node-bullets">
            <li>Verificación de formatos vigentes.</li>
            <li>Créditos y paz y salvos académicos.</li>
          </ul>
        </div>

        <!-- DECISION 1 -->
        <div class="decision-gateway">
          <div class="decision-title">
            <span>⚖️</span> Compuerta de Requisitos
          </div>
          <div class="decision-branches">
            <div class="branch-item branch-adjust">
              <span>⚠️ Incompleto / Errante</span>
              <strong>Devolver a E1</strong>
            </div>
            <div class="branch-item branch-ok">
              <span>✓ Requisitos Validados</span>
              <strong>Conceder Aval</strong>
            </div>
          </div>
        </div>

        <div class="action-node">
          <span class="node-owner-pill" style="background: #7e22ce; color: #fff;">Administración</span>
          <div class="node-header-group">
            <div class="node-icon-box" style="background: #6b21a8; color: #fff;">4</div>
            <div class="node-title">Asignación de Tutor</div>
          </div>
          <p class="node-desc">Se vincula formalmente al Docente Asesor temático:</p>
          <ul class="node-bullets">
            <li>Emisión de directriz y alcances.</li>
            <li>Notificación y traspaso de expediente.</li>
          </ul>
        </div>

        <div class="connector-tag">
          ➔ 2. Transferencia de Control a Tutor
        </div>
      </div>
    </div>

    <!-- ETAPA 3 -->
    <div class="stage-col active-e3">
      <div class="stage-header">
        <span class="stage-num-badge" style="background: rgba(74, 222, 128, 0.2); color: #4ade80;">ETAPA 3</span>
        <h2 class="stage-title">EJECUCIÓN Y TUTORÍA</h2>
        <span class="stage-state-tag">ESTADO: EN_PROCESO</span>
      </div>

      <div class="nodes-stack">
        <div class="action-node">
          <span class="node-owner-pill" style="background: #15803d; color: #fff;">Asesor</span>
          <div class="node-header-group">
            <div class="node-icon-box" style="background: #16a34a; color: #fff;">5</div>
            <div class="node-title">Tutoría Exclusiva</div>
          </div>
          <p class="node-desc">Control directo del desarrollo sin interferencia superior.</p>
        </div>

        <div class="action-node">
          <span class="node-owner-pill" style="background: #0369a1; color: #fff;">Estudiante</span>
          <div class="node-header-group">
            <div class="node-icon-box" style="background: #0284c7; color: #fff;">6</div>
            <div class="node-title">Entrega de Avances</div>
          </div>
          <p class="node-desc">El alumno carga informes, código y prototipos que van <strong>directo a su Asesor</strong>.</p>
        </div>

        <!-- CICLO DE SUBSANACIÓN CON ASESOR -->
        <div class="decision-gateway" style="border-color: #ea580c; background: rgba(234, 88, 12, 0.08);">
          <div class="decision-title" style="color: #fdba74;">
            <span>🔄</span> Bucle de Corrección y Avance
          </div>
          <div class="decision-branches">
            <div class="branch-item branch-adjust">
              <span>⚠️ Asesor Pide Ajustes</span>
              <strong>Congela Etapa</strong>
            </div>
            <div class="branch-item" style="background: rgba(2, 132, 199, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #7dd3fc;">
              <span>📝 Alumno Subsana</span>
              <strong>Retorna al Asesor</strong>
            </div>
            <div class="branch-item branch-ok">
              <span>✓ Aprobación Final de Avance</span>
              <strong>Visto Bueno</strong>
            </div>
          </div>
        </div>

        <div class="connector-tag">
          ➔ 3. Proyecto Listo para Defensa
        </div>
      </div>
    </div>

    <!-- ETAPA 4 -->
    <div class="stage-col active-e4">
      <div class="stage-header">
        <span class="stage-num-badge" style="background: rgba(251, 191, 36, 0.2); color: #fbbf24;">ETAPA 4</span>
        <h2 class="stage-title">SUSTENTACIÓN</h2>
        <span class="stage-state-tag">ESTADO: SUSTENTACION</span>
      </div>

      <div class="nodes-stack">
        <div class="action-node">
          <span class="node-owner-pill" style="background: #15803d; color: #fff;">Asesor</span>
          <div class="node-header-group">
            <div class="node-icon-box" style="background: #16a34a; color: #fff;">7</div>
            <div class="node-title">Citación Oficial</div>
          </div>
          <p class="node-desc">Programación de fecha, hora, aula/enlace Teams y rúbrica de calificación.</p>
        </div>

        <div class="action-node">
          <span class="node-owner-pill" style="background: #b45309; color: #fff;">Jurados</span>
          <div class="node-header-group">
            <div class="node-icon-box" style="background: #d97706; color: #fff;">8</div>
            <div class="node-title">Defensa Oral y Deliberación</div>
          </div>
          <p class="node-desc">Evaluación del documento final y exposición ante jurados.</p>
        </div>

        <!-- DECISION SUSTENTACION -->
        <div class="decision-gateway">
          <div class="decision-title">
            <span>⚖️</span> Veredicto de Jurados
          </div>
          <div class="decision-branches">
            <div class="branch-item branch-ok">
              <span>✓ Aprobada Directa</span>
              <strong>Acta Inmediata</strong>
            </div>
            <div class="branch-item branch-adjust">
              <span>🛠️ Con Observaciones</span>
              <strong>Plazo Máx. 15 Días</strong>
            </div>
            <div class="branch-item branch-fail">
              <span>❌ Reprobada / Aplazada</span>
              <strong>Cierre / Segunda Fecha</strong>
            </div>
          </div>
        </div>

        <div class="connector-tag">
          ➔ 4. Remisión de Acta a Comité
        </div>
      </div>
    </div>

    <!-- ETAPA 5 -->
    <div class="stage-col active-e5">
      <div class="stage-header">
        <span class="stage-num-badge" style="background: rgba(52, 211, 153, 0.2); color: #34d399;">ETAPA 5</span>
        <h2 class="stage-title">CIERRE Y GRADO</h2>
        <span class="stage-state-tag">ESTADO: REVISION_COMITE ➔ FINALIZADO</span>
      </div>

      <div class="nodes-stack">
        <div class="action-node">
          <span class="node-owner-pill" style="background: #b45309; color: #fff;">Comité</span>
          <div class="node-header-group">
            <div class="node-icon-box" style="background: #d97706; color: #fff;">9</div>
            <div class="node-title">Radicación en Comité</div>
          </div>
          <p class="node-desc">El Comité de Trabajos de Grado recibe acta firmada y expediente íntegro.</p>
        </div>

        <div class="action-node">
          <span class="node-owner-pill" style="background: #b45309; color: #fff;">Comité</span>
          <div class="node-header-group">
            <div class="node-icon-box" style="background: #d97706; color: #fff;">10</div>
            <div class="node-title">Ratificación Plenaria</div>
          </div>
          <p class="node-desc">Revisión antiplagio, depósito en repositorio institucional y aval de grado.</p>
        </div>

        <div class="action-node" style="border: 2px solid #34d399; background: rgba(5, 150, 105, 0.15); box-shadow: 0 10px 25px -5px rgba(5, 150, 105, 0.4);">
          <span class="node-owner-pill" style="background: #047857; color: #fff;">Certificación</span>
          <div class="node-header-group">
            <div class="node-icon-box" style="background: #059669; color: #fff;">11</div>
            <div class="node-title" style="color: #6ee7b7;">Paz y Salvo Oficial</div>
          </div>
          <p class="node-desc" style="color: #a7f3d0;">Generación de <strong>Certificado PDF con Código QR de Verificación</strong> y firma institucional.</p>
          <ul class="node-bullets" style="color: #6ee7b7;">
            <li>Estado final: <strong>FINALIZADO</strong>.</li>
            <li>Estudiante apto para ceremonia.</li>
          </ul>
        </div>
      </div>
    </div>

  </div>

  <!-- FOOTER CON REGLAS DE NEGOCIO -->
  <div class="footer-bar">
    <div class="rules-title">
      <span>🛡️</span> Reglas de Oro SIGMA ITM:
    </div>
    <div class="rules-list">
      <div class="rule-item">
        <strong>1. Secuencia Estricta:</strong> E1 ➔ E2 ➔ E3 ➔ E4 ➔ E5 sin saltos de fase.
      </div>
      <div class="rule-item">
        <strong>2. Autonomía de Tutoría:</strong> En Etapa 3 el estudiante interactúa 100% con su Asesor asignado.
      </div>
      <div class="rule-item">
        <strong>3. Subsanación Transversal:</strong> Cualquier devolución congela el trámite y retorna al mismo evaluador que observó.
      </div>
    </div>
  </div>

</body>
</html>
`;

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 2560, height: 1440, deviceScaleFactor: 1 }
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: outPath, type: 'png' });
  console.log('Imagen del diagrama generada exitosamente en:', outPath);

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
