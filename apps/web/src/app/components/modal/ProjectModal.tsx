import { useState, useEffect } from "react";
import { CustomerSelect } from "./CustomerSelect";
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

interface Project {
  id?: string;
  name: string;
  customerId?: string;
  client?: string; // for backward compatibility
  status: "active" | "completed" | "on-hold";
  startDate: string;
  endDate?: string;
  budget: string;
  description?: string;
  customerObj?: any;
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => void;
  project?: Project | null;
}

export function ProjectModal({
  isOpen,
  onClose,
  onSave,
  project,
}: ProjectModalProps) {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: "",
    customerId: undefined,
    client: "",
    status: "active",
    startDate: "",
    endDate: "",
    budget: "",
    description: "",
    customerObj: undefined,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    customerId?: string;
    startDate?: string;
    budget?: string;
  }>({});

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        customerId: project.customerId,
        client: project.client || "",
        customerObj: undefined,
      });
    } else {
      setFormData({
        name: "",
        customerId: undefined,
        client: "",
        status: "active",
        startDate: "",
        endDate: "",
        budget: "",
        description: "",
        customerObj: undefined,
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const validateForm = () => {
    const newErrors: {
      name?: string;
      customerId?: string;
      startDate?: string;
      budget?: string;
    } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Project name is required";
    }

    if (!formData.customerId) {
      newErrors.customerId = "Client is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.budget?.trim()) {
      newErrors.budget = "Budget is required";
    } else if (isNaN(Number(formData.budget))) {
      newErrors.budget = "Please enter a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave({
      ...formData,
      customerId: formData.customerId,
      client: undefined,
      customerObj: undefined,
    });
    onClose();
  };

  const updateField = (field: keyof Project, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  // Special handler for customer selection/creation
  const handleCustomerChange = (name: string, customerObj?: any) => {
    setFormData((prev) => ({
      ...prev,
      customerId: customerObj?.id,
      customerObj,
    }));
    if (errors.customerId) {
      setErrors({ ...errors, customerId: undefined });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? "Edit Project" : "Add New Project"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div>
            <Label htmlFor="name" className="text-gray-700 mb-2 block">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Website Redesign"
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

          {/* Client (Customer) */}
          <div>
            <Label htmlFor="customer" className="text-gray-700 mb-2 block">
              Client <span className="text-red-500">*</span>
            </Label>
            <CustomerSelect
              value={formData.customerObj?.name || ""}
              onChange={handleCustomerChange}
              placeholder="Select or type customer..."
            />
            {errors.customerId && (
              <p className="text-red-500 text-sm mt-1.5">{errors.customerId}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status" className="text-gray-700 mb-2 block">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "completed" | "on-hold") =>
                updateField("status", value)
              }
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-gray-700 mb-2 block">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                className={`${
                  errors.startDate
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-gray-300 focus-visible:ring-blue-500"
                }`}
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1.5">
                  {errors.startDate}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="endDate" className="text-gray-700 mb-2 block">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
                className="border-gray-300 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <Label htmlFor="budget" className="text-gray-700 mb-2 block">
              Budget <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="budget"
                type="text"
                placeholder="10000"
                value={formData.budget}
                onChange={(e) => updateField("budget", e.target.value)}
                className={`pl-7 ${
                  errors.budget
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-gray-300 focus-visible:ring-blue-500"
                }`}
              />
            </div>
            {errors.budget && (
              <p className="text-red-500 text-sm mt-1.5">{errors.budget}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-gray-700 mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add project details, requirements, or notes..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
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
              {project ? "Save Changes" : "Add Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
