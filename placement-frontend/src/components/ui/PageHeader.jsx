export default function PageHeader({ title, subtitle, actionButton }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle ? <p className="text-base text-zinc-500 dark:text-zinc-400">{subtitle}</p> : null}
      </div>
      {actionButton ? <div>{actionButton}</div> : null}
    </div>
  )
}
