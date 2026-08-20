import React, { useState } from 'react';
import { X, Plus, Sparkles, ShoppingBag, Trash2, MapPin } from 'lucide-react';
import { MarketListing, MarketCategory, ItemCondition, UserProfile } from '../../types';

interface MarketNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listing: Partial<MarketListing>) => void;
  currentUser: UserProfile;
}

export const MarketNewModal: React.FC<MarketNewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MarketCategory>('Vehicles');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('Used - Excellent');
  const [location, setLocation] = useState(currentUser.campus || 'Sindelfingen campus');
  const [description, setDescription] = useState('');

  // Dynamic specifications list
  const [specs, setSpecs] = useState<Array<{ key: string; val: string }>>([
    { key: 'Brand / Model', val: '' },
    { key: 'Pickup details', val: 'Campus reception or parking' }
  ]);

  if (!isOpen) return null;

  const handleAddSpec = () => {
    setSpecs([...specs, { key: '', val: '' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (idx: number, field: 'key' | 'val', value: string) => {
    const next = [...specs];
    next[idx][field] = value;
    setSpecs(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    const specsObj: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.val.trim()) {
        specsObj[s.key.trim()] = s.val.trim();
      }
    });

    onSubmit({
      title: title.trim(),
      category,
      price: Math.max(0, parseFloat(price) || 0),
      currency: '€',
      condition,
      location: location.trim() || 'Sindelfingen campus',
      description: description.trim() || 'No detailed description provided.',
      specs: Object.keys(specsObj).length > 0 ? specsObj : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#14171d] border border-[#21242c] rounded-2xl shadow-2xl max-w-2xl w-full my-8 p-6 sm:p-8 relative overflow-hidden text-slate-300">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#21242c]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              Sell an Item on Marketplace
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Listed directly to colleagues across the engineering and business campus.
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
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Item Title <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2019 Bike — Trek FX 3 Hybrid Disc"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-600 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MarketCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Vehicles" className="bg-[#14171d] text-white">Vehicles & Commute</option>
                <option value="Electronics" className="bg-[#14171d] text-white">Electronics & Tech</option>
                <option value="Furniture & Home" className="bg-[#14171d] text-white">Furniture & Home Office</option>
                <option value="Sports & Outdoors" className="bg-[#14171d] text-white">Sports & Outdoors</option>
                <option value="Books & Tools" className="bg-[#14171d] text-white">Books & Hardware Tools</option>
                <option value="Other" className="bg-[#14171d] text-white">Other Goods</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Price (€ EUR) <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500">€</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-600 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Condition & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Item Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Brand New" className="bg-[#14171d] text-white">Brand New (Unopened / In Box)</option>
                <option value="Like New" className="bg-[#14171d] text-white">Like New (Barely used, pristine)</option>
                <option value="Used - Excellent" className="bg-[#14171d] text-white">Used - Excellent (Well cared for)</option>
                <option value="Used" className="bg-[#14171d] text-white">Used (Normal cosmetic wear)</option>
                <option value="Fair" className="bg-[#14171d] text-white">Fair (Functional with marks)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Pickup / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sindelfingen campus / Bldg 30"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-600 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Specifications Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Key Specifications / Attributes
              </label>
              <button
                type="button"
                onClick={handleAddSpec}
                className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Row
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {specs.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={s.key}
                    onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                    placeholder="e.g. Mileage / Size / Model"
                    className="w-1/3 px-3 py-1.5 rounded-lg border border-[#21242c] bg-[#0f1116] text-white text-xs"
                  />
                  <input
                    type="text"
                    value={s.val}
                    onChange={(e) => handleSpecChange(idx, 'val', e.target.value)}
                    placeholder="e.g. 68,400 km / Size L"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#21242c] bg-[#0f1116] text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Description & Details
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the condition, reason for sale, warranty/service history, and pickup details..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#21242c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#1a1d26] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              Publish Marketplace Listing
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
