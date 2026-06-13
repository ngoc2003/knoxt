import { useState, useEffect } from "react";
import { CustomerSelect } from "../../customer/components/CustomerSelect";
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
import { format, parseISO } from "date-fns";

interface Project {
  id?: string;
  name: string;
  customerId?: string;
  client?: string; // for backward compatibility
  status: "active" | "on_hold" | "completed" | "archived";
  startDate?: string;
  endDate?: string;
  description?: string;
  customerObj?: any;
  customer: any;
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => void | Promise<void>;
  project?: Project | null;
}

export function toDateInputValue(value?: string | Date) {
  if (!value) return "";

  try {
    const date = typeof value === "string" ? parseISO(value) : value;
    return format(date, "yyyy-MM-dd");
  } catch {
    return "";
  }
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
    description: "",
    customerObj: undefined,
  });

  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        customerId: project.customerId,
        client: project.client || "",
        startDate: toDateInputValue(project.startDate),
        endDate: toDateInputValue(project.endDate),
        customerObj: project.customer || undefined,
      });
    } else {
      setFormData({
        name: "",
        customerId: undefined,
        client: "",
        status: "active",
        startDate: "",
        endDate: "",
        description: "",
        customerObj: undefined,
      });
    }

    setErrors({});
  }, [project, isOpen]);

  const validateForm = () => {
    const newErrors: {
      name?: string;
    } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Project name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSave({
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
              Client <span className="text-gray-400">(optional)</span>
            </Label>
            <CustomerSelect
              value={formData.customerObj?.name || ""}
              onChange={handleCustomerChange}
              placeholder="Select or type customer..."
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status" className="text-gray-700 mb-2 block">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(
                value: "active" | "on_hold" | "completed" | "archived",
              ) => updateField("status", value)}
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-gray-700 mb-2 block">
                Start Date <span className="text-gray-400">(optional)</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                className="border-gray-300 focus-visible:ring-blue-500"
              />
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
