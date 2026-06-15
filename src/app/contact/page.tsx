import type { Metadata } from "next";
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Contact Us — nextLesson",
  description: "Get in touch with the nextLesson team.",
};

export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Contact Us</h1>
        <p className="text-gray-500 text-sm">
          Have a question, suggestion, or found something broken? We&apos;d love
          to hear from you.
        </p>
      </div>

      {/* Contact options */}
      <div className="space-y-3">
        <a
          href="https://www.linkedin.com/in/vinod-barti-339571268/"
          target="_blank"
          rel="noopener noreferrer"
          className="card flex items-center gap-4 hover:border-gray-200 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 group-hover:text-sky-600 transition-colors">
              Linkedin / in
            </div>
            <div className="text-xs text-gray-400 mt-0.5">@creator</div>
          </div>
        </a>

        <a
          href="mailto:winn.od143.166@gmail.com"
          className="card flex items-center gap-4 hover:border-gray-200 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <EnvelopeIcon className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              Email us
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              winn.od143.166@gmail.com
            </div>
          </div>
        </a>
      </div>

      {/* Contact form — uses formsubmit.co (free, no backend needed) */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-gray-800">
          Send us a message
        </h2>

        <form
          action="https://formspree.io/f/xgobropo"
          method="POST"
          className="space-y-4"
        >
          {/* Honeypot spam protection */}
          <input type="text" name="_honey" style={{ display: "none" }} />
          <input type="hidden" name="_captcha" value="false" />
          <input
            type="hidden"
            name="_next"
            value="https://nextLesson.app/contact?sent=1"
          />

          <div>
            <label
              htmlFor="name"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Your name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="John Doe"
              className="input"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="input"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              placeholder="Tell us what's on your mind..."
              className="input resize-none leading-relaxed"
            />
          </div>

          <button type="submit" className="btn-primary w-full justify-center">
            Send message
          </button>
        </form>
      </div>

      <p className="text-xs text-gray-400 text-center">
        We usually reply within 24–48 hours.
      </p>
    </div>
  );
}
