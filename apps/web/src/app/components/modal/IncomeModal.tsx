import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Income {
  id?: string;
  date: string;
  source: string;
  client: string;
  project?: string;
  amount: string;
  status: "paid" | "pending" | "overdue";
  category: string;
  description?: string;
  paymentMethod?: string;
}

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (income: Partial<Income>) => void;
  income?: Income | null;
}

export function IncomeModal({
  isOpen,
  onClose,
  onSave,
  income,
}: IncomeModalProps) {
  const [formData, setFormData] = useState<Partial<Income>>({
    date: new Date().toISOString().split("T")[0],
    source: "",
    client: "",
    project: "",
    amount: "",
    status: "pending",
    category: "project",
    description: "",
    paymentMethod: "bank-transfer",
  });

  const [errors, setErrors] = useState<{
    date?: string;
    source?: string;
    client?: string;
    amount?: string;
  }>({});

  useEffect(() => {
    if (income) {
      setFormData(income);
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        source: "",
        client: "",
        project: "",
        amount: "",
        status: "pending",
        category: "project",
        description: "",
        paymentMethod: "bank-transfer",
      });
    }
    setErrors({});
  }, [income, isOpen]);

  const validateForm = () => {
    const newErrors: {
      date?: string;
      source?: string;
      client?: string;
      amount?: string;
    } = {};

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.source?.trim()) {
      newErrors.source = "Income source is required";
    }

    if (!formData.client?.trim()) {
      newErrors.client = "Client is required";
    }

    if (!formData.amount?.trim()) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSave(formData);
    onClose();
  };

  const updateField = (field: keyof Income, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{income ? "Edit Income" : "Add New Income"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <Label htmlFor="date" className="text-gray-700 mb-2 block">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
              className={`${errors.date
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-gray-300 focus-visible:ring-blue-500"
                }`}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1.5">{errors.date}</p>
            )}
          </div>

          {/* Income Source */}
          <div>
            <Label htmlFor="source" className="text-gray-700 mb-2 block">
              Income Source <span className="text-red-500">*</span>
            </Label>
            <Input
              id="source"
              type="text"
              placeholder="Website Development Payment"
              value={formData.source}
              onChange={(e) => updateField("source", e.target.value)}
              className={`${errors.source
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-gray-300 focus-visible:ring-blue-500"
                }`}
            />
            {errors.source && (
              <p className="text-red-500 text-sm mt-1.5">{errors.source}</p>
            )}
          </div>

          {/* Client */}
          <div>
            <Label htmlFor="client" className="text-gray-700 mb-2 block">
              Client <span className="text-red-500">*</span>
            </Label>
            <Input
              id="client"
              type="text"
              placeholder="Acme Corporation"
              value={formData.client}
              onChange={(e) => updateField("client", e.target.value)}
              className={`${errors.client
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-gray-300 focus-visible:ring-blue-500"
                }`}
            />
            {errors.client && (
              <p className="text-red-500 text-sm mt-1.5">{errors.client}</p>
            )}
          </div>

          {/* Project (Optional) */}
          <div>
            <Label htmlFor="project" className="text-gray-700 mb-2 block">
              Project
            </Label>
            <Input
              id="project"
              type="text"
              placeholder="Website Redesign"
              value={formData.project}
              onChange={(e) => updateField("project", e.target.value)}
              className="border-gray-300 focus-visible:ring-blue-500"
            />
          </div>

          {/* Amount and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount" className="text-gray-700 mb-2 block">
                Amount <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="amount"
                  type="text"
                  placeholder="5000"
                  value={formData.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                  className={`pl-7 ${errors.amount
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-gray-300 focus-visible:ring-blue-500"
                    }`}
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1.5">{errors.amount}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status" className="text-gray-700 mb-2 block">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: "paid" | "pending" | "overdue") =>
                  updateField("status", value)
                }
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category and Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-gray-700 mb-2 block">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateField("category", value)}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">Project Work</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="retainer">Retainer</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="paymentMethod"
                className="text-gray-700 mb-2 block"
              >
                Payment Method
              </Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => updateField("paymentMethod", value)}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-gray-700 mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add additional notes or details..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="min-h-[80px] border-gray-300 focus-visible:ring-blue-500"
            />
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {income ? "Save Changes" : "Add Income"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
