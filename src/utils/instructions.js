const INSTRUCTION_MAP = {
  // Повороты
  'turn left': 'Поверните налево',
  'turn right': 'Поверните направо',
  'turn sharp left': 'Поверните резко налево',
  'turn sharp right': 'Поверните резко направо',
  'turn slight left': 'Поверните слегка налево',
  'turn slight right': 'Поверните слегка направо',
  
  // Движение прямо
  'continue straight': 'Продолжайте прямо',
  'continue': 'Продолжайте движение',
  'go straight': 'Идите прямо',
  'straight': 'Прямо',
  
  // Направления движения (Head)
  'head north': 'Двигайтесь на север',
  'head south': 'Двигайтесь на юг',
  'head east': 'Двигайтесь на восток',
  'head west': 'Двигайтесь на запад',
  'head northeast': 'Двигайтесь на северо-восток',
  'head northwest': 'Двигайтесь на северо-запад',
  'head southeast': 'Двигайтесь на юго-восток',
  'head southwest': 'Двигайтесь на юго-запад',
  'head north-northeast': 'Двигайтесь на север-северо-восток',
  'head north-northwest': 'Двигайтесь на север-северо-запад',
  'head south-southeast': 'Двигайтесь на юг-юго-восток',
  'head south-southwest': 'Двигайтесь на юг-юго-запад',
  'head east-northeast': 'Двигайтесь на восток-северо-восток',
  'head east-southeast': 'Двигайтесь на восток-юго-восток',
  'head west-northwest': 'Двигайтесь на запад-северо-запад',
  'head west-southwest': 'Двигайтесь на запад-юго-запад',
  
  // Прибытие и отправление
  'arrive': 'Вы прибыли',
  'arrive at': 'Вы прибыли к',
  'arrive left': 'Вы прибыли, поверните налево',
  'arrive right': 'Вы прибыли, поверните направо',
  'destination': 'Вы на месте',
  'depart': 'Начните движение',
  
  // Держаться стороны
  'keep left': 'Держитесь левее',
  'keep right': 'Держитесь правее',
  'bear left': 'Уходите левее',
  'bear right': 'Уходите правее',
  
  // Разворот
  'uturn': 'Развернитесь',
  'u-turn': 'Развернитесь',
  'make uturn': 'Выполните разворот',
  'make u-turn': 'Выполните разворот',
  
  // Въезд/выезд
  'enter roundabout': 'Въезжайте на кольцо',
  'exit roundabout': 'Выезжайте с кольца',
  'enter': 'Въезжайте',
  'exit': 'Выезжайте',
  
  // Общие команды
  'go': 'Идите',
  'follow': 'Следуйте',
  'onto': 'на',
  'and': 'и'
};

// Регулярные выражения для сложных команд
const PATTERN_MAP = [
  // Head + направление
  { pattern: /head\s+(north|south|east|west|northeast|northwest|southeast|southwest|north-northeast|north-northwest|south-southeast|south-southwest|east-northeast|east-southeast|west-northwest|west-southwest)/i, 
    handler: (match) => {
      const dir = match[1].toLowerCase();
      const directions = {
        'north': 'север',
        'south': 'юг',
        'east': 'восток',
        'west': 'запад',
        'northeast': 'северо-восток',
        'northwest': 'северо-запад',
        'southeast': 'юго-восток',
        'southwest': 'юго-запад',
        'north-northeast': 'север-северо-восток',
        'north-northwest': 'север-северо-запад',
        'south-southeast': 'юг-юго-восток',
        'south-southwest': 'юг-юго-запад',
        'east-northeast': 'восток-северо-восток',
        'east-southeast': 'восток-юго-восток',
        'west-northwest': 'запад-северо-запад',
        'west-southwest': 'запад-юго-запад'
      };
      return `Двигайтесь на ${directions[dir] || dir}`;
    }
  },
  // Turn onto
  { pattern: /turn\s+(left|right)\s+onto/i, 
    handler: (match) => {
      const dir = match[1] === 'left' ? 'налево' : 'направо';
      return `Поверните ${dir}`;
    }
  }
];

export function translateInstruction(instruction) {
  if (!instruction) return 'Следуйте по маршруту';
  
  const lower = instruction.toLowerCase().trim();
  
  // Сначала проверяем точные совпадения
  for (const [key, value] of Object.entries(INSTRUCTION_MAP)) {
    if (lower === key || lower.startsWith(key + ' ') || lower.endsWith(' ' + key) || lower.includes(' ' + key + ' ')) {
      return value;
    }
  }
  
  // Затем проверяем паттерны
  for (const { pattern, handler } of PATTERN_MAP) {
    const match = lower.match(pattern);
    if (match) {
      return handler(match);
    }
  }
  
  // Частичные совпадения
  for (const [key, value] of Object.entries(INSTRUCTION_MAP)) {
    if (lower.includes(key)) {
      return value;
    }
  }
  
  // Если ничего не найдено, возвращаем оригинал (может быть уже на русском)
  return instruction;
}