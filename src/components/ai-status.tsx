export function statusStyle(status: string) {
  const base = "font-mono text-xs";
  if (status === "shipped") return `${base} text-accent-emerald`;
  if (status === "building") return `${base} text-accent-amber`;
  return `${base} text-subtle`;
}
