import { Week, Chapter } from '../types';

export const PROGRAM_WEEKS: Week[] = [
  {
    id: 1,
    title: 'Semana 1',
    part: 'Parte I',
    partTitle: 'Comprensión y Desmitificación',
    description: 'Entender qué es el tinnitus, por qué tu cerebro reacciona así, y desmentir los mitos.',
    chapters: [
      {
        id: 1,
        weekId: 1,
        title: 'Bienvenido a Tu Libertad',
        subtitle: 'Tu compromiso con el programa',
        duration: '20-30 min',
        exercises: ['Compromiso escrito', 'Fecha de inicio'],
      },
      {
        id: 2,
        weekId: 1,
        title: 'Entendiendo Tu Tinnitus',
        subtitle: 'Qué es y por qué tu cerebro reacciona',
        duration: '20-30 min',
        exercises: ['Cuestionario de angustia inicial'],
      },
      {
        id: 3,
        weekId: 1,
        title: 'Cazando Los Mitos',
        subtitle: 'Los 7 mitos más peligrosos',
        duration: '20-30 min',
        exercises: ['Identificar mitos propios'],
      },
    ],
  },
  {
    id: 2,
    title: 'Semana 2',
    part: 'Parte II',
    partTitle: 'Control Sensorial',
    description: 'Herramientas de alivio inmediato: atención plena, enmascaramiento y factores agravantes.',
    chapters: [
      {
        id: 4,
        weekId: 2,
        title: 'Atención Plena Básica',
        subtitle: 'Observar sin luchar',
        duration: '30-40 min',
        exercises: ['Observación de 3 minutos', 'Registro de práctica'],
      },
      {
        id: 5,
        weekId: 2,
        title: 'Uso Inteligente del Sonido',
        subtitle: 'Enmascaramiento funcional',
        duration: '30-40 min',
        exercises: ['Biblioteca de sonidos', 'Plan de transición'],
      },
      {
        id: 6,
        weekId: 2,
        title: 'Factores Agravantes',
        subtitle: 'Tu diario de factores',
        duration: '30-40 min',
        exercises: ['Diario de factores', 'Plan de cambios'],
      },
    ],
  },
  {
    id: 3,
    title: 'Semana 3',
    part: 'Parte III',
    partTitle: 'Reestructuración Cognitiva',
    description: 'El corazón del programa: cambiar tu respuesta al tinnitus usando TCC.',
    chapters: [
      {
        id: 7,
        weekId: 3,
        title: 'Mapeando Tu Patrón de Pánico',
        subtitle: 'El Modelo ABC',
        duration: '45-60 min',
        exercises: ['Registro ABC (3 eventos)'],
      },
    ],
  },
  {
    id: 4,
    title: 'Semana 4',
    part: 'Parte III',
    partTitle: 'Reestructuración Cognitiva',
    description: 'Desafiar tus pensamientos catastróficos.',
    chapters: [
      {
        id: 8,
        weekId: 4,
        title: 'Cuestionando la Alarma',
        subtitle: 'La Pregunta de Oro',
        duration: '45-60 min',
        exercises: ['Etiqueta alternativa', 'Reemplazo activo'],
      },
    ],
  },
  {
    id: 5,
    title: 'Semana 5',
    part: 'Parte III',
    partTitle: 'Reestructuración Cognitiva',
    description: 'Exposición gradual a situaciones evitadas.',
    chapters: [
      {
        id: 9,
        weekId: 5,
        title: 'Enfrentando Lo Evitado',
        subtitle: 'Tu Escalera de Exposición',
        duration: '45-60 min',
        exercises: ['Escalera de 5 pasos', 'Exposición escalón 1'],
      },
    ],
  },
  {
    id: 6,
    title: 'Semana 6',
    part: 'Parte IV',
    partTitle: 'Integración y Mantenimiento',
    description: 'Estrategias de sueño y exposición continua.',
    chapters: [
      {
        id: 10,
        weekId: 6,
        title: 'Recuperando Tus Noches',
        subtitle: 'Estrategias de sueño',
        duration: '30-45 min',
        exercises: ['Regla de la cama', 'Registro de sueño', 'Escalón 2'],
      },
    ],
  },
  {
    id: 7,
    title: 'Semana 7',
    part: 'Parte IV',
    partTitle: 'Integración y Mantenimiento',
    description: 'Medir progreso y crear tu Kit de Emergencia.',
    chapters: [
      {
        id: 11,
        weekId: 7,
        title: 'Cuando el Tinnitus Vuelve a Rugir',
        subtitle: 'Manejo de picos',
        duration: '30-45 min',
        exercises: ['Cuestionario de progreso', 'Kit de Emergencia', 'Escalón 3'],
      },
    ],
  },
  {
    id: 8,
    title: 'Semana 8',
    part: 'Parte IV',
    partTitle: 'Integración y Mantenimiento',
    description: 'Plan de mantenimiento y evaluación final.',
    chapters: [
      {
        id: 12,
        weekId: 8,
        title: 'Viviendo Más Allá del Sonido',
        subtitle: 'Tu plan de mantenimiento',
        duration: '30-45 min',
        exercises: ['Escalones 4-5', 'Plan de mantenimiento', 'Declaración personal'],
      },
    ],
  },
];

