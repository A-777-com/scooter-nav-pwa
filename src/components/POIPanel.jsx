import React, { useState, useEffect } from 'react';

const POI_TYPES = [
  { id: 'crosswalk', label: 'Переход', icon: 'crosswalk', emoji: '🚶' },
  { id: 'traffic-light', label: 'Светофор', icon: 'traffic-light', emoji: '🚦' },
  { id: 'bike-lane', label: 'Велодорожка', icon: 'bike-lane', emoji: '🚴' },
  { id: 'high-curb', label: 'Бордюр', icon: 'high-curb', emoji: '⚠️' },
  { id: 'bike-parking', label: 'Парковка', icon: 'bike-parking', emoji: '🅿️' },
  { id: 'good-surface', label: 'Хорошо', icon: 'good-surface', emoji: '✅' },
  { id: 'bad-surface', label: 'Плохо', icon: 'bad-surface', emoji: '❌' }
];

function POIPanel({ onAddPOI, isAddingPOI, selectedPOIType, markersCount, onClearMarkers }) {
  // По умолчанию свернута на всех устройствах
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Высота заголовка в свёрнутом состоянии
  const COLLAPSED_HEIGHT = 56;

  return (
    <div style={{
      position: 'absolute',
      // ИСПРАВЛЕНО: Поднимаем панель выше на мобильных
      bottom: isMobile ? 50 : 10,
      left: isMobile ? 0 : 10,
      right: isMobile ? 0 : 10,
      zIndex: 1000,
      background: 'white',
      borderRadius: isMobile ? '16px 16px 0 0' : 12,
      boxShadow: isExpanded ? '0 -2px 16px rgba(0,0,0,0.25)' : '0 -2px 8px rgba(0,0,0,0.1)',
      maxWidth: isMobile ? '100%' : 600,
      margin: isMobile ? 0 : '0 auto',
      // ИСПРАВЛЕНО: Используем max-height вместо transform
      maxHeight: isExpanded ? '65vh' : `${COLLAPSED_HEIGHT}px`,
      overflow: 'hidden',
      transition: 'max-height 0.3s ease-out, box-shadow 0.3s ease',
      WebkitOverflowScrolling: 'touch',
      // Safe area для iPhone с вырезом
      paddingBottom: isMobile ? 'max(10px, env(safe-area-inset-bottom))' : 0,
      // В свёрнутом состоянии панель не должна блокировать карту
      pointerEvents: 'auto'
    }}>
      
      {/* Индикатор свайпа на мобильных */}
      {isMobile && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 8,
          paddingBottom: 4
        }}>
          <div style={{
            width: 40,
            height: 4,
            background: '#ddd',
            borderRadius: 2
          }} />
        </div>
      )}

      {/* Заголовок с кнопкой сворачивания */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: isMobile ? '8px 15px 12px' : '12px',
          cursor: 'pointer',
          background: 'white',
          userSelect: 'none',
          borderBottom: isExpanded ? '1px solid #eee' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: isMobile ? 15 : 16, 
            color: '#333',
            fontWeight: 'bold'
          }}>
            📌 Метки
          </h3>
          
          {/* Счётчик меток */}
          {markersCount > 0 && (
            <span style={{ 
              fontSize: 12, 
              color: '#666',
              background: '#E3F2FD',
              padding: '2px 8px',
              borderRadius: 10,
              fontWeight: 'bold'
            }}>
              {markersCount}
            </span>
          )}
        </div>
        
        {/* Кнопки управления */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Кнопка очистки (только если есть метки и на десктопе) */}
          {markersCount > 0 && !isMobile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearMarkers();
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: '#ff4444',
                color: 'white',
                fontSize: 11,
                fontWeight: 'bold',
                cursor: 'pointer',
                minHeight: 32
              }}
              title="Удалить все метки"
            >
              🗑️ Очистить
            </button>
          )}

          {/* Кнопка разворачивания (на всех устройствах) */}
          <div style={{
            background: '#E3F2FD',
            borderRadius: 6,
            padding: '4px 12px',
            fontSize: 12,
            fontWeight: 'bold',
            color: '#4A90E2',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            minHeight: 32
          }}>
            {isExpanded ? '▼ Свернуть' : '▲ Открыть'}
          </div>
        </div>
      </div>

      {/* Контент панели */}
      {isExpanded && (
        <div style={{
          padding: isMobile ? '10px 12px 12px' : '12px',
          maxHeight: isMobile ? 'calc(65vh - 70px)' : 'auto',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          
          {/* Кнопка очистки на мобильных (внутри развёрнутой панели) */}
          {isMobile && markersCount > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
              padding: '8px 12px',
              background: '#f5f5f5',
              borderRadius: 8
            }}>
              <span style={{ 
                fontSize: 13, 
                color: '#666',
                fontWeight: '500'
              }}>
                💾 Сохранено: {markersCount}
              </span>
              <button
                onClick={onClearMarkers}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#ff4444',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  minHeight: 36
                }}
              >
                🗑️ Очистить
              </button>
            </div>
          )}

          {/* Кнопки меток */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile 
              ? 'repeat(4, 1fr)' 
              : 'repeat(auto-fit, minmax(90px, 1fr))',
            gap: isMobile ? 6 : 8,
            marginBottom: 8
          }}>
            {POI_TYPES.map(poi => (
              <button
                key={poi.id}
                onClick={() => {
                  onAddPOI(poi.icon);
                  // Вибрация на мобильных
                  if ('vibrate' in navigator) {
                    navigator.vibrate(10);
                  }
                }}
                disabled={isAddingPOI}
                style={{
                  padding: isMobile ? '10px 4px' : '12px 8px',
                  borderRadius: 8,
                  border: selectedPOIType === poi.icon 
                    ? '3px solid #FF9800' 
                    : '2px solid #ddd',
                  background: selectedPOIType === poi.icon 
                    ? '#FFF3E0' 
                    : 'white',
                  cursor: isAddingPOI ? 'not-allowed' : 'pointer',
                  fontSize: isMobile ? 10 : 11,
                  fontWeight: 'bold',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.2s',
                  opacity: isAddingPOI && selectedPOIType !== poi.icon ? 0.5 : 1,
                  minHeight: isMobile ? 64 : 70,
                  boxShadow: selectedPOIType === poi.icon 
                    ? '0 2px 8px rgba(255, 152, 0, 0.3)' 
                    : 'none'
                }}
                onTouchStart={(e) => {
                  if (!isAddingPOI) {
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span style={{ fontSize: isMobile ? 24 : 28 }}>
                  {poi.emoji}
                </span>
                <span style={{ 
                  fontSize: isMobile ? 9 : 11,
                  lineHeight: 1.2,
                  textAlign: 'center'
                }}>
                  {poi.label}
                </span>
              </button>
            ))}
          </div>

          {/* Подсказка */}
          <div style={{ 
            fontSize: isMobile ? 11 : 12, 
            color: '#666', 
            textAlign: 'center',
            fontStyle: 'italic',
            lineHeight: 1.4,
            padding: '10px',
            background: isAddingPOI ? '#FFF3E0' : '#f9f9f9',
            borderRadius: 6,
            border: isAddingPOI ? '2px solid #FF9800' : '1px solid #eee'
          }}>
            {isAddingPOI 
              ? '👆 Кликните на карту в нужном месте' 
              : 'Нажмите на иконку метки, затем кликните на карту'}
          </div>
        </div>
      )}
    </div>
  );
}

export default POIPanel;