import type { Role } from "@/lib/types";

const roleConfig: Record<Role, { label: string; classes: string }> = {
  sde: { label: "SDE", classes: "text-sky-400 border-sky-400/40" },
  pm: { label: "PM", classes: "text-violet-400 border-violet-400/40" },
  data: { label: "Data", classes: "text-emerald-400 border-emerald-400/40" },
};

export default function RoleBadge({ role }: { role: Role }) {
  const config = roleConfig[role];
  return <span className={`badge ${config.classes}`}>{config.label}</span>;
}
