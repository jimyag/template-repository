import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

const order = ["light", "dark", "system"] as const;
const icons = { light: Sun, dark: Moon, system: Monitor };

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = icons[theme];
  const next = order[(order.indexOf(theme) + 1) % order.length];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${theme}. Switch to ${next}.`}
      title={`Theme: ${theme}`}
    >
      <Icon />
    </Button>
  );
}
