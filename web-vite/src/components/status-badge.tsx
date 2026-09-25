import type { Status } from "@/api/users";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant="outline" className="gap-1.5 capitalize">
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "active" ? "bg-emerald-500" : "bg-muted-foreground/50",
        )}
      />
      {status}
    </Badge>
  );
}
