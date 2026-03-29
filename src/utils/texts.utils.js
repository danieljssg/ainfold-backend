import leoProfanity from 'leo-profanity';

export const sanitizeFileName = (fileName) => {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s/g, '_')
    .replace(/[^a-zA-Z0-9_().-]/g, '');
};

const BAD_WORDS = [
  'puta',
  'mierda',
  'puto',
  'verga',
  'pene',
  'vagina',
  'culo',
  'cabron',
  'cabrón',
  'pendejo',
  'pendeja',
  'gilipollas',
  'joder',
  'coño',
  'marico',
  'marica',
  'maricón',
  'maricon',
  'putazo',
  'perra',
  'zorra',
  'putita',
  'chinga',
  'chingar',
  'mamada',
  'sexo',
  'porno',
  'putilla',
  'mierda',
  'puta',
  'hijo de puta',
  'cabron',
  'maricon',
  'joder',
  'verga',
  'carajo',
  'estupido',
  'idiota',
  'mamaguevo',
  'mamagüevo',
  'pajuo',
  'pajua',
  'guevon',
  'güevón',
  'coño',
  'maldito',
  'mardito',
  'malparido',
  'no joda',
  'nojoda',
  'becerro',
  'elver galarga',
  'rosa meltrozo',
  'benito camelo',
  'alma marcela',
  'susana oria',
  'keka galindo',
  'aquiles baeza',
];

// Inicializar y cargar diccionarios de leo-profanity
leoProfanity.loadDictionary('es');
leoProfanity.add(BAD_WORDS);

export const hasProfanity = (text) => {
  if (!text) return false;
  
  // `check` validará el texto contra el diccionario en español + nuestras custom BAD_WORDS
  return leoProfanity.check(text);
};

export const fuzzyMatchName = (name, text) => {
  if (!name || !text) return false;

  // Normalizar: quitar acentos y pasar a minúsculas
  const normalize = (str) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const normalizedText = normalize(text);
  const nameParts = normalize(name)
    .split(/\s+/)
    .filter((p) => p.length > 2); // Excluir iniciales muy cortas

  if (nameParts.length === 0) return true; // Si solo eran iniciales, lo dejamos pasar

  let matches = 0;
  for (const part of nameParts) {
    // Para "soto", crea la regex: /s+[\s\W]*o+[\s\W]*t+[\s\W]*o+/
    const regexStr = part
      .split('')
      .map((char) => `${char}+`)
      .join('[\\s\\W]*');
    const regex = new RegExp(regexStr);
    if (regex.test(normalizedText)) {
      matches++;
    }
  }

  // Es válido si al menos una parte significativa del nombre (nombre o apellido) se encontró en el CV
  return matches > 0;
};
