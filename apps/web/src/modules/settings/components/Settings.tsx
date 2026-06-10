import { Save } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export function Settings() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account and workspace preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="max-w-4xl">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="space-y-6 border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Profile information
            </h2>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
              <Save className="mr-2 size-4" />
              Save changes
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="space-y-2 border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Notification preferences
            </h2>
            {[
              [
                "Project invitations",
                "Notify me when I am invited to a project",
              ],
              ["Shared notes", "Notify me when someone shares a note"],
              ["Product updates", "Receive updates about new capabilities"],
            ].map(([title, description]) => (
              <div
                key={title}
                className="flex items-center justify-between border-b py-4 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{title}</p>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
