const timelineEl = document.getElementById('timeline');
const searchEl = document.getElementById('search');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let allEvents = [];

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

    const dateEl = document.createElement('div');
    dateEl.className = 'date';
    dateEl.textContent = formatDate(event.date);

    const titleEl = document.createElement('div');
    titleEl.className = 'title';
    titleEl.textContent = event.title;

    item.appendChild(dateEl);
    item.appendChild(titleEl);

    if (event.description) {
      const descEl = document.createElement('div');
      descEl.className = 'description';
      descEl.textContent = event.description;
      item.appendChild(descEl);
    }

    list.appendChild(item);
  }
}

function applyFilter() {
  const query = searchEl.value.trim().toLowerCase();
  if (!query) {
    render(allEvents);
    return;
  }
  const filtered = allEvents.filter(e =>
    (e.title || '').toLowerCase().includes(query) ||
    (e.description || '').toLowerCase().includes(query)
  );
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
