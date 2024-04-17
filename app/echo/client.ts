import { Echo } from "@novu/echo";
import { renderReactEmail } from "./emails/vercel";

export const echo = new Echo({
  /**
   * Enable this flag only during local development
   */
  devModeBypassAuthentication: process.env.NODE_ENV === "development",
  apiKey: process.env.NOVU_API_KEY,
});

echo.workflow('inApp-notification', async ({ step }) => {
  await step.inApp('send-inApp-notification', () => ({
    body: 'This is an inApp notification body',
  }), { inputSchema: { type: "object", properties: {} } });
});

echo.workflow('chat-notification', async ({ step }) => {
  await step.chat('send-chat-notification', () => ({
    body: 'This is an chat notification body',
  }), { inputSchema: { type: "object", properties: {} } });
});

echo.workflow('sms-notification', async ({ step }) => {
  await step.sms('send-sms-notification', () => ({
    body: 'This is an sms notification body',
  }), { inputSchema: { type: "object", properties: {} } });
});

echo.workflow('push-notification', async ({ step }) => {
  await step.push('send-push-notification', () => ({
    subject: 'This is a push notification subject',
    body: 'This is a push notification body',
  }), { inputSchema: { type: "object", properties: {} } });
});

echo.workflow('delay-email', async ({ step }) => {
  const delayed = await step.delay('delay', () => ({
    unit: 'minutes',
    amount: 2,
  }));
  
  await step.email('send-email', () => ({
    subject: 'This is a delayed email subject',
    body: `This is a delayed email body. Delayed by ${delayed.duration} milliseconds`,
  }));
});

echo.workflow('digest-email', async ({ step, payload }) => {
  const digested = await step.digest('ve-alert-digest-daily', () => {
    return {
      unit: 'minutes',
      amount: 2,
    };
  });

  await step.email(
    "send-email",
    async (inputs) => {
      return {
        subject: "This is an email subject",
        body: `<html><body>${digested.events.map((event) => `<p>${new Date(event.time).toLocaleString()} - ${(event.payload as any).body}</p>`).join("")}</body></html>`,
      };
    },
  );
},{ payloadSchema: { type: "object", properties: {body: {type: "string", default: 'Test Body'}}, required: ["body"], additionalProperties: false } as const });

echo.workflow(
  "hello-world",
  async ({ step }) => {
    await step.email(
      "send-email",
      async (inputs) => {
        return {
          subject: "This is an email subject",
          body: renderReactEmail(inputs),
        };
      },
      {
        inputSchema: {
          type: "object",

          properties: {
            showButton: { type: "boolean", default: true },
            username: { type: "string", default: "alanturing" },
            userImage: {
              type: "string",
              default:
                "https://react-email-demo-bdj5iju9r-resend.vercel.app/static/vercel-user.png",
              format: "uri",
            },
            invitedByUsername: { type: "string", default: "Alan" },
            invitedByEmail: {
              type: "string",
              default: "alan.turing@example.com",
              format: "email",
            },
            teamName: { type: "string", default: "Team Awesome" },
            teamImage: {
              type: "string",
              default:
                "https://react-email-demo-bdj5iju9r-resend.vercel.app/static/vercel-team.png",
              format: "uri",
            },
            inviteLink: {
              type: "string",
              default: "https://vercel.com/teams/invite/foo",
              format: "uri",
            },
            inviteFromIp: { type: "string", default: "204.13.186.218" },
            inviteFromLocation: {
              type: "string",
              default: "São Paulo, Brazil",
            },
          },
        },
      },
    );
  },
  { payloadSchema: { type: "object", properties: {} } },
);
