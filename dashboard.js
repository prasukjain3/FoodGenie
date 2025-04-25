import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

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

function getNextDeliveryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
}

function getMealDetails(dietType) {
  const mealDetails = {
    'vegetarian': { calories: '450 kcal', macros: 'Protein 18g | Carbs 55g | Fats 15g' },
    'vegan': { calories: '430 kcal', macros: 'Protein 15g | Carbs 60g | Fats 13g' },
    'keto': { calories: '480 kcal', macros: 'Protein 25g | Carbs 10g | Fats 35g' },
    'regular': { calories: '500 kcal', macros: 'Protein 22g | Carbs 50g | Fats 18g' }
  };
  return mealDetails[dietType] || { calories: '450 kcal', macros: 'Protein 20g | Carbs 50g | Fats 15g' };
}

function getDisplayName(email) {
  if (!email) return 'User';
  return email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
}

document.addEventListener('DOMContentLoaded', () => {
  // LOGOUT FUNCTIONALITY
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

  // DASHBOARD DATA
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-display-name').textContent = getDisplayName(user.email);
    document.getElementById('next-delivery').textContent = getNextDeliveryDate();

    try {
      const prefDoc = await getDoc(doc(db, "users", user.uid, "mealPreferences", "latest"));
      if (prefDoc.exists()) {
        const pref = prefDoc.data();
        document.getElementById('plan-type').textContent = pref.dietType ? pref.dietType.charAt(0).toUpperCase() + pref.dietType.slice(1) : 'Standard';
        document.getElementById('diet-type').textContent = pref.dietType || 'Not set';
        document.getElementById('allergies').textContent = (pref.allergies && pref.allergies.length > 0) ? pref.allergies.join(', ') : 'None';
        document.getElementById('preferred-cuisines').textContent = (pref.preferredCuisines && pref.preferredCuisines.length > 0) ? pref.preferredCuisines.join(', ') : 'No preferences set';
        document.getElementById('subscription-status').textContent = 'Active';
        const cuisine = (pref.preferredCuisines && pref.preferredCuisines.length > 0) ? pref.preferredCuisines[0] : '';
        document.getElementById('meal-name').textContent = cuisine ? `${cuisine.charAt(0).toUpperCase() + cuisine.slice(1)} ${pref.dietType} Bowl` : `${pref.dietType ? pref.dietType.charAt(0).toUpperCase() + pref.dietType.slice(1) : 'Standard'} Meal`;
        const mealDetails = getMealDetails(pref.dietType);
        document.getElementById('calories').textContent = mealDetails.calories;
        document.getElementById('macros').textContent = mealDetails.macros;
      } else {
        document.getElementById('plan-type').textContent = 'Standard';
        document.getElementById('diet-type').textContent = 'Not set';
        document.getElementById('allergies').textContent = 'None';
        document.getElementById('preferred-cuisines').textContent = 'No preferences set';
        document.getElementById('subscription-status').textContent = 'Inactive';
        document.getElementById('meal-name').textContent = 'Standard Meal';
        document.getElementById('calories').textContent = '450 kcal';
        document.getElementById('macros').textContent = 'Protein 20g | Carbs 50g | Fats 15g';
      }
    } catch (error) {
      alert("Error fetching preferences: " + error.message);
    }
  });
});
