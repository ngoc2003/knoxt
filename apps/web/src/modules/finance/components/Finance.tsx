import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Plus,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Receipt,
  X,
  ChevronDown,
  Search,
  Calendar,
} from "lucide-react";
import { Button } from "../../../shared/ui/button";
import { Card } from "../../../shared/ui/card";
import { Badge } from "../../../shared/ui/badge";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";
import { ExpenseModal } from "./ExpenseModal";
import { IncomeModal } from "./IncomeModal";

const incomeData = [
  {
    id: 1,
    date: "2026-04-01",
    displayDate: "Apr 1, 2026",
    client: "Acme Corporation",
    source: "Website Development Payment",
    category: "project",
    amount: 2500,
    tax: 750,
    status: "paid",
    invoice: "INV-001",
  },
  {
    id: 2,
    date: "2026-03-28",
    displayDate: "Mar 28, 2026",
    client: "TechStart Inc",
    source: "Mobile App - Milestone 1",
    category: "project",
    amount: 3200,
    tax: 960,
    status: "paid",
    invoice: "INV-002",
  },
  {
    id: 3,
    date: "2026-03-25",
    displayDate: "Mar 25, 2026",
    client: "Design Studio",
    source: "Logo Design",
    category: "consulting",
    amount: 1800,
    tax: 540,
    status: "pending",
    invoice: "INV-003",
  },
  {
    id: 4,
    date: "2026-03-20",
    displayDate: "Mar 20, 2026",
    client: "Global Brands",
    source: "Monthly Retainer",
    category: "retainer",
    amount: 4500,
    tax: 1350,
    status: "paid",
    invoice: "INV-004",
  },
  {
    id: 5,
    date: "2026-03-15",
    displayDate: "Mar 15, 2026",
    client: "StartupXYZ",
    source: "Consulting Session",
    category: "consulting",
    amount: 2800,
    tax: 840,
    status: "overdue",
    invoice: "INV-005",
  },
];

const expenseData = [
  {
    id: 1,
    date: "2026-04-01",
    displayDate: "Apr 1, 2026",
    category: "software",
    description: "Adobe Creative Cloud",
    vendor: "Adobe Inc.",
    amount: 54.99,
    status: "deductible",
  },
  {
    id: 2,
    date: "2026-03-30",
    displayDate: "Mar 30, 2026",
    category: "hardware",
    description: "External Monitor",
    vendor: "Dell",
    amount: 399.0,
    status: "deductible",
  },
  {
    id: 3,
    date: "2026-03-28",
    displayDate: "Mar 28, 2026",
    category: "office",
    description: "Desk Chair",
    vendor: "Herman Miller",
    amount: 249.99,
    status: "deductible",
  },
  {
    id: 4,
    date: "2026-03-25",
    displayDate: "Mar 25, 2026",
    category: "utilities",
    description: "Monthly Internet Bill",
    vendor: "Comcast",
    amount: 79.99,
    status: "deductible",
  },
  {
    id: 5,
    date: "2026-03-20",
    displayDate: "Mar 20, 2026",
    category: "software",
    description: "Figma Professional",
    vendor: "Figma Inc.",
    amount: 15.0,
    status: "deductible",
  },
];

