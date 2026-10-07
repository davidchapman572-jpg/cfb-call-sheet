import { plays } from "./plays.js";

// Storage keys
const STORAGE_SHEET_KEY = "cfb_custom_blank_sheet";
const STORAGE_TITLE_KEY = "cfb_sheet_active_title";
const STORAGE_OPP_KEY = "cfb_sheet_active_opponent";

// Blank state by default
const INITIAL_BLANK_SHEET = {
  openers: [],
  thirdShort: [],
  thirdLong: [],
  run11: [],
  pass11: [],
  rpo11: [],
  run12: [],
  pass12: [],
  thirdMed: [],
  secondHalf: [],
  heavy: [],
  thirdExtraLong: []
};

let currentSheet = JSON.parse(localStorage.getItem(STORAGE_SHEET_KEY)) || INITIAL_BLANK_SHEET;
let activeTargetBucket = null;

// DOM Elements
const modal = document.getElementById("playPickerModal");
const modalList = document.getElementById("modalPlayList");
const modalSearch = document.getElementById("modalSearchInput");
const modalFilter = document.getElementById("modalPersFilter");
const modalTargetTitle = document.getElementById("modalTargetTitle");
const closeModalBtn = document.getElementById("closeModalBtn");
const clearSheetBtn = document.getElementById("clearSheetBtn");
const titleInput = document.getElementById("sheetTitleInput");
const opponentInput = document.getElementById("opponentInput");

// 1. Render all buckets on screen
function renderCallSheet() {
  Object.keys(currentSheet).forEach((bucketKey) => {
    const container = document.getElementById(`box-${bucketKey}`);
    if (!container) return;

    container.innerHTML = "";
    const playListForBucket = currentSheet[bucketKey] || [];

    if (playListForBucket.length === 0) {
      container.innerHTML = `<div class="empty-notice">Click "+ Add" to slot plays</div>`;
      return;
    }

    playListForBucket.forEach((entry, index) => {
      // Find full play details from uploaded plays database
      const playData = plays.find((p) => p.id === entry.id || p.name.toLowerCase() === entry.name?.toLowerCase()) || entry;

      const row = document.createElement("div");
      row.className = "play-row";

      const pers = playData.personnel || "11";
      const pType = (playData.type || "P")[0].toUpperCase();
      const tags = Array.isArray(playData.tags) ? playData.tags : [];

      row.innerHTML = `
        <span class="row-num">${index + 1}</span>
        <span class="row-pers">${pers}</span>
        <span class="row-type">${pType}</span>
        <span class="row-content">
          <span class="formation-part">${playData.formation}</span>
          <span class="play-name-part">${playData.name}</span>
        </span>
        <span class="flags">
          ${tags.slice(0, 2).map((t) => `<span class="badge-flag">${t.toUpperCase()}</span>`).join("")}
        </span>
        <button class="delete-row-btn no-print" data-bucket="${bucketKey}" data-index="${index}" title="Remove play">&times;</button>
      `;

      container.appendChild(row);
    });
  });

  // Attach delete buttons
  document.querySelectorAll(".delete-row-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const bucket = e.target.getAttribute("data-bucket");
      const idx = parseInt(e.target.getAttribute("data-index"), 10);
      currentSheet[bucket].splice(idx, 1);
      saveState();
      renderCallSheet();
    });
  });
}

// 2. Open Modal to pick from uploaded plays
function openPicker(bucketKey) {
  activeTargetBucket = bucketKey;
  modalTargetTitle.textContent = `Select Play for [${bucketKey.toUpperCase()}]`;
  modalSearch.value = "";
  modalFilter.value = "all";
  renderModalPlayList();
  modal.style.display = "flex";
  modalSearch.focus();
}

function closeModal() {
  modal.style.display = "none";
  activeTargetBucket = null;
}

// 3. Filter and render uploaded plays in the modal
function renderModalPlayList() {
  modalList.innerHTML = "";
  const query = modalSearch.value.toLowerCase().trim();
  const pers = modalFilter.value;

  const matches = plays.filter((p) => {
    const matchesPers = pers === "all" || p.personnel === pers;
    const matchesSearch =
      query === "" ||
      p.name.toLowerCase().includes(query) ||
      p.formation.toLowerCase().includes(query) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(query)));
    return matchesPers && matchesSearch;
  });

  if (matches.length === 0) {
    modalList.innerHTML = `<div style="padding:16px; text-align:center; color:#64748b;">No matching plays found in playbook.</div>`;
    return;
  }

  matches.forEach((p) => {
    const item = document.createElement("div");
    item.className = "picker-item";
    item.innerHTML = `
      <div class="picker-item-info">
        <span class="row-pers">${p.personnel || "11"}</span>
        <strong>${p.name}</strong>
        <span style="color:#64748b;">(${p.formation})</span>
      </div>
      <button class="btn-yellow" style="padding:2px 8px;">+ Add</button>
    `;

    item.addEventListener("click", () => {
      if (activeTargetBucket) {
        if (!currentSheet[activeTargetBucket]) {
          currentSheet[activeTargetBucket] = [];
        }
        currentSheet[activeTargetBucket].push({
          id: p.id,
          name: p.name,
          formation: p.formation,
          personnel: p.personnel,
          type: p.type,
          tags: p.tags
        });
        saveState();
        renderCallSheet();
        closeModal();
      }
    });

    modalList.appendChild(item);
  });
}

function saveState() {
  localStorage.setItem(STORAGE_SHEET_KEY, JSON.stringify(currentSheet));
}

// Clear sheet completely
if (clearSheetBtn) {
  clearSheetBtn.addEventListener("click", () => {
    if (confirm("Clear all plays from this call sheet?")) {
      currentSheet = JSON.parse(JSON.stringify(INITIAL_BLANK_SHEET));
      saveState();
      renderCallSheet();
    }
  });
}

// Setup Header Week Title Persistence
if (titleInput) {
  titleInput.value = localStorage.getItem(STORAGE_TITLE_KEY) || "";
  titleInput.addEventListener("input", () => {
    localStorage.setItem(STORAGE_TITLE_KEY, titleInput.value);
  });
}

if (opponentInput) {
  opponentInput.value = localStorage.getItem(STORAGE_OPP_KEY) || "";
  opponentInput.addEventListener("input", () => {
    localStorage.setItem(STORAGE_OPP_KEY, opponentInput.value);
  });
}

// Modal Event Listeners
document.querySelectorAll(".add-play-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const bucket = e.target.getAttribute("data-target");
    openPicker(bucket);
  });
});

closeModalBtn.addEventListener("click", closeModal);
modalSearch.addEventListener("input", renderModalPlayList);
modalFilter.addEventListener("change", renderModalPlayList);

// Close modal if user clicks outside of modal-content
window.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Initial Render
renderCallSheet();
