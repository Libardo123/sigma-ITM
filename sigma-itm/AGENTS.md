# Reglas y Directrices de Proyecto — Ecosistema ITM (SIGMA ITM)

Este archivo define las reglas obligatorias de diseño, arquitectura y comportamiento para cualquier agente o desarrollador que trabaje en proyectos institucionales del ITM.

## 1. Identidad Cromática Institucional ITM
- Fondo oscuro principal: `#001340` (`bg-itm-blue-dark`).
- Azul institucional: `#011C5B` (`bg-itm-blue`).
- Púrpura institucional: `#661081` (`bg-itm-purple`).
- Gris de alto contraste sobre fondo oscuro: `#C6C6C6` (`text-itm-gray`).
- Distintivo gradiente de marca (Insignia "ITM" y avatar de usuario):
  `bg-gradient-to-tr from-itm-purple via-indigo-600 to-sky-500` con `text-white font-black border border-white/20 shadow-md`.

## 2. Estándares UI/UX en Modales y Formularios
- **Campos de Observaciones / Devolución:** Usar siempre cuadros amplios: `min-h-[160px]`, `rows={6}` a `rows={8}`, `resize-y`, `leading-relaxed`.
- **Modales de Reemplazo de Archivos:** Todo reemplazo documental debe incluir un campo de descripción para que el estudiante justifique los cambios realizados en la nueva versión.
- **Contraste de Navegación:** El menú lateral debe mantener siempre contraste accesible (títulos en `#C6C6C6`, enlaces activos con gradiente `#011C5B` a `#661081`).

## 3. Arquitectura del Flujo (5 Etapas Inviolables)
- Secuencia: E1 (Radicación) ➔ E2 (Aval & Asignación) ➔ E3 (Ejecución) ➔ E4 (Sustentación) ➔ E5 (Cierre & Grado).
- Durante Etapa 3 (Ejecución): El estudiante interactúa **exclusivamente con el Docente Asesor asignado**. Los avances y entregables nunca se desvían al Administrador ni al Comité.
- Subsanación Transversal: En cualquier etapa, un evaluador puede solicitar correcciones. La etapa se congela y, tras la subsanación del estudiante, el trámite retorna al mismo evaluador que observó.
- Sustentación: Contempla 3 salidas: Aprobada directa, Aprobada con observaciones (plazo máximo de 15 días) y Reprobada.

## 4. Documentación y Diagramas
- La documentación maestra y los diagramas oficiales de arquitectura residen en `docs/FLUJO_Y_GRAFOS_PROCESO.md` y `docs/ESTANDARES_Y_PATRONES_ITM.md`.
- Para regenerar diagramas en alta definición se ejecutan los scripts ubicados en `frontend/generate_vertical_graph.mjs` y `frontend/generate_light_diagrams.mjs`.

## 5. Protocolo Obligatorio para Agentes (Toma de Decisiones y Construcción)
Cualquier agente que participe en este proyecto debe cumplir estas 5 reglas sin excepción:
1. **Freno de Mano Obligatorio:** ANTES de modificar o crear archivos, presenta el plan técnico detallado al usuario y DETENTE. No toques archivos hasta recibir confirmación explícita.
2. **Prohibido Asumir o Inventar Lógica de Negocio:** Si un flujo, rol o regla de negocio no está en `docs/ESTANDARES_Y_PATRONES_ITM.md`, está TERMINANTEMENTE PROHIBIDO inventarlo. El agente debe formular una pregunta clara al usuario antes de proceder.
3. **Autonomía de Asesor en Etapa 3:** Bajo ninguna circunstancia un avance o entregable de Etapa 3 puede desviarse a Coordinación, Comité o Administrador; solo el Docente Asesor asignado puede evaluarlo.
4. **Stack Congelado:** Prohibido instalar paquetes, dependencias o cambiar librerías sin autorización expresa. Consulta siempre `ARQUITECTURA_RESUMIDA.md` para el stack y comandos oficiales.
5. **Verificación con Salida Real de Consola:** Prohibido declarar una tarea como "lista" o "completada" sin ejecutar los tests (`pytest`, `npm test`, linter) y pegar la salida real de la terminal. Cero aprobaciones teóricas.

