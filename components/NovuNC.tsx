import {
    NovuProvider,
    NotificationCenter,
    NotificationBell,
    IMessage,
  } from "@novu/notification-center";
  import dynamic from "next/dynamic";
  
export const NovuNC = () => {
    return (
      <NovuProvider
        subscriberId={"richard@fontein.co"}
        applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID as string}
      >
        <NotificationCenter colorScheme='light'>
        </NotificationCenter>
      </NovuProvider>
    );
  }

  export default dynamic(() => Promise.resolve(NovuNC), {
  ssr: false,
});
