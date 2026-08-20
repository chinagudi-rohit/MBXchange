import React from 'react';
import { 
  ArrowLeft, 
  Bookmark, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Check, 
  Tag,
  BadgeAlert,
  Car,
  ShoppingBag
} from 'lucide-react';
import { MarketListing, UserProfile } from '../../types';

interface MarketDetailProps {
  listing: MarketListing;
  onBack: () => void;
  onToggleBookmark: (id: number) => void;
  onContactSeller: (listing: MarketListing) => void;
  currentUser: UserProfile;
}

export const MarketDetail: React.FC<MarketDetailProps> = ({
  listing,
  onBack,
  onToggleBookmark,
  onContactSeller,
  currentUser
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top back navigation bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to marketplace</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleBookmark(listing.id)}
            className={`p-2 rounded-xl border transition-colors ${
              listing.bookmarked
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                : 'bg-[#14171d] border-[#21242c] text-slate-500 hover:text-white'
            }`}
            title="Save item"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onContactSeller(listing)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              listing.contacted
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{listing.contacted ? 'Inquiry Sent ✓' : 'Contact Seller'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Item Info and Seller Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8 Cols: Item Overview & Specs */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-[#14171d] border border-[#21242c] rounded-2xl shadow-xl p-6 sm:p-8 relative overflow-hidden">
            
            {/* Category & Status tags */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2.5 py-0.5 rounded-md bg-[#0f1116] border border-[#21242c]">
                {listing.category}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#0f1116] text-indigo-400 border border-indigo-500/20">
                {listing.condition}
              </span>
              <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {listing.time}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-4">
              {listing.title}
            </h1>

            {/* Price Banner */}
            <div className="p-4 rounded-xl bg-[#0f1116] border border-[#21242c] flex items-center justify-between mb-6">
              <div>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">Asking Price</span>
                <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                  {listing.currency}{listing.price.toLocaleString()}
                  <span className="text-sm font-sans font-normal text-slate-400 ml-2">EUR</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Location</span>
                <span className="text-sm font-semibold text-slate-300 flex items-center gap-1 justify-end">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  {listing.location}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 pt-4 border-t border-[#21242c]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Item Description
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Detailed Specs Grid if present */}
            {listing.specs && Object.keys(listing.specs).length > 0 && (
              <div className="pt-6 mt-6 border-t border-[#21242c] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Specifications & Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(listing.specs).map(([key, val]) => (
                    <div
                      key={key}
                      className="p-3 rounded-xl bg-[#0f1116] border border-[#21242c] flex items-center justify-between"
                    >
                      <span className="text-xs text-slate-500 font-medium">{key}</span>
                      <span className="text-xs font-bold text-white">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Safety & Peer Handover Note */}
          <div className="bg-[#14171d] border border-[#21242c] rounded-2xl p-5 shadow-xl flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-white">Internal Campus Handover:</strong> All transactions take place between verified colleagues. Test drives and physical handovers can be arranged at the campus reception, engineering parking, or local hub lockers.
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Seller Profile & Contact Box */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Seller Card */}
          <div className="bg-[#14171d] border border-[#21242c] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Seller Profile
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-bold text-base flex items-center justify-center shrink-0">
                {listing.initials}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-base truncate">{listing.seller}</h4>
                <p className="text-xs text-indigo-400 font-medium truncate">{listing.sellerRole}</p>
                <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-600" />
                  {listing.location}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0f1116] border border-[#21242c] text-xs text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Verified Employee:</span>
                <span className="font-bold text-emerald-400">Yes ✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Listed:</span>
                <span className="text-slate-300">{listing.time}</span>
              </div>
            </div>

            <button
              onClick={() => onContactSeller(listing)}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                listing.contacted
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{listing.contacted ? 'Inquiry Sent ✓' : 'Send Message to Seller'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
