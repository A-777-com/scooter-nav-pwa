import React, { useState, useEffect } from 'react';

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Проверка iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Для iOS показываем инструкцию, если ещё не в standalone режиме
    if (iOS && !window.navigator.standalone) {
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('ios-install-prompt-seen');
        if (!hasSeenPrompt) {
          setShowPrompt(true);
        }
      }, 3000);
    }

    // Для Android/Desktop
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const hasSeenPrompt = localStorage.getItem('install-prompt-seen');
      if (!hasSeenPrompt) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`Результат установки: ${outcome}`);
    
    if (outcome === 'accepted') {
      localStorage.setItem('install-prompt-seen', 'true');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem('ios-install-prompt-seen', 'true');
    } else {
      localStorage.setItem('install-prompt-seen', 'true');
    }
  };

  if (!showPrompt) return null;

  // iOS инструкция
  if (isIOS) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'white',
        color: '#333',
        padding: '15px 20px',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        maxWidth: '90%',
        width: 320,
        border: '2px solid #4A90E2'
      }}>
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            background: 'none',
            border: 'none',
            fontSize: 20,
            cursor: 'pointer',
            padding: 5,
            color: '#999'
          }}
        >
          ✕
        </button>
        
        <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#4A90E2' }}>
          📲 Установите приложение
        </div>
        
        <div style={{ fontSize: 13, marginBottom: 10, lineHeight: 1.4 }}>
          Для установки на iOS:
        </div>
        
        <div style={{ fontSize: 12, lineHeight: 1.6, color: '#666' }}>
          1. Нажмите кнопку "Поделиться" <span style={{ fontSize: 16 }}>📤</span><br/>
          2. Выберите "На экран Домой"<br/>
          3. Нажмите "Добавить"
        </div>
      </div>
    );
  }

  // Android/Desktop промпт
  if (!deferredPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: '#4A90E2',
      color: 'white',
      padding: '15px 20px',
      borderRadius: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      maxWidth: '90%',
      width: 320,
      animation: 'slideUp 0.3s ease-out'
    }}>
      <div style={{ fontSize: 15, fontWeight: 'bold', textAlign: 'center' }}>
        📲 Установите приложение
      </div>
      <div style={{ fontSize: 12, textAlign: 'center', opacity: 0.9 }}>
        Для быстрого доступа и работы оффлайн
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={handleInstall}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: 8,
            border: 'none',
            background: 'white',
            color: '#4A90E2',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: 14,
            minHeight: 44
          }}
        >
          Установить
        </button>
        <button
          onClick={handleDismiss}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: 8,
            border: '2px solid white',
            background: 'transparent',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: 14,
            minHeight: 44
          }}
        >
          Позже
        </button>
      </div>
    </div>
  );
}

export default InstallPrompt;