import React from 'react';

export function OverlayUnavailable() {
  return (
    <div
      style={{
        alignItems: 'center',
        boxSizing: 'border-box',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
        gap: '8px',
        height: '100vh',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.75)',
        width: '100vw',
      }}
    >
      <div>Overlay unavailable</div>
      <div>Could not connect to this overlay. Check widget URL or backend status.</div>
    </div>
  );
}
