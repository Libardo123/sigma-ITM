/**
 * modalidades.js — Catálogo oficial de las 10 modalidades de opción de grado ITM.
 * Fuente de verdad institucional compartida entre páginas públicas, estudiante y comités.
 * Basado en la reglamentación académica y acuerdos de la Facultad de Ingenierías del ITM.
 */

export const MODALIDADES_OFICIALES = [
  {
    codigo: "TRABAJO_GRADO",
    icono: "🎓",
    nombre: "Trabajo de Grado",
    subtitulo: "Monografía o Proyecto de Investigación y Desarrollo Aplicado",
    color: "purple",
    descripcion:
      "Modalidad académica por excelencia que consiste en la formulación, desarrollo técnico, validación experimental y sustentación de una solución de ingeniería, software o monografía disciplinar orientada a resolver un problema real de la sociedad o la industria, o a generar nuevo conocimiento bajo la tutoría directa y continua de un Docente Asesor asignado por el Comité de Trabajos de Grado.",
    queEs:
      "El estudiante o equipo de estudiantes (máximo 2 personas según reglamento) plantea una propuesta formal de anteproyecto con justificación, formulación de objetivos, estado del arte, metodología estructurada y cronograma. Durante la etapa de ejecución, trabaja de la mano con su docente asesor asignado para desarrollar la solución técnica o investigativa, validar los resultados y redactar la monografía final en formato institucional con normas IEEE o APA.",
    perfilEstudiante:
      "Estudiantes con interés en el diseño de soluciones técnicas, desarrollo de software o hardware, modelado analítico o investigación aplicada, que deseen profundizar en su área de especialidad disciplinar con el acompañamiento de un profesor experto.",
    condicionesPrevias:
      "Mínimo el 80% de créditos del plan de estudios aprobados. Paz y salvo académico y de biblioteca.",
    requisitosParaGraduarse: [
      "Aprobar el 100% de las asignaturas y créditos de la malla curricular del programa.",
      "Contar con concepto de aprobación unánime del Docente Asesor sobre el documento y producto final.",
      "Someter la monografía empastada digital y el producto funcional ante dos (2) jurados evaluadores designados.",
      "Sustentar y aprobar públicamente la defensa del proyecto con una calificación igual o superior a 3.0 sobre 5.0.",
      "Entregar el paz y salvo de entrega final en biblioteca (depósito en repositorio institucional) y paz y salvos administrativos."
    ],
    pasosProceso: [
      "1. Radicación y Aval: Formular el anteproyecto en el formato institucional (CF-FDE-201) y radicarlo en SIGMA ITM con el paz y salvo de créditos (mínimo 80%) y la carta de aval del docente asesor propuesto.",
      "2. Aprobación del Comité: El Comité de Trabajos de Grado evalúa la viabilidad técnica y metodológica, emite concepto de aprobación y ratifica la asignación del Docente Asesor.",
      "3. Ejecución Técnica y Asesoría: Desarrollo del proyecto en interacción exclusiva con el docente asesor, cumpliendo el cronograma concertado y superando las revisiones de avance.",
      "4. Designación de Jurados: Tras el visto bueno final del asesor, el comité designa dos (2) jurados evaluadores expertos en el área disciplinar.",
      "5. Sustentación Pública y Grado: Sustentación oral ante la terna evaluadora. Obtenida la calificación aprobatoria (≥ 3.0) y los paz y salvos institucionales, se emite el certificado y acta de grado."
    ],
    requisitoClave:
      "Propuesta de anteproyecto formal (formato institucional CF-FDE-201) avalada por el docente asesor temático y metodológico.",
    documentosRequeridos: [
      "Propuesta de proyecto de grado (Anteproyecto con justificación, objetivos, estado del arte, metodología y cronograma)",
      "Certificado de paz y salvo académico o kardex oficial de calificaciones",
      "Carta de aceptación y visto bueno del docente asesor propuesto",
      "Carta de presentación formal dirigida al Comité de Trabajos de Grado"
    ],
    entregablesFinales:
      "Documento final empastado digital en formato institucional (normas IEEE/APA), producto tecnológico o aplicativo software funcional desplegado con código documentado y manuales (técnico y de usuario), y artículo científico o memoria técnica analítica.",
    criteriosEvaluacion:
      "Evaluación integral por dos jurados evaluadores considerando rigor metodológico (30%), solución técnica y funcionalidad del prototipo/software (40%), calidad del documento escrito (15%) y defensa oral en sustentación (15%). Calificación mínima aprobatoria: 3.0 / 5.0.",
    responsableAprobacion:
      "Docente Asesor Asignado y Comité de Trabajos de Grado de la Facultad de Ingenierías",
    requiereSustentacion:
      "Sí. Sustentación pública obligatoria de 30 minutos de exposición más sesión de preguntas ante dos (2) jurados evaluadores designados por el Comité."
  },
  {
    codigo: "PRACTICAS_PROFESIONALES",
    icono: "💼",
    nombre: "Prácticas Profesionales",
    subtitulo: "Inmersión y Formación Aplicada en Entorno Laboral",
    color: "blue",
    descripcion:
      "Modalidad formativa de inserción directa en el sector productivo, empresarial o gubernamental legalmente constituido, en la cual el estudiante se vincula mediante contrato de aprendizaje, convenio de práctica o pasantía remunerada/laboral para desempeñar funciones técnicas de ingeniería y resolver problemáticas empresariales reales vinculadas a su perfil de egreso.",
    queEs:
      "Es una inmersión laboral supervisada de mínimo 6 meses (o el número de horas reglamentarias del programa: 480 a 960 horas). El estudiante no solo ejecuta las tareas del cargo, sino que concerta un plan de trabajo con su jefe inmediato y un asesor de práctica del ITM, elaborando informes periódicos de avance y una memoria técnica final que evidencie el valor de ingeniería aportado a la organización.",
    perfilEstudiante:
      "Estudiantes que deseen ingresar al mercado laboral, adquirir experiencia profesional demostrable en empresas reconocidas, aplicar sus conocimientos en procesos corporativos y facilitar su inserción laboral inmediata tras la graduación.",
    condicionesPrevias:
      "Mínimo el 70% u 80% de créditos aprobados (según programa tecnológico o profesional). Autorización previa del Centro de Prácticas ITM y matrícula académica formal.",
    requisitosParaGraduarse: [
      "Completar la totalidad de horas reglamentarias de práctica empresarial acordadas en el convenio.",
      "Obtener calificación aprobatoria (igual o superior a 3.0 sobre 5.0) en la evaluación de desempeño suscrita por el jefe inmediato empresarial.",
      "Presentar y obtener el concepto de aprobación de los informes periódicos y de la Memoria Técnica Final por parte del asesor institucional del ITM.",
      "Paz y salvo laboral expedido por la empresa receptora y paz y salvo del Centro de Prácticas Profesionales ITM."
    ],
    pasosProceso: [
      "1. Taller Preparatorio y Validación de Créditos: Cumplir con el porcentaje de créditos exigido y asistir a la inducción obligatoria del Centro de Prácticas del ITM.",
      "2. Vinculación Empresarial y Radicación: Conseguir la plaza empresarial, formalizar la afiliación a la ARL a cargo de la empresa y radicar en SIGMA ITM la carta de aceptación, el plan de trabajo concertado y el certificado de matrícula.",
      "3. Desarrollo y Visitas de Seguimiento: Ejecutar la práctica en la empresa y atender las visitas y reuniones de seguimiento programadas por el asesor institucional del ITM.",
      "4. Informes y Evaluación Empresarial: Radicar informes periódicos y la evaluación oficial de competencias diligenciada y calificada por el jefe inmediato.",
      "5. Memoria Final y Cierre: Radicar la memoria técnica de práctica profesional aprobada para emisión del certificado de culminación de práctica de grado."
    ],
    requisitoClave:
      "Carta formal de aceptación emitida por la empresa (membrete, NIT y cargo), plan concertado de trabajo y constancia de vinculación activa a ARL.",
    documentosRequeridos: [
      "Carta de aceptación formal de la empresa (membrete, NIT y cargo a desempeñar)",
      "Plan de trabajo y cronograma de actividades aprobado por el jefe inmediato",
      "Certificado de matrícula académica vigente en el ITM",
      "Constancia de vinculación activa a ARL a cargo de la empresa"
    ],
    entregablesFinales:
      "Informes periódicos de gestión y seguimiento, formato oficial de evaluación de desempeño firmado por el jefe inmediato empresarial con calificación numérica y cualitativa, certificado de finalización de horas expedido por Gestión Humana, y Memoria Técnica final de práctica profesional.",
    criteriosEvaluacion:
      "Calificación ponderada compuesta por: 50% evaluación del jefe empresarial inmediato (competencias laborales, cumplimiento y resultados), 30% memoria técnica final y 20% seguimiento e informes periódicos del asesor institucional del ITM. Calificación mínima aprobatoria: 3.0 / 5.0.",
    responsableAprobacion:
      "Coordinación del Centro de Prácticas Profesionales ITM y Asesor Institucional",
    requiereSustentacion:
      "No requiere sustentación con jurados; cierre y aprobación condicionados a informe final y evaluación de desempeño empresarial aprobatoria (≥ 3.0)."
  },
  {
    codigo: "PASANTIA",
    icono: "🌐",
    nombre: "Pasantía",
    subtitulo: "Estancia Académica, Científica o de Cooperación Interinstitucional",
    color: "cyan",
    descripcion:
      "Estancia formativa en una universidad nacional o extranjera, centro de I+D+i o institución científica para adelantar actividades de transferencia tecnológica, entrenamiento investigativo especializado o cooperación técnica interinstitucional.",
    queEs:
      "El estudiante se traslada (o vincula en modalidad remota formal con convenio) a una institución de acogida para integrarse a un proyecto de investigación o desarrollo específico, bajo la tutoría conjunta de un tutor externo en la entidad receptora y un docente asesor en el ITM.",
    perfilEstudiante:
      "Estudiantes con alto rendimiento académico, interés en la movilidad nacional o internacional, vocación científica o tecnológica, y proyección hacia redes globales de innovación o estudios de posgrado.",
    condicionesPrevias:
      "Mínimo 75% de créditos cursados y aprobados. Promedio académico mínimo reglamentario (≥ 3.5 en estancia nacional, ≥ 3.8 en estancia internacional).",
    requisitosParaGraduarse: [
      "Cumplir con la totalidad de horas reglamentarias de la estancia en la institución de acogida (320 a 640 horas).",
      "Obtener certificado oficial de cumplimiento y evaluación de desempeño aprobatoria expedida por el tutor de la entidad receptora.",
      "Redactar y someter el informe técnico de transferencia de conocimientos y memoria descriptiva.",
      "Socializar los resultados alcanzados ante el Comité de Trabajos de Grado o comunidad académica del programa."
    ],
    pasosProceso: [
      "1. Concertación y Carta de Aceptación: Gestionar la estancia con la institución destino y obtener la carta de invitación/aceptación oficial con tutor asignado y plan de actividades.",
      "2. Radicación y Avales: Radicar en SIGMA ITM la propuesta de pasantía, el aval de la Dirección de Relaciones Internacionales/Programa y la póliza de seguro de cobertura médica y de movilidad.",
      "3. Ejecución de la Estancia: Realizar las actividades acordadas cumpliendo con el cronograma y el número reglamentario de horas exigidas.",
      "4. Certificación de la Institución Destino: Obtener el certificado oficial de cumplimiento y la evaluación de desempeño expedida por el tutor externo.",
      "5. Socialización e Informe Final: Presentar el informe técnico de transferencia y realizar la socialización académica ante el Comité de Trabajos de Grado."
    ],
    requisitoClave:
      "Convenio interinstitucional vigente o carta formal de invitación de la institución destino con asignación de tutor externo y plan de actividades.",
    documentosRequeridos: [
      "Carta de aceptación oficial de la institución receptora con especificación de tutor y fechas",
      "Plan concertado de pasantía y cronograma detallado de actividades",
      "Aval de la Dirección de Programa y/o Dirección de Internacionalización",
      "Póliza de seguro médico con cobertura para pasantías (internacional si aplica)"
    ],
    entregablesFinales:
      "Certificado oficial de cumplimiento de la estancia expedido por el tutor de la entidad receptora, constancia de horas ejecutadas, informe técnico final de transferencia de conocimientos y memoria descriptiva de los resultados alcanzados.",
    criteriosEvaluacion:
      "Evaluación del tutor externo en la entidad de acogida (60%) y valoración del informe técnico y socialización por el asesor del ITM y el Comité de Grados (40%). Calificación mínima aprobatoria: 3.0 / 5.0.",
    responsableAprobacion:
      "Comité de Trabajos de Grado, Dirección de Internacionalización y Asesor ITM",
    requiereSustentacion:
      "Socialización académica o informe técnico evaluado formalmente ante el Comité de Trabajos de Grado / Comité Curricular."
  },
  {
    codigo: "EMPRENDIMIENTO",
    icono: "🚀",
    nombre: "Emprendimiento",
    subtitulo: "Plan de Negocio y Creación de Empresa de Base Tecnológica",
    color: "emerald",
    descripcion:
      "Formulación, modelado, prototipado y validación técnica, comercial y financiera de una iniciativa empresarial innovadora o empresa de base tecnológica (EBT), articulando el desarrollo de un Producto Mínimo Viable (MVP), validación real con clientes y plan de negocio integral bajo el acompañamiento del Centro de Emprendimiento e Innovación del ITM.",
    queEs:
      "Transformar una idea técnica o invención de ingeniería en un modelo de negocio sostenible y validado en el mercado. El estudiante cursa los talleres de incubación, valida el modelo Lean Canvas con usuarios reales, estructura la viabilidad técnica, operativa, legal y financiera, y sustenta ante evaluadores expertos en inversión y negocios.",
    perfilEstudiante:
      "Estudiantes emprendedores, con espíritu de liderazgo, capacidad de innovación y visión comercial, interesados en fundar su propia empresa o comercializar una tecnología patentable o producto disruptivo.",
    condicionesPrevias:
      "Mínimo 70% de créditos aprobados. Vinculación y acompañamiento del Centro de Emprendimiento e Innovación del ITM (o Parque E / Ruta N).",
    requisitosParaGraduarse: [
      "Aprobar el acompañamiento y mentoría del Centro de Emprendimiento ITM o Parque E (certificado oficial).",
      "Construir y validar funcionalmente un Producto Mínimo Viable (MVP) o prototipo tecnológico con usuarios reales.",
      "Documentar el Plan de Negocio completo con proyecciones financieras a 3-5 años y análisis de viabilidad legal y comercial.",
      "Sustentar públicamente en formato Pitch de Negocio ante la terna de jurados evaluadores de innovación obteniendo calificación mínima de 3.0."
    ],
    pasosProceso: [
      "1. Postulación y Vinculación a Emprendimiento: Radicar en SIGMA ITM el Modelo Canvas preliminar y la constancia de vinculación a la Unidad de Emprendimiento e Innovación del ITM.",
      "2. Acompañamiento y Mentoría: Desarrollar el proceso de incubación y mentoría especializada en validación de hipótesis de clientes, modelo de ingresos y viabilidad técnica.",
      "3. Construcción del MVP y Pruebas de Mercado: Construir el prototipo funcional o Producto Mínimo Viable y realizar pruebas reales de tracción o validación con clientes potenciales.",
      "4. Formulación del Plan de Negocios: Redactar el documento formal de plan de negocio con proyecciones financieras a 3-5 años, análisis de riesgos y plan de comercialización.",
      "5. Sustentación Pitch ante Comité: Sustentar públicamente en formato Pitch de Negocio y demostración técnica ante terna de jurados evaluadores de innovación y emprendimiento."
    ],
    requisitoClave:
      "Modelo Canvas estructurado y validado junto con el Plan de Negocios integral, Producto Mínimo Viable (MVP) y viabilidad económica aprobada.",
    documentosRequeridos: [
      "Modelo de Negocio Canvas o Lean Canvas estructurado y validado con clientes",
      "Plan de Negocio detallado (análisis de mercado, técnico, legal, operativo y financiero)",
      "Certificado oficial de asesoría o incubación expedido por el Centro de Emprendimiento ITM o Parque E",
      "Certificado de paz y salvo académico institucional"
    ],
    entregablesFinales:
      "Documento integral de Plan de Negocios (técnico, financiero, legal y de mercadeo), Producto Mínimo Viable (MVP) o prototipo tecnológico funcional con bitácora de pruebas con usuarios, Pitch Deck comercial y certificado de incubación.",
    criteriosEvaluacion:
      "Viabilidad técnica del producto (30%), modelo financiero y tracción de mercado (30%), calidad del plan de negocio escrito (20%) y sustentación oral en formato Pitch ante el panel de jurados (20%). Calificación mínima aprobatoria: 3.0 / 5.0.",
    responsableAprobacion:
      "Comité de Emprendimiento de la Facultad y evaluadores expertos en innovación",
    requiereSustentacion:
      "Sí. Sustentación pública / Pitch de Negocio con demostración del prototipo funcional ante terna de jurados evaluadores de innovación."
  },
  {
    codigo: "PRODUCTO_LABORATORIO",
    icono: "🧪",
    nombre: "Producto en Laboratorio",
    subtitulo: "Desarrollo en Talleres o Laboratorios de Docencia o I+D",
    color: "rose",
    descripcion:
      "Diseño, desarrollo, fabricación, calibración, montaje o caracterización experimental de un prototipo físico, banco de pruebas, dispositivo mecatrónico/electrónico, material o sistema instrumental dentro de los laboratorios o talleres especializados de la Facultad de Ingenierías del ITM.",
    queEs:
      "El estudiante resuelve una necesidad técnica o de experimentación de los laboratorios institucionales o proyectos de la facultad, construyendo un producto físico de ingeniería funcional, con sus manuales de uso, protocolos de seguridad y calibración, y pruebas experimentales certificadas por la jefatura del laboratorio.",
    perfilEstudiante:
      "Estudiantes con destrezas prácticas, manuales y de taller en áreas como automatización, electrónica, materiales, manufactura, mecatrónica o bioingeniería, apasionados por el hardware y la experimentación física.",
    condicionesPrevias:
      "Mínimo 75% de créditos aprobados. Certificación en normas de seguridad y protocolos de uso de laboratorios.",
    requisitosParaGraduarse: [
      "Prototipo físico, banco experimental o dispositivo mecatrónico 100% operativo y probado en banco.",
      "Acta formal de recibo a satisfacción expedida por el Jefe del Laboratorio o Coordinación de Laboratorios del ITM.",
      "Entrega del manual de operación y protocolos de bioseguridad/mantenimiento en formato institucional.",
      "Demostración funcional en vivo y sustentación aprobada ante la terna de jurados evaluadores con nota mínima de 3.0."
    ],
    pasosProceso: [
      "1. Propuesta y Aval de Jefatura de Laboratorio: Concertar la propuesta técnica con el Jefe del Laboratorio o Coordinador de Talleres del ITM y obtener su visto bueno firmado.",
      "2. Radicación en SIGMA ITM: Radicar la propuesta técnica con el cronograma de uso de equipos, protocolos de seguridad industrial y certificado de créditos (mínimo 75%).",
      "3. Desarrollo y Pruebas Experimentales: Construcción del prototipo o banco en el laboratorio, aplicando pruebas de calibración y aseguramiento metrológico.",
      "4. Documentación Técnica y Manuales: Redacción de la memoria técnica de ingeniería, manual de operación, guía de mantenimiento preventivo y ficha técnica de características.",
      "5. Demostración Práctica y Sustentación: Presentación del prototipo operando en las instalaciones del laboratorio ante los jurados y sustentación oral formal."
    ],
    requisitoClave:
      "Aval formal por escrito del Profesional Universitario / Jefe del Laboratorio o Coordinación de Laboratorios ITM.",
    documentosRequeridos: [
      "Propuesta técnica del producto o prototipo de ingeniería a desarrollar",
      "Aval formal y visto bueno de la Jefatura del Laboratorio correspondiente",
      "Protocolo de bioseguridad industrial y cronograma de sesiones de uso de laboratorios",
      "Certificado de paz y salvo académico institucional"
    ],
    entregablesFinales:
      "Prototipo físico, banco experimental o dispositivo instrumental operando en laboratorio, manual de operación y mantenimiento, ficha técnica de caracterización experimental, acta de entrega formal a los laboratorios del ITM y memoria técnica de ingeniería.",
    criteriosEvaluacion:
      "Operatividad y robustez del prototipo físico (40%), rigor técnico y metrológico de la memoria escrita (25%), manuales y protocolos de seguridad (15%), y demostración en vivo durante la sustentación (20%). Calificación mínima aprobatoria: 3.0 / 5.0.",
    responsableAprobacion:
      "Jefe del Laboratorio, Docente Asesor Técnico y Comité de Trabajos de Grado",
    requiereSustentacion:
      "Sí. Demostración práctica en el laboratorio y sustentación formal de resultados ante jurados evaluadores designados por el Comité de Grados."
  },
  {
    codigo: "PRODUCTO_INVESTIGACION",
    icono: "🔬",
    nombre: "Producto de Investigación",
    subtitulo: "Artículo Científico, Patente o Registro I+D+i",
    color: "amber",
    descripcion:
      "Generación de un producto de nuevo conocimiento o desarrollo tecnológico de alto impacto científico derivado de la participación activa en un proyecto financiado o línea formal de un Grupo de Investigación del ITM reconocido por MinCiencias, materializado en un artículo sometido/aceptado en revista indexada, patente de invención o registro de software.",
    queEs:
      "El estudiante se integra a un grupo o semillero de investigación durante al menos dos (2) semestres. Con la tutoría del docente investigador principal, produce un manuscrito científico bajo estándares internacionales de publicación (Scopus/Web of Science/SciELO/Publindex) o la radicación de una patente ante la Superintendencia de Industria y Comercio (SIC).",
    perfilEstudiante:
      "Estudiantes con marcada vocación científica y académica, interesados en la investigación formal, publicación en revistas de prestigio internacional y postulación a becas de maestría y doctorado.",
    condicionesPrevias:
      "Mínimo 70% de créditos aprobados y permanencia demostrable de al menos dos (2) semestres en un Semillero o Grupo de Investigación ITM.",
    requisitosParaGraduarse: [
      "Acreditar mínimo dos (2) semestres de permanencia activa en el Semillero o Grupo de Investigación del ITM.",
      "Manuscrito científico completo en formato de la revista indexada o memoria técnica de patente.",
      "Comprobante oficial de sometimiento o carta de aceptación editorial en revista indexada (Scopus/Publindex/SciELO) o radicado de patente ante la SIC/DNDA.",
      "Concepto de aprobación emitido por el líder del Grupo de Investigación y la Dirección de Investigaciones (CIDI)."
    ],
    pasosProceso: [
      "1. Vinculación y Permanencia: Acreditar mínimo dos (2) semestres de permanencia activa en un Semillero o Grupo de Investigación ITM reconocido por MinCiencias.",
      "2. Radicación y Aval del Líder de Grupo: Radicar en SIGMA ITM la propuesta de investigación con el aval formal del docente líder del proyecto y la constancia de inscripción en el CIDI.",
      "3. Desarrollo de la Investigación: Ejecutar la fase analítica, experimental o teórica del proyecto bajo la tutoría directa del investigador principal.",
      "4. Redacción y Sometimiento: Redactar el artículo científico en inglés o español según las normas de la revista seleccionada (mínimo Q1-Q4 Scopus o Publindex) y someterlo formalmente, obteniendo el comprobante de radicación editorial.",
      "5. Evaluación y Homologación: El Comité de Trabajos de Grado y la Dirección de Investigaciones evalúan el manuscrito y el comprobante editorial para emitir el dictamen de aprobación de grado."
    ],
    requisitoClave:
      "Constancia de vinculación al grupo/semillero, aval del docente líder de investigación y radicado de producto categorizado MinCiencias.",
    documentosRequeridos: [
      "Propuesta de investigación firmada por el estudiante y el docente tutor investigador",
      "Certificado oficial de vinculación al Semillero o Grupo de Investigación ITM",
      "Carta de participación formal en proyecto de investigación registrado en el CIDI",
      "Certificado de paz y salvo académico institucional"
    ],
    entregablesFinales:
      "Manuscrito científico completo en formato de la revista indexada (o memoria de patente), comprobante formal de sometimiento o carta de aceptación de la revista (Scopus/Publindex/SciELO), y certificación oficial de vinculación expedida por el líder del Grupo de Investigación y el CIDI.",
    criteriosEvaluacion:
      "Calidad científica del manuscrito avalada por el líder de investigación (40%), relevancia de la revista y categorización MinCiencias (30%), y validación del Comité de Grados y CIDI (30%).",
    responsableAprobacion:
      "Líder del Grupo de Investigación, Dirección de Investigaciones (CIDI) y Comité de Grados",
    requiereSustentacion:
      "Presentación del artículo o ponencia en evento científico avalado, o sustentación ante el Comité de Trabajos de Grado."
  },
  {
    codigo: "RECONOCIMIENTO_LABORAL",
    icono: "🏆",
    nombre: "Reconocimiento Laboral",
    subtitulo: "Homologación por Ejercicio Profesional Cualificado",
    color: "indigo",
    descripcion:
      "Convalidación y homologación del requisito de grado mediante la demostración fehaciente de experiencia laboral continua, calificada y relevante de mínimo un (1) año en una empresa legalmente constituida, ejecutando labores, proyectos o desarrollos directamente vinculados al perfil profesional del programa de ingeniería.",
    queEs:
      "Es una modalidad orientada a estudiantes que ya laboran activamente en el sector productivo en cargos afines a su carrera. El estudiante no realiza un proyecto nuevo, sino que elabora una rigurosa Memoria Técnica de Ingeniería detallando los proyectos, soluciones y aportes técnicos desarrollados en su puesto de trabajo, avalados por su empleador.",
    perfilEstudiante:
      "Estudiantes de últimos semestres que ya se desempeñan como ingenieros, desarrolladores, analistas técnicos o líderes de proyectos en empresas del sector y cuentan con trayectoria laboral demostrable.",
    condicionesPrevias:
      "100% de asignaturas cursadas y aprobadas (o estar en último semestre). Mínimo un (1) año continuo de experiencia en el área afín al perfil de egreso.",
    requisitosParaGraduarse: [
      "Haber aprobado el 100% de las asignaturas del plan de estudios del programa.",
      "Certificar mínimo un (1) año continuo de vinculación laboral en labores de ingeniería con funciones técnicas explícitas.",
      "Redactar la Memoria Técnica de labores detallando proyectos, impacto y aportes de ingeniería, con la firma de visto bueno del empleador.",
      "Sustentar analíticamente la memoria técnica ante la comisión evaluadora del Comité de Trabajos de Grado y obtener calificación mínima de 3.0."
    ],
    pasosProceso: [
      "1. Verificación de Elegibilidad: Haber cursado y aprobado el 100% de las asignaturas del plan de estudios (o estar matriculado en el último semestre) y contar con mínimo 1 año continuo en el cargo afín.",
      "2. Radicación Documental: Radicar en SIGMA ITM el certificado laboral oficial de Gestión Humana (con desglose pormenorizado de funciones de ingeniería), Cámara de Comercio de la empresa y la propuesta de Memoria Técnica.",
      "3. Elaboración de la Memoria Técnica: Redactar un informe exhaustivo de ingeniería que describa los proyectos ejecutados, tecnologías aplicadas, problemas resueltos y métricas de impacto en la empresa.",
      "4. Aval del Empleador y Dirección de Programa: Obtener la firma de visto bueno del jefe inmediato en la empresa certificando la veracidad de la memoria y el aval de la Dirección de Programa.",
      "5. Evaluación y Sustentación ante Comité: Sustentar y defender analíticamente la memoria técnica ante la comisión evaluadora del Comité de Trabajos de Grado."
    ],
    requisitoClave:
      "Certificación laboral detallada de funciones técnicas/profesionales de ingeniería (antigüedad ≥ 1 año) y memoria técnica de proyectos ejecutados en la empresa avalada por el empleador.",
    documentosRequeridos: [
      "Certificado laboral original expedido por Gestión Humana (cargo, salario, antigüedad ≥ 1 año y detalle explícito de funciones)",
      "Certificado de existencia y representación legal de la empresa (Cámara de Comercio vigente)",
      "Memoria técnica de labores: informe de proyectos, desarrollos y aportes de ingeniería realizados por el estudiante",
      "Paz y salvo de créditos y matrícula del ITM"
    ],
    entregablesFinales:
      "Memoria Técnica consolidada de labores de ingeniería avalada por el jefe inmediato y representante legal de la empresa, certificado laboral original de Gestión Humana con funciones específicas y fechas, y Certificado de Existencia y Representación Legal de la empresa (Cámara de Comercio vigente).",
    criteriosEvaluacion:
      "Pertinencia y complejidad de las funciones de ingeniería desempeñadas (40%), profundidad técnica de la memoria de labores (35%), y sustentación/defensa analítica ante la comisión evaluadora (25%). Calificación mínima aprobatoria: 3.0 / 5.0.",
    responsableAprobacion:
      "Comité de Trabajos de Grado de la Facultad de Ingenierías",
    requiereSustentacion:
      "Sí. Sustentación analítica de la memoria técnica de labores ante la comisión evaluadora del Comité de Trabajos de Grado."
  },
  {
    codigo: "CERTIFICACION",
    icono: "📜",
    nombre: "Certificación",
    subtitulo: "Certificación Técnica Internacional de Industria",
    color: "teal",
    descripcion:
      "Homologación del requisito de grado mediante la obtención o acreditación de una certificación técnica o profesional internacional emitida por corporaciones líderes de la industria tecnológica (ej. AWS, Cisco, Microsoft, Oracle, Google Cloud, PMI, Linux Professional Institute, CompTIA, etc.) que conste en el catálogo oficial aprobado por la Facultad de Ingenierías.",
    queEs:
      "El estudiante se prepara, rinde y aprueba un examen de certificación oficial internacional en competencias de alta demanda (computación en la nube, ciberseguridad, redes, ciencia de datos, gestión ágil, desarrollo de software). Al superar el examen y obtener la credencial vigente, solicita la convalidación del requisito de grado ante la facultad.",
    perfilEstudiante:
      "Estudiantes orientados al mercado laboral de la tecnología global y la industria 4.0, que buscan credenciales profesionales de prestigio internacional inmediatamente valoradas por empresas multinacionales.",
    condicionesPrevias:
      "Mínimo el 80% de créditos del plan de estudios aprobados. La certificación debe haber sido obtenida durante la carrera o con una antigüedad máxima de dos (2) años.",
    requisitosParaGraduarse: [
      "Tener mínimo el 80% de créditos de la carrera aprobados al momento de la postulación.",
      "Acreditar la aprobación de una certificación internacional que figure en el catálogo oficial de certificaciones válidas de la facultad.",
      "Aportar la credencial oficial con enlace o código de verificación digital pública (ID de validación en plataformas como Credly o portal emisor).",
      "Obtener el concepto de convalidación académica favorable expedido por la Dirección de Programa y el Comité de Grados."
    ],
    pasosProceso: [
      "1. Consulta del Catálogo Oficial: Verificar que la certificación deseada figure en la lista oficial de certificaciones homologables aprobada por la Facultad de Ingenierías del ITM.",
      "2. Preparación y Examen: Estudiar y aprobar el examen oficial directamente con el organismo certificador internacional autorizado (ej. Pearson VUE, Certiport, etc.).",
      "3. Radicación en SIGMA ITM: Radicar la credencial oficial con enlace público o código de verificación (Badge/ID), la ficha técnica de competencias y el paz y salvo de créditos (mínimo 80%).",
      "4. Verificación de Autenticidad: La coordinación académica del programa y el comité validan digitalmente la vigencia y autenticidad del certificado emitido (máximo 2 años de antigüedad).",
      "5. Emisión de Acta de Homologación: El Comité de Trabajos de Grado emite el acta de convalidación académica y registra la aprobación del requisito de grado en el sistema."
    ],
    requisitoClave:
      "Certificado oficial expedido por organismo internacional que conste en el catálogo institucional de certificaciones válidas aprobado por la Facultad, con enlace o código de verificación público.",
    documentosRequeridos: [
      "Certificado o credencial oficial expedida por el organismo certificador con código/enlace de validación pública (ID de verificación)",
      "Ficha técnica descriptiva con el desglose de competencias evaluadas y horas de formación",
      "Comprobante o voucher de presentación y aprobación del examen internacional",
      "Certificado de paz y salvo académico institucional"
    ],
    entregablesFinales:
      "Certificado o credencial internacional con ID o enlace de verificación pública en línea (Credly, Acclaim o portal del certificador), voucher o comprobante de presentación y aprobación del examen, ficha técnica descriptiva del temario y competencias evaluadas, y reporte de convalidación emitido por la coordinación del programa.",
    criteriosEvaluacion:
      "Verificación 100% objetiva de autenticidad y vigencia de la credencial internacional ante el organismo emisor y correspondencia con el catálogo de certificaciones válidas aprobado por el Consejo de Facultad.",
    responsableAprobacion:
      "Coordinación del Programa Académico y Comité de Trabajos de Grado",
    requiereSustentacion:
      "No requiere sustentación oral; validación formal de la autenticidad y suficiencia técnica por el Comité de Trabajos de Grado."
  },
  {
    codigo: "CURSOS_POSGRADO",
    icono: "📚",
    nombre: "Cursos de Posgrado",
    subtitulo: "Articulación Coterminal con Especialización o Maestría",
    color: "fuchsia",
    descripcion:
      "Modalidad de articulación académica vertical que permite a estudiantes destacados de pregrado cursar y aprobar asignaturas del primer semestre o periodo académico de un programa de posgrado propio del ITM (Especialización o Maestría) o de una universidad en convenio, homologando simultáneamente el requisito de grado de pregrado y avanzando en su posgrado.",
    queEs:
      "El estudiante es admitido al programa de posgrado mientras cursa el último tramo de su pregrado. Matricula y aprueba la totalidad de los créditos del primer semestre del posgrado con el promedio exigido. Al finalizar con éxito, dichas asignaturas se homologan para otorgar el título de pregrado y le quedan acumuladas para graduarse de posgrado.",
    perfilEstudiante:
      "Estudiantes con alto promedio académico acumulado, perfil de excelencia y metas de formación posgradual continua a corto plazo que deseen ahorrar tiempo y dinero cursando materias de posgrado mientras terminan el pregrado.",
    condicionesPrevias:
      "Haber aprobado mínimo el 90% de créditos del pregrado con un promedio acumulado reglamentario (típicamente ≥ 3.8). Admisión formal al posgrado.",
    requisitosParaGraduarse: [
      "Tener aprobado mínimo el 90% de los créditos del pregrado con promedio acumulado reglamentario (≥ 3.8).",
      "Haber sido admitido y matriculado formalmente en el programa de Especialización o Maestría del ITM.",
      "Aprobar la totalidad de los créditos matriculados en el primer período académico del posgrado.",
      "Obtener una calificación mínima aprobatoria de 3.5 en cada una de las materias de posgrado cursadas, sin reprobar ninguna asignatura."
    ],
    pasosProceso: [
      "1. Postulación y Admisión al Posgrado: Cumplir con mínimo el 90% de créditos aprobados y promedio reglamentario (típicamente ≥ 3.8). Presentar postulación y ser admitido formalmente en el programa de posgrado del ITM.",
      "2. Radicación en SIGMA ITM: Radicar la constancia de admisión, el formulario de coterminal avalado por la dirección de programa y el kardex oficial de calificaciones.",
      "3. Matrícula y Cursado de Asignaturas: Matricular los créditos correspondientes al primer periodo académico del posgrado y cursar la totalidad de las materias con dedicación.",
      "4. Aprobación con Promedio de Posgrado: Aprobar la totalidad de los créditos matriculados con una calificación mínima de 3.5 en cada asignatura y sin reprobar ninguna materia.",
      "5. Certificación y Homologación: Solicitar a Admisiones y Registro el certificado oficial de calificaciones de posgrado y radicarlo en SIGMA ITM para el cierre del trámite y emisión del acta de grado."
    ],
    requisitoClave:
      "Aprobación de la totalidad de créditos de posgrado matriculados con promedio mínimo aprobatorio de posgrado (≥ 3.5 en cada materia sin reprobar).",
    documentosRequeridos: [
      "Formulario institucional de postulación a modalidad coterminal con visto bueno del pregrado",
      "Constancia de admisión formal y matrícula financiera en el programa de posgrado del ITM",
      "Historial oficial de calificaciones que acredite el cumplimiento del promedio exigido",
      "Paz y salvo académico institucional"
    ],
    entregablesFinales:
      "Certificado oficial de calificaciones de posgrado expedido por Admisiones y Registro del ITM donde conste la aprobación unánime de los créditos del primer semestre, y formulario institucional de homologación de modalidad coterminal con visto bueno de ambas direcciones de programa.",
    criteriosEvaluacion:
      "Aprobación de la totalidad de materias del posgrado con calificación individual igual o superior a 3.5 sobre 5.0 (escala reglamentaria de posgrados ITM) sin asignaturas reprobadas.",
    responsableAprobacion:
      "Coordinación del Programa de Posgrados y Comité de Trabajos de Grado",
    requiereSustentacion:
      "No requiere sustentación de grado de pregrado; la aprobación de las materias de posgrado homologa y satisface el requisito de grado."
  },
  {
    codigo: "INGENIERIA_GENTE",
    icono: "🤝",
    nombre: "Ingeniería para la Gente",
    subtitulo: "Proyección Social y Soluciones Comunitarias Sostenibles",
    color: "orange",
    descripcion:
      "Diseño, concertación, construcción e implementación participativa de una solución técnica, tecnológica o de infraestructura sustentable orientada a resolver problemáticas reales y sentidas de comunidades vulnerables, Juntas de Acción Comunal (JAC), organizaciones sociales o sectores desfavorecidos de la región.",
    queEs:
      "Poner la ingeniería al servicio directo de la sociedad con un enfoque ético y solidario. Los estudiantes realizan trabajo de campo con la comunidad beneficiaria, diagnostican participativamente la necesidad técnica (ej. sistemas de captación de agua, energías limpias, telemetría comunitaria, alfabetización digital, reciclaje tecnológico o adecuación de espacios comunitarios), implementan la solución in situ y capacitan a la población para su autogestión y mantenimiento.",
    perfilEstudiante:
      "Estudiantes con sensibilidad social, empatía comunitaria, vocación de servicio y habilidades para el trabajo colaborativo en campo y la transferencia pedagógica de tecnología.",
    condicionesPrevias:
      "Mínimo 75% de créditos cursados y aprobados. Disponibilidad para realizar trabajo de campo concertado con la comunidad.",
    requisitosParaGraduarse: [
      "Diagnóstico participativo comunitario formalizado con la comunidad beneficiaria.",
      "Solución tecnológica o infraestructura 100% implementada y en funcionamiento en la comunidad.",
      "Manuales de autogestión y mantenimiento entregados y socializados con los líderes comunitarios.",
      "Acta formal de recibo a satisfacción suscrita por los líderes comunitarios y sustentación pública aprobada ante jurados (calificación ≥ 3.0)."
    ],
    pasosProceso: [
      "1. Concertación con la Comunidad: Realizar el acercamiento formal con la Junta de Acción Comunal u organización social beneficiaria y levantar el diagnóstico participativo de la necesidad técnica.",
      "2. Radicación en SIGMA ITM: Radicar la carta formal de concertación y aval expedida por los líderes comunitarios, el plan de trabajo y el paz y salvo de créditos (mínimo 75%).",
      "3. Diseño y Construcción Participativa: Diseñar e implementar la solución tecnológica en conjunto con los miembros de la comunidad, documentando el proceso con bitácora fotográfica y de avance.",
      "4. Transferencia y Capacitación: Realizar jornadas de capacitación a los líderes y usuarios comunitarios, entregando manuales de uso y mantenimiento en lenguaje claro y accesible.",
      "5. Entrega a Satisfacción y Sustentación: Firma del acta de entrega formal con los líderes comunitarios y sustentación pública ante jurados con invitación y participación de delegados de la comunidad."
    ],
    requisitoClave:
      "Diagnóstico participativo comunitario previo y carta formal de concertación y respaldo de la organización social o comunidad beneficiaria.",
    documentosRequeridos: [
      "Carta formal de concertación y aval expedida por la comunidad u organización social beneficiaria",
      "Diagnóstico participativo comunitario con delimitación clara de la necesidad técnica a intervenir",
      "Plan de trabajo, propuesta de solución tecnológica y cronograma de intervención comunitaria",
      "Certificado de paz y salvo académico institucional"
    ],
    entregablesFinales:
      "Solución tecnológica o infraestructura implementada y funcionando en la comunidad, manuales de uso y mantenimiento preventivo redactados en lenguaje no técnico y accesible, acta de entrega formal y satisfacción suscrita por los representantes legales de la comunidad u organización social, memoria técnica de ingeniería con métricas de impacto social y registro fotográfico/audiovisual de la intervención.",
    criteriosEvaluacion:
      "Impacto y apropiación social de la solución en la comunidad (35%), funcionalidad técnica y sostenibilidad de la obra o dispositivo (30%), calidad de los manuales de transferencia (15%) y sustentación pública con evidencias testimoniales de la comunidad (20%). Calificación mínima aprobatoria: 3.0 / 5.0.",
    responsableAprobacion:
      "Comité de Extensión y Proyección Social, Docente Asesor Asignado y Comité de Grados",
    requiereSustentacion:
      "Sí. Sustentación pública con presencia opcional de delegados comunitarios y presentación de evidencias de impacto social ante jurados evaluadores designados por el Comité de Grados."
  }
];

