import { Minus, Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCounterStore } from "@/store/counter";

function CounterDisplay() {
  const count = useCounterStore((state) => state.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared counter</CardTitle>
        <CardDescription>Both cards subscribe to the same Zustand store.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-5xl font-semibold tracking-tight tabular-nums">{count}</p>
      </CardContent>
    </Card>
  );
}

function CounterControls() {
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controls</CardTitle>
        <CardDescription>Actions update the store; subscribers re-render.</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button variant="outline" onClick={decrement}>
          <Minus /> Decrement
        </Button>
        <Button onClick={increment}>
          <Plus /> Increment
        </Button>
      </CardContent>
    </Card>
  );
}

export function StateDemoPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Shared state" description="A minimal shared store with explicit actions." />
      <div className="grid gap-4 sm:grid-cols-2">
        <CounterDisplay />
        <CounterControls />
      </div>
    </div>
  );
}
