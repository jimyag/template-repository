import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

// Settings forms are UI-only examples; wire them to your own API.

function ProfileSettings() {
  const account = useAuthStore((state) => state.account);
  const [name, setName] = React.useState(account?.name ?? "");
  const [email, setEmail] = React.useState(account?.email ?? "");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>How your name and email appear to other users.</CardDescription>
      </CardHeader>
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          toast.success("Profile saved.");
        }}
      >
        <CardContent className="grid max-w-md gap-4">
          <div className="grid gap-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t">
          <Button type="submit">Save</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Choose a theme for the admin console.</CardDescription>
      </CardHeader>
      <CardContent className="grid max-w-md grid-cols-3 gap-3">
        {themes.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-accent",
              theme === option.value && "border-primary ring-1 ring-primary",
            )}
            aria-pressed={theme === option.value}
          >
            <option.icon className="size-5" />
            {option.label}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function NotificationSettings() {
  const items = [
    {
      id: "security",
      label: "Security alerts",
      description: "Sign-ins from new devices.",
      defaultChecked: true,
    },
    {
      id: "updates",
      label: "Product updates",
      description: "New features and changes.",
      defaultChecked: false,
    },
    {
      id: "weekly",
      label: "Weekly summary",
      description: "A digest of account activity.",
      defaultChecked: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Pick which emails you receive.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 rounded-lg border p-4"
          >
            <div className="space-y-0.5">
              <Label htmlFor={`notify-${item.id}`}>{item.label}</Label>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <Switch id={`notify-${item.id}`} defaultChecked={item.defaultChecked} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SecuritySettings() {
  const [error, setError] = React.useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = String(form.get("new") ?? "");
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== form.get("confirm")) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    event.currentTarget.reset();
    toast.success("Password updated.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Use at least 8 characters.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <CardContent className="grid max-w-md gap-4">
          <div className="grid gap-2">
            <Label htmlFor="pw-current">Current password</Label>
            <Input
              id="pw-current"
              name="current"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pw-new">New password</Label>
            <Input id="pw-new" name="new" type="password" autoComplete="new-password" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pw-confirm">Confirm new password</Label>
            <Input
              id="pw-confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="border-t">
          <Button type="submit">Update password</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your account and preferences." />
      <Tabs defaultValue="profile" className="gap-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </>
  );
}
