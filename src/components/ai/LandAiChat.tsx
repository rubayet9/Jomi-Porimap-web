import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Copy,
  Check,
  Radio,
  ImagePlus,
  Paperclip,
  X,
  Maximize2,
  FileText,
  Search,
} from 'lucide-react';
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
          ? `### স্বাগতম! আমি "ডিজিটাল আমিন" (Digital Amin)।\n\nআমি বাংলাদেশ ও দক্ষিণ এশিয়ার ভূমি জরিপ, খতিয়ান ও পর্চা বিশ্লেষক এআই সহকারী।\n\n📷 **নতুন সুবিধা:** আপনি সরাসরি আপনার **খতিয়ান বা পর্চার ছবি আপলোড (বা ক্যামেরা দিয়ে ছবি তুলে)** দিয়ে "হিসাব করে দাও" বললেই আমি খতিয়ানের মোট জমি, দাগ নম্বর এবং অংশীদারদের প্রাপ্ত শতাংশ ও কাঠার নিখুঁত হিসাব বের করে দিব!\n\nএছাড়াও ভূমি আইন, নামজারি (খারিজ), হেবা বা দলিল সংক্রান্ত যেকোনো প্রশ্ন করতে পারেন:`
          : `### Welcome! I am "Digital Amin" — Land & Khatian AI Assistant.\n\n📷 **New Feature:** You can directly attach or capture a **photo of your Khatian (পর্চা)** and ask me to calculate the shares. I will extract the plot numbers, total land, and calculate each owner's exact share in Sotangso, Katha, and Sq.Ft!\n\nYou can also ask any questions about mutation (Namjari), deeds, or survey math:`,
      timestamp: Date.now(),
    },
  ]);

  const [inputVal, setInputVal] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Image Upload States
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generalSuggestions = [
    getTranslation('ai_suggest_1', lang),
    getTranslation('ai_suggest_2', lang),
    getTranslation('ai_suggest_3', lang),
    getTranslation('ai_suggest_4', lang),
    getTranslation('ai_suggest_5', lang),
  ];

  const imageSpecificPrompts =
    lang === 'BN'
      ? [
          '📜 এই খতিয়ানের মোট জমি ও সবার হিস্যা হিসাব করে দাও',
          '🔍 খতিয়ানের দাগ নং, মৌজা ও অংশীদারদের শতক জমি বের করো',
          '⚖️ খতিয়ানের আনা বা দশমিক অংশ বিস্তারিত টেবিল আকারে দেখাও',
        ]
      : [
          '📜 Calculate total land and all partners’ shares from this Khatian',
          '🔍 Extract Khatian plot numbers, Mouza, and land in Sotangso',
          '⚖️ Break down ownership shares in a detailed Markdown table',
        ];

  // Client-side image compression & loading
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Limit max dimensions to 1600px for speed & optimal OCR quality
        const maxDim = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.88);
          setAttachedImage(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input value so same image can be reselected if needed
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    sound.playClick();
    setAttachedImage(null);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputVal).trim();
    // Allow sending if there's text OR an attached image
    if ((!textToSend && !attachedImage) || isTyping) return;

    sound.playClick();
    const effectiveText =
      textToSend ||
      (attachedImage
        ? lang === 'BN'
          ? 'এই খতিয়ান/পর্চার ছবিটি পড়ে বিস্তারিত হিসাব করে দিন।'
          : 'Please analyze this Khatian/Porcha document and calculate the shares.'
        : '');

    const currentImage = attachedImage;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'USER',
      text: effectiveText,
      image: currentImage || undefined,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setAttachedImage(null);
    setIsTyping(true);

    try {
      const reply = await askDigitalAmin(
        effectiveText,
        messages,
        apiKey,
        lang,
        currentImage || undefined
      );
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
    setAttachedImage(null);
    setMessages([
      {
        id: 'welcome',
        sender: 'AI',
        text:
          lang === 'BN'
            ? 'কথোপকথন মুছে ফেলা হয়েছে। খতিয়ানের ছবি দিন বা আপনার নতুন প্রশ্ন করুন।'
            : 'Conversation cleared. Attach a Khatian photo or ask a new question.',
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />

      {/* Header Info Card */}
      <SkeuoCard style={{ padding: '16px 20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
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
              <h2
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#1B5E20',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
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
                {lang === 'BN'
                  ? 'খতিয়ানের ছবি বিশ্লেষণ, জমি পরিমাপ ও ডিজিটাল ভূমি আইন পরামর্শক'
                  : 'Khatian Vision OCR, Land Survey & Mutation Consultant'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Quick Upload Button in Header */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="skeuo-btn skeuo-btn-green"
              style={{ padding: '6px 12px', fontSize: '11px' }}
              title={lang === 'BN' ? 'খতিয়ানের ছবি আপলোড করুন' : 'Upload Khatian Photo'}
            >
              <ImagePlus size={14} />
              <span>{lang === 'BN' ? 'খতিয়ানের ছবি' : 'Khatian Photo'}</span>
            </button>

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
        </div>
      </SkeuoCard>

      {/* Suggestion Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {(attachedImage ? imageSpecificPrompts : generalSuggestions).map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(s)}
            style={{
              background: attachedImage ? 'rgba(46, 125, 50, 0.12)' : 'var(--surface-plate)',
              border: attachedImage ? '1.5px solid #2E7D32' : '1px solid var(--border-rim)',
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
          minHeight: '400px',
          maxHeight: '560px',
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
                    maxWidth: '85%',
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
                  {/* If user sent an image, render preview thumbnail */}
                  {msg.image && (
                    <div style={{ marginBottom: '8px' }}>
                      <div
                        onClick={() => setPreviewModalImage(msg.image || null)}
                        style={{
                          position: 'relative',
                          cursor: 'pointer',
                          display: 'inline-block',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: '2px solid rgba(255, 255, 255, 0.4)',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        }}
                      >
                        <img
                          src={msg.image}
                          alt="Khatian Document"
                          style={{
                            maxWidth: '220px',
                            maxHeight: '160px',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '4px',
                            right: '4px',
                            background: 'rgba(0,0,0,0.65)',
                            color: '#FFF',
                            borderRadius: '4px',
                            padding: '2px 5px',
                            fontSize: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <Maximize2 size={10} /> {lang === 'BN' ? 'বড় করুন' : 'Zoom'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Text content with simple markdown support */}
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {msg.text}
                  </div>

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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#2E7D32',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              <Bot size={16} />
              <span className="animate-pulse">
                {attachedImage
                  ? lang === 'BN'
                    ? 'ডিজিটাল আমিন খতিয়ানের ছবি স্ক্যান ও হিস্যা হিসাব করছেন...'
                    : 'Digital Amin is scanning Khatian document & calculating...'
                  : lang === 'BN'
                  ? 'ডিজিটাল আমিন উত্তর প্রস্তুত করছেন...'
                  : 'Digital Amin is thinking...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Attached Image Preview Bar */}
        {attachedImage && (
          <div
            style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: 'rgba(46, 125, 50, 0.08)',
              borderRadius: '12px',
              border: '1.5px dashed rgba(46, 125, 50, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={attachedImage}
                alt="Thumbnail"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  border: '1px solid var(--border-rim)',
                }}
              />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#1B5E20' }}>
                  📷 {lang === 'BN' ? 'খতিয়ান / দলিলের ছবি সংযুক্ত হয়েছে' : 'Khatian Document Attached'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {lang === 'BN'
                    ? 'নিচে লিখে পাঠান অথবা উপরের সাজেস্টেড প্রশ্নে ক্লিক করুন'
                    : 'Click a suggested prompt above or type to calculate'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveImage}
              style={{
                background: '#D32F2F',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid var(--border-rim)',
            alignItems: 'center',
          }}
        >
          {/* Attach Image / Photo Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="skeuo-btn skeuo-btn-brass"
            style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            title={lang === 'BN' ? 'খতিয়ানের ছবি যুক্ত করুন' : 'Attach Khatian Photo'}
          >
            <ImagePlus size={18} />
            <span style={{ fontSize: '12px' }}>{lang === 'BN' ? 'ছবি দিন' : 'Photo'}</span>
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={
              attachedImage
                ? lang === 'BN'
                  ? 'ছবি সংক্রান্ত প্রশ্ন লিখুন (বা সরাসরি পাঠান চাপুন)...'
                  : 'Ask about this document or click send...'
                : getTranslation('ai_placeholder', lang)
            }
            className="skeuo-input"
            style={{ flex: 1 }}
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={(!inputVal.trim() && !attachedImage) || isTyping}
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

      {/* Image Zoom Modal */}
      {previewModalImage && (
        <div
          className="modal-backdrop"
          onClick={() => setPreviewModalImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: '#000',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            <button
              type="button"
              onClick={() => setPreviewModalImage(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.6)',
                color: '#FFF',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              <X size={18} />
            </button>
            <img
              src={previewModalImage}
              alt="Full Khatian Preview"
              style={{ maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain', display: 'block' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
