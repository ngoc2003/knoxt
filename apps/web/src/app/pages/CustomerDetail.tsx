import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building2,
  DollarSign,
  Calendar,
  FolderKanban,
  FileText,
  User,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Card } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";
import { CustomerModal } from "../components/CustomerModal";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  totalIncome: number;
  status: "active" | "inactive";
  notes?: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  status: "active" | "completed" | "on-hold";
  startDate: string;
  value: number;
}

interface Income {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending";
}

const mockCustomer: Customer = {
  id: "1",
  name: "Sarah Johnson",
  email: "sarah.j@acmecorp.com",
  phone: "+1 (555) 123-4567",
  company: "Acme Corporation",
  totalIncome: 24500,
  status: "active",
  notes:
    "Key contact for web development projects. Prefers weekly check-ins. Responsive to emails.",
  createdAt: "Jan 15, 2026",
};

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    status: "completed",
    startDate: "Jan 20, 2026",
    value: 12000,
  },
  {
    id: "2",
    name: "Mobile App Development",
    status: "active",
    startDate: "Mar 1, 2026",
    value: 8500,
  },
  {
    id: "3",
    name: "Brand Identity",
    status: "completed",
    startDate: "Feb 10, 2026",
    value: 4000,
  },
];

const mockIncome: Income[] = [
  {
    id: "1",
    date: "Apr 1, 2026",
    description: "Website Redesign - Final Payment",
    amount: 6000,
    status: "paid",
  },
  {
    id: "2",
    date: "Mar 15, 2026",
    description: "Mobile App - Milestone 1",
    amount: 4250,
    status: "paid",
  },
  {
    id: "3",
    date: "Mar 1, 2026",
    description: "Website Redesign - Deposit",
    amount: 6000,
    status: "paid",
  },
  {
    id: "4",
    date: "Feb 28, 2026",
    description: "Brand Identity - Full Payment",
    amount: 4000,
    status: "paid",
  },
  {
    id: "5",
    date: "Apr 15, 2026",
    description: "Mobile App - Milestone 2",
    amount: 4250,
    status: "pending",
  },
];

export function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer>(mockCustomer);
  const [projects] = useState<Project[]>(mockProjects);
  const [income] = useState<Income[]>(mockIncome);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSaveCustomer = (customerData: Partial<Customer>) => {
    setCustomer({ ...customer, ...customerData });
    setIsEditModalOpen(false);
  };

  const handleDelete = () => {
    // Navigate back after delete
    navigate("/customers");
  };

  const totalPaid = income
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);
  const totalPending = income
    .filter((i) => i.status === "pending")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="p-6">
      {/* Back Button */}
      <Link
        to="/customers"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Customers</span>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar & Info */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-2xl">
                {customer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                {customer.name}
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {customer.company}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:ml-auto">
            <Badge
              className={
                customer.status === "active"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              }
            >
              {customer.status}
            </Badge>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
              className="border-gray-300"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Email</p>
              <p className="text-sm font-medium text-gray-900">
                {customer.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Phone</p>
              <p className="text-sm font-medium text-gray-900">
                {customer.phone}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Customer Since</p>
              <p className="text-sm font-medium text-gray-900">
                {customer.createdAt}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">
                ${customer.totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">
                {projects.filter((p) => p.status === "active").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Projects</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">
                {projects.filter((p) => p.status === "completed").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card className="p-6 bg-white border border-gray-200 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Full Name
                </label>
                <p className="text-gray-900 mt-1">{customer.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Email Address
                </label>
                <p className="text-gray-900 mt-1">{customer.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Phone Number
                </label>
                <p className="text-gray-900 mt-1">{customer.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Company
                </label>
                <p className="text-gray-900 mt-1">{customer.company}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Notes
                </label>
                <p className="text-gray-900 mt-1">
                  {customer.notes || "No notes added yet."}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <Card className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <span className="font-medium text-gray-900">
                        {project.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">{project.startDate}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          project.status === "active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : project.status === "completed"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium text-gray-900">
                        ${project.value.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Income Tab */}
        <TabsContent value="income">
          <div className="space-y-4">
            {/* Income Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5 bg-white border border-gray-200 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                <p className="text-2xl font-semibold text-green-600">
                  ${totalPaid.toLocaleString()}
                </p>
              </Card>
              <Card className="p-5 bg-white border border-gray-200 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  ${totalPending.toLocaleString()}
                </p>
              </Card>
            </div>

            {/* Income Table */}
            <Card className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {income.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <span className="text-gray-600">{item.date}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-900">
                          {item.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            item.status === "paid"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium text-gray-900">
                          ${item.amount.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card className="p-6 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Notes
              </h3>
              <Button variant="outline" size="sm" className="border-gray-300">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Notes
              </Button>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-900 whitespace-pre-wrap">
                {customer.notes ||
                  "No notes have been added for this customer yet."}
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <CustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={customer}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete ${customer.name}? This will also delete all associated projects and income records. This action cannot be undone.`}
      />
    </div>
  );
}
