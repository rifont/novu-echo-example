import { useNotifications, useUnreadCount } from "@novu/notification-center";
import InfiniteScroll from 'react-infinite-scroll-component';
import { Skeleton } from "../ui/skeleton";
import React from "react";
import { cx } from "class-variance-authority";
import { Button } from "../ui/button";

const LOADING_NOTIFICATIONS_COUNT = 5;

export const CustomNotificationCenter = () => {
  const { notifications = [], isLoading, hasNextPage, fetchNextPage, markNotificationAsRead, markNotificationAsUnRead, refetch, markAllNotificationsAsRead } = useNotifications();
  const { data: unreadCount } = useUnreadCount();

  React.useEffect(() => {
    // Listens for changes to the unread count via WebSocket and refetches notifications
    refetch();
  }, [unreadCount]);

  const actions = [
    {
      label: 'Read',
      onClick: (id: string) => markNotificationAsRead(id)
    },
    {
      label: 'Unread',
      onClick: (id: string) => markNotificationAsUnRead(id)
    },
  ]

  return (
    <div>
      <div className="flex flex-row justify-between mb-2">
        <h3 className="text-2xl font-bold">Notifications</h3>
        <Button
        size='sm'
        className="w-24 h-8 text-xs"
        variant={'outline'}
        onClick={()=> markAllNotificationsAsRead()}>
        Read All</Button>
      </div>
      <InfiniteScroll
        className="flex flex-col gap-2 overflow-y-auto grow w-full border border-gray-200 rounded-md p-3 shadow-inner no-scrollbar"
        height={500}
        dataLength={notifications.length}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={null}
        endMessage={
          !isLoading &&
          <p className="text-center">
            No more notifications
          </p>
        }
      >
        {notifications.map((notification) => (
          <div key={notification._id} className={cx("flex flex-row gap-2 border border-gray-200 rounded-md p-2", notification.read ? "bg-white" : "bg-gray-200")}>
            <p className="w-[100px] text-sm">{new Date(notification.createdAt).toLocaleTimeString()}</p>
            <p className="w-full">{notification.content as string}</p>
            <div className="flex flex-col gap-2 content-end">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={'outline'}
                  size='sm'
                  className="rounded-md text-xs h-6 w-16 px-2"
                  onClick={() => action.onClick(notification._id)}>
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
        {isLoading && Array.from({ length: LOADING_NOTIFICATIONS_COUNT }).map((_, i) => (
          <div key={i} className="flex flex-row gap-2 border border-gray-200 rounded-md p-2">
            <Skeleton className="w-[100px] h-6" />
            <Skeleton className="w-full h-12" />
            <div className="flex flex-col gap-2 content-end">
              {actions.map((action, index) => (
                <Skeleton key={index} className="h-6 w-16 px-2" />
              ))}
            </div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  )
}

