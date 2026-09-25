import * as React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";

import { Layout } from "@/components/layout";
import { ThemeProvider } from "@/components/theme-provider";
import { ApiDemoPage } from "@/pages/api-demo";
import {
  DynamicItemDetailPage,
  DynamicItemIndexPage,
  DynamicItemLayout,
  DynamicListPage,
} from "@/pages/dynamic";
import { FormDemoPage } from "@/pages/form";
import { HomePage } from "@/pages/home";
import { StateDemoPage } from "@/pages/state";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "dynamic",
        children: [
          { index: true, element: <DynamicListPage /> },
          {
            path: ":id",
            element: <DynamicItemLayout />,
            children: [
              { index: true, element: <DynamicItemIndexPage /> },
              { path: "detail", element: <DynamicItemDetailPage /> },
            ],
          },
        ],
      },
      { path: "state", element: <StateDemoPage /> },
      { path: "api-demo", element: <ApiDemoPage /> },
      { path: "form", element: <FormDemoPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);
