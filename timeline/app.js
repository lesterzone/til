const timelineEl = document.getElementById('timeline');
const searchEl = document.getElementById('search');
const categoryFiltersEl = document.getElementById('categoryFilters');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let allEvents = [];
let activeCategories = null; // null = all categories active

function categorySlug(category) {
  return String(category).toLowerCase().replace(/\s+/g, '-');
}

const CATEGORY_EMOJI = {
  hiking: '🥾',
  cycling: '🚴',
  vacation: '🏖️',
};

function categoryEmoji(category) {
  if (!category) return null;
  return CATEGORY_EMOJI[categorySlug(category)] || null;
}

function makeDot(category) {
  const dotEl = document.createElement('span');
  const emoji = categoryEmoji(category);
  dotEl.className = emoji ? 'entry-dot' : 'entry-dot plain';
  if (emoji) dotEl.textContent = emoji;
  return dotEl;
}

function collectCategories(events) {
  const categories = new Set();
  for (const event of events) {
    if (event.category) categories.add(event.category);
    if (Array.isArray(event.subEvents)) {
      for (const sub of event.subEvents) {
        if (sub.category) categories.add(sub.category);
      }
    }
  }
  return [...categories].sort();
}

function renderCategoryFilters(events) {
  const categories = collectCategories(events);
  categoryFiltersEl.innerHTML = '';
  if (categories.length === 0) return;

  const allChip = document.createElement('button');
  allChip.type = 'button';
  allChip.className = 'category-chip';
  allChip.dataset.category = 'all';
  allChip.textContent = 'All';
  allChip.addEventListener('click', () => {
    activeCategories = null;
    updateChipStates();
    applyFilter();
  });
  categoryFiltersEl.appendChild(allChip);

  for (const category of categories) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'category-chip';
    chip.dataset.category = categorySlug(category);
    chip.textContent = category;
    chip.addEventListener('click', () => {
      const current = activeCategories || new Set(categories);
      if (current.has(category)) {
        current.delete(category);
      } else {
        current.add(category);
      }
      activeCategories = current.size === categories.length ? null : current;
      updateChipStates();
      applyFilter();
    });
    categoryFiltersEl.appendChild(chip);
  }

  updateChipStates();
}

function updateChipStates() {
  const chips = categoryFiltersEl.querySelectorAll('.category-chip');
  for (const chip of chips) {
    if (chip.dataset.category === 'all') {
      chip.classList.toggle('active', activeCategories === null);
    } else {
      const isActive = activeCategories === null || activeCategories.has(chip.textContent);
      chip.classList.toggle('active', isActive);
    }
  }
}

function matchesCategoryFilter(event) {
  if (activeCategories === null) return true;
  if (event.category && activeCategories.has(event.category)) return true;
  if (Array.isArray(event.subEvents)) {
    return event.subEvents.some(sub => sub.category && activeCategories.has(sub.category));
  }
  return false;
}

function parseDateParts(dateStr) {
  const parts = String(dateStr).split('-').map(Number);
  return {
    year: parts[0],
    month: parts[1] || null,
    day: parts[2] || null,
  };
}

function formatDate(dateStr) {
  const { year, month, day } = parseDateParts(dateStr);
  if (!year) return dateStr;
  if (!month) return String(year);
  const monthName = MONTHS[month - 1] || month;
  if (!day) return `${monthName} ${year}`;
  return `${monthName} ${day}, ${year}`;
}

function sortKey(dateStr) {
  const { year, month, day } = parseDateParts(dateStr);
  return `${String(year).padStart(6, '0')}-${String(month || 1).padStart(2, '0')}-${String(day || 1).padStart(2, '0')}`;
}

