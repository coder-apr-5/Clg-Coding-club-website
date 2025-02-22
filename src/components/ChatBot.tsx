import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, X, MinusCircle, Bot, Loader2, AlertCircle } from 'lucide-react';
import OpenAI from 'openai';

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

let openai: OpenAI | null = null;

try {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (apiKey) {
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
}

const SYSTEM_PROMPT = `You are an expert educational AI tutor. You can help with any subject including Mathematics, Physics, Chemistry, Biology, History, Literature, Computer Science, and more. Your responses should be:
1. Educational and accurate
2. Clear and easy to understand
3. Concise but thorough
4. Include examples when helpful
5. Encourage critical thinking

If a question is unclear, ask for clarification. If a topic is complex, break it down into simpler parts.`;

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isApiKeySet, setIsApiKeySet] = useState(Boolean(openai));

  useEffect(() => {
    // Set initial message based on API key status
    setMessages([{
      text: isApiKeySet 
        ? "Hi! I'm your AI learning assistant. I can help you with any subject. What would you like to learn about?"
        : "⚠️ OpenAI API key is not configured. Please add your API key to the .env file to enable AI responses.",
      isBot: true,
      timestamp: new Date(),
    }]);
  }, [isApiKeySet]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      text: message,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    if (!isApiKeySet) {
      setMessages(prev => [...prev, {
        text: "⚠️ I can't respond right now because the OpenAI API key is not configured. Please add your API key to continue.",
        isBot: true,
        timestamp: new Date(),
      }]);
      return;
    }

    setIsLoading(true);

    try {
      const completion = await openai!.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map(msg => ({
            role: msg.isBot ? 'assistant' : 'user',
            content: msg.text
          })),
          { role: 'user', content: message }
        ],
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 500,
      });

      const botResponse = completion.choices[0]?.message?.content;
      if (botResponse) {
        const botMessage: Message = {
          text: botResponse,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 flex items-center gap-2"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-sm font-medium">Chat with AI Tutor</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`bg-white rounded-lg shadow-xl transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[600px]'
          } w-[380px] flex flex-col`}
        >
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <h3 className="font-semibold">AI Learning Assistant</h3>
              {!isApiKeySet && (
                <AlertCircle className="w-5 h-5 text-yellow-300" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-indigo-700 p-1 rounded"
              >
                <MinusCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-indigo-700 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.isBot ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.isBot
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <span className="text-xs opacity-75 mt-1 block">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSendMessage}
                className="border-t p-4 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isApiKeySet ? "Ask any question..." : "API key required to send messages..."}
                  className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`${
                    isLoading || !isApiKeySet ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white p-2 rounded-full transition-colors`}
                  disabled={isLoading || !isApiKeySet}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};