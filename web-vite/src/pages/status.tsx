import { isRouteErrorResponse, Link, useRouteError } from "react-router";

import { Button } from "@/components/ui/button";

function StatusPage({
  code,
  title,
  description,
}: {
  code: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">{code}</p>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="max-w-md text-muted-foreground">{description}</p>
      <div className="flex gap-2">
        <Button asChild>
          <Link to="/">Go to dashboard</Link>
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      description="The page you are looking for does not exist or has been moved."
    />
  );
}

/** Router `errorElement`: renders uncaught render/loader errors. */
export function ErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  return (
    <div className="min-h-svh">
      <StatusPage
        code="Error"
        title="Something went wrong"
        description={error instanceof Error ? error.message : "An unexpected error occurred."}
      />
    </div>
  );
}
