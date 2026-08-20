import React, { useState } from 'react';
import { X, Send, User, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetTitle: string;
  recipientName: string;
  recipientRole: string;
  recipientInitials: string;
  contextType: 'work' | 'market' | 'community';
  onSend: (message: string) => void;
  currentUser: UserProfile;
}

export const ContactDialog: React.FC<ContactDialogProps> = ({
  isOpen,
  onClose,
  targetTitle,
  recipientName,
  recipientRole,
  recipientInitials,
  contextType,
  onSend,
  currentUser
}) => {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const defaultTemplates = {
    work: `Hi ${recipientName}, I saw your request regarding "${targetTitle}". I have bandwidth and relevant experience to help. Let's sync on Teams or meet at the campus!`,
    market: `Hi ${recipientName}, I'm interested in your listing "${targetTitle}". Is it still available? I would like to arrange a look / test drive this week.`,
    community: `Hi ${recipientName}, reaching out regarding your community post "${targetTitle}". I'd love to connect on this!`
  };

  const handleQuickTemplate = (text: string) => {
    setMessage(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMessage('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#14171d] border border-[#21242c] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col relative text-slate-300">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#21242c] bg-[#0f1116]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
              {contextType === 'work' ? 'WORK' : contextType === 'market' ? 'SHOP' : 'COM'}
            </div>
            <div>
              <h3 className="font-semibold text-white text-base leading-none">
                {contextType === 'work' ? 'Offer Assistance' : contextType === 'market' ? 'Contact Seller' : 'Reach Out'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Direct internal communication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-[#1a1d26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Message Sent!</h4>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">
              {recipientName} has been notified via internal mail & Workshop notifications.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            {/* Recipient summary card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f1116] border border-[#21242c]">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-bold text-sm flex items-center justify-center shrink-0">
                {recipientInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm truncate">{recipientName}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1d26] text-slate-400 border border-[#262a33]">
                    {recipientRole}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  Re: <span className="text-slate-300 font-medium">{targetTitle}</span>
                </p>
              </div>
            </div>

            {/* Quick Template Pill */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Suggested note:
              </span>
              <button
                type="button"
                onClick={() => handleQuickTemplate(defaultTemplates[contextType])}
                className="text-xs px-2.5 py-1 rounded-md bg-[#1a1d26] border border-[#262a33] text-indigo-300 hover:bg-[#21242c] transition-colors truncate max-w-xs text-left"
              >
                Use quick template
              </button>
            </div>

            {/* Message Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Message
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here... Include your availability or preferred contact method."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
                required
              />
            </div>

            {/* Sending identity footer */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Sending as <strong className="text-slate-300">{currentUser.name}</strong> ({currentUser.role})</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{currentUser.campus}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#21242c]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-[#1a1d26] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!message.trim()}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
