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
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const incomeData = [
  {
    id: 1,
    date: "Apr 1, 2026",
    client: "Acme Corporation",
    amount: 2500,
    tax: 750,
    status: "paid",
    invoice: "INV-001",
  },
  {
    id: 2,
    date: "Mar 28, 2026",
    client: "TechStart Inc",
    amount: 3200,
    tax: 960,
    status: "paid",
    invoice: "INV-002",
  },
  {
    id: 3,
    date: "Mar 25, 2026",
    client: "Design Studio",
    amount: 1800,
    tax: 540,
    status: "pending",
    invoice: "INV-003",
  },
  {
    id: 4,
    date: "Mar 20, 2026",
    client: "Global Brands",
    amount: 4500,
    tax: 1350,
    status: "paid",
    invoice: "INV-004",
  },
  {
    id: 5,
    date: "Mar 15, 2026",
    client: "StartupXYZ",
    amount: 2800,
    tax: 840,
    status: "overdue",
    invoice: "INV-005",
  },
];

const expenseData = [
  {
    id: 1,
    date: "Apr 1, 2026",
    category: "Software",
    description: "Adobe Creative Cloud",
    amount: 54.99,
    status: "deductible",
  },
  {
    id: 2,
    date: "Mar 30, 2026",
    category: "Equipment",
    description: "External Monitor",
    amount: 399.0,
    status: "deductible",
  },
  {
    id: 3,
    date: "Mar 28, 2026",
    category: "Office",
    description: "Desk Chair",
    amount: 249.99,
    status: "deductible",
  },
  {
    id: 4,
    date: "Mar 25, 2026",
    category: "Internet",
    description: "Monthly Internet Bill",
    amount: 79.99,
    status: "deductible",
  },
  {
    id: 5,
    date: "Mar 20, 2026",
    category: "Software",
    description: "Figma Professional",
    amount: 15.0,
    status: "deductible",
  },
];

export function Finance() {
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
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

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
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Income
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Tax (30%)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomeData.map((income) => (
              <TableRow key={income.id}>
                <TableCell className="text-sm text-gray-600">
                  {income.date}
                </TableCell>
                <TableCell className="text-sm font-medium text-gray-900">
                  {income.client}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {income.invoice}
                </TableCell>
                <TableCell className="text-sm font-medium text-gray-900 text-right">
                  ${income.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-gray-600 text-right">
                  ${income.tax.toLocaleString()}
                </TableCell>
                <TableCell>
                  {income.status === "paid" && (
                    <Badge className="bg-green-50 text-green-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Paid
                    </Badge>
                  )}
                  {income.status === "pending" && (
                    <Badge className="bg-yellow-50 text-yellow-700">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                  {income.status === "overdue" && (
                    <Badge className="bg-red-50 text-red-700">
                      <XCircle className="w-3 h-3 mr-1" />
                      Overdue
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Expense Table */}
      <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenseData.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="text-sm text-gray-600">
                  {expense.date}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                    {expense.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-900">
                  {expense.description}
                </TableCell>
                <TableCell className="text-sm font-medium text-gray-900 text-right">
                  ${expense.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-50 text-green-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {expense.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
