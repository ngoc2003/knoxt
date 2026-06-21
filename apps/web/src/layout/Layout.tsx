import { Outlet, Link, useLocation } from "react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Settings,
  User,
  Users,
  LogOut,
  Plus,
} from "lucide-react";
import { useAuth } from "@/modules/auth/context/AuthContext";
import LogoWithText from "@/shared/components/LogoWithText";

import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { NotificationCenter } from "@/modules/notification/components/NotificationCenter";
import { GlobalSearch } from "@/modules/notes/components/GlobalSearch";
import { cn } from "@/shared/ui/utils";
import {
  CREATE_PROJECT_MUTATION,
  PROJECTS_QUERY,
} from "@/modules/project/graphql/project";
import { ProjectModal } from "@/modules/project/components/ProjectModal";

const navigation = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Documents", path: "/notes", icon: FileText },
  { name: "Settings", path: "/settings", icon: Settings },
];

const projectTones = [
  "bg-sky-500",
  "bg-lime-500",
  "bg-slate-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
];

interface SidebarProject {
  id: string;
  name: string;
  tasks?: { id: string }[];
}

export function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const { data, loading, refetch } = useQuery(PROJECTS_QUERY, {
    variables: {
      pagination: { skip: 0, take: 12 },
      filter: { ownership: "all" },
    },
  });
  const [createProject] = useMutation(CREATE_PROJECT_MUTATION);
  const projects = ((data as any)?.projects?.items ?? []) as SidebarProject[];

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  const isActivePath = (path: string) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path) && path !== "/dashboard";

  const handleSaveProject = async (projectData: any) => {
    await createProject({
      variables: {
        data: {
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          ...(projectData.customerId && { customerId: projectData.customerId }),
          ...(projectData.startDate && { startDate: projectData.startDate }),
          ...(projectData.endDate && { endDate: projectData.endDate }),
        },
      },
    });
    await refetch();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f6f8fb]">
      {/* Sidebar */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-gray-200/80 bg-white">
        <div className="border-b border-gray-100">
          <LogoWithText />
        </div>

        {/* Navigation */}
        <nav className="px-3 mt-5">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = isActivePath(item.path);
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-950",
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-5 flex-1 overflow-y-auto px-4 pb-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Projects
            </p>
            {!!projects.length && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label="Add project"
                onClick={() => setIsProjectModalOpen(true)}
              >
                <Plus className="size-4" />
              </Button>
            )}
          </div>
          <div className="space-y-1">
            {loading &&
              [0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-9 animate-pulse rounded-md bg-gray-100"
                />
              ))}
            {!loading &&
              projects.map((project, index) => {
                const path = `/projects/${project.id}`;
                const isProjectActive = location.pathname === path;

                return (
                  <Link
                    key={project.id}
                    to={path}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition",
                      isProjectActive
                        ? "bg-indigo-50 font-semibold text-indigo-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-950",
                    )}
                  >
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        projectTones[index % projectTones.length],
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {project.name}
                    </span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[11px] font-semibold",
                        isProjectActive
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-gray-100 text-gray-500",
                      )}
                    >
                      {project.tasks?.length ?? 0}
                    </span>
                  </Link>
                );
              })}
            {!loading && projects.length === 0 && (
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(true)}
                className="w-full flex items-center gap-2 rounded-md border border-dashed border-gray-200 px-2.5 py-3 text-xs font-medium text-gray-500 hover:bg-gray-50"
              >
                <Plus className="size-4" />
                Create your first project
              </button>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-2.5">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-indigo-100 text-indigo-600">
                {user ? getUserInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">Freelancer</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="size-8 text-gray-400 hover:text-red-600"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex-1 max-w-md">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-3">
            <NotificationCenter />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600">
                      {user ? (
                        getUserInitials(user.name)
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-600 hover:text-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {/* Page Content */}
        <main className="min-h-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
      />
    </div>
  );
}
