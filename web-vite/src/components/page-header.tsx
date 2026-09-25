import type * as React from "react";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
