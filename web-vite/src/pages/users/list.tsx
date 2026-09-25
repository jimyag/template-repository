import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

import { errorMessage } from "@/api/client";
import { deleteUser, listUsers, roles, statuses, type User } from "@/api/users";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAsync } from "@/lib/async";
import { formatDate } from "@/lib/format";
import { UserFormDialog } from "@/pages/users/user-form-dialog";

const PAGE_SIZE = 10;
const ALL = "all";

export function UsersPage() {
  // Filters live in the URL so the list is shareable and survives reloads.
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const role = params.get("role") ?? "";
  const status = params.get("status") ?? "";
  const page = Math.max(Number(params.get("page")) || 1, 1);

  const [search, setSearch] = React.useState(q);
  const [editing, setEditing] = React.useState<User | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<User | null>(null);

  const { data, error, loading, reload } = useAsync(
    (signal) => listUsers({ q, role, status, page, pageSize: PAGE_SIZE }, signal),
    [q, role, status, page],
  );

  function setFilter(key: string, value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      if (key !== "page") {
        next.delete("page");
      }
      return next;
    });
  }

  // Debounce the search box into the URL.
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search !== q) {
        setFilter("q", search.trim());
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) {
      return;
    }
    try {
      await deleteUser(deleting.id);
      toast.success(`Deleted ${deleting.name}.`);
      reload();
    } catch (err: unknown) {
      toast.error(errorMessage(err));
    }
  }

  const totalPages = data ? Math.max(Math.ceil(data.total / data.pageSize), 1) : 1;
  const from = data && data.total > 0 ? (data.page - 1) * data.pageSize + 1 : 0;
  const to = data && from > 0 ? from + data.items.length - 1 : 0;

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage accounts, roles, and access."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New user
          </Button>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name or email..."
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={role || ALL}
            onValueChange={(value) => setFilter("role", value === ALL ? "" : value)}
          >
            <SelectTrigger className="flex-1 capitalize sm:w-36 sm:flex-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All roles</SelectItem>
              {roles.map((r) => (
                <SelectItem key={r} value={r} className="capitalize">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status || ALL}
            onValueChange={(value) => setFilter("status", value === ALL ? "" : value)}
          >
            <SelectTrigger className="flex-1 capitalize sm:w-36 sm:flex-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="gap-0 py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              !data &&
              Array.from({ length: 5 }, (_, row) => (
                <TableRow key={row}>
                  <TableCell colSpan={5} className="px-4">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {error && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-destructive">
                  {error}
                </TableCell>
              </TableRow>
            )}
            {data && data.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No users match the current filters.
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="pl-4">
                  <Link to={`/users/${user.id}`} className="font-medium hover:underline">
                    {user.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="pr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${user.name}`}
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/users/${user.id}`}>View details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => openEdit(user)}>
                        <Pencil />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(user)}>
                        <Trash2 />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{data ? `Showing ${from}–${to} of ${data.total}` : " "}</span>
        <div className="flex items-center gap-2">
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => setFilter("page", String(page - 1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => setFilter("page", String(page + 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editing} onSaved={reload} />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete user?"
        description={
          <>
            This permanently removes{" "}
            <span className="font-medium text-foreground">{deleting?.name}</span>. This action
            cannot be undone.
          </>
        }
        onConfirm={confirmDelete}
      />
    </>
  );
}
