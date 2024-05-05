import { NovuProvider as NCProvider } from "@novu/notification-center";
import { SUBSCRIBER_ID } from "@/constants/subscriber";

export const NovuProvider = (
  { children, subscriberId = SUBSCRIBER_ID }:
  { children: React.ReactNode, subscriberId?: string }) => {
  return (
    <NCProvider
      subscriberId={subscriberId}
      applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID as string}
    >
      {children}
    </NCProvider>
  );
}
