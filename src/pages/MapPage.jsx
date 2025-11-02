import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RouteControls from '../components/RouteControls';
import POIPanel from '../components/POIPanel';
import NavigationPanel from '../components/NavigationPanel';
import NearbyPOIIndicator from '../components/NearbyPOIIndicator';
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

// Иконки
const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: '<div class="user-pulse"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const startIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><circle cx="12" cy="12" r="10" fill="#4CAF50"/><text x="12" y="17" font-size="14" text-anchor="middle" fill="white" font-weight="bold">A</text></svg>'),
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const finishIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><circle cx="12" cy="12" r="10" fill="#F44336"/><text x="12" y="17" font-size="14" text-anchor="middle" fill="white" font-weight="bold">B</text></svg>'),
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// Компонент автоцентрирования
function AutoCenter({ center, enabled }) {
  const map = useMap();
  
  useEffect(() => {
    if (enabled && center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, enabled, map]);
  
  return null;
}

// Компонент для кликов по карте
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
}

// Основной компонент страницы
function MapPage() {
  // Состояния
  const [userPosition, setUserPosition] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  
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

  const [mode, setMode] = useState('simple');
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [autoCenterEnabled, setAutoCenterEnabled] = useState(true);
  
  const [isAddingPOI, setIsAddingPOI] = useState(false);
  const [selectedPOIType, setSelectedPOIType] = useState(null);
  
  const [voiceAssistantEnabled, setVoiceAssistantEnabled] = useState(true);
  const [poiAlertDistance, setPoiAlertDistance] = useState(30);
  const [nearbyPOIs, setNearbyPOIs] = useState([]);
  
  // Refs
  const watchIdRef = useRef(null);
  const announcedStepsRef = useRef(new Set());
  const announcedPOIsRef = useRef(new Set());
  const mapRef = useRef(null);

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
        },
        (error) => {
          console.warn('⚠️ GPS недоступен, используем дефолтную позицию');
          setUserPosition({ lat: 55.884772, lng: 37.651726 }); 
        }
      );
    } else {
      setUserPosition({ lat: 55.7558, lng: 37.6173 });
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
          console.warn('⚠️ Геолокация недоступна во время навигации');
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
      }
    }
    
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isNavigating, voiceAssistantEnabled, customMarkers, poiAlertDistance]);

  // Расчёт расстояния
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Проверка близости к следующему шагу
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
    
    if (distance < 0.01 && !announcedStepsRef.current.has(currentStepIndex)) {
      const instruction = translateInstruction(nextStep.instruction);
      speak(instruction);
      announcedStepsRef.current.add(currentStepIndex);
      
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 3000);
    }
  };

  // Проверка близости к POI
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
    
    setNearbyPOIs(nearbyPOIsFound);
  };

  // Обработка клика по карте
  const handleMapClick = (latlng) => {
    console.log('🖱️ Клик по карте:', latlng);
    
    if (isAddingPOI && selectedPOIType) {
      console.log('📍 Добавляем POI метку:', selectedPOIType);
      const marker = {
        id: Date.now(),
        type: selectedPOIType,
        position: { ...latlng }
      };
      setCustomMarkers(prev => [...prev, marker]);
      setIsAddingPOI(false);
      setSelectedPOIType(null);
      return;
    }
    
    if (mode === 'simple') {
      if (!startPoint) {
        setStartPoint(latlng);
      } else if (!endPoint) {
        setEndPoint(latlng);
      } else {
        setStartPoint(latlng);
        setEndPoint(null);
        setWaypoints([]);
        setRoute(null);
        setRouteInfo(null);
      }
    } else {
      if (!startPoint) {
        setStartPoint(latlng);
      } else if (!endPoint) {
        setWaypoints(prev => [...prev, latlng]);
      } else {
        setStartPoint(latlng);
        setEndPoint(null);
        setWaypoints([]);
        setRoute(null);
        setRouteInfo(null);
      }
    }
  };

  const setFinishPoint = () => {
    if (waypoints.length === 0) {
      alert('⚠️ Добавьте хотя бы одну промежуточную точку!');
      return;
    }
    const lastWaypoint = waypoints[waypoints.length - 1];
    setEndPoint(lastWaypoint);
    setWaypoints(prev => prev.slice(0, -1));
  };

  const buildRoute = async () => {
    if (!startPoint || !endPoint) {
      alert('❌ Укажите точки старта и финиша!');
      return;
    }

    try {
      const points = mode === 'simple' 
        ? [startPoint, endPoint]
        : [startPoint, ...waypoints, endPoint];
      
      const routeData = await getRoute(points, 'foot-walking');
      
      const SCOOTER_SPEED_MULTIPLIER = 0.4;
      const scooterTimeMinutes = Math.round((routeData.duration * SCOOTER_SPEED_MULTIPLIER) / 60);
      const distanceKm = (routeData.distance / 1000).toFixed(2);
      
      setRoute(routeData);
      setRouteInfo({
        distance: distanceKm,
        duration: scooterTimeMinutes
      });

      console.log('✅ Маршрут построен:', distanceKm, 'км,', scooterTimeMinutes, 'мин');
    } catch (error) {
      alert('❌ Ошибка: ' + error.message);
    }
  };

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
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    stopSpeaking();
  };

  const removeWaypoint = (index) => {
    setWaypoints(prev => prev.filter((_, i) => i !== index));
  };

  const startAddingPOI = (type) => {
    setIsAddingPOI(true);
    setSelectedPOIType(type);
  };

  const cancelAddingPOI = () => {
    setIsAddingPOI(false);
    setSelectedPOIType(null);
  };

  const removePOI = (id) => {
    setCustomMarkers(prev => prev.filter(m => m.id !== id));
  };

  const clearRoute = () => {
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
    if (window.confirm('🗑️ Удалить все метки?')) {
      setCustomMarkers([]);
      localStorage.removeItem('scooter-nav-markers');
      alert('✅ Все метки удалены');
    }
  };

  if (!userPosition) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        🔄 Загрузка карты...
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      
      {isAddingPOI && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2000,
          background: '#FF9800',
          color: 'white',
          padding: '15px 25px',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          fontSize: 16,
          fontWeight: 'bold',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: 15
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
              fontSize: 14
            }}
          >
            ✕ Отмена
          </button>
        </div>
      )}

      <MapContainer
        center={userPosition}
        zoom={15}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        attributionControl={false}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onMapClick={handleMapClick} />
        <AutoCenter center={autoCenterEnabled && isNavigating ? userPosition : null} enabled={autoCenterEnabled && isNavigating} />
        
        {userPosition && <Marker position={userPosition} icon={userIcon} />}
        {startPoint && <Marker position={startPoint} icon={startIcon} />}
        {endPoint && <Marker position={endPoint} icon={finishIcon} />}
        
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
                setWaypoints(prev => {
                  const updated = [...prev];
                  updated[idx] = newPos;
                  return updated;
                });
              }
            }}
          />
        ))}
        
        {route && route.coordinates && route.coordinates.length > 0 && (
          <Polyline
            positions={route.coordinates.map(c => [c[1], c[0]])}
            color="#13f25a"
            weight={5}
            opacity={0.6}
          />
        )}
        
        {customMarkers.map(marker => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={L.icon({
              iconUrl: `/assets/${marker.type}.svg`,
              iconSize: [32, 32],
              iconAnchor: [16, 32]
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
      
      <POIPanel 
        onAddPOI={startAddingPOI} 
        isAddingPOI={isAddingPOI}
        selectedPOIType={selectedPOIType}
        markersCount={customMarkers.length}
        onClearMarkers={clearAllMarkers}
      />
      
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

      {isNavigating && voiceAssistantEnabled && (
        <NearbyPOIIndicator nearbyPOIs={nearbyPOIs} />
      )}
    </div>
  );
}

export default MapPage;