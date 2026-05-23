const csrfMeta = document.querySelector('meta[name="csrf-token"]');
const csrfToken = csrfMeta ? csrfMeta.getAttribute("content") : "";
const originalFetch = window.fetch.bind(window);

window.fetch = function (resource, options = {}) {
  const requestUrl = resource instanceof Request ? resource.url : resource;
  const requestMethod = (
    options.method ||
    (resource instanceof Request ? resource.method : "GET")
  ).toUpperCase();
  const url = new URL(requestUrl, window.location.origin);

  if (
    csrfToken &&
    url.origin === window.location.origin &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(requestMethod)
  ) {
    const headers = new Headers(
      options.headers ||
      (resource instanceof Request ? resource.headers : undefined)
    );
    headers.set("X-CSRFToken", csrfToken);
    return originalFetch(resource, { ...options, headers });
  }

  return originalFetch(resource, options);
};

window.currentUserReady = (async function () {
  try {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      const data = await response.json();
      window.currentUserId = data.id;
      return window.currentUserId;
    }
  } catch (error) {
    console.error('Failed to fetch user:', error);
  }
  window.currentUserId = null;
  return null;
})();

document.addEventListener("DOMContentLoaded", function () {
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
});
