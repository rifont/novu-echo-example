'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useController } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { ChoiceCards } from "@/components/notifications/ChoiceCards";
import { Input } from "@/components/ui/input";
import React from "react";
import { NovuNotificationCenter } from "@/components/notifications/NovuNotificationCenter";
import { CustomNotificationCenter } from "@/components/notifications/CustomNotificationCenter"
import { SiteFooter } from "@/components/SiteFooter"
import { SiteHeader } from "@/components/SiteHeader"
import { DEFAULT_PROFESSION, ProfessionSelector } from "@/components/notifications/ProfessionSelector"
import { NovuProvider } from "@/components/providers/NovuProvider"

const formSchema = z.object({
  message: z.string().min(2).max(400),
})

const DEFAULT_DIGEST_DURATION = 5;
const ANIMATION_DURATION = 500;

export default function Home() {
  const [digestDuration, setDigestDuration] = React.useState(DEFAULT_DIGEST_DURATION);
  const [profession, setProfession] = React.useState<string>(DEFAULT_PROFESSION);
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: values.message,
        digestDuration,
      }),
    });
    form.reset();
    setIsLoading(false);
  }


  return (
    <>
      <SiteHeader />
      <main className="container flex max-w-screen-2xl flex-col items-center">
        <h1 className="text-4xl font-bold my-8">AI Notifications Digest</h1>
        <p className="text-lg text-left mb-4">
          Select a sample 
          {' '}
          <ProfessionSelector onValueChange={setProfession} className="inline-flex w-auto h-8 p-0 px-2 text-sm"/>
          {' '}
          notification or enter a custom message to send. Novu will digest the messages for
          {' '}
          <Input
            type="number"
            min="0"
            max="60"
            value={digestDuration}
            onChange={(e) => setDigestDuration(parseInt(e.target.value))}
            className="inline-flex w-8 h-8 p-0 text-sm overflow-visible text-center"
          />
          {' '} seconds and send an AI digested notification in the chat.
        </p>
        <div className="flex flex-col lg:flex-row w-full items-start gap-8">
          <div className="flex flex-col w-full lg:w-[50%]">
            <div><ChoiceCards profession={profession} onClick={(message: any) => (onSubmit({ message }))} /></div>
            <div><Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-4">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Message</FormLabel>
                      <FormControl>
                        <Input disabled={isLoading} placeholder="Type your custom notification here..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex align-middle">
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    Send ⇨
                  </Button>
                </div>
              </form>
            </Form>
            </div>
          </div>
          <div className="flex flex-col justify-center w-full lg:w-[50%]">
            <NovuProvider>
              {/* <NovuNotificationCenter /> */}
              <CustomNotificationCenter />
            </NovuProvider>
          </div>
        </div>

      </main>
      <SiteFooter />
    </>
  );
}
