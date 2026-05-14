async function maybeShowInstructions() {
  const userId = await window.currentUserReady;
  if (!userId) return;

  if (localStorage.getItem(`friendsFirstVisit_${userId}`) !== "false") {
    const popup = document.getElementById("instructions-popup");
    popup.classList.remove("hidden");
    popup.offsetHeight;
    popup.classList.add("show");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await maybeShowInstructions();

  const searchInput = document.getElementById("searchInput");
  const friendsList = document.getElementById("friendsList");
  const searchDropdown = document.getElementById("searchDropdown");
  const inboxList      = document.getElementById("inboxList");
  const inboxSection   = document.getElementById("inboxSection");

  let friends = [];
  let searchTimeout = null;

  // loads pending challenges into the inbox section whish is called on page load and after accepting a challenge
  async function loadInbox() {
    try {
      const res  = await fetch("/api/challenge/inbox");
      const data = await res.json();

      console.log("Inbox data:", data); // temporary ----------------------

      if (!Array.isArray(data) || data.length === 0) {
        inboxSection.style.display = "none";
        return;
      }

      inboxSection.style.display = "";
      inboxList.innerHTML = "";

      data.forEach(c => {
        const div = document.createElement("div");
        div.className = "row-item";
        div.innerHTML = `
          <span class="friend-name">
            FROM ${c.from} &mdash; ${c.word_length} LETTERS
          </span>
          <button
            class="btn-arcade"
            style="padding:4px 12px;font-size:11px;"
            onclick="playChallenge(${c.challenge_id})"
          >PLAY</button>
        `;
        inboxList.appendChild(div);
      });
    } catch (err) {
      console.error("Inbox load error:", err);
    }
  }

  window.playChallenge = function(challengeId) {
    window.location.href = `/unlimited?challenge_id=${challengeId}`;
  };

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
        <button
          class="btn-arcade"
          style="padding:4px 10px;font-size:11px;"
          onclick="openChallengeModal('${friend.name.toUpperCase()}')"
        >SEND WORD</button>
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

  // challenge mode
  window.openChallengeModal = function(friendName) {
    document.getElementById("challengeTargetName").textContent = friendName;
    document.getElementById("challengeWordInput").value = "";
    document.getElementById("challengeModal").classList.add("show");
  };

  window.closeChallengeModal = function() {
    document.getElementById("challengeModal").classList.remove("show");
  };

  window.sendChallenge = async function() {
    const friendName = document.getElementById("challengeTargetName").textContent;
    const word = document.getElementById("challengeWordInput").value.trim().toUpperCase();

    if (!word || !/^[A-Z]{4,8}$/.test(word)) {
      showPopup("ERROR", "Word must be 4–8 letters, A–Z only.");
      return;
    }

    try {
      const res  = await fetch("/api/challenge/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friend_username: friendName, word }),
      });
      const body = await res.json();

      closeChallengeModal();

      if (res.ok) {
        showPopup("SENT!", `Challenge sent to ${friendName}.`, "#00dc82", "✓");
      } else {
        showPopup("ERROR", body.error || "Could not send challenge.");
      }
    } catch (err) {
      console.error("Send challenge error:", err);
      showPopup("ERROR", "Network error. Try again.");
    }
  };

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
  loadInbox();
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