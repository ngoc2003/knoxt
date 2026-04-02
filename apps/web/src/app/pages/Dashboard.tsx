import {
  TrendingUp,
  DollarSign,
  Clock,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export function Dashboard() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Welcome back! Here's your overview
        </p>
      </div>

      {/* Income Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Gross Income</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">
                $24,580
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">+12.5%</span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
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
              <p className="text-3xl font-semibold text-gray-900 mt-2">
                $7,374
              </p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm text-gray-500">30% of gross</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Income</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">
                $17,206
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">+8.2%</span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Overview */}
        <Card className="lg:col-span-2 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Task Overview
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            >
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Kanban Preview */}
          <div className="grid grid-cols-3 gap-4">
            {/* To-do */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Circle className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">To-do</span>
                <Badge
                  variant="secondary"
                  className="ml-auto bg-gray-100 text-gray-600"
                >
                  5
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Design landing page
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 text-xs">
                      Design
                    </Badge>
                    <span className="text-xs text-gray-500 ml-auto">2h</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Update documentation
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                      Docs
                    </Badge>
                    <span className="text-xs text-gray-500 ml-auto">1h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Doing */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Doing</span>
                <Badge
                  variant="secondary"
                  className="ml-auto bg-indigo-50 text-indigo-600"
                >
                  3
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Build API endpoints
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
                      Dev
                    </Badge>
                    <span className="text-xs text-gray-500 ml-auto">4h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Done */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Done</span>
                <Badge
                  variant="secondary"
                  className="ml-auto bg-green-50 text-green-600"
                >
                  8
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Client meeting
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 text-xs">
                      Meeting
                    </Badge>
                    <span className="text-xs text-gray-500 ml-auto">1h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {[
              {
                action: "Completed task",
                title: "Design review",
                time: "2 hours ago",
                color: "text-green-600",
              },
              {
                action: "Invoice sent",
                title: "$2,500 to Acme Corp",
                time: "4 hours ago",
                color: "text-indigo-600",
              },
              {
                action: "Added note",
                title: "Client feedback",
                time: "Yesterday",
                color: "text-purple-600",
              },
              {
                action: "Expense recorded",
                title: "$150 software subscription",
                time: "2 days ago",
                color: "text-orange-600",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.action}
                  </p>
                  <p className="text-sm text-gray-600">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex gap-3">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
        <Button
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Income
        </Button>
      </div>
    </div>
  );
}
