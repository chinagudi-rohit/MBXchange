import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Tag, 
  Bookmark, 
  MapPin, 
  ChevronRight, 
  Sparkles,
  ArrowUpDown,
  Car,
  Laptop,
  Armchair,
  Bike,
  Wrench,
  Package,
  Check
} from 'lucide-react';
import { MarketListing, MarketCategory, UserProfile } from '../../types';

interface MarketGridProps {
  listings: MarketListing[];
  onOpenListing: (id: number) => void;
  onOpenNewListing: () => void;
  onToggleBookmark: (id: number) => void;
  onContactSeller: (listing: MarketListing) => void;
  currentUser: UserProfile;
}

export const MarketGrid: React.FC<MarketGridProps> = ({
  listings = [],
  onOpenListing,
  onOpenNewListing,
  onToggleBookmark,
  onContactSeller,
  currentUser
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');

  const safeListings = Array.isArray(listings) ? listings : [];

  const categories: Array<{ id: string; label: string; icon: React.ReactNode }> = [
    { id: 'All', label: 'All Items', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'Vehicles', label: 'Vehicles & Commute', icon: <Car className="w-3.5 h-3.5" /> },
    { id: 'Electronics', label: 'Electronics & Tech', icon: <Laptop className="w-3.5 h-3.5" /> },
    { id: 'Furniture & Home', label: 'Furniture & Home', icon: <Armchair className="w-3.5 h-3.5" /> },
    { id: 'Sports & Outdoors', label: 'Sports & Outdoors', icon: <Bike className="w-3.5 h-3.5" /> },
    { id: 'Books & Tools', label: 'Books & Tools', icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'Other', label: 'Other Goods', icon: <Tag className="w-3.5 h-3.5" /> }
  ];

  const filteredListings = useMemo(() => {
    return safeListings
      .filter((item) => {
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchLoc = item.location.toLowerCase().includes(q);
          const matchSeller = item.seller.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchLoc && !matchSeller) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        return b.timestamp - a.timestamp;
      });
  }, [safeListings, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Categories & Create Button */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* Post item CTA box */}
          <div className="bg-[#14171d] border border-[#21242c] rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
              Campus Marketplace
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Sell or trade vehicles, electronics, furniture, sports gear, and tech directly with colleagues across corporate locations.
            </p>

            <button
              onClick={onOpenNewListing}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Sell an Item</span>
            </button>
          </div>

          {/* Categories List */}
          <div className="bg-[#14171d] border border-[#21242c] rounded-2xl p-5 shadow-xl">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
              Categories
            </h4>
            <div className="space-y-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = cat.id === 'All'
                  ? listings.length
                  : listings.filter(l => l.category === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1a1d26] text-indigo-400 font-semibold border border-indigo-500/30'
                        : 'text-slate-400 hover:bg-[#0f1116] hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={isSelected ? 'text-indigo-400' : 'text-slate-500'}>
                        {cat.icon}
                      </span>
                      <span className="truncate">{cat.label}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-[#0f1116] text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </aside>

        {/* Right Main Grid */}
        <main className="lg:col-span-9 space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-[#14171d] border border-[#21242c] rounded-2xl p-3 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search marketplace items, cars, electronics, bikes..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="newest" className="bg-[#14171d] text-white">Newest Listed</option>
                <option value="price_low" className="bg-[#14171d] text-white">Price: Low to High</option>
                <option value="price_high" className="bg-[#14171d] text-white">Price: High to Low</option>
              </select>
            </div>

          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.length === 0 ? (
              <div className="col-span-full bg-[#14171d] border border-[#21242c] rounded-2xl p-12 text-center shadow-xl">
                <div className="w-12 h-12 rounded-full bg-[#0f1116] border border-[#21242c] flex items-center justify-center mx-auto mb-3 text-slate-500">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">No items found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  There are no listings in this category matching your search.
                </p>
                <button
                  onClick={onOpenNewListing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>List New Item</span>
                </button>
              </div>
            ) : (
              filteredListings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onOpenListing(item.id)}
                  className="bg-[#14171d] border border-[#21242c] hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between group cursor-pointer relative"
                >
                  <div>
                    {/* Top: Category & Bookmark button */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-[#0f1116] border border-[#21242c]">
                        {item.category}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onToggleBookmark(item.id); }}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          item.bookmarked
                            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                            : 'bg-[#0f1116] border-[#21242c] text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price Callout */}
                    <div className="mb-2">
                      <span className="text-xl font-black text-white font-mono tracking-tight">
                        {item.currency}{item.price.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1.5">EUR</span>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2 leading-snug">
                      {item.title}
                    </h4>

                    {/* Condition Tag */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#0f1116] text-indigo-400 border border-indigo-500/20">
                        {item.condition}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-600 shrink-0" />
                        {item.location}
                      </span>
                    </div>

                    {/* Snippet Specs if available */}
                    {item.specs && Object.keys(item.specs).length > 0 && (
                      <div className="p-2 rounded-xl bg-[#0f1116] border border-[#21242c] space-y-1 mb-3 text-[11px]">
                        {Object.entries(item.specs).slice(0, 2).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between text-slate-400">
                            <span className="text-slate-500 truncate">{key}:</span>
                            <span className="font-semibold text-slate-300 truncate ml-1">{val}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer: Seller info & Quick message button */}
                  <div className="pt-3 border-t border-[#21242c] flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {item.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-300 leading-none">{item.seller}</span>
                        <span className="text-[10px] text-slate-500">{item.time}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onContactSeller(item); }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                        item.contacted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-[#1a1d26] hover:bg-indigo-600 text-slate-300 hover:text-white border border-[#262a33]'
                      }`}
                    >
                      {item.contacted ? 'Inquiry Sent ✓' : 'Contact'}
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

        </main>

      </div>
    </div>
  );
};
