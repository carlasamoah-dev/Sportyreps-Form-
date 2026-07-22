const FORMS = {
  "football-talent": {
    title: "Football Talent application",
    steps: [
      {
        id: "welcome",
        type: "welcome",
        title: "Your football journey starts here!",
        description: "You will need to upload your football CV and pictures in order to complete this form as well as your youtube link to your training videos, kindly have them ready before you proceed. Follow us on IG at https://www.instagram.com/sportyreps_/",
        buttonText: "Continue",
        showBackground: true
      },
      {
        id: "source",
        type: "multiple-choice",
        number: "1",
        question: "How did you find this link?",
        description: "Description (optional)",
        choices: ["Whatsapp", "Someone referred you here", "Website", "Google search", "Other Social media", "Other"],
        required: true
      },
      {
        id: "role",
        type: "multiple-choice",
        number: "2",
        question: "Are you a Talent or Representative?",
        choices: ["Talent", "Representative"],
        required: true,
        logic: {
          "Talent": "minor-check",
          "Representative": "rep-type"
        }
      },
      {
        id: "minor-check",
        type: "multiple-choice",
        number: "3",
        question: "Are you a minor(Under 18years)?",
        choices: ["Yes", "No"],
        required: true,
        logic: {
          "Yes": "ending-minor",
          "No": "talent-contact"
        }
      },
      {
        id: "talent-contact",
        type: "contact-info",
        number: "4",
        question: "Contact information(Talent)?",
        description: "Official name on your passport or government documents",
        fields: [
          { name: "firstname", label: "First name", type: "text", required: true },
          { name: "lastname", label: "Last name", type: "text", required: true },
          { name: "phone", label: "Phone number", type: "tel", required: true, isPhone: true },
          { name: "email", label: "Email", type: "email", required: true }
        ],
        nextStep: "cv-upload"
      },
      {
        id: "rep-type",
        type: "multiple-choice",
        number: "5",
        question: "What type of representative are you?",
        description: "You will need to complete the form on behalf of Talent",
        choices: [
          "Biological Parent",
          "Adopted parent",
          "Guardian",
          "Immediate familiy relative",
          "Extended familiy relative",
          "Professional contact",
          "Friend",
          "Other"
        ],
        required: true
      },
      {
        id: "rep-contact",
        type: "contact-info",
        number: "6",
        question: "Contact information (Representative)?",
        description: "Please enter your own contact details",
        fields: [
          { name: "rep_firstname", label: "First name", type: "text", required: true },
          { name: "rep_lastname", label: "Last name", type: "text", required: true },
          { name: "rep_phone", label: "Phone number", type: "tel", required: true, isPhone: true },
          { name: "rep_email", label: "Email", type: "email", required: true }
        ]
      },
      {
        id: "talent-info-for-rep",
        type: "contact-info",
        number: "7",
        question: "What's your talents contact information?",
        description: "Please enter details of the player you represent",
        fields: [
          { name: "firstname", label: "First name", type: "text", required: true },
          { name: "lastname", label: "Last name", type: "text", required: true },
          { name: "phone", label: "Phone number", type: "tel", required: true, isPhone: true },
          { name: "email", label: "Email", type: "email", required: true }
        ],
        nextStep: "cv-upload"
      },
      {
        id: "cv-upload",
        type: "file-upload",
        number: "8",
        question: "Please attach your football CV if applicable(pdf format E.g Smith-CV)",
        description: "Kindly create this to show the different clubs that have trained you and have played for. Having played for one club is fine, kindly state dates on CV, please get some help if you are unsure on how to create one. If you have no club, upload document saying no club on a blank sheet.",
        accept: ".pdf",
        required: false
      },
      {
        id: "photo-portrait",
        type: "file-upload",
        number: "9a",
        parentGroupNumber: "9",
        parentGroupTitle: "Please upload your portrait, full front view picture, and full rear view picture...",
        question: "Please attach your portrait picture",
        description: "E.g If your surname is Smith, kindly save pictures as Smith-portrait",
        accept: "image/*",
        required: true,
        showSplitLayout: true,
        image: "assets/talent.png"
      },
      {
        id: "photo-front",
        type: "file-upload",
        number: "9b",
        parentGroupNumber: "9",
        parentGroupTitle: "Please upload your portrait, full front view picture, and full rear view picture...",
        question: "Please attach your full front view picture",
        description: "E.g If your surname is Smith, kindly save pictures as Smith-front",
        accept: "image/*",
        required: true,
        showSplitLayout: true,
        image: "assets/talent.png"
      },
      {
        id: "photo-rear",
        type: "file-upload",
        number: "9c",
        parentGroupNumber: "9",
        parentGroupTitle: "Please upload your portrait, full front view picture, and full rear view picture...",
        question: "Please attach your full rear-view picture",
        description: "E.g If your surname is Smith, kindly save pictures as Smith-rear",
        accept: "image/*",
        required: true,
        showSplitLayout: true,
        image: "assets/talent.png"
      },
      {
        id: "sex",
        type: "multiple-choice",
        number: "10",
        question: "What is your sex (Talent)?",
        choices: ["Male", "Female", "Prefer not to say"],
        required: true
      },
      {
        id: "residence",
        type: "country",
        number: "11",
        question: "What is your country of permanent/current residence (Talent)?",
        placeholder: "Search or select a country...",
        required: true
      },
      {
        id: "dob",
        type: "date",
        number: "12",
        question: "What's your date of birth?",
        required: true
      },
      {
        id: "age",
        type: "number",
        number: "13",
        question: "How old are you E.g. 18?",
        min: 1,
        max: 120,
        required: true
      },
      {
        id: "nationality",
        type: "text",
        number: "14",
        question: "What is your current nationality?",
        placeholder: "E.g. British",
        required: true
      },
      {
        id: "dual-nationality-check",
        type: "multiple-choice",
        number: "15",
        question: "Do you have dual nationality?",
        choices: ["Yes", "No"],
        required: true,
        logic: {
          "Yes": "other-nationality",
          "No": "academy-experience"
        }
      },
      {
        id: "other-nationality",
        type: "text",
        number: "16",
        question: "What is your other nationality?",
        placeholder: "E.g. Nigerian",
        required: true
      },
      {
        id: "academy-experience",
        type: "multiple-choice",
        number: "17",
        question: "Do you have football academy experience?",
        choices: ["Yes", "No"],
        required: true
      },
      {
        id: "signed-pro",
        type: "multiple-choice",
        number: "18",
        question: "Are you a signed professional footballer?",
        choices: ["Yes", "No"],
        required: true
      },
      {
        id: "height",
        type: "text",
        number: "19",
        question: "What is your height in feet?",
        placeholder: "E.g. 6'1\"",
        required: true
      },
      {
        id: "weight",
        type: "number",
        number: "20",
        question: "What is your weight in Kilograms?",
        min: 20,
        max: 200,
        required: true
      },
      {
        id: "position",
        type: "multiple-choice",
        number: "21",
        question: "What position do you play?",
        choices: ["Goalkeeper", "Defender", "Midfielder", "Forward"],
        required: true
      },
      {
        id: "foot",
        type: "multiple-choice",
        number: "22",
        question: "Preferred foot of play?",
        choices: ["Right", "Left", "Both"],
        required: true
      },
      {
        id: "tactical-positions",
        type: "text",
        number: "23",
        question: "What is/are your preferred tactical position(s) on the field of play?",
        placeholder: "E.g. Left Winger / Striker",
        required: true
      },
      {
        id: "special-abilities",
        type: "text",
        number: "24",
        question: "What is/are your special ability(ies)?",
        placeholder: "E.g. Speed, dribbling, set-pieces...",
        required: true
      },
      {
        id: "speed",
        type: "number",
        number: "25",
        question: "What is your average speed (mph-miles per hour)?",
        min: 1,
        max: 30,
        required: true
      },
      {
        id: "education",
        type: "multiple-choice",
        number: "26",
        question: "Highest level of formal education?",
        choices: ["Primary School", "High School / Secondary", "Undergraduate Degree", "Postgraduate Degree", "None / Other"],
        required: true
      },
      {
        id: "passport-check",
        type: "multiple-choice",
        number: "27",
        question: "Do you have a passport?",
        choices: ["Yes", "No"],
        required: true,
        logic: {
          "Yes": "passport-expiry",
          "No": "travel-experience"
        }
      },
      {
        id: "passport-expiry",
        type: "date",
        number: "28",
        question: "When does your passport expire?",
        required: true
      },
      {
        id: "travel-experience",
        type: "multiple-choice",
        number: "29",
        question: "Do you have international travel experience?",
        choices: ["Yes", "No"],
        required: true
      },
      {
        id: "current-club",
        type: "text",
        number: "30",
        question: "What is your current club and location?",
        placeholder: "E.g. Arsenal FC Academy, London",
        required: true
      },
      {
        id: "medical-condition",
        type: "multiple-choice",
        number: "31",
        question: "Do you have any football-related medical condition?",
        choices: ["Yes", "No"],
        required: true
      },
      {
        id: "surgery-check",
        type: "multiple-choice",
        number: "32",
        question: "Have you had football related surgery in the past 10 years?",
        choices: ["Yes", "No"],
        required: true
      },
      {
        id: "criminal-record",
        type: "multiple-choice",
        number: "33",
        question: "Do you have a criminal record?",
        choices: ["Yes", "No"],
        required: true
      },
      {
        id: "youtube-link",
        type: "url",
        number: "34",
        question: "Please share youtube video link showing your gameplay",
        placeholder: "https://www.youtube.com/watch?v=...",
        required: true,
        nextStep: "ending-success"
      }
    ],
    endings: {
      "ending-minor": {
        title: "Additional Representative Needed",
        description: "If you are a minor you will need an adult representative to complete this form for you. Please ask them to fill out this form on your behalf."
      },
      "ending-success": {
        title: "Thank you for completing this form!",
        description: "We will be in touch! Follow us on IG at https://www.instagram.com/sportyreps_/"
      }
    }
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { FORMS };
}
