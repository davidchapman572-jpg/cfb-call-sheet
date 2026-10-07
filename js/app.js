import { plays } from "./plays.js";

const container = document.getElementById("playContainer");
const formationFilter = document.getElementById("formationFilter");
const typeFilter = document.getElementById("typeFilter");
const searchBar = document.getElementById("searchBar");

// 1. Populate the formation dropdown automatically from your uploaded plays
function initFormations() {
  const formations = [...new Set(plays.map((p) => p.formation))].filter(Boolean);
  formations.sort().forEach((form) => {
    const opt = document.createElement("option");
    opt.value = form;
    opt.textContent = form;
    formationFilter.appendChild(opt);
  });
}

// 2. Render play cards into the grid
function renderPlays(playList) {
  container.innerHTML = "";

  if (!playList || playList.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 24px;">No matching plays found.</p>`;
    return;
  }

  playList.forEach((play) => {
    const card = document.createElement("div");
    card.className = "play-card";

    const badgeClass = play.personnel ? `pers-${play.personnel}` : "pers-11";
    const typeLabel = (play.type || "PLAY").toUpperCase();
    const tags = Array.isArray(play.tags) ? play.tags : [];

    card.innerHTML = `
      <div class="card-header">
        <span class="pers-badge ${badgeClass}">${play.personnel || "11"}p</span>
        <span class="play-type">${typeLabel}</span>
      </div>
      <div class="play-title">${play.name}</div>
      <div class="formation-name">${play.formation}</div>
      <div class="tags-list">
        ${tags.map((t) => `<span class="tag">#${t}</span>`).join(" ")}
      </div>
    `;

    container.appendChild(card);
  });
}

// 3. Filter plays in real time by dropdowns & search bar
function filterPlays() {
  const selectedFormation = formationFilter.value;
  const selectedType = typeFilter.value.toLowerCase();
  const searchTerm = searchBar.value.trim().toLowerCase();

  const filtered = plays.filter((play) => {
    const matchFormation = selectedFormation === "all" || play.formation === selectedFormation;
    const matchType = selectedType === "all" || (play.type && play.type.toLowerCase() === selectedType);
    
    const playName = (play.name || "").toLowerCase();
    const formation = (play.formation || "").toLowerCase();
    const tags = Array.isArray(play.tags) ? play.tags : [];

    const matchSearch =
      searchTerm === "" ||
      playName.includes(searchTerm) ||
      formation.includes(searchTerm) ||
      tags.some((t) => t.toLowerCase().includes(searchTerm));

    return matchFormation && matchType && matchSearch;
  });

  renderPlays(filtered);
}

// 4. Attach event listeners
formationFilter.addEventListener("change", filterPlays);
typeFilter.addEventListener("change", filterPlays);
searchBar.addEventListener("input", filterPlays);

// 5. Initial boot
initFormations();
renderPlays(plays);
