-- MBXchange schema (PostgreSQL / PGlite compatible)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  role TEXT NOT NULL,
  system_role TEXT NOT NULL DEFAULT 'employee' CHECK (system_role IN ('employee','manager','admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  department TEXT NOT NULL,
  campus TEXT NOT NULL DEFAULT '',
  specialisation TEXT NOT NULL DEFAULT '',
  experience_years INTEGER NOT NULL DEFAULT 0,
  primary_skills JSONB NOT NULL DEFAULT '[]',
  interests JSONB NOT NULL DEFAULT '[]',
  available_for JSONB NOT NULL DEFAULT '[]',
  typical_availability TEXT NOT NULL DEFAULT '',
  available_hours_week INTEGER NOT NULL DEFAULT 0,
  bandwidth_period TEXT NOT NULL DEFAULT 'week' CHECK (bandwidth_period IN ('week','month')),
  hours_consumed NUMERIC NOT NULL DEFAULT 0,
  avatar_url TEXT NOT NULL DEFAULT '',
  last_seen TIMESTAMPTZ,
  tier TEXT NOT NULL DEFAULT 'Contributor',
  contribution_score NUMERIC NOT NULL DEFAULT 0,
  rating_breakdown JSONB NOT NULL DEFAULT '{}',
  badges JSONB NOT NULL DEFAULT '[]',
  collaborations_count INTEGER NOT NULL DEFAULT 0,
  departments_supported INTEGER NOT NULL DEFAULT 0,
  people_helped INTEGER NOT NULL DEFAULT 0,
  hours_contributed INTEGER NOT NULL DEFAULT 0,
  bio TEXT NOT NULL DEFAULT '',
  manager_id TEXT REFERENCES users(id),
  password_hash TEXT NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS work_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  team TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','In Progress','Completed','Cancelled')),
  urgency TEXT NOT NULL DEFAULT 'Medium',
  duration TEXT NOT NULL DEFAULT '',
  effort_hours TEXT NOT NULL DEFAULT '',
  effort_min INTEGER NOT NULL DEFAULT 0,
  effort_max INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  approval_required BOOLEAN NOT NULL DEFAULT TRUE,
  seats INTEGER NOT NULL DEFAULT 1,
  tags JSONB NOT NULL DEFAULT '[]',
  author_id TEXT REFERENCES users(id),
  author_name TEXT NOT NULL DEFAULT '',
  author_role TEXT NOT NULL DEFAULT '',
  author_initials TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  why_opportunity TEXT NOT NULL DEFAULT '',
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS work_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES work_posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per person included in an application (self-apply or added colleague)
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES work_posts(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL,
  applicant_id TEXT NOT NULL REFERENCES users(id),
  submitted_by TEXT NOT NULL REFERENCES users(id),
  manager_id TEXT REFERENCES users(id),
  note TEXT NOT NULL DEFAULT '',
  commitment TEXT NOT NULL DEFAULT '',
  -- Two decisions in sequence: the post's own author first (pending_author),
  -- then the applicant's manager (pending_manager). awaiting_registration is
  -- reached only from pending_manager, when the author has already said yes
  -- but the applicant has no registered manager to hand off to yet.
  status TEXT NOT NULL DEFAULT 'pending_author' CHECK (status IN ('pending_author','pending_manager','awaiting_registration','approved','rejected','withdrawn')),
  ai_recommendation TEXT NOT NULL DEFAULT '',
  ai_reason TEXT NOT NULL DEFAULT '',
  manager_notes TEXT NOT NULL DEFAULT '',
  edited_at TIMESTAMPTZ,
  author_decided_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, applicant_id)
);

CREATE TABLE IF NOT EXISTS registration_requests (
  id TEXT PRIMARY KEY,
  requested_by TEXT NOT NULL REFERENCES users(id),
  subject_name TEXT NOT NULL,
  subject_email TEXT NOT NULL DEFAULT '',
  subject_kind TEXT NOT NULL DEFAULT 'manager' CHECK (subject_kind IN ('manager','employee')),
  subject_role TEXT NOT NULL DEFAULT '',
  subject_department TEXT NOT NULL DEFAULT '',
  for_user_id TEXT REFERENCES users(id),
  related_application_id TEXT,
  related_post_id TEXT,
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','dismissed')),
  created_user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS collab_requests (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL REFERENCES users(id),
  target_id TEXT NOT NULL REFERENCES users(id),
  -- Set once the target accepts, to whichever manager owns the second
  -- decision (the target's manager). NULL until then, and stays NULL
  -- forever for a target with no manager — accepting skips straight to
  -- accepted in that case, there is nobody to hand off to.
  manager_id TEXT REFERENCES users(id),
  task_title TEXT NOT NULL,
  estimated_hours TEXT NOT NULL DEFAULT '',
  dates TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  -- pending: waiting on the target. pending_manager: target said yes,
  -- waiting on the target's manager. accepted/declined are final either way.
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','pending_manager','accepted','declined','completed','withdrawn')),
  edited_at TIMESTAMPTZ,
  target_decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bandwidth_offers (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES users(id),
  available_hours TEXT NOT NULL DEFAULT '',
  skills JSONB NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  listing_type TEXT NOT NULL DEFAULT 'Sell',
  title TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT '₹',
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  category TEXT NOT NULL DEFAULT 'Other',
  condition TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  seller_id TEXT REFERENCES users(id),
  seller_name TEXT NOT NULL DEFAULT '',
  seller_role TEXT NOT NULL DEFAULT '',
  seller_initials TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  specs JSONB NOT NULL DEFAULT '{}',
  sold BOOLEAN NOT NULL DEFAULT FALSE,
  event_date TEXT,
  ticket_quantity INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Interests',
  icon TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  member_count INTEGER NOT NULL DEFAULT 0,
  active_discussions INTEGER NOT NULL DEFAULT 0,
  tags JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id TEXT NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_posts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'Notice',
  group_name TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  author_id TEXT REFERENCES users(id),
  author_name TEXT NOT NULL DEFAULT '',
  author_role TEXT NOT NULL DEFAULT '',
  author_initials TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  date_info TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  author_id TEXT REFERENCES users(id),
  author_name TEXT NOT NULL DEFAULT '',
  author_role TEXT NOT NULL DEFAULT '',
  author_initials TEXT NOT NULL DEFAULT '',
  tags JSONB NOT NULL DEFAULT '[]',
  votes INTEGER NOT NULL DEFAULT 0,
  has_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS answers (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  author_id TEXT REFERENCES users(id),
  author_name TEXT NOT NULL DEFAULT '',
  author_role TEXT NOT NULL DEFAULT '',
  author_initials TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL,
  accepted BOOLEAN NOT NULL DEFAULT FALSE,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Carpool: each row is a ONE-WAY trip offer (direction to_office | from_office)
CREATE TABLE IF NOT EXISTS carpool_trips (
  id TEXT PRIMARY KEY,
  driver_id TEXT NOT NULL REFERENCES users(id),
  direction TEXT NOT NULL DEFAULT 'to_office' CHECK (direction IN ('to_office','from_office')),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  campus TEXT NOT NULL DEFAULT '',
  departure_time TEXT NOT NULL DEFAULT '',
  days JSONB NOT NULL DEFAULT '[]',
  vehicle_model TEXT NOT NULL DEFAULT '',
  vehicle_type TEXT NOT NULL DEFAULT '',
  seats_total INTEGER NOT NULL DEFAULT 3,
  cost_per_ride TEXT NOT NULL DEFAULT 'Free',
  women_only BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT NOT NULL DEFAULT '',
  amenities JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carpool_bookings (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES carpool_trips(id) ON DELETE CASCADE,
  rider_id TEXT NOT NULL REFERENCES users(id),
  days JSONB NOT NULL DEFAULT '[]',
  -- A booking starts pending until the driver decides. A rejected row is kept
  -- (not deleted) so the message thread it belongs to can still show what was
  -- decided; asking again clears the old row first, see the book route.
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trip_id, rider_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES users(id),
  recipient_id TEXT NOT NULL REFERENCES users(id),
  text TEXT NOT NULL,
  context_type TEXT NOT NULL DEFAULT 'general',
  context_title TEXT NOT NULL DEFAULT '',
  -- Points at the record this message is about (e.g. a carpool booking id),
  -- so the recipient can act on it inline from the thread itself.
  context_id TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  recipient_id TEXT REFERENCES users(id),
  recipient_role TEXT,
  type TEXT NOT NULL DEFAULT 'system_alert',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  target_tab TEXT,
  target_id TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Per-user notification clearing for broadcast (role-targeted) notifications
CREATE TABLE IF NOT EXISTS notification_clears (
  notification_id TEXT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  cleared BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (notification_id, user_id)
);

CREATE TABLE IF NOT EXISTS saved_items (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('work','listing','community','carpool')),
  item_id TEXT NOT NULL,
  PRIMARY KEY (user_id, item_type, item_id)
);

CREATE TABLE IF NOT EXISTS capability_heatmap (
  skill TEXT PRIMARY KEY,
  demand_score INTEGER NOT NULL DEFAULT 0,
  supply_score INTEGER NOT NULL DEFAULT 0,
  requests_count INTEGER NOT NULL DEFAULT 0,
  experts_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Balanced'
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  action TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  detail JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recognition for finished work: written by the requirement's author or by the
-- helper's own manager, and shown on the helper's profile.
CREATE TABLE IF NOT EXISTS appreciations (
  id TEXT PRIMARY KEY,
  to_user_id TEXT NOT NULL REFERENCES users(id),
  from_user_id TEXT NOT NULL REFERENCES users(id),
  post_id TEXT,
  application_id TEXT,
  message TEXT NOT NULL DEFAULT '',
  rating INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Every hour drawn against (or returned to) a person's declared bandwidth.
-- Kept as a ledger rather than a running total so a completion can be undone
-- and so a manager can see exactly where someone's capacity went.
CREATE TABLE IF NOT EXISTS bandwidth_ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  application_id TEXT,
  post_id TEXT,
  hours NUMERIC NOT NULL,
  kind TEXT NOT NULL DEFAULT 'consumed',
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applications_post ON applications(post_id);
CREATE INDEX IF NOT EXISTS idx_applications_manager ON applications(manager_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_collab_requester ON collab_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_collab_target ON collab_requests(target_id);
