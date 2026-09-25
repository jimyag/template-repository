import * as React from "react";
import { isCancel } from "axios";

import { errorMessage } from "@/api/client";

export type AsyncState<T> = {
  data: T | null;
  error: string;
  loading: boolean;
};

/**
 * Runs `load` whenever `deps` change, aborting the previous request.
 * Returns the request state and a `reload` function.
 */
export function useAsync<T>(load: (signal: AbortSignal) => Promise<T>, deps: React.DependencyList) {
  const [state, setState] = React.useState<AsyncState<T>>({ data: null, error: "", loading: true });
  const [version, setVersion] = React.useState(0);

  React.useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, error: "", loading: true }));

    load(controller.signal)
      .then((data) => setState({ data, error: "", loading: false }))
      .catch((error: unknown) => {
        if (!isCancel(error)) {
          setState({ data: null, error: errorMessage(error), loading: false });
        }
      });

    return () => controller.abort();
  }, [...deps, version]);

  const reload = React.useCallback(() => setVersion((v) => v + 1), []);

  return { ...state, reload };
}
