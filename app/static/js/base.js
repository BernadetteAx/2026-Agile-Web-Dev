const loginLink  = document.getElementById('login-icon-link');
const overlay    = document.getElementById('logout-overlay');
const confirmBtn = document.getElementById('logout-confirm');
const cancelBtn  = document.getElementById('logout-cancel');

loginLink.addEventListener('click', function (e) {
  e.preventDefault();
  overlay.classList.add('active');
});

confirmBtn.addEventListener('click', async function () {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
});

cancelBtn.addEventListener('click', function () {
  overlay.classList.remove('active');
});

overlay.addEventListener('click', function (e) {
  if (e.target === overlay) overlay.classList.remove('active');
});