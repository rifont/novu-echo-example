'use client'

import { NovuProvidedNC } from "@/components/NovuProvidedNC";

export default function Home() {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = event.target[0].value;
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    console.log(data);
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">

      <div>
        <form onSubmit={handleSubmit}>
          <div style={{display: "flex", flexDirection: "row"}}>
            <div style={{display: "flex", flexDirection: "column"}}>
              <label htmlFor="message">Message</label>
              <input type="text" />
            </div>
            <button type="submit">Send</button>
          </div>
        </form>
        <div style={{marginTop: "10px"}}><NovuProvidedNC /></div>
      </div>

    </main>
  );
}
