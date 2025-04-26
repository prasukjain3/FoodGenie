import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateProfile, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

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

document.addEventListener('DOMContentLoaded', () => {
  const accountForm = document.getElementById('account-form');
  const accountResult = document.getElementById('account-result');
  const resetBtn = document.getElementById('reset-password');
  const resetResult = document.getElementById('reset-result');

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
    document.getElementById('user-display-name').textContent =
      user.displayName || user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);

    document.getElementById('account-email').value = user.email;
    document.getElementById('display-name').value = user.displayName || '';

    accountForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const displayName = document.getElementById('display-name').value.trim();
      accountResult.textContent = 'Updating...';
      try {
        await updateProfile(user, { displayName });
        document.getElementById('user-display-name').textContent = displayName || user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);
        accountResult.textContent = 'Profile updated successfully!';
      } catch (error) {
        accountResult.textContent = 'Failed to update profile.';
      }
    });

    resetBtn.addEventListener('click', async () => {
      resetResult.textContent = 'Sending reset email...';
      try {
        await sendPasswordResetEmail(auth, user.email);
        resetResult.textContent = 'Password reset email sent!';
      } catch (error) {
        resetResult.textContent = 'Failed to send reset email.';
      }
    });
  });
});
