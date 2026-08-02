'use client'

import { useState } from 'react'
import { Phone, Mail } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    // In production, this would send to Supabase or an API
  }

  return (
    <div className="min-h-screen">
      <div className="border-b-2 border-ink px-4 py-8 sm:px-10 sm:py-10">
        <h1 className="font-display text-3xl uppercase sm:text-5xl">CONTACT</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="font-display text-xl uppercase pb-2 border-b-2 border-ink">GET IN TOUCH</h2>
            
            <div className="space-y-4">
              <a
                href="tel:+2349039744146"
                className="flex items-center gap-4 p-4 border-2 border-ink hover:bg-coral hover:text-paper hover:border-coral transition group"
              >
                <Phone className="h-5 w-5" />
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase text-ink/50 group-hover:text-paper/70">PHONE</p>
                  <p className="font-mono text-sm">+234 903 974 4146</p>
                </div>
              </a>

              <a
                href="mailto:VERTIKALoriginals@gmail.com"
                className="flex items-center gap-4 p-4 border-2 border-ink hover:bg-coral hover:text-paper hover:border-coral transition group"
              >
                <Mail className="h-5 w-5" />
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase text-ink/50 group-hover:text-paper/70">EMAIL</p>
                  <p className="font-mono text-sm">VERTIKALoriginals@gmail.com</p>
                </div>
              </a>

              <a
                href="https://instagram.com/VERTIKALoriginals_"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 border-2 border-ink hover:bg-coral hover:text-paper hover:border-coral transition group"
              >
                <span className="font-mono text-lg font-bold">@</span>
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase text-ink/50 group-hover:text-paper/70">INSTAGRAM</p>
                  <p className="font-mono text-sm">@VERTIKALoriginals_</p>
                </div>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="font-display text-xl uppercase pb-2 border-b-2 border-ink mb-6">SEND A MESSAGE</h2>
            
            {submitted ? (
              <div className="border-2 border-ink bg-acid p-6 text-center">
                <h2 className="font-display text-xl uppercase mb-2">MESSAGE SENT</h2>
                <p className="font-mono text-sm">
                  We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block font-mono text-[11px] font-bold uppercase mb-2">
                    NAME *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block font-mono text-[11px] font-bold uppercase mb-2">
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block font-mono text-[11px] font-bold uppercase mb-2">
                    SUBJECT *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block font-mono text-[11px] font-bold uppercase mb-2">
                    MESSAGE *
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    required
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase hover:bg-coral hover:border-coral transition"
                >
                  SEND MESSAGE
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
