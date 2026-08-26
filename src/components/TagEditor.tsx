import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { searchSkills, ALL_SKILLS } from '../data/skills';
import { Button, TextInput } from './ui';

/**
 * Chip-based tag editor with a typeahead over the skill catalogue.
 *
 * Typing filters on canonical names *and* aliases, so "full" surfaces
 * "Full Stack Developer" alongside the stack that usually comes with it, and
 * "k8s" finds Kubernetes. Arrow keys move through the list, Enter accepts the
 * highlighted suggestion (or the raw text, so anything not in the catalogue can
 * still be added).
 *
 * Originally lived only in the profile's skills editor; shared here so every
 * other place a person types skills — posting a requirement, offering
 * bandwidth — gets the same chips, the same catalogue lookup, and the same
 * "click a suggestion" affordance instead of a bare comma-separated text box.
 */
export function TagEditor({ tags, onChange, placeholder, useCatalogue = false, suggestions = [] }: {
  tags: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  useCatalogue?: boolean;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState('');
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);

  const add = (value: string) => {
    const v = value.trim();
    if (!v || tags.some((t) => t.toLowerCase() === v.toLowerCase())) { setDraft(''); return; }
    onChange([...tags, v]);
    setDraft('');
    setActive(0);
  };

  // Ranked matches from the catalogue while typing; a starter set when idle.
  const matches = useCatalogue && draft.trim()
    ? searchSkills(draft, tags, 8)
    : [];

  const idleChips = (useCatalogue ? ALL_SKILLS : suggestions)
    .filter((sug) => !tags.some((t) => t.toLowerCase() === sug.toLowerCase()))
    .filter((sug) => !draft || sug.toLowerCase().includes(draft.toLowerCase()))
    .slice(0, 8);

  const showList = focused && matches.length > 0;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-lg bg-primary-soft text-primary-text text-xs font-bold">
            {t}
            <button
              onClick={() => onChange(tags.filter((x) => x !== t))}
              aria-label={`Remove ${t}`}
              className="p-0.5 rounded hover:bg-primary hover:text-on-primary transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {tags.length === 0 && <span className="text-xs text-ink-3">Nothing added yet.</span>}
      </div>

      <div className="relative">
        <div className="flex gap-2">
          <TextInput
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setActive(0); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 120)}
            onKeyDown={(e) => {
              if (showList && e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % matches.length); return; }
              if (showList && e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + matches.length) % matches.length); return; }
              if (e.key === 'Enter') {
                e.preventDefault();
                add(showList ? matches[active].name : draft);
                return;
              }
              if (e.key === 'Escape') { setFocused(false); return; }
              if (e.key === 'Backspace' && !draft && tags.length) onChange(tags.slice(0, -1));
            }}
            placeholder={placeholder}
            role="combobox"
            aria-expanded={showList}
            aria-autocomplete="list"
          />
          <Button size="sm" variant="secondary" onClick={() => add(draft)} disabled={!draft.trim()} aria-label="Add">
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        {showList && (
          <ul
            role="listbox"
            className="absolute z-20 left-0 right-0 top-full mt-1 panel-overlay rounded-xl shadow-pop p-1 max-h-60 overflow-y-auto"
          >
            {matches.map((m, i) => (
              <li key={m.name}>
                <button
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => add(m.name)}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    i === active ? 'bg-primary-soft text-primary-text' : 'text-ink hover:bg-surface-2'
                  }`}
                >
                  <span className="text-xs font-semibold truncate">{m.name}</span>
                  <span className="text-xs text-ink-3 shrink-0">{m.group}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!showList && idleChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {idleChips.map((sug) => (
            <button
              key={sug}
              onClick={() => add(sug)}
              className="px-2 py-0.5 rounded-lg bg-surface-2 text-ink-2 text-xs font-semibold hover:bg-primary-soft hover:text-primary-text transition-colors"
            >
              + {sug}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
