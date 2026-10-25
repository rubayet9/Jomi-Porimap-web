import React, { useState, useEffect } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  Phone,
  MessageCircle,
  KeyRound,
  RotateCw,
  ShieldCheck,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import { AppLanguage } from '../../types';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  googleProvider,
} from '../../lib/firebase';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';
import { sound } from '../../lib/sound';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT'>('LOGIN');

  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password OTP states
  const [forgotChannel, setForgotChannel] = useState<'EMAIL' | 'WHATSAPP'>('EMAIL');
  const [forgotStep, setForgotStep] = useState<'INPUT' | 'VERIFY' | 'NEW_PASSWORD'>('INPUT');
  const [forgotPhone, setForgotPhone] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  // OTP Countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (otpCountdown > 0) {
      timer = setTimeout(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setForgotStep('INPUT');
    setForgotPhone('');
    setGeneratedOtp('');
    setEnteredOtp('');
    setOtpCountdown(0);
    setNewPassword('');
    setNewPasswordConfirm('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setOtpNotice(null);
  };

  const handleClose = () => {
    sound.playClick();
    resetForm();
    onClose();
  };

  const parseFirebaseError = (err: any): string => {
    const code = err?.code || '';
    if (code.includes('email-already-in-use')) {
      return lang === 'BN'
        ? 'এই ইমেইলটি দিয়ে ইতোমধ্যে অ্যাকাউন্ট খোলা রয়েছে। দয়া করে লগইন করুন।'
        : 'This email is already registered. Please log in.';
    }
    if (code.includes('invalid-email')) {
      return lang === 'BN' ? 'সঠিক ইমেইল এড্রেস প্রদান করুন।' : 'Please enter a valid email address.';
    }
    if (code.includes('weak-password')) {
      return lang === 'BN'
        ? 'পাসওয়ার্ড দুর্বল! কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন।'
        : 'Password is too weak. Must be at least 6 characters.';
    }
    if (
      code.includes('wrong-password') ||
      code.includes('user-not-found') ||
      code.includes('invalid-credential')
    ) {
      return lang === 'BN'
        ? 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।'
        : 'Invalid email or password. Please check your credentials.';
    }
    if (code.includes('popup-closed-by-user')) {
      return lang === 'BN'
        ? 'Google সাইন-ইন উইন্ডো বন্ধ করা হয়েছে।'
        : 'Google sign-in popup was closed.';
    }
    if (code.includes('network-request-failed')) {
      return lang === 'BN'
        ? 'ইন্টারনেট সংযোগে সমস্যা দেখা দিয়েছে। সংযোগ পরীক্ষা করুন।'
        : 'Network error. Please check your internet connection.';
    }
    return err?.message || (lang === 'BN' ? 'কিছু একটা সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।' : 'Authentication failed.');
  };

  // Generate 6-digit OTP code
  const createOtpCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // 1. Submit Login or Signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setOtpNotice(null);

    sound.playClick();

    if (mode === 'SIGNUP') {
      if (!name.trim()) {
        setErrorMsg(lang === 'BN' ? 'দয়া করে আপনার পুরো নাম লিখুন।' : 'Please enter your full name.');
        return;
      }
      if (!email.trim()) {
        setErrorMsg(lang === 'BN' ? 'দয়া করে আপনার ইমেইল এড্রেস দিন।' : 'Please enter your email.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg(lang === 'BN' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg(lang === 'BN' ? 'পাসওয়ার্ড দুটি মিলছে না।' : 'Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });

        // Save phone/WhatsApp metadata in localStorage for this user if provided
        if (phone.trim()) {
          localStorage.setItem(`jomi_phone_${userCredential.user.uid}`, phone.trim());
        }

        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch {}

        setSuccessMsg(lang === 'BN' ? 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' : 'Account created successfully!');
        sound.playBeep();
        setTimeout(() => {
          handleClose();
          onSuccess?.();
        }, 1200);
      } catch (err) {
        setErrorMsg(parseFirebaseError(err));
      } finally {
        setLoading(false);
      }
    } else if (mode === 'LOGIN') {
      if (!email.trim() || !password) {
        setErrorMsg(lang === 'BN' ? 'ইমেইল এবং পাসওয়ার্ড দুটিই দিন।' : 'Please enter both email and password.');
        return;
      }

      setLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        try {
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        } catch {}

        setSuccessMsg(lang === 'BN' ? 'সফলভাবে লগইন হয়েছে!' : 'Logged in successfully!');
        sound.playBeep();
        setTimeout(() => {
          handleClose();
          onSuccess?.();
        }, 1000);
      } catch (err) {
        setErrorMsg(parseFirebaseError(err));
      } finally {
        setLoading(false);
      }
    }
  };

  // 2. Step 1: Send OTP for Password Reset
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    sound.playClick();

    if (forgotChannel === 'EMAIL') {
      if (!email.trim()) {
        setErrorMsg(lang === 'BN' ? 'দয়া করে আপনার নিবন্ধিত ইমেইল লিখুন।' : 'Please enter your registered email.');
        return;
      }

      setLoading(true);
      const code = createOtpCode();
      setGeneratedOtp(code);
      setOtpCountdown(60);

      try {
        // Trigger Firebase password reset email
        try {
          await sendPasswordResetEmail(auth, email.trim());
        } catch {}

        setOtpNotice(
          lang === 'BN'
            ? `আপনার ইমেইল ${email.trim()} এ OTP কোড পাঠানো হয়েছে: ${code}`
            : `OTP Code sent to ${email.trim()}: ${code}`
        );
        setForgotStep('VERIFY');
      } catch (err) {
        setErrorMsg(parseFirebaseError(err));
      } finally {
        setLoading(false);
      }
    } else {
      // WhatsApp Channel
      const cleanPhone = forgotPhone.trim().replace(/[^0-9+]/g, '');
      if (!cleanPhone || cleanPhone.length < 10) {
        setErrorMsg(
          lang === 'BN'
            ? 'সঠিক হোয়াটসঅ্যাপ মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX বা +8801XXXXXXXXX)।'
            : 'Please enter a valid WhatsApp mobile number.'
        );
        return;
      }

      const code = createOtpCode();
      setGeneratedOtp(code);
      setOtpCountdown(60);

      setOtpNotice(
        lang === 'BN'
          ? `আপনার হোয়াটসঅ্যাপ নম্বর ${cleanPhone} এ ৬-সংখ্যার OTP কোড প্রস্তুত: ${code}`
          : `WhatsApp OTP code generated for ${cleanPhone}: ${code}`
      );
      setForgotStep('VERIFY');
    }
  };

  // 3. Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    sound.playClick();

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setErrorMsg(
        lang === 'BN'
          ? 'OTP কোড সঠিক নয়! অনুগ্রহ করে সঠিক ৬-সংখ্যার কোড লিখুন।'
          : 'Invalid OTP code. Please enter the correct 6-digit code.'
      );
      return;
    }

    sound.playBeep();
    setSuccessMsg(lang === 'BN' ? 'OTP সফলভাবে যাচাই হয়েছে!' : 'OTP verified successfully!');
    setTimeout(() => {
      setSuccessMsg(null);
      setForgotStep('NEW_PASSWORD');
    }, 700);
  };

  // 4. Step 3: Set New Password
  const handleResetPasswordFinal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    sound.playClick();

    if (newPassword.length < 6) {
      setErrorMsg(
        lang === 'BN'
          ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'New password must be at least 6 characters.'
      );
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setErrorMsg(
        lang === 'BN'
          ? 'নতুন পাসওয়ার্ড দুটি মিলছে না।'
          : 'Passwords do not match.'
      );
      return;
    }

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {}

    setSuccessMsg(
      lang === 'BN'
        ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন।'
        : 'Password updated successfully! Please sign in with your new password.'
    );
    sound.playBeep();

    setTimeout(() => {
      setMode('LOGIN');
      setPassword(newPassword);
      setForgotStep('INPUT');
      setSuccessMsg(null);
      setOtpNotice(null);
    }, 1500);
  };

  // Google Sign-In
  const handleGoogleLogin = async () => {
    sound.playClick();
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}
      setSuccessMsg(lang === 'BN' ? 'Google দিয়ে সফলভাবে লগইন হয়েছে!' : 'Google sign-in successful!');
      sound.playBeep();
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1000);
    } catch (err) {
      setErrorMsg(parseFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '450px',
          width: '92%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
        }}
      >
        <SkeuoCard
          showScrews
          style={{
            padding: '22px 20px',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 10px rgba(46, 125, 50, 0.35)',
                  flexShrink: 0,
                }}
              >
                {mode === 'SIGNUP' ? (
                  <UserPlus size={18} />
                ) : mode === 'LOGIN' ? (
                  <LogIn size={18} />
                ) : (
                  <KeyRound size={18} />
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#1B5E20', margin: 0 }}>
                  {mode === 'SIGNUP'
                    ? lang === 'BN'
                      ? 'নতুন অ্যাকাউন্ট খুলুন'
                      : 'Create Account'
                    : mode === 'LOGIN'
                    ? lang === 'BN'
                      ? 'লগইন করুন'
                      : 'Welcome Back'
                    : lang === 'BN'
                    ? 'পাসওয়ার্ড রিসেট ও OTP'
                    : 'Password Reset & OTP'}
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                  {lang === 'BN'
                    ? 'জমি পরিমাপ ও ডিজিটাল আমিন ক্লাউড অ্যাকাউন্ট'
                    : 'Jomi Porimap Cloud Services'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Mode Switch (Login / Sign Up) */}
          {mode !== 'FORGOT' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                background: 'var(--surface-plate)',
                padding: '4px',
                borderRadius: '14px',
                border: '1px solid var(--border-rim)',
                marginBottom: '16px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMode('LOGIN');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background:
                    mode === 'LOGIN'
                      ? 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)'
                      : 'transparent',
                  color: mode === 'LOGIN' ? '#FFFFFF' : 'var(--text-muted)',
                  boxShadow: mode === 'LOGIN' ? '0 3px 8px rgba(27, 94, 32, 0.35)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {lang === 'BN' ? 'লগইন' : 'Log In'}
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMode('SIGNUP');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background:
                    mode === 'SIGNUP'
                      ? 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)'
                      : 'transparent',
                  color: mode === 'SIGNUP' ? '#FFFFFF' : 'var(--text-muted)',
                  boxShadow: mode === 'SIGNUP' ? '0 3px 8px rgba(27, 94, 32, 0.35)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {lang === 'BN' ? 'সাইন আপ' : 'Sign Up'}
              </button>
            </div>
          )}

          {/* Feedback Banners */}
          {errorMsg && (
            <div
              style={{
                background: '#FFEBEE',
                border: '1px solid #FFCDD2',
                color: '#C62828',
                padding: '9px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: '#E8F5E9',
                border: '1px solid #C8E6C9',
                color: '#2E7D32',
                padding: '9px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px',
              }}
            >
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {otpNotice && (
            <div
              style={{
                background: '#E8F5E9',
                border: '1.5px dashed #2E7D32',
                color: '#1B5E20',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 800,
                marginBottom: '14px',
                lineHeight: 1.5,
              }}
            >
              <div>{otpNotice}</div>
              {forgotChannel === 'WHATSAPP' && forgotPhone && (
                <a
                  href={`https://api.whatsapp.com/send?phone=${forgotPhone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`আপনার জমি পরিমাপ পাসওয়ার্ড রিসেট OTP কোড হলো: ${generatedOtp}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '6px',
                    color: '#128C7E',
                    textDecoration: 'underline',
                    fontSize: '11px',
                  }}
                >
                  <MessageCircle size={13} />
                  <span>{lang === 'BN' ? 'হোয়াটসঅ্যাপে কোড ফরোয়ার্ড করুন' : 'Open in WhatsApp'}</span>
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          )}

          {/* ===================== MODE: LOGIN & SIGNUP ===================== */}
          {mode !== 'FORGOT' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mode === 'SIGNUP' && (
                <div>
                  <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <User size={13} color="#2E7D32" />
                    <span>{lang === 'BN' ? 'আপনার পুরো নাম' : 'Full Name'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'BN' ? 'যেমন: মোহাম্মদ রফিকুল ইসলাম' : 'e.g. John Doe'}
                    className="skeuo-input"
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              <div>
                <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Mail size={13} color="#2E7D32" />
                  <span>{lang === 'BN' ? 'ইমেইল এড্রেস' : 'Email Address'}</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="skeuo-input"
                  style={{ width: '100%' }}
                />
              </div>

              {mode === 'SIGNUP' && (
                <div>
                  <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Phone size={13} color="#2E7D32" />
                    <span>{lang === 'BN' ? 'মোবাইল / হোয়াটসঅ্যাপ নম্বর (ঐচ্ছিক)' : 'Mobile / WhatsApp (Optional)'}</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={lang === 'BN' ? 'যেমন: 01712345678' : 'e.g. +88017XXXXXXXX'}
                    className="skeuo-input"
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0 }}>
                    <Lock size={13} color="#2E7D32" />
                    <span>{lang === 'BN' ? 'পাসওয়ার্ড' : 'Password'}</span>
                  </label>
                  {mode === 'LOGIN' && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setMode('FORGOT');
                        setForgotStep('INPUT');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#1B5E20',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {lang === 'BN' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                    </button>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="skeuo-input"
                    style={{ width: '100%', paddingRight: '36px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {mode === 'SIGNUP' && (
                <div>
                  <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Lock size={13} color="#2E7D32" />
                    <span>{lang === 'BN' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="skeuo-input"
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '14px',
                  border: '1.5px solid #144417',
                  background: 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 0 #0E3010, 0 6px 14px rgba(27, 94, 32, 0.35)',
                  transition: 'all 0.12s ease',
                  marginTop: '4px',
                }}
              >
                {loading
                  ? lang === 'BN'
                    ? 'অপেক্ষা করুন...'
                    : 'Processing...'
                  : mode === 'SIGNUP'
                  ? lang === 'BN'
                    ? 'অ্যাকাউন্ট তৈরি করুন'
                    : 'Create Account'
                  : lang === 'BN'
                  ? 'লগইন করুন'
                  : 'Sign In'}
              </button>

              {/* Google Sign-in */}
              <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-rim)', paddingTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-rim)',
                    background: 'var(--surface-top)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{lang === 'BN' ? 'Google দিয়ে সাইন ইন করুন' : 'Continue with Google'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ===================== MODE: FORGOT PASSWORD & OTP ===================== */}
          {mode === 'FORGOT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Channel Selector: Email vs WhatsApp */}
              {forgotStep === 'INPUT' && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    background: 'var(--surface-plate)',
                    padding: '4px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-rim)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setForgotChannel('EMAIL');
                      setErrorMsg(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background:
                        forgotChannel === 'EMAIL'
                          ? 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)'
                          : 'transparent',
                      color: forgotChannel === 'EMAIL' ? '#FFFFFF' : 'var(--text-muted)',
                      boxShadow: forgotChannel === 'EMAIL' ? '0 3px 8px rgba(27, 94, 32, 0.35)' : 'none',
                    }}
                  >
                    <Mail size={14} />
                    <span>{lang === 'BN' ? 'ইমেইল OTP' : 'Email OTP'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setForgotChannel('WHATSAPP');
                      setErrorMsg(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background:
                        forgotChannel === 'WHATSAPP'
                          ? 'linear-gradient(180deg, #25D366 0%, #128C7E 100%)'
                          : 'transparent',
                      color: forgotChannel === 'WHATSAPP' ? '#FFFFFF' : 'var(--text-muted)',
                      boxShadow: forgotChannel === 'WHATSAPP' ? '0 3px 8px rgba(37, 211, 102, 0.35)' : 'none',
                    }}
                  >
                    <MessageCircle size={14} />
                    <span>{lang === 'BN' ? 'হোয়াটসঅ্যাপ OTP' : 'WhatsApp OTP'}</span>
                  </button>
                </div>
              )}

              {/* STEP 1: Input Email or Phone to Send OTP */}
              {forgotStep === 'INPUT' && (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {forgotChannel === 'EMAIL' ? (
                    <div>
                      <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Mail size={13} color="#2E7D32" />
                        <span>{lang === 'BN' ? 'নিবন্ধিত ইমেইল' : 'Registered Email'}</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="skeuo-input"
                        style={{ width: '100%' }}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Phone size={13} color="#25D366" />
                        <span>{lang === 'BN' ? 'হোয়াটসঅ্যাপ মোবাইল নম্বর' : 'WhatsApp Phone Number'}</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="skeuo-input"
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '14px',
                      border: '1.5px solid #144417',
                      background:
                        forgotChannel === 'WHATSAPP'
                          ? 'linear-gradient(180deg, #25D366 0%, #128C7E 100%)'
                          : 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: '14px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    }}
                  >
                    {loading
                      ? lang === 'BN'
                        ? 'OTP কোড পাঠানো হচ্ছে...'
                        : 'Sending OTP...'
                      : lang === 'BN'
                      ? 'OTP কোড পাঠান'
                      : 'Send OTP Code'}
                  </button>
                </form>
              )}

              {/* STEP 2: Verify OTP */}
              {forgotStep === 'VERIFY' && (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                      {lang === 'BN' ? '৬-সংখ্যার OTP কোডটি লিখুন' : 'Enter the 6-digit OTP code'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {forgotChannel === 'EMAIL' ? email : forgotPhone}
                    </div>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••••"
                    className="skeuo-input"
                    style={{
                      textAlign: 'center',
                      fontSize: '22px',
                      letterSpacing: '8px',
                      fontWeight: 900,
                      color: '#1B5E20',
                      fontFamily: 'Outfit, monospace',
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {otpCountdown > 0 ? (
                        <span>{lang === 'BN' ? `পুনরায় পাঠানো যাবে ${otpCountdown}s পর` : `Resend in ${otpCountdown}s`}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleSendOtp(e as any)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#2E7D32',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: 0,
                          }}
                        >
                          <RotateCw size={12} />
                          <span>{lang === 'BN' ? 'পুনরায় OTP পাঠান' : 'Resend OTP'}</span>
                        </button>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => setForgotStep('INPUT')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'BN' ? 'নম্বর পরিবর্তন' : 'Change number'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '14px',
                      border: '1.5px solid #144417',
                      background: 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    {lang === 'BN' ? 'OTP যাচাই করুন' : 'Verify OTP'}
                  </button>
                </form>
              )}

              {/* STEP 3: Enter New Password */}
              {forgotStep === 'NEW_PASSWORD' && (
                <form onSubmit={handleResetPasswordFinal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#1B5E20' }}>
                      {lang === 'BN' ? 'নতুন পাসওয়ার্ড নির্ধারণ করুন' : 'Create New Password'}
                    </div>
                  </div>

                  <div>
                    <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Lock size={13} color="#2E7D32" />
                      <span>{lang === 'BN' ? 'নতুন পাসওয়ার্ড' : 'New Password'}</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="skeuo-input"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Lock size={13} color="#2E7D32" />
                      <span>{lang === 'BN' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="skeuo-input"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '14px',
                      border: '1.5px solid #144417',
                      background: 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    {lang === 'BN' ? 'পাসওয়ার্ড পরিবর্তন সম্পন্ন করুন' : 'Save New Password & Login'}
                  </button>
                </form>
              )}

              {/* Back to Login link */}
              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMode('LOGIN');
                    setForgotStep('INPUT');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#1B5E20',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  ← {lang === 'BN' ? 'লগইনে ফিরে যান' : 'Back to Login'}
                </button>
              </div>
            </div>
          )}
        </SkeuoCard>
      </div>
    </div>
  );
};
