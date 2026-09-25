import * as React from "react";

import { errorMessage, fieldErrors } from "@/api/client";
import { createUser, roles, statuses, updateUser, type User, type UserInput } from "@/api/users";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const emptyInput: UserInput = { name: "", email: "", role: "viewer", status: "active" };

type Errors = Partial<Record<keyof UserInput, string>>;

function validate(values: UserInput): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) {
    errors.name = "Name is required.";
  }
  if (!values.email.includes("@")) {
    errors.email = "Email is invalid.";
  }
  return errors;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

/** Create a user when `user` is null, otherwise edit it. */
export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSaved: (user: User) => void;
}) {
  const [values, setValues] = React.useState<UserInput>(emptyInput);
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setValues(
        user
          ? { name: user.name, email: user.email, role: user.role, status: user.status }
          : emptyInput,
      );
      setErrors({});
    }
  }, [open, user]);

  function update<K extends keyof UserInput>(key: K, value: UserInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const saved = user ? await updateUser(user.id, values) : await createUser(values);
      toast.success(user ? "User updated." : "User created.");
      onSaved(saved);
      onOpenChange(false);
    } catch (error: unknown) {
      const fields = fieldErrors(error);
      if (Object.keys(fields).length > 0) {
        setErrors(fields);
      } else {
        toast.error(errorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate className="grid gap-6">
          <DialogHeader>
            <DialogTitle>{user ? "Edit user" : "New user"}</DialogTitle>
            <DialogDescription>
              {user ? "Update the account details." : "Create an account and assign a role."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                value={values.name}
                aria-invalid={Boolean(errors.name)}
                onChange={(event) => update("name", event.target.value)}
              />
              <FieldError message={errors.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={values.email}
                aria-invalid={Boolean(errors.email)}
                onChange={(event) => update("email", event.target.value)}
              />
              <FieldError message={errors.email} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                  value={values.role}
                  onValueChange={(value) => update("role", value as UserInput["role"])}
                >
                  <SelectTrigger className="w-full capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role} className="capitalize">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.role} />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={values.status}
                  onValueChange={(value) => update("status", value as UserInput["status"])}
                >
                  <SelectTrigger className="w-full capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status} className="capitalize">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.status} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Spinner />}
              {user ? "Save changes" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
