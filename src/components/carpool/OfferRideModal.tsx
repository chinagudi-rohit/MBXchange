import React, { useState } from 'react';
import { 
  X, 
  Car, 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  Zap, 
  ShieldCheck, 
  Sparkles,
  Plus,
  Trash2,
  Leaf
} from 'lucide-react';
import { CarpoolRide, TalentProfile } from '../../types';

interface OfferRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ride: Partial<CarpoolRide>) => void;
  currentUser: TalentProfile;
}

const POPULAR_CAMPUSES = [
  'MBRDI Whitefield Hub',
  'MBRDI Pune Center',
  'Sindelfingen Plant & Tech Center',
  'Böblingen Tech Hub',
  'Stuttgart Möhringen Headquarters',
  'Untertürkheim Powertrain R&D'
];

const VEHICLE_PRESETS = [
  'Mercedes-Benz EQA 250+ (Electric)',
  'Mercedes-Benz EQB 350 4MATIC (Electric)',
  'Mercedes-Benz EQE 350+ (Electric)',
  'Mercedes-Benz EQS 450+ (Electric)',
  'Mercedes-Benz C 300e (PHEV)',
  'Mercedes-Benz GLC 300 4MATIC',
  'Mercedes-Benz GLA 220d',
  'Mercedes-Benz A-Class Limousine'
];

const AVAILABLE_AMENITIES = [
  'EV Zero Emissions',
  'Climate Control AC',
  'Quiet Work Mode',
  'Device Fast Charger',
  'Spacious Trunk',
  'Podcast / Music Allowed',
  'Mentorship Friendly',
  'Women-Only Commute Option'
];

export const OfferRideModal: React.FC<OfferRideModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser
}) => {
  const [origin, setOrigin] = useState('');
  const [campus, setCampus] = useState(POPULAR_CAMPUSES[0]);
  const [departureTime, setDepartureTime] = useState('08:30 AM');
  const [returnTime, setReturnTime] = useState('05:45 PM');
  const [scheduleType, setScheduleType] = useState<CarpoolRide['scheduleType']>('Daily (Mon–Fri)');
  const [vehicleModel, setVehicleModel] = useState(VEHICLE_PRESETS[0]);
  const [vehicleType, setVehicleType] = useState<CarpoolRide['vehicleType']>('Electric (EV)');
  const [totalSeats, setTotalSeats] = useState(4);
  const [availableSeats, setAvailableSeats] = useState(3);
  const [costSharing, setCostSharing] = useState('Free / Eco-Commute');
  const [notes, setNotes] = useState('');
  const [routeStopInput, setRouteStopInput] = useState('');
  const [routeHighlights, setRouteHighlights] = useState<string[]>(['Metro Gate 1', 'Main Ring Rd']);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'EV Zero Emissions',
    'Climate Control AC',
    'Quiet Work Mode'
  ]);

  if (!isOpen) return null;

  const handleAddStop = () => {
    if (routeStopInput.trim() && !routeHighlights.includes(routeStopInput.trim())) {
      setRouteHighlights([...routeHighlights, routeStopInput.trim()]);
      setRouteStopInput('');
    }
  };

  const handleRemoveStop = (stop: string) => {
    setRouteHighlights(routeHighlights.filter(s => s !== stop));
  };

  const toggleAmenity = (item: string) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== item));
    } else {
      setSelectedAmenities([...selectedAmenities, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim()) return;

    onSubmit({
      origin,
      destination: `${campus} (Building 1-3 Gates)`,
      campus,
      departureTime,
      returnTime,
      scheduleType,
      vehicleModel,
      vehicleType,
      totalSeats,
      availableSeats: Math.min(availableSeats, totalSeats - 1),
      costSharingPerTrip: costSharing,
      notes,
      routeHighlights,
      amenities: selectedAmenities,
      passengers: []
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-[#14171d] border border-[#21242c] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-slate-200 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a1e28] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold mb-1">
              <Leaf className="w-3 h-3" />
              <span>Campus Sustainability & Eco-Ride Initiative</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Offer a Campus Carpool Ride
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Share your daily commute, reduce campus parking load, and earn enterprise sustainability credits.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Row 1: Origin & Target Campus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Pickup Location / Starting Point *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Indiranagar Metro Gate 1, Baner Highway, Koramangala"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1116] border border-[#21242c] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-emerald-400" />
                Destination Campus *
              </label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1116] border border-[#21242c] text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {POPULAR_CAMPUSES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Departure Time, Return Time & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Departure Time *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 08:15 AM"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1116] border border-[#21242c] text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Evening Return Time
              </label>
              <input
                type="text"
                placeholder="e.g. 05:45 PM (Optional)"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1116] border border-[#21242c] text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Schedule Frequency *
              </label>
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1116] border border-[#21242c] text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Daily (Mon–Fri)">Daily (Mon–Fri)</option>
                <option value="Mon, Wed, Fri">Mon, Wed, Fri</option>
                <option value="Tue, Thu">Tue, Thu</option>
                <option value="Flexible">Flexible</option>
                <option value="One-Time">One-Time Ride</option>
              </select>
            </div>
          </div>

          {/* Row 3: Vehicle & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Vehicle Model / Fleet Name
              </label>
              <input
                type="text"
                list="vehiclePresets"
                placeholder="e.g. Mercedes-Benz EQA 250+ (EV)"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1116] border border-[#21242c] text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              <datalist id="vehiclePresets">
                {VEHICLE_PRESETS.map(v => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Powertrain / Fuel Category
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1116] border border-[#21242c] text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Electric (EV)">⚡ Electric (EV) - Zero Emission</option>
                <option value="Hybrid (PHEV)">🌿 Hybrid (PHEV)</option>
                <option value="Diesel / Petrol">⛽ Diesel / Petrol</option>
              </select>
            </div>
          </div>

          {/* Row 4: Seats & Cost Sharing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Available Passenger Seats
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setAvailableSeats(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                      availableSeats === num 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                        : 'bg-[#0f1116] text-slate-400 border border-[#21242c] hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Contribution / Cost Sharing Model
              </label>
              <div className="flex items-center gap-2">
                {['Free / Eco-Commute', 'Split Fuel / Tolls', 'Flexible'].map(opt => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setCostSharing(opt)}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-medium transition-colors text-center ${
                      costSharing === opt 
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-bold' 
                        : 'bg-[#0f1116] text-slate-400 border border-[#21242c] hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Route Highlights / Stops */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Intermediate Stops / Pickup Corridor Points</span>
              <span className="text-[10px] text-slate-500 font-normal">Add key junctions along the route</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Marathahalli Bridge, HAL Airport Rd, Vaihingen Kreuz"
                value={routeStopInput}
                onChange={(e) => setRouteStopInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStop(); } }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#0f1116] border border-[#21242c] text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddStop}
                className="px-3.5 py-2 rounded-xl bg-[#1a1e28] hover:bg-[#262c3a] text-xs font-bold text-slate-200 border border-[#262a33] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stop</span>
              </button>
            </div>

            {routeHighlights.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {routeHighlights.map((stop) => (
                  <span
                    key={stop}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0f1116] border border-[#21242c] text-xs text-slate-300"
                  >
                    <span>{stop}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(stop)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Amenities Multi-Select */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-slate-300">
              Ride Amenities & Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                        : 'bg-[#0f1116] text-slate-400 border border-[#21242c] hover:text-white'
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-300">
              Driver Notes / Guidelines
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Regular daily commute. Punctual departure. Wi-Fi hotspot available."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1116] border border-[#21242c] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#21242c]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Car className="w-4 h-4" />
              <span>Publish Carpool Route</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
