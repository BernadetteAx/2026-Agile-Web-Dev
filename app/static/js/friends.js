document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem(`friendsFirstVisit_${window.currentUserId}`) !== "false") {
    const popup = document.getElementById("instructions-popup");
    popup.classList.remove("hidden");
    popup.offsetHeight;
    popup.classList.add("show");
  }

  const searchInput = document.getElementById("searchInput");
  const friendsList = document.getElementById("friendsList");
  const searchDropdown = document.getElementById("searchDropdown");

  let friends = [];
  let searchTimeout = null;

  // live search dropdown
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim();
    clearTimeout(searchTimeout);

    if (!q) {
      hideDropdown();
      return;
    }

    searchTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
        const users = await res.json();
        showDropdown(users);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 300);
  });

  searchInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const q = searchInput.value.trim();
  if (!q) return;

  // try to find an exact match in the current dropdown
const items = searchDropdown.querySelectorAll(".dropdown-item:not(.dropdown-empty)");
  let matched = null;
  items.forEach(item => {
    if (item.querySelector(".dropdown-name").textContent === q.toUpperCase()) {
      matched = item.querySelector(".dropdown-name").textContent;
    }
  });

  if (matched) {
    addFriend(matched);
    searchInput.value = "";
    hideDropdown();
  } else {
    // no match in dropdown
    addFriend(q);
    searchInput.value = "";
    hideDropdown();
  }
});

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".panel-section")) hideDropdown();
  });

  function showDropdown(users) {
    searchDropdown.innerHTML = "";
    searchDropdown.classList.add("open");

    if (users.length === 0) {
      searchDropdown.innerHTML = `<div class="dropdown-item dropdown-empty">NO PLAYERS FOUND</div>`;
      return;
    }

    users.forEach(user => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.innerHTML = `
        <span class="dropdown-name">${user.username.toUpperCase()}</span>
        <span class="dropdown-wins">${user.wins} WINS</span>
      `;
      item.addEventListener("click", () => {
        addFriend(user.username);
        searchInput.value = "";
        hideDropdown();
      });
      searchDropdown.appendChild(item);
    });
  }

  function hideDropdown() {
    searchDropdown.classList.remove("open");
    searchDropdown.innerHTML = "";
  }

  // friends list
  function renderFriends() {
    friendsList.innerHTML = "";
    if (friends.length === 0) {
      friendsList.innerHTML = `<div class="no-results" style="display:block;">NO FRIENDS ADDED</div>`;
      return;
    }
    friends.forEach(friend => {
      const div = document.createElement("div");
      div.className = "row-item";
      div.innerHTML = `
        <span class="friend-name">${friend.name.toUpperCase()}</span>
        <span class="friend-score">${friend.wins} WINS</span>
      `;
      friendsList.appendChild(div);
    });
  }

  function loadFriends() {
    fetch("/api/friends")
      .then(res => res.json())
      .then(data => {
        friends = data;
        renderFriends();
      });
  }

  function addFriend(name) {
    fetch("/api/add-friend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
      if (status !== 200) {
        showPopup("ERROR", body.error || "Something went wrong");
        return;
      }
      loadFriends();
    });
  }

// sorting buttons
  document.querySelectorAll(".sort-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".sort-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (btn.dataset.sort === "name") friends.sort((a, b) => a.name.localeCompare(b.name));
      else if (btn.dataset.sort === "wins") friends.sort((a, b) => b.wins - a.wins);
      renderFriends();
    });
  });

  function showPopup(title, msg, color = "#ff4e4e", icon = "✕") {
    document.getElementById("popupIcon").textContent = icon;
    document.getElementById("popupIcon").style.color = color;
    document.getElementById("popupTitle").textContent = title;
    document.getElementById("popupTitle").style.color = color;
    document.getElementById("popupMsg").innerHTML = msg;
    document.getElementById("arcadePopup").classList.add("show");
  }

  document.getElementById("arcadePopup").addEventListener("click", (e) => {
    if (e.target === document.getElementById("arcadePopup")) closePopup();
  });

  loadFriends();
});

function closePopup() {
  document.getElementById("arcadePopup").classList.remove("show");
}

function closeInstructions() {
  const popup = document.getElementById("instructions-popup");
  popup.classList.remove("show");
  popup.classList.add("hidden");
  localStorage.setItem(`friendsFirstVisit_${window.currentUserId}`, "false");
}