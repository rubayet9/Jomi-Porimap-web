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
  File,
  Plus,
  UploadCloud,
} from 'lucide-react';
import { AppLanguage, ChatMessage, ChatAttachment } from '../../types';
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
          ? `### স্বাগতম! আমি "ডিজিটাল আমিন" (Digital Amin)।\n\nআমি বাংলাদেশ ও দক্ষিণ এশিয়ার ভূমি জরিপ, খতিয়ান ও পর্চা বিশ্লেষক এআই সহকারী।\n\n📷 **নতুন সুবিধা:** আপনি সরাসরি আপনার **খতিয়ান বা পর্চার ৩-৪টি ছবি বা PDF ফাইল ড্র্যাগ-অ্যান্ড-ড্রপ অথবা আপলোড** করে যেকোনো প্রশ্ন করতে পারেন। আমি খতিয়ানের মোট জমি, দাগ নম্বর এবং অংশীদারদের প্রাপ্ত শতাংশ ও কাঠার নিখুঁত হিসাব বের করে দিব!\n\nএছাড়াও ভূমি আইন, নামজারি (খারিজ), হেবা বা দলিল সংক্রান্ত যেকোনো প্রশ্ন করতে পারেন:`
          : `### Welcome! I am "Digital Amin" — Land & Khatian AI Assistant.\n\n📷 **New Feature:** You can upload or drag & drop up to **3-4 photos or PDF files** of your Khatian (পর্চা) and ask me to calculate the shares. I will extract the plot numbers, total land, and calculate each owner's exact share in Sotangso, Katha, and Sq.Ft!\n\nYou can also ask any questions about mutation (Namjari), deeds, or survey math:`,
      timestamp: Date.now(),
    },
  ]);

  const [inputVal, setInputVal] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Multi-attachment (Images & PDFs) & Drag-and-drop States
  const [attachedFiles, setAttachedFiles] = useState<ChatAttachment[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewModalAttachment, setPreviewModalAttachment] = useState<ChatAttachment | null>(null);

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

  const attachmentSpecificPrompts =
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Client-side image compression & PDF reader
  const handleProcessFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    sound.playClick();
    const maxAllowed = 4;
    const currentCount = attachedFiles.length;
    const remainingSlots = Math.max(0, maxAllowed - currentCount);

    if (remainingSlots <= 0) {
      alert(
        lang === 'BN'
          ? 'একসাথে সর্বোচ্চ ৪টি ছবি বা PDF ফাইল যুক্ত করা যাবে।'
          : 'You can attach up to 4 images or PDF files at once.'
      );
      return;
    }

    const selectedFiles = fileArray.slice(0, remainingSlots);
    const newAttachments: ChatAttachment[] = [];

    for (const file of selectedFiles) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImage = file.type.startsWith('image/');

      if (!isPdf && !isImage) continue;

      if (isPdf) {
        try {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          newAttachments.push({
            id: String(Date.now() + Math.random()),
            name: file.name,
            type: 'pdf',
            mimeType: 'application/pdf',
            dataUrl,
            size: file.size,
          });
        } catch (e) {
          console.error('Error reading PDF file:', e);
        }
      } else if (isImage) {
        try {
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const img = new Image();
              img.onload = () => {
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
                  resolve(canvas.toDataURL('image/jpeg', 0.88));
                } else {
                  resolve(event.target?.result as string);
                }
              };
              img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
          });

          newAttachments.push({
            id: String(Date.now() + Math.random()),
            name: file.name,
            type: 'image',
            mimeType: 'image/jpeg',
            dataUrl,
            size: file.size,
          });
        } catch (e) {
          console.error('Error reading image file:', e);
        }
      }
    }

    if (newAttachments.length > 0) {
      setAttachedFiles((prev) => [...prev, ...newAttachments]);
    }
  };

  const handleRemoveFile = (id: string) => {
    sound.playClick();
    setAttachedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllFiles = () => {
    sound.playClick();
    setAttachedFiles([]);
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputVal).trim();
    // Allow sending if there's text OR attached files
    if ((!textToSend && attachedFiles.length === 0) || isTyping) return;

    sound.playClick();
    const effectiveText =
      textToSend ||
      (attachedFiles.length > 0
        ? lang === 'BN'
          ? 'সংযুক্ত খতিয়ান/পর্চার ফাইলগুলো বিশ্লেষণ করে দাগ নং, মোট জমি ও সবার হিস্যা হিসাব করে দিন।'
          : 'Please analyze these attached Khatian documents and calculate the shares.'
        : '');

    const currentAttachments = [...attachedFiles];

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'USER',
      text: effectiveText,
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
      image: currentAttachments.find((a) => a.type === 'image')?.dataUrl, // backward compatibility
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setAttachedFiles([]);
    setIsTyping(true);

    try {
      const reply = await askDigitalAmin(
        effectiveText,
        messages,
        apiKey,
        lang,
        currentAttachments
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
    setAttachedFiles([]);
    setMessages([
      {
        id: 'welcome',
        sender: 'AI',
        text:
          lang === 'BN'
            ? 'কথোপকথন মুছে ফেলা হয়েছে। খতিয়ানের ছবি বা PDF দিন অথবা আপনার নতুন প্রশ্ন করুন।'
            : 'Conversation cleared. Attach a Khatian photo/PDF or ask a new question.',
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input: Supports both Images & PDF files, multiple selection (up to 4) */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,application/pdf"
        multiple
        onChange={(e) => {
          if (e.target.files) handleProcessFiles(e.target.files);
          e.target.value = '';
        }}
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
                    padding: '2px 6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <Radio size={8} /> GEMINI AI 3.5 VISION
                </span>
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {lang === 'BN'
                  ? 'খতিয়ান ও পর্চার ছবি/PDF বিশ্লেষণ (OCR), জমি পরিমাপ ও ডিজিটাল ভূমি আইন পরামর্শক'
                  : 'Khatian Vision OCR (Images & PDF), Land Survey & Mutation AI'}
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
              title={lang === 'BN' ? 'খতিয়ানের ছবি বা PDF আপলোড করুন' : 'Upload Khatian Photo or PDF'}
            >
              <ImagePlus size={14} />
              <span>{lang === 'BN' ? 'ছবি / PDF দিন' : 'Photo / PDF'}</span>
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
        {(attachedFiles.length > 0 ? attachmentSpecificPrompts : generalSuggestions).map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(s)}
            style={{
              background: attachedFiles.length > 0 ? 'rgba(46, 125, 50, 0.12)' : 'var(--surface-plate)',
              border: attachedFiles.length > 0 ? '1.5px solid #2E7D32' : '1px solid var(--border-rim)',
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

      {/* Chat Messages Window with Drag-and-Drop Dropzone Support */}
      <SkeuoCard
        showScrews
        style={{
          padding: '16px',
          minHeight: '420px',
          maxHeight: '580px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        {/* Drag and drop active overlay */}
        {isDragging && (
          <div
            style={{
              position: 'absolute',
              inset: '6px',
              background: 'rgba(236, 253, 245, 0.95)',
              backdropFilter: 'blur(4px)',
              border: '2.5px dashed #10B981',
              borderRadius: '16px',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              color: '#064E3B',
              pointerEvents: 'none',
              boxShadow: '0 8px 30px rgba(16, 185, 129, 0.25)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UploadCloud size={30} color="#059669" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 900, textAlign: 'center' }}>
              {lang === 'BN'
                ? 'খতিয়ান/পর্চার ছবি বা PDF ফাইল এখানে ছেড়ে দিন'
                : 'Drop Khatian Images or PDF Files Here'}
            </div>
            <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700 }}>
              {lang === 'BN'
                ? 'একসাথে ১-৪টি ছবি বা পিডিএফ ফাইল আপলোড করতে পারবেন'
                : 'Upload up to 4 images or PDF documents simultaneously'}
            </div>
          </div>
        )}

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
            const attachmentsList = msg.attachments || (msg.image ? [{ id: 'legacy', name: 'Document', type: 'image' as const, mimeType: 'image/jpeg', dataUrl: msg.image }] : []);

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
                  {/* If user sent multiple images or PDF attachments, render clean grid preview */}
                  {attachmentsList.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginBottom: '10px',
                      }}
                    >
                      {attachmentsList.map((att) => (
                        <div key={att.id}>
                          {att.type === 'pdf' ? (
                            <div
                              style={{
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.35)',
                                borderRadius: '10px',
                                padding: '8px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#FFFFFF',
                              }}
                            >
                              <div
                                style={{
                                  background: '#EF4444',
                                  color: '#FFFFFF',
                                  padding: '4px',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <FileText size={16} />
                              </div>
                              <div style={{ maxWidth: '160px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                  }}
                                  title={att.name}
                                >
                                  {att.name || 'Khatian.pdf'}
                                </div>
                                <div style={{ fontSize: '9.5px', opacity: 0.8 }}>PDF Document</div>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => setPreviewModalAttachment(att)}
                              style={{
                                position: 'relative',
                                cursor: 'pointer',
                                display: 'inline-block',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                border: '2px solid rgba(255, 255, 255, 0.45)',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                              }}
                            >
                              <img
                                src={att.dataUrl}
                                alt={att.name || 'Khatian Document'}
                                style={{
                                  width: attachmentsList.length > 1 ? '110px' : '220px',
                                  height: attachmentsList.length > 1 ? '85px' : '150px',
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
                                  fontSize: '9.5px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <Maximize2 size={9} /> {lang === 'BN' ? 'বড়' : 'Zoom'}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
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
                {lang === 'BN'
                  ? 'ডিজিটাল আমিন খতিয়ান ও পর্চার ফাইল বিশ্লেষণ ও হিস্যা হিসাব করছেন...'
                  : 'Digital Amin is analyzing Khatian document(s) & calculating shares...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Attached Files Multi-Preview Bar (Shows all 1-4 images & PDFs with removal controls) */}
        {attachedFiles.length > 0 && (
          <div
            style={{
              marginTop: '12px',
              padding: '10px 14px',
              background: 'rgba(46, 125, 50, 0.08)',
              borderRadius: '14px',
              border: '1.5px dashed rgba(46, 125, 50, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#1B5E20', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Paperclip size={14} />
                <span>
                  {lang === 'BN'
                    ? `সংযুক্ত নথি (${attachedFiles.length}/৪টি ফাইল)`
                    : `Attached Documents (${attachedFiles.length}/4 files)`}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearAllFiles}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#D32F2F',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {lang === 'BN' ? 'সব মুছুন' : 'Clear All'}
              </button>
            </div>

            {/* Thumbnail cards strip */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {attachedFiles.map((file) => (
                <div
                  key={file.id}
                  style={{
                    position: 'relative',
                    background: 'var(--surface-top)',
                    padding: file.type === 'pdf' ? '8px 10px' : '3px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-rim)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                >
                  {file.type === 'pdf' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          background: '#EF4444',
                          color: '#FFFFFF',
                          padding: '4px',
                          borderRadius: '6px',
                          display: 'flex',
                        }}
                      >
                        <FileText size={16} />
                      </div>
                      <div style={{ maxWidth: '110px' }}>
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: 'var(--text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={file.name}
                        >
                          {file.name}
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{ position: 'relative', cursor: 'pointer' }}
                      onClick={() => setPreviewModalAttachment(file)}
                    >
                      <img
                        src={file.dataUrl}
                        alt="Thumbnail"
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </div>
                  )}

                  {/* Individual Remove (X) Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    style={{
                      position: file.type === 'image' ? 'absolute' : 'static',
                      top: file.type === 'image' ? '-6px' : undefined,
                      right: file.type === 'image' ? '-6px' : undefined,
                      background: '#EF4444',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                    title="Remove file"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Add more files button if < 4 */}
              {attachedFiles.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    height: '52px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    border: '1.5px dashed #10B981',
                    background: 'rgba(16, 185, 129, 0.08)',
                    color: '#059669',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title={lang === 'BN' ? 'আরেকটি ছবি বা PDF যোগ করুন' : 'Add another photo or PDF'}
                >
                  <Plus size={16} />
                  <span>{lang === 'BN' ? 'আরও যোগ করুন' : 'Add More'}</span>
                </button>
              )}
            </div>
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
          {/* Attach Multiple Images / PDFs Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="skeuo-btn skeuo-btn-brass"
            style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            title={lang === 'BN' ? 'খতিয়ানের ৩-৪টি ছবি বা PDF যুক্ত করুন' : 'Attach 3-4 Khatian Photos or PDF'}
          >
            <ImagePlus size={18} />
            <span style={{ fontSize: '12px' }}>
              {lang === 'BN' ? 'ছবি / PDF' : 'Photo / PDF'}
            </span>
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={
              attachedFiles.length > 0
                ? lang === 'BN'
                  ? 'কাগজ সংক্রান্ত প্রশ্ন লিখুন (বা সরাসরি পাঠান চাপুন)...'
                  : 'Ask about these documents or click send...'
                : getTranslation('ai_placeholder', lang)
            }
            className="skeuo-input"
            style={{ flex: 1 }}
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={(!inputVal.trim() && attachedFiles.length === 0) || isTyping}
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
      {previewModalAttachment && previewModalAttachment.type === 'image' && (
        <div
          className="modal-backdrop"
          onClick={() => setPreviewModalAttachment(null)}
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
              onClick={() => setPreviewModalAttachment(null)}
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
              src={previewModalAttachment.dataUrl}
              alt={previewModalAttachment.name || 'Full Khatian Preview'}
              style={{ maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain', display: 'block' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
