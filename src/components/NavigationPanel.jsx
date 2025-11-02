import React, { useState } from 'react';
import { translateInstruction } from '../utils/instructions';

function NavigationPanel({ 
  steps, 
  currentStepIndex,
  voiceAssistantEnabled,
  setVoiceAssistantEnabled,
  poiAlertDistance,
  setPoiAlertDistance
}) {
  const [showSettings, setShowSettings] = useState(false);
  
  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];
  
  if (!currentStep) return null;
  
  return (
    <>
      {/* Основная панель навигации */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 999,
        background: 'rgba(0,0,0,0.85)',
        color: 'white',
        padding: 20,
        borderRadius: 12,
        maxWidth: 320,
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>
          {getDirectionArrow(currentStep.instruction)}
        </div>
        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          {translateInstruction(currentStep.instruction)}
        </div>
        <div style={{ fontSize: 14, opacity: 0.9 }}>
          📏 {currentStep.distance ? `${currentStep.distance.toFixed(0)} м` : ''}
        </div>
        {nextStep && (
          <div style={{ marginTop: 15, fontSize: 13, opacity: 0.7 }}>
            Затем: {translateInstruction(nextStep.instruction)}
          </div>
        )}
      </div>

      {/* Кнопка настроек */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        style={{
          position: 'absolute',
          top: 200,
          right: 10,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: 50,
          height: 50,
          fontSize: 24,
          cursor: 'pointer',
          pointerEvents: 'auto'
        }}
      >
        ⚙️
      </button>

      {/* Панель настроек */}
      {showSettings && (
        <div style={{
          position: 'absolute',
          top: 260,
          right: 10,
          zIndex: 1000,
          background: 'white',
          padding: 15,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          minWidth: 250,
          pointerEvents: 'auto'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: 16, color: '#333' }}>
            🔊 Настройки голоса
          </h3>

          {/* Переключатель голосового ассистента */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 15,
            cursor: 'pointer',
            fontSize: 14
          }}>
            <input
              type="checkbox"
              checked={voiceAssistantEnabled}
              onChange={(e) => setVoiceAssistantEnabled(e.target.checked)}
              style={{
                width: 20,
                height: 20,
                cursor: 'pointer'
              }}
            />
            <span>Голосовые подсказки о метках</span>
          </label>

          {/* Настройка расстояния */}
          {voiceAssistantEnabled && (
            <div>
              <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 8 }}>
                Оповещать за:
              </label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                {[20, 30, 50].map(distance => (
                  <button
                    key={distance}
                    onClick={() => setPoiAlertDistance(distance)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 6,
                      border: poiAlertDistance === distance ? '2px solid #4A90E2' : '2px solid #ddd',
                      background: poiAlertDistance === distance ? '#E3F2FD' : 'white',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 'bold'
                    }}
                  >
                    {distance}м
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 11, color: '#999', fontStyle: 'italic', marginTop: 8 }}>
                {poiAlertDistance === 20 && '⚡ Только для опытных'}
                {poiAlertDistance === 30 && '👍 Рекомендуется'}
                {poiAlertDistance === 50 && '🐌 Заранее предупреждать'}
              </div>
            </div>
          )}

          {/* Кнопка закрытия */}
          <button
            onClick={() => setShowSettings(false)}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: 15,
              borderRadius: 6,
              border: 'none',
              background: '#f5f5f5',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 'bold'
            }}
          >
            ✓ Закрыть
          </button>
        </div>
      )}
    </>
  );
}

function getDirectionArrow(instruction) {
  const lower = instruction.toLowerCase();
  if (lower.includes('left')) return '⬅️';
  if (lower.includes('right')) return '➡️';
  if (lower.includes('straight') || lower.includes('continue')) return '⬆️';
  if (lower.includes('arrive') || lower.includes('destination')) return '🏁';
  return '⬆️';
}

export default NavigationPanel;