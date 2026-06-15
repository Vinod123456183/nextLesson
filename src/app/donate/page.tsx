import type { Metadata } from "next";
import {
  HeartIcon,
  SparklesIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Support nextLesson — Donate",
  description: "Help keep nextLesson free and growing for everyone.",
};

const PERKS = [
  {
    icon: HeartIcon,
    color: "bg-red-50 text-red-500",
    title: "Keep it free",
    desc: "nextLesson will always be free to read. Your support covers server and hosting costs.",
  },
  {
    icon: SparklesIcon,
    color: "bg-yellow-50 text-yellow-500",
    title: "No ads, ever",
    desc: "Donations mean we never need to show ads or sell your data. Community-funded only.",
  },
  {
    icon: RocketLaunchIcon,
    color: "bg-blue-50 text-blue-500",
    title: "New features",
    desc: "Support helps us build: bookmarks, comments, newsletters, and more.",
  },
];

export default function DonatePage() {
  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-2">
          <HeartIcon className="w-6 h-6 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Support nextLesson</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          nextLesson is built by a small team and kept free for everyone. If
          it&apos;s helped you, consider buying us a coffee.
        </p>
      </div>

      {/* Donation options */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-gray-800">
          Choose an amount
        </h2>

        <div className="grid grid-cols-3 gap-2">
          {["₹29", "₹39", "₹49"].map((amt) => (
            <div
              key={amt}
              className="flex flex-col items-center justify-center py-3 rounded-lg border-2 border-gray-100 hover:border-brand-400 hover:bg-brand-50 transition-all text-sm font-semibold text-gray-700 hover:text-brand-600"
            >
              {amt}
              <span className="text-xs font-normal text-gray-400 mt-0.5">
                {amt === "₹29"
                  ? "Coffee ☕"
                  : amt === "₹39"
                    ? "Lunch 🥗"
                    : "Dinner 🍕"}
              </span>
            </div>
          ))}
        </div>

        {/* UPI for Indian users */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            <Image
              src="/assets/manisha-QR-Code.png"
              alt="QR Code"
              width={200}
              height={200}
              priority
            />
          </div>

          <p className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            Qr Name : Manisha Barti .
          </p>
        </div>
      </div>

      {/* Why donate */}
      <div className="space-y-3">
        {PERKS.map((perk) => (
          <div key={perk.title} className="card flex items-start gap-4">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${perk.color}`}
            >
              <perk.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {perk.title}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {perk.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Every donation, big or small, makes a real difference. Thank you 🙏
      </p>
    </div>
  );
}
