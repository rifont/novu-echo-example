import { SUBSCRIBER_ID } from "@/constants/subscriber";
import {
    NovuProvider,
    NotificationCenter,
  } from "@novu/notification-center";
  import dynamic from "next/dynamic";
  
export const NovuNC = () => {
    return (
      <NotificationCenter colorScheme='light' />
    );
  }

  export default dynamic(() => Promise.resolve(NovuNC), {
  ssr: false,
});
