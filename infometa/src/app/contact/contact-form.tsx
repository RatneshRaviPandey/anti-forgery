"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const industries = [
  "Dairy", "Pharmaceuticals", "Cosmetics", "FMCG", "Electronics",
  "Auto Parts", "Agro Products", "Lubricants", "Supplements",
  "Beverages", "Luxury Goods", "Industrial Chemicals", "Other",
];

const subjects = ["Demo Request", "Partnership", "Support", "Press / Media"];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const newErrors: Record<string, string> = {};

    if (!data.get("name")?.toString().trim()) newErrors.name = "Name is required";
    if (!data.get("email")?.toString().trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.get("email")!.toString()))
      newErrors.email = "Please enter a valid email address";
    if (!data.get("message")?.toString().trim()) newErrors.message = "Message is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Thank You!</h3>
        <p className="text-secondary">
          Your message has been received. Our team will get back to you within 24 hours.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => setSubmitted(false)}>
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="name" label="Name *" placeholder="Your full name" error={errors.name} />
        <Input name="company" label="Company" placeholder="Your company name" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="email" label="Email *" type="email" placeholder="you@company.com" error={errors.email} />
        <Input name="phone" label="Phone" type="tel" placeholder="+91 98765 43210" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="industry" className="mb-1.5 block text-sm font-medium text-foreground">Industry</label>
          <select
            id="industry"
            name="industry"
            className="flex h-11 w-full rounded-lg border border-border bg-white px-4 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">Select industry...</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-foreground">Subject</label>
          <select
            id="subject"
            name="subject"
            className="flex h-11 w-full rounded-lg border border-border bg-white px-4 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">Select subject...</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">Message *</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Tell us about your needs..."
          className={`flex w-full rounded-lg border bg-white px-4 py-3 text-base text-foreground placeholder:text-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            errors.message ? "border-danger ring-1 ring-danger" : "border-border"
          }`}
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && (
          <p id="message-error" className="mt-1 text-sm text-danger" role="alert">{errors.message}</p>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Send Message
      </Button>
    </form>
  );
}
