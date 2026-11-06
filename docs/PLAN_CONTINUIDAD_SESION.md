# Estado de Sesión y Plan de Continuidad — SIGMA ITM

**Fecha y Hora:** 2026-10-20
**Proyecto:** SIGMA ITM (`sigma-itm-skeleton`)
**Contexto de la pausa:** El usuario reiniciará sesión en Antigravity IDE para refrescar los permisos de su cuenta Pro y recuperar los modelos avanzados (Gemini Pro, etc.) tras la actualización que causó saturación y degradación a Flash Low/Medium.

---

## 🎯 Próximo Paso Inmediato al Iniciar la Nueva Sesión

### Tarea Prioritaria #1: "Auditoría Express para Coordinadores y Comité en el Dashboard"
Transformar [Dashboard.jsx](file:///c:/Users/liba-/OneDrive/Escritorio/1.0ITM_2026-2/Proyecto%20jorge/sigma-itm-skeleton/sigma-itm/frontend/src/pages/Dashboard.jsx) para conectar los gráficos estadísticos con el visor documental y la ficha de modalidad:

1. **Interactividad en los Gráficos:**
   - Al hacer clic en una barra del `BarChart` (ej. "Revisión Documental" o "Aprobación") o en una rebanada del `PieChart`, se filtra y despliega una lista/cajón con las postulaciones de esa categoría.
2. **Acceso Directo a Documentos (`ModalVisorDocumento`):**
   - Cada fila de proyecto tendrá un botón de inspección rápida para abrir el documento directamente en el visor universal (PDF, Word, Excel) sin salir del Dashboard ni recargar la página.
3. **Consulta de Requisitos (`FichaModalidadProyecto`):**
   - Botón directo para auditar el checklist de la modalidad del estudiante (monografía, práctica, etc.).

---

## 📋 Tareas Pendientes en Cola (Siguientes Fases)

1. **Modo Comparador Paralelo (Side-by-Side Diff) en `PanelAprobacion.jsx`:**
   - Permitir a los evaluadores comparar la versión original con la versión subsanada (v1 vs v2) en dos paneles contiguos dentro del visor.
2. **Alertas de Subsanación con Conteo de Días:**
   - Indicadores visuales en la tabla de evaluadores para vigilar el límite institucional de 15 días en la etapa de Sustentación.
3. **Consolidación en Git:**
   - Commitear las optimizaciones pendientes de `PanelAprobacion.jsx`, `views.py` y `serializers.py`.

---

## 💬 Frase Clave para reactivar al asistente al volver:
*"Hola, ya inicié sesión de nuevo. Continuemos con la Auditoría Express del Dashboard que dejamos planeada."*
