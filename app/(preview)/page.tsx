"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown, { Options } from "react-markdown";
import React from "react";
import { LoadingIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const API_TOKEN = process.env.CONTEXTUAL_API_TOKEN!;
console.log("AGENT_ID in browser:", process.env.NEXT_PUBLIC_CONTEXTUAL_AGENT_ID);
const AGENT_ID = process.env.NEXT_PUBLIC_CONTEXTUAL_AGENT_ID;

export default function Chat() {
  type ChatMessage = { content: string; role: string };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastApiResponse, setLastApiResponse] = useState<any>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    setIsExpanded(true);
    const userMessage: ChatMessage = { content: input, role: "user" };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await res.json();
      setLastApiResponse(data);
      setScreenshot(null); // Clear previous screenshot
      console.log("Full API response:", data);
      const aiMessage: ChatMessage = {
        content: data.message?.content || '[No response]',
        role: "assistant",
      };
      setMessages((msgs) => [...msgs, aiMessage]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { content: "Error contacting Contextual AI API.", role: "assistant" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttributionClick = async (contentId: string) => {
    const agentId = AGENT_ID;
    const msgId = lastApiResponse?.message_id;
    console.log("handleAttributionClick: agentId=", agentId, "msgId=", msgId, "lastApiResponse=", lastApiResponse);
    if (!msgId || !agentId) {
      alert("Missing message_id or agent_id in API response.");
      return;
    }
    try {
      const url = `/api/retrieval-info?agent_id=${encodeURIComponent(agentId)}&message_id=${encodeURIComponent(msgId)}&content_id=${encodeURIComponent(contentId)}`;
      const res = await fetch(url);
      const data = await res.json();
      console.log("Retrieval info response:", data);
      const meta = data.content_metadatas?.[0];
      const screenshotBase64 = meta?.page_img || meta?.screenshot_base64;
      if (screenshotBase64) {
        setScreenshot(screenshotBase64);
      } else {
        setScreenshot(null);
        alert("No screenshot or page image found in content metadata.");
      }
    } catch (err) {
      setScreenshot(null);
      alert("Failed to fetch content metadata.");
    }
  };

  return (
    <div className="flex justify-center items-start sm:pt-16 min-h-screen w-full dark:bg-neutral-900 px-4 md:px-0 py-4">
      <div className="flex flex-col items-center w-full max-w-[500px]">
        <h2 className="text-2xl font-bold mb-4">Contextual AI Chat</h2>
        <motion.div
          animate={{
            minHeight: isExpanded ? 200 : 0,
            padding: isExpanded ? 12 : 0,
          }}
          transition={{
            type: "spring",
            bounce: 0.5,
          }}
          className={cn(
            "rounded-lg w-full ",
            isExpanded
              ? "bg-neutral-200 dark:bg-neutral-800"
              : "bg-transparent",
          )}
        >
          <div className="flex flex-col w-full justify-between gap-2">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                className={`bg-neutral-100 text-base w-full text-neutral-700 dark:bg-neutral-700 dark:placeholder:text-neutral-400 dark:text-neutral-300`}
                minLength={3}
                required
                value={input}
                placeholder={"Ask me anything..."}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
            </form>
            <motion.div
              transition={{
                type: "spring",
              }}
              className="min-h-fit flex flex-col gap-2"
            >
              <AnimatePresence>
                {isLoading ? (
                  <div className="px-2 min-h-12">
                    <div className="dark:text-neutral-400 text-neutral-500 text-sm w-fit mb-1">
                      {messages.slice(-1)[0]?.content}
                    </div>
                    <Loading />
                  </div>
                ) : (
                  messages.length > 0 && (
                    <div className="px-2 min-h-12">
                      {messages.map((msg, idx) =>
                        msg.role === "assistant" ? (
                          <AssistantMessage
                            key={idx}
                            message={msg}
                            lastApiResponse={lastApiResponse}
                            handleAttributionClick={handleAttributionClick}
                            retrievalContents={lastApiResponse?.retrieval_contents || []}
                          />
                        ) : (
                          <div
                            key={idx}
                            className="dark:text-neutral-400 text-neutral-500 text-sm w-fit mb-1"
                          >
                            {msg.content}
                          </div>
                        ),
                      )}
                    </div>
                  )
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
        {screenshot &&
          <div className="flex flex-col items-center mt-4">
            <img src={`data:image/png;base64,${screenshot}`} alt="Screenshot" style={{ maxWidth: 400, border: '1px solid #ccc', borderRadius: 8 }} />
          </div>
        }
      </div>
    </div>
  );
}

const AssistantMessage = ({ message, lastApiResponse, handleAttributionClick, retrievalContents }: { message: { content: string } | undefined, lastApiResponse: any, handleAttributionClick: (contentId: string) => void, retrievalContents: any[] }) => {
  if (!message) return null;
  // Deduplicate content IDs and numbers
  const uniqueAttributions: { content_id: string; number: string | number }[] = [];
  const seen = new Set<string>();
  if (lastApiResponse?.attributions && lastApiResponse.attributions.length > 0) {
    lastApiResponse.attributions.forEach((attr: any) => {
      attr.content_ids?.forEach((cid: string) => {
        if (!seen.has(cid)) {
          seen.add(cid);
          const retrieval = retrievalContents.find((rc: any) => rc.content_id === cid);
          uniqueAttributions.push({ content_id: cid, number: retrieval ? retrieval.number : cid });
        }
      });
    });
  }
  // Improved regex post-processing: wrap numbers before punctuation or end of line with markdown superscript
  const processedContent = message.content;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="whitespace-pre-wrap font-mono anti text-sm text-neutral-800 dark:text-neutral-200 overflow-hidden"
        id="markdown"
      >
        <MemoizedReactMarkdown
          className={"max-h-72 overflow-y-scroll no-scrollbar-gutter"}
          components={{
            a: ({ children }) => <span>{children}</span>,
            sup: ({ children }) => (
              <sup className="text-orange-500 bg-yellow-50 rounded px-1 font-bold mx-1">
                {children}
              </sup>
            ),
            li: ({ children }) => {
              // If the list item is just a number, style it
              const text = Array.isArray(children) ? children.join('') : children;
              if (typeof text === 'string' && text.trim().match(/^(\d{1,3})$/)) {
                return (
                  <li>
                    <span className="text-orange-500 bg-yellow-50 rounded px-1 font-bold mx-1">{text}</span>
                  </li>
                );
              }
              return <li>{children}</li>;
            },
          }}
        >
          {processedContent}
        </MemoizedReactMarkdown>
        {uniqueAttributions.length > 0 && (
          <div className="flex flex-row gap-2 mt-2 select-none">
            {uniqueAttributions.map((attr) => (
              <button
                key={attr.content_id}
                type="button"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAttributionClick(attr.content_id);
                }}
                className="text-orange-500 underline cursor-pointer text-xs mx-1"
                title={`Show content for ID: ${attr.content_id}`}
              >
                {attr.number}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const Loading = () => (
  <AnimatePresence mode="wait">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring" }}
      className="overflow-hidden flex justify-start items-center"
    >
      <div className="flex flex-row gap-2 items-center">
        <div className="animate-spin dark:text-neutral-400 text-neutral-500">
          <LoadingIcon />
        </div>
        <div className="text-neutral-500 dark:text-neutral-400 text-sm">
          Thinking...
        </div>
      </div>
    </motion.div>
  </AnimatePresence>
);

const MemoizedReactMarkdown: React.FC<Options> = React.memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className,
);
