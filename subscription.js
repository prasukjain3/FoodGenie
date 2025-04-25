import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB1jZkKqt637U1FdXMjazlBgGaQ_ByT8yQ",
  authDomain: "foodgenie-fg.firebaseapp.com",
  projectId: "foodgenie-fg",
  storageBucket: "foodgenie-fg.appspot.com",
  messagingSenderId: "775633814963",
  appId: "1:775633814963:web:eb6e5b4d0e2dac9923f7c6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const steps = [
  // 0: Goal
  { key: "goal", type: "button", required: true },
  // 1: Gender
  { key: "gender", type: "radio", required: true },
  // 2: Age/Height/Weight
  { key: "age", type: "number", required: true },
  { key: "height", type: "number", required: true },
  { key: "weight", type: "number", required: true },
  // 3: Diet Type
  { key: "dietType", type: "button", required: true },
  // 4: Meals/Days
  { key: "mealsPerDay", type: "number", required: true },
  { key: "subscriptionDays", type: "number", required: true },
  // 5: Allergies/Notes
  { key: "allergies", type: "text", required: false },
  { key: "notes", type: "text", required: false }
];

let wizardStep = 0;
let wizardData = {};

function showStep(step) {
  // Hide all steps
  for (let i = 0; i <= 6; i++) {
    document.getElementById(`step-${i}`).classList.remove('active');
  }
  document.getElementById(`step-${step}`).classList.add('active');
  document.getElementById('wizard-progress').textContent = `Step ${step + 1} of 7`;

  // Back button
  document.getElementById('back-btn').disabled = (step === 0);
  // Next button
  document.getElementById('next-btn').style.display = (step === 6) ? 'none' : 'inline-block';

  // Pre-fill values for steps 2, 4, 5
  if (step === 2) {
    document.getElementById('age').value = wizardData.age || '';
    document.getElementById('height').value = wizardData.height || '';
    document.getElementById('weight').value = wizardData.weight || '';
  }
  if (step === 4) {
    document.getElementById('meals-per-day').value = wizardData.mealsPerDay || 3;
    document.getElementById('subscription-days').value = wizardData.subscriptionDays || 7;
  }
  if (step === 5) {
    document.getElementById('allergies').value = wizardData.allergies || '';
    document.getElementById('notes').value = wizardData.notes || '';
  }
  if (step === 6) {
    // Review step
    let summary = `
      <b>Goal:</b> ${prettyGoal(wizardData.goal)}<br>
      <b>Gender:</b> ${wizardData.gender}<br>
      <b>Age:</b> ${wizardData.age} years<br>
      <b>Height:</b> ${wizardData.height} cm<br>
      <b>Weight:</b> ${wizardData.weight} kg<br>
      <b>Diet Type:</b> ${prettyDiet(wizardData.dietType)}<br>
      <b>Meals/Day:</b> ${wizardData.mealsPerDay}<br>
      <b>Days:</b> ${wizardData.subscriptionDays}<br>
      <b>Allergies:</b> ${wizardData.allergies || 'None'}<br>
      <b>Notes:</b> ${wizardData.notes || 'None'}
    `;
    document.getElementById('wizard-summary').innerHTML = summary;
  }
}

function prettyGoal(goal) {
  return ({
    "lose-weight": "Lose Weight",
    "healthy-eating": "Healthy Eating",
    "gain-weight": "Gain Weight"
  })[goal] || goal;
}
function prettyDiet(diet) {
  return diet ? diet.charAt(0).toUpperCase() + diet.slice(1) : diet;
}

function validateStep(step) {
  // Step 0: Goal
  if (step === 0 && !wizardData.goal) return false;
  // Step 1: Gender
  if (step === 1 && !wizardData.gender) return false;
  // Step 2: Age, Height, Weight
  if (step === 2) {
    const age = document.getElementById('age').value;
    const height = document.getElementById('height').value;
    const weight = document.getElementById('weight').value;
    if (!age || !height || !weight) return false;
    wizardData.age = parseInt(age);
    wizardData.height = parseInt(height);
    wizardData.weight = parseInt(weight);
  }
  // Step 3: Diet Type
  if (step === 3 && !wizardData.dietType) return false;
  // Step 4: Meals/Days
  if (step === 4) {
    const meals = document.getElementById('meals-per-day').value;
    const days = document.getElementById('subscription-days').value;
    if (!meals || !days) return false;
    wizardData.mealsPerDay = parseInt(meals);
    wizardData.subscriptionDays = parseInt(days);
  }
  // Step 5: Allergies/Notes
  if (step === 5) {
    wizardData.allergies = document.getElementById('allergies').value;
    wizardData.notes = document.getElementById('notes').value;
  }
  return true;
}

function handleWizardBtns() {
  // Step 0: Goal
  document.querySelectorAll('#step-0 .wizard-btn').forEach(btn => {
    btn.onclick = () => {
      wizardData.goal = btn.dataset.value;
      document.querySelectorAll('#step-0 .wizard-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
  });
  // Step 3: Diet Type
  document.querySelectorAll('#step-3 .wizard-btn').forEach(btn => {
    btn.onclick = () => {
      wizardData.dietType = btn.dataset.value;
      document.querySelectorAll('#step-3 .wizard-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
  });
  // Step 1: Gender
  document.querySelectorAll('#step-1 input[name="gender"]').forEach(radio => {
    radio.onchange = () => {
      wizardData.gender = radio.value;
    };
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Logout functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        window.location.href = 'login.html';
      } catch (error) {
        alert('Error signing out: ' + error.message);
      }
    });
  }

  // Auth and user info
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-display-name').textContent = getDisplayName(user.email);

    // Pre-fill diet type if available from mealPreferences
    try {
      const resp = await fetch(`https://firestore.googleapis.com/v1/projects/foodgenie-fg/databases/(default)/documents/users/${user.uid}/mealPreferences/latest`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.fields && data.fields.dietType) {
          wizardData.dietType = data.fields.dietType.stringValue;
        }
      }
    } catch (e) {}

    // Start wizard
    handleWizardBtns();
    showStep(wizardStep);

    document.getElementById('next-btn').onclick = () => {
      if (!validateStep(wizardStep)) {
        document.getElementById('wizard-result').textContent = "Please complete this step.";
        setTimeout(() => document.getElementById('wizard-result').textContent = "", 1500);
        return;
      }
      wizardStep++;
      showStep(wizardStep);
    };
    document.getElementById('back-btn').onclick = () => {
      if (wizardStep > 0) wizardStep--;
      showStep(wizardStep);
    };

    // Confirm & Save
    document.getElementById('confirm-btn').onclick = async () => {
      document.getElementById('wizard-result').textContent = "Saving...";
      try {
        await setDoc(doc(db, "users", user.uid, "subscription", "latest"), {
          ...wizardData,
          timestamp: new Date()
        });
        document.getElementById('wizard-result').textContent = "Subscription saved! Redirecting...";
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
      } catch (err) {
        document.getElementById('wizard-result').textContent = "Error: " + err.message;
      }
    };
  });
});

function getDisplayName(email) {
  if (!email) return 'User';
  return email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
}
