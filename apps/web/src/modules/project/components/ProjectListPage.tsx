import { useMutation, useQuery } from "@apollo/client/react";
import { CREATE_PROJECT_MUTATION, PROJECTS_QUERY } from "../graphql/project";
import { useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { Plus, ProjectorIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ProjectModal } from "./ProjectModal";
export function ProjectListPage() {
  const { data, loading, error, refetch } = useQuery(PROJECTS_QUERY, {
    variables: { pagination: { skip: 0, take: 50 } },
  });
  const [createProject] = useMutation(CREATE_PROJECT_MUTATION, { client });

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const projects = (data as any)?.projects?.items || [];

  const handleSaveProject = async (projectData: any) => {
    await createProject({
      variables: {
        data: {
          name: projectData.name,
          description: projectData.description,
          customerId: projectData.customerId,
          budget: projectData.budget,
          status: projectData.status,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
        },
      },
    });

    refetch();
    setIsProjectModalOpen(false);
  };
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        <Button
          onClick={() => setIsProjectModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          New Project
        </Button>
      </div>

      {!loading && projects.length === 0 && (
        <div className="flex items-center justify-center min-h-[500px] w-full">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ProjectorIcon className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first project. Keep track of all your
              projects in one place.
            </p>
            <Button
              onClick={() => setIsProjectModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Project
            </Button>
          </div>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
      />
    </div>
  );
}
