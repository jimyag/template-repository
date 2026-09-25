import * as React from "react";
import { isCancel } from "axios";
import { AlertCircle } from "lucide-react";
import { Link, Outlet, useParams } from "react-router";

import { getItems, type Item } from "@/api/items";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AsyncState } from "@/lib/async";

export function DynamicListPage() {
  const [state, setState] = React.useState<AsyncState<Item[]>>({
    data: null,
    error: "",
    loading: true,
  });

  React.useEffect(() => {
    const controller = new AbortController();

    getItems(controller.signal)
      .then((items) => setState({ data: items, error: "", loading: false }))
      .catch((error: unknown) => {
        if (isCancel(error)) {
          return;
        }
        setState({ data: null, error: "Failed to load items from /api/items.", loading: false });
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dynamic routes"
        description={
          <>
            Routes under <code className="font-mono text-sm">/dynamic</code> read params and share
            layout state.
          </>
        }
      />

      {state.loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {state.error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Request failed</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.data && (
        <div className="space-y-3">
          {state.data.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
                <CardAction className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/dynamic/${item.id}`}>Open</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/dynamic/${item.id}/detail`}>Nested detail</Link>
                  </Button>
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function DynamicItemLayout() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Item route layout"
        description={
          <>
            Current <code className="font-mono text-sm">:id</code>:{" "}
            <span className="font-medium text-foreground">{id}</span>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/dynamic">Back to list</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link to="detail">Open nested detail</Link>
        </Button>
      </div>

      <Outlet />
    </div>
  );
}

export function DynamicItemIndexPage() {
  const { id } = useParams();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Primary detail view</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        This route renders at <code className="font-mono">/dynamic/{id}</code> and provides a
        stable layout for nested content.
      </CardContent>
    </Card>
  );
}

export function DynamicItemDetailPage() {
  const { id } = useParams();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nested detail view</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Nested child routes still read the same parent param. Current item:{" "}
        <span className="font-medium text-foreground">{id}</span>.
      </CardContent>
    </Card>
  );
}
