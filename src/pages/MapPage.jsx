import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RouteControls from '../components/RouteControls';
import POIPanel from '../components/POIPanel';
import NavigationPanel from '../components/NavigationPanel';
import NearbyPOIIndicator from '../components/NearbyPOIIndicator';
import InstallPrompt from '../components/InstallPrompt';
import { getRoute } from '../utils/routing';
import { speak, stopSpeaking } from '../utils/speech';
import { translateInstruction } from '../utils/instructions';
import { getPOIVoiceMessage, getPOIPriority } from '../utils/poiVoice';

// Fix для иконок Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ══════════════════════════════════════════════════
// ИКОНКИ ДЛЯ МАРКЕРОВ
// ══════════════════════════════════════════════════

const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: '<div class="user-pulse"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const startIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
      <text x="12" y="17" font-size="14" text-anchor="middle" fill="white" font-weight="bold">A</text>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const finishIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#F44336"/>
      <text x="12" y="17" font-size="14" text-anchor="middle" fill="white" font-weight="bold">B</text>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// ══════════════════════════════════════════════════
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ══════════════════════════════════════════════════

// Компонент автоцентрирования
function AutoCenter({ center, enabled }) {
  const map = useMap();
  
  useEffect(() => {
    if (enabled && center) {
      map.setView(center, map.getZoom(), { animate: true, duration: 0.5 });
    }
  }, [center, enabled, map]);
  
  return null;
}

// Компонент для обработки кликов по карте
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
}

// ══════════════════════════════════════════════════
// ОСНОВНОЙ КОМПОНЕНТ
// ══════════════════════════════════════════════════

