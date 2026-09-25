import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const examples = [
  {
    title: "Dynamic routes",
    description: "Fetch a list, navigate with URL params, and render nested detail routes.",
    to: "/dynamic",
    tag: "React Router",
  },
  {
    title: "Shared state",
    description: "Share a counter across sibling components without extra providers.",
    to: "/state",
    tag: "Zustand",
  },
  {
    title: "API requests",
    description: "Loading, error handling, and request cancellation against the Go API.",
    to: "/api-demo",
    tag: "Axios",
  },
  {
    title: "Controlled form",
    description: "Validate fields, submit asynchronously, and surface friendly errors.",
    to: "/form",
    tag: "React",
  },
];

const stack = ["Go", "Gin", "React", "React Router", "Zustand", "Vite", "Tailwind CSS", "shadcn/ui"];

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <Badge variant="outline">Go + React · single binary</Badge>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Web template playground
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          A compact example app that demonstrates routing, shared state, API calls, and form
          handling against the embedded Go backend.
        </p>
        <div className="flex flex-wrap gap-2">
          {stack.map((name) => (
            <Badge key={name} variant="secondary">
              {name}
            </Badge>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {examples.map((example) => (
          <Link key={example.to} to={example.to} className="group rounded-xl">
            <Card className="h-full transition-colors group-hover:bg-accent/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{example.tag}</Badge>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <CardTitle className="pt-2">{example.title}</CardTitle>
                <CardDescription>{example.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
