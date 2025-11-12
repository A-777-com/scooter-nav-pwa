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
  const COLLAPSED_HEIGHT = 60;

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
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      borderRadius: isMobile ? '0 0 16px 16px' : 16,
      padding: 0,
      boxShadow: isExpanded 
        ? '0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)' 
        : '0 4px 12px rgba(0,0,0,0.1)',
      maxWidth: isMobile ? '100%' : 420,
      maxHeight: isExpanded ? (isMobile ? '70vh' : '85vh') : `${COLLAPSED_HEIGHT}px`,
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      WebkitOverflowScrolling: 'touch',
      border: '1px solid rgba(74, 144, 226, 0.1)'
    }}>
      
      {/* Заголовок с градиентом */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isMobile ? '12px 15px' : '15px 20px',
          background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
          cursor: 'pointer',
          userSelect: 'none',
          borderBottom: isExpanded ? '2px solid rgba(255,255,255,0.2)' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20
          }}>
            🛴
          </div>
          <h2 style={{ 
            margin: 0, 
            fontSize: isMobile ? 17 : 20, 
            color: 'white',
            fontWeight: '700',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            Навигатор
          </h2>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 18,
            transition: 'all 0.2s',
            minWidth: 36,
            minHeight: 36
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          aria-label={isExpanded ? 'Свернуть панель' : 'Развернуть панель'}
        >
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>
      
      {/* Контент */}
      {isExpanded && (
        <div style={{
          padding: isMobile ? '15px' : '20px',
          maxHeight: isMobile ? 'calc(70vh - 60px)' : 'calc(85vh - 60px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          {/* Режим */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ 
              fontSize: isMobile ? 13 : 14, 
              fontWeight: '600', 
              display: 'block', 
              marginBottom: 10,
              color: '#333',
              letterSpacing: '0.3px'
            }}>
              Режим маршрута:
            </label>
            <div style={{ 
              display: 'flex', 
              gap: 10,
              background: '#f5f7fa',
              padding: 4,
              borderRadius: 12
            }}>
              <button
                onClick={() => {
                  setMode('simple');
                  onClearRoute();
                }}
                style={{
                  flex: 1,
                  padding: isMobile ? '12px' : '14px',
                  borderRadius: 10,
                  border: 'none',
                  background: mode === 'simple' 
                    ? 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)' 
                    : 'transparent',
                  color: mode === 'simple' ? 'white' : '#666',
                  cursor: 'pointer',
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: '600',
                  minHeight: 44,
                  transition: 'all 0.3s ease',
                  boxShadow: mode === 'simple' ? '0 2px 8px rgba(74, 144, 226, 0.3)' : 'none',
                  transform: mode === 'simple' ? 'scale(1.02)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (mode !== 'simple') {
                    e.currentTarget.style.background = 'rgba(74, 144, 226, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (mode !== 'simple') {
                    e.currentTarget.style.background = 'transparent';
                  }
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
                  padding: isMobile ? '12px' : '14px',
                  borderRadius: 10,
                  border: 'none',
                  background: mode === 'advanced' 
                    ? 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)' 
                    : 'transparent',
                  color: mode === 'advanced' ? 'white' : '#666',
                  cursor: 'pointer',
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: '600',
                  minHeight: 44,
                  transition: 'all 0.3s ease',
                  boxShadow: mode === 'advanced' ? '0 2px 8px rgba(74, 144, 226, 0.3)' : 'none',
                  transform: mode === 'advanced' ? 'scale(1.02)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (mode !== 'advanced') {
                    e.currentTarget.style.background = 'rgba(74, 144, 226, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (mode !== 'advanced') {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                🗺️ Продвинутый
              </button>
            </div>
          </div>

          {/* Инструкции */}
          <div style={{ 
            fontSize: isMobile ? 11 : 12, 
            padding: isMobile ? '12px' : '14px', 
            background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)', 
            borderRadius: 12,
            marginBottom: 15,
            color: '#1565C0',
            lineHeight: 1.6,
            border: '1px solid rgba(74, 144, 226, 0.2)',
            boxShadow: '0 2px 4px rgba(74, 144, 226, 0.1)'
          }}>
            {mode === 'simple' ? (
              <>
                <strong style={{ display: 'block', marginBottom: 6, fontSize: isMobile ? 12 : 13 }}>
                  📌 Простой режим:
                </strong>
                <div style={{ paddingLeft: 4 }}>
                  1. Кликните на карту → старт (A)<br/>
                  2. Кликните второй раз → финиш (B)<br/>
                  3. Нажмите "Построить маршрут"
                </div>
              </>
            ) : (
              <>
                <strong style={{ display: 'block', marginBottom: 6, fontSize: isMobile ? 12 : 13 }}>
                  📌 Продвинутый режим:
                </strong>
                <div style={{ paddingLeft: 4 }}>
                  1. Кликните → старт (A)<br/>
                  2. Кликайте ещё → промежуточные точки<br/>
                  3. "Установить финиш" → последняя = финиш<br/>
                  4. "Построить маршрут"
                </div>
              </>
            )}
          </div>
          
          {/* Статус */}
          <div style={{ fontSize: isMobile ? 12 : 13, marginBottom: 15 }}>
            {startPoint ? (
              <div style={{ 
                color: '#2E7D32', 
                fontWeight: '600', 
                marginBottom: 8,
                padding: '8px 12px',
                background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                borderRadius: 10,
                border: '1px solid rgba(46, 125, 50, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <span>Старт установлен</span>
              </div>
            ) : (
              <div style={{ 
                color: '#757575', 
                marginBottom: 8,
                padding: '8px 12px',
                background: '#f5f5f5',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ fontSize: 18 }}>⭕</span>
                <span>Кликните на карту для старта</span>
              </div>
            )}
            
            {mode === 'advanced' && waypoints.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ 
                  fontWeight: '600', 
                  marginBottom: 8,
                  color: '#333',
                  fontSize: isMobile ? 12 : 13
                }}>
                  📍 Промежуточных точек: <strong style={{ color: '#4A90E2' }}>{waypoints.length}</strong>
                </div>
                <div style={{ maxHeight: 100, overflowY: 'auto' }}>
                  {waypoints.map((wp, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: 6,
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                      borderRadius: 8,
                      border: '1px solid rgba(255, 152, 0, 0.2)'
                    }}>
                      <span style={{ 
                        fontSize: isMobile ? 12 : 13,
                        fontWeight: '500',
                        color: '#E65100'
                      }}>
                        📍 Точка {idx + 1}
                      </span>
                      <button
                        onClick={() => onRemoveWaypoint(idx)}
                        style={{
                          padding: '6px 12px',
                          fontSize: 12,
                          borderRadius: 6,
                          border: 'none',
                          background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
                          color: 'white',
                          cursor: 'pointer',
                          minHeight: 32,
                          minWidth: 36,
                          fontWeight: 'bold',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 4px rgba(244, 67, 54, 0.3)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
                  padding: isMobile ? '12px' : '14px',
                  marginTop: 10,
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                  color: 'white',
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: '600',
                  cursor: 'pointer',
                  minHeight: 44,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                }}
              >
                🏁 Установить финиш
              </button>
            )}
            
            {endPoint && (
              <div style={{ 
                color: '#C62828', 
                fontWeight: '600', 
                marginTop: 10,
                padding: '8px 12px',
                background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
                borderRadius: 10,
                border: '1px solid rgba(244, 67, 54, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <span>Финиш установлен</span>
              </div>
            )}
          </div>
          
          {/* Информация о маршруте */}
          {routeInfo && (
            <div style={{
              background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
              padding: isMobile ? '14px' : '16px',
              borderRadius: 12,
              marginBottom: 15,
              fontSize: isMobile ? 13 : 14,
              border: '1px solid rgba(76, 175, 80, 0.2)',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.15)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <span style={{ color: '#2E7D32', fontWeight: '500' }}>📏 Расстояние:</span>
                <strong style={{ color: '#1B5E20', fontSize: isMobile ? 15 : 16 }}>
                  {routeInfo.distance} км
                </strong>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#2E7D32', fontWeight: '500' }}>⏱️ Время:</span>
                <strong style={{ color: '#1B5E20', fontSize: isMobile ? 15 : 16 }}>
                  {routeInfo.duration} мин
                </strong>
              </div>
            </div>
          )}
          
          {/* Кнопки */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(2, 1fr)',
            gap: 10
          }}>
            <button
              onClick={onBuildRoute}
              disabled={!startPoint || !endPoint}
              style={{
                gridColumn: isMobile ? 'span 2' : 'auto',
                padding: isMobile ? '14px' : '16px',
                borderRadius: 12,
                border: 'none',
                background: startPoint && endPoint 
                  ? 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)' 
                  : 'linear-gradient(135deg, #ccc 0%, #bbb 100%)',
                color: 'white',
                fontSize: isMobile ? 14 : 15,
                fontWeight: '600',
                cursor: startPoint && endPoint ? 'pointer' : 'not-allowed',
                minHeight: 48,
                transition: 'all 0.3s ease',
                boxShadow: startPoint && endPoint 
                  ? '0 4px 12px rgba(74, 144, 226, 0.3)' 
                  : 'none',
                opacity: startPoint && endPoint ? 1 : 0.6
              }}
              onMouseEnter={(e) => {
                if (startPoint && endPoint) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(74, 144, 226, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (startPoint && endPoint) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.3)';
                }
              }}
            >
              🗺️ Построить маршрут
            </button>
            
            {!isNavigating ? (
              <button
                onClick={onStartNavigation}
                disabled={!routeInfo}
                style={{
                  padding: isMobile ? '14px' : '16px',
                  borderRadius: 12,
                  border: 'none',
                  background: routeInfo 
                    ? 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)' 
                    : 'linear-gradient(135deg, #ccc 0%, #bbb 100%)',
                  color: 'white',
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: '600',
                  cursor: routeInfo ? 'pointer' : 'not-allowed',
                  minHeight: 48,
                  transition: 'all 0.3s ease',
                  boxShadow: routeInfo ? '0 4px 12px rgba(76, 175, 80, 0.3)' : 'none',
                  opacity: routeInfo ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (routeInfo) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (routeInfo) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                  }
                }}
              >
                ▶️ Начать
              </button>
            ) : (
              <button
                onClick={onStopNavigation}
                style={{
                  padding: isMobile ? '14px' : '16px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
                  color: 'white',
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: '600',
                  cursor: 'pointer',
                  minHeight: 48,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(244, 67, 54, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.3)';
                }}
              >
                ⏸️ Стоп
              </button>
            )}
            
            <button
              onClick={onClearRoute}
              style={{
                padding: isMobile ? '14px' : '16px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                color: 'white',
                fontSize: isMobile ? 18 : 20,
                fontWeight: '600',
                cursor: 'pointer',
                minHeight: 48,
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 152, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 152, 0, 0.3)';
              }}
              title="Очистить маршрут"
            >
              🗑️
            </button>
          </div>
          
          {/* Автоцентрирование */}
          {isNavigating && (
            <div style={{ 
              marginTop: 15,
              padding: '12px',
              background: '#f5f7fa',
              borderRadius: 10,
              border: '1px solid rgba(74, 144, 226, 0.1)'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                fontSize: isMobile ? 12 : 13,
                cursor: 'pointer',
                minHeight: 44,
                color: '#333',
                fontWeight: '500'
              }}>
                <input
                  type="checkbox"
                  checked={autoCenterEnabled}
                  onChange={(e) => setAutoCenterEnabled(e.target.checked)}
                  style={{
                    width: 22,
                    height: 22,
                    cursor: 'pointer',
                    accentColor: '#4A90E2'
                  }}
                />
                <span>📍 Следить за моей позицией</span>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RouteControls;