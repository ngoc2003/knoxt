import { useState } from "react";
import { Link } from "react-router";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Users,
  DollarSign,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { CustomerModal } from "../components/CustomerModal";
import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  totalIncome: number;
  status: "active" | "inactive";
  avatar?: string;
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@acmecorp.com",
    phone: "+1 (555) 123-4567",
    company: "Acme Corporation",
    totalIncome: 24500,
    status: "active",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael@techstart.io",
    phone: "+1 (555) 234-5678",
    company: "TechStart Inc",
    totalIncome: 18750,
    status: "active",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.r@designstudio.co",
    phone: "+1 (555) 345-6789",
    company: "Design Studio",
    totalIncome: 12300,
    status: "active",
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james@globalbrands.com",
    phone: "+1 (555) 456-7890",
    company: "Global Brands",
    totalIncome: 31200,
    status: "active",
  },
  {
    id: "5",
    name: "Linda Martinez",
    email: "linda@startupxyz.com",
    phone: "+1 (555) 567-8901",
    company: "StartupXYZ",
    totalIncome: 8900,
    status: "inactive",
  },
  {
    id: "6",
    name: "Robert Taylor",
    email: "robert@innovatetech.com",
    phone: "+1 (555) 678-9012",
    company: "InnovateTech",
    totalIncome: 15600,
    status: "active",
  },
];

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (customerData: Partial<Customer>) => {
    if (editingCustomer) {
      // Update existing
      setCustomers(
        customers.map((c) =>
          c.id === editingCustomer.id ? { ...c, ...customerData } : c,
        ),
      );
    } else {
      // Add new
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: customerData.name || "",
        email: customerData.email || "",
        phone: customerData.phone || "",
        company: customerData.company || "",
        totalIncome: 0,
        status: "active",
      };
      setCustomers([newCustomer, ...customers]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setDeleteCustomer(customer);
  };

  const confirmDelete = () => {
    if (deleteCustomer) {
      setCustomers(customers.filter((c) => c.id !== deleteCustomer.id));
      setDeleteCustomer(null);
    }
  };

  const totalIncome = customers.reduce((sum, c) => sum + c.totalIncome, 0);
  const activeCustomers = customers.filter((c) => c.status === "active").length;

  // Empty state
  if (!isLoading && customers.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your client relationships
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No customers yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first customer. Keep track of all your
              clients in one place.
            </p>
            <Button
              onClick={handleAddCustomer}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Customer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your client relationships
          </p>
        </div>
        <Button
          onClick={handleAddCustomer}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">
                {customers.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">
                {activeCustomers}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">
                ${totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search customers by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>

          {/* Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-gray-50 border-gray-200">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="text-right">Total Income</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <p className="text-gray-500">No customers found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <TableCell>
                    <Link to={`/customers/${customer.id}`}>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-900">
                          {customer.name}
                        </span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">{customer.email}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">{customer.phone}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900">{customer.company}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium text-gray-900">
                      ${customer.totalIncome.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        customer.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/customers/${customer.id}`}
                            className="flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteCustomer(customer)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredCustomers.map((customer) => (
          <Link
            key={customer.id}
            to={`/customers/${customer.id}`}
            className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                    {customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">{customer.name}</h3>
                  <p className="text-sm text-gray-600">{customer.company}</p>
                </div>
              </div>
              <Badge
                className={
                  customer.status === "active"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }
              >
                {customer.status}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-900 font-medium">
                <DollarSign className="w-4 h-4" />
                <span>${customer.totalIncome.toLocaleString()} total</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination (placeholder) */}
      {filteredCustomers.length > 0 && (
        <div className="mt-6 flex items-center justify-center">
          <p className="text-sm text-gray-600">
            Showing {filteredCustomers.length} of {customers.length} customers
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={editingCustomer}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={!!deleteCustomer}
        onClose={() => setDeleteCustomer(null)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete ${deleteCustomer?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
