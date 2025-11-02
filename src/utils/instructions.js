const INSTRUCTION_MAP = {
  'turn left': 'Поверните налево',
  'turn right': 'Поверните направо',
  'turn sharp left': 'Поверните резко налево',
  'turn sharp right': 'Поверните резко направо',
  'continue straight': 'Продолжайте прямо',
  'continue': 'Продолжайте движение',
  'arrive': 'Вы прибыли',
  'destination': 'Вы на месте',
  'depart': 'Начните движение',
  'keep left': 'Держитесь левее',
  'keep right': 'Держитесь правее'
};

export function translateInstruction(instruction) {
  if (!instruction) return 'Следуйте по маршруту';
  
  const lower = instruction.toLowerCase();
  
  for (const [key, value] of Object.entries(INSTRUCTION_MAP)) {
    if (lower.includes(key)) {
      return value;
    }
  }
  
  return instruction;
}