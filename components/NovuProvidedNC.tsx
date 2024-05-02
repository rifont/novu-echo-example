import { NovuProvider } from "@novu/notification-center";
import NovuNC from "./NovuNC";
import { SUBSCRIBER_ID } from "@/constants/subscriber";

export const NovuProvidedNC = () => {
    return (
      <NovuProvider
        subscriberId={SUBSCRIBER_ID}
        applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID as string}
      >
        <NovuNC/>
      </NovuProvider>
    );
  }
