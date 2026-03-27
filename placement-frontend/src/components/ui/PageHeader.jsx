export default function PageHeader({ title, subtitle, actionButton }) {
  const words = typeof title === 'string' ? title.split(' ') : [title];
  
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between px-2 mb-8 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-app leading-none uppercase">
          {words.length > 1 ? (
            <>
              {words[0]} <span className="text-brand-500">{words[1]}</span> {words.slice(2).join(' ')}
            </>
          ) : (
            title
          )}
        </h1>
        {subtitle ? (
          <p className="text-xs font-bold uppercase tracking-widest text-muted opacity-60">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actionButton ? <div className="shrink-0">{actionButton}</div> : null}
    </div>
  )
}
