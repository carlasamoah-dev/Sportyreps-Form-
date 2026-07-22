// We use mock data for testing as requested.
// Later, this can be replaced with a real fetch call to the backend.

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
    sex: "Male",
    residence: "United Kingdom",
    dob: "2000-01-01",
    age: 26,
    nationality: "Ghanaian",
    "dual-nationality-check": "No",
    "academy-experience": "Yes",
    "signed-pro": "No",
    height: "180",
    weight: 75,
    position: "Midfielder",
    foot: "Right",
    "tactical-positions": "Right Back, Right Winger, Left Winger, Left Back",
    "special-abilities": "Corner kicks, Long ball, High Interceptions",
    speed: 25,
    education: "High School",
    "passport-check": "Yes",
    "current-club": "Accra Lions",
    "medical-condition": "No",
    "surgery-check": "No",
    "criminal-record": "No",
    "youtube-link": "https://youtube.com/watch?v=123",
    "cv-upload_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "photo-portrait_url": "https://via.placeholder.com/600x800.png?text=Portrait",
    "photo-front_url": "https://via.placeholder.com/600x800.png?text=Front",
    "photo-rear_url": "https://via.placeholder.com/600x800.png?text=Rear"
  },
  {
    id: "2",
    created_at: "2026-07-22T10:15:00Z",
    source: "Someone referred you here",
    role: "Talent",
    "minor-check": "No",
    "talent-contact_firstname": "Paakwasi",
    "talent-contact_lastname": "Nyarko",
    "talent-contact_phone": "+447700900001",
    "talent-contact_email": "paakwasinyarko6@gmail.com",
    sex: "Male",
    residence: "United States",
    dob: "2002-05-15",
    age: 24,
    nationality: "American",
    "dual-nationality-check": "Yes",
    "other-nationality": "Nigerian",
    "academy-experience": "Yes",
    "signed-pro": "Yes",
    height: "185",
    weight: 80,
    position: "Forward",
    foot: "Both",
    "tactical-positions": "Central Attacking Midfielder, Striker/Centre Forward",
    "special-abilities": "Natural scoring ability, Free-kicks, Strong physicality",
    speed: 28,
    education: "University",
    "passport-check": "Yes",
    "current-club": "LA Galaxy Academy",
    "medical-condition": "No",
    "surgery-check": "Yes",
    "criminal-record": "No",
    "youtube-link": "https://youtube.com/watch?v=abc",
    "cv-upload_url": null,
    "photo-portrait_url": "https://via.placeholder.com/600x800.png?text=Portrait2",
    "photo-front_url": "https://via.placeholder.com/600x800.png?text=Front2",
    "photo-rear_url": "https://via.placeholder.com/600x800.png?text=Rear2"
  }
];

export async function fetchSubmissions() {
  // Simulate network delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockSubmissions);
    }, 800);
  });
}
