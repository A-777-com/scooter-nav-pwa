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
  const distanceRounded = Math.round(distance);
  
  // Формируем сообщения с расстоянием и рекомендациями
  const messagesWithAdvice = {
    'crosswalk': [
      `Через ${distanceRounded} метров пешеходный переход, будьте внимательны`,
      `Через ${distanceRounded} метров переход через дорогу, снизьте скорость`,
      `Приближаетесь к пешеходному переходу через ${distanceRounded} метров, следите за пешеходами`
    ],
    
    'traffic-light': [
      `Через ${distanceRounded} метров светофор, следите за сигналом`,
      `Через ${distanceRounded} метров светофор, будьте готовы остановиться`,
      `Впереди светофор через ${distanceRounded} метров, обратите внимание на сигнал`
    ],
    
    'bike-lane': [
      `Через ${distanceRounded} метров велодорожка, можно перестроиться`,
      `Через ${distanceRounded} метров велодорожка, безопасный путь впереди`,
      `Впереди велодорожка через ${distanceRounded} метров, рекомендуется использовать`
    ],
    
    'high-curb': [
      `Внимание! Через ${distanceRounded} метров высокий бордюр, будьте осторожны`,
      `Осторожно! Через ${distanceRounded} метров высокий бордюр, снизьте скорость`,
      `Высокий бордюр через ${distanceRounded} метров, будьте внимательны при проезде`
    ],
    
    'bike-parking': [
      `Через ${distanceRounded} метров парковка для самокатов`,
      `Впереди парковка через ${distanceRounded} метров, можно оставить самокат`,
      `Парковка для самокатов через ${distanceRounded} метров`
    ],
    
    'good-surface': [
      `Через ${distanceRounded} метров хорошее покрытие, можно ускориться`,
      `Впереди хорошее покрытие через ${distanceRounded} метров`,
      `Дорога становится лучше через ${distanceRounded} метров`
    ],
    
    'bad-surface': [
      `Внимание! Через ${distanceRounded} метров плохое покрытие, снизьте скорость`,
      `Осторожно! Через ${distanceRounded} метров плохая дорога, будьте внимательны`,
      `Плохое покрытие через ${distanceRounded} метров, рекомендуется снизить скорость`
    ]
  };
  
  const messages = messagesWithAdvice[poiType] || POI_VOICE_MESSAGES[poiType];
  
  if (!messages || messages.length === 0) {
    return `Впереди метка через ${distanceRounded} метров`;
  }
  
  // Выбираем сообщение в зависимости от расстояния
  let message;
  if (distanceRounded <= 15) {
    // Очень близко - используем первое сообщение (более срочное)
    message = messages[0] || messages[Math.floor(Math.random() * messages.length)];
  } else if (distanceRounded <= 30) {
    // Средняя дистанция
    message = messages[1] || messages[0] || messages[Math.floor(Math.random() * messages.length)];
  } else {
    // Далеко - используем третье или случайное
    message = messages[2] || messages[Math.floor(Math.random() * messages.length)];
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