import { NotificationCenter } from "@novu/notification-center";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import React from "react";

const Notifications = () => {
  const { theme } = useTheme();
  return (
    <NotificationCenter
      colorScheme={theme === "dark" ? "dark" : "light"}
    />
  );
};

export const NovuNotificationCenter = dynamic(() => Promise.resolve(Notifications), {
  ssr: false,
});
