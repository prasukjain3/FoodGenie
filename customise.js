import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", () => {
  // Hamburger/collapsible sidebar logic
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger-btn');
  const closeSidebar = document.getElementById('close-sidebar');
  hamburger.onclick = () => sidebar.classList.add('collapsed');
  closeSidebar.onclick = () => sidebar.classList.remove('collapsed');
  document.querySelectorAll('.sidebar a').forEach(link => {
    link.onclick = () => sidebar.classList.remove('collapsed');
  });

  const form = document.getElementById("meal-customisation-form");
  const resultDiv = document.getElementById("result");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    document.getElementById('user-email').textContent = user.email;

    // Prefill previous preferences if they exist
    try {
      const prefDoc = await getDoc(doc(db, "users", user.uid, "mealPreferences", "latest"));
      if (prefDoc.exists()) {
        const pref = prefDoc.data();
        document.getElementById("dietType").value = pref.dietType || "regular";
        (pref.allergies || []).forEach(val => {
          const cb = document.querySelector(`input[name="allergies"][value="${val}"]`);
          if (cb) cb.checked = true;
        });
        (pref.preferredCuisines || []).forEach(val => {
          const cb = document.querySelector(`input[name="cuisines"][value="${val}"]`);
          if (cb) cb.checked = true;
        });
      }
    } catch (e) {}

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const dietType = document.getElementById("dietType").value;
      const allergies = Array.from(document.querySelectorAll('input[name="allergies"]:checked')).map(cb => cb.value);
      const cuisines = Array.from(document.querySelectorAll('input[name="cuisines"]:checked')).map(cb => cb.value);

      if (cuisines.length === 0) {
        resultDiv.textContent = "Please select at least one cuisine.";
        return;
      }

      try {
        await setDoc(doc(db, "users", user.uid, "mealPreferences", "latest"), {
          dietType,
          allergies,
          preferredCuisines: cuisines,
          timestamp: new Date()
        });
        resultDiv.textContent = "Preferences saved successfully! 🎉";
        setTimeout(() => resultDiv.textContent = "", 2000);
      } catch (err) {
        resultDiv.textContent = "Error saving preferences: " + err.message;
      }
    });
  });
});
