// === Constants ===
const BASE = "https://fsa-puppy-bowl.herokuapp.com/api";
const COHORT = "/2508-PUPPIES";
const API = BASE + COHORT;

// === State ===
let players = [];
let selectedPlayer;

async function getPlayers() {
  try {
    const res = await fetch(API + "/players");
    const json = await res.json();
    players = json.data.players;
    render();
  } catch (err) {
    console.log(err);
  }
}

async function getPlayer(id) {
  try {
    const res = await fetch(API + "/players/" + id);
    const json = await res.json();
    selectedPlayer = json.data.player;
    render();
  } catch (err) {
    console.log(err);
  }
}

async function addPlayer(player) {
  try {
    await fetch(API + "/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(player),
    });
    getPlayers();
  } catch (err) {
    console.error(err);
  }
}

async function removePlayer(id) {
  try {
    await fetch(API + "/players/" + id, {
      method: "DELETE",
    });
    selectedPlayer = undefined;
    getPlayers();
  } catch (err) {
    console.error(err);
  }
}

// === Components ===
function PlayerListItem(player) {
  const $li = document.createElement("li");

  if (player.id === selectedPlayer?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
  <a href = "#selected">
    <figure class = "profile">
    <img alt="${player.name}" src="${player.imageUrl}"/>
    </figure>
    <p>${player.name}</p>
    </a>`;
  $li.addEventListener("click", async function () {
    await getPlayer(player.id);
  });
  return $li;
}

function PlayerList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("players");

  const $players = players.map(PlayerListItem);
  $ul.replaceChildren(...$players);
  return $ul;
}

function NewPlayerForm() {
  const $form = document.createElement("form");

  $form.innerHTML = `
    <label>
    Name
    <input name="name" required/>
    </label>
    <label>
    Breed
    <input name="breed" required />
    </label>
    <label>
    Image URL
    <input name="imageUrl"/>
    </label>
    <button>Invite</button>
    `;
  $form.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = new FormData($form);
    const imageUrl = data.get("imageUrl");
    const playerData = {
      name: data.get("name"),
      breed: data.get("breed"),
    };
    if (imageUrl.length > 0) {
      playerData.imageUrl = imageUrl;
    }
    addPlayer(playerData);
  });
  return $form;
}

function getTeamName(player) {
  if (!player) {
    return "Unassigned";
  } else if (!player.team) {
    return "Unassigned";
  } else if (player.team.name === undefined || player.team.name === null) {
    return "Unassigned";
  } else {
    return player.team.name;
  }
}

function PlayerDetails() {
  if (!selectedPlayer) {
    const $p = document.createElement("p");
    $p.classList.add("details");
    $p.textContent = "Select a player to see their details.";
    return $p;
  }

  const $details = document.createElement("section");
  $details.classList.add("details");

  $details.innerHTML = `
    <figure>
        <img src="${selectedPlayer.imageUrl}" 
             alt="${selectedPlayer.name}"/>
    </figure>
    <table>
        <tr><th>Name</th><td>${selectedPlayer.name}</td></tr>
        <tr><th>ID</th><td>${selectedPlayer.id}</td></tr>
        <tr><th>Breed</th><td>${selectedPlayer.breed}</td></tr>
        <tr><th>Team</th><td>${getTeamName(selectedPlayer)}</td></tr>
        <tr><th>Status</th><td>${selectedPlayer.status}</td></tr>
    </table>
    <button>Remove</button>
    `;

  const $delete = $details.querySelector("button");
  $delete.addEventListener("click", function () {
    removePlayer(selectedPlayer.id);
  });
  return $details;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Puppy Bowl</h1>
        <main>
        <section id = "players">
            <h2>Meet the Players</h2>
            <PlayerList></PlayerList>
            <NewPlayerForm></NewPlayerForm>
        </section>
        <section id = "details">
           <PlayerDetails></PlayerDetails>
        </section>   
        </main>        
    `;
  console.log(selectedPlayer);
  $app.querySelector("PlayerList").replaceWith(PlayerList());
  $app.querySelector("NewPlayerForm").replaceWith(NewPlayerForm());
  $app.querySelector("PlayerDetails").replaceWith(PlayerDetails());
}

async function init() {
  await getPlayers();
  render();
  console.log(players);
}

init();