function render(events) {
  timelineEl.innerHTML = '';

  if (events.length === 0) {
    timelineEl.innerHTML = '<p class="empty">No events found.</p>';
    return;
  }

  const sorted = [...events].sort((a, b) => sortKey(b.date).localeCompare(sortKey(a.date)));

  let currentYear = null;
  let list = null;

  for (const event of sorted) {
    const { year } = parseDateParts(event.date);

    if (year !== currentYear) {
      currentYear = year;
      const heading = document.createElement('h2');
      heading.className = 'year-heading';
      heading.textContent = String(year);
      timelineEl.appendChild(heading);

      list = document.createElement('ol');
      list.className = 'timeline';
      timelineEl.appendChild(list);
    }

    const item = document.createElement('li');
    item.className = 'entry';
    item.appendChild(makeDot(event.category));

    const dateEl = document.createElement('div');
    dateEl.className = 'date';
    dateEl.textContent = formatDate(event.date);

    const titleEl = document.createElement('div');
    titleEl.className = 'title';
    titleEl.textContent = event.title;

    if (event.category) {
      const badgeEl = document.createElement('span');
      badgeEl.className = 'category-badge';
      badgeEl.dataset.category = categorySlug(event.category);
      badgeEl.textContent = event.category;
      titleEl.appendChild(badgeEl);
    }

    item.appendChild(dateEl);
    item.appendChild(titleEl);

    if (event.description) {
      const descEl = document.createElement('div');
      descEl.className = 'description';
      descEl.textContent = event.description;
      item.appendChild(descEl);
    }

    if (Array.isArray(event.subEvents) && event.subEvents.length > 0) {
      const subList = document.createElement('ol');
      subList.className = 'sub-timeline';

      const sortedSubEvents = [...event.subEvents].sort((a, b) => sortKey(a.date).localeCompare(sortKey(b.date)));

      for (const subEvent of sortedSubEvents) {
        const subItem = document.createElement('li');
        subItem.className = 'sub-entry';
        subItem.appendChild(makeDot(subEvent.category));

        const subDateEl = document.createElement('div');
        subDateEl.className = 'date';
        subDateEl.textContent = formatDate(subEvent.date);

        const subTitleEl = document.createElement('div');
        subTitleEl.className = 'title';
        subTitleEl.textContent = subEvent.title;

        if (subEvent.category) {
          const subBadgeEl = document.createElement('span');
          subBadgeEl.className = 'category-badge';
          subBadgeEl.dataset.category = categorySlug(subEvent.category);
          subBadgeEl.textContent = subEvent.category;
          subTitleEl.appendChild(subBadgeEl);
        }

        subItem.appendChild(subDateEl);
        subItem.appendChild(subTitleEl);

        if (subEvent.description) {
          const subDescEl = document.createElement('div');
          subDescEl.className = 'description';
          subDescEl.textContent = subEvent.description;
          subItem.appendChild(subDescEl);
        }

        subList.appendChild(subItem);
      }

      item.appendChild(subList);
    }

    list.appendChild(item);
  }
}

function applyFilter() {
  const query = searchEl.value.trim().toLowerCase();

  const filtered = allEvents.filter(e => {
    if (!matchesCategoryFilter(e)) return false;
    if (!query) return true;
    return (e.title || '').toLowerCase().includes(query) ||
      (e.description || '').toLowerCase().includes(query) ||
      (Array.isArray(e.subEvents) && e.subEvents.some(sub =>
        (sub.title || '').toLowerCase().includes(query) ||
        (sub.description || '').toLowerCase().includes(query)
      ));
  });
  render(filtered);
}

searchEl.addEventListener('input', applyFilter);

fetch('events.json')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(events => {
    allEvents = Array.isArray(events) ? events : [];
    renderCategoryFilters(allEvents);
    render(allEvents);
  })
  .catch(err => {
    timelineEl.innerHTML = `
      <p class="error">
        Couldn't load <code>events.json</code> (${err.message}).<br>
        If you opened this file directly (<code>file://</code>), most browsers block
        local JSON fetches. Serve this folder instead, e.g.:<br>
        <code>python3 -m http.server</code> then open <code>http://localhost:8000</code>.
      </p>`;
  });
