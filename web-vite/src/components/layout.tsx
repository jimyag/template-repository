import { Box } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";

import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/dynamic", label: "Routing" },
  { to: "/state", label: "State" },
  { to: "/api-demo", label: "API" },
  { to: "/form", label: "Form" },
];

export function Layout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Box className="size-5" />
            <span>Template</span>
          </Link>

          <nav aria-label="Examples" className="-mx-1 flex flex-1 gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <ModeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-2 px-4 py-5 text-sm text-muted-foreground sm:px-6">
          <span>Served from a single Go binary with embedded assets.</span>
          <span>Gin · React · shadcn/ui</span>
        </div>
      </footer>
    </div>
  );
}
