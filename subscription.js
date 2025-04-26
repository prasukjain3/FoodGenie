import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

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

let wizardStep = 0;
let wizardData = {};

function getPerMealPrice(mealsPerDay, days, dietType) {
  let base = 232;
  if (days >= 14) base = 188;
  else if (days >= 4) base = 209;
  if (['keto', 'vegan', 'high-protein'].includes((dietType || '').toLowerCase())) {
    base = Math.round(base * 1.1);
  }
  return base;
}
function calcTotalPrice(mealsPerDay, days, dietType) {
  const perMeal = getPerMealPrice(mealsPerDay, days, dietType);
  return perMeal * mealsPerDay * days;
}
function showStep(step) {
  for (let i = 0; i <= 6; i++) {
    document.getElementById(`step-${i}`).classList.remove('active');
  }
  document.getElementById(`step-${step}`).classList.add('active');
  document.getElementById('wizard-progress').textContent = `Step ${step + 1} of 7`;
  document.getElementById('back-btn').disabled = (step === 0);
  document.getElementById('next-btn').style.display = (step === 6) ? 'none' : 'inline-block';
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
    const price = calcTotalPrice(
      wizardData.mealsPerDay || 3,
      wizardData.subscriptionDays || 7,
      wizardData.dietType
    );
    document.getElementById('wizard-price').textContent = "₹" + price.toLocaleString("en-IN");
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
  if (step === 0 && !wizardData.goal) return false;
  if (step === 1 && !wizardData.gender) return false;
  if (step === 2) {
    const age = document.getElementById('age').value;
    const height = document.getElementById('height').value;
    const weight = document.getElementById('weight').value;
    if (!age || !height || !weight) return false;
    wizardData.age = parseInt(age);
    wizardData.height = parseInt(height);
    wizardData.weight = parseInt(weight);
  }
  if (step === 3 && !wizardData.dietType) return false;
  if (step === 4) {
    const meals = document.getElementById('meals-per-day').value;
    const days = document.getElementById('subscription-days').value;
    if (!meals || !days) return false;
    wizardData.mealsPerDay = parseInt(meals);
    wizardData.subscriptionDays = parseInt(days);
  }
  if (step === 5) {
    wizardData.allergies = document.getElementById('allergies').value;
    wizardData.notes = document.getElementById('notes').value;
  }
  return true;
}
function handleWizardBtns() {
  document.querySelectorAll('#step-0 .wizard-btn').forEach(btn => {
    btn.onclick = () => {
      wizardData.goal = btn.dataset.value;
      document.querySelectorAll('#step-0 .wizard-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
  });
  document.querySelectorAll('#step-3 .wizard-btn').forEach(btn => {
    btn.onclick = () => {
      wizardData.dietType = btn.dataset.value;
      document.querySelectorAll('#step-3 .wizard-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
  });
  document.querySelectorAll('#step-1 input[name="gender"]').forEach(radio => {
    radio.onchange = () => {
      wizardData.gender = radio.value;
    };
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Hamburger/collapsible sidebar logic
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger-btn');
  const closeSidebar = document.getElementById('close-sidebar');
  hamburger.onclick = () => sidebar.classList.add('collapsed');
  closeSidebar.onclick = () => sidebar.classList.remove('collapsed');
  document.querySelectorAll('.sidebar a').forEach(link => {
    link.onclick = () => sidebar.classList.remove('collapsed');
  });

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

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    document.getElementById('user-email').textContent = user.email;
    try {
      const prefDoc = await getDoc(doc(db, "users", user.uid, "mealPreferences", "latest"));
      if (prefDoc.exists()) {
        wizardData.dietType = prefDoc.data().dietType;
      }
    } catch (e) {}

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
    document.getElementById('confirm-btn').onclick = async () => {
      document.getElementById('wizard-result').textContent = "Saving...";
      try {
        await setDoc(doc(db, "users", user.uid, "subscription", "latest"), {
          ...wizardData,
          price: calcTotalPrice(
            wizardData.mealsPerDay || 3,
            wizardData.subscriptionDays || 7,
            wizardData.dietType
          ),
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
