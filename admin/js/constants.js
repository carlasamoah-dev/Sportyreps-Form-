/**
 * All columns that can be shown in the admin data grid.
 * These map directly to field names saved in the Supabase database.
 * Order determines default column order.
 */
export const COLUMNS = [
  // ── Meta ──────────────────────────────────────────────────
  { id: 'created_at',                       label: 'Response time',                type: 'time',   filterType: 'date', defaultVisible: true },
  { id: 'response_type',                    label: 'Response type',                type: 'status', filterType: 'text', defaultVisible: true },

  // ── Discovery ─────────────────────────────────────────────
  { id: 'source',                           label: 'How did you find this link?',   type: 'text',   filterType: 'choice', choices: ["Whatsapp", "Someone referred you here", "Website", "Google search", "Other Social media", "Other"], defaultVisible: true },

  // ── Role & Minor ──────────────────────────────────────────
  { id: 'role',                             label: 'Role',                          type: 'text',   filterType: 'choice', choices: ["Talent", "Representative"], defaultVisible: true },
  { id: 'minor-check',                      label: 'Are you a minor (Under 18 years)?',             type: 'boolean', filterType: 'choice', choices: ["Yes", "No"], defaultVisible: true },

  // ── Talent Contact ────────────────────────────────────────
  { id: 'talent-contact_firstname',         label: 'First name',                    type: 'text',   filterType: 'text', defaultVisible: true },
  { id: 'talent-contact_lastname',          label: 'Last name',                     type: 'text',   filterType: 'text', defaultVisible: true },
  { id: 'talent-contact_phone',             label: 'Phone number',                  type: 'phone',  filterType: 'text', defaultVisible: true },
  { id: 'talent-contact_email',             label: 'Email',                         type: 'text',   filterType: 'text', defaultVisible: true },

  // ── Manager Info (Talent) ─────────────────────────────────
  { id: 'has-manager',                      label: 'Has Manager?',                  type: 'boolean', filterType: 'choice', choices: ["Yes", "No"], defaultVisible: true },
  { id: 'manager-contact_manager_firstname',label: 'Manager first name',            type: 'text',   filterType: 'text', defaultVisible: true },
  { id: 'manager-contact_manager_lastname', label: 'Manager last name',             type: 'text',   filterType: 'text', defaultVisible: true },
  { id: 'manager-contact_manager_phone',    label: 'Manager phone number',          type: 'phone',  filterType: 'text', defaultVisible: true },
  { id: 'manager-contact_manager_email',    label: 'Manager email',                 type: 'text',   filterType: 'text', defaultVisible: true },

  // ── Representative Info ───────────────────────────────────
  { id: 'rep-type',                         label: 'Representative type',           type: 'text',   filterType: 'choice', choices: ["Biological Parent", "Adopted parent", "Guardian", "Immediate family relative", "Extended family relative", "Professional contact", "Player Manager", "Friend", "Other"], defaultVisible: true },
  { id: 'rep-contact_rep_firstname',        label: 'Rep first name',                type: 'text',   filterType: 'text', defaultVisible: true },
  { id: 'rep-contact_rep_lastname',         label: 'Rep last name',                 type: 'text',   filterType: 'text', defaultVisible: true },
  { id: 'rep-contact_rep_phone',            label: 'Rep phone number',              type: 'phone',  filterType: 'text', defaultVisible: true },
  { id: 'rep-contact_rep_email',            label: 'Rep email',                     type: 'text',   filterType: 'text', defaultVisible: true },

  // ── Talent Info (filled by rep) ───────────────────────────
  { id: 'talent-info-for-rep_firstname',    label: 'Talent first name (via rep)',   type: 'text',   filterType: 'text', defaultVisible: true },
  { id: 'talent-info-for-rep_lastname',     label: 'Talent last name (via rep)',    type: 'text',   filterType: 'text', defaultVisible: true },
  { id: 'talent-info-for-rep_phone',        label: 'Talent phone (via rep)',        type: 'phone',  filterType: 'text', defaultVisible: true },
  { id: 'talent-info-for-rep_email',        label: 'Talent email (via rep)',        type: 'text',   filterType: 'text', defaultVisible: true },

  // ── Files ─────────────────────────────────────────────────
  { id: 'cv-upload_url',                    label: 'CV/Resume',                     type: 'file',   filterType: 'file', defaultVisible: true },
  { id: 'photo-portrait_url',               label: 'Portrait photo',                type: 'file',   filterType: 'file', defaultVisible: true },
  { id: 'photo-front_url',                  label: 'Front view photo',              type: 'file',   filterType: 'file', defaultVisible: true },
  { id: 'photo-rear_url',                   label: 'Rear view photo',               type: 'file',   filterType: 'file', defaultVisible: true },

  // ── Personal ──────────────────────────────────────────────
  { id: 'sex',                              label: 'Sex',                           type: 'text',   filterType: 'choice', choices: ["Male", "Female", "Prefer not to say"], defaultVisible: true },
  { id: 'residence',                        label: 'Country of residence',          type: 'text',   filterType: 'choice', defaultVisible: true },
  { id: 'dob',                              label: 'Date of birth',                 type: 'text',   filterType: 'date', defaultVisible: true },
  { id: 'age',                              label: 'Age',                           type: 'number', filterType: 'number', defaultVisible: true },
  { id: 'nationality',                      label: 'Nationality',                   type: 'text',   filterType: 'text', defaultVisible: true },
  { id: 'dual-nationality-check',           label: 'Dual nationality?',             type: 'boolean', filterType: 'choice', choices: ["Yes", "No"], defaultVisible: true },
  { id: 'other-nationality',                label: 'Other nationality',             type: 'text',   filterType: 'text', defaultVisible: true },

  // ── Football Background ───────────────────────────────────
  { id: 'academy-experience',               label: 'Academy experience?',           type: 'boolean', filterType: 'choice', choices: ["Yes", "No"], defaultVisible: true },
  { id: 'signed-pro',                       label: 'Signed professional?',          type: 'boolean', filterType: 'choice', choices: ["Yes", "No"], defaultVisible: true },
  { id: 'current-club',                     label: 'Current club',                  type: 'text',   filterType: 'text', defaultVisible: true },
  { id: 'position',                         label: 'Position',                      type: 'text',   filterType: 'choice', choices: ["Goalkeeper", "Defender", "Midfielder", "Forward"], defaultVisible: true },
  { id: 'foot',                             label: 'Preferred foot',                type: 'text',   filterType: 'choice', choices: ["Right", "Left", "Both"], defaultVisible: true },
  { id: 'tactical-positions',               label: 'Tactical positions',            type: 'text',   filterType: 'text', defaultVisible: true },
  { id: 'special-abilities',               label: 'Special abilities',              type: 'text',   filterType: 'text', defaultVisible: true },

  // ── Physical ──────────────────────────────────────────────
  { id: 'height',                           label: 'Height (ft)',                   type: 'text',   filterType: 'number', defaultVisible: true },
  { id: 'weight',                           label: 'Weight (kg)',                   type: 'number', filterType: 'number', defaultVisible: true },
  { id: 'speed',                            label: 'Speed (mph)',                   type: 'number', filterType: 'text', defaultVisible: true },

  // ── Education & Legal ─────────────────────────────────────
  { id: 'education',                        label: 'Highest education',             type: 'text',   filterType: 'choice', choices: ["Primary School", "High School / Secondary", "Undergraduate Degree", "Postgraduate Degree", "None / Other"], defaultVisible: true },
  { id: 'passport-check',                   label: 'Has passport?',                 type: 'boolean', filterType: 'choice', choices: ["Yes", "No"], defaultVisible: true },
  { id: 'passport-expiry',                  label: 'Passport expiry',               type: 'text',   filterType: 'date', defaultVisible: true },
  { id: 'travel-experience',                label: 'International travel exp?',     type: 'boolean', filterType: 'choice', choices: ["Yes", "No"], defaultVisible: true },
  { id: 'criminal-record',                  label: 'Criminal record?',              type: 'boolean', filterType: 'choice', choices: ["Yes", "No"], defaultVisible: true },

  // ── Medical ───────────────────────────────────────────────
  { id: 'medical-condition',                label: 'Medical condition?',            type: 'boolean', filterType: 'choice', choices: ["Yes", "No"], defaultVisible: true },
  { id: 'surgery-check',                    label: 'Surgery in past 10yr?',         type: 'boolean', filterType: 'choice', choices: ["Yes", "No"], defaultVisible: true },

  // ── Media ─────────────────────────────────────────────────
  { id: 'youtube-link',                     label: 'YouTube link',                  type: 'url',    filterType: 'text', defaultVisible: true },
];

export const SVGS = {
  text: '<svg width="15" height="15" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  time: '<svg width="15" height="15" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></rect><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></line><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></line><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></line></svg>',
  phone: '<svg width="15" height="15" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" fill="none" stroke="currentColor" stroke-width="2"></path></svg>',
  file: '<svg width="15" height="15" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  check: '<svg width="15" height="15" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" stroke-width="2"></line></svg>',
  email: '<svg width="15" height="15" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" stroke-width="2"></path><path d="M22 6l-10 7L2 6" fill="none" stroke="currentColor" stroke-width="2"></path></svg>',
  url: '<svg width="15" height="15" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  number: '<svg width="15" height="15" viewBox="0 0 24 24"><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>',
  boolean: '<svg width="15" height="15" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" stroke-width="2"></line></svg>'
};
