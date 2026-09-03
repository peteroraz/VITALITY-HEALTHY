import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, HelpCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { UserProfile, ChatMessage } from '../types';
import { authenticatedFetch } from '../utils/authenticatedFetch';

interface AICoachViewProps {
  userProfile: UserProfile;
}

export const AICoachView: React.FC<AICoachViewProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello ${userProfile.name}! I am **Vitality AI**, your personal health coach. I see your primary goal is **${userProfile.goal.replace('_', ' ')}** with a **${userProfile.diet}** preference.\n\nI can help you tweak daily recipes, substitute ingredients, modify exercise difficulty, or craft science-backed sleep rituals. How can I assist your health journey today?`,
      timestamp: 'Just now',
      suggestedActions: [
        { label: 'High protein quick snacks', action: 'Give me 3 quick high-protein snack ideas under 200 calories.' },
        { label: '5-min office stretch', action: 'What are 4 quick ergonomic stretches I can do at my desk right now?' },
        { label: 'Evening sleep ritual', action: 'Give me a 3-step evening wind-down routine for restorative sleep.' }
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await authenticatedFetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: query,
          userProfile,
          chatHistory: messages.slice(-6)
        })
      });
      if (!res.ok) throw new Error(`AI Coach request failed with status ${res.status}`);
      const data = await res.json();

      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || "I'm right here to support your healthy lifestyle! Let me know if you need customized workout adjustments or meal prep tips.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions
      };

      setMessages(prev => [...prev, aiReply]);
    } catch (err) {
      const fallbackReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Here is a science-backed tip aligned with your **${userProfile.goal.replace('_', ' ')}** goal: Aim to consume 30g of protein within an hour of waking to stabilize daily blood sugar and curb afternoon cravings. Also, take a 2-minute posture break every hour to decompress your cervical spine!`,
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Personal Coach</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Vitality AI Health Coach</h1>
          <p className="text-xs sm:text-sm text-emerald-100/80">
            Ask anything about nutrition, macro calculations, exercise modifications, or mindfulness techniques.
          </p>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-6 shadow-sm min-h-[450px] max-h-[600px] overflow-y-auto space-y-6 flex flex-col">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              msg.sender === 'user' 
                ? 'bg-gray-900 text-white' 
                : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
            }`}>
              {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>

            <div className="space-y-2">
              <div className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-gray-900 text-white rounded-tr-xs'
                  : 'bg-gray-50 text-gray-800 border border-gray-200/60 rounded-tl-xs'
              }`}>
                {msg.text}
              </div>

              {msg.suggestedActions && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {msg.suggestedActions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(act.action)}
                      className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold px-3 py-1.5 rounded-xl border border-emerald-200/60 transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center text-gray-400 text-xs py-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 animate-pulse">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <span>Vitality AI Coach is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Coach for a healthy snack idea, stretch guide, or workout tip..."
          className="flex-1 bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
