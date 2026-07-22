const { z } = require('zod');
const { isValidUKPhoneNumber } = require('../utils/phoneValidator');

// Helper to validate phone number only if provided
const phoneSchema = z.string().refine((val) => {
  if (!val) return true; // Let optional() handle missing values
  return isValidUKPhoneNumber(val);
}, {
  message: "Invalid UK Phone Number. Must be a valid UK mobile or landline."
});

const submissionSchema = z.object({
  formId: z.string().min(1, "Form ID is required"),
  
  source: z.string().min(1, "Source is required"),
  role: z.enum(["Talent", "Representative"]),
  
  "minor-check": z.enum(["Yes", "No"]).optional(),
  
  // Talent direct contact
  "talent-contact_firstname": z.string().optional(),
  "talent-contact_lastname": z.string().optional(),
  "talent-contact_phone": z.string().optional().refine(val => !val || isValidUKPhoneNumber(val), "Invalid UK Phone Number"),
  "talent-contact_email": z.string().email("Invalid email address").optional().or(z.literal('')),
  
  // Rep contact
  "rep-type": z.string().optional(),
  "rep-contact_rep_firstname": z.string().optional(),
  "rep-contact_rep_lastname": z.string().optional(),
  "rep-contact_rep_phone": z.string().optional().refine(val => !val || isValidUKPhoneNumber(val), "Invalid UK Phone Number"),
  "rep-contact_rep_email": z.string().email("Invalid email address").optional().or(z.literal('')),
  
  // Talent info (when filled by rep)
  "talent-info-for-rep_firstname": z.string().optional(),
  "talent-info-for-rep_lastname": z.string().optional(),
  "talent-info-for-rep_phone": z.string().optional().refine(val => !val || isValidUKPhoneNumber(val), "Invalid UK Phone Number"),
  "talent-info-for-rep_email": z.string().email("Invalid email address").optional().or(z.literal('')),

  // General Questions
  sex: z.enum(["Male", "Female", "Prefer not to say"]),
  residence: z.string().min(1, "Country of residence is required"),
  dob: z.string().min(1, "Date of birth is required"),
  
  age: z.coerce.number().min(1).max(120),
  
  nationality: z.string().min(1, "Nationality is required"),
  "dual-nationality-check": z.enum(["Yes", "No"]),
  "other-nationality": z.string().optional(),
  
  "academy-experience": z.enum(["Yes", "No"]),
  "signed-pro": z.enum(["Yes", "No"]),
  
  height: z.string().min(1, "Height is required"),
  weight: z.coerce.number().min(20).max(200),
  
  position: z.enum(["Goalkeeper", "Defender", "Midfielder", "Forward"]),
  foot: z.enum(["Right", "Left", "Both"]),
  
  "tactical-positions": z.string().min(1, "Tactical position is required"),
  "special-abilities": z.string().min(1, "Special abilities are required"),
  
  speed: z.coerce.number().min(1).max(30),
  
  education: z.string().min(1, "Education is required"),
  
  "passport-check": z.enum(["Yes", "No"]),
  "passport-expiry": z.string().optional(),
  "travel-experience": z.enum(["Yes", "No"]).optional(),
  
  "current-club": z.string().min(1, "Current club is required"),
  "medical-condition": z.enum(["Yes", "No"]),
  "surgery-check": z.enum(["Yes", "No"]),
  "criminal-record": z.enum(["Yes", "No"]),
  
  "youtube-link": z.string().url("Must be a valid URL")
});

module.exports = {
  submissionSchema,
};
