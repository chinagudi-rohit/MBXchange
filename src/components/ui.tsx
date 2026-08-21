import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Bookmark, Check, AlertTriangle, Info, Inbox } from 'lucide-react';

/**
 * Renders overlays into document.body.
 *
 * Views are wrapped in `.anim-fade-up`, whose animation uses fill-mode `both` —
 * so the element keeps a `transform` after the animation ends. A transformed
 * ancestor becomes the containing block for `position: fixed` descendants,
 * which previously scoped modals inside the view and left the header clickable
 * above the scrim. Portalling to body sidesteps that entirely.
 */
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

/* ── Brand ───────────────────────────────────────────────────────────── */

/**
 * Mercedes-Benz three-pointed star in a ring — white, for use on black.
 *
 * The arms are tapered wedges that converge at the hub and narrow to a point
 * at the rim (it is a three-pointed *star*, not three straight bars). Vertices
 * alternate between the three outer tips at 90°/210°/330° and the three inner
 * notches at 30°/150°/270°.
 *
 * This is a geometric reconstruction — replace with the official asset from the
 * Mercedes-Benz brand portal for anything customer-facing.
 */
export function MercedesStar({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="43" fill="none" stroke="#fff" strokeWidth="6" />
      <polygon
        fill="#fff"
        points="50,11 56.06,46.5 83.78,69.5 50,57 16.22,69.5 43.94,46.5"
      />
    </svg>
  );
}

/* ── Scroll reveal ───────────────────────────────────────────────────── */

/**
 * Fades + lifts its children into place the first time they scroll into view,
 * so long feeds arrive in a continuous flow instead of appearing all at once.
 */
export function Reveal({
  children, delay = 0, className = '', stagger = false
}: { children: React.ReactNode; delay?: number; className?: string; stagger?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${stagger ? 'reveal-stagger' : 'reveal'} ${visible ? 'is-visible' : ''} ${className}`}
      style={visible && delay && !stagger ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* ── Loading skeletons ───────────────────────────────────────────────── */

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Placeholder shaped like a feed card, so loading matches what arrives. */
export function CardSkeleton() {
  return (
    <div className="panel rounded-2xl shadow-card p-5">
      <div className="flex gap-2 mb-3">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>
      <Skeleton className="h-4 w-4/5 mb-2" />
      <Skeleton className="h-3 w-full mb-1.5" />
      <Skeleton className="h-3 w-11/12 mb-4" />
      <div className="grid grid-cols-4 gap-3 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-2 w-10 mb-1.5" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-3.5 border-t border-line">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="h-3 w-28" />
        <span className="flex-1" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

/** Grid of card placeholders. */
export function SkeletonGrid({ count = 4, cols = 'lg:grid-cols-2' }: { count?: number; cols?: string }) {
  return (
    <div className={`grid ${cols} gap-4`} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

/** Placeholder for stacked list rows. */
export function RowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2.5" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="panel rounded-2xl shadow-card p-4 flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-3.5 w-2/3 mb-2" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
          <Skeleton className="h-6 w-24 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  );
}

/* ── Buttons ─────────────────────────────────────────────────────────── */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';

export function Button({
  variant = 'primary', size = 'md', className = '', children, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'sm' | 'md' | 'lg' }) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap';
  const sizes = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-3.5 py-2',
    lg: 'text-sm px-5 py-2.5'
  };
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-on-primary hover:bg-primary-strong shadow-sm',
    secondary: 'panel text-ink border border-line-strong hover:bg-surface-2',
    soft: 'bg-primary-soft text-primary hover:bg-primary hover:text-on-primary',
    ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
    danger: 'bg-red-soft text-red hover:bg-red hover:text-white'
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

/* ── Modal with mandatory top-right close ────────────────────────────── */

export function Modal({
  open, onClose, title, subtitle, children, footer, wide = false
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <Portal>
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-[2px] p-4 sm:p-8 anim-fade-in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-label={title}
    >
      <div
        ref={ref}
        className={`w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} panel-overlay rounded-2xl shadow-pop anim-pop-in my-auto`}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-line">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-ink truncate">{title}</h2>
            {subtitle && <p className="text-xs text-ink-2 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 -mr-1.5 -mt-1 p-2 rounded-lg text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-line rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
    </Portal>
  );
}

/* ── Drawer (right slide-over) with top-right close ──────────────────── */

export function Drawer({
  open, onClose, title, subtitle, children, width = 'max-w-md'
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <Portal>
    <div className="fixed inset-0 z-50 anim-fade-in" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" onMouseDown={onClose} />
      <aside className={`absolute right-0 top-0 h-full w-full ${width} panel-overlay shadow-pop flex flex-col animate-[fade-in_200ms_ease-out]`}>
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-line shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-ink truncate">{title}</h2>
            {subtitle && <p className="text-xs text-ink-2 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="shrink-0 p-2 -mr-1 rounded-lg text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </aside>
    </div>
    </Portal>
  );
}

/* ── Form controls ───────────────────────────────────────────────────── */

export function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-ink-2 mb-1.5">
        {label}{required && <span className="text-red ml-0.5">*</span>}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-ink-3 mt-1">{hint}</span>}
    </label>
  );
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl panel border border-line-strong text-sm text-ink placeholder:text-ink-3 focus:border-primary focus:outline-none transition-colors';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className || ''}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${inputCls} resize-y ${props.className || ''}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className || ''}`} />;
}

/* ── Badges & chips ──────────────────────────────────────────────────── */

