import * as React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";

import { AppLayout, type RouteHandle } from "@/components/app-layout";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardPage } from "@/pages/dashboard";
import { LoginPage } from "@/pages/login";
import { SettingsPage } from "@/pages/settings";
import { ErrorPage, NotFoundPage } from "@/pages/status";
import { UserDetailPage } from "@/pages/users/detail";
import { UsersPage } from "@/pages/users/list";
import "./index.css";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage />, errorElement: <ErrorPage /> },
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
        handle: { crumb: "Dashboard" } satisfies RouteHandle,
      },
      {
        path: "users",
        handle: { crumb: "Users" } satisfies RouteHandle,
        children: [
          { index: true, element: <UsersPage /> },
          {
            path: ":id",
            element: <UserDetailPage />,
            handle: { crumb: (params) => `#${params.id}` } satisfies RouteHandle,
          },
        ],
      },
      {
        path: "settings",
        element: <SettingsPage />,
        handle: { crumb: "Settings" } satisfies RouteHandle,
      },
      {
        path: "*",
        element: <NotFoundPage />,
        handle: { crumb: "Not found" } satisfies RouteHandle,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster richColors={false} />
      </TooltipProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
