document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("searchInput");
  const friendsList = document.getElementById("friendsList");

  const allUsers = window.usersData || [];
  const friends = [];

  function renderFriends() {
      friendsList.innerHTML = "";

      if (friends.length === 0) {
          friendsList.innerHTML = `<div class="no-results">NO FRIENDS ADDED</div>`;
          return;
      }

      friends.forEach((friendData) => {
          const friend = document.createElement("div");
          friend.classList.add("row-item", "friend");
          friend.innerHTML = `
              <span class="friend-name">${friendData.name}</span>
              <span class="friend-score">${friendData.wins} WINS</span>
          `;
          friendsList.appendChild(friend);
      });
  }

  function addFriend(name) {
      const user = allUsers.find((u) => u.name === name);

      if (!user) {
          showPopup(
            "USER NOT FOUND",
            `No player named <span>${name}</span> exists.`
          );
          return;
      }

      if (friends.some((f) => f.name === name)) {
          showPopup(
            "ALREADY FRIENDS",
            `You are already friends with <span>${name}</span>.`
          );
          return;
      }

      friends.push(user);
      renderFriends();
  }

  function showPopup(title, msg, color = '#ff4e4e', icon = '✕') {
        document.getElementById('popupIcon').textContent = icon;
        document.getElementById('popupIcon').style.color = color;
        document.getElementById('popupTitle').textContent = title;
        document.getElementById('popupTitle').style.color = color;
        document.getElementById('popupMsg').innerHTML = msg;
        document.getElementById('arcadePopup').classList.add('show');
    }

    document.getElementById('arcadePopup').addEventListener('click', function (e) {
        if (e.target === this) closePopup();
    });

  searchInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;

      const inputName = searchInput.value.trim().toUpperCase();
      if (!inputName) return;

      addFriend(inputName);
      searchInput.value = "";
  });

  renderFriends();
});

function closePopup() {
    document.getElementById('arcadePopup').classList.remove('show');
}