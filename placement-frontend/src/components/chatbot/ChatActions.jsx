import React from 'react';

export default function ChatActions({ actions, primary, isDark, onMessageSend }) {
  if (!actions || actions.length === 0) return null;

  const handleClick = (a) => {
    if (!a?.target) return;
    if (a.type === 'navigate') {
      // Use window location to avoid needing useNavigate here
      window.location.href = a.target;
    } else if (a.type === 'link') {
      window.open(a.target, '_blank', 'noopener,noreferrer');
    } else if (a.type === 'message') {
      onMessageSend?.(a.target);
    }
  };

  return (
    <div
      className="mt-3 flex flex-wrap gap-2 pt-3"
      style={{
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : `${primary}15`}`,
      }}
    >
      {actions.map((a, i) => (
        <button
          key={i}
          type="button"
          onClick={() => handleClick(a)}
          className="rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          style={{
            background: `${primary}18`,
            color: primary,
            border: `1px solid ${primary}30`,
          }}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
