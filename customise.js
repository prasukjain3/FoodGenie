import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("meal-customisation-form");
  const resultDiv = document.getElementById("result");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dietType = document.getElementById("dietType").value;
    const allergies = Array.from(document.querySelectorAll('input[name="allergies"]:checked')).map(cb => cb.value);
    const cuisines = Array.from(document.querySelectorAll('input[name="cuisines"]:checked')).map(cb => cb.value);

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        resultDiv.textContent = "Please login to save your preferences.";
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
      } catch (err) {
        resultDiv.textContent = "Error saving preferences: " + err.message;
      }
    });
  });
});
