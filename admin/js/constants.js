/**
 * All columns that can be shown in the admin data grid.
 * These map directly to field names saved in the Supabase database.
 * Order determines default column order.
 */
export const COLUMNS = [
  // ── Meta ──────────────────────────────────────────────────
  { id: 'created_at',                       label: 'Response time',                type: 'time',   defaultVisible: true },

  // ── Discovery ─────────────────────────────────────────────
  { id: 'source',                           label: 'How did you find this link?',   type: 'text',   defaultVisible: true },

  // ── Role & Minor ──────────────────────────────────────────
  { id: 'role',                             label: 'Role',                          type: 'text',   defaultVisible: true },
  { id: 'minor-check',                      label: 'Minor (Under 18)?',             type: 'text',   defaultVisible: true },

  // ── Talent Contact ────────────────────────────────────────
  { id: 'talent-contact_firstname',         label: 'First name',                    type: 'text',   defaultVisible: true },
  { id: 'talent-contact_lastname',          label: 'Last name',                     type: 'text',   defaultVisible: true },
  { id: 'talent-contact_phone',             label: 'Phone number',                  type: 'phone',  defaultVisible: true },
  { id: 'talent-contact_email',             label: 'Email',                         type: 'text',   defaultVisible: false },

  // ── Representative Info ───────────────────────────────────
  { id: 'rep-type',                         label: 'Representative type',           type: 'text',   defaultVisible: false },
  { id: 'rep-contact_rep_firstname',        label: 'Rep first name',                type: 'text',   defaultVisible: false },
  { id: 'rep-contact_rep_lastname',         label: 'Rep last name',                 type: 'text',   defaultVisible: false },
  { id: 'rep-contact_rep_phone',            label: 'Rep phone number',              type: 'phone',  defaultVisible: false },
  { id: 'rep-contact_rep_email',            label: 'Rep email',                     type: 'text',   defaultVisible: false },

  // ── Talent Info (filled by rep) ───────────────────────────
  { id: 'talent-info-for-rep_firstname',    label: 'Talent first name (via rep)',   type: 'text',   defaultVisible: false },
  { id: 'talent-info-for-rep_lastname',     label: 'Talent last name (via rep)',    type: 'text',   defaultVisible: false },
  { id: 'talent-info-for-rep_phone',        label: 'Talent phone (via rep)',        type: 'phone',  defaultVisible: false },
  { id: 'talent-info-for-rep_email',        label: 'Talent email (via rep)',        type: 'text',   defaultVisible: false },

  // ── Files ─────────────────────────────────────────────────
  { id: 'cv-upload_url',                    label: 'CV/Resume',                     type: 'file',   defaultVisible: true },
  { id: 'photo-portrait_url',               label: 'Portrait photo',                type: 'file',   defaultVisible: true },
  { id: 'photo-front_url',                  label: 'Front view photo',              type: 'file',   defaultVisible: false },
  { id: 'photo-rear_url',                   label: 'Rear view photo',               type: 'file',   defaultVisible: false },

  // ── Personal ──────────────────────────────────────────────
  { id: 'sex',                              label: 'Sex',                           type: 'text',   defaultVisible: true },
  { id: 'residence',                        label: 'Country of residence',          type: 'text',   defaultVisible: true },
  { id: 'dob',                              label: 'Date of birth',                 type: 'text',   defaultVisible: false },
  { id: 'age',                              label: 'Age',                           type: 'number', defaultVisible: true },
  { id: 'nationality',                      label: 'Nationality',                   type: 'text',   defaultVisible: false },
  { id: 'dual-nationality-check',           label: 'Dual nationality?',             type: 'text',   defaultVisible: false },
  { id: 'other-nationality',                label: 'Other nationality',             type: 'text',   defaultVisible: false },

  // ── Football Background ───────────────────────────────────
  { id: 'academy-experience',               label: 'Academy experience?',           type: 'text',   defaultVisible: true },
  { id: 'signed-pro',                       label: 'Signed professional?',          type: 'text',   defaultVisible: true },
  { id: 'current-club',                     label: 'Current club',                  type: 'text',   defaultVisible: true },
  { id: 'position',                         label: 'Position',                      type: 'text',   defaultVisible: true },
  { id: 'foot',                             label: 'Preferred foot',                type: 'text',   defaultVisible: true },
  { id: 'tactical-positions',               label: 'Tactical positions',            type: 'text',   defaultVisible: true },
  { id: 'special-abilities',               label: 'Special abilities',              type: 'text',   defaultVisible: true },

  // ── Physical ──────────────────────────────────────────────
  { id: 'height',                           label: 'Height (ft)',                   type: 'text',   defaultVisible: false },
  { id: 'weight',                           label: 'Weight (kg)',                   type: 'number', defaultVisible: false },
  { id: 'speed',                            label: 'Speed (mph)',                   type: 'number', defaultVisible: false },

  // ── Education & Legal ─────────────────────────────────────
  { id: 'education',                        label: 'Highest education',             type: 'text',   defaultVisible: true },
  { id: 'passport-check',                   label: 'Has passport?',                 type: 'text',   defaultVisible: true },
  { id: 'passport-expiry',                  label: 'Passport expiry',               type: 'text',   defaultVisible: false },
  { id: 'travel-experience',                label: 'International travel exp?',     type: 'text',   defaultVisible: false },
  { id: 'criminal-record',                  label: 'Criminal record?',              type: 'text',   defaultVisible: false },

  // ── Medical ───────────────────────────────────────────────
  { id: 'medical-condition',                label: 'Medical condition?',            type: 'text',   defaultVisible: false },
  { id: 'surgery-check',                    label: 'Surgery in past 10yr?',         type: 'text',   defaultVisible: false },

  // ── Media ─────────────────────────────────────────────────
  { id: 'youtube-link',                     label: 'YouTube link',                  type: 'url',    defaultVisible: true },
];

export const SVGS = {
  text: '<svg width="15" height="15" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>',
  time: '<svg width="15" height="15" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M12 7v5l3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>',
  phone: '<svg width="15" height="15" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" fill="none" stroke="currentColor" stroke-width="2"></path></svg>',
  file: '<svg width="15" height="15" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="none" stroke="currentColor" stroke-width="2"></path><path d="M14 2v6h6" fill="none" stroke="currentColor" stroke-width="2"></path></svg>',
  check: '<svg width="15" height="15" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  email: '<svg width="15" height="15" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" stroke-width="2"></path><path d="M22 6l-10 7L2 6" fill="none" stroke="currentColor" stroke-width="2"></path></svg>',
  url: '<svg width="15" height="15" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  number: '<svg width="15" height="15" viewBox="0 0 24 24"><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'
};
