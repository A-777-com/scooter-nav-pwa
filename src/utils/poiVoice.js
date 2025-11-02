// Словарь голосовых подсказок для каждого типа метки
const POI_VOICE_MESSAGES = {
  'crosswalk': [
    'Впереди пешеходный переход',
    'Приближаетесь к пешеходному переходу',
    'Скоро будет переход через дорогу'
  ],
  
  'traffic-light': [
    'Впереди светофор',
    'Приближаетесь к светофору',
    'Внимание, скоро светофор'
  ],
  
  'bike-lane': [
    'Впереди велодорожка',
    'Можно двигаться по велодорожке',
    'Переходите на велодорожку'
  ],
  
  'high-curb': [
    'Внимание! Впереди высокий бордюр',
    'Осторожно! Высокий бордюр',
    'Будьте внимательны, высокий бордюр впереди'
  ],
  
  'bike-parking': [
    'Впереди парковка для самокатов',
    'Можно оставить самокат впереди',
    'Приближаетесь к парковке'
  ],
  
  'good-surface': [
    'Впереди хорошее покрытие',
    'Дорога становится лучше',
    'Хорошее покрытие впереди'
  ],
  
  'bad-surface': [
    'Внимание! Впереди плохое покрытие',
    'Осторожно! Плохая дорога впереди',
    'Будьте внимательны, плохое покрытие'
  ]
};

// Приоритеты озвучивания (чем выше число, тем важнее)
const POI_PRIORITY = {
  'high-curb': 10,      // Самое важное - безопасность
  'bad-surface': 9,
  'traffic-light': 8,
  'crosswalk': 7,
  'bike-lane': 5,
  'good-surface': 3,
  'bike-parking': 2
};

/**
 * Получить голосовую подсказку для метки
 * @param {string} poiType - Тип метки
 * @param {number} distance - Расстояние до метки в метрах
 * @returns {string} Текст для озвучки
 */
export function getPOIVoiceMessage(poiType, distance) {
  const messages = POI_VOICE_MESSAGES[poiType];
  
  if (!messages || messages.length === 0) {
    return `Впереди метка`;
  }
  
  // Выбираем случайное сообщение для разнообразия
  const randomIndex = Math.floor(Math.random() * messages.length);
  let message = messages[randomIndex];
  
  // Добавляем расстояние для важных меток
  const priority = POI_PRIORITY[poiType] || 0;
  if (priority >= 8 && distance < 50) {
    message += ` через ${Math.round(distance)} метров`;
  }
  
  return message;
}

/**
 * Получить приоритет метки
 * @param {string} poiType - Тип метки
 * @returns {number} Приоритет (0-10)
 */
export function getPOIPriority(poiType) {
  return POI_PRIORITY[poiType] || 0;
}

/**
 * Получить emoji для типа метки
 * @param {string} poiType - Тип метки
 * @returns {string} Emoji
 */
export function getPOIEmoji(poiType) {
  const emojis = {
    'crosswalk': '🚶',
    'traffic-light': '🚦',
    'bike-lane': '🚴',
    'high-curb': '⚠️',
    'bike-parking': '🅿️',
    'good-surface': '✅',
    'bad-surface': '❌'
  };
  
  return emojis[poiType] || '📍';
}

/**
 * Получить название типа метки
 * @param {string} poiType - Тип метки
 * @returns {string} Название
 */
export function getPOIName(poiType) {
  const names = {
    'crosswalk': 'Пешеходный переход',
    'traffic-light': 'Светофор',
    'bike-lane': 'Велодорожка',
    'high-curb': 'Высокий бордюр',
    'bike-parking': 'Парковка',
    'good-surface': 'Хорошее покрытие',
    'bad-surface': 'Плохое покрытие'
  };
  
  return names[poiType] || 'Метка';
}