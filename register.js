import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

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
  const form = document.getElementById("register-form");
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
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Registration successful! 🎉");
      window.location.href = "login.html";
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });
});
// Add a listener to the "Already have an account? Login here" link
const loginLink = document.getElementById("login-link");
if (loginLink) {
  loginLink.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "login.html";
  });
}