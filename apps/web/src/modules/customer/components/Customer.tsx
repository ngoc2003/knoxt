import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { Link } from "react-router";
import { debounce } from "lodash";
import { Edit2, Eye, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
import { client } from "@/shared/lib/apollo";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { DeleteConfirmDialog } from "@/shared/components/DeleteConfirmDialog";
import {
  CREATE_CUSTOMER_MUTATION,
  DELETE_CUSTOMER_MUTATION,
  LIST_CUSTOMERS_QUERY,
  UPDATE_CUSTOMER_MUTATION,
} from "../graphql/customer";
import { CustomerModal } from "./CustomerModal";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "inactive";
}

export function Customers() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const updateQuery = useMemo(() => debounce(setQuery, 300), []);

  const { data, loading, refetch } = useQuery(LIST_CUSTOMERS_QUERY, {
    variables: {
      filter: { search: query || undefined },
      pagination: { skip: 0, take: 100 },
    },
    client,
  });
  const [createCustomer] = useMutation(CREATE_CUSTOMER_MUTATION, { client });
  const [updateCustomer] = useMutation(UPDATE_CUSTOMER_MUTATION, { client });
  const [deleteCustomer] = useMutation(DELETE_CUSTOMER_MUTATION, { client });
  const customers =
    (data as { listCustomers?: { items: Customer[] } })?.listCustomers?.items ??
    [];

  const save = async (value: Partial<Customer>) => {
    const data = {
      name: value.name,
      email: value.email,
      phone: value.phone,
      company: value.company,
      ...(editing ? { status: value.status } : {}),
    };
    if (editing) {
      await updateCustomer({ variables: { id: editing.id, data } });
    } else {
      await createCustomer({ variables: { data } });
    }
    setModalOpen(false);
    setEditing(null);
    await refetch();
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Keep client context connected to project knowledge.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Add customer
        </Button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            updateQuery(event.target.value);
          }}
          placeholder="Search customers..."
          className="pl-9"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {!loading &&
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.company || "-"}</TableCell>
                <TableCell>{customer.email || "-"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{customer.status}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/customers/${customer.id}`}>
                          <Eye className="mr-2 size-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditing(customer);
                          setModalOpen(true);
                        }}
                      >
                        <Edit2 className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleting(customer)}>
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <CustomerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={save}
        customer={editing}
      />
      <DeleteConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete customer?"
        description={`Delete ${deleting?.name ?? "this customer"}?`}
        onConfirm={async () => {
          if (!deleting) return;
          await deleteCustomer({ variables: { id: deleting.id } });
          setDeleting(null);
          await refetch();
        }}
      />
    </div>
  );
}
