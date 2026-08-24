import React, { useEffect, useState, useMemo } from 'react';
import {
  ShoppingBag, Car, UsersRound, Plus, MapPin, Sunrise, Sunset, MessageSquare,
  Tag, ChevronRight, ThumbsUp, CheckCircle2, Leaf
} from 'lucide-react';
import { useStore } from '../lib/store';
import { api, timeAgo, type Listing, type CarpoolTrip } from '../lib/api';
import {
  Button, Card, Chip, Avatar, Modal, Field, TextInput, TextArea, Select, EmptyState, SaveButton, StatusBadge, SkeletonGrid, Reveal
} from '../components/ui';

const CATEGORIES = ['All', 'Vehicles', 'Electronics', 'Furniture & Home', 'Sports & Outdoors', 'Tickets & Events', 'Books & Tools', 'Services', 'Giveaways & Free', 'Other'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const VEHICLE_TYPES = ['Electric (EV)', 'Hybrid (PHEV)', 'Diesel / Petrol'];

/* ══════════════════ Marketplace ══════════════════ */

function Marketplace() {
  const s = useStore();
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'newest' | 'priceAsc' | 'priceDesc'>('newest');
  const [hideSold, setHideSold] = useState(true);
  const [detail, setDetail] = useState<Listing | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({
    listingType: 'Sell', title: '', price: '', currency: '€', category: 'Electronics',
    condition: 'Used - Excellent', location: '', description: '', isFree: false
  });

  const load = () => api.get('/listings').then((d) => setListings(d.listings));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => (listings || []).filter((l) => {
    if (category !== 'All' && l.category !== category) return false;
    if (hideSold && l.sold) return false;
    if (query) {
      const ql = query.toLowerCase();
      if (!l.title.toLowerCase().includes(ql) &&
          !(l.description || '').toLowerCase().includes(ql) &&
          !(l.sellerName || '').toLowerCase().includes(ql)) return false;
    }
    return true;
  }).sort((a, b) => {
    const pa = a.isFree ? 0 : Number(a.price || 0);
    const pb = b.isFree ? 0 : Number(b.price || 0);
    if (sort === 'priceAsc') return pa - pb;
    if (sort === 'priceDesc') return pb - pa;
    return +new Date(b.createdAt) - +new Date(a.createdAt);
  }), [listings, category, query, sort, hideSold]);

  const submit = async () => {
    if (!form.title.trim()) { s.toast('error', 'Title required'); return; }
    await api.post('/listings', { ...form, price: form.isFree ? 0 : Number(form.price) || 0 });
    s.toast('success', 'Listing published');
    setNewOpen(false);
    setForm({ ...form, title: '', price: '', description: '' });
    load();
  };

  if (!listings) return <SkeletonGrid count={6} cols="sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" />;

  return (
    <div>
      <div className="flex flex-wrap gap-2.5 mb-4 items-center">
        <TextInput placeholder="Search title, description, seller…" value={query} onChange={(e) => setQuery(e.target.value)} className="!w-64" />
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="!w-48" aria-label="Filter by category">
          <option value="All">All categories</option>
          {CATEGORIES.filter((c) => c !== 'All').map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="!w-44" aria-label="Sort listings">
          <option value="newest">Newest first</option>
          <option value="priceAsc">Price: low to high</option>
          <option value="priceDesc">Price: high to low</option>
        </Select>
        <label className="flex items-center gap-2 text-xs font-medium text-ink-2 cursor-pointer select-none">
          <input
            type="checkbox" checked={hideSold} onChange={(e) => setHideSold(e.target.checked)}
            className="w-4 h-4 accent-(--primary)"
          />
          Hide sold
        </label>
        <span className="flex-1" />
        <Button onClick={() => setNewOpen(true)}><Plus className="w-4 h-4" /> Post Listing</Button>
      </div>

      <p className="text-xs text-ink-3 mb-3">
        Showing <b className="text-ink-2">{filtered.length}</b> of {(listings || []).length} listings
      </p>

      {filtered.length === 0 ? (
        <EmptyState title="No listings" hint="Post the first item for your colleagues." />
      ) : (
        <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((l) => (
            <Card key={l.id} className={`p-5 h-full flex flex-col ${l.sold ? 'opacity-60' : ''}`} onClick={() => setDetail(l)}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <Chip>{l.category}</Chip>
                <SaveButton saved={s.isSaved('listing', l.id)} onToggle={async () => {
                  const now = await s.toggleSaved('listing', l.id);
                  s.toast('info', now ? 'Saved' : 'Removed from saved');
                }} />
              </div>
              <h3 className="text-base font-semibold text-ink leading-snug flex-1">{l.title}</h3>
              <p className="text-lg font-medium text-primary-text mt-2.5">
                {l.isFree || l.price === 0 ? 'Free' : `${l.currency}${Number(l.price).toLocaleString()}`}
                {l.sold && <span className="ml-2 text-xs font-semibold text-red">SOLD</span>}
              </p>
              <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-line">
                <span className="flex items-center gap-2 min-w-0">
                  <Avatar initials={l.sellerInitials} size="sm" name={l.sellerName} />
                  <span className="text-xs text-ink-2 truncate">{l.sellerName}</span>
                </span>
                <span className="text-xs text-ink-3 shrink-0">{timeAgo(l.createdAt)}</span>
              </div>
            </Card>
          ))}
        </Reveal>
      )}

      {/* Detail modal */}
      <Modal
        open={!!detail} onClose={() => setDetail(null)} wide
        title={detail?.title || ''}
        subtitle={detail ? `${detail.category} · ${detail.condition} · ${detail.location}` : ''}
        footer={detail ? (
          <>
            {detail.sellerId === s.user?.id && !detail.sold && (
              <Button variant="secondary" onClick={async () => {
                await api.patch(`/listings/${detail.id}`, { sold: true });
                s.toast('success', 'Marked as sold');
                setDetail(null); load();
              }}>Mark as Sold</Button>
            )}
            <Button variant="secondary" onClick={() => setDetail(null)}>Close</Button>
            {detail.sellerId && detail.sellerId !== s.user?.id && (
              <Button onClick={() => {
                s.setMessagePartnerId(detail.sellerId);
                s.setMessagesOpen(true);
                setDetail(null);
              }}>
                <MessageSquare className="w-3.5 h-3.5" /> Contact Seller
              </Button>
            )}
          </>
        ) : undefined}
      >
        {detail && (
          <div className="space-y-4">
            <p className="text-2xl font-medium text-primary-text">
              {detail.isFree || detail.price === 0 ? 'Free' : `${detail.currency}${Number(detail.price).toLocaleString()}`}
            </p>
            <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-line">{detail.description}</p>
            {Object.keys(detail.specs || {}).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(detail.specs).map(([k, v]) => (
                  <div key={k} className="bg-surface-2 rounded-xl px-3.5 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">{k}</p>
                    <p className="text-xs font-medium text-ink mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2.5 pt-2 border-t border-line">
              <Avatar initials={detail.sellerInitials} name={detail.sellerName} />
              <div>
                <p className="text-xs font-medium text-ink">{detail.sellerName}</p>
                <p className="text-xs text-ink-3">{detail.sellerRole} · {timeAgo(detail.createdAt)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* New listing modal */}
      <Modal
        open={newOpen} onClose={() => setNewOpen(false)} wide
        title="Post a Listing" subtitle="Visible to all colleagues on MBXchange"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Publish</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Type">
            <Select value={form.listingType} onChange={(e) => setForm({ ...form, listingType: e.target.value, isFree: e.target.value === 'Give Away (Free)' })}>
              {['Sell', 'Buy / Looking for', 'Give Away (Free)', 'Exchange', 'Ticket / Event', 'Service Offer'].map((t) => <option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.filter((c) => c !== 'All').map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Title" required>
              <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
          </div>
          {!form.isFree && (
            <Field label="Price">
              <div className="flex gap-2">
                <Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="!w-18">
                  <option>€</option><option>₹</option><option>$</option>
                </Select>
                <TextInput type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
            </Field>
          )}
          <Field label="Condition">
            <Select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
              {['Brand New', 'Like New', 'Used - Excellent', 'Used', 'Fair', 'N/A'].map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Pickup / Location">
              <TextInput value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={s.user?.campus} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description">
              <TextArea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ══════════════════ Carpool (one-way trips) ══════════════════ */

function Carpool() {
  const s = useStore();
  const [trips, setTrips] = useState<CarpoolTrip[] | null>(null);
  const [direction, setDirection] = useState<'all' | 'to_office' | 'from_office'>('all');
  const [campus, setCampus] = useState('All');
  const [vehicle, setVehicle] = useState('All');
  const [scope, setScope] = useState<'all' | 'ev' | 'mine' | 'booked' | 'women'>('all');
  const [offerOpen, setOfferOpen] = useState(false);
  const [form, setForm] = useState({
    origin: '', destination: '', morningTime: '08:30 AM', eveningTime: '05:45 PM',
    offerMorning: true, offerEvening: true, days: [...DAYS] as string[],
    vehicleModel: '', vehicleType: 'Electric (EV)', seatsTotal: 3, costPerRide: 'Free / Eco-Commute', notes: '', womenOnly: false
  });

  const load = () => api.get('/carpool/trips').then((d) => setTrips(d.trips));
  useEffect(() => { load(); }, []);

  const all = trips || [];
  const campuses = useMemo(
    () => [...new Set(all.map((t) => t.campus).filter(Boolean))].sort(),
    [all]
  );
  const stats = useMemo(() => ({
    total: all.length,
    ev: all.filter((t) => t.vehicleType === 'Electric (EV)').length,
    mine: all.filter((t) => t.driverId === s.user?.id).length,
    booked: all.filter((t) => t.iAmBooked).length,
    seatsFree: all.reduce((n, t) => n + Math.max(0, t.seatsTotal - t.seatsBooked), 0)
  }), [all, s.user]);

  const filtered = all.filter((t) => {
    if (direction !== 'all' && t.direction !== direction) return false;
    if (campus !== 'All' && t.campus !== campus) return false;
    if (vehicle !== 'All' && t.vehicleType !== vehicle) return false;
    if (scope === 'ev' && t.vehicleType !== 'Electric (EV)') return false;
    if (scope === 'mine' && t.driverId !== s.user?.id) return false;
    if (scope === 'booked' && !t.iAmBooked) return false;
    if (scope === 'women' && !t.womenOnly) return false;
    return true;
  });

  const book = async (t: CarpoolTrip) => {
    try {
      await api.post(`/carpool/trips/${t.id}/book`);
      s.toast('success', 'Seat reserved', `${t.origin} → ${t.destination} at ${t.departureTime}.`);
      load();
    } catch (e: any) { s.toast('error', 'Could not book', e.message); }
  };

  const cancelBooking = async (t: CarpoolTrip) => {
    await api.post(`/carpool/trips/${t.id}/cancel-booking`);
    s.toast('info', 'Booking cancelled');
    load();
  };

  const submitOffer = async () => {
    if (!form.origin.trim() || !form.destination.trim()) {
      s.toast('error', 'Route required', 'Origin and destination are needed.');
      return;
    }
    if (!form.offerMorning && !form.offerEvening) {
      s.toast('error', 'Pick a direction', 'Offer the morning trip, the evening trip, or both.');
      return;
    }
    const tripsPayload = [];
    if (form.offerMorning) tripsPayload.push({ direction: 'to_office', origin: form.origin, destination: form.destination, departureTime: form.morningTime });
    if (form.offerEvening) tripsPayload.push({ direction: 'from_office', origin: form.destination, destination: form.origin, departureTime: form.eveningTime });
    await api.post('/carpool/trips', {
      origin: form.origin, destination: form.destination, trips: tripsPayload,
      days: form.days, vehicleModel: form.vehicleModel, vehicleType: form.vehicleType,
      seatsTotal: form.seatsTotal, costPerRide: form.costPerRide, notes: form.notes, womenOnly: form.womenOnly
    });
    s.toast('success', `${tripsPayload.length === 2 ? 'Both trips' : 'Trip'} published`,
      tripsPayload.length === 2 ? 'Each direction is bookable independently.' : 'Colleagues can book this ride.');
    setOfferOpen(false);
    load();
  };

  if (!trips) return <SkeletonGrid count={4} cols="md:grid-cols-2 xl:grid-cols-3" />;

  return (
    <div>
      <div className="flex flex-wrap gap-2.5 mb-4 items-center">
        <div className="flex gap-1.5 panel shadow-card p-1 rounded-xl">
          {([['all', 'All trips'], ['to_office', 'Morning → Office'], ['from_office', 'Evening → Home']] as const).map(([val, label]) => (
            <button
              key={val} onClick={() => setDirection(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                direction === val ? 'bg-primary text-on-primary' : 'text-ink-2 hover:text-ink'
              }`}
            >{label}</button>
          ))}
        </div>
        <span className="flex-1" />
        <Button onClick={() => setOfferOpen(true)}><Plus className="w-4 h-4" /> Offer a Ride</Button>
      </div>

      {/* Scope chips with live counts, so you can see at a glance what is on
          offer before narrowing the list. */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {([
          ['all', `All rides (${stats.total})`],
          ['ev', `Electric only (${stats.ev})`],
          ['women', 'Women-only'],
          ['mine', `Offered by me (${stats.mine})`],
          ['booked', `My bookings (${stats.booked})`]
        ] as const).map(([val, label]) => (
          <button
            key={val} onClick={() => setScope(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              scope === val ? 'bg-primary-soft text-primary-text' : 'panel text-ink-2 hover:text-ink shadow-card'
            }`}
          >{label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3">
        <Select value={campus} onChange={(e) => setCampus(e.target.value)} aria-label="Filter by campus">
          <option value="All">All campuses</option>
          {campuses.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Select value={vehicle} onChange={(e) => setVehicle(e.target.value)} aria-label="Filter by vehicle type">
          <option value="All">Any vehicle</option>
          {VEHICLE_TYPES.map((v) => <option key={v}>{v}</option>)}
        </Select>
      </div>

      <p className="text-xs text-ink-3 mb-4">
        Showing <b className="text-ink-2">{filtered.length}</b> of {stats.total} one-way trips
        {stats.seatsFree > 0 && <> · <b className="text-ink-2">{stats.seatsFree}</b> seats free</>}
        {' '}· book only the direction and days you need.
      </p>

      <Reveal stagger className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((t) => {
          const seatsLeft = t.seatsTotal - t.seatsBooked;
          const isDriver = t.driverId === s.user?.id;
          return (
            <Card key={t.id} className="p-5 h-full flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  t.direction === 'to_office' ? 'bg-amber-soft text-amber' : 'bg-violet-soft text-violet'
                }`}>
                  {t.direction === 'to_office' ? <Sunrise className="w-3.5 h-3.5" /> : <Sunset className="w-3.5 h-3.5" />}
                  {t.direction === 'to_office' ? 'Morning' : 'Evening'} · {t.departureTime}
                </span>
                <div className="flex items-center gap-1">
                  {t.vehicleType.includes('Electric') && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green bg-green-soft px-2 py-1 rounded-lg">
                      <Leaf className="w-3 h-3" /> EV
                    </span>
                  )}
                  <SaveButton saved={s.isSaved('carpool', t.id)} onToggle={async () => {
                    const now = await s.toggleSaved('carpool', t.id);
                    s.toast('info', now ? 'Route saved' : 'Removed from saved');
                  }} />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink">
                <MapPin className="w-4 h-4 text-ink-3 shrink-0" />
                <span className="truncate">{t.origin}</span>
                <ChevronRight className="w-4 h-4 text-ink-3 shrink-0" />
                <span className="truncate">{t.destination}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2.5 mb-4">
                {t.days.map((d) => <Chip key={d}>{d}</Chip>)}
                <Chip tone="primary">{t.costPerRide}</Chip>
                {t.womenOnly && <Chip>Women only</Chip>}
              </div>

              {t.vehicleModel && <p className="text-xs text-ink-3 mt-2">{t.vehicleModel}</p>}

              <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-line">
                <span className="flex items-center gap-2 min-w-0">
                  <Avatar initials={t.driverInitials} size="sm" name={t.driverName} />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-ink truncate">{t.driverName}</span>
                    <span className="block text-xs text-ink-3">{t.driverDepartment}</span>
                  </span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-semibold ${seatsLeft > 0 ? 'text-green' : 'text-red'}`}>
                    {seatsLeft > 0 ? `${seatsLeft} seat${seatsLeft > 1 ? 's' : ''} left` : 'Full'}
                  </span>
                  {isDriver ? (
                    <Chip>Your trip</Chip>
                  ) : t.iAmBooked ? (
                    <Button size="sm" variant="danger" onClick={() => cancelBooking(t)}>Cancel Seat</Button>
                  ) : seatsLeft > 0 ? (
                    <Button size="sm" onClick={() => book(t)}>Book Seat</Button>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="md:col-span-2">
            <EmptyState title="No trips in this direction" hint="Offer a ride to start the pool." />
          </div>
        )}
      </Reveal>

      <Modal
        open={offerOpen} onClose={() => setOfferOpen(false)} wide
        title="Offer a Ride"
        subtitle="Morning and evening are separate one-way trips — offer either or both"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOfferOpen(false)}>Cancel</Button>
            <Button onClick={submitOffer}>Publish Trip{form.offerMorning && form.offerEvening ? 's' : ''}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Home / Pickup Point" required>
              <TextInput value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="Indiranagar Metro Gate 1" />
            </Field>
            <Field label="Office / Campus" required>
              <TextInput value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Office campus" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-3.5 rounded-xl border ${form.offerMorning ? 'border-primary bg-primary-soft/40' : 'border-line'}`}>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.offerMorning} onChange={(e) => setForm({ ...form, offerMorning: e.target.checked })}
                  className="w-4 h-4 accent-(--primary)" />
                <Sunrise className="w-4 h-4 text-amber" />
                <span className="text-sm font-semibold text-ink">Morning → office</span>
              </label>
              {form.offerMorning && (
                <TextInput className="mt-2.5" value={form.morningTime} onChange={(e) => setForm({ ...form, morningTime: e.target.value })} placeholder="08:30 AM" />
              )}
            </div>
            <div className={`p-3.5 rounded-xl border ${form.offerEvening ? 'border-primary bg-primary-soft/40' : 'border-line'}`}>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.offerEvening} onChange={(e) => setForm({ ...form, offerEvening: e.target.checked })}
                  className="w-4 h-4 accent-(--primary)" />
                <Sunset className="w-4 h-4 text-violet" />
                <span className="text-sm font-semibold text-ink">Evening → home</span>
              </label>
              {form.offerEvening && (
                <TextInput className="mt-2.5" value={form.eveningTime} onChange={(e) => setForm({ ...form, eveningTime: e.target.value })} placeholder="05:45 PM" />
              )}
            </div>
          </div>

          <Field label="Days">
            <div className="flex gap-1.5 flex-wrap">
              {DAYS.map((d) => (
                <button
                  key={d} type="button"
                  onClick={() => setForm({
                    ...form,
                    days: form.days.includes(d) ? form.days.filter((x) => x !== d) : [...form.days, d]
                  })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    form.days.includes(d) ? 'bg-primary text-on-primary' : 'bg-surface-2 text-ink-2 hover:text-ink'
                  }`}
                >{d}</button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Vehicle">
              <TextInput value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} placeholder="Mercedes-Benz EQA 250+" />
            </Field>
            <Field label="Type">
              <Select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}>
                {VEHICLE_TYPES.map((v) => <option key={v}>{v}</option>)}
              </Select>
            </Field>
            <Field label="Seats">
              <TextInput type="number" min={1} max={6} value={form.seatsTotal}
                onChange={(e) => setForm({ ...form, seatsTotal: Math.max(1, parseInt(e.target.value) || 1) })} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <Field label="Cost sharing">
              <Select value={form.costPerRide} onChange={(e) => setForm({ ...form, costPerRide: e.target.value })}>
                {['Free / Eco-Commute', 'Split Fuel / Eco-share', 'Company Eco-Pass'].map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <label className="flex items-center gap-2.5 text-sm text-ink-2 pb-2">
              <input type="checkbox" checked={form.womenOnly} onChange={(e) => setForm({ ...form, womenOnly: e.target.checked })}
                className="w-4 h-4 accent-(--primary)" />
              Women-only ride
            </label>
          </div>

          <Field label="Notes">
            <TextArea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Route highlights, pickup flexibility…" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

/* ══════════════════ Communities ══════════════════ */

function Communities() {
  const s = useStore();
  const [data, setData] = useState<any>(null);
  const [askOpen, setAskOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [openQuestion, setOpenQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [answerText, setAnswerText] = useState('');
  const [askForm, setAskForm] = useState({ title: '', details: '', tags: '' });
  const [postForm, setPostForm] = useState({ type: 'Notice', title: '', description: '', location: '', dateInfo: '' });

  const load = () => api.get('/community').then(setData);
  useEffect(() => { load(); }, []);

  const openQ = async (q: any) => {
    setOpenQuestion(q);
    const d = await api.get(`/community/questions/${q.id}`);
    setAnswers(d.answers);
  };

  if (!data) return <SkeletonGrid count={6} cols="sm:grid-cols-2 lg:grid-cols-3" />;

  return (
    <div className="space-y-7">
      {/* Groups */}
      <section>
        <h3 className="text-sm font-semibold text-ink mb-3">Guilds & Groups</h3>
        <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {data.groups.map((g: any) => (
            <Card key={g.id} className="p-4.5 p-5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl leading-none">{g.icon}</span>
                <Button
                  size="sm" variant={g.isJoined ? 'secondary' : 'soft'}
                  onClick={async () => {
                    const { joined } = await api.post(`/community/groups/${g.id}/toggle-join`);
                    s.toast('info', joined ? `Joined ${g.name}` : `Left ${g.name}`);
                    load();
                  }}
                >
                  {g.isJoined ? 'Joined ✓' : 'Join'}
                </Button>
              </div>
              <p className="text-sm font-normal text-ink mt-2.5 leading-snug">{g.name}</p>
              <p className="text-xs text-ink-3 mt-1 line-clamp-2">{g.description}</p>
              <p className="text-xs text-ink-3 mt-2.5 font-medium">
                {g.memberCount.toLocaleString()} members · {g.activeDiscussions} active discussions
              </p>
            </Card>
          ))}
        </Reveal>
      </section>

      {/* Q&A */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-ink">Knowledge Q&A</h3>
          <Button size="sm" variant="soft" onClick={() => setAskOpen(true)}><Plus className="w-3.5 h-3.5" /> Ask a Question</Button>
        </div>
        <div className="space-y-2.5">
          {data.questions.map((q: any) => (
            <Card key={q.id} className="p-4 flex items-start gap-3.5" onClick={() => openQ(q)}>
              <button
                onClick={async (e) => { e.stopPropagation(); await api.post(`/community/questions/${q.id}/vote`); load(); }}
                className="flex flex-col items-center px-2 py-1.5 rounded-xl bg-surface-2 hover:bg-primary-soft text-ink-2 hover:text-primary-text transition-colors shrink-0"
                aria-label="Upvote question"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold mt-0.5">{q.votes}</span>
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-normal text-ink leading-snug">{q.title}</p>
                <p className="text-xs text-ink-3 line-clamp-1 mt-1">{q.details}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {(q.tags || []).slice(0, 4).map((t: string) => <Chip key={t}>{t}</Chip>)}
                  <span className="text-xs text-ink-3 ml-1">
                    {q.answerCount} answer{q.answerCount !== 1 ? 's' : ''} · {q.authorName} · {timeAgo(q.createdAt)}
                  </span>
                  {q.hasAccepted && <CheckCircle2 className="w-3.5 h-3.5 text-green" />}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Notices */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-ink">Notices & Events</h3>
          <Button size="sm" variant="soft" onClick={() => setPostOpen(true)}><Plus className="w-3.5 h-3.5" /> Post Notice</Button>
        </div>
        <Reveal stagger className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {data.posts.map((p: any) => (
            <Card key={p.id} className="p-4.5 p-5">
              <Chip tone="primary">{p.type}</Chip>
              <p className="text-sm font-normal text-ink mt-2 leading-snug">{p.title}</p>
              <p className="text-xs text-ink-2 mt-1.5 line-clamp-2">{p.description}</p>
              <p className="text-xs text-ink-3 mt-2.5">
                {p.location}{p.dateInfo ? ` · ${p.dateInfo}` : ''} · by {p.authorName} · {timeAgo(p.createdAt)}
              </p>
            </Card>
          ))}
        </Reveal>
      </section>

      {/* Question detail */}
      <Modal
        open={!!openQuestion} onClose={() => setOpenQuestion(null)} wide
        title={openQuestion?.title || ''}
        subtitle={openQuestion ? `${openQuestion.authorName} · ${timeAgo(openQuestion.createdAt)}` : ''}
      >
        {openQuestion && (
          <div className="space-y-4">
            <p className="text-sm text-ink-2 leading-relaxed">{openQuestion.details}</p>
            <div className="space-y-3">
              {answers.map((a) => (
                <div key={a.id} className={`p-3.5 rounded-xl ${a.accepted ? 'bg-green-soft/50 border border-green/30' : 'bg-surface-2'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Avatar initials={a.authorInitials} size="sm" />
                    <span className="text-xs font-semibold text-ink">{a.authorName}</span>
                    {a.accepted && <span className="text-xs font-semibold text-green flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Accepted Answer</span>}
                  </div>
                  <p className="text-xs text-ink-2 leading-relaxed whitespace-pre-line">{a.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <TextInput value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Share your expertise…" />
              <Button onClick={async () => {
                if (!answerText.trim()) return;
                await api.post(`/community/questions/${openQuestion.id}/answers`, { text: answerText });
                setAnswerText('');
                const d = await api.get(`/community/questions/${openQuestion.id}`);
                setAnswers(d.answers);
                load();
                s.toast('success', 'Answer posted');
              }}>Answer</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Ask question */}
      <Modal
        open={askOpen} onClose={() => setAskOpen(false)}
        title="Ask a Question" subtitle="Engineering guilds across departments will see it"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAskOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!askForm.title.trim()) { s.toast('error', 'Title required'); return; }
              await api.post('/community/questions', {
                title: askForm.title, details: askForm.details,
                tags: askForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
              });
              setAskOpen(false);
              setAskForm({ title: '', details: '', tags: '' });
              load();
              s.toast('success', 'Question posted');
            }}>Post Question</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Question" required>
            <TextInput value={askForm.title} onChange={(e) => setAskForm({ ...askForm, title: e.target.value })} />
          </Field>
          <Field label="Details">
            <TextArea value={askForm.details} onChange={(e) => setAskForm({ ...askForm, details: e.target.value })} />
          </Field>
          <Field label="Tags" hint="Comma-separated">
            <TextInput value={askForm.tags} onChange={(e) => setAskForm({ ...askForm, tags: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* Post notice */}
      <Modal
        open={postOpen} onClose={() => setPostOpen(false)}
        title="Post a Notice" subtitle="Events, lost & found, announcements"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPostOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!postForm.title.trim()) { s.toast('error', 'Title required'); return; }
              await api.post('/community/posts', postForm);
              setPostOpen(false);
              setPostForm({ type: 'Notice', title: '', description: '', location: '', dateInfo: '' });
              load();
              s.toast('success', 'Posted');
            }}>Publish</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Type">
            <Select value={postForm.type} onChange={(e) => setPostForm({ ...postForm, type: e.target.value })}>
              {['Notice', 'Event', 'Lost & Found', 'Interests & Sports', 'Social & Giving'].map((t) => <option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Title" required>
            <TextInput value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} />
          </Field>
          <Field label="Description">
            <TextArea value={postForm.description} onChange={(e) => setPostForm({ ...postForm, description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location">
              <TextInput value={postForm.location} onChange={(e) => setPostForm({ ...postForm, location: e.target.value })} />
            </Field>
            <Field label="Date / Time">
              <TextInput value={postForm.dateInfo} onChange={(e) => setPostForm({ ...postForm, dateInfo: e.target.value })} placeholder="Thu, Aug 28 · 16:30" />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ══════════════════ Container ══════════════════ */

export function BeyondWork() {
  const s = useStore();
  const sections = [
    { id: 'market' as const, label: 'Marketplace', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'carpool' as const, label: 'Carpool', icon: <Car className="w-4 h-4" /> },
    { id: 'community' as const, label: 'Communities', icon: <UsersRound className="w-4 h-4" /> }
  ];

  return (
    <div className="anim-fade-up">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Beyond Work</h1>
        <p className="text-xs text-ink-2 mt-0.5">
          The colleague-to-colleague space — buy & sell, share rides, and join communities
        </p>
      </div>

      <div className="flex gap-1.5 mb-6 panel shadow-card p-1 rounded-xl w-fit">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => s.setBeyondSection(sec.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              s.beyondSection === sec.id ? 'bg-primary text-on-primary' : 'text-ink-2 hover:text-ink'
            }`}
          >
            {sec.icon} {sec.label}
          </button>
        ))}
      </div>

      {s.beyondSection === 'market' && <Marketplace />}
      {s.beyondSection === 'carpool' && <Carpool />}
      {s.beyondSection === 'community' && <Communities />}
    </div>
  );
}
