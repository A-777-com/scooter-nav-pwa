import React, { useState, useEffect } from 'react';
import { getPOIEmoji, getPOIName } from '../utils/poiVoice';

function NearbyPOIIndicator({ nearbyPOIs }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!nearbyPOIs || nearbyPOIs.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: isMobile ? 90 : 200,
      left: 10,
      right: 10,
      zIndex: 1000,
      maxWidth: isMobile ? '100%' : 400,
      margin: '0 auto',
      pointerEvents: 'none'
    }}>
      {nearbyPOIs.slice(0, 3).map((poi, index) => (
        <div
          key={poi.id}
          style={{
            background: 'rgba(255, 152, 0, 0.95)',
            color: 'white',
            padding: isMobile ? '8px 12px' : '10px 15px',
            borderRadius: 8,
            marginBottom: 8,
            fontSize: isMobile ? 13 : 14,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            animation: `slideInLeft 0.3s ease-out ${index * 0.1}s both`
          }}
        >
          <span style={{ fontSize: isMobile ? 20 : 24 }}>
            {getPOIEmoji(poi.type)}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: isMobile ? 13 : 14 }}>
              {getPOIName(poi.type)}
            </div>
            <div style={{ fontSize: isMobile ? 11 : 12, opacity: 0.9 }}>
              через {Math.round(poi.distanceM)} м
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NearbyPOIIndicator;