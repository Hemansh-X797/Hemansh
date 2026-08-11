export default function HUDStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line px-4 py-3">
      <div className="font-hud text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className="mt-1 font-hud text-sm text-fg">{value}</div>
    </div>
  );
}
