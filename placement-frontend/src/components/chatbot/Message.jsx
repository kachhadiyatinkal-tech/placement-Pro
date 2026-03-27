import React, { useMemo } from 'react';
import ChatActions from './ChatActions';

/**
 * Lightweight markdown renderer supporting **bold**, *italic*, and newlines.
 */
function MarkdownText({ text }) {
  const parts = useMemo(() => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const segments = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((seg, segIdx) => {
        if (seg.startsWith('**') && seg.endsWith('**')) {
          return <strong key={segIdx} className="font-bold">{seg.slice(2, -2)}</strong>;
        }
        if (seg.startsWith('*') && seg.endsWith('*')) {
          return <em key={segIdx}>{seg.slice(1, -1)}</em>;
        }
        return seg;
      });
      return (
        <React.Fragment key={lineIdx}>
          {segments}
          {lineIdx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  }, [text]);

  return <>{parts}</>;
}

export default function Message({ message, primary, secondary, avatarSrc, title, isDark, onMessageSend }) {
  const isBot = message.role === 'bot';

  const bubbleBg = isBot
    ? isDark ? '#27272a' : '#ffffff'
    : undefined;

  const bubbleBorder = isBot
    ? isDark ? '1px solid #3a3a3e' : `1px solid ${primary}15`
    : undefined;

  return (
    <div
      className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
      style={{ animation: 'cbSlide .35s cubic-bezier(0, 0, 0.2, 1)' }}
    >
      {isBot ? (
        <div className="flex flex-col items-start max-w-[90%]">
          <div
            className="rounded-2xl rounded-bl-none px-4 py-3 text-[13.5px] leading-relaxed shadow-sm"
            style={{
              background: bubbleBg,
              border: bubbleBorder,
              color: isDark ? '#e4e4e7' : '#1e293b',
              wordBreak: 'break-word',
            }}
          >
            <MarkdownText text={message.text} />
            <ChatActions
              actions={message.actions}
              primary={primary}
              isDark={isDark}
              onMessageSend={onMessageSend}
            />
          </div>
          <div className="mt-1.5 ml-1 flex items-center gap-1.5 opacity-50">
            <img 
               src={avatarSrc} 
               alt="" 
               className="h-4 w-4 rounded-full object-cover" 
            />
            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: isDark ? '#777' : '#94a3b8' }}>
              {title}
            </span>
          </div>
        </div>
      ) : (
        <div className="max-w-[82%]">
          <div
            className="rounded-2xl rounded-br-none px-4 py-3 text-[13.5px] leading-relaxed text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              wordBreak: 'break-word',
            }}
          >
            <MarkdownText text={message.text} />
          </div>
        </div>
      )}
    </div>
  );
}
