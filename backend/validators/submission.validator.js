const { z } = require('zod');
const { isValidInternationalPhoneNumber } = require('../utils/phoneValidator');

// Reusable: validates international phone number if value is present
const phoneSchema = z.string().optional().refine(
  val => !val || isValidInternationalPhoneNumber(val),
  { message: "Invalid phone number. Must be a valid international number (e.g. +447700900000)." }
);

const submissionSchema = z.object({
  formId: z.string().min(1, "Form ID is required"),

  // Q1
  source: z.string().min(1, "Source is required"),
  // Q2
  role: z.enum(["Talent", "Representative"]),

  // Q3
  "minor-check": z.enum(["Yes", "No"]).optional(),

  // Q4 — Talent direct contact
  "talent-contact_firstname": z.string().optional(),
  "talent-contact_lastname": z.string().optional(),
  "talent-contact_phone": phoneSchema,
  "talent-contact_email": z.string().email("Invalid email").optional().or(z.literal('')),

  // Q5 — Rep type
  "rep-type": z.string().optional(),

  // Q6 — Rep contact
  "rep-contact_rep_firstname": z.string().optional(),
  "rep-contact_rep_lastname": z.string().optional(),
  "rep-contact_rep_phone": phoneSchema,
  "rep-contact_rep_email": z.string().email("Invalid email").optional().or(z.literal('')),

  // Q7 — Talent info when filled by rep
  "talent-info-for-rep_firstname": z.string().optional(),
  "talent-info-for-rep_lastname": z.string().optional(),
  "talent-info-for-rep_phone": phoneSchema,
  "talent-info-for-rep_email": z.string().email("Invalid email").optional().or(z.literal('')),

  // Q8 — cv-upload handled as file (no text field)
  // Q9a/9b/9c — photos handled as files

  // Q10
  sex: z.enum(["Male", "Female", "Prefer not to say"]),
  // Q11
  residence: z.string().min(1, "Country of residence is required"),
  // Q12
  dob: z.string().min(1, "Date of birth is required"),
  // Q13
  age: z.coerce.number().min(1).max(120),
  // Q14
  nationality: z.string().min(1, "Nationality is required"),
  // Q15
  "dual-nationality-check": z.enum(["Yes", "No"]),
  // Q16 — only present when Q15 = Yes
  "other-nationality": z.string().optional(),
  // Q17
  "academy-experience": z.enum(["Yes", "No"]),
  // Q18
  "signed-pro": z.enum(["Yes", "No"]),
  // Q19
  height: z.string().min(1, "Height is required"),
  // Q20
  weight: z.coerce.number().min(20).max(500),
  // Q21
  position: z.enum(["Goalkeeper", "Defender", "Midfielder", "Forward"]),
  // Q22
  foot: z.enum(["Right", "Left", "Both"]),
  // Q23
  "tactical-positions": z.string().min(1, "Tactical position is required"),
  // Q24
  "special-abilities": z.string().min(1, "Special abilities are required"),
  // Q25
  speed: z.coerce.number().min(1).max(60),
  // Q26
  education: z.string().min(1, "Education is required"),
  // Q27
  "passport-check": z.enum(["Yes", "No"]),
  // Q28 — only if Q27 = Yes
  "passport-expiry": z.string().optional(),
  // Q29 — only if Q27 = No
  "travel-experience": z.enum(["Yes", "No"]).optional(),
  // Q30
  "current-club": z.string().min(1, "Current club is required"),
  // Q31
  "medical-condition": z.enum(["Yes", "No"]),
  // Q32
  "surgery-check": z.enum(["Yes", "No"]),
  // Q33
  "criminal-record": z.enum(["Yes", "No"]),
  // Q34
  "youtube-link": z.string().url("Must be a valid URL"),
});

module.exports = {
  submissionSchema,
};
