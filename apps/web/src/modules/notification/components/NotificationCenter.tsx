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

interface NotificationsData {
  notifications: Notification[];
}

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data } = useQuery<NotificationsData>(NOTIFICATIONS_QUERY);
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ_MUTATION);

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
      toast.info(notification.message);
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

  return (
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
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex gap-3 px-4 py-3 hover:bg-gray-50"
                >
                  <div className="mt-0.5 h-8 w-8 rounded-full bg-indigo-50 p-2 text-indigo-600">
                    {notification.type ===
                      NotificationType.projectMemberAdded ||
                    notification.type === NotificationType.projectDeleted ? (
                      <FolderKanban className="h-4 w-4" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-800">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