export function obtenerInfoModalidad(nombre) {
  if (!nombre) return null;
  return (
    MODALIDADES_OFICIALES.find(
      (m) => m.nombre.toLowerCase().trim() === nombre.toLowerCase().trim()
    ) || {
      codigo: "GENERICA",
      icono: "📋",
      nombre: nombre,
      subtitulo: "Modalidad reglamentaria ITM",
      color: "blue",
      descripcion: "Modalidad reglamentaria de opción de grado en la Facultad de Ingenierías del ITM.",
      queEs: "Modalidad de grado reglamentada según acuerdos vigentes del Consejo de Facultad.",
      perfilEstudiante: "Estudiantes del ITM que cumplen con los requisitos académicos correspondientes.",
      objetivo: "Cumplimiento del requisito de grado según la reglamentación académica vigente.",
      condicionesPrevias: "Cumplimiento de créditos y prerrequisitos del programa académico.",
      requisitosParaGraduarse: [
        "Aprobar la totalidad de créditos exigidos",
        "Radicar la documentación obligatoria",
        "Obtener concepto favorable del evaluador o jurados"
      ],
      pasosProceso: [
        "1. Radicación de la postulación con documentos soporte",
        "2. Revisión y asignación por el Comité",
        "3. Ejecución del proyecto",
        "4. Evaluación y cierre",
        "5. Emisión de certificado de grado"
      ],
      requisitoClave: "Documentación estipulada según el reglamento académico institucional.",
      documentosRequeridos: ["Documentos soporte estipulados por el Comité de Grados"],
      entregablesFinales: "Informe final o memoria técnica aprobada.",
      criteriosEvaluacion: "Aprobación reglamentaria según el estatuto docente y estudiantil.",
      responsableAprobacion: "Comité de Trabajos de Grado",
      requiereSustentacion: "Según determine el Comité de Trabajos de Grado."
    }
  );
}
