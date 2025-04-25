import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful! 🎉");
      window.location.href = "dashboard.html";
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });
});
// Add a listener to the "Register" button
const registerButton = document.getElementById("register-button");
if (registerButton) {
  registerButton.addEventListener("click", () => {
    window.location.href = "register.html";
  });
}