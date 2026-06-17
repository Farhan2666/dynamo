"use client";

import { useState, type FormEvent } from "react";
import { Button } from "./ui/button";

interface ContactFormProps {
  cta: string;
}

export function ContactForm({ cta }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setStatus("sending");

    try {
      const mailto = `mailto:hello@${window.location.hostname.replace("www.", "")}?subject=Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
      window.location.href = mailto;
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your Name"
        required
        className="w-full px-4 py-3 rounded-soft border border-surface-tertiary text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 bg-surface transition-all"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your Email"
        required
        className="w-full px-4 py-3 rounded-soft border border-surface-tertiary text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 bg-surface transition-all"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message"
        rows={3}
        required
        className="w-full px-4 py-3 rounded-soft border border-surface-tertiary text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 bg-surface resize-none transition-all"
      />
      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={status === "sending"}
        loading={status === "sending"}
      >
        {status === "sent" ? "✓ Sent!" : status === "error" ? "Failed to send" : cta}
      </Button>
    </form>
  );
}
