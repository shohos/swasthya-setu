import SMSChatBot from "@/components/intake/SMSChatBot";
import { MessageSquareText } from "lucide-react";

export const metadata = { title: "SMS Intake — Swasthya Setu" };

export default function SMSIntakePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="p-2.5 rounded-xl bg-blue-600/15 border border-blue-800">
          <MessageSquareText className="w-6 h-6 text-blue-400" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">SMS Intake (Chatbot Simulation)</h1>
          <p className="text-sm text-slate-400">
            Bangla SMS over 2G on a ৳1,500 feature phone. In production this runs on Twilio
            SMS / local telco shortcode — simulated here in-browser.
          </p>
        </div>
      </div>
      <SMSChatBot />
    </div>
  );
}
