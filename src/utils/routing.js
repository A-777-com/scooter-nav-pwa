const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImE2MWQ0NGJiOTUzNjQzMzZiMmEyNzNjNWQ4NzlhNTEyIiwiaCI6Im11cm11cjY0In0=';

export async function getRoute(points, profile = 'foot-walking') {
  console.log('🚀 [ROUTING] Функция getRoute вызвана');
  console.log('📍 [ROUTING] Точки:', points);
  console.log('🚶 [ROUTING] Профиль:', profile);

  if (!ORS_API_KEY || ORS_API_KEY.includes('YOUR_KEY')) {
    console.error('❌ [ROUTING] API ключ не настроен!');
    throw new Error('⚠️ API ключ OpenRouteService не настроен!');
  }

  if (!points || points.length < 2) {
    console.error('❌ [ROUTING] Недостаточно точек:', points);
    throw new Error('Нужно минимум 2 точки для построения маршрута');
  }

  // Конвертация координат
  const coordinates = points.map((p, index) => {
    if (!p || !p.lat || !p.lng) {
      console.error(`❌ [ROUTING] Неверная точка #${index}:`, p);
      throw new Error(`Неверный формат точки #${index}`);
    }
    console.log(`  ✅ Точка #${index}: lat=${p.lat}, lng=${p.lng}`);
    return [p.lng, p.lat]; // ORS требует [lng, lat]
  });

  console.log('📦 [ROUTING] Координаты для API:', coordinates);

  // 👇 ИЗМЕНЕНО: Используем /geojson endpoint
  const url = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;
  
  const requestBody = {
    coordinates: coordinates,
    instructions: true,
    elevation: false
    // НЕ нужно указывать geometry: true для geojson endpoint
  };

  console.log('📤 [ROUTING] URL:', url);
  console.log('📤 [ROUTING] Тело запроса:', JSON.stringify(requestBody, null, 2));

  try {
    console.log('⏳ [ROUTING] Отправка запроса...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': ORS_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 [ROUTING] Ответ получен!');
    console.log('📊 [ROUTING] Статус:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [ROUTING] Ошибка API (статус ' + response.status + '):', errorText);
      
      if (response.status === 401) {
        throw new Error('🔑 Неверный API ключ!');
      }
      if (response.status === 403) {
        throw new Error('🚫 Превышен лимит запросов (40/мин или 2000/день)');
      }
      if (response.status === 404) {
        throw new Error('🗺️ Маршрут не найден между этими точками');
      }
      if (response.status === 500) {
        throw new Error('⚠️ Ошибка сервера ORS. Попробуйте другие точки');
      }
      
      // Пытаемся извлечь понятное сообщение об ошибке
      let errorMsg = `Ошибка API (код ${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error && errorJson.error.message) {
          errorMsg = errorJson.error.message;
        }
      } catch (e) {
        // Если не JSON, используем текст как есть
        if (errorText && errorText.length < 100) {
          errorMsg = errorText;
        }
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log('📊 [ROUTING] Полный ответ API:', data);

    // GeoJSON формат возвращает features
    if (!data.features || data.features.length === 0) {
      console.error('❌ [ROUTING] Нет features в GeoJSON:', data);
      throw new Error('Не удалось построить маршрут');
    }

    const feature = data.features[0];
    console.log('🛣️ [ROUTING] Feature:', feature);

    // Проверяем геометрию
    if (!feature.geometry || !feature.geometry.coordinates) {
      console.error('❌ [ROUTING] Нет геометрии в feature:', feature);
      throw new Error('Маршрут не содержит координат');
    }

    // В GeoJSON координаты уже в правильном формате!
    const coordinates_array = feature.geometry.coordinates;
    
    console.log('✅ [ROUTING] Успешно!');
    console.log('📏 [ROUTING] Координат в маршруте:', coordinates_array.length);
    console.log('📐 [ROUTING] Расстояние:', feature.properties.summary.distance, 'метров');
    console.log('⏱️ [ROUTING] Время:', feature.properties.summary.duration, 'секунд');
    console.log('🔍 [ROUTING] Первые 5 координат:', coordinates_array.slice(0, 5));

    // Извлекаем шаги из segments
    const segments = feature.properties.segments || [];
    const steps = segments.length > 0 && segments[0].steps ? segments[0].steps.map(step => ({
      instruction: step.instruction,
      distance: step.distance,
      duration: step.duration,
      maneuver: step.maneuver
    })) : [];

    const result = {
      coordinates: coordinates_array,
      distance: feature.properties.summary.distance,
      duration: feature.properties.summary.duration,
      steps: steps
    };

    console.log('✅ [ROUTING] Возвращаем результат:', result);
    return result;

  } catch (error) {
    console.error('💥 [ROUTING] Критическая ошибка:', error);
    console.error('💥 [ROUTING] Стек:', error.stack);
    throw error;
  }
}