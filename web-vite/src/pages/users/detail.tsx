import * as React from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { errorMessage } from "@/api/client";
import { deleteUser, getUser } from "@/api/users";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/lib/async";
import { formatDateTime, initials } from "@/lib/format";
import { UserFormDialog } from "@/pages/users/user-form-dialog";

export function UserDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: user, error, loading, reload } = useAsync((signal) => getUser(id, signal), [id]);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  async function confirmDelete() {
    if (!user) {
      return;
    }
    try {
      await deleteUser(user.id);
      toast.success(`Deleted ${user.name}.`);
      navigate("/users", { replace: true });
    } catch (err: unknown) {
      toast.error(errorMessage(err));
    }
  }

  const back = (
    <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
      <Link to="/users">
        <ArrowLeft />
        Back to users
      </Link>
    </Button>
  );

  if (error) {
    return (
      <>
        {back}
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </>
    );
  }

  if (loading || !user) {
    return (
      <>
        {back}
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </>
    );
  }

  const fields = [
    { label: "Email", value: user.email },
    {
      label: "Role",
      value: (
        <Badge variant="secondary" className="capitalize">
          {user.role}
        </Badge>
      ),
    },
    { label: "Status", value: <StatusBadge status={user.status} /> },
    { label: "User ID", value: <code className="font-mono">{user.id}</code> },
    { label: "Created", value: formatDateTime(user.createdAt) },
  ];

  return (
    <>
      {back}
      <PageHeader
        title={user.name}
        description={user.email}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 />
              Delete
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <Avatar className="size-20">
              <AvatarFallback className="text-2xl">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="text-sm">
              {fields.map((field, index) => (
                <React.Fragment key={field.label}>
                  {index > 0 && <Separator className="my-3" />}
                  <div className="grid grid-cols-3 items-center gap-4">
                    <dt className="text-muted-foreground">{field.label}</dt>
                    <dd className="col-span-2">{field.value}</dd>
                  </div>
                </React.Fragment>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>

      <UserFormDialog open={editOpen} onOpenChange={setEditOpen} user={user} onSaved={reload} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete user?"
        description={`This permanently removes ${user.name}. This action cannot be undone.`}
        onConfirm={confirmDelete}
      />
    </>
  );
}
