import { useNotifications, useUnreadCount } from "@novu/notification-center";
import InfiniteScroll from 'react-infinite-scroll-component';
import { Skeleton } from "../ui/skeleton";
import React from "react";
import { cx } from "class-variance-authority";
import { Button } from "../ui/button";
import { icons } from "lucide-react";

const LOADING_NOTIFICATIONS_COUNT = 5;

export const CustomNotificationCenter = () => {
  const {
    notifications = [],
    isLoading,
    hasNextPage,
    fetchNextPage,
    markNotificationAsRead,
    isFetching,
    markNotificationAsUnRead,
    refetch,
    markAllNotificationsAsRead,
    removeMessage,
  } = useNotifications();
  const { data: unreadCount } = useUnreadCount();

  React.useEffect(() => {
    // Listens for changes to the unread count via WebSocket and refetches notifications
    refetch();
    // Dependending on refetch causes infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadCount]);

  const actions: { label: string, icon: keyof typeof icons, onClick: (id: string) => void }[] = [
    {
      label: 'Read',
      icon: 'Check',
      onClick: (id: string) => markNotificationAsRead(id)
    },
    {
      label: 'Unread',
      icon: 'MessageSquareDot',
      onClick: (id: string) => markNotificationAsUnRead(id)
    },
    {
      label: 'Archive',
      icon: 'Archive',
      onClick: (id: string) => removeMessage(id)
    }
  ];

  return (
    <div>
      <div className="flex flex-row justify-between mb-2">
        <h3 className="text-2xl font-bold">Notifications</h3>
        <Button
          size='sm'
          className="w-24 h-8 text-xs"
          variant={'outline'}
          onClick={() => markAllNotificationsAsRead()}>
          Read All</Button>
      </div>
      <InfiniteScroll
        className="flex flex-col gap-2 overflow-y-auto w-full border rounded-md p-3 shadow-inner no-scrollbar"
        height={500}
        dataLength={notifications.length}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={null}
        endMessage={
          !isLoading &&
          <p className="text-center text-primary/50">
            No more notifications
          </p>
        }
      >
        {notifications.map((notification) => (
          <div key={notification._id} className={cx("relative flex flex-col border rounded-md p-2", !notification.read && "bg-foreground/10")}>
            <div className="flex flex-row gap-2 justify-between min-h-20">
              <p className="min-w-14 text-sm text-primary/50">{new Date(notification.createdAt).toLocaleTimeString()}</p>
              <p className="flex-1 mr-8">{notification.content as string}</p>
            </div>
            <div className="flex flex-col items-end absolute right-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={'outline'}
                  size='sm'
                  className={
                    cx("relative flex overflow-hidden text-xs w-6 hover:w-20 h-6 p-1 group transition-all duration-300 text-primary/50 hover:text-primary rounded-none hover:rounded-l-md",
                      index === 0 && "rounded-t-md",
                      index === actions.length - 1 && "rounded-b-md",
                    )
                  }
                  onClick={() => action.onClick(notification._id)}>
                  <div className="flex flex-row mr-auto">
                    {React.createElement(icons[action.icon], { className: 'h-4 w-4' })}
                    <span className="px-2 whitespace-nowrap group-hover:translate-x-0 translate-x-full absolute right-0 transition-transform duration-300">
                      {action.label}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ))}
        {(isLoading || isFetching) && Array.from({ length: LOADING_NOTIFICATIONS_COUNT }).map((_, i) => (
          <div key={i} className="relative flex flex-col gap-2 border border-foreground/10 rounded-md p-2">
            <div className="flex flex-row gap-2 justify-between min-h-20 w-full">
              <Skeleton className="min-w-14 h-6" />
              <Skeleton className="w-full mr-8 h-12" />
            </div>
            <div className="flex flex-col items-end absolute right-2">
              {actions.map((action, index) => (
                <Skeleton key={index} className={cx("h-6 w-6 px-2 rounded-none", index === 0 && "rounded-t-md", index === actions.length - 1 && "rounded-b-md")} />
              ))}
            </div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  )
}

