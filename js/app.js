import { plays } from './plays.js';

const playContainer = document.getElementById('playContainer');
const formationFilter = document.getElementById('formationFilter');
const typeFilter = document.getElementById('typeFilter');
const searchBar = document.getElementById('searchBar');

// Populate Formation Dropdown
const uniqueFormations = [...new Set(plays.map(p => p.formation))].sort();
uniqueFormations.forEach(formation => {
  const option = document.createElement('option');
  option.value = formation;
  option.textContent = formation;
  formationFilter.appendChild(option);
});

// Render Play Cards
function renderPlays(playList) {
  playContainer.innerHTML = '';
  
  if (playList.length === 0) {
    playContainer.innerHTML = '<p style="color: #94a3b8;">No plays found matching your criteria.</p>';
    return;
  }

  playList.forEach(play => {
    const card = document.createElement('div');
    card.className = 'card';

    const tagsHtml = (play.tags || [])
      .map(tag => `<span class="tag">#${tag}</span>`)
      .join('');

    card.innerHTML = `
      <h3>${play.name}</h3>
      <span class="badge badge-${play.type.toLowerCase()}">${play.type}</span>
      <p style="color: #c4b5fd; font-size: 0.85rem; margin: 8px 0 4px;">${play.formation}</p>
      <div class="tags">${tagsHtml}</div>
    `;

    playContainer.appendChild(card);
  });
}

// Filter Logic
function filterPlays() {
  const selectedFormation = formationFilter.value;
  const selectedType = typeFilter.value;
  const searchTerm = searchBar.value.toLowerCase().trim();

  const filtered = plays.filter(play => {
    const matchesFormation = selectedFormation === 'all' || play.formation === selectedFormation;
    const matchesType = selectedType === 'all' || play.type.toLowerCase() === selectedType;
    const matchesSearch = 
      play.name.toLowerCase().includes(searchTerm) ||
      play.formation.toLowerCase().includes(searchTerm) ||
      (play.tags && play.tags.some(tag => tag.toLowerCase().includes(searchTerm)));

    return matchesFormation && matchesType && matchesSearch;
  });

  renderPlays(filtered);
}

// Event Listeners
formationFilter.addEventListener('change', filterPlays);
typeFilter.addEventListener('change', filterPlays);
searchBar.addEventListener('input', filterPlays);

// Initial Render
renderPlays(plays);
