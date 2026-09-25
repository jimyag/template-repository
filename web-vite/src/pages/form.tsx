import * as React from "react";
import { CheckCircle2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

type FormValues = {
  email: string;
  name: string;
  note: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function validateForm(values: FormValues) {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required.";
  }
  if (!values.email.includes("@")) {
    errors.email = "Email must contain @.";
  }
  if (values.note.trim().length < 10) {
    errors.note = "Note must be at least 10 characters.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

export function FormDemoPage() {
  const [values, setValues] = React.useState<FormValues>({ email: "", name: "", note: "" });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState<FormValues | null>(null);

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    setSubmitted(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    setSubmitting(false);
    setSubmitted(values);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Controlled form"
        description="Explicit validation, async submit simulation, and visible field errors."
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>All fields are required.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={values.name}
                aria-invalid={Boolean(errors.name)}
                onChange={(event) => updateField("name", event.target.value)}
              />
              <FieldError message={errors.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                aria-invalid={Boolean(errors.email)}
                onChange={(event) => updateField("email", event.target.value)}
              />
              <FieldError message={errors.email} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                rows={4}
                value={values.note}
                aria-invalid={Boolean(errors.note)}
                onChange={(event) => updateField("note", event.target.value)}
              />
              <FieldError message={errors.note} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={submitting}>
              {submitting && <Spinner />}
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {submitted && (
        <Alert className="max-w-xl">
          <CheckCircle2 />
          <AlertTitle>Submitted payload</AlertTitle>
          <AlertDescription>
            <pre className="w-full overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs text-foreground">
              {JSON.stringify(submitted, null, 2)}
            </pre>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
