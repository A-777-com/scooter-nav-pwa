let isSpeaking = false;
let speechQueue = [];

function processQueue() {
  if (speechQueue.length === 0 || isSpeaking) {
    return;
  }
  
  isSpeaking = true;
  const text = speechQueue.shift();
  
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onend = () => {
      isSpeaking = false;
      // Небольшая пауза между сообщениями
      setTimeout(() => {
        processQueue();
      }, 300);
    };
    
    utterance.onerror = () => {
      isSpeaking = false;
      setTimeout(() => {
        processQueue();
      }, 300);
    };
    
    window.speechSynthesis.speak(utterance);
  } else {
    isSpeaking = false;
    processQueue();
  }
}

export function speak(text) {
  if (!text || text.trim() === '') return;
  
  if ('speechSynthesis' in window) {
    // Добавляем в очередь
    speechQueue.push(text);
    
    // Если ничего не говорится, начинаем обработку очереди
    if (!isSpeaking) {
      processQueue();
    }
  }
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  isSpeaking = false;
  speechQueue = [];
}