export const CHAPTER_CONTENT: Record<number, { sections: { title: string; content: string }[] }> = {
  1: {
    sections: [
      {
        title: 'Si Estás Leyendo Esto...',
        content: `Probablemente has pasado semanas—quizás meses—buscando respuestas. Has buscado en internet "cura para el tinnitus" a las 3 de la mañana. Has visitado médicos que te dijeron "aprende a vivir con ello" sin darte herramientas reales.\n\nSi ese eres tú, quiero que sepas tres cosas:\n\n1. No estás solo. Entre 10-15% de la población mundial experimenta tinnitus crónico.\n\n2. No estás "loco" ni "exagerando". El sufrimiento que sientes es real.\n\n3. Hay una salida. No una "cura mágica", pero SÍ hay un camino comprobado científicamente para recuperar tu vida.`,
      },
      {
        title: 'Lo Que Este Programa SÍ Es',
        content: `✅ Un programa de 8 semanas basado en evidencia para reducir tu angustia y recuperar tu calidad de vida.\n\n✅ Una guía práctica con ejercicios específicos diseñados por décadas de investigación en TCC y TRT.\n\n✅ Un mapa para la habituación—el proceso por el cual tu cerebro aprende a reclasificar el tinnitus de "señal de peligro" a "sonido neutro de fondo".`,
      },
      {
        title: 'La Promesa Realista',
        content: `Lo Que Probablemente VA a Pasar:\n\n✅ Tu nivel de angustia se reducirá significativamente (40-60%)\n✅ Dormirás mejor\n✅ Recuperarás actividades que has estado evitando\n✅ Dejarás de entrar en pánico cada vez que notes el zumbido\n✅ Tendrás herramientas concretas para manejar los picos\n\nLo Que Probablemente NO Va a Pasar:\n\n❌ El volumen del tinnitus no desaparecerá\n❌ No será un proceso lineal\n❌ No sucederá sin esfuerzo`,
      },
    ],
  },
  2: {
    sections: [
      {
        title: 'Qué Es El Tinnitus',
        content: `Tinnitus es la percepción de un sonido que no tiene una fuente externa.\n\nPuede sonar como:\n• Un zumbido o pitido agudo\n• Un silbido constante\n• Un rugido grave\n• Múltiples sonidos simultáneos\n\nPunto crítico #1: El sonido ES real para ti. No estás "imaginándolo".\n\nPunto crítico #2: El tinnitus NO es una enfermedad. Es un SÍNTOMA.`,
      },
      {
        title: 'Por Qué Tu Cerebro Lo Genera',
        content: `El tinnitus NO es principalmente un problema del oído. Es un problema del CEREBRO.\n\nCuando algo daña o reduce la entrada de sonido:\n\n1. Tu cerebro nota que falta información\n2. Las neuronas en tu corteza auditiva se vuelven HIPERACTIVAS\n3. Percibes un sonido que no existe fuera de tu cabeza\n\nEl tinnitus es el cerebro tratando de "ayudar". Es una respuesta adaptativa que salió mal.`,
      },
      {
        title: 'La Buena Noticia',
        content: `El volumen del tinnitus NO predice el nivel de sufrimiento.\n\nDos personas pueden tener el mismo volumen de tinnitus. Una está desesperada, la otra apenas lo nota.\n\n¿Por qué? Porque tu sufrimiento NO viene del sonido. Viene de cómo tu Sistema Límbico CLASIFICA ese sonido.\n\nLo que tu cerebro aprendió, puede desaprenderlo.`,
      },
    ],
  },
  3: {
    sections: [
      {
        title: 'Mito #1: "Siempre Empeora"',
        content: `FALSO. El curso natural del tinnitus es extremadamente variable.\n\n✅ 50-70% de las personas reportan que se mantiene IGUAL o MEJORA\n✅ Las fluctuaciones diarias NO son evidencia de "empeoramiento permanente"\n✅ Con habituación, la MOLESTIA disminuye significativamente`,
      },
      {
        title: 'Mito #2: "Existe Una Cura Oculta"',
        content: `FALSO. No existe una cura universal oculta.\n\nPERO SÍ existen tratamientos efectivos:\n\n✅ Terapia Cognitivo-Conductual (TCC) - Reduce la discapacidad 40-60%\n✅ Terapia de Reentrenamiento del Tinnitus (TRT) - 70-80% efectividad\n✅ Tratamiento de causas subyacentes`,
      },
      {
        title: 'Mito #3: "Nunca Volveré a Estar Bien"',
        content: `COMPLETAMENTE FALSO.\n\n✅ Aproximadamente 10-15% de adultos tienen tinnitus crónico\n✅ De esos, solo 20-25% reportan impacto significativo\n✅ 75-80% viven vidas normales\n\nTener tinnitus NO significa que tu vida terminó. Significa que necesitas ajustar tu RESPUESTA al sonido.`,
      },
    ],
  },
  4: {
    sections: [
      {
        title: '¿Qué Es La Atención Plena?',
        content: `La atención plena es la práctica de observar el momento presente—sin juzgarlo, sin intentar cambiarlo, sin luchar contra él.\n\nSIN atención plena:\n"Escucho el zumbido → ¿por qué no desaparece? → mi vida está arruinada → [pánico]"\n\nCON atención plena:\n"Noto el zumbido → [pausa] → Es un sonido. Está presente. → [regreso a lo que estaba haciendo]"`,
      },
      {
        title: 'Ejercicio: Observación de 3 Minutos',
        content: `Duración: 3 minutos, 2 veces al día\n\nMINUTO 1: Anclaje en la Respiración\n• Presta atención a tu respiración\n• Cuando tu mente divague, regresa suavemente\n\nMINUTO 2: Observación del Tinnitus\n• Dirige tu atención al tinnitus\n• Observa sin agregar juicio\n\nMINUTO 3: Expansión de la Atención\n• Incluye otras sensaciones\n• El tinnitus es UNO de varios elementos`,
      },
    ],
  },
  5: {
    sections: [
      {
        title: 'Enmascaramiento Funcional vs Disfuncional',
        content: `DISFUNCIONAL (Evitación):\n❌ Volumen TOTAL que "borra" el tinnitus\n❌ Uso constante 24/7\n❌ Pánico cuando no está disponible\n\nFUNCIONAL (Herramienta):\n✅ Volumen PARCIAL - todavía puedes escuchar el tinnitus\n✅ Uso estratégico - solo en situaciones específicas\n✅ Complementa el trabajo cognitivo`,
      },
      {
        title: 'Principio del "Punto de Mezcla"',
        content: `El sonido debe estar a un nivel donde se "mezcla" con el tinnitus, pero NO lo borra completamente.\n\nPrueba práctica:\n• ¿Puedes escuchar tu tinnitus si prestas atención? ✓\n• ¿El tinnitus desapareció completamente? = Volumen demasiado alto\n\nLa regla: Si tienes que "buscar" tu tinnitus para escucharlo, el volumen es perfecto.`,
      },
    ],
  },
  6: {
    sections: [
      {
        title: 'Factores Agravantes Comunes',
        content: `DIETA Y SUSTANCIAS:\n• Cafeína (>300mg/día)\n• Alcohol (efecto rebote al día siguiente)\n• Sal en exceso\n\nESTILO DE VIDA:\n• Falta de sueño (<6 horas)\n• Estrés crónico\n• Tensión muscular (cuello, mandíbula)\n\nFACTORES MÉDICOS:\n• Problemas de ATM\n• Medicamentos ototóxicos`,
      },
      {
        title: 'Tu Diario de Factores',
        content: `Durante 7-14 días, registra diariamente:\n\n• Nivel de tinnitus (0-10)\n• Horas de sueño\n• Tazas de café/té\n• Copas de alcohol\n• Nivel de estrés (0-10)\n• Minutos de ejercicio\n\nBusca patrones después de 2 semanas.`,
      },
    ],
  },
  7: {
    sections: [
      {
        title: 'El Modelo A-B-C',
        content: `A - El Activador (La Señal)\nEl sonido del tinnitus. Es NEUTRO por sí mismo.\n\nB - La Etiqueta (El Pensamiento Rápido)\nEl juicio instantáneo: "Esto es terrible", "Nunca va a parar"\n\nC - La Consecuencia (La Angustia)\nMiedo, pánico, enojo, frustración, insomnio.\n\nLa gran revelación:\nEl sonido A NO causa directamente la angustia C.\nA solo lleva a C cuando B está activado.`,
      },
      {
        title: 'Tu Registro ABC',
        content: `Esta semana, captura 3 momentos de alta molestia:\n\n1. A - La Señal: Hora, dónde estabas, qué hacías\n\n2. C - La Angustia: Qué sentiste, nivel 0-10, qué hiciste\n\n3. B - La Etiqueta: ¿Qué mensaje instantáneo apareció?\n\nPregúntate: "Si mi pánico pudiera hablar, ¿qué estaría diciendo?"`,
      },
    ],
  },
  8: {
    sections: [
      {
        title: 'La Pregunta de Oro',
        content: `"¿Cuál es la EVIDENCIA de que esto es 100% cierto?"\n\nReglas para responder:\n✅ Solo cuenta evidencia OBJETIVA\n✅ Busca CONTRA-evidencia\n❌ NO cuenta lo que SIENTES\n❌ NO cuenta predicciones del futuro\n\nBusca hechos que otra persona podría verificar.`,
      },
      {
        title: 'Tu Etiqueta Alternativa',
        content: `Debe cumplir 3 reglas:\n\n1. REALISTA (no positiva falsa)\n❌ "El tinnitus es maravilloso"\n✅ "El tinnitus es molesto, pero he funcionado con él antes"\n\n2. CALMANTE (reduce la urgencia)\n✅ "Esto es incómodo, pero estoy a salvo"\n\n3. CORTA (menos de 15 palabras)\nNecesitas poder repetirla rápidamente.`,
      },
      {
        title: 'El Reemplazo Activo',
        content: `CADA VEZ que notes el zumbido y sientas la alarma:\n\n1. PAUSA (2 segundos)\nReconoce: "Ahí está mi Etiqueta vieja"\n\n2. REEMPLAZA (5 segundos)\nDi tu Etiqueta Alternativa\n\n3. REDIRIGE (10 segundos)\nVuelve a lo que estabas haciendo\n\nTotal: 17 segundos. Eso es todo.`,
      },
    ],
  },
  9: {
    sections: [
      {
        title: 'El Costo de la Evitación',
        content: `El Círculo Vicioso:\n\n1. Sientes el zumbido en el silencio\n2. Tu Etiqueta de Alarma se dispara\n3. Sientes ansiedad intensa\n4. Evitas el silencio\n5. La ansiedad baja INMEDIATAMENTE\n6. Tu cerebro aprende: "Evitar = Alivio"\n7. Tu mundo se hace más pequeño\n\nLa evitación te roba libertad a largo plazo.`,
      },
      {
        title: 'Tu Escalera de Exposición',
        content: `Construye 5 escalones del más fácil al más difícil:\n\nEscalón 1: La situación que causa MENOS ansiedad pero evitas\nEscalón 5: La situación que causa MÁS ansiedad\n\nPara cada uno, asigna tu ansiedad anticipada (0-10).\n\nDominar un escalón = 3 exposiciones exitosas con ansiedad final ≤3/10`,
      },
    ],
  },
  10: {
    sections: [
      {
        title: 'La Regla de la Cama',
        content: `Basada en Control de Estímulos (Bootzin, 1972):\n\n1. Ve a la cama SOLO cuando tengas sueño\n\n2. Usa la cama SOLO para dormir (y sexo)\n\n3. Si no te duermes en 20 minutos → LEVÁNTATE\n   Ve a otra habitación, haz algo aburrido, regresa cuando tengas sueño\n\n4. Despierta a la MISMA hora cada día\n\n5. NO duermas siesta`,
      },
      {
        title: 'Enmascaramiento Nocturno',
        content: `PARCIAL, no total:\n✅ Todavía puedes escuchar tu tinnitus si prestas atención\n\nTipos de sonido recomendados:\n• Ruido blanco o rosa\n• Lluvia suave, olas del mar\n• Ventilador\n\nUsa temporizador de 30-60 minutos para entrenar a tu cerebro a seguir durmiendo cuando el sonido se apague.`,
      },
    ],
  },
  11: {
    sections: [
      {
        title: 'La Naturaleza de los Picos',
        content: `El tinnitus fluctúa por:\n• Estrés agudo\n• Enfermedad\n• Cambios hormonales\n• Fatiga extrema\n• O... ninguna razón aparente\n\nUN PICO NO ES UNA RECAÍDA.\n\nRecaída = Regresar a tus conductas de evitación\nPico = El sonido fluctúa, pero TÚ mantienes tus herramientas`,
      },
      {
        title: 'Tu Kit de Emergencia',
        content: `PASO 1: Tu Señal de Alarma Personal\n¿Cuál es el PRIMER síntoma cuando empiezas a entrar en pánico?\n\nPASO 2: Tu Etiqueta de Contención\n"Esto es un pico, no una recaída. Es temporal."\n\nPASO 3: Tu Acción de Rescate\n• Respiración diafragmática\n• Caminata de anclaje\n• Registro ABC rápido`,
      },
    ],
  },
  12: {
    sections: [
      {
        title: 'Completando Tu Escalera',
        content: `Esta semana trabaja en Escalones 4 y 5.\n\nDías 1-3: Escalón 4\nDías 4-7: Escalón 5\n\nMeta: 2-3 exposiciones exitosas con ansiedad final ≤3/10\n\nEstos son los más difíciles—las situaciones que más has temido. Pero ahora tienes 7 semanas de práctica.`,
      },
      {
        title: 'Plan de Mantenimiento',
        content: `DIARIO (primeros 3 meses):\n• 1 Reemplazo Activo por día\n• Anclaje al Presente antes de dormir\n\nSEMANAL:\n• 1 exposición a una situación que antes evitabas\n• Check-in: "¿He estado evitando algo?"\n\nMENSUAL:\n• Cuestionario de Angustia\n• Revisar Kit de Emergencia\n\nANUAL:\n• Releer este programa\n• Celebrar tu progreso`,
      },
    ],
  },
};

export const DISTRESS_QUESTIONS = [
  { key: 'sleep_difficulty', label: '¿Qué tan difícil es dormir debido al tinnitus?' },
  { key: 'concentration_interference', label: '¿Cuánto interfiere con tu concentración?' },
  { key: 'frustration_anger', label: '¿Cuánta frustración o enojo sientes?' },
  { key: 'social_impact', label: '¿Cuánto ha impactado tu vida social?' },
  { key: 'future_worry', label: '¿Cuánto te preocupas por el futuro?' },
  { key: 'relaxation_difficulty', label: '¿Qué tan difícil es relajarte?' },
  { key: 'overwhelm_despair', label: '¿Cuánto te sientes abrumado?' },
];

export const EMOTIONS_LIST = [
  'Miedo',
  'Pánico',
  'Enojo',
  'Frustración',
  'Tristeza',
  'Desesperanza',
  'Ansiedad',
  'Irritabilidad',
];
