import React, { useState, useMemo } from 'react';
import { 
  Car, 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Bookmark, 
  MessageSquare, 
  CheckCircle2, 
  Leaf, 
  TrendingUp, 
  ChevronRight,
  ArrowRight,
  UserCheck,
  Award,
  AlertCircle
} from 'lucide-react';
import { CarpoolRide, TalentProfile } from '../../types';

interface CarpoolViewProps {
  rides: CarpoolRide[];
  onOfferRide: () => void;
  onBookSeat: (rideId: string) => void;
  onCancelBooking: (rideId: string) => void;
  onContactDriver: (ride: CarpoolRide) => void;
  onToggleBookmark: (rideId: string) => void;
  savedRideIds?: string[];
  currentUser: TalentProfile;
}

export const CarpoolView: React.FC<CarpoolViewProps> = ({
  rides = [],
  onOfferRide,
  onBookSeat,
  onCancelBooking,
  onContactDriver,
  onToggleBookmark,
  savedRideIds = [],
  currentUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('All Campuses');
  const [selectedVehicleType, setSelectedVehicleType] = useState('All');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'ev' | 'my_offered' | 'my_booked'>('all');

  const safeRides = Array.isArray(rides) ? rides : [];

  // Campuses list
  const campuses = ['All Campuses', ...Array.from(new Set(safeRides.map(r => r.campus).filter(Boolean)))];

  // Filtering
  const filteredRides = useMemo(() => {
    return safeRides.filter(ride => {
      // Tab filter
      if (activeFilterTab === 'ev' && ride.vehicleType !== 'Electric (EV)') return false;
      if (activeFilterTab === 'my_offered' && ride.driverId !== currentUser.id) return false;
      if (activeFilterTab === 'my_booked' && !ride.passengers?.some(p => p.id === currentUser.id)) return false;

      // Campus filter
      if (selectedCampus !== 'All Campuses' && ride.campus !== selectedCampus) return false;

      // Vehicle filter
      if (selectedVehicleType !== 'All' && ride.vehicleType !== selectedVehicleType) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchOrigin = ride.origin.toLowerCase().includes(q);
        const matchDest = ride.destination.toLowerCase().includes(q);
        const matchCampus = ride.campus.toLowerCase().includes(q);
        const matchDriver = ride.driverName.toLowerCase().includes(q);
        const matchStops = ride.routeHighlights?.some(s => s.toLowerCase().includes(q));
        const matchVehicle = ride.vehicleModel.toLowerCase().includes(q);
        return matchOrigin || matchDest || matchCampus || matchDriver || matchStops || matchVehicle;
      }

      return true;
    });
  }, [safeRides, activeFilterTab, selectedCampus, selectedVehicleType, searchQuery, currentUser.id]);

  // Aggregate Stats
  const totalAvailableSeats = safeRides.reduce((acc, r) => acc + (r.availableSeats || 0), 0);
  const evRidesCount = safeRides.filter(r => r.vehicleType === 'Electric (EV)').length;
  const myOfferedCount = safeRides.filter(r => r.driverId === currentUser.id).length;
  const myBookedCount = safeRides.filter(r => r.passengers?.some(p => p.id === currentUser.id)).length;

  return (
    <div className="w-full space-y-8 animate-in fade-in">
      
      {/* Top Banner with Eco-Commute Highlights */}
      <div className="bg-gradient-to-r from-[#14171d] via-[#161c28] to-[#14171d] border border-[#21242c] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Leaf className="w-3.5 h-3.5" />
              <span>Mercedes-Benz Campus Mobility & Green Carpooling</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Enterprise Campus Carpool Hub
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Connect with verified Mercedes-Benz colleagues heading to the same campus. Share electric and hybrid rides, reduce carbon footprint, and streamline your daily commute.
            </p>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 bg-[#0f1116] px-3 py-1.5 rounded-xl border border-[#21242c]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <strong className="text-white">100% Verified</strong> Employee Fleet
              </span>
              <span className="flex items-center gap-1.5 bg-[#0f1116] px-3 py-1.5 rounded-xl border border-[#21242c]">
                <Zap className="w-4 h-4 text-indigo-400" />
                <strong className="text-white">{evRidesCount} EV Zero-Emission</strong> Active Routes
              </span>
            </div>
          </div>

          {/* Stats Box & Primary CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={onOfferRide}
              className="px-6 py-3.5 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-xl shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>Offer a Carpool Ride</span>
            </button>

            <div className="grid grid-cols-2 gap-2 text-center p-3 rounded-2xl bg-[#0f1116] border border-[#21242c]">
              <div className="p-2">
                <div className="text-xl font-bold font-mono text-emerald-400">{totalAvailableSeats}</div>
                <div className="text-[10px] text-slate-400">Available Seats</div>
              </div>
              <div className="p-2 border-l border-[#21242c]">
                <div className="text-xl font-bold font-mono text-indigo-400">~420 kg</div>
                <div className="text-[10px] text-slate-400">CO₂ Saved / Wk</div>
              </div>
            </div>
          </div>

        </div>

        {/* Ambient Glow */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-[#14171d] border border-[#21242c] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        
        {/* Top Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#21242c] pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveFilterTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeFilterTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-[#0f1116] text-slate-400 hover:text-white border border-[#21242c]'
              }`}
            >
              All Routes ({safeRides.length})
            </button>

            <button
              onClick={() => setActiveFilterTab('ev')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeFilterTab === 'ev'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-[#0f1116] text-slate-400 hover:text-white border border-[#21242c]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Electric (EV) Only ({evRidesCount})</span>
            </button>

            <button
              onClick={() => setActiveFilterTab('my_booked')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeFilterTab === 'my_booked'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-[#0f1116] text-slate-400 hover:text-white border border-[#21242c]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>My Booked Seats ({myBookedCount})</span>
            </button>

            <button
              onClick={() => setActiveFilterTab('my_offered')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeFilterTab === 'my_offered'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-[#0f1116] text-slate-400 hover:text-white border border-[#21242c]'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>My Offered Rides ({myOfferedCount})</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-white">{filteredRides.length}</strong> active carpool routes
          </div>
        </div>

        {/* Search & Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pickup points, metro stations, drivers, or route corridors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0f1116] border border-[#21242c] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Campus Selector */}
          <div className="sm:col-span-3">
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0f1116] border border-[#21242c] text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {campuses.map(campus => (
                <option key={campus} value={campus}>{campus}</option>
              ))}
            </select>
          </div>

          {/* Powertrain Selector */}
          <div className="sm:col-span-3">
            <select
              value={selectedVehicleType}
              onChange={(e) => setSelectedVehicleType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0f1116] border border-[#21242c] text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All Powertrains</option>
              <option value="Electric (EV)">⚡ Electric (EV)</option>
              <option value="Hybrid (PHEV)">🌿 Hybrid (PHEV)</option>
              <option value="Diesel / Petrol">⛽ Diesel / Petrol</option>
            </select>
          </div>

        </div>

      </div>

      {/* Rides Grid */}
      {filteredRides.length === 0 ? (
        <div className="bg-[#14171d] border border-[#21242c] rounded-3xl p-12 text-center shadow-xl space-y-3">
          <Car className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Carpool Routes Match Your Filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search criteria, selecting another campus, or be the first to offer a carpool route for your team!
          </p>
          <div className="pt-2">
            <button
              onClick={onOfferRide}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer"
            >
              Offer a New Ride
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRides.map((ride) => {
            const isDriver = ride.driverId === currentUser.id;
            const isBooked = ride.passengers?.some(p => p.id === currentUser.id);
            const isFull = ride.availableSeats <= 0;
            const isSaved = savedRideIds.includes(ride.id) || ride.bookmarked;

            return (
              <div
                key={ride.id}
                className="bg-[#14171d] hover:bg-[#161a22] border border-[#21242c] hover:border-emerald-500/40 rounded-3xl p-6 shadow-xl space-y-5 transition-all flex flex-col justify-between group"
              >
                {/* Header: Driver info & Save Bookmark */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Driver Profile */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-500/10 shrink-0">
                        {ride.driverInitials}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm truncate">{ride.driverName}</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            ⭐ {ride.driverRating.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {ride.driverRole} · <strong className="text-slate-300">{ride.driverDepartment}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Bookmark */}
                    <button
                      onClick={() => onToggleBookmark(ride.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        isSaved
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-[#0f1116] text-slate-400 border-[#21242c] hover:text-white'
                      }`}
                      title={isSaved ? 'Remove from Saved' : 'Save Carpool Route'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
                    </button>

                  </div>

                  {/* Route & Timings Card */}
                  <div className="p-4 rounded-2xl bg-[#0f1116] border border-[#21242c] space-y-3 text-xs">
                    
                    {/* Origin to Destination */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 shadow-sm shadow-emerald-500/50" />
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Pickup Area</span>
                          <strong className="text-white font-semibold text-xs leading-snug">{ride.origin}</strong>
                        </div>
                      </div>

                      <div className="pl-1 border-l-2 border-dashed border-[#262a33] ml-1 py-1">
                        {ride.routeHighlights && ride.routeHighlights.length > 0 && (
                          <div className="flex flex-wrap gap-1 pl-3">
                            {ride.routeHighlights.map((stop, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#161a22] text-slate-300 border border-[#21242c]">
                                📍 {stop}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1 shrink-0 shadow-sm shadow-indigo-500/50" />
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Campus Destination</span>
                          <strong className="text-indigo-300 font-semibold text-xs leading-snug">{ride.destination}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Schedule & Timing Info */}
                    <div className="pt-2 border-t border-[#21242c] grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Morning Commute:</span>
                        <strong className="text-emerald-400 font-mono font-bold">{ride.departureTime}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Return / Frequency:</span>
                        <strong className="text-slate-300 font-medium">
                          {ride.returnTime ? `${ride.returnTime}` : ride.scheduleType}
                        </strong>
                      </div>
                    </div>

                  </div>

                  {/* Vehicle & Seat Availability */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ride.vehicleType === 'Electric (EV)'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : ride.vehicleType === 'Hybrid (PHEV)'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-slate-500/10 text-slate-300 border border-slate-500/30'
                        }`}>
                          {ride.vehicleType === 'Electric (EV)' ? '⚡ Electric EV' : ride.vehicleType}
                        </span>
                        <span className="text-slate-400 text-[11px] truncate max-w-[140px]">
                          {ride.vehicleModel}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-bold ${isFull ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {ride.availableSeats} of {ride.totalSeats} seats open
                        </span>
                      </div>
                    </div>

                    {/* Passenger Avatars & Cost */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 mr-1">Riders:</span>
                        {ride.passengers && ride.passengers.length > 0 ? (
                          ride.passengers.map((p, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold flex items-center justify-center"
                              title={`${p.name} (${p.department})`}
                            >
                              {p.initials}
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">No riders booked yet</span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0f1116] text-emerald-300 border border-[#21242c]">
                        {ride.costSharingPerTrip}
                      </span>
                    </div>

                    {/* Amenities tags */}
                    {ride.amenities && ride.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {ride.amenities.slice(0, 3).map((amenity, i) => (
                          <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-[#0f1116] text-slate-400 border border-[#21242c]">
                            ✓ {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-[#21242c] flex items-center justify-between gap-2">
                  
                  <button
                    onClick={() => onContactDriver(ride)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#0f1116] hover:bg-[#1a1e28] border border-[#21242c] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Chat</span>
                  </button>

                  {isDriver ? (
                    <span className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
                      Your Offered Ride
                    </span>
                  ) : isBooked ? (
                    <button
                      onClick={() => onCancelBooking(ride.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Cancel Seat</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onBookSeat(ride.id)}
                      disabled={isFull}
                      className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 ${
                        isFull 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60' 
                          : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isFull ? 'Ride Full' : 'Book Seat'}</span>
                    </button>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
