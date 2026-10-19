# 🏛️ Manual Maestro de Estándares de Diseño, Flujo y Reglas de Negocio — Proyectos ITM

Este documento consolida todas las directrices oficiales, lecciones aprendidas, patrones de interfaz (UI/UX) y la arquitectura de flujo establecidas para **SIGMA ITM**. Debe ser utilizado como plantilla y punto de referencia para cualquier desarrollo institucional del ITM.

---

## 1. Paleta Cromática Institucional Oficial ITM

| Rol / Uso | Nombre Tailwind | Código HEX | Aplicación |
| :--- | :--- | :--- | :--- |
| **Fondo Principal Oscuro** | `bg-itm-blue-dark` | `#001340` | Sidebar, fondos de navegación lateral y cabeceras principales. |
| **Azul Institucional Primario** | `bg-itm-blue` | `#011C5B` | Botones de acción, bordes activos, barras de estado. |
| **Púrpura Institucional** | `bg-itm-purple` | `#661081` | Botones de acento, roles administrativos, viñetas de menú. |
| **Púrpura Claro** | `text-itm-purple-light` | `#910581` | Subtítulos y elementos secundarios con contraste. |
| **Gris Plata Institucional** | `text-itm-gray` | `#C6C6C6` | Tipografía secundaria sobre fondos oscuros (garantiza alto contraste). |
| **Blanco Nieve** | `text-white` | `#FFFFFF` | Textos primarios y contrastes sobre azul oscuro. |

### 🎨 Distintivo de Marca Especial (Degradado ITM)
* **Gradiente de Acento Aprobado:** `bg-gradient-to-tr from-itm-purple via-indigo-600 to-sky-500`
* **Aplicación:** 
  1. Insignia rectangular del logo: `SIGMA <span className="bg-gradient-to-tr from-itm-purple via-indigo-600 to-sky-500 text-white font-black text-sm px-2 py-0.5 rounded-lg border border-white/20">ITM</span>`.
  2. Círculo de avatar del usuario activo (`border-2 border-white/20 shadow-md text-white font-black`).

---

## 2. Estándares Obligatorios de Interfaz (UI/UX)

### A. Diálogos y Campos de Mensaje Amplios
* **Problema resuelto:** Los campos de texto pequeños impiden al usuario redactar y leer cómodamente observaciones académicas.
* **Estándar:**
  * Modales de devolución/corrección: Tamaño mínimo `max-w-3xl`.
  * Áreas de texto (`<textarea>`): `rows={6}` a `rows={8}`, clase obligatoria `min-h-[160px]`, `resize-y`, `leading-relaxed` y `shadow-inner`.

### B. Gestión de Documentos y Modales de Reemplazo
* **Reemplazo con Trazabilidad:** Todo modal que permita reemplazar un documento (`modalReemplazarDoc`) **debe incluir** obligatoriamente un campo de **Descripción de Versión** (`<textarea rows={4}>`), permitiendo al estudiante justificar qué corrigió.
* **Botón de Papelera Seguro (🗑️):** Documentos en estado no terminal pueden ser eliminados o sustituidos por el alumno si se equivocó de archivo.

### C. Contraste en Barras Laterales (Sidebar)
* La etiqueta "MENÚ PRINCIPAL" debe usar siempre `text-itm-gray` (`#C6C6C6`) con viñeta `bg-itm-purple`.
* Los enlaces inactivos usan `text-itm-gray hover:text-white hover:bg-itm-blue`.
* El enlace activo usa `bg-gradient-to-r from-itm-blue to-itm-purple text-white font-bold`.

---

## 3. Arquitectura del Flujo Secuencial (5 Etapas)

```
[ETAPA 1: RADICACIÓN] ➔ [ETAPA 2: AVAL Y ASIGNACIÓN] ➔ [ETAPA 3: EJECUCIÓN] ➔ [ETAPA 4: SUSTENTACIÓN] ➔ [ETAPA 5: CIERRE Y GRADO]
```

### Reglas de Oro Inviolables:
1. **Secuencialidad Estricta:** Ningún estudiante pasa a Sustentación o Comité sin haber superado formalmente las fases anteriores.
2. **Autonomía de Tutoría en Etapa 3:** Una vez asignado el Docente Asesor, todos los avances, borradores y archivos que sube el estudiante **van directa y exclusivamente al Asesor**. No regresan al Administrador ni saltan al Comité.
3. **Subsanación Transversal:** En cualquiera de las etapas (1 a 5), el evaluador competente puede accionar `PEDIR CORRECCIÓN`. El sistema congela la etapa, traslada el turno al estudiante, y al subsanar, el trámite **retorna exactamente al mismo evaluador** que solicitó el ajuste.
4. **Compuerta de Sustentación (Etapa 4):**
   * *Aprobada Directa:* Emisión inmediata de Acta.
   * *Con Observaciones:* Plazo legal de hasta 15 días para entregar versión corregida.
   * *Reprobada:* Cierre no aprobatorio o reprogramación.
5. **Cierre Oficial (Etapa 5):** Ratificación por Comité de Grados y generación automatizada de Certificado de Grado en PDF con código QR institucional.

---

## 4. Scripts Automatizados de Renderizado de Diagramas

En la carpeta `frontend/` se encuentran las herramientas en Node.js + Puppeteer que generan automáticamente los diagramas del proceso en resolución 4K:
* `generate_vertical_graph.mjs`: Genera el **Grafo de Decisiones Vertical** (`docs/img/grafo_flujo_vertical.png`).
* `generate_light_diagrams.mjs`: Genera la **Infografía de 5 Columnas en Fondo Claro** (`docs/img/flujo_proceso_sigma_itm.png`).

Para ejecutarlos en cualquier proyecto nuevo:
```bash
cd frontend
node generate_vertical_graph.mjs
node generate_light_diagrams.mjs
```
