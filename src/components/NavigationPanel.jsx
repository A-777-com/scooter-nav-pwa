import React, { useState, useEffect } from 'react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];
  
  if (!currentStep) return null;
  
  return (
    <>
      {/* Кнопка сворачивания/разворачивания */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'absolute',
          top: isMobile ? 10 : 10,
          right: isMobile ? 10 : 10,
          zIndex: 1001,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: isMobile ? 44 : 50,
          height: isMobile ? 44 : 50,
          fontSize: isMobile ? 20 : 24,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          transition: 'all 0.2s',
          pointerEvents: 'auto'
        }}
        aria-label={isCollapsed ? "Развернуть навигацию" : "Свернуть навигацию"}
        title={isCollapsed ? "Развернуть навигацию" : "Свернуть навигацию"}
      >
        {isCollapsed ? '👁️' : '▼'}
      </button>

      {/* Основная панель навигации */}
      {!isCollapsed && (
        <div style={{
          position: 'absolute',
          top: isMobile ? '40%' : '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 999,
          background: 'rgba(0,0,0,0.85)',
          color: 'white',
          padding: isMobile ? 15 : 20,
          borderRadius: 12,
          maxWidth: isMobile ? '90%' : 320,
          width: isMobile ? '90%' : 'auto',
          textAlign: 'center',
          pointerEvents: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
        <div style={{ 
          fontSize: isMobile ? 40 : 48, 
          marginBottom: 10,
          animation: 'fadeIn 0.3s ease-in'
        }}>
          {getDirectionArrow(currentStep.instruction)}
        </div>
        
        <div style={{ 
          fontSize: isMobile ? 16 : 18, 
          fontWeight: 'bold', 
          marginBottom: 10,
          lineHeight: 1.3
        }}>
          {translateInstruction(currentStep.instruction)}
        </div>
        
        <div style={{ 
          fontSize: isMobile ? 13 : 14, 
          opacity: 0.9 
        }}>
          📏 {currentStep.distance ? `${currentStep.distance.toFixed(0)} м` : ''}
        </div>
        
        {nextStep && (
          <div style={{ 
            marginTop: 15, 
            fontSize: isMobile ? 12 : 13, 
            opacity: 0.7,
            lineHeight: 1.3
          }}>
            Затем: {translateInstruction(nextStep.instruction)}
          </div>
        )}
        </div>
      )}

      {/* Кнопка настроек (только когда панель развёрнута) */}
      {!isCollapsed && (
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            position: 'absolute',
            top: isMobile ? 150 : 200,
            right: 10,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: isMobile ? 44 : 50,
            height: isMobile ? 44 : 50,
            fontSize: isMobile ? 20 : 24,
            cursor: 'pointer',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'all 0.2s'
          }}
          aria-label="Настройки навигации"
        >
          ⚙️
        </button>
      )}

      {/* Панель настроек (только когда основная панель развёрнута) */}
      {!isCollapsed && showSettings && (
        <div style={{
          position: 'absolute',
          top: isMobile ? 200 : 260,
          right: 10,
          left: isMobile ? 10 : 'auto',
          zIndex: 1000,
          background: 'white',
          padding: isMobile ? 12 : 15,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          minWidth: isMobile ? 'auto' : 250,
          maxWidth: isMobile ? 'calc(100% - 20px)' : 300,
          pointerEvents: 'auto',
          animation: 'slideInLeft 0.3s ease-out'
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0', 
            fontSize: isMobile ? 15 : 16, 
            color: '#333',
            fontWeight: 'bold'
          }}>
            🔊 Настройки голоса
          </h3>

          {/* Переключатель голосового ассистента */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 15,
            cursor: 'pointer',
            fontSize: isMobile ? 13 : 14,
            minHeight: 44,
            padding: '8px 0'
          }}>
            <input
              type="checkbox"
              checked={voiceAssistantEnabled}
              onChange={(e) => setVoiceAssistantEnabled(e.target.checked)}
              style={{
                width: 20,
                height: 20,
                cursor: 'pointer',
                minWidth: 20
              }}
            />
            <span>Голосовые подсказки о метках</span>
          </label>

          {/* Настройка расстояния */}
          {voiceAssistantEnabled && (
            <div>
              <label style={{ 
                fontSize: isMobile ? 13 : 14, 
                color: '#666', 
                display: 'block', 
                marginBottom: 8,
                fontWeight: '500'
              }}>
                Оповещать за:
              </label>
              
              <div style={{ 
                display: 'flex', 
                gap: 8, 
                marginBottom: 10 
              }}>
                {[20, 30, 50].map(distance => (
                  <button
                    key={distance}
                    onClick={() => setPoiAlertDistance(distance)}
                    style={{
                      flex: 1,
                      padding: isMobile ? '10px' : '8px',
                      borderRadius: 6,
                      border: poiAlertDistance === distance 
                        ? '2px solid #4A90E2' 
                        : '2px solid #ddd',
                      background: poiAlertDistance === distance 
                        ? '#E3F2FD' 
                        : 'white',
                      cursor: 'pointer',
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: 'bold',
                      minHeight: 44,
                      transition: 'all 0.2s'
                    }}
                  >
                    {distance}м
                  </button>
                ))}
              </div>

              <div style={{ 
                fontSize: 11, 
                color: '#999', 
                fontStyle: 'italic', 
                marginTop: 8,
                textAlign: 'center'
              }}>
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
              padding: isMobile ? 12 : 10,
              marginTop: 15,
              borderRadius: 6,
              border: 'none',
              background: '#f5f5f5',
              cursor: 'pointer',
              fontSize: isMobile ? 13 : 14,
              fontWeight: 'bold',
              minHeight: 44,
              color: '#333'
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
  if (!instruction) return '⬆️';
  
  const lower = instruction.toLowerCase();
  
  // Прибытие
  if (lower.includes('arrive') || lower.includes('destination')) return '🏁';
  
  // Повороты
  if (lower.includes('turn left') || lower.includes('bear left') || lower.includes('keep left')) return '⬅️';
  if (lower.includes('turn right') || lower.includes('bear right') || lower.includes('keep right')) return '➡️';
  
  // Разворот
  if (lower.includes('uturn') || lower.includes('u-turn')) return '↩️';
  
  // Направления движения (Head)
  if (lower.includes('head northeast') || lower.includes('northeast')) return '↗️';
  if (lower.includes('head northwest') || lower.includes('northwest')) return '↖️';
  if (lower.includes('head southeast') || lower.includes('southeast')) return '↘️';
  if (lower.includes('head southwest') || lower.includes('southwest')) return '↙️';
  if (lower.includes('head north') || lower.includes(' north')) return '⬆️';
  if (lower.includes('head south') || lower.includes(' south')) return '⬇️';
  if (lower.includes('head east') || lower.includes(' east')) return '➡️';
  if (lower.includes('head west') || lower.includes(' west')) return '⬅️';
  
  // Прямо
  if (lower.includes('straight') || lower.includes('continue') || lower.includes('go straight')) return '⬆️';
  
  // По умолчанию
  return '⬆️';
}

export default NavigationPanel;