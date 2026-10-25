import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  ShieldCheck,
  Calendar,
  LogOut,
  Edit2,
  Check,
  Award,
  Layers,
  FileText,
  Clock,
  Trash2,
  ChevronRight,
  Calculator,
  Search,
} from 'lucide-react';
import { AppLanguage, CalculationHistoryItem } from '../../types';
import { auth, signOut, updateProfile, FirebaseUser } from '../../lib/firebase';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';
import { sound } from '../../lib/sound';
import { formatBDT } from '../../lib/calculations';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  currentUser: FirebaseUser | { displayName: string | null; email: string | null } | null;
  historyList: CalculationHistoryItem[];
  onDeleteHistoryItem?: (id: string) => void;
  onClearHistory?: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentUser,
  historyList,
  onDeleteHistoryItem,
  onClearHistory,
  onLogout,
}) => {
  if (!isOpen || !currentUser) return null;

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(currentUser.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const displayName = currentUser.displayName || (lang === 'BN' ? 'আমিন ব্যবহারকারী' : 'Surveyor User');
  const email = currentUser.email || 'user@example.com';
  const initial = (displayName.trim()[0] || 'U').toUpperCase();

  const handleClose = () => {
    sound.playClick();
    setIsEditingName(false);
    onClose();
  };

  const handleUpdateName = async () => {
    if (!editedName.trim()) return;
    sound.playClick();
    setIsUpdating(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: editedName.trim() });
      }
      setUpdateSuccess(true);
      setIsEditingName(false);
      setTimeout(() => setUpdateSuccess(false), 2000);
    } catch {
      // fallback
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogoutClick = async () => {
    sound.playClick();
    try {
      await signOut(auth);
    } catch {
      // fallback
    }
    onLogout();
    handleClose();
  };

  const filteredHistory = historyList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.shapeType.toLowerCase().includes(q) ||
      (item.inputsDesc && item.inputsDesc.toLowerCase().includes(q)) ||
      item.dateStr.toLowerCase().includes(q)
    );
  });

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          width: '92%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
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
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 900,
                color: '#1B5E20',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: 0,
              }}
            >
              <User size={20} />
              <span>{lang === 'BN' ? 'ইউজার প্রোফাইল ও সংরক্ষিত হিসাব' : 'User Profile & Saved History'}</span>
            </h3>

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

          {/* Profile Card Summary */}
          <div
            style={{
              background: 'var(--surface-plate)',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid var(--border-rim)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '16px',
            }}
          >
            {/* Avatar with Status Ring */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '24px',
                  fontWeight: 900,
                  boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
                  border: '2px solid #FFFFFF',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                {initial}
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '12px',
                  height: '12px',
                  background: '#4EFA8A',
                  borderRadius: '50%',
                  border: '2px solid #FFFFFF',
                }}
                title="Active Account"
              />
            </div>

            {/* User Meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {isEditingName ? (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="skeuo-input"
                    style={{ padding: '4px 8px', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={handleUpdateName}
                    disabled={isUpdating}
                    className="skeuo-btn skeuo-btn-green"
                    style={{ padding: '4px 10px' }}
                  >
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4
                    style={{
                      fontSize: '15px',
                      fontWeight: 900,
                      color: 'var(--text-main)',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {displayName}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setIsEditingName(true);
                      setEditedName(displayName);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#2E7D32',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                    title="Edit Name"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
              )}

              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  margin: '2px 0 6px 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {email}
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(46, 125, 50, 0.12)',
                  color: '#1B5E20',
                  borderRadius: '999px',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 800,
                }}
              >
                <ShieldCheck size={11} color="#2E7D32" />
                <span>{lang === 'BN' ? 'ডিজিটাল আমিন ভেরিফাইড প্রোফাইল' : 'Verified Digital Amin'}</span>
              </div>
            </div>
          </div>

          {updateSuccess && (
            <div
              style={{
                background: '#E8F5E9',
                border: '1px solid #C8E6C9',
                color: '#2E7D32',
                padding: '8px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '12px',
                textAlign: 'center',
              }}
            >
              {lang === 'BN' ? 'নাম সফলভাবে আপডেট করা হয়েছে!' : 'Name updated successfully!'}
            </div>
          )}

          {/* Quick Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                background: 'var(--surface-plate)',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-rim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1B5E20' }}>
                <FileText size={15} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>
                  {lang === 'BN' ? 'সংরক্ষিত হিসাব' : 'Saved Records'}
                </span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#1B5E20', fontFamily: 'Outfit, sans-serif' }}>
                {historyList.length}
              </div>
            </div>

            <div
              style={{
                background: 'var(--surface-plate)',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-rim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1B5E20' }}>
                <Award size={15} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>
                  {lang === 'BN' ? 'মেম্বারশিপ' : 'Membership'}
                </span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#2E7D32' }}>
                {lang === 'BN' ? 'প্রো আমিন' : 'Pro Amin'}
              </div>
            </div>
          </div>

          {/* ==================== USER'S SAVED HISTORY SECTION ==================== */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 900, fontSize: '13px', color: '#1B5E20' }}>
                <Clock size={14} />
                <span>{lang === 'BN' ? 'প্রোফাইলে সংরক্ষিত জমির হিসাবসমূহ' : 'Saved Land Calculations'}</span>
              </div>

              {historyList.length > 0 && onClearHistory && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(lang === 'BN' ? 'আপনি কি সব সংরক্ষিত হিসেব মুছে ফেলতে চান?' : 'Clear all saved records?')) {
                      onClearHistory();
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#D32F2F',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '2px 6px',
                  }}
                >
                  {lang === 'BN' ? 'সব মুছুন' : 'Clear All'}
                </button>
              )}
            </div>

            {/* History Records List */}
            {historyList.length === 0 ? (
              <div
                style={{
                  background: 'var(--surface-plate)',
                  padding: '24px 16px',
                  borderRadius: '14px',
                  border: '1px dashed var(--border-rim)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <Calculator size={28} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                <p style={{ fontSize: '12px', margin: 0 }}>
                  {lang === 'BN'
                    ? 'আপনার প্রোফাইলে এখনো কোনো হিসাব সংরক্ষিত নেই।'
                    : 'No saved calculations in your profile yet.'}
                </p>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>
                  {lang === 'BN'
                    ? 'ক্যালকুলেটর বা খতিয়ান ট্যাব থেকে হিসাব সংরক্ষণ করুন।'
                    : 'Save records from Calculator or Khatian tab.'}
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  paddingRight: '4px',
                }}
              >
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--surface-plate)',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-rim)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span
                          style={{
                            background: '#2E7D32',
                            color: '#FFFFFF',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {item.shapeType}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {item.dateStr}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '12px', fontWeight: 800 }}>
                        <span style={{ color: '#1B5E20' }}>
                          {item.sotangso.toFixed(3)} {lang === 'BN' ? 'শতাংশ' : 'Sotangso'}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span style={{ color: 'var(--text-main)' }}>
                          {item.katha.toFixed(3)} {lang === 'BN' ? 'কাঠা' : 'Katha'}
                        </span>
                        {item.totalPrice ? (
                          <>
                            <span style={{ color: 'var(--text-muted)' }}>•</span>
                            <span style={{ color: '#2E7D32' }}>
                              {formatBDT(item.totalPrice)}
                            </span>
                          </>
                        ) : null}
                      </div>

                      {item.inputsDesc && (
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.inputsDesc}
                        </div>
                      )}
                    </div>

                    {onDeleteHistoryItem && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          onDeleteHistoryItem(item.id);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Log Out Button */}
          <button
            type="button"
            onClick={handleLogoutClick}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '14px',
              border: '1.5px solid #D32F2F',
              background: 'rgba(211, 47, 47, 0.08)',
              color: '#D32F2F',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <LogOut size={15} />
            <span>{lang === 'BN' ? 'লগআউট করুন' : 'Log Out'}</span>
          </button>
        </SkeuoCard>
      </div>
    </div>
  );
};
