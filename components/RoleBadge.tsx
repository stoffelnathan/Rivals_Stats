import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ROLE_STYLES: Record<string, string> = {
  flex: "border-[#f5b942]/50 bg-gradient-to-r from-[#38d9f5]/25 to-[#f5b942]/25 text-[#f5b942]",
  support: "border-emerald-400/50 bg-emerald-500/20 text-emerald-300",
  tank: "border-sky-400/50 bg-sky-500/20 text-sky-300",
  dps: "border-orange-400/50 bg-orange-500/20 text-orange-300",
};

function roleBadgeClass(role: string): string {
  const normalized = role.toLowerCase();

  if (normalized.includes("flex")) return ROLE_STYLES.flex;
  if (normalized.includes("support")) return ROLE_STYLES.support;
  if (normalized.includes("tank") || normalized.includes("vanguard")) {
    return ROLE_STYLES.tank;
  }
  if (normalized.includes("dps") || normalized.includes("duelist")) {
    return ROLE_STYLES.dps;
  }

  return "border-[#93a0dc]/35 bg-[#1e2445] text-[#eef2ff]";
}

export function RoleBadge({
  role,
  className,
}: {
  role: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold uppercase tracking-wide",
        roleBadgeClass(role),
        className,
      )}
    >
      {role}
    </Badge>
  );
}
