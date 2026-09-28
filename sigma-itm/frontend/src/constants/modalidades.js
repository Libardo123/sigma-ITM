/**
 * modalidades.js — Catálogo oficial de las 10 modalidades de opción de grado ITM.
 * Fuente de verdad institucional compartida entre páginas públicas, estudiante y comités.
 */

export const MODALIDADES_OFICIALES = [
  {
    icono: "🎓",
    nombre: "Trabajo de Grado",
    descripcion:
      "Desarrolla una propuesta clásica de grado con el acompañamiento de un asesor metodológico y temático.",
    requisitoClave: "Propuesta formal avalada por un asesor metodológico y temático.",
  },
  {
    icono: "💼",
    nombre: "Prácticas Profesionales",
    descripcion:
      "Aplica tus conocimientos en un entorno laboral real. Requiere pre-aprobación del centro de prácticas y carta de la empresa.",
    requisitoClave: "Carta de aceptación de la empresa y aval del centro de prácticas.",
  },
  {
    icono: "🌐",
    nombre: "Pasantía",
    descripcion:
      "Realiza un intercambio o pasantía en otra institución educativa nacional o internacional.",
    requisitoClave: "Convenio interinstitucional o carta de aceptación y plan de actividades.",
  },
  {
    icono: "🚀",
    nombre: "Emprendimiento",
    descripcion:
      "Desarrolla tu propia idea de negocio estructurada. Requiere plan de negocios y viabilidad financiera aprobada.",
    requisitoClave: "Modelo de negocio Canvas validado y plan financiero de viabilidad.",
  },
  {
    icono: "🧪",
    nombre: "Producto en Laboratorio",
    descripcion:
      "Construye una propuesta técnica avalada por un laboratorio o grupo de investigación de la institución.",
    requisitoClave: "Aval formal del director del laboratorio y protocolo experimental.",
  },
  {
    icono: "🔬",
    nombre: "Producto de Investigación",
    descripcion:
      "Únete a un semillero o propone tu propia investigación guiado por un docente experto en la materia.",
    requisitoClave: "Vinculación a semillero de investigación o tutoría de docente investigador.",
  },
  {
    icono: "🏆",
    nombre: "Reconocimiento Laboral",
    descripcion:
      "Valida tu experiencia laboral actual si está directamente relacionada con tu programa académico.",
    requisitoClave: "Certificado laboral vigente con funciones afines al perfil profesional.",
  },
  {
    icono: "📜",
    nombre: "Certificación",
    descripcion:
      "Obtén una certificación técnica internacional válida como requisito de grado según el reglamento.",
    requisitoClave: "Certificación oficial expedida por entidad internacional reconocida.",
  },
  {
    icono: "📚",
    nombre: "Cursos de Posgrado",
    descripcion:
      "Adelanta materias de especialización o maestría como opción para tu grado de pregrado.",
    requisitoClave: "Aprobación de créditos de posgrado con promedio mínimo reglamentario.",
  },
  {
    icono: "🤝",
    nombre: "Ingeniería para la Gente",
    descripcion:
      "Aplica tus conocimientos en proyectos de impacto social y comunitario avalados por la institución.",
    requisitoClave: "Diagnóstico comunitario y aval de la entidad u organización social beneficiaria.",
  },
];

export function obtenerInfoModalidad(nombre) {
  if (!nombre) return null;
  return (
    MODALIDADES_OFICIALES.find(
      (m) => m.nombre.toLowerCase().trim() === nombre.toLowerCase().trim()
    ) || {
      icono: "📋",
      nombre: nombre,
      descripcion: "Modalidad reglamentaria de opción de grado ITM.",
      requisitoClave: "Documentación estipulada según el reglamento académico.",
    }
  );
}
