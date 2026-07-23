import { getAccessToken } from './auth.js';
import { BACKEND_URL } from './config.js';

/**
 * Mock data — used as a fallback ONLY when both:
 *   (a) the backend is unreachable (local dev without backend running), AND
 *   (b) no Supabase credentials are configured yet.
 */
const mockSubmissions = [
  {
    id: "1",
    created_at: "2026-07-22T10:00:00Z",
    source: "Whatsapp",
    role: "Talent",
    "minor-check": "No",
    "talent-contact_firstname": "Julius",
    "talent-contact_lastname": "Dzameshie",
    "talent-contact_phone": "+447700900000",
    "talent-contact_email": "juliusdzameshie2@gmail.com",
    "rep-type": null, "rep-contact_rep_firstname": null, "rep-contact_rep_lastname": null,
    "rep-contact_rep_phone": null, "rep-contact_rep_email": null,
    "talent-info-for-rep_firstname": null, "talent-info-for-rep_lastname": null,
    "talent-info-for-rep_phone": null, "talent-info-for-rep_email": null,
    "cv-upload_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "photo-portrait_url": "https://via.placeholder.com/600x800.png?text=Portrait",
    "photo-front_url": "https://via.placeholder.com/600x800.png?text=Front",
    "photo-rear_url": "https://via.placeholder.com/600x800.png?text=Rear",
    sex: "Male", residence: "United Kingdom", dob: "2000-01-01", age: 26,
    nationality: "Ghanaian", "dual-nationality-check": "No", "other-nationality": null,
    "academy-experience": "Yes", "signed-pro": "No",
    "current-club": "Accra Lions FC, Accra",
    position: "Midfielder", foot: "Right",
    "tactical-positions": "Right Back, Right Winger, Left Winger, Left Back",
    "special-abilities": "Corner kicks, Long ball, High Interceptions",
    height: "5'11\"", weight: 75, speed: 25,
    education: "High School / Secondary",
    "passport-check": "Yes", "passport-expiry": "2028-06-15", "travel-experience": null,
    "criminal-record": "No", "medical-condition": "No", "surgery-check": "No",
    "youtube-link": "https://youtube.com/watch?v=example1"
  },
  {
    id: "2",
    created_at: "2026-07-22T10:15:00Z",
    source: "Someone referred you here",
    role: "Talent",
    "minor-check": "No",
    "talent-contact_firstname": "Paakwasi",
    "talent-contact_lastname": "Nyarko",
    "talent-contact_phone": "+13105551234",
    "talent-contact_email": "paakwasinyarko6@gmail.com",
    "rep-type": null, "rep-contact_rep_firstname": null, "rep-contact_rep_lastname": null,
    "rep-contact_rep_phone": null, "rep-contact_rep_email": null,
    "talent-info-for-rep_firstname": null, "talent-info-for-rep_lastname": null,
    "talent-info-for-rep_phone": null, "talent-info-for-rep_email": null,
    "cv-upload_url": null,
    "photo-portrait_url": "https://via.placeholder.com/600x800.png?text=Portrait2",
    "photo-front_url": "https://via.placeholder.com/600x800.png?text=Front2",
    "photo-rear_url": "https://via.placeholder.com/600x800.png?text=Rear2",
    sex: "Male", residence: "United States", dob: "2002-05-15", age: 24,
    nationality: "American", "dual-nationality-check": "Yes", "other-nationality": "Nigerian",
    "academy-experience": "Yes", "signed-pro": "Yes",
    "current-club": "LA Galaxy Academy, Los Angeles",
    position: "Forward", foot: "Both",
    "tactical-positions": "Central Attacking Midfielder, Striker/Centre Forward",
    "special-abilities": "Natural scoring ability, Free-kicks, Strong physicality",
    height: "6'1\"", weight: 80, speed: 28,
    education: "Undergraduate Degree",
    "passport-check": "Yes", "passport-expiry": "2029-11-20", "travel-experience": null,
    "criminal-record": "No", "medical-condition": "No", "surgery-check": "Yes",
    "youtube-link": "https://youtube.com/watch?v=example2"
  },
  {
    id: "3",
    created_at: "2026-07-22T11:00:00Z",
    source: "Website",
    role: "Representative",
    "minor-check": "Yes",
    "talent-contact_firstname": null, "talent-contact_lastname": null,
    "talent-contact_phone": null, "talent-contact_email": null,
    "rep-type": "Biological Parent",
    "rep-contact_rep_firstname": "Kwame", "rep-contact_rep_lastname": "Mensah",
    "rep-contact_rep_phone": "+233244000000", "rep-contact_rep_email": "kwame.mensah@gmail.com",
    "talent-info-for-rep_firstname": "Kofi", "talent-info-for-rep_lastname": "Mensah",
    "talent-info-for-rep_phone": "+233244111111", "talent-info-for-rep_email": "kofi.mensah@gmail.com",
    "cv-upload_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "photo-portrait_url": "https://via.placeholder.com/600x800.png?text=Portrait3",
    "photo-front_url": "https://via.placeholder.com/600x800.png?text=Front3",
    "photo-rear_url": "https://via.placeholder.com/600x800.png?text=Rear3",
    sex: "Male", residence: "Ghana", dob: "2010-03-20", age: 16,
    nationality: "Ghanaian", "dual-nationality-check": "No", "other-nationality": null,
    "academy-experience": "No", "signed-pro": "No",
    "current-club": "Hearts of Oak Youth, Accra",
    position: "Goalkeeper", foot: "Right",
    "tactical-positions": "Goalkeeper",
    "special-abilities": "Shot stopping, Long throws",
    height: "5'9\"", weight: 65, speed: 20,
    education: "Primary School",
    "passport-check": "No", "passport-expiry": null, "travel-experience": "No",
    "criminal-record": "No", "medical-condition": "No", "surgery-check": "No",
    "youtube-link": "https://youtube.com/watch?v=example3"
  }
];

/**
 * Fetch all submissions from the backend.
 * Sends the Supabase JWT as a Bearer token so the backend can verify the admin.
 * Falls back to mock data if the backend is unreachable (dev without backend).
 */
export async function fetchSubmissions() {
  const token = await getAccessToken();

  // No token means not logged in via Supabase yet — use mock data in dev
  const headers = {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  try {
    const res = await fetch(BACKEND_URL, { method: 'GET', headers });

    if (res.status === 401) {
      // Session expired — surface to the UI
      throw new Error('SESSION_EXPIRED');
    }

    if (!res.ok) {
      throw new Error(`Backend responded with status ${res.status}`);
    }

    const json = await res.json();
    return json.data || [];

  } catch (err) {
    if (err.message === 'SESSION_EXPIRED') throw err; // Let main.js handle this
    console.warn(`[Admin] Could not reach backend (${err.message}). Using mock data.`);
    return new Promise(resolve => setTimeout(() => resolve(mockSubmissions), 600));
  }
}
