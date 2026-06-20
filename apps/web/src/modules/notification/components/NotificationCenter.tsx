import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { Bell, FolderKanban, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Notification, NotificationType } from "@repo/types";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
  NOTIFICATIONS_QUERY,
} from "../graphql/notification";
import { API_BASE_URL } from "@/configs";
import { APPROVE_TASK_PROJECT_ACCESS_MUTATION } from "@/modules/task/graphql/task";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

interface NotificationsData {
  notifications: Notification[];
}

interface AccessRequestPayload {
  kind: "project-access-request";
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
}

const apiUrl = API_BASE_URL;
const notificationPayloadPrefix = "__KNOXT_NOTIFICATION__";

const parseAccessRequest = (message: string): AccessRequestPayload | null => {
  if (!message.startsWith(notificationPayloadPrefix)) return null;
  try {
    const payload = JSON.parse(
      message.slice(notificationPayloadPrefix.length),
    ) as unknown;
    if (
      payload &&
      typeof payload === "object" &&
      (payload as { kind?: string }).kind === "project-access-request"
    ) {
      return payload as AccessRequestPayload;
    }
  } catch {
    return null;
  }
  return null;
};

const displayNotificationMessage = (notification: Notification) => {
  const request = parseAccessRequest(notification.message);
  if (!request) return notification.message;
  return `${request.requesterName || request.requesterEmail} requested access to "${request.projectName}".`;
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [accessRequest, setAccessRequest] =
    useState<AccessRequestPayload | null>(null);
  const { data } = useQuery<NotificationsData>(NOTIFICATIONS_QUERY);
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ_MUTATION);
  const [approveAccess, { loading: approvingAccess }] = useMutation(
    APPROVE_TASK_PROJECT_ACCESS_MUTATION,
  );

  useEffect(() => {
    if (data?.notifications) {
      setNotifications(data.notifications);
    }
  }, [data]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const source = new EventSource(
      `${apiUrl}/notifications/stream?token=${encodeURIComponent(token)}`,
    );

    source.onmessage = (event) => {
      const notification = JSON.parse(event.data) as Notification;
      setNotifications((current) => [
        notification,
        ...current.filter((item) => item.id !== notification.id),
      ]);
      toast.info(displayNotificationMessage(notification));
    };

    return () => source.close();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const handleOpenChange = (open: boolean) => {
    if (!open || unreadCount === 0) return;

    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
    void markAllRead();
  };

  const handleApproveAccess = async () => {
    if (!accessRequest) return;
    await approveAccess({
      variables: {
        projectId: accessRequest.projectId,
        requesterId: accessRequest.requesterId,
      },
    });
    toast.success("Project access approved.");
    setAccessRequest(null);
  };

  return (
    <>
      <Popover onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-96 p-0">
          <div className="border-b px-4 py-3">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <ScrollArea className="h-96">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-500">
                You have no notifications yet.
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => {
                  const request = parseAccessRequest(notification.message);

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => {
                        if (request) setAccessRequest(request);
                      }}
                      className="flex w-full gap-3 px-4 py-3 text-left hover:bg-gray-50"
                    >
                      <div className="mt-0.5 h-8 w-8 rounded-full bg-indigo-50 p-2 text-indigo-600">
                        {notification.type ===
                          NotificationType.projectMemberAdded ||
                        notification.type ===
                          NotificationType.projectAccessRequest ||
                        notification.type === NotificationType.projectDeleted ? (
                          <FolderKanban className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800">
                          {displayNotificationMessage(notification)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            },
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <Dialog
        open={Boolean(accessRequest)}
        onOpenChange={(open) => {
          if (!open) setAccessRequest(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve project access?</DialogTitle>
          </DialogHeader>
          {accessRequest && (
            <p className="text-sm leading-6 text-gray-500">
              {accessRequest.requesterName || accessRequest.requesterEmail}{" "}
              wants access to "{accessRequest.projectName}" from ticket "
              {accessRequest.taskTitle}". Approving will add them as a viewer.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccessRequest(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleApproveAccess()}
              disabled={approvingAccess}
            >
              {approvingAccess ? "Approving..." : "Approve access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
