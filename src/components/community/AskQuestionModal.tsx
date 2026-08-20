import React, { useState } from 'react';
import { X, HelpCircle, Sparkles } from 'lucide-react';
import { KnowledgeQuestion, TalentProfile } from '../../types';

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (q: Partial<KnowledgeQuestion>) => void;
  currentUser: TalentProfile;
}

export const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser
}) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [tags, setTags] = useState<string[]>(['DevOps', 'Cloud']);
  const [customTag, setCustomTag] = useState('');

  if (!isOpen) return null;

  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      details: details.trim(),
      tags: tags.length > 0 ? tags : ['General']
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#14171d] border border-[#21242c] rounded-3xl shadow-2xl max-w-xl w-full my-8 p-6 sm:p-8 relative overflow-hidden text-slate-300">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#21242c]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              Ask the Community (Knowledge Exchange)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ask technical or process questions to Mercedes-Benz engineering guilds.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-[#1a1d26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Question Title <span className="text-blue-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How are teams configuring mutual TLS for ROS2 microservices on AWS EKS?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-600 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Detailed Context / Steps Tried
            </label>
            <textarea
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide background, repository configuration patterns, or specific error messages..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Topic Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-[#0f1116] border border-[#21242c] mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-[#1a1d26] text-blue-300 text-xs font-mono font-semibold border border-blue-500/30 flex items-center gap-1.5"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(customTag);
                    setCustomTag('');
                  }
                }}
                placeholder="+ Add tag (Enter)"
                className="px-2 py-1 bg-transparent text-white text-xs placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#21242c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-md shadow-blue-500/25"
            >
              Publish Question to Guilds
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
