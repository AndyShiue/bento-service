"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/react";
import { MessageSquare, X, SendHorizonal } from "lucide-react"; // Consider SendHorizonal for the send button

export function LexChat() {
  const apiUrl = "https://ybdrax2oo0.execute-api.ap-southeast-2.amazonaws.com/dev/lex";

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ id: number; fromUser: boolean; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const toggleOpen = () => setIsOpen((v) => !v);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      fromUser: true,
      text: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });

      if (!response.ok) throw new Error("API呼叫失敗");

      const data = await response.json();
      const botMsg = {
        id: Date.now() + 1,
        fromUser: false,
        text: data.body,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 2,
        fromUser: false,
        text: `發生錯誤，請稍後再試： ${err}`,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <Button
        variant="solid"
        size="lg"
        className="fixed bottom-6 right-6 rounded-full shadow-xl z-50 transition-all duration-300 hover:scale-105 active:scale-95" // Added transition for better feel
        onClick={toggleOpen}
        aria-label={isOpen ? "關閉聊天視窗" : "開啟聊天視窗"}
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}
      </Button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 h-[450px] bg-white rounded-xl shadow-2xl flex flex-col z-50 animate-fade-in-up">
          <header className="p-4 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold rounded-t-xl flex items-center justify-between">
            <span>聊天機器人</span>
          </header>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/70 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[280px] text-center text-gray-500 text-sm italic py-8">
                <MessageSquare className="w-8 h-8 mb-2 text-gray-400" />
                <p>請輸入訊息開始聊天...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[85%] px-4 py-2 rounded-2xl whitespace-pre-wrap text-sm break-words relative
                    ${msg.fromUser
                      ? "bg-primary text-white self-end ml-auto rounded-br-md"
                      : "bg-white border border-gray-400 text-gray-800 self-start mr-auto rounded-bl-md"
                    }`}
                >
                  {msg.text}
                </div>
              ))
            )}
            <div ref={messageEndRef} />
          </div>

          <footer className="p-3 border-t border-gray-400 flex items-center space-x-2 bg-white">
            <input
              type="text"
              className="flex-grow border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors" // Rounded input, transition
              placeholder={loading ? "請稍候..." : "輸入訊息..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading}
            />
            <Button
              variant="solid"
              size="sm"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="rounded-full px-4 py-2 transition-all duration-200"
            >
              {loading ? (
                <span className="animate-pulse">傳送中...</span>
              ) : (
                <SendHorizonal className="w-5 h-5" />
              )}
            </Button>
          </footer>
        </div>
      )}
    </>
  );
}