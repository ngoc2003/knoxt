import { useState, useEffect } from "react";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Textarea } from "../../../shared/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/ui/select";

interface Expense {
  id?: string;
  date: string;
  description: string;
  category: string;
  amount: string;
  paymentMethod: string;
  vendor?: string;
  notes?: string;
  receipt?: boolean;
}

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Partial<Expense>) => void;
  expense?: Expense | null;
}

export function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  expense,
}: ExpenseModalProps) {
  const [formData, setFormData] = useState<Partial<Expense>>({
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "software",
    amount: "",
    paymentMethod: "credit-card",
    vendor: "",
    notes: "",
    receipt: false,
  });

  const [errors, setErrors] = useState<{
    date?: string;
    description?: string;
    amount?: string;
  }>({});

  useEffect(() => {
    if (expense) {
      setFormData(expense);
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        description: "",
        category: "software",
        amount: "",
        paymentMethod: "credit-card",
        vendor: "",
        notes: "",
        receipt: false,
      });
    }
    setErrors({});
  }, [expense, isOpen]);

  const validateForm = () => {
    const newErrors: {
      date?: string;
      description?: string;
      amount?: string;
    } = {};

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
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

  const updateField = (field: keyof Expense, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {expense ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
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
              className={`${
                errors.date
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-gray-300 focus-visible:ring-blue-500"
              }`}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1.5">{errors.date}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-gray-700 mb-2 block">
              Description <span className="text-red-500">*</span>
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="Adobe Creative Cloud Subscription"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              className={`${
                errors.description
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-gray-300 focus-visible:ring-blue-500"
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1.5">
                {errors.description}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category" className="text-gray-700 mb-2 block">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => updateField("category", value)}
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="software">Software & Tools</SelectItem>
                <SelectItem value="hardware">Hardware</SelectItem>
                <SelectItem value="office">Office Supplies</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="education">Education & Training</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="taxes">Taxes</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="meals">Meals & Entertainment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
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
                placeholder="99.99"
                value={formData.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                className={`pl-7 ${
                  errors.amount
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-gray-300 focus-visible:ring-blue-500"
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1.5">{errors.amount}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMethod" className="text-gray-700 mb-2 block">
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
                <SelectItem value="credit-card">Credit Card</SelectItem>
                <SelectItem value="debit-card">Debit Card</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vendor */}
          <div>
            <Label htmlFor="vendor" className="text-gray-700 mb-2 block">
              Vendor / Supplier
            </Label>
            <Input
              id="vendor"
              type="text"
              placeholder="Adobe Inc."
              value={formData.vendor}
              onChange={(e) => updateField("vendor", e.target.value)}
              className="border-gray-300 focus-visible:ring-blue-500"
            />
          </div>

          {/* Receipt Checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="receipt"
              type="checkbox"
              checked={formData.receipt}
              onChange={(e) => updateField("receipt", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <Label htmlFor="receipt" className="text-gray-700 cursor-pointer">
              I have a receipt for this expense
            </Label>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-gray-700 mb-2 block">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Add additional notes or details..."
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
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
              {expense ? "Save Changes" : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
