'use client'

import { NovuProvidedNC } from "@/components/NovuProvidedNC";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { ChoiceCards } from "@/components/ChoiceCards";
import { Input } from "@/components/ui/input";
import React from "react";

const formSchema = z.object({
  message: z.string().min(2).max(400),
})

export default function Home() {
  const [digestDuration, setDigestDuration] = React.useState(5);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch("/api/messages", {
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
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 sm:p-24">
      <h1 className="text-4xl font-bold mb-4">AI Notifications Digest</h1>
      <p className="text-lg text-left mb-4">
        Select or enter a message to send. Novu will digest the messages for
        <Input
          type="number"
          min="0"
          max="60"
          value={digestDuration}
          onChange={(e) => setDigestDuration(parseInt(e.target.value))}
          className="inline-block w-12 border border-gray-300 rounded-md px-2 text-sm mx-2 overflow-visible"
        />
        seconds and send an AI digested notification in the chat.
      </p>
      <div className="w-full"><ChoiceCards onClick={(message) => (onSubmit({ message }))} /></div>
      <div className="w-full"><Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-4">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Message</FormLabel>
                <FormControl>
                  <Textarea placeholder="Type your custom notification here..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Send ⇨</Button>
        </form>
      </Form>
      </div>
      <div style={{ marginTop: "10px" }}><NovuProvidedNC /></div>

    </main>
  );
}
