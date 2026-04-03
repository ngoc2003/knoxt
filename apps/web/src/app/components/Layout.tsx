import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Wallet,
  Sparkles,
  Settings,
  Search,
  Bell,
  User,
  Users,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import LogoSquare from "./LogoSquare";
import LogoWithText from "./LogoWithText";

const navigation = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Notes", path: "/notes", icon: FileText },
  { name: "Finance", path: "/finance", icon: Wallet },
  { name: "AI Assistant", path: "/ai-assistant", icon: Sparkles },
  { name: "Settings", path: "/settings", icon: Settings },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <LogoWithText />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                item.path === "/dashboard"
                  ? location.pathname === "/dashboard"
                  : location.pathname.startsWith(item.path) &&
                    item.path !== "/dashboard";
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 p-3 rounded-md transition-colors
                      ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-indigo-100 text-indigo-600">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Ruby Swan
              </p>
              <p className="text-xs text-gray-500 truncate">Freelancer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-9 bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-indigo-100 text-indigo-600">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
