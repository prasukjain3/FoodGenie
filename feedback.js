import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('feedback-form');
  const resultDiv = document.getElementById('feedback-result');

  // Logout button logic
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

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-display-name').textContent = user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const type = document.getElementById('feedback-type').value;
      const feedback = document.getElementById('feedback-message').value.trim();

      if (!type) {
        resultDiv.textContent = 'Please select a feedback type.';
        return;
      }
      if (!feedback) {
        resultDiv.textContent = 'Please enter your feedback.';
        return;
      }

      resultDiv.textContent = 'Submitting...';

      try {
        await addDoc(collection(db, 'feedback'), {
          type,
          feedback,
          userId: user.uid,
          email: user.email,
          createdAt: new Date()
        });
        resultDiv.textContent = 'Thank you for your feedback!';
        form.reset();
      } catch (error) {
        resultDiv.textContent = 'Failed to submit feedback. Please try again.';
        console.error('Error submitting feedback:', error);
      }
    });
  });
});
