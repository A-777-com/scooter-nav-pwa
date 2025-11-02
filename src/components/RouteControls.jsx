import React from 'react';

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
  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      right: 10,
      zIndex: 1000,
      background: '#2196f3',
      borderRadius: 12,
      padding: 15,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      maxWidth: 400
    }}>
      <h2 style={{ margin: 0, fontSize: 30, marginBottom: 10, color: '#333' }}>
                🛴 Катим в школу
      </h2>
      
      {/* Режим */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 5 }}>
          Режим маршрута:
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => {
              setMode('simple');
              onClearRoute();
            }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 8,
              border: mode === 'simple' ? '2px solid #4A90E2' : '2px solid #ddd',
              background: mode === 'simple' ? '#E3F2FD' : 'white',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 'bold'
            }}
          >
            Простой
          </button>
          <button
            onClick={() => {
              setMode('advanced');
              onClearRoute();
            }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 8,
              border: mode === 'advanced' ? '2px solid #4A90E2' : '2px solid #ddd',
              background: mode === 'advanced' ? '#E3F2FD' : 'white',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 'bold'
            }}
          >
            Продвинутый
          </button>
        </div>
      </div>

      {/* Инструкции */}
      <div style={{ 
        fontSize: 12, 
        padding: 10, 
        background: '#f5f5f5', 
        borderRadius: 6,
        marginBottom: 10,
        color: '#666'
      }}>
        {mode === 'simple' ? (
          <>
            <strong>📌 Простой режим:</strong><br/>
            1. Кликните на карту → установится старт (A)<br/>
            2. Кликните второй раз → установится финиш (B)<br/>
            3. Нажмите "Построить маршрут"
          </>
        ) : (
          <>
            <strong>📌 Продвинутый режим:</strong><br/>
            1. Кликните на карту → установится старт (A)<br/>
            2. Кликайте ещё → добавятся промежуточные точки<br/>
            3. Нажмите "Установить финиш" → последняя точка станет финишем<br/>
            4. Нажмите "Построить маршрут"
          </>
        )}
      </div>
      
      {/* Статус точек */}
      <div style={{ fontSize: 13, marginBottom: 10, color: 'black' }}>
        {startPoint ? (
          <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>✅ Точка старта установлена</div>
        ) : (
          <div style={{ color: 'black' }}>⭕ Кликните на карту для установки старта</div>
        )}
        
        {mode === 'advanced' && waypoints.length > 0 && (
          <div style={{ marginTop: 5 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 3 }}>
              📍 Промежуточных точек: {waypoints.length}
            </div>
            <div style={{ maxHeight: 80, overflowY: 'auto' }}>
              {waypoints.map((wp, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: 3,
                  padding: '3px 6px',
                  background: '#fff3e0',
                  borderRadius: 4
                }}>
                  <span style={{ fontSize: 12 }}>Точка {idx + 1}</span>
                  <button
                    onClick={() => onRemoveWaypoint(idx)}
                    style={{
                      padding: '2px 8px',
                      fontSize: 11,
                      borderRadius: 4,
                      border: 'none',
                      background: '#ff4444',
                      color: 'white',
                      cursor: 'pointer'
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
              padding: '10px',
              marginTop: 8,
              borderRadius: 8,
              border: '2px solid #4CAF50',
              background: '#E8F5E9',
              color: '#2E7D32',
              fontSize: 14,
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🏁 Установить финиш
          </button>
        )}
        
        {endPoint && (
          <div style={{ color: '#F44336', fontWeight: 'bold', marginTop: 5 }}>
            ✅ Точка финиша установлена
          </div>
        )}
      </div>
      
      {/* Информация о маршруте */}
      {routeInfo && (
        <div style={{
          background: '#E8F5E9',
          padding: 10,
          borderRadius: 8,
          marginBottom: 10,
          fontSize: 14
        }}>
          <div>📏 Расстояние: <strong>{routeInfo.distance} км</strong></div>
          <div>⏱️ Время: <strong>{routeInfo.duration} мин</strong></div>
        </div>
      )}
      
      {/* Кнопки действий */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={onBuildRoute}
          disabled={!startPoint || !endPoint}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: 'none',
            background: startPoint && endPoint ? '#0526ff' : '#ccc',
            color: 'white',
            fontSize: 15,
            fontWeight: 'bold',
            cursor: startPoint && endPoint ? 'pointer' : 'not-allowed',
            minWidth: 140
          }}
        >
          🗺️ Построить маршрут
        </button>
        
        {!isNavigating ? (
          <button
            onClick={onStartNavigation}
            disabled={!routeInfo}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: 'none',
              background: routeInfo ? '#4CAF50' : '#ccc',
              color: 'white',
              fontSize: 15,
              fontWeight: 'bold',
              cursor: routeInfo ? 'pointer' : 'not-allowed',
              minWidth: 140
            }}
          >
            ▶️ Начать
          </button>
        ) : (
          <button
            onClick={onStopNavigation}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: 'none',
              background: '#F44336',
              color: 'white',
              fontSize: 15,
              fontWeight: 'bold',
              cursor: 'pointer',
              minWidth: 140
            }}
          >
            ⏸️ Стоп
          </button>
        )}
        
        <button
          onClick={onClearRoute}
          style={{
            padding: 12,
            borderRadius: 8,
            border: 'none',
            background: '#FF9800',
            color: 'white',
            fontSize: 15,
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🗑️
        </button>
      </div>
      
      {/* Автоцентрирование */}
      {isNavigating && (
        <div style={{ marginTop: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoCenterEnabled}
              onChange={(e) => setAutoCenterEnabled(e.target.checked)}
            />
            <span>Следить за моей позицией</span>
          </label>
        </div>
      )}
    </div>
  );
}

export default RouteControls;