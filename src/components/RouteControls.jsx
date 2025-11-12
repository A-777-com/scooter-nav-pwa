import React, { useState, useEffect } from 'react';

function RouteControls({
  mode,
  setMode,
  onBuildRoute,
  onClearRoute,
  startPoint,
  endPoint,
  waypoints,
  onRemoveWaypoint,
  onSetFinish,
  routeInfo,
  isNavigating,
  onStartNavigation,
  onStopNavigation,
  autoCenterEnabled,
  setAutoCenterEnabled
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: isMobile ? 0 : 10,
      right: isMobile ? 0 : 'auto',
      zIndex: 1000,
      background: 'white',
      borderRadius: isMobile ? '0 0 12px 12px' : 12,
      padding: isMobile ? 10 : 15,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      maxWidth: isMobile ? '100%' : 400,
      maxHeight: isMobile ? (isExpanded ? '70vh' : '60px') : 'none',
      overflowY: isMobile && isExpanded ? 'auto' : 'visible',
      transition: 'max-height 0.3s ease',
      WebkitOverflowScrolling: 'touch'
    }}>
      
      {/* Заголовок */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isExpanded ? 10 : 0
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: isMobile ? 16 : 20, 
          color: '#333',
          fontWeight: 'bold'
        }}>
          🛴 Навигатор
        </h2>
        
        {isMobile && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              padding: 5,
              minWidth: 44,
              minHeight: 44,
              color: '#4A90E2'
            }}
            aria-label={isExpanded ? 'Свернуть панель' : 'Развернуть панель'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        )}
      </div>
      
      {/* Контент */}
      {(!isMobile || isExpanded) && (
        <>
          {/* Режим */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ 
              fontSize: isMobile ? 13 : 14, 
              fontWeight: 'bold', 
              display: 'block', 
              marginBottom: 5,
              color: '#555'
            }}>
              Режим маршрута:
            </label>
            <div style={{ display: 'flex', gap: isMobile ? 5 : 10 }}>
              <button
                onClick={() => {
                  setMode('simple');
                  onClearRoute();
                }}
                style={{
                  flex: 1,
                  padding: isMobile ? '10px' : '12px',
                  borderRadius: 8,
                  border: mode === 'simple' ? '2px solid #4A90E2' : '2px solid #ddd',
                  background: mode === 'simple' ? '#E3F2FD' : 'white',
                  cursor: 'pointer',
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 'bold',
                  minHeight: 44,
                  transition: 'all 0.2s'
                }}
              >
                🎯 Простой
              </button>
              <button
                onClick={() => {
                  setMode('advanced');
                  onClearRoute();
                }}
                style={{
                  flex: 1,
                  padding: isMobile ? '10px' : '12px',
                  borderRadius: 8,
                  border: mode === 'advanced' ? '2px solid #4A90E2' : '2px solid #ddd',
                  background: mode === 'advanced' ? '#E3F2FD' : 'white',
                  cursor: 'pointer',
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 'bold',
                  minHeight: 44,
                  transition: 'all 0.2s'
                }}
              >
                🗺️ Продвинутый
              </button>
            </div>
          </div>

          {/* Инструкции */}
          <div style={{ 
            fontSize: isMobile ? 11 : 12, 
            padding: isMobile ? 8 : 10, 
            background: '#f5f5f5', 
            borderRadius: 6,
            marginBottom: 10,
            color: '#666',
            lineHeight: 1.4
          }}>
            {mode === 'simple' ? (
              <>
                <strong>📌 Простой режим:</strong><br/>
                1. Кликните на карту → старт (A)<br/>
                2. Кликните второй раз → финиш (B)<br/>
                3. Нажмите "Построить маршрут"
              </>
            ) : (
              <>
                <strong>📌 Продвинутый режим:</strong><br/>
                1. Кликните → старт (A)<br/>
                2. Кликайте ещё → промежуточные точки<br/>
                3. "Установить финиш" → последняя = финиш<br/>
                4. "Построить маршрут"
              </>
            )}
          </div>
          
          {/* Статус */}
          <div style={{ fontSize: isMobile ? 12 : 13, marginBottom: 10, color: '#666' }}>
            {startPoint ? (
              <div style={{ color: '#4CAF50', fontWeight: 'bold', marginBottom: 5 }}>
                ✅ Старт установлен
              </div>
            ) : (
              <div style={{ color: '#999', marginBottom: 5 }}>
                ⭕ Кликните на карту для старта
              </div>
            )}
            
            {mode === 'advanced' && waypoints.length > 0 && (
              <div style={{ marginTop: 5 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 5 }}>
                  📍 Промежуточных точек: {waypoints.length}
                </div>
                <div style={{ maxHeight: 80, overflowY: 'auto' }}>
                  {waypoints.map((wp, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: 4,
                      padding: '4px 8px',
                      background: '#fff3e0',
                      borderRadius: 4
                    }}>
                      <span style={{ fontSize: isMobile ? 11 : 12 }}>
                        Точка {idx + 1}
                      </span>
                      <button
                        onClick={() => onRemoveWaypoint(idx)}
                        style={{
                          padding: '4px 10px',
                          fontSize: 11,
                          borderRadius: 4,
                          border: 'none',
                          background: '#ff4444',
                          color: 'white',
                          cursor: 'pointer',
                          minHeight: 32,
                          minWidth: 44
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === 'advanced' && startPoint && !endPoint && waypoints.length > 0 && (
              <button
                onClick={onSetFinish}
                style={{
                  width: '100%',
                  padding: isMobile ? 10 : 12,
                  marginTop: 8,
                  borderRadius: 8,
                  border: '2px solid #4CAF50',
                  background: '#E8F5E9',
                  color: '#2E7D32',
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  minHeight: 44
                }}
              >
                🏁 Установить финиш
              </button>
            )}
            
            {endPoint && (
              <div style={{ color: '#F44336', fontWeight: 'bold', marginTop: 5 }}>
                ✅ Финиш установлен
              </div>
            )}
          </div>
          
          {/* Информация о маршруте */}
          {routeInfo && (
            <div style={{
              background: '#E8F5E9',
              padding: isMobile ? 10 : 12,
              borderRadius: 8,
              marginBottom: 10,
              fontSize: isMobile ? 13 : 14
            }}>
              <div>📏 Расстояние: <strong>{routeInfo.distance} км</strong></div>
              <div>⏱️ Время: <strong>{routeInfo.duration} мин</strong></div>
            </div>
          )}
          
          {/* Кнопки */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? 6 : 8
          }}>
            <button
              onClick={onBuildRoute}
              disabled={!startPoint || !endPoint}
              style={{
                gridColumn: isMobile ? 'span 2' : 'auto',
                padding: '12px',
                borderRadius: 8,
                border: 'none',
                background: startPoint && endPoint ? '#4A90E2' : '#ccc',
                color: 'white',
                fontSize: isMobile ? 14 : 15,
                fontWeight: 'bold',
                cursor: startPoint && endPoint ? 'pointer' : 'not-allowed',
                minHeight: 44
              }}
            >
              🗺️ Построить
            </button>
            
            {!isNavigating ? (
              <button
                onClick={onStartNavigation}
                disabled={!routeInfo}
                style={{
                  padding: '12px',
                  borderRadius: 8,
                  border: 'none',
                  background: routeInfo ? '#4CAF50' : '#ccc',
                  color: 'white',
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: 'bold',
                  cursor: routeInfo ? 'pointer' : 'not-allowed',
                  minHeight: 44
                }}
              >
                ▶️ Начать
              </button>
            ) : (
              <button
                onClick={onStopNavigation}
                style={{
                  padding: '12px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#F44336',
                  color: 'white',
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  minHeight: 44
                }}
              >
                ⏸️ Стоп
              </button>
            )}
            
            <button
              onClick={onClearRoute}
              style={{
                padding: '12px',
                borderRadius: 8,
                border: 'none',
                background: '#FF9800',
                color: 'white',
                fontSize: isMobile ? 14 : 15,
                fontWeight: 'bold',
                cursor: 'pointer',
                minHeight: 44
              }}
            >
              🗑️
            </button>
          </div>
          
          {/* Автоцентрирование */}
          {isNavigating && (
            <div style={{ marginTop: 10 }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10, 
                fontSize: isMobile ? 12 : 13, 
                cursor: 'pointer',
                minHeight: 44,
                padding: '8px 0'
              }}>
                <input
                  type="checkbox"
                  checked={autoCenterEnabled}
                  onChange={(e) => setAutoCenterEnabled(e.target.checked)}
                  style={{
                    width: 20,
                    height: 20,
                    cursor: 'pointer'
                  }}
                />
                <span>Следить за моей позицией</span>
              </label>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RouteControls;