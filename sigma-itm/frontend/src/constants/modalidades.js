/**
 * modalidades.js — Catálogo oficial de las 10 modalidades de opción de grado ITM.
 * Fuente de verdad institucional de la Facultad de Ingenierías de la Institución Universitaria ITM.
 * Fundamentado estrictamente en la Resolución Nro. 562 del 05 de mayo de 2026 y en los
 * procedimientos del Sistema de Gestión de Calidad (PDEH-008, 021, 022, 023, 024, 025, 026, 027, 028, 029).
 */

export const MODALIDADES_OFICIALES = [
  {
    codigo: "TRABAJO_GRADO",
    icono: "🎓",
    nombre: "Proyecto de Grado",
    subtitulo: "Investigación Aplicada o Solución Técnica (1 a 3 estudiantes)",
    color: "purple",
    normaOficial: "Resolución 562 de 2026 (Art. 9) · Procedimiento PDEH 026",
    exclusivoNivel: "AMBOS",
    integrantesMax: 3,
    creditosMinimos: "70%",
    permiteEstudiantesNoActivos: false,
    descripcion:
      "Modalidad de trabajo de grado que permite a un equipo de 1 a 3 estudiantes aplicar los conocimientos adquiridos durante su formación para la solución teórica o experimental de un problema, necesidad o servicio real, bajo la orientación continua de un Docente Asesor y con evaluación final de un docente experto.",
    queEs:
      "De 1 a 3 estudiantes formulan una propuesta formal en el formato institucional FDE 088 con el aval de su docente asesor. Tras la aprobación de la propuesta por la Comisión de Trabajos de Grado con el formato FDE 202, desarrollan el proyecto cumpliendo el reporte periódico de asesorías (FDE 053). El ciclo culmina con la entrega del informe final (FDE 089) evaluado por un docente evaluador asignado (FDE 090), sin terna ni jurados orales obligatorios.",
    perfilEstudiante:
      "Estudiantes de tecnología o ingeniería con interés en el diseño de soluciones de ingeniería, desarrollo de software o hardware, modelado analítico o investigación aplicada, orientados al rigor metodológico y técnico.",
    condicionesPrevias:
      "Tener aprobado por lo menos el 70% de los créditos del plan de estudios del programa respectivo (Res. 562 Art. 2 Parágrafo 2) y ser estudiante activo.",
    requisitosParaGraduarse: [
      "Tener aprobado al menos el 70% de créditos para la inscripción y culminar el 100% del plan de estudios.",
      "Propuesta de Proyecto de Grado radicada en formato oficial FDE 088 con aval firmado del Docente Asesor.",
      "Concepto de evaluación favorable de la propuesta emitido por el evaluador asignado (formato FDE 202).",
      "Bitácora y reporte continuo de asesorías a estudiantes en formato institucional FDE 053.",
      "Informe final de proyecto de grado (FDE 089) avalado por el asesor y aprobado por el evaluador (FDE 090).",
      "Aprobación del cumplimiento del requisito de grado por el Comité Curricular y el Consejo de Facultad.",
      "Entrega del informe final y Carta de Autorización en medio electrónico a la Dirección de Biblioteca (IGB 005) y registro en SIA."
    ],
    pasosProceso: [
      "1. Banco de Ideas y Contacto: Seleccionar idea del banco del departamento o presentar idea propia concertada con un docente asesor.",
      "2. Radicación de Propuesta (FDE 088): Elaborar la propuesta formal en formato FDE 088 firmada con aval del docente asesor y radicarla en el departamento.",
      "3. Asignación y Evaluación (FDE 202): La Comisión de Trabajos de Grado asigna un docente evaluador, quien califica la propuesta en el formato FDE 202 (aprobada, modificaciones menores/mayores o rechazo).",
      "4. Desarrollo del Proyecto (FDE 053): Ejecución técnica del proyecto bajo acompañamiento del asesor, registrando las asesorías en el formato FDE 053.",
      "5. Informe Final y Evaluación (FDE 089 / FDE 090): Radicación del informe final FDE 089 avalado por el asesor; el evaluador asignado emite concepto con el formato FDE 090.",
      "6. Aprobación de Facultad y SIA: El Comité Curricular recomienda la aprobación al Consejo de Facultad; una vez aprobado, la auxiliar del departamento registra el requisito en el SIA y se remite a Biblioteca (IGB 005)."
    ],
    requisitoClave:
      "Propuesta FDE 088 avalada por el Asesor, concepto favorable FDE 202 del evaluador e informe final FDE 089 con concepto aprobatorio FDE 090.",
    documentosRequeridos: [
      "FDE 088 — Propuesta de Trabajo de Grado con aval y firma del Docente Asesor",
      "Certificado de calificaciones o kardex oficial (mínimo 70% de créditos aprobados)",
      "FDE 053 — Reporte de asesorías a estudiantes durante el desarrollo",
      "FDE 089 — Informe final de Trabajo de Grado Facultad de Ingenierías",
      "Carta de Autorización de divulgación en repositorio de biblioteca (IGB 005)"
    ],
    entregablesFinales:
      "Informe final consolidado en formato FDE 089 con aval del asesor, producto tecnológico o software desplegado si aplica, concepto aprobatorio del evaluador en formato FDE 090 y paz y salvo de entrega a biblioteca en repositorio SIA (IGB 005).",
    criteriosEvaluacion:
      "Evaluación técnica y metodológica por el docente evaluador asignado mediante formato FDE 090. Aprobación formal por Comité Curricular y Consejo de Facultad de Ingenierías.",
    responsableAprobacion:
      "Docente Evaluador Asignado, Comisión de Trabajos de Grado, Comité Curricular y Consejo de Facultad",
    requiereSustentacion:
      "Evaluación técnica y metodológica del informe final FDE 089 por un docente evaluador asignado (formato FDE 090). No exige defensa oral ante terna de jurados."
  },
  {
    codigo: "PRACTICAS_PROFESIONALES",
    icono: "💼",
    nombre: "Prácticas Profesionales",
    subtitulo: "Inmersión y Formación Aplicada en Entorno Laboral o Social",
    color: "blue",
    normaOficial: "Resolución 562 de 2026 (Art. 10) · Procedimiento PDEH 008",
    exclusivoNivel: "AMBOS",
    integrantesMax: 1,
    creditosMinimos: "70%",
    permiteEstudiantesNoActivos: false,
    descripcion:
      "Modalidad formativa en la cual el estudiante aplica sus conocimientos para la solución de problemas organizacionales concretos o apoyo al mejoramiento en áreas del entorno productivo, social o internacional, mediante contrato de aprendizaje, convenio interinstitucional, práctica social o práctica internacional.",
    queEs:
      "Práctica empresarial (hasta 6 meses) en una entidad legalmente constituida. Admite 4 opciones: Aprendiz SENA, Práctica Empresarial por Convenio, Práctica Social (ONGs o entidades de desarrollo) o Práctica Internacional. Requiere acreditar el curso de preparación para prácticas y formalizar el convenio o contrato antes de iniciar.",
    perfilEstudiante:
      "Estudiantes de tecnología o ingeniería que deseen vincularse a la dinámica productiva o social, resolver retos corporativos y adquirir experiencia laboral real.",
    condicionesPrevias:
      "Mínimo 70% de créditos aprobados, matrícula académica y acreditación obligatoria del curso de preparación para prácticas de la Oficina de Prácticas Profesionales.",
    requisitosParaGraduarse: [
      "Acreditar el curso de preparación para prácticas profesionales del ITM.",
      "Registro de inscripción en formato FDE 073 y formalización mediante convenio o contrato de aprendizaje.",
      "Diligenciamiento de Guías de seguimiento: Guía 1 (FDE 074), Guía 2 (FDE 075), Guía 3 (FDE 076) y Guía 4 (FDE 077).",
      "Visita de seguimiento a la empresa por parte del asesor o coordinador de prácticas.",
      "Informe final de sistematización de la práctica (FDE 089) avalado por el asesor institucional.",
      "Concepto favorable del Comité de Trabajo de Grado y Prácticas y aprobación formal del Consejo de Facultad."
    ],
    pasosProceso: [
      "1. Curso de Preparación y Hoja de Vida: Acreditar curso de preparación y radicar hoja de vida en formato FDE 071 ante la Oficina de Prácticas.",
      "2. Postulación e Inscripción (FDE 073): Remisión a empresa, notificación de selección y registro en formato FDE 073 con oficio de presentación FG 001.",
      "3. Formalización de la Práctica (FDE 074 / FDE 006): Diligenciamiento de funciones en formato FDE 074 y convenio interinstitucional FDE 006.",
      "4. Seguimiento y Guías de Evaluación: Entrega trimestral de las guías de evaluación FDE 074 a FDE 077 y realización de visita de seguimiento a la empresa.",
      "5. Informe Final de Sistematización (FDE 089): El estudiante presenta el informe FDE 089 avalado por su asesor de práctica.",
      "6. Aprobación en Consejo de Facultad y SIA: Recomendación del Comité de Prácticas mediante acta FG 002 y aprobación por Consejo de Facultad (FG 005) para registro en SIA."
    ],
    requisitoClave:
      "Convenio interinstitucional o contrato de aprendizaje formalizado, cumplimiento de las 4 guías de seguimiento (FDE 074-077) e informe final FDE 089 aprobado.",
    documentosRequeridos: [
      "FDE 071 — Hoja de vida del estudiante de prácticas",
      "FDE 073 — Registro de inscripción a prácticas profesionales",
      "FDE 074 a FDE 077 — Guías 1 a 4 de funciones, seguimiento y evaluación de desempeño",
      "FDE 089 — Informe final de sistematización de la experiencia de práctica",
      "FGB 019 — Carta de autorización de divulgación (IGB 005)"
    ],
    entregablesFinales:
      "Guías de evaluación empresarial suscritas (FDE 074 a FDE 077), informe final de sistematización FDE 089 con concepto aprobatorio del asesor, memorando de Consejo de Facultad y registro en SIA.",
    criteriosEvaluacion:
      "Evaluación del desempeño en la empresa (guías 1 a 4), visitas de seguimiento del asesor y valoración del informe de sistematización FDE 089.",
    responsableAprobacion:
      "Coordinación de Prácticas Profesionales, Asesor Institucional, Comité de Prácticas y Consejo de Facultad",
    requiereSustentacion:
      "No requiere sustentación con jurados; cierre y aprobación condicionados al informe final de sistematización FDE 089 y evaluación empresarial aprobatoria."
  },
  {
    codigo: "EMPRENDIMIENTO",
    icono: "🚀",
    nombre: "Emprendimiento",
    subtitulo: "Plan de Negocio y Puesta en Marcha con el CTIC (1 a 3 estudiantes)",
    color: "emerald",
    normaOficial: "Resolución 562 de 2026 (Art. 11) · Procedimiento PDEH 024",
    exclusivoNivel: "AMBOS",
    integrantesMax: 3,
    creditosMinimos: "70%",
    permiteEstudiantesNoActivos: false,
    descripcion:
      "Modalidad que permite a equipos de 1 a 3 estudiantes incorporar capacidades para identificar oportunidades de negocio en contextos globales, modelar negocios y construir planes de negocio para la puesta en marcha de su iniciativa empresarial o proyecto de impacto, bajo la dirección del Centro de Emprendimiento (CTIC) del ITM.",
    queEs:
      "El estudiante o equipo somete su idea a la convocatoria institucional 'Atrévete a Emprender'. El CTIC define la ruta de trabajo (FGN 049), asigna un asesor y suscribe el acta de confidencialidad y compromiso (FGN 045). Se desarrollan el Modelo de Negocio, el Plan de Negocio y la Hoja de Ruta para la puesta en marcha, sustentando ante el Comité de Innovación o equipo evaluador del CTIC.",
    perfilEstudiante:
      "Estudiantes con perfil innovador, visión comercial y liderazgo que deseen estructurar su propia empresa de base tecnológica o iniciativa productiva sostenible.",
    condicionesPrevias:
      "Tener aprobado al menos el 70% de créditos del plan de estudios y ser seleccionado en la convocatoria 'Atrévete a Emprender' del CTIC.",
    requisitosParaGraduarse: [
      "Selección y ruta de trabajo formal en el CTIC (registro FGN 049).",
      "Suscripción del acta de confidencialidad y compromiso FGN 045 y plan de intervención FGN 054.",
      "Reporte periódico de asesorías de emprendimiento (FGN 047 y FDE 053).",
      "Consolidación de los productos: Modelo de Negocio, Plan de Negocio y Hoja de Ruta de puesta en marcha.",
      "Sustentación aprobatoria ante el Comité de Innovación / CTIC con formato de evaluación FGN 048.",
      "Recomendación del CTIC al Departamento y aprobación formal por el Consejo de Facultad de Ingenierías."
    ],
    pasosProceso: [
      "1. Convocatoria Atrévete a Emprender: Someter la idea a través del enlace institucional del CTIC antes de iniciar el semestre.",
      "2. Definición de Ruta y Asignación de Asesor: El CTIC evalúa la madurez de la idea (FGN 049) y asigna un asesor, firmando el acta FGN 045 y plan FGN 054.",
      "3. Aval del Departamento: El Comité de Trabajos de Grado del Departamento conceptúa sobre la pertinencia (FG 002).",
      "4. Desarrollo de la Iniciativa: Elaboración del Modelo de Negocio, Plan de Negocio y Hoja de Ruta con bitácora de asesorías FGN 047 y FDE 053.",
      "5. Sustentación ante el CTIC (FGN 048): Presentación ante el Comité de Innovación o jurados designados por el CTIC, quienes evalúan mediante el formato FGN 048.",
      "6. Aprobación y Registro: El CTIC remite memorando de recomendación (FG 005) al Departamento para aprobación del Consejo de Facultad y registro en SIA."
    ],
    requisitoClave:
      "Acompañamiento formal del CTIC, Modelo de Negocio, Plan de Negocio, Hoja de Ruta y sustentación aprobada en formato FGN 048.",
    documentosRequeridos: [
      "FGN 049 — Registro y trazabilidad de convocatoria 'Atrévete a Emprender'",
      "FGN 045 — Acta de confidencialidad y compromiso con el CTIC",
      "FGN 054 — Plan personalizado de intervención CTEI",
      "FGN 046 / FGN 047 — Registro de idea de negocio y actas de asesoría",
      "Documento de Modelo de Negocio, Plan de Negocio y Hoja de Ruta"
    ],
    entregablesFinales:
      "Modelo de Negocio, Plan de Negocio integral, Hoja de Ruta para la puesta en marcha, evaluación favorable en formato FGN 048 expedida por el CTIC y memorando de aprobación de Consejo de Facultad.",
    criteriosEvaluacion:
      "Evaluación técnica, viabilidad de mercado y modelo financiero a cargo del Comité de Innovación / CTIC mediante formato FGN 048.",
    responsableAprobacion:
      "Centro de Emprendimiento e Innovación (CTIC), Comité de Trabajos de Grado y Consejo de Facultad",
    requiereSustentacion:
      "Sí. Sustentación obligatoria ante el Comité de Innovación o equipo evaluador designado por el CTIC (formato oficial FGN 048)."
  },
  {
    codigo: "PRODUCTO_LABORATORIO",
    icono: "🧪",
    nombre: "Producto en Talleres o Laboratorios",
    subtitulo: "Desarrollo de Valor Agregado en Talleres o Laboratorios (1 a 3 estudiantes)",
    color: "rose",
    normaOficial: "Resolución 562 de 2026 (Art. 12) · Procedimiento PDEH 028",
    exclusivoNivel: "AMBOS",
    integrantesMax: 3,
    creditosMinimos: "70%",
    permiteEstudiantesNoActivos: false,
    descripcion:
      "Resultado de una actividad académica y formativa de 1 a 3 estudiantes a través de la generación de un valor agregado (prototipo físico, banco experimental, mejora de procesos de enseñanza o apoyo a líneas de investigación) coordinado por 1 o máximo 2 docentes asesores dentro de los laboratorios o talleres de la institución.",
    queEs:
      "El estudiante o equipo desarrolla un prototipo o dispositivo con recurso instalado en talleres o laboratorios de docencia o investigación del ITM. Requiere el visto bueno del laboratorista y del jefe de laboratorios (o líder de laboratorio de investigación). La propuesta se formaliza en el formato FDE 201 y el informe final en FDE 089 con registro de horas (FDE 146). No constituye relación laboral ni contrato de aprendizaje.",
    perfilEstudiante:
      "Estudiantes de tecnología o ingeniería con altas competencias de taller, instrumentación, experimentación, electrónica, manufactura o materiales.",
    condicionesPrevias:
      "Mínimo 70% de créditos aprobados y visto bueno previo de la Jefatura de Laboratorios o líder del laboratorio de investigación.",
    requisitosParaGraduarse: [
      "Propuesta en formato FDE 201 con visto bueno del laboratorista y jefe de laboratorios (o líder de I+D).",
      "Evaluación favorable de la propuesta por el Comité de Trabajos de Grado (FDE 203).",
      "Desarrollo del producto con reporte de asesorías (FDE 053) y registro de horas y actividades (FDE 146).",
      "Informe final de trabajo de grado en formato institucional FDE 089 avalado por el asesor.",
      "Evaluación del informe final por un evaluador asignado mediante formato FDE 090.",
      "Aprobación del Consejo de Facultad y entrega de memoria técnica en biblioteca (IGB 005) para registro en SIA."
    ],
    pasosProceso: [
      "1. Selección de Idea de Laboratorio: Escoger tema del banco de ideas del departamento o coordinar con la Jefatura de Laboratorios.",
      "2. Propuesta con Visto Bueno (FDE 201): Elaborar propuesta en formato FDE 201 firmada por asesor y con visto bueno del jefe de laboratorios o líder de investigación.",
      "3. Evaluación de Propuesta (FDE 203): El Comité de Trabajos de Grado conceptúa y evalúa la pertinencia técnica con el formato FDE 203.",
      "4. Ejecución en Laboratorio (FDE 146 / FDE 053): Construcción del prototipo o banco registrando asesorías (FDE 053) y cumplimiento de horas en formato FDE 146.",
      "5. Informe Final (FDE 089) y Evaluación (FDE 090): Radicación del informe final FDE 089 y evaluación por el docente evaluador asignado (FDE 090).",
      "6. Aprobación y Depósito: El Comité Curricular recomienda al Consejo de Facultad; aprobación e ingreso al SIA con depósito en biblioteca (IGB 005)."
    ],
    requisitoClave:
      "Visto bueno formal del Jefe de Laboratorios o líder de investigación en la propuesta FDE 201 y valor agregado tangible con registro de horas FDE 146.",
    documentosRequeridos: [
      "FDE 201 — Propuesta de Producto de Laboratorio con visto bueno de la Jefatura de Laboratorios",
      "FDE 146 — Registro de actividades y cumplimiento de horas en laboratorio",
      "FDE 053 — Reporte de asesorías a estudiantes",
      "FDE 089 — Informe final de Trabajo de Grado Facultad de Ingenierías",
      "Carta de Autorización de divulgación en repositorio institucional (IGB 005)"
    ],
    entregablesFinales:
      "Prototipo o dispositivo de laboratorio operativo con valor agregado demostrado, registro de horas FDE 146, informe final FDE 089 aprobado por el evaluador (FDE 090) y registro en SIA.",
    criteriosEvaluacion:
      "Valor agregado pedagógico o investigativo generado, operatividad del producto, cumplimiento de horas FDE 146 y calificación del informe final mediante FDE 090.",
    responsableAprobacion:
      "Jefe de Laboratorios / Líder de I+D, Docente Evaluador Asignado, Comité de Trabajos de Grado y Consejo de Facultad",
    requiereSustentacion:
      "Evaluación técnica y operativa del informe final y del prototipo mediante formato FDE 090 por el docente evaluador asignado."
  },
  {
    codigo: "PRODUCTO_INVESTIGACION",
    icono: "🔬",
    nombre: "Producto de Investigación",
    subtitulo: "Publicación Indexada, Patente o Desarrollo I+D+i (Activo o No Activo)",
    color: "amber",
    normaOficial: "Resolución 562 de 2026 (Art. 13) · Procedimiento PDEH 027",
    exclusivoNivel: "AMBOS",
    integrantesMax: 3,
    creditosMinimos: "70%",
    permiteEstudiantesNoActivos: true,
    descripcion:
      "Productos de investigación derivados de la participación en un grupo de investigación, semillero o realizados por cuenta propia con apoyo de un docente investigador ITM, que cumplan con los criterios de existencia del modelo vigente de medición de Minciencias.",
    queEs:
      "Aplica para estudiantes activos o NO activos con mínimo 70% de créditos. El producto debe estar avalado por Minciencias: artículo en revista indexada, libro o capítulo de libro de investigación, ponencia en evento científico especializado, diseño industrial, circuito integrado, software con registro, planta piloto, prototipo industrial o patente obtenida/solicitada. Requiere registro en CVLAC del estudiante y asesor acompañante del ITM.",
    perfilEstudiante:
      "Estudiantes o egresados no graduados con trayectoria en semilleros, grupos de I+D o proyectos científicos que hayan generado productos reconocidos por Minciencias.",
    condicionesPrevias:
      "Haber aprobado al menos el 70% de los créditos del plan de estudios. NO requiere ser estudiante activo (Res. 562 Art. 2 Parágrafo 1).",
    requisitosParaGraduarse: [
      "Producto de investigación categorizado según modelo vigente de Minciencias.",
      "Registro del producto en la plataforma CVLAC del estudiante y del docente asesor acompañante del ITM.",
      "Carta del asesor acompañante al Comité Curricular avalando el aporte técnico y metodológico del estudiante.",
      "Concepto de pertinencia favorable emitido por el Comité de Trabajos de Grado (acta FG 002).",
      "Aprobación formal del requisito de grado por el Consejo de Facultad de Ingenierías y registro en SIA."
    ],
    pasosProceso: [
      "1. Presentación del Producto: El estudiante envía el producto junto con los comprobantes de existencia Minciencias y registro en CVLAC al correo del departamento.",
      "2. Aval del Asesor Acompañante: El docente investigador ITM remite carta avalando el aporte técnico del estudiante (puede recomendar mención honorífica).",
      "3. Concepto del Comité (FG 002): El Comité de Trabajos de Grado conceptúa sobre la pertinencia del producto con base en el listado oficial de Minciencias.",
      "4. Notificación: Notificación del concepto aprobatorio al estudiante por correo electrónico FG 017.",
      "5. Aprobación en Consejo de Facultad: El Comité recomienda al Consejo de Facultad el cumplimiento del requisito de grado mediante memorando FG 005.",
      "6. Registro en SIA: La auxiliar del departamento registra el requisito de grado en la hoja de vida académica del SIA."
    ],
    requisitoClave:
      "Producto categorizado en Minciencias, registro en CVLAC de estudiante y asesor, y aval formal del docente investigador acompañante.",
    documentosRequeridos: [
      "Copia del producto de investigación (artículo, libro, ponencia, patente o software)",
      "Comprobante de existencia y categorización según modelo de Minciencias",
      "Comprobante de registro del producto en CVLAC del estudiante y docente asesor",
      "Carta del docente asesor acompañante certificando el aporte técnico del estudiante",
      "Certificado de calificaciones (mínimo 70% de créditos aprobados)"
    ],
    entregablesFinales:
      "Evidencia oficial de publicación, patente o registro Minciencias, comprobante CVLAC, concepto del asesor acompañante y acta de aprobación del Consejo de Facultad.",
    criteriosEvaluacion:
      "Criterios de existencia y calidad del modelo Minciencias, pertinencia con el programa y concepto favorable del Comité de Trabajos de Grado.",
    responsableAprobacion:
      "Docente Asesor Acompañante, Comité de Trabajos de Grado y Consejo de Facultad de Ingenierías",
    requiereSustentacion:
      "No requiere sustentación oral con jurados; validación documental y homologación por Comité de Trabajos de Grado y Consejo de Facultad."
  },
  {
    codigo: "PASANTIA",
    icono: "🌐",
    nombre: "Pasantía",
    subtitulo: "Apoyo en Investigación como Asistente en Laboratorio o Entidad Receptora",
    color: "cyan",
    normaOficial: "Resolución 562 de 2026 (Art. 14) · Procedimiento PDEH 025",
    exclusivoNivel: "AMBOS",
    integrantesMax: 1,
    creditosMinimos: "70%",
    permiteEstudiantesNoActivos: false,
    descripcion:
      "Trabajo de apoyo en investigación que adelanta un estudiante individual en calidad de asistente en un área afín a su programa académico, dentro del marco de un proyecto de investigación en un grupo, centro, instituto o área operativa de un laboratorio u organización, bajo tutoría externa e interna.",
    queEs:
      "El estudiante se vincula como asistente a un proyecto de investigación dentro o fuera del ITM. Si es fuera, cuenta con un asesor externo en la entidad receptora y un asesor interno ITM. Radica la propuesta en formato FDE 201 acompañada de la carta de invitación, cumple las actividades y entrega el informe final FDE 089 evaluado con FDE 090.",
    perfilEstudiante:
      "Estudiantes de tecnología o ingeniería interesados en estancias científicas, desarrollo en centros de I+D o laboratorios de investigación nacional o internacional.",
    condicionesPrevias:
      "Mínimo 70% de créditos aprobados, carta de invitación de la entidad receptora y aval de movilidad institucional si se realiza fuera del ITM.",
    requisitosParaGraduarse: [
      "Propuesta de pasantía en formato FDE 201 con carta de invitación oficial de la entidad receptora.",
      "Concepto favorable de pertinencia del Comité de Trabajos de Grado (formato FDE 203).",
      "Aprobación de la movilidad institucional (si la pasantía es externa).",
      "Desarrollo de las actividades de asistencia con reporte de asesorías en formato FDE 053.",
      "Informe final de pasantía en formato FDE 089 avalado por el asesor institucional y tutor externo.",
      "Evaluación del informe final por docente evaluador asignado mediante formato FDE 090.",
      "Aprobación del Consejo de Facultad y registro en SIA con depósito en biblioteca (IGB 005)."
    ],
    pasosProceso: [
      "1. Concertación e Invitación: Identificar la pasantía y obtener carta de invitación oficial del centro, laboratorio u organización receptora.",
      "2. Propuesta FDE 201: Elaborar la propuesta en formato FDE 201 avalada por el asesor y radicarla en el departamento con la carta de invitación.",
      "3. Evaluación de Propuesta (FDE 203): El Comité de Trabajos de Grado evalúa la pertinencia en formato FDE 203 y notifica la aprobación.",
      "4. Ejecución de la Pasantía: Realización de actividades de asistencia y registro de asesorías en formato institucional FDE 053.",
      "5. Informe Final (FDE 089) y Evaluación (FDE 090): Radicación del informe final FDE 089 y calificación por el docente evaluador asignado con formato FDE 090.",
      "6. Aprobación y Registro: El Comité Curricular recomienda la aprobación al Consejo de Facultad (FG 005) y se registra en SIA con entrega a biblioteca (IGB 005)."
    ],
    requisitoClave:
      "Carta de invitación oficial con tutor asignado, propuesta FDE 201 evaluada con FDE 203 e informe final FDE 089 calificado con FDE 090.",
    documentosRequeridos: [
      "FDE 201 — Propuesta de Trabajo de Grado con carta de invitación de la entidad receptora",
      "Carta oficial de invitación o aceptación de la institución/laboratorio receptor",
      "FDE 053 — Reporte de asesorías a estudiantes",
      "FDE 089 — Informe final de Trabajo de Grado Facultad de Ingenierías",
      "Carta de Autorización de divulgación en repositorio institucional (IGB 005)"
    ],
    entregablesFinales:
      "Informe final FDE 089 con concepto de cumplimiento expedido por el tutor externo y el asesor ITM, evaluación FDE 090 del evaluador asignado y constancia de depósito en SIA.",
    criteriosEvaluacion:
      "Cumplimiento del plan de trabajo como asistente, concepto del asesor externo y calificación del informe final mediante formato FDE 090.",
    responsableAprobacion:
      "Asesor Interno ITM, Tutor Externo, Docente Evaluador Asignado, Comité de Trabajos de Grado y Consejo de Facultad",
    requiereSustentacion:
      "Evaluación del informe final FDE 089 mediante formato FDE 090 por el docente evaluador asignado. No exige sustentación oral con jurados."
  },
  {
    codigo: "RECONOCIMIENTO_LABORAL",
    icono: "🏆",
    nombre: "Reconocimiento Laboral",
    subtitulo: "Homologación por Ejercicio Profesional (Exclusivo Nivel Tecnología)",
    color: "indigo",
    normaOficial: "Resolución 562 de 2026 (Art. 15) · Procedimiento PDEH 029",
    exclusivoNivel: "TECNOLOGIA",
    integrantesMax: 1,
    creditosMinimos: "70%",
    permiteEstudiantesNoActivos: true,
    descripcion:
      "Modalidad válida EXCLUSIVAMENTE para programas de nivel de TECNOLOGÍA. Reconoce como cumplimiento de trabajo de grado el ejercicio de competencias laborales propias del perfil del programa en una empresa legalmente constituida (antigüedad mínima de 1 año). Prohibida expresamente para nivel de Ingeniería.",
    queEs:
      "Un estudiante de Tecnología (activo o NO activo) que labora en labores afines a su perfil tecnológico solicita el estudio de validez adjuntando su Certificado Laboral (mínimo 1 año) y el Formato de Competencias firmado por su jefe inmediato. La Comisión conceptúa pertinencia y asigna un docente evaluador, quien realiza una VISITA PRESENCIAL a la empresa para contrastar las funciones in situ (formatos FDE 095/096/097). No tiene tesis ni sustentación con jurados.",
    perfilEstudiante:
      "Estudiantes o egresados no graduados de programas TECNOLÓGICOS del ITM que lleven al menos 1 año laborando formalmente en funciones propias de su disciplina tecnológica.",
    condicionesPrevias:
      "Pertenecer a un programa de nivel de TECNOLOGÍA. Acreditar mínimo 1 año continuo o discontinuo laborando en el área afín en paralelo con los estudios. No aplica si el estudiante es empleado y empleador a la vez.",
    requisitosParaGraduarse: [
      "Ser estudiante o egresado de un programa del nivel de TECNOLOGÍA (no aplica para ingenierías).",
      "Certificado laboral original en papel membreteado con cargo, salario, fechas y manual detallado de funciones.",
      "Formato de Competencias debidamente diligenciado y firmado por el estudiante y su jefe inmediato.",
      "Concepto favorable de pertinencia de la Comisión de Trabajos de Grado (acta FG 002).",
      "Visita laboral presencial del docente evaluador a la empresa para verificar competencias (formato FDE 095/096/097).",
      "Recomendación del Comité Curricular y aprobación formal del Consejo de Facultad de Ingenierías para registro en SIA."
    ],
    pasosProceso: [
      "1. Solicitud Documental: Enviar al correo del departamento el Formato de Competencias diligenciado y el Certificado Laboral membreteado (antigüedad ≥ 1 año y funciones de tecnología).",
      "2. Concepto de Pertinencia (FG 002): La Comisión de Trabajos de Grado verifica que el estudiante sea de Tecnología y que las funciones sean correlativas a su formación.",
      "3. Asignación de Evaluador: El Jefe de Departamento asigna al docente evaluador y le traslada los documentos laborales.",
      "4. Visita Laboral a la Empresa: El docente evaluador visita la empresa y contrasta en el puesto de trabajo las competencias reales, diligenciando el formato FDE 095, 096 o 097.",
      "5. Concepto de Evaluación: La Comisión de Trabajos de Grado notifica el resultado de la evaluación al estudiante por correo electrónico FG 017.",
      "6. Aprobación y Registro en SIA: El Comité Curricular recomienda la aprobación al Consejo de Facultad; aprobado el memorando FG 005, la auxiliar registra el requisito en el SIA."
    ],
    requisitoClave:
      "Exclusividad tecnológica, certificado laboral ≥ 1 año con funciones técnicas y visita presencial a la empresa aprobada por el evaluador (FDE 095/096/097).",
    documentosRequeridos: [
      "Certificado laboral oficial en papel membreteado (periodo laborado ≥ 1 año, cargo y desglose de funciones)",
      "Formato de Competencias firmado por el estudiante y su jefe inmediato empresarial",
      "Certificado de calificaciones que acredite el cumplimiento de créditos del ciclo tecnológico"
    ],
    entregablesFinales:
      "Formato de Competencias firmado, certificado laboral verificado, acta de visita laboral FDE 095/096/097 emitida por el evaluador y memorando de aprobación de Consejo de Facultad.",
    criteriosEvaluacion:
      "Contraste presencial directo de las actividades laborales con las competencias del perfil profesional del programa de tecnología (formato FDE 095, 096 o 097).",
    responsableAprobacion:
      "Comisión de Trabajos de Grado, Docente Evaluador (visita empresarial), Comité Curricular y Consejo de Facultad",
    requiereSustentacion:
      "No tiene sustentación oral. Se valida mediante visita presencial del evaluador a la empresa y verificación técnica de competencias laborales in situ."
  },
  {
    codigo: "CERTIFICACION",
    icono: "📜",
    nombre: "Certificación",
    subtitulo: "Acreditación Técnica Nacional o Internacional (Activo o No Activo)",
    color: "teal",
    normaOficial: "Resolución 562 de 2026 (Art. 16) · Procedimiento PDEH 021",
    exclusivoNivel: "AMBOS",
    integrantesMax: 1,
    creditosMinimos: "70%",
    permiteEstudiantesNoActivos: true,
    descripcion:
      "Obtención de una certificación nacional o internacional por la cual el futuro tecnólogo o ingeniero garantiza su experticia y resultados de aprendizaje en un área disciplinar mediante examen oficial reconocido, o mediante diplomados avalados del ITM.",
    queEs:
      "Aplica para estudiantes activos o NO activos con mínimo 70% de créditos. La certificación debe haber sido obtenida en los últimos dos (2) años. Puede ser interna (del banco de certificaciones avalado por Consejo de Facultad o diplomado ITM) o externa (requiere consulta y aprobación de pertinencia por el Comité de Trabajos de Grado).",
    perfilEstudiante:
      "Estudiantes o egresados no graduados que cuenten con credenciales técnicas de alta demanda en la industria tecnológica emitidas por organismos certificadores.",
    condicionesPrevias:
      "Mínimo 70% de créditos aprobados. La certificación debe haber sido obtenida en los últimos dos (2) años. NO requiere ser estudiante activo.",
    requisitosParaGraduarse: [
      "Certificado oficial emitido por organismo acreditado con antigüedad máxima de dos (2) años.",
      "Correspondencia con el banco de certificaciones avalado por Consejo de Facultad o concepto favorable de pertinencia.",
      "Para diplomados ITM: examen correspondiente aprobado y listado oficial remitido por el docente coordinador.",
      "Concepto favorable del Comité Curricular (acta FG 002) y del Comité de Trabajos de Grado.",
      "Aprobación formal del Consejo de Facultad de Ingenierías (memorando FG 005) y registro en SIA."
    ],
    pasosProceso: [
      "1. Consulta o Solicitud de Validez: Verificar si la certificación está en el banco aprobado o enviar documentación al departamento (entidad, contenido, costos y examen).",
      "2. Vía Diplomado ITM (si aplica): El docente coordinador identifica los estudiantes, aplica evaluación y remite listado de aprobados en Excel al departamento.",
      "3. Concepto del Comité Curricular (FG 002): El Comité conceptúa sobre la pertinencia con base en el perfil profesional del programa.",
      "4. Aval del Comité de Trabajos de Grado: La Comisión de Trabajos de Grado da el aval formal a la certificación y notifica al estudiante.",
      "5. Aprobación en Consejo de Facultad: El Comité Curricular recomienda la aprobación al Consejo de Facultad (memorando FG 005).",
      "6. Registro en SIA: La auxiliar del departamento registra el trabajo de grado en el SIA (hoja de vida académica)."
    ],
    requisitoClave:
      "Certificado oficial con fecha no superior a 2 años, pertenencia al banco aprobado o concepto favorable del Comité Curricular.",
    documentosRequeridos: [
      "Certificado oficial emitido por el organismo certificador (vigencia ≤ 2 años)",
      "Ficha técnica con entidad certificadora, contenidos temáticos y tipo de evaluación",
      "Certificado de calificaciones (mínimo 70% de créditos aprobados)"
    ],
    entregablesFinales:
      "Certificado oficial internacional/nacional validado, acta de pertinencia del Comité Curricular FG 002 y memorando de aprobación de Consejo de Facultad registrado en SIA.",
    criteriosEvaluacion:
      "Autenticidad de la credencial, vigencia máxima de 2 años y pertinencia temática con los resultados de aprendizaje del programa académico.",
    responsableAprobacion:
      "Comité Curricular, Comité de Trabajos de Grado y Consejo de Facultad de Ingenierías",
    requiereSustentacion:
      "No requiere sustentación oral; convalidación técnica y administrativa directa ante el Comité Curricular y Consejo de Facultad."
  },
  {
    codigo: "CURSOS_POSGRADO",
    icono: "📚",
    nombre: "Cursos de Posgrado",
    subtitulo: "Articulación Coterminal (Exclusivo Nivel Profesional / Ingeniería)",
    color: "fuchsia",
    normaOficial: "Resolución 562 de 2026 (Art. 17) · Procedimiento PDEH 022",
    exclusivoNivel: "INGENIERIA",
    integrantesMax: 1,
    creditosMinimos: "80%",
    permiteEstudiantesNoActivos: false,
    descripcion:
      "Modalidad válida EXCLUSIVAMENTE para estudiantes de nivel PROFESIONAL (Ingeniería) que tienen la posibilidad de matricular y aprobar un (1) curso de posgrado a nivel maestría o dos (2) a nivel especialización ofrecidos por el ITM.",
    queEs:
      "El estudiante de ingeniería con mínimo el 80% de créditos aprobados revisa la convocatoria intersemestral de la dependencia de Posgrados. Dirige una carta de solicitud al Consejo de Facultad, matricula las asignaturas asignadas, las cursa y las aprueba. Una vez aprobadas, solicita la verificación al Comité de Trabajos de Grado para que el Consejo de Facultad emita la aprobación como requisito de grado.",
    perfilEstudiante:
      "Estudiantes de último año de programas de INGENIERÍA con alto rendimiento académico que deseen proyectar su formación avanzada hacia especialización o maestría.",
    condicionesPrevias:
      "Pertenecer al nivel PROFESIONAL (Ingeniería). Contar con mínimo el 80% de créditos aprobados y/o cumplir la normativa vigente de posgrados del ITM.",
    requisitosParaGraduarse: [
      "Pertenecer a un programa de Ingeniería y contar con mínimo el 80% de créditos aprobados.",
      "Inscripción en la convocatoria de Posgrados y carta de solicitud dirigida al Consejo de Facultad.",
      "Matrícula formal y pago de créditos de posgrado en el periodo académico correspondiente.",
      "Aprobar un (1) curso a nivel maestría o dos (2) cursos a nivel especialización según la oferta oficial.",
      "Solicitud formal de verificación de aprobación enviada al Comité de Trabajos de Grado del Departamento.",
      "Aprobación del cumplimiento del requisito de grado por el Consejo de Facultad y registro en SIA."
    ],
    pasosProceso: [
      "1. Revisión de Convocatoria: Revisar la oferta de cursos de posgrado publicada intersemestralmente por la Oficina de Posgrados del ITM.",
      "2. Solicitud de Inscripción: Enviar carta de solicitud al Consejo de Facultad de Ingenierías según el cronograma de posgrados.",
      "3. Concepto de Pertinencia: El Comité de Trabajos de Grado revisa el cumplimiento de requisitos (80% créditos) y pertinencia con el programa.",
      "4. Matrícula y Cursado: El estudiante realiza el pago y matricula en el SIA las asignaturas de posgrado, cursándolas durante el semestre.",
      "5. Verificación de Aprobación: Tras aprobar el curso de maestría o los dos de especialización, el estudiante solicita la verificación por correo.",
      "6. Aprobación en Consejo de Facultad: El Comité de Trabajos de Grado recomienda la aprobación; el Consejo aprueba y la auxiliar registra en el SIA."
    ],
    requisitoClave:
      "Exclusividad en Ingeniería, mínimo 80% de créditos aprobados del pregrado y aprobación de 1 curso de maestría o 2 de especialización.",
    documentosRequeridos: [
      "Carta de solicitud de inscripción dirigida al Consejo de Facultad de Ingenierías",
      "Kardex oficial o certificado que acredite mínimo el 80% de créditos aprobados de pregrado",
      "Comprobante de matrícula y pago de créditos de posgrado en el SIA",
      "Certificado oficial de calificaciones de posgrado con materias aprobadas"
    ],
    entregablesFinales:
      "Certificado oficial de calificaciones de posgrado donde conste la aprobación del curso de maestría o dos de especialización, y memorando de aprobación de Consejo de Facultad.",
    criteriosEvaluacion:
      "Aprobación académica de los cursos de posgrado matriculados según los criterios de evaluación del programa de posgrados respectivo.",
    responsableAprobacion:
      "Oficina de Posgrados, Comité de Trabajos de Grado y Consejo de Facultad de Ingenierías",
    requiereSustentacion:
      "No requiere sustentación oral de pregrado; la aprobación de las asignaturas de posgrado convalida y cumple el requisito de grado."
  },
  {
    codigo: "INGENIERIA_GENTE",
    icono: "🤝",
    nombre: "Ingeniería para la Gente",
    subtitulo: "Proyección Social y Soluciones Comunitarias (1 a 3 estudiantes)",
    color: "orange",
    normaOficial: "Resolución 562 de 2026 (Art. 18) · Procedimiento PDEH 023",
    exclusivoNivel: "AMBOS",
    integrantesMax: 3,
    creditosMinimos: "70%",
    permiteEstudiantesNoActivos: false,
    descripcion:
      "Proyección del saber disciplinar que permite a equipos de 1 a 3 estudiantes de nivel tecnológico o profesional hacer de la problemática social el objeto de su ejercicio académico, prestando un servicio social a comunidades o sectores vulnerables mediante soluciones tecnológicas afines a su formación.",
    queEs:
      "De 1 a 3 estudiantes plantean un trabajo práctico de solución tecnológica para una comunidad en particular. Presentan la propuesta en formato FDE 088 avalada por un docente asesor. La propuesta es calificada por un evaluador (FDE 202). Desarrollan la solución con reporte FDE 053 y radican el informe final FDE 089 evaluado con FDE 090, beneficiando directamente a la población intervenida.",
    perfilEstudiante:
      "Estudiantes de tecnología o ingeniería con sensibilidad social, capacidad de trabajo en territorio y vocación de servicio a comunidades.",
    condicionesPrevias:
      "Mínimo 70% de créditos aprobados del plan de estudios y concertación de la problemática con la comunidad beneficiaria.",
    requisitosParaGraduarse: [
      "Propuesta en formato oficial FDE 088 avalada por el docente asesor con delimitación de la comunidad beneficiaria.",
      "Concepto favorable de evaluación de la propuesta en formato FDE 202 por el docente evaluador asignado.",
      "Desarrollo e implementación del trabajo práctico comunitario con registro de asesorías en formato FDE 053.",
      "Informe final de trabajo de grado en formato FDE 089 con evidencias del impacto social y comunitario.",
      "Evaluación favorable del informe final por el docente evaluador asignado mediante formato FDE 090.",
      "Aprobación del Comité Curricular y Consejo de Facultad de Ingenierías, con entrega en biblioteca (IGB 005) y registro en SIA."
    ],
    pasosProceso: [
      "1. Selección de Idea Comunitaria: Seleccionar idea del banco del departamento o proponer solución social concertada con un docente asesor.",
      "2. Propuesta FDE 088: Elaborar la propuesta formal en formato FDE 088 con aval firmado del asesor y radicarla ante el departamento.",
      "3. Asignación y Evaluación (FDE 202): La Comisión de Trabajos de Grado asigna evaluador, quien califica la propuesta en formato FDE 202.",
      "4. Desarrollo del Trabajo Práctico: Implementación de la solución tecnológica comunitaria registrando asesorías en formato institucional FDE 053.",
      "5. Informe Final (FDE 089) y Evaluación (FDE 090): Radicación del informe final FDE 089 avalado por asesor y evaluación con formato FDE 090.",
      "6. Aprobación y SIA: El Comité Curricular recomienda la aprobación al Consejo de Facultad; aprobado el memorando FG 005, se remite a biblioteca (IGB 005) y se registra en SIA."
    ],
    requisitoClave:
      "Propuesta FDE 088 comunitaria avalada, solución técnica implementada con impacto social comprobable e informe final FDE 089 aprobado con FDE 090.",
    documentosRequeridos: [
      "FDE 088 — Propuesta de Trabajo de Grado o Ingeniería para la Gente con aval del Asesor",
      "Carta de concertación o respaldo de la comunidad u organización social beneficiaria",
      "FDE 053 — Reporte de asesorías a estudiantes",
      "FDE 089 — Informe final de Trabajo de Grado Facultad de Ingenierías",
      "Carta de Autorización de divulgación en repositorio institucional (IGB 005)"
    ],
    entregablesFinales:
      "Solución tecnológica comunitaria implementada, informe final FDE 089 con evidencias fotográficas y testimoniales de impacto, concepto aprobatorio FDE 090 del evaluador y constancia de depósito en SIA.",
    criteriosEvaluacion:
      "Pertinencia social del problema abordado, calidad de la solución tecnológica entregada y evaluación técnica del informe final mediante formato FDE 090.",
    responsableAprobacion:
      "Docente Evaluador Asignado, Comisión de Trabajos de Grado, Comité Curricular y Consejo de Facultad de Ingenierías",
    requiereSustentacion:
      "Evaluación técnica y social del informe final FDE 089 por el docente evaluador asignado mediante formato FDE 090."
  }
];

