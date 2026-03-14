type StatePanelProps = {
  title: string;
  description?: string;
};

export function StatePanel({ title, description }: StatePanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-900">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}
