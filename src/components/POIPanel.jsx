import React from 'react';

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
  return (
    <div style={{
      position: 'absolute',
      bottom: 10,
      left: 10,
      right: 10,
      zIndex: 1000,
      background: 'white',
      borderRadius: 12,
      padding: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      maxWidth: 600,
      margin: '0 auto'
    }}>
      {/* Заголовок с счётчиком */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 10 
      }}>
        <h3 style={{ margin: 0, fontSize: 16, color: '#333' }}>
          📌 Добавить метку на карту
        </h3>
        
        {/* Счётчик и кнопка очистки */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {markersCount > 0 && (
            <>
              <span style={{ 
                fontSize: 13, 
                color: '#666',
                background: '#E3F2FD',
                padding: '4px 10px',
                borderRadius: 12,
                fontWeight: 'bold'
              }}>
                💾 {markersCount}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Удалить все метки"
              >
                🗑️ Очистить
              </button>
            </>
          )}
        </div>
      </div>

      {/* Кнопки меток */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
        gap: 8
      }}>
        {POI_TYPES.map(poi => (
          <button
            key={poi.id}
            onClick={() => onAddPOI(poi.icon)}
            disabled={isAddingPOI}
            style={{
              padding: '10px 8px',
              borderRadius: 8,
              border: selectedPOIType === poi.icon ? '3px solid #FF9800' : '2px solid #ddd',
              background: selectedPOIType === poi.icon ? '#FFF3E0' : 'white',
              cursor: isAddingPOI ? 'not-allowed' : 'pointer',
              fontSize: 11,
              fontWeight: 'bold',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              transition: 'all 0.2s',
              opacity: isAddingPOI && selectedPOIType !== poi.icon ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isAddingPOI) {
                e.currentTarget.style.background = '#f0f0f0';
                e.currentTarget.style.borderColor = '#4A90E2';
              }
            }}
            onMouseLeave={(e) => {
              if (!isAddingPOI && selectedPOIType !== poi.icon) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#ddd';
              }
            }}
          >
            <span style={{ fontSize: 28 }}>{poi.emoji}</span>
            <span>{poi.label}</span>
          </button>
        ))}
      </div>

      {/* Подсказка */}
      <div style={{ 
        marginTop: 8, 
        fontSize: 11, 
        color: '#666', 
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        {isAddingPOI 
          ? '👆 Теперь кликните на карту в нужном месте' 
          : 'Нажмите на кнопку, затем кликните на карту'}
      </div>
    </div>
  );
}

export default POIPanel;