export function obtenerInfoModalidad(nombre) {
  if (!nombre) return null;
  const normalizado = nombre.toLowerCase().trim();
  return (
    MODALIDADES_OFICIALES.find(
      (m) =>
        m.nombre.toLowerCase().trim() === normalizado ||
        m.codigo.toLowerCase().trim() === normalizado ||
        (normalizado === "trabajo de grado" && m.codigo === "TRABAJO_GRADO") ||
        (normalizado === "proyecto de grado" && m.codigo === "TRABAJO_GRADO")
    ) || {
      codigo: "GENERICA",
      icono: "📋",
      nombre: nombre,
      subtitulo: "Modalidad reglamentaria ITM",
      color: "blue",
      normaOficial: "Resolución 562 de 2026",
      exclusivoNivel: "AMBOS",
      integrantesMax: 3,
      creditosMinimos: "70%",
      permiteEstudiantesNoActivos: false,
      descripcion: "Modalidad reglamentaria de opción de grado en la Facultad de Ingenierías del ITM.",
      queEs: "Modalidad de grado reglamentada según acuerdos vigentes del Consejo de Facultad de Ingenierías.",
      perfilEstudiante: "Estudiantes del ITM que cumplen con los requisitos académicos correspondientes.",
      objetivo: "Cumplimiento del requisito de grado según la reglamentación académica vigente.",
      condicionesPrevias: "Cumplimiento de créditos y prerrequisitos del programa académico.",
      requisitosParaGraduarse: [
        "Aprobar la totalidad de créditos exigidos",
        "Radicar la documentación obligatoria institucional",
        "Obtener concepto favorable del evaluador o comité"
      ],
      pasosProceso: [
        "1. Radicación de la propuesta con documentos soporte",
        "2. Revisión y asignación por el Comité",
        "3. Ejecución del proyecto con asesor",
        "4. Evaluación y concepto final",
        "5. Aprobación en Consejo de Facultad y registro en SIA"
      ],
      requisitoClave: "Documentación estipulada según el reglamento académico institucional.",
      documentosRequeridos: ["Documentos soporte estipulados por el Comité de Grados"],
      entregablesFinales: "Informe final FDE 089 o memoria técnica aprobada.",
      criteriosEvaluacion: "Aprobación reglamentaria según el estatuto docente y estudiantil.",
      responsableAprobacion: "Comité de Trabajos de Grado y Consejo de Facultad",
      requiereSustentacion: "Según determine el procedimiento PDEH correspondiente."
    }
  );
}
