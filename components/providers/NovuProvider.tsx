import { NovuProvider as NCProvider } from "@novu/notification-center";
import { SUBSCRIBER_ID } from "@/constants/subscriber";

export const NovuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NCProvider
      subscriberId={SUBSCRIBER_ID}
      socketUrl="http://localhost:3002"
      backendUrl="http://localhost:3000"
      applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_PUBLIC_KEY as string}
    >
      {children}
    </NCProvider>
  );
}
