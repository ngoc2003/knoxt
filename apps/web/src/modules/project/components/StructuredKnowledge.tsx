import { useState } from "react";
import { ArchiveRestore, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  ActionItemDialog,
  MemoryEntityDialog,
} from "./project-memory/ProjectMemoryDialogs";
import { ProjectMemoryActivity } from "./project-memory/ProjectMemoryActivity";
import { ProjectMemoryEntityList } from "./project-memory/ProjectMemoryEntityList";
import { ProjectMemoryHome } from "./project-memory/ProjectMemoryHome";
import { ProjectMemorySearch } from "./project-memory/ProjectMemorySearch";
import type { MemoryKind } from "./project-memory/types";
import { useProjectMemoryController } from "./project-memory/useProjectMemoryController";
import type { PromotedTask } from "./project-memory/useProjectMemoryController";

export function StructuredKnowledge({
  projectId,
  canEdit,
  canViewActivity,
  onTaskCreated,
}: {
  projectId: string;
  canEdit: boolean;
  canViewActivity: boolean;
  onTaskCreated?: (task: PromotedTask) => void | Promise<void>;
}) {
  const memory = useProjectMemoryController(projectId, { onTaskCreated });
  const [activeTab, setActiveTab] = useState("home");

  const openSearchResult = (type: string) => {
    if (type === "action" || type === "meeting") setActiveTab("meeting");
    else if (type === "decision") setActiveTab("decision");
    else if (type === "requirement") setActiveTab("requirement");
    else setActiveTab("home");
  };

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Project Memory</CardTitle>
            <p className="mt-1 text-sm text-gray-500">
              Recaps, actions, decisions and requirements you can come back to.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <>
                <Button onClick={() => memory.openEditor("meeting")}>
                  <Plus />
                  New recap
                </Button>
                <Button
                  variant="outline"
                  onClick={() => memory.openEditor("decision")}
                >
                  Add decision
                </Button>
                <Button
                  variant="outline"
                  onClick={() => memory.openEditor("requirement")}
                >
                  Add requirement
                </Button>
                <Button
                  variant={memory.includeDeleted ? "secondary" : "outline"}
                  onClick={() =>
                    memory.setIncludeDeleted((value: boolean) => !value)
                  }
                >
                  <ArchiveRestore />
                  {memory.includeDeleted ? "Hide deleted" : "Deleted"}
                </Button>
              </>
            )}
          </div>
        </div>
        <ProjectMemorySearch
          projectId={projectId}
          onOpenResult={(item) => openSearchResult(item.type)}
        />
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="meeting">Recaps</TabsTrigger>
            <TabsTrigger value="decision">Decisions</TabsTrigger>
            <TabsTrigger value="requirement">Requirements</TabsTrigger>
            {canViewActivity && (
              <TabsTrigger value="activity">Activity</TabsTrigger>
            )}
          </TabsList>
          {memory.query.error && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {memory.query.error.message}
            </p>
          )}
          <TabsContent value="home">
            <ProjectMemoryHome
              decisions={memory.lists.decision}
              meetings={memory.lists.meeting}
              requirements={memory.lists.requirement}
              loading={memory.query.loading}
              canEdit={canEdit}
              onQuickRecap={memory.quickRecap}
              onQuickDecision={memory.quickDecision}
              onQuickRequirement={memory.quickRequirement}
              onQuickAction={memory.quickAction}
              onEditAction={(meeting, action) =>
                memory.openActionEditor(meeting.id, action)
              }
              onCompleteAction={memory.completeAction}
              onCreateTask={memory.createTask}
              onDeleteAction={memory.deleteAction}
              onRestoreAction={memory.restoreAction}
            />
          </TabsContent>
          {(["meeting", "decision", "requirement"] as MemoryKind[]).map(
            (kind) => (
              <TabsContent key={kind} value={kind}>
                <ProjectMemoryEntityList
                  kind={kind}
                  items={memory.lists[kind]}
                  loading={memory.query.loading}
                  canEdit={canEdit}
                  onCreate={() => memory.openEditor(kind)}
                  onEdit={(entity) => memory.openEditor(kind, entity)}
                  onDelete={(entity) => memory.deleteByKind(kind, entity)}
                  onRestore={(entity) => memory.restoreByKind(kind, entity)}
                  onQuickAction={memory.quickAction}
                  onEditAction={(meeting, action) =>
                    memory.openActionEditor(meeting.id, action)
                  }
                  onParticipant={memory.addParticipant}
                  onRemoveParticipant={memory.removeParticipant}
                  onCreateTask={memory.createTask}
                  onCompleteAction={memory.completeAction}
                  onDeleteAction={memory.deleteAction}
                  onRestoreAction={memory.restoreAction}
                />
              </TabsContent>
            ),
          )}
          {canViewActivity && (
            <TabsContent value="activity">
              <ProjectMemoryActivity projectId={projectId} />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
      <MemoryEntityDialog
        editor={memory.editor}
        form={memory.form}
        onFormChange={memory.setForm}
        onClose={memory.closeEntityEditor}
        onSave={() => void memory.saveEntity()}
      />
      <ActionItemDialog
        editor={memory.actionItemEditor}
        form={memory.actionItemForm}
        onFormChange={memory.setActionItemForm}
        onClose={memory.closeActionEditor}
        onSave={() => void memory.saveAction()}
      />
    </Card>
  );
}
