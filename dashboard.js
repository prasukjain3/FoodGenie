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

function getNextDeliveryDate(timestamp, days) {
  if (!timestamp || !days) return "-";
  const date = new Date(timestamp.toDate ? timestamp.toDate() : timestamp);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getMealDetails(dietType, mealsPerDay = 3) {
  const mealDetails = {
    'vegetarian': {
      name: 'Vegetarian Balanced Meal',
      calories: 450,
      macros: 'Protein 18g | Carbs 55g | Fats 15g'
    },
    'vegan': {
      name: 'Plant-Powered Meal',
      calories: 430,
      macros: 'Protein 15g | Carbs 60g | Fats 13g'
    },
    'keto': {
      name: 'Keto Fuel Meal',
      calories: 480,
      macros: 'Protein 25g | Carbs 10g | Fats 35g'
    },
    'regular': {
      name: 'Classic Balanced Meal',
      calories: 500,
      macros: 'Protein 22g | Carbs 50g | Fats 18g'
    }
  };
  const meal = mealDetails[dietType?.toLowerCase()] || mealDetails.regular;
  return {
    name: `${mealsPerDay}x ${meal.name}`,
    calories: `${meal.calories * mealsPerDay} kcal`,
    macros: meal.macros
  };
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

  // Logout
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
      window.location.href = "login.html";
      return;
    }
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-display-name').textContent =
      user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);

    try {
      const prefDoc = await getDoc(doc(db, "users", user.uid, "mealPreferences", "latest"));
      const subDoc = await getDoc(doc(db, "users", user.uid, "subscription", "latest"));

      let dietType = "regular";
      let mealsPerDay = 3;
      let allergies = "None";
      let cuisines = "No preferences";
      let plan = "Standard Plan";
      let price = "₹0";
      let duration = "7 days";
      let delivery = "-";
      let mealName = "Loading...";
      let calories = "Loading...";
      let macros = "Loading...";

      if (prefDoc.exists()) {
        const prefData = prefDoc.data();
        dietType = prefData.dietType || dietType;
        allergies = prefData.allergies?.join(', ') || allergies;
        cuisines = prefData.preferredCuisines?.join(', ') || cuisines;
      }

      if (subDoc.exists()) {
        const subData = subDoc.data();
        plan = subData.goal ? `${subData.goal.replace(/-/g, ' ')} Plan` : plan;
        price = `₹${subData.price?.toLocaleString("en-IN") || '0'}`;
        mealsPerDay = subData.mealsPerDay || mealsPerDay;
        duration = `${subData.subscriptionDays || 7} days`;
        delivery = getNextDeliveryDate(subData.timestamp, subData.subscriptionDays);
      }

      const mealInfo = getMealDetails(dietType, mealsPerDay);
      mealName = mealInfo.name;
      calories = mealInfo.calories;
      macros = mealInfo.macros;

      document.getElementById('subscription-plan').textContent = plan;
      document.getElementById('diet-type').textContent = dietType;
      document.getElementById('allergies').textContent = allergies;
      document.getElementById('preferred-cuisines').textContent = cuisines;
      document.getElementById('meal-name').textContent = mealName;
      document.getElementById('calories').textContent = calories;
      document.getElementById('macros').textContent = macros;
      document.getElementById('subscription-delivery').textContent = delivery;
      document.getElementById('subscription-meals').textContent = mealsPerDay;
      document.getElementById('subscription-duration').textContent = duration;
      document.getElementById('subscription-price').textContent = price;

    } catch (error) {
      console.error("Error loading data:", error);
    }
  });
});
