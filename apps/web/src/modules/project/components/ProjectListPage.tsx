import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useLocation } from "react-router";
import {
  BriefcaseBusiness,
  CheckCircle2,
  FolderKanban,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { CREATE_PROJECT_MUTATION, PROJECTS_QUERY } from "../graphql/project";
import { REQUEST_TASK_PROJECT_ACCESS_MUTATION } from "@/modules/task/graphql/task";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { toast } from "sonner";

export function ProjectListPage() {
  const location = useLocation();
  const accessDeniedState = location.state as
    | { accessDeniedTaskId?: string; accessDeniedProjectId?: string }
    | undefined;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [ownership, setOwnership] = useState("all");
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [accessDialogOpen, setAccessDialogOpen] = useState(
    Boolean(accessDeniedState?.accessDeniedProjectId),
  );

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    );

    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, loading, previousData, refetch } = useQuery(PROJECTS_QUERY, {
    variables: {
      pagination: { skip: 0, take: 50 },
      filter: {
        search: debouncedSearch || undefined,
        status: status === "all" ? undefined : status,
        ownership,
      },
    },
  });
  const [createProject] = useMutation(CREATE_PROJECT_MUTATION);
  const [requestAccess, { loading: requestingAccess }] = useMutation(
    REQUEST_TASK_PROJECT_ACCESS_MUTATION,
  );
  const displayedData = data ?? previousData;
  const projects = useMemo(
    () => (displayedData as any)?.projects?.items ?? [],
    [displayedData],
  );
  const isInitialLoading = loading && !displayedData;
  const stats = useMemo(
    () => ({
      total: projects.length,
      active: projects.filter((project: any) => project.status === "active")
        .length,
      completed: projects.filter(
        (project: any) => project.status === "completed",
      ).length,
      documents: projects.reduce(
        (total: number, project: any) => total + (project.noteCount ?? 0),
        0,
      ),
    }),
    [projects],
  );

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
    setIsProjectModalOpen(false);
  };

  const handleRequestAccess = async () => {
    if (!accessDeniedState?.accessDeniedTaskId) return;
    await requestAccess({
      variables: { taskId: accessDeniedState.accessDeniedTaskId },
    });
    toast.success("Permission request sent to the project owner.");
    setAccessDialogOpen(false);
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-indigo-50/40 via-gray-50 to-gray-50 px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Projects
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Track delivery, documents, and client work in one place.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setIsProjectModalOpen(true)}
            className="bg-indigo-600 px-5 text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus />
            New Project
          </Button>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<FolderKanban />}
            label="Projects shown"
            value={stats.total}
          />
          <StatCard
            icon={<BriefcaseBusiness />}
            label="Active"
            value={stats.active}
          />
          <StatCard
            icon={<CheckCircle2 />}
            label="Completed"
            value={stats.completed}
          />
          <StatCard
            icon={<Sparkles />}
            label="Documents"
            value={stats.documents}
          />
        </section>

        <div className="bg-white p-3 shadow-sm rounded-xl">
          <div className="mb-6 flex flex-col gap-3 rounded-xl md:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="h-10 border-0 bg-gray-50 pl-9 shadow-none focus-visible:ring-indigo-200"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects by name or description..."
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10 w-full bg-white md:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ownership} onValueChange={setOwnership}>
              <SelectTrigger className="h-10 w-full bg-white md:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All access</SelectItem>
                <SelectItem value="owned">Owned by me</SelectItem>
                <SelectItem value="member">Shared with me</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isInitialLoading && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-80 animate-pulse rounded-xl border bg-white"
                />
              ))}
            </div>
          )}

          {!isInitialLoading && projects.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project: any) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {!isInitialLoading && projects.length === 0 && (
            <div className="rounded-2xl border border-dashed bg-white px-6 py-20 text-center">
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <FolderKanban className="size-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No matching projects
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                Create a project or adjust the current search and filters.
              </p>
              <Button
                className="mt-6"
                onClick={() => setIsProjectModalOpen(true)}
              >
                <Plus />
                Create project
              </Button>
            </div>
          )}
        </div>
      </div>

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
      />
      <Dialog open={accessDialogOpen} onOpenChange={setAccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>You do not have access</DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-6 text-gray-500">
            You do not have permission to view that project or ticket. You can
            request access from the project owner.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccessDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => void handleRequestAccess()}
              disabled={
                requestingAccess || !accessDeniedState?.accessDeniedTaskId
              }
            >
              {requestingAccess ? "Sending..." : "Request permission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 [&_svg]:size-4">
        {icon}
      </div>
      <p className="text-2xl font-semibold text-gray-950">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
