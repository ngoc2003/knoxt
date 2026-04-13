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

interface Customer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status?: "active" | "inactive";
  notes?: string;
}

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Partial<Customer>) => void;
  customer?: Customer | null;
}

export function CustomerModal({
  isOpen,
  onClose,
  onSave,
  customer,
}: CustomerModalProps) {
  console.log({ isOpen });
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "active",
    notes: "",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  }>({});

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        status: "active",
        notes: "",
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      phone?: string;
      company?: string;
    } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!formData.company?.trim()) {
      newErrors.company = "Company is required";
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

  const updateField = (field: keyof Customer, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-gray-700 mb-2 block">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ruby Swan"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={`${
                errors.name
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-gray-300 focus-visible:ring-blue-500"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1.5">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-gray-700 mb-2 block">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={`${
                errors.email
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-gray-300 focus-visible:ring-blue-500"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1.5">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="text-gray-700 mb-2 block">
              Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className={`${
                errors.phone
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-gray-300 focus-visible:ring-blue-500"
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1.5">{errors.phone}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <Label htmlFor="company" className="text-gray-700 mb-2 block">
              Company <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company"
              type="text"
              placeholder="Acme Corporation"
              value={formData.company}
              onChange={(e) => updateField("company", e.target.value)}
              className={`${
                errors.company
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-gray-300 focus-visible:ring-blue-500"
              }`}
            />
            {errors.company && (
              <p className="text-red-500 text-sm mt-1.5">{errors.company}</p>
            )}
          </div>

          {/* Status (only show when editing) */}
          {customer && (
            <div>
              <Label htmlFor="status" className="text-gray-700 mb-2 block">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") =>
                  updateField("status", value)
                }
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-gray-700 mb-2 block">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this customer..."
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className="min-h-[100px] border-gray-300 focus-visible:ring-blue-500"
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
              {customer ? "Save Changes" : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
