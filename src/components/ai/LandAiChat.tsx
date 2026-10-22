import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2, Copy, Check, Radio } from 'lucide-react';
import { AppLanguage, ChatMessage } from '../../types';
import { getTranslation } from '../../lib/translations';
import { askDigitalAmin } from '../../lib/gemini';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';
import { sound } from '../../lib/sound';

interface LandAiChatProps {
  lang: AppLanguage;
  apiKey?: string;
}

export const LandAiChat: React.FC<LandAiChatProps> = ({ lang, apiKey }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'AI',
      text:
        lang === 'BN'
          ? `### স্বাগতম! আমি "ডিজিটাল আমিন" (Digital Amin)।\n\nআমি বাংলাদেশ ও দক্ষিণ এশিয়ার ভূমি জরিপ, পরিমাপের সূত্রাবলি (হেরন সূত্র, সুলেস মেথড), সিএস/এসএ/আরএস/বিএস খতিয়ান, ই-নামজারি (খারিজ), খাজনা দাখিলা, হেবা ও সাফ-কবলা দলিল সংক্রান্ত যেকোনো প্রশ্নের উত্তর দিতে প্রস্তুত।\n\nনিচের প্রশ্নগুলোতে ক্লিক করে কিংবা নিজে লিখে যেকোনো প্রশ্ন করুন:`
          : `### Welcome! I am "Digital Amin" — Land AI Assistant.\n\nI specialize in South Asian & Bangladesh land surveying, mathematical formulas (Heron's, Shoelace), CS/SA/RS/BS records, E-Mutation (Namjari), deeds, and heir distribution.\n\nClick any suggested question below or type your inquiry:`,
      timestamp: Date.now(),
    },
  ]);

  const [inputVal, setInputVal] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const suggestions = [
    getTranslation('ai_suggest_1', lang),
    getTranslation('ai_suggest_2', lang),
    getTranslation('ai_suggest_3', lang),
    getTranslation('ai_suggest_4', lang),
    getTranslation('ai_suggest_5', lang),
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputVal).trim();
    if (!textToSend || isTyping) return;

    sound.playClick();
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'USER',
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      const reply = await askDigitalAmin(textToSend, messages, apiKey, lang);
      sound.playBeep();
      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'AI',
        text: reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'AI',
        text:
          lang === 'BN'
            ? 'দুঃখিত, এই মুহূর্তে উত্তর প্রক্রিয়াকরণে সমস্যা হচ্ছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
            : 'Sorry, unable to process response right now. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    sound.playReset();
    setMessages([
      {
        id: 'welcome',
        sender: 'AI',
        text:
          lang === 'BN'
            ? 'কথোপকথন মুছে ফেলা হয়েছে। আপনার নতুন প্রশ্ন করুন।'
            : 'Conversation cleared. Feel free to ask a new question.',
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Info Card */}
      <SkeuoCard style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 10px rgba(46, 125, 50, 0.35)',
              }}
            >
              <Bot size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#1B5E20', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{getTranslation('ai_title', lang)}</span>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 900,
                    background: 'rgba(78, 250, 138, 0.2)',
                    color: '#2E7D32',
                    border: '1px solid #2E7D32',
                    borderRadius: '4px',
                    padding: '2px 5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <Radio size={8} /> GEMINI FLASH 2.5
                </span>
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {getTranslation('ai_subtitle', lang)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="skeuo-btn skeuo-btn-danger"
            style={{ padding: '6px 12px', fontSize: '11px' }}
          >
            <Trash2 size={13} />
            <span>{lang === 'BN' ? 'চ্যাট মুছুন' : 'Clear Chat'}</span>
          </button>
        </div>
      </SkeuoCard>

      {/* Suggestion Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(s)}
            style={{
              background: 'var(--surface-plate)',
              border: '1px solid var(--border-rim)',
              borderRadius: '999px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1B5E20',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={12} color="#2E7D32" />
            <span>{s}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Window */}
      <SkeuoCard
        showScrews
        style={{
          padding: '16px',
          minHeight: '380px',
          maxHeight: '520px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            paddingRight: '6px',
            maxHeight: '440px',
          }}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'USER';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  gap: '8px',
                  alignItems: 'flex-start',
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: '#1B5E20',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={16} />
                  </div>
                )}

                <div
                  style={{
                    maxWidth: '82%',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    background: isUser
                      ? 'linear-gradient(180deg, #388E3C 0%, #1B5E20 100%)'
                      : 'var(--surface-plate)',
                    color: isUser ? '#FFFFFF' : 'var(--text-main)',
                    border: isUser ? 'none' : '1px solid var(--border-rim)',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.06)',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    position: 'relative',
                  }}
                >
                  {/* Text content with simple markdown support */}
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                  {!isUser && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="Copy message"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedId === msg.id ? '#2E7D32' : 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: '#1E88E5',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2E7D32', fontSize: '12px', fontWeight: 700 }}>
              <Bot size={16} />
              <span className="animate-pulse">
                {lang === 'BN' ? 'ডিজিটাল আমিন উত্তর প্রস্তুত করছেন...' : 'Digital Amin is thinking...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-rim)' }}>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={getTranslation('ai_placeholder', lang)}
            className="skeuo-input"
            style={{ flex: 1 }}
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputVal.trim() || isTyping}
            className="skeuo-btn skeuo-btn-green"
            style={{ padding: '10px 18px' }}
          >
            <Send size={16} />
            <span>{getTranslation('ai_send', lang)}</span>
          </button>
        </div>
      </SkeuoCard>

      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
        {getTranslation('ai_disclaimer', lang)}
      </div>
    </div>
  );
};
