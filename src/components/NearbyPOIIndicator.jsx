import React from 'react';
import { getPOIEmoji, getPOIName } from '../utils/poiVoice';

function NearbyPOIIndicator({ nearbyPOIs }) {
  if (!nearbyPOIs || nearbyPOIs.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: 200,
      left: 10,
      right: 10,
      zIndex: 1000,
      maxWidth: 400,
      margin: '0 auto'
    }}>
      {nearbyPOIs.slice(0, 3).map((poi, index) => (
        <div
          key={poi.id}
          style={{
            background: 'rgba(255, 152, 0, 0.95)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: 8,
            marginBottom: 8,
            fontSize: 14,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            animation: 'slideInLeft 0.3s ease-out'
          }}
        >
          <span style={{ fontSize: 24 }}>{getPOIEmoji(poi.type)}</span>
          <div style={{ flex: 1 }}>
            <div>{getPOIName(poi.type)}</div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>
              через {Math.round(poi.distanceM)} м
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NearbyPOIIndicator;