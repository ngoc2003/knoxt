import { Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";

export function Settings() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <div className="max-w-4xl">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="tax">Tax Information</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Profile Information
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      defaultValue="John"
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      defaultValue="Doe"
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="john.doe@example.com"
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business">Business Name (Optional)</Label>
                  <Input
                    id="business"
                    defaultValue="John Doe Consulting"
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    defaultValue="123 Main Street, Suite 100"
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      defaultValue="San Francisco"
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      defaultValue="CA"
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      defaultValue="94102"
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tax Information Tab */}
          <TabsContent value="tax">
            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Tax Information
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / EIN (Optional)</Label>
                  <Input
                    id="taxId"
                    placeholder="XX-XXXXXXX"
                    defaultValue="12-3456789"
                    className="bg-gray-50 border-gray-200"
                  />
                  <p className="text-xs text-gray-500">
                    Your Employer Identification Number or Social Security
                    Number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    defaultValue="30"
                    className="bg-gray-50 border-gray-200"
                  />
                  <p className="text-xs text-gray-500">
                    Percentage of income to reserve for taxes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filingStatus">Tax Filing Status</Label>
                  <Select defaultValue="single">
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married Filing Jointly</SelectItem>
                      <SelectItem value="married-separate">
                        Married Filing Separately
                      </SelectItem>
                      <SelectItem value="hoh">Head of Household</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dependents">Number of Dependents</Label>
                  <Input
                    id="dependents"
                    type="number"
                    defaultValue="0"
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxMethod">Tax Calculation Method</Label>
                  <Select defaultValue="percentage">
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        Flat Percentage
                      </SelectItem>
                      <SelectItem value="bracket">Tax Bracket</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    How to calculate tax reserves on income
                  </p>
                </div>

                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h3 className="text-sm font-medium text-indigo-900 mb-2">
                    Quarterly Tax Reminders
                  </h3>
                  <p className="text-sm text-indigo-700 mb-3">
                    We'll remind you when quarterly estimated taxes are due
                  </p>
                  <div className="space-y-2 text-sm text-indigo-900">
                    <p>• Q1 2026: April 15, 2026</p>
                    <p>• Q2 2026: June 15, 2026</p>
                    <p>• Q3 2026: September 15, 2026</p>
                    <p>• Q4 2026: January 15, 2027</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Tax Settings
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Notification Preferences
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Email Notifications
                    </h3>
                    <p className="text-sm text-gray-600">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Task Reminders
                    </h3>
                    <p className="text-sm text-gray-600">
                      Get reminded about upcoming tasks
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Invoice Notifications
                    </h3>
                    <p className="text-sm text-gray-600">
                      Alerts when invoices are paid or overdue
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Tax Deadline Reminders
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quarterly tax payment reminders
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      AI Assistant Insights
                    </h3>
                    <p className="text-sm text-gray-600">
                      Weekly productivity and tax tips
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Weekly Summary
                    </h3>
                    <p className="text-sm text-gray-600">
                      Income, expenses, and tasks summary every Monday
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Product Updates
                    </h3>
                    <p className="text-sm text-gray-600">
                      New features and improvements
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="pt-4">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
