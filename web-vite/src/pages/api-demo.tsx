import * as React from "react";
import { isCancel } from "axios";
import { AlertCircle } from "lucide-react";

import { getItem, type Item } from "@/api/items";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { AsyncState } from "@/lib/async";

export function ApiDemoPage() {
  const [state, setState] = React.useState<AsyncState<Item>>({
    data: null,
    error: "",
    loading: false,
  });
  const controllerRef = React.useRef<AbortController | null>(null);

  const loadItem = React.useCallback(async (id: string) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState({ data: null, error: "", loading: true });

    try {
      const item = await getItem(id, controller.signal);
      setState({ data: item, error: "", loading: false });
    } catch (error: unknown) {
      if (isCancel(error)) {
        setState((current) => ({ ...current, loading: false, error: "Request cancelled." }));
        return;
      }
      setState({
        data: null,
        error: "Request failed. Try an existing item like alpha or beta.",
        loading: false,
      });
    }
  }, []);

  React.useEffect(() => () => controllerRef.current?.abort(), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="API requests"
        description="Load a record, trigger an error, or cancel an in-flight request."
      />

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void loadItem("alpha")} disabled={state.loading}>
          {state.loading && <Spinner />}
          Load alpha
        </Button>
        <Button variant="outline" onClick={() => void loadItem("missing")}>
          Load missing
        </Button>
        <Button variant="ghost" onClick={() => controllerRef.current?.abort()}>
          Cancel request
        </Button>
      </div>

      {state.error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.data && (
        <Card>
          <CardHeader>
            <CardTitle>{state.data.name}</CardTitle>
            <CardDescription>{state.data.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            API payload id: <code className="font-mono text-foreground">{state.data.id}</code>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
