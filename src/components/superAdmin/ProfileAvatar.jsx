import React from 'react';

export default function ProfileAvatar({ name, size = 64 }) {
  // Simple initials avatar, fallback to user icon if no name
  const initials =
    name && name.trim()
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : '';

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: size * 0.38,
        boxShadow: '0 2px 8px #0ea5e980',
        border: '2px solid #1e293b',
        userSelect: 'none',
      }}
      title={name}
    >
      {initials || (
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M16 16v-1a4 4 0 0 0-8 0v1"/></svg>
      )}
    </div>
  );
}