const STATUS_STYLES: Record<string, string> = {
  'Open': 'bg-primary-soft text-primary',
  'In Progress': 'bg-amber-soft text-amber',
  'Completed': 'bg-green-soft text-green',
  'Cancelled': 'bg-surface-2 text-ink-3',
  'pending': 'bg-amber-soft text-amber',
  'awaiting_registration': 'bg-violet-soft text-violet',
  'approved': 'bg-green-soft text-green',
  'rejected': 'bg-red-soft text-red',
  'withdrawn': 'bg-surface-2 text-ink-3',
  'accepted': 'bg-green-soft text-green',
  'declined': 'bg-red-soft text-red',
  'completed': 'bg-green-soft text-green'
};

const STATUS_LABELS: Record<string, string> = {
  awaiting_registration: 'Awaiting Registration',
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Declined',
  withdrawn: 'Withdrawn',
  accepted: 'Accepted',
  declined: 'Declined',
  completed: 'Completed'
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${STATUS_STYLES[status] || 'bg-surface-2 text-ink-2'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

const URGENCY_STYLES: Record<string, string> = {
  Low: 'bg-surface-2 text-ink-2',
  Medium: 'bg-blue-soft text-blue',
  High: 'bg-amber-soft text-amber',
  Critical: 'bg-red-soft text-red'
};

export function UrgencyBadge({ urgency }: { urgency: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${URGENCY_STYLES[urgency] || 'bg-surface-2 text-ink-2'}`}>
      {urgency}
    </span>
  );
}

export function Chip({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'primary' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
      tone === 'primary' ? 'bg-primary-soft text-primary' : 'bg-surface-2 text-ink-2'
    }`}>
      {children}
    </span>
  );
}

export function AiBadge({ verdict }: { verdict: string }) {
  const style = verdict === 'Approve' ? 'bg-green-soft text-green'
    : verdict === 'Review Capacity' ? 'bg-amber-soft text-amber'
    : 'bg-red-soft text-red';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${style}`}>
      ✦ AI: {verdict}
    </span>
  );
}

/* ── Avatar ──────────────────────────────────────────────────────────── */

const AVATAR_TONES = [
  'bg-primary-soft text-primary', 'bg-violet-soft text-violet', 'bg-blue-soft text-blue',
  'bg-green-soft text-green', 'bg-amber-soft text-amber'
];

export function Avatar({ initials, size = 'md', name }: { initials: string; size?: 'sm' | 'md' | 'lg' | 'xl'; name?: string }) {
  const sizes = { sm: 'w-6 h-6 text-[9px]', md: 'w-8 h-8 text-[11px]', lg: 'w-10 h-10 text-xs', xl: 'w-16 h-16 text-xl' };
  const tone = AVATAR_TONES[(initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % AVATAR_TONES.length];
  return (
    <span
      title={name}
      className={`inline-flex items-center justify-center rounded-full font-bold shrink-0 ${sizes[size]} ${tone}`}
    >
      {initials}
    </span>
  );
}

/* ── Save (bookmark) button ──────────────────────────────────────────── */

export function SaveButton({ saved, onToggle, className = '' }: { saved: boolean; onToggle: () => void; className?: string }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      aria-label={saved ? 'Remove from saved' : 'Save item'}
      className={`p-2 rounded-lg transition-colors ${saved ? 'text-primary bg-primary-soft' : 'text-ink-3 hover:text-ink hover:bg-surface-2'} ${className}`}
    >
      <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
    </button>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────── */

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center mb-3">
        <Inbox className="w-5 h-5 text-ink-3" />
      </div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {hint && <p className="text-xs text-ink-3 mt-1 max-w-xs">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ── Toasts ──────────────────────────────────────────────────────────── */

export function Toasts({ toasts, onDismiss }: {
  toasts: Array<{ id: string; kind: 'success' | 'error' | 'info'; title: string; message?: string }>;
  onDismiss: (id: string) => void;
}) {
  const icons = {
    success: <Check className="w-4 h-4 text-green" />,
    error: <AlertTriangle className="w-4 h-4 text-red" />,
    info: <Info className="w-4 h-4 text-blue" />
  };
  return (
    <Portal>
    <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 w-[min(92vw,22rem)]" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="flex items-start gap-3 panel-overlay rounded-xl shadow-pop px-4 py-3 anim-pop-in">
          <span className="mt-0.5 shrink-0">{icons[t.kind]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink leading-tight">{t.title}</p>
            {t.message && <p className="text-xs text-ink-2 mt-0.5">{t.message}</p>}
          </div>
          <button onClick={() => onDismiss(t.id)} aria-label="Dismiss" className="shrink-0 text-ink-3 hover:text-ink p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
    </Portal>
  );
}

/* ── Misc ────────────────────────────────────────────────────────────── */

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <h2 className="text-sm font-bold text-ink">{children}</h2>
      {right}
    </div>
  );
}

export function Card({ children, className = '', onClick }: {
  children: React.ReactNode; className?: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`panel rounded-2xl shadow-card ${
        onClick ? 'cursor-pointer transition-all duration-200 hover:shadow-pop hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-10" role="status" aria-label="Loading">
      <div className="w-6 h-6 rounded-full border-2 border-line-strong border-t-primary animate-spin" />
    </div>
  );
}

export function SeatsIndicator({ total, filled }: { total: number; filled: number }) {
  const open = Math.max(0, total - filled);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex gap-0.5">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`w-1.5 h-3.5 rounded-sm ${i < filled ? 'bg-primary' : 'bg-line-strong'}`} />
        ))}
      </span>
      <span className="text-[11px] font-semibold text-ink-2">
        {open === 0 ? 'All seats filled' : `${open} of ${total} seat${total > 1 ? 's' : ''} open`}
      </span>
    </span>
  );
}
