import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Logo from '../components/Logo';

// ── Types ─────────────────────────────────────────────────────────────
type Category = 'Mental Health' | 'Community' | 'Emergency' | 'Digital' | 'Youth Support';

interface Task {
  id: number;
  title: string;
  category: Category;
  lat: number;
  lng: number;
}

// ── Constants ─────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<Category, string> = {
  'Mental Health': '#22c55e',
  'Community':     '#3b82f6',
  'Emergency':     '#ef4444',
  'Digital':       '#a855f7',
  'Youth Support': '#ec4899',
};

const TASKS: Task[] = [
  { id: 1, title: 'Crisis phone support — evening shift volunteers needed across Plymouth',    category: 'Mental Health', lat: 50.3763, lng: -4.1437 },
  { id: 2, title: 'Community outreach — distribute mental health resource packs in PL1–PL4',  category: 'Community',     lat: 50.3801, lng: -4.1352 },
  { id: 3, title: 'Drop-in centre support — assist staff at the Devonport wellbeing hub',     category: 'Digital',       lat: 50.3702, lng: -4.1612 },
  { id: 4, title: 'Emergency response coordination training for new volunteers',               category: 'Emergency',     lat: 50.3851, lng: -4.1247 },
  { id: 5, title: 'Youth mental health workshop — group facilitation support needed',         category: 'Youth Support', lat: 50.3650, lng: -4.1480 },
];

// ── Helpers ───────────────────────────────────────────────────────────
function createPinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
             <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z"
                   fill="${color}" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>
             <circle cx="14" cy="14" r="5" fill="white" opacity="0.9"/>
           </svg>`,
    iconSize:   [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

// ── Component ─────────────────────────────────────────────────────────
export default function TasksMap() {
  const navigate = useNavigate();
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set());

  const visibleTasks: Task[] = selectedCategories.size === 0
    ? TASKS
    : TASKS.filter(t => selectedCategories.has(t.category));

  function toggleCategory(cat: Category): void {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [50.3755, -4.1427],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  // Sync markers with filter
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    map.eachLayer(layer => { if (layer instanceof L.Marker) map.removeLayer(layer); });

    visibleTasks.forEach(task => {
      const marker = L.marker([task.lat, task.lng], { icon: createPinIcon(CATEGORY_COLORS[task.category]) });

      marker.bindPopup(`
        <div style="font-family:sans-serif;min-width:160px;font-size:13px">
          <span style="display:inline-block;width:9px;height:9px;border-radius:50%;
            background:${CATEGORY_COLORS[task.category]};margin-right:5px;vertical-align:middle"></span>
          <strong>${task.category}</strong>
          <p style="margin:5px 0 0;line-height:1.4">${task.title}</p>
        </div>`);

      marker.on('click', () => navigate('/task-description'));
      marker.addTo(map);
    });
  }, [visibleTasks, navigate]);

  return (
    <div className="tm2-page">

      {/* ── Nav ── */}
      <nav className="tm2-nav">
        <a href="/" className="tm2-logo-link"><Logo height={40} /></a>
        <button className="tm2-user-btn" onClick={() => navigate('/profile')} aria-label="Account">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      </nav>

      {/* ── Map ── */}
      <div className="tm2-map-wrap">
        <div ref={mapRef} className="tm2-map" />
        <div className="tm2-scroll-hint">···</div>
      </div>

      {/* ── Bottom ── */}
      <div className="tm2-bottom">

        {/* Task list */}
        <div className="tm2-tasks-panel">
          <div className="tm2-tasks-header">
            <h2>TASKS</h2>
            <button className="tm2-add-btn" aria-label="Add task">+</button>
          </div>
          <ul className="tm2-task-list">
            {visibleTasks.map(task => (
              <li
                key={task.id}
                className="tm2-task-item"
                onClick={() => navigate('/task-description')}
              >
                <span className="tm2-dot" style={{ background: CATEGORY_COLORS[task.category] }} />
                <span className="tm2-task-title">{task.title}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Filter */}
        <div className="tm2-filter-panel">
          <h3 className="tm2-filter-title">Filter by category</h3>
          <ul className="tm2-filter-list">
            {(Object.entries(CATEGORY_COLORS) as [Category, string][]).map(([cat, color]) => (
              <li key={cat} className="tm2-filter-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  <span className="tm2-filter-dot" style={{ background: color }} />
                  {cat}
                </label>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