function MapPage() {
  // ════════════════════════════════════════════════
  // СОСТОЯНИЯ
  // ════════════════════════════════════════════════
  
  // Позиция пользователя
  const [userPosition, setUserPosition] = useState(null);
  
  // Точки маршрута
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  
  // Маршрут и информация
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  
  // Пользовательские метки с загрузкой из localStorage
  const [customMarkers, setCustomMarkers] = useState(() => {
    try {
      const savedMarkers = localStorage.getItem('scooter-nav-markers');
      if (savedMarkers) {
        const parsed = JSON.parse(savedMarkers);
        console.log('💾 [LOAD] Загружено меток из localStorage:', parsed.length);
        return parsed;
      }
    } catch (error) {
      console.error('❌ [LOAD] Ошибка загрузки меток:', error);
    }
    return [];
  });
  
  // Режимы
  const [mode, setMode] = useState('simple'); // simple | advanced
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [autoCenterEnabled, setAutoCenterEnabled] = useState(true);
  
  // POI режим
  const [isAddingPOI, setIsAddingPOI] = useState(false);
  const [selectedPOIType, setSelectedPOIType] = useState(null);
  
  // Голосовой ассистент для POI
  const [voiceAssistantEnabled, setVoiceAssistantEnabled] = useState(true);
  const [poiAlertDistance, setPoiAlertDistance] = useState(30);
  const [nearbyPOIs, setNearbyPOIs] = useState([]);
  
  // Мобильная адаптация
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // ════════════════════════════════════════════════
  // REFS
  // ════════════════════════════════════════════════
  
  const watchIdRef = useRef(null);
  const announcedStepsRef = useRef(new Set());
  const announcedPOIsRef = useRef(new Set());
  const mapRef = useRef(null);

  // ════════════════════════════════════════════════
  // ЭФФЕКТЫ
  // ════════════════════════════════════════════════

  // Отслеживание изменения размера экрана
  useEffect(() => {
    let timeoutId;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth <= 768);
      }, 150);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Получение GPS позиции
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserPosition(pos);
          console.log('✅ GPS позиция получена:', pos);
        },
        (error) => {
          console.warn('⚠️ GPS недоступен, используем дефолтную позицию');
          // Дефолтная позиция
          setUserPosition({ lat: 55.884772, lng: 37.651726 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      console.warn('⚠️ Геолокация не поддерживается браузером');
      setUserPosition({ lat: 55.884772, lng: 37.651726 });
    }
  }, []);

  // Автосохранение меток в localStorage
  useEffect(() => {
    try {
      localStorage.setItem('scooter-nav-markers', JSON.stringify(customMarkers));
      console.log('💾 [SAVE] Сохранено меток:', customMarkers.length);
    } catch (error) {
      console.error('❌ [SAVE] Ошибка сохранения меток:', error);
    }
  }, [customMarkers]);

  // Отслеживание позиции во время навигации
  useEffect(() => {
    if (isNavigating && navigator.geolocation) {
      console.log('🎯 Начато отслеживание GPS');
      
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserPosition(pos);
          checkProximityToNextStep(pos);
          checkProximityToPOIs(pos);
        },
        (error) => {
          console.warn('⚠️ Геолокация недоступна во время навигации:', error.message);
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 1000,
          timeout: 10000
        }
      );
    } else {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        console.log('🛑 Отслеживание GPS остановлено');
      }
    }
    
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isNavigating, voiceAssistantEnabled, customMarkers, poiAlertDistance]);

  // ════════════════════════════════════════════════
  // ФУНКЦИИ РАСЧЁТА
  // ════════════════════════════════════════════════

  // Расчёт расстояния между двумя точками (формула Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Радиус Земли в км
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ════════════════════════════════════════════════
  // ФУНКЦИИ НАВИГАЦИИ
  // ════════════════════════════════════════════════

  // Проверка близости к следующему шагу маршрута
  const checkProximityToNextStep = (currentPos) => {
    if (!route || !route.steps || currentStepIndex >= route.steps.length) return;
    
    const nextStep = route.steps[currentStepIndex];
    if (!nextStep || !nextStep.maneuver) return;
    
    const stepLocation = nextStep.maneuver.location;
    const distance = calculateDistance(
      currentPos.lat,
      currentPos.lng,
      stepLocation[1],
      stepLocation[0]
    );
    
    // Если ближе 10 метров и ещё не объявлено
    if (distance < 0.01 && !announcedStepsRef.current.has(currentStepIndex)) {
      const instruction = translateInstruction(nextStep.instruction);
      speak(instruction);
      announcedStepsRef.current.add(currentStepIndex);
      
      console.log('🔊 Озвучен шаг', currentStepIndex, ':', instruction);
      
      // Переход к следующему шагу
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 3000);
    }
  };

  // Проверка близости к POI меткам
  const checkProximityToPOIs = (currentPos) => {
    if (!voiceAssistantEnabled || !isNavigating) return;
    
    const unmarkedPOIs = customMarkers.filter(
      marker => !announcedPOIsRef.current.has(marker.id)
    );
    
    if (unmarkedPOIs.length === 0) return;
    
    const nearbyPOIsFound = unmarkedPOIs
      .map(marker => {
        const distance = calculateDistance(
          currentPos.lat,
          currentPos.lng,
          marker.position.lat,
          marker.position.lng
        );
        
        return {
          ...marker,
          distanceKm: distance,
          distanceM: distance * 1000
        };
      })
      .filter(poi => poi.distanceM <= poiAlertDistance)
      .sort((a, b) => {
        const priorityDiff = getPOIPriority(b.type) - getPOIPriority(a.type);
        if (priorityDiff !== 0) return priorityDiff;
        return a.distanceM - b.distanceM;
      });
    
    // Озвучиваем только самую приоритетную метку
    if (nearbyPOIsFound.length > 0) {
      const poi = nearbyPOIsFound[0];
      const message = getPOIVoiceMessage(poi.type, poi.distanceM);
      
      console.log('🔊 [POI] Озвучка метки:', {
        type: poi.type,
        distance: `${Math.round(poi.distanceM)}м`,
        message
      });
      
      speak(message);
      announcedPOIsRef.current.add(poi.id);
      
      // Если есть ещё метки поблизости, озвучим через паузу
      if (nearbyPOIsFound.length > 1) {
        setTimeout(() => {
          const nextPOI = nearbyPOIsFound[1];
          if (!announcedPOIsRef.current.has(nextPOI.id)) {
            const nextMessage = getPOIVoiceMessage(nextPOI.type, nextPOI.distanceM);
            speak(nextMessage);
            announcedPOIsRef.current.add(nextPOI.id);
          }
        }, 3000);
      }
    }
    
    // Обновляем список для визуализации
    setNearbyPOIs(nearbyPOIsFound);
  };

  // ════════════════════════════════════════════════
  // ОБРАБОТЧИКИ СОБЫТИЙ
  // ════════════════════════════════════════════════

  // Обработка клика по карте
  const handleMapClick = (latlng) => {
    console.log('🖱️ Клик по карте:', latlng);
    console.log('🖱️ Режим:', mode);
    console.log('🖱️ Добавление POI:', isAddingPOI);
    
    // Если активен режим добавления POI
    if (isAddingPOI && selectedPOIType) {
      console.log('📍 Добавляем POI метку:', selectedPOIType);
      const marker = {
        id: Date.now(),
        type: selectedPOIType,
        position: { ...latlng }
      };
      setCustomMarkers(prev => [...prev, marker]);
      
      // Отключаем режим добавления POI
      setIsAddingPOI(false);
      setSelectedPOIType(null);
      return;
    }
    
    // Простой режим
    if (mode === 'simple') {
      if (!startPoint) {
        console.log('✅ Установлен СТАРТ');
        setStartPoint(latlng);
      } else if (!endPoint) {
        console.log('✅ Установлен ФИНИШ');
        setEndPoint(latlng);
      } else {
        console.log('🔄 Сброс точек');
        setStartPoint(latlng);
        setEndPoint(null);
        setWaypoints([]);
        setRoute(null);
        setRouteInfo(null);
      }
    } 
    // Продвинутый режим
    else {
      if (!startPoint) {
        console.log('✅ Установлен СТАРТ (продвинутый режим)');
        setStartPoint(latlng);
      } else if (!endPoint) {
        console.log('➕ Добавлена промежуточная точка');
        setWaypoints(prev => [...prev, latlng]);
      } else {
        console.log('🔄 Сброс точек');
        setStartPoint(latlng);
        setEndPoint(null);
        setWaypoints([]);
        setRoute(null);
        setRouteInfo(null);
      }
    }
  };

  // Установка финиша в продвинутом режиме
  const setFinishPoint = () => {
    if (waypoints.length === 0) {
      alert('⚠️ Добавьте хотя бы одну промежуточную точку перед установкой финиша!');
      return;
    }
    
    const lastWaypoint = waypoints[waypoints.length - 1];
    setEndPoint(lastWaypoint);
    setWaypoints(prev => prev.slice(0, -1));
    console.log('✅ Установлен ФИНИШ:', lastWaypoint);
  };

  // ════════════════════════════════════════════════
  // ПОСТРОЕНИЕ МАРШРУТА
  // ════════════════════════════════════════════════

  const buildRoute = async () => {
    console.log('🎯 [MAP] Начало построения маршрута');
    console.log('🎯 [MAP] startPoint:', startPoint);
    console.log('🎯 [MAP] endPoint:', endPoint);
    console.log('🎯 [MAP] waypoints:', waypoints);
    console.log('🎯 [MAP] mode:', mode);

    if (!startPoint || !endPoint) {
      alert('❌ Укажите точки старта и финиша!\n\n' + 
        (mode === 'simple' 
          ? 'Кликните на карту дважды: сначала старт, потом финиш.'
          : 'Кликните несколько раз для промежуточных точек, затем нажмите "Установить финиш".'));
      return;
    }

    try {
      const points = mode === 'simple' 
        ? [startPoint, endPoint]
        : [startPoint, ...waypoints, endPoint];
      
      console.log('📍 [MAP] Итоговые точки для маршрута:', points);

      // Всегда используем foot-walking для безопасного маршрута
      const routeData = await getRoute(points, 'foot-walking');
      
      console.log('✅ [MAP] Маршрут получен:', routeData);

      // ═══════════════════════════════════════════════
      // 🛴 ПЕРЕСЧЁТ ВРЕМЕНИ ДЛЯ САМОКАТА
      // ═══════════════════════════════════════════════
      
      // Коэффициент скорости (самокат в 2.5 раза быстрее пешехода)
      const SCOOTER_SPEED_MULTIPLIER = 0.4; // 1 / 2.5 = 0.4
      
      // Время от API (для пешехода, в секундах)
      const walkingTimeSeconds = routeData.duration;
      
      // Пересчёт для самоката
      const scooterTimeSeconds = walkingTimeSeconds * SCOOTER_SPEED_MULTIPLIER;
      
      // Конвертация в минуты
      const walkingTimeMinutes = Math.round(walkingTimeSeconds / 60);
      const scooterTimeMinutes = Math.round(scooterTimeSeconds / 60);
      
      // Расстояние в километрах
      const distanceKm = (routeData.distance / 1000).toFixed(2);
      
      // ═══════════════════════════════════════════════
      // 📊 ЛОГИРОВАНИЕ (для отладки)
      // ═══════════════════════════════════════════════
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('📊 РАСЧЁТ ВРЕМЕНИ В ПУТИ');
      console.log('═══════════════════════════════════════');
      console.log('📏 Расстояние:', distanceKm, 'км');
      console.log('🚶 Время пешком (от API):', walkingTimeMinutes, 'мин');
      console.log('🛴 Время на самокате (пересчёт):', scooterTimeMinutes, 'мин');
      console.log('⚡ Ускорение: в', (walkingTimeMinutes / scooterTimeMinutes).toFixed(1), 'раза');
      console.log('💾 Экономия времени:', walkingTimeMinutes - scooterTimeMinutes, 'мин');
      console.log('═══════════════════════════════════════');
      console.log('');

      // Сохраняем маршрут
      setRoute(routeData);
      
      // Сохраняем информацию (с временем для САМОКАТА)
      setRouteInfo({
        distance: distanceKm,
        duration: scooterTimeMinutes
      });

      console.log('💾 [MAP] Маршрут и информация сохранены');

    } catch (error) {
      console.error('💥 [MAP] Ошибка построения маршрута:', error);
      alert('❌ Ошибка построения маршрута:\n\n' + error.message);
    }
  };

  // ════════════════════════════════════════════════
  // УПРАВЛЕНИЕ НАВИГАЦИЕЙ
  // ════════════════════════════════════════════════

  const startNavigation = () => {
    if (!route) {
      alert('❌ Сначала постройте маршрут!');
      return;
    }
    
    setIsNavigating(true);
    setCurrentStepIndex(0);
    announcedStepsRef.current.clear();
    announcedPOIsRef.current.clear();
    
    speak('Навигация началась. Следуйте инструкциям.');
    console.log('▶️ Навигация началась');
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    stopSpeaking();
    console.log('⏸️ Навигация остановлена');
  };

  // ════════════════════════════════════════════════
  // УПРАВЛЕНИЕ ТОЧКАМИ И МЕТКАМИ
  // ════════════════════════════════════════════════

  const removeWaypoint = (index) => {
    console.log('🗑️ Удаление waypoint #', index);
    setWaypoints(prev => prev.filter((_, i) => i !== index));
  };

  const startAddingPOI = (type) => {
    console.log('📍 Активирован режим добавления POI:', type);
    setIsAddingPOI(true);
    setSelectedPOIType(type);
  };

  const cancelAddingPOI = () => {
    console.log('❌ Отмена добавления POI');
    setIsAddingPOI(false);
    setSelectedPOIType(null);
  };

  const removePOI = (id) => {
    console.log('🗑️ Удаление POI метки:', id);
    setCustomMarkers(prev => prev.filter(m => m.id !== id));
  };

  const clearRoute = () => {
    console.log('🗑️ Полный сброс маршрута');
    setStartPoint(null);
    setEndPoint(null);
    setWaypoints([]);
    setRoute(null);
    setRouteInfo(null);
    setIsNavigating(false);
    setCurrentStepIndex(0);
    announcedStepsRef.current.clear();
    stopSpeaking();
  };

  const clearAllMarkers = () => {
    if (window.confirm('🗑️ Удалить все метки?\n\nЭто действие нельзя отменить.')) {
      console.log('🗑️ Очистка всех меток');
      setCustomMarkers([]);
      localStorage.removeItem('scooter-nav-markers');
      alert('✅ Все метки удалены');
    }
  };

  // ════════════════════════════════════════════════
  // ЗАГРУЗКА
  // ════════════════════════════════════════════════

  if (!userPosition) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666',
        flexDirection: 'column',
        gap: 20
      }}>
        <div style={{ fontSize: 48, animation: 'pulse 2s infinite' }}>🛴</div>
        <div>🔄 Загрузка карты...</div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // РЕНДЕР
  // ════════════════════════════════════════════════

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      
      {/* Уведомление о режиме добавления POI */}
      {isAddingPOI && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2000,
          background: '#FF9800',
          color: 'white',
          padding: isMobile ? '12px 20px' : '15px 25px',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          fontSize: isMobile ? 14 : 16,
          fontWeight: 'bold',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 10 : 15,
          maxWidth: '90%'
        }}>
          <span>📍 Кликните на карту для добавления метки</span>
          <button
            onClick={cancelAddingPOI}
            style={{
              background: 'white',
              color: '#FF9800',
              border: 'none',
              padding: '8px 15px',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: isMobile ? 13 : 14,
              minHeight: 36,
              minWidth: isMobile ? 36 : 'auto'
            }}
          >
            {isMobile ? '✕' : '✕ Отмена'}
          </button>
        </div>
      )}

      {/* Карта */}
      <MapContainer
        center={userPosition}
        zoom={15}
        style={{ width: '100%', height: '100%' }}
        zoomControl={!isMobile}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onMapClick={handleMapClick} />
        <AutoCenter 
          center={autoCenterEnabled && isNavigating ? userPosition : null} 
          enabled={autoCenterEnabled && isNavigating} 
        />
        
        {/* Маркер пользователя */}
        {userPosition && <Marker position={userPosition} icon={userIcon} />}
        
        {/* Старт */}
        {startPoint && <Marker position={startPoint} icon={startIcon} />}
        
        {/* Финиш */}
        {endPoint && <Marker position={endPoint} icon={finishIcon} />}
        
        {/* Промежуточные точки (waypoints) */}
        {waypoints.map((wp, idx) => (
          <Marker
            key={idx}
            position={wp}
            icon={L.divIcon({
              className: 'waypoint-marker',
              html: `<div class="waypoint-number">${idx + 1}</div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            })}
            draggable={mode === 'advanced'}
            eventHandlers={{
              dragend: (e) => {
                const newPos = e.target.getLatLng();
                console.log('🔄 Waypoint перемещён:', newPos);
                setWaypoints(prev => {
                  const updated = [...prev];
                  updated[idx] = newPos;
                  return updated;
                });
              }
            }}
          />
        ))}
        
        {/* Линия маршрута */}
        {route && route.coordinates && route.coordinates.length > 0 && (() => {
          console.log('🗺️ [RENDER] Отрисовка маршрута, точек:', route.coordinates.length);
          const positions = route.coordinates.map(c => [c[1], c[0]]);
          
          return (
            <Polyline
              positions={positions}
              color="#13f25a"
              weight={isMobile ? 4 : 5}
              opacity={0.7}
            />
          );
        })()}
        
        {/* Пользовательские POI метки */}
        {customMarkers.map(marker => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={L.icon({
              iconUrl: `/assets/${marker.type}.svg`,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32]
            })}
            eventHandlers={{
              click: () => {
                if (window.confirm('🗑️ Удалить эту метку?')) {
                  removePOI(marker.id);
                }
              }
            }}
          />
        ))}
      </MapContainer>
      
      {/* Панель управления маршрутом */}
      <RouteControls
        mode={mode}
        setMode={setMode}
        onBuildRoute={buildRoute}
        onClearRoute={clearRoute}
        startPoint={startPoint}
        endPoint={endPoint}
        waypoints={waypoints}
        onRemoveWaypoint={removeWaypoint}
        onSetFinish={setFinishPoint}
        routeInfo={routeInfo}
        isNavigating={isNavigating}
        onStartNavigation={startNavigation}
        onStopNavigation={stopNavigation}
        autoCenterEnabled={autoCenterEnabled}
        setAutoCenterEnabled={setAutoCenterEnabled}
      />
      
      {/* Панель POI меток */}
      <POIPanel 
        onAddPOI={startAddingPOI} 
        isAddingPOI={isAddingPOI}
        selectedPOIType={selectedPOIType}
        markersCount={customMarkers.length}
        onClearMarkers={clearAllMarkers}
      />
      
      {/* Панель навигации (показывается во время движения) */}
      {isNavigating && route && route.steps && (
        <NavigationPanel
          steps={route.steps}
          currentStepIndex={currentStepIndex}
          voiceAssistantEnabled={voiceAssistantEnabled}       
          setVoiceAssistantEnabled={setVoiceAssistantEnabled}  
          poiAlertDistance={poiAlertDistance}                
          setPoiAlertDistance={setPoiAlertDistance} 
        />
      )}

      {/* Индикатор ближайших POI */}
      {isNavigating && voiceAssistantEnabled && (
        <NearbyPOIIndicator nearbyPOIs={nearbyPOIs} />
      )}

      {/* Промпт установки PWA */}
      <InstallPrompt />
    </div>
  );
}

export default MapPage;