export function Finance() {
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    incomeStatus: "all",
    incomeCategory: "all",
    expenseCategory: "all",
    minAmount: "",
    maxAmount: "",
    searchQuery: "",
  });

  const handleIncomeAdd = (income: any) => {
    console.log("Adding income:", income);
    // In real app, add to state/database
  };

  const handleExpenseAdd = (expense: any) => {
    console.log("Adding expense:", expense);
    // In real app, add to state/database
  };

  const handleApplyFilters = () => {
    console.log("Applying filters:", filters);
    // In real app, filter the data
  };

  const handleResetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      incomeStatus: "all",
      incomeCategory: "all",
      expenseCategory: "all",
      minAmount: "",
      maxAmount: "",
      searchQuery: "",
    });
  };

  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
  const totalTax = incomeData.reduce((sum, item) => sum + item.tax, 0);
  const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);
  const netIncome = totalIncome - totalTax - totalExpense;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Finance</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track your income, expenses, and tax
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`border-gray-300 text-gray-700 hover:bg-gray-50 ${
              isFilterOpen ? "bg-blue-50 border-blue-300 text-blue-700" : ""
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
            <ChevronDown
              className={`w-4 h-4 ml-2 transition-transform ${
                isFilterOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>
      </div>

      {/* Expandable Filter Section */}
      {isFilterOpen && (
        <Card className="p-6 bg-white border border-blue-200 rounded-xl shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              Customize Filters
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFilterOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <Label className="text-gray-700 mb-2 block">Date From</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="border-gray-300"
              />
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block">Date To</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className="border-gray-300"
              />
            </div>

            {/* Search */}
            <div>
              <Label className="text-gray-700 mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search transactions..."
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters({ ...filters, searchQuery: e.target.value })
                  }
                  className="pl-10 border-gray-300"
                />
              </div>
            </div>

            {/* Income Status */}
            <div>
              <Label className="text-gray-700 mb-2 block">Income Status</Label>
              <Select
                value={filters.incomeStatus}
                onValueChange={(value) =>
                  setFilters({ ...filters, incomeStatus: value })
                }
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Income Category */}
            <div>
              <Label className="text-gray-700 mb-2 block">
                Income Category
              </Label>
              <Select
                value={filters.incomeCategory}
                onValueChange={(value) =>
                  setFilters({ ...filters, incomeCategory: value })
                }
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="project">Project Work</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="retainer">Retainer</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expense Category */}
            <div>
              <Label className="text-gray-700 mb-2 block">
                Expense Category
              </Label>
              <Select
                value={filters.expenseCategory}
                onValueChange={(value) =>
                  setFilters({ ...filters, expenseCategory: value })
                }
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="software">Software & Tools</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="office">Office Supplies</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount Range */}
            <div>
              <Label className="text-gray-700 mb-2 block">Min Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  type="text"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, minAmount: e.target.value })
                  }
                  className="pl-7 border-gray-300"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block">Max Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  type="text"
                  placeholder="10000"
                  value={filters.maxAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, maxAmount: e.target.value })
                  }
                  className="pl-7 border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              onClick={handleApplyFilters}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="border-gray-300"
            >
              Reset
            </Button>
            <div className="ml-auto text-sm text-gray-600">
              <span className="font-medium">
                {incomeData.length + expenseData.length}
              </span>{" "}
              transactions found
            </div>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Gross Income</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                ${totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Tax Reserved</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                ${totalTax.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Expenses</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                ${totalExpense.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Income</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                ${netIncome.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Income Table */}
      <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Income</h2>
          <Button
            onClick={() => setIsIncomeModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Income
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Tax (30%)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomeData.map((income) => (
                <TableRow key={income.id} className="hover:bg-gray-50">
                  <TableCell className="text-sm text-gray-600">
                    {income.displayDate}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-gray-900">
                    {income.client}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {income.source}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700"
                    >
                      {income.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-gray-900 text-right">
                    ${income.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 text-right">
                    ${income.tax.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {income.status === "paid" && (
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Paid
                      </Badge>
                    )}
                    {income.status === "pending" && (
                      <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {income.status === "overdue" && (
                      <Badge className="bg-red-50 text-red-700 border-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Overdue
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Expense Table */}
      <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
          <Button
            onClick={() => setIsExpenseModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseData.map((expense) => (
                <TableRow key={expense.id} className="hover:bg-gray-50">
                  <TableCell className="text-sm text-gray-600">
                    {expense.displayDate}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-purple-50 text-purple-700"
                    >
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">
                    {expense.description}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {expense.vendor}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-gray-900 text-right">
                    ${expense.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {expense.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modals */}
      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onSave={handleIncomeAdd}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleExpenseAdd}
      />
    </div>
  );
}
