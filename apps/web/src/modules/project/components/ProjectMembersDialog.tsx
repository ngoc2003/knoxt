import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Trash2, UserPlus, Users } from "lucide-react";
import {
  ADD_PROJECT_MEMBER_MUTATION,
  CANCEL_PROJECT_INVITATION_MUTATION,
  PROJECT_DETAIL_QUERY,
  REMOVE_PROJECT_MEMBER_MUTATION,
  UPDATE_PROJECT_MEMBER_ROLE_MUTATION,
} from "../graphql/project";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

type ProjectRole = "viewer" | "editor" | "admin";

interface ProjectMember {
  id: string;
  role: ProjectRole;
  user: { name: string; email: string };
}

interface ProjectInvitation {
  id: string;
  email: string;
  role: ProjectRole;
}

export function ProjectMembersDialog({
  projectId,
  members,
  invitations,
}: {
  projectId: string;
  members: ProjectMember[];
  invitations: ProjectInvitation[];
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ProjectRole>("editor");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [addMember, { loading }] = useMutation(ADD_PROJECT_MEMBER_MUTATION);
  const [updateRole] = useMutation(UPDATE_PROJECT_MEMBER_ROLE_MUTATION);
  const [removeMember] = useMutation(REMOVE_PROJECT_MEMBER_MUTATION);
  const [cancelInvitation] = useMutation(CANCEL_PROJECT_INVITATION_MUTATION);
  const refetch = [
    { query: PROJECT_DETAIL_QUERY, variables: { id: projectId } },
  ];

  const handleAdd = async () => {
    setError("");
    setMessage("");
    try {
      const { data } = await addMember({
        variables: { data: { projectId, email: email.trim(), role } },
        refetchQueries: refetch,
        awaitRefetchQueries: true,
      });
      const result = (data as any)?.addProjectMember;
      setMessage(
        result?.status === "member-added"
          ? "Member added."
          : result?.emailSent
            ? "Invitation email sent."
            : "Invitation saved, but email delivery is not configured.",
      );
      setEmail("");
    } catch (memberError) {
      setError(
        memberError instanceof Error
          ? memberError.message
          : "Unable to add member",
      );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project members</DialogTitle>
          <DialogDescription>
            Registered users are added immediately. Others receive an email
            invitation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="member@example.com"
          />
          <Select
            value={role}
            onValueChange={(value: ProjectRole) => setRole(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button disabled={!email.trim() || loading} onClick={handleAdd}>
            <UserPlus />
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}

        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {member.user.name}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {member.user.email}
                </p>
              </div>
              <Select
                value={member.role}
                onValueChange={(nextRole: ProjectRole) =>
                  updateRole({
                    variables: {
                      data: { projectId, memberId: member.id, role: nextRole },
                    },
                    refetchQueries: refetch,
                  })
                }
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${member.user.name}`}
                onClick={() =>
                  removeMember({
                    variables: { data: { projectId, memberId: member.id } },
                    refetchQueries: refetch,
                  })
                }
              >
                <Trash2 className="text-red-600" />
              </Button>
            </div>
          ))}
          {members.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">
              No shared members yet.
            </p>
          )}
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center gap-3 rounded-md border border-dashed p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {invitation.email}
                </p>
                <p className="text-xs text-amber-600">
                  Pending invitation · {invitation.role}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Cancel invitation for ${invitation.email}`}
                onClick={() =>
                  cancelInvitation({
                    variables: {
                      data: { projectId, invitationId: invitation.id },
                    },
                    refetchQueries: refetch,
                  })
                }
              >
                <Trash2 className="text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
