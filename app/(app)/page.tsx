"use client";

import { ChatInterface } from "@/components/chat/chat-interface";

export default function ChatPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">AI Assistant</h2>
        <p className="text-muted-foreground">
          Ask me to search your emails, organize them, or take actions on your behalf.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
