import { NovuProvider } from "@novu/notification-center";
import NovuNC from "./NovuNC";

export const NovuProvidedNC = () => {
    return (
      <NovuProvider
        subscriberId={"richard@fontein.co"}
        applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID as string}
      >
        <NovuNC/>
      </NovuProvider>
    );
  }
