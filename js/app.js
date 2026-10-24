// ===== App Module — Main Application Logic =====

let currentProfile = null;
let currentListings = [];
let currentResults = [];

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
});

async function initApp() {
  try {
    // Load profile data
    currentProfile = Storage.getProfile();

    // Load listings data
    currentListings = Storage.getListings();
    if (!currentListings || currentListings.length === 0) {
      const listingsRes = await fetch('data/listings.json');
      currentListings = await listingsRes.json();
      Storage.setListings(currentListings);
    }

    // Update listing count
    document.getElementById('listing-count').textContent = currentListings.length;

    // Check if user has uploaded CV before
    if (!currentProfile) {
      // Try to load default cv-profile.json (for backward compatibility)
      try {
        const profileRes = await fetch('data/cv-profile.json');
        const defaultProfile = await profileRes.json();
        // Check if it's the template (placeholder) or a real CV
        if (defaultProfile.name && defaultProfile.name !== 'Nama Lengkap Kamu') {
          currentProfile = defaultProfile;
          Storage.setProfile(currentProfile);
        }
      } catch (e) {
        // No default profile found — that's OK
      }
    }

    // If still no profile, show onboarding
    if (!currentProfile) {
      showOnboarding();
    } else {
      // Render profile
      Renderer.renderProfile(currentProfile);
      updateProfileStatus(true);
    }

    // Load previous results if available
    currentResults = Storage.getResults();

    // Render listings table
    Renderer.renderListingsTable(currentListings, document.getElementById('listings-tbody'));

    // Populate filters
    Renderer.populateLocationFilter(currentListings);
    Renderer.populateMajorFilter(currentListings);

    // If we have previous results, show them
    if (currentResults.length > 0) {
      renderDashboardResults();
    }

    // Setup navigation
    setupNavigation();
    setupMobileMenu();

    // Load weight settings
    loadWeightSettings();

    // Hide loading, show app
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
    }, 800);

  } catch (error) {
    console.error('Init error:', error);
    document.getElementById('loading-screen').querySelector('p').textContent =
      'Error loading data. Please refresh.';
  }
}

// ===== Onboarding =====
function showOnboarding() {
  document.getElementById('onboarding-modal').classList.add('active');
  updateProfileStatus(false);
}

function closeOnboarding() {
  document.getElementById('onboarding-modal').classList.remove('active');
}

function updateProfileStatus(hasProfile) {
  const statusEl = document.getElementById('profile-status');
  const nameEl = document.getElementById('profile-name-display');

  if (hasProfile && currentProfile) {
    if (statusEl) {
      statusEl.className = 'profile-status loaded';
      statusEl.title = 'CV dimuat: ' + currentProfile.name;
    }
    if (nameEl) nameEl.textContent = currentProfile.name;
  } else {
    if (statusEl) {
      statusEl.className = 'profile-status empty';
      statusEl.title = 'Belum ada CV — klik untuk upload';
    }
    if (nameEl) nameEl.textContent = 'Upload CV';
  }
}

// ===== CV Upload =====
function handleCVUpload(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      // Validate CV structure
      const errors = validateCV(data);
      if (errors.length > 0) {
        showToast('❌ Format CV tidak valid: ' + errors.join(', '), 'error');
        return;
      }

      // Save profile
      currentProfile = data;
      Storage.setProfile(currentProfile);

      // Clear old results (because profile changed)
      currentResults = [];
      Storage.setResults([]);

      // Re-render profile
      Renderer.renderProfile(currentProfile);
      updateProfileStatus(true);
      closeOnboarding();

      showToast(`✅ CV "${data.name}" berhasil dimuat! Silakan jalankan Screening.`, 'success');

      // Navigate to dashboard
      navigateTo('dashboard');

    } catch (err) {
      showToast('❌ Error parsing JSON: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
  input.value = ''; // Reset
}

function validateCV(data) {
  const errors = [];
  if (!data.name || typeof data.name !== 'string') errors.push('field "name" wajib diisi');
  if (!data.education || !Array.isArray(data.education) || data.education.length === 0) errors.push('"education" wajib minimal 1 entry');
  if (!data.skills || typeof data.skills !== 'object') errors.push('"skills" wajib ada');
  if (!data.matchKeywords || !Array.isArray(data.matchKeywords) || data.matchKeywords.length === 0) errors.push('"matchKeywords" wajib diisi minimal 1 keyword');
  return errors;
}

function resetCV() {
  if (confirm('Yakin ingin menghapus CV dan mengupload ulang?')) {
    currentProfile = null;
    currentResults = [];
    Storage.setProfile(null);
    Storage.setResults([]);

    // Clear profile page
    ['personal-info-body', 'education-body', 'skills-body', 'experience-body', 'certifications-body', 'projects-body'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<p style="color:var(--text-muted);text-align:center;">Belum ada data CV</p>';
    });

    updateProfileStatus(false);
    renderDashboardResults();
    showOnboarding();
    showToast('CV berhasil dihapus. Silakan upload CV baru.', 'info');
  }
}

// ===== Navigation =====
function setupNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      navigateTo(page);
    });
  });
}

function navigateTo(pageName) {
  // Update nav links
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const activeLink = document.querySelector(`[data-page="${pageName}"]`);
  if (activeLink) activeLink.classList.add('active');

  // Update pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const activePage = document.getElementById(`page-${pageName}`);
  if (activePage) activePage.classList.add('active');

  // Close mobile menu
  document.getElementById('sidebar').classList.remove('open');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Close on overlay click (mobile)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

// ===== Screening =====
function runScreening() {
  if (!currentProfile) {
    showToast('⚠️ Upload CV terlebih dahulu sebelum menjalankan screening', 'error');
    showOnboarding();
    return;
  }

  if (currentListings.length === 0) {
    showToast('Data lowongan belum tersedia', 'error');
    return;
  }

  const btn = document.getElementById('btn-run-screening');
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 18 18" class="loader-ring" style="animation: spin 1s linear infinite;">
      <circle cx="9" cy="9" r="7" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="30 10"/>
    </svg>
    Menganalisis...
  `;
  btn.disabled = true;

  // Simulate processing time for UX
  setTimeout(() => {
    const weights = Storage.getWeights();
    currentResults = Matcher.screenAll(currentProfile, currentListings, weights);
    Storage.setResults(currentResults);

    renderDashboardResults();

    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L11.09 7.26L17 7.64L12.45 11.34L13.82 17L9 14.27L4.18 17L5.55 11.34L1 7.64L6.91 7.26L9 2Z" fill="currentColor"/></svg>
      Jalankan Screening
    `;
    btn.disabled = false;

    showToast(`✨ Screening selesai! ${currentResults.filter(r => r.tier === 'high').length} lowongan sangat cocok ditemukan`, 'success');
  }, 1200);
}

function renderDashboardResults() {
  // Stats
  Renderer.renderStats(currentResults);

  // Top 5
  const topContainer = document.getElementById('top-recommendations');
  Renderer.renderRecommendations(currentResults, topContainer, 5);

  // Chart
  Renderer.renderChart(currentResults);

  // Full recommendations page
  const fullContainer = document.getElementById('recommendations-full');
  Renderer.renderRecommendations(currentResults, fullContainer);

  // Update saved count
  document.getElementById('stat-saved-num').textContent = Storage.getSaved().length;
}

// ===== Filters =====
function filterRecommendations() {
  if (currentResults.length === 0) return;

  const scoreFilter = document.getElementById('filter-score').value;
  const locationFilter = document.getElementById('filter-location').value;
  const majorFilter = document.getElementById('filter-major') ? document.getElementById('filter-major').value : 'all';

  let filtered = [...currentResults];

  if (scoreFilter !== 'all') {
    filtered = filtered.filter(r => {
      if (scoreFilter === 'high') return r.tier === 'high';
      if (scoreFilter === 'medium') return r.tier === 'medium';
      if (scoreFilter === 'low') return r.tier === 'low';
      return true;
    });
  }

  if (locationFilter !== 'all') {
    filtered = filtered.filter(r => r.location === locationFilter);
  }

  if (majorFilter !== 'all') {
    filtered = filtered.filter(r => r.majors.includes(majorFilter));
  }

  const container = document.getElementById('recommendations-full');
  Renderer.renderRecommendations(filtered, container);
}

function searchListings(query) {
  const q = query.toLowerCase().trim();

  if (!q) {
    Renderer.renderListingsTable(currentListings, document.getElementById('listings-tbody'));
    return;
  }

  const filtered = currentListings.filter(l =>
    l.title.toLowerCase().includes(q) ||
    l.company.toLowerCase().includes(q) ||
    l.location.toLowerCase().includes(q) ||
    l.majors.some(m => m.toLowerCase().includes(q))
  );

  Renderer.renderListingsTable(filtered, document.getElementById('listings-tbody'));
}

// ===== Detail Modal =====
function showDetail(listingId) {
  const item = getResultById(listingId);
  if (!item) return;
  Renderer.renderDetailModal(item);
}

function getResultById(id) {
  // Try results first (has scores), then listings
  let item = currentResults.find(r => r.id === id);
  if (!item) {
    item = currentListings.find(l => l.id === id);
    if (item) {
      if (currentProfile) {
        // Calculate score on the fly
        const score = Matcher.calculateScore(currentProfile, item, Storage.getWeights());
        item = {
          ...item,
          matchScore: score.total,
          breakdown: score.breakdown,
          matchDetails: score.matchDetails,
          tier: score.total >= 70 ? 'high' : score.total >= 50 ? 'medium' : 'low'
        };
      } else {
        // No profile — show listing without score
        item = {
          ...item,
          matchScore: 0,
          breakdown: { major: 0, title: 0, education: 0, quota: 0 },
          matchDetails: { matchedMajors: [], titleKeywords: [], educationMatch: false },
          tier: 'low'
        };
      }
    }
  }
  return item;
}

function closeModal(event) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById('detail-modal').classList.remove('active');
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeOnboarding();
  }
});

// ===== Bookmarks =====
function toggleBookmark(listingId) {
  const wasSaved = Storage.toggleSaved(listingId);

  // Update button appearance
  const btn = document.getElementById(`bookmark-btn-${listingId}`);
  if (btn) {
    btn.classList.toggle('active', wasSaved);
    btn.innerHTML = wasSaved ? '★' : '☆';
  }

  // Update saved count
  document.getElementById('stat-saved-num').textContent = Storage.getSaved().length;

  showToast(wasSaved ? '⭐ Lowongan disimpan' : 'Lowongan dihapus dari simpanan', 'info');
}

// ===== Settings =====
function loadWeightSettings() {
  const weights = Storage.getWeights();
  document.getElementById('weight-major').value = weights.major;
  document.getElementById('weight-title').value = weights.title;
  document.getElementById('weight-education').value = weights.education;
  document.getElementById('weight-quota').value = weights.quota;

  document.getElementById('weight-major-val').textContent = weights.major + '%';
  document.getElementById('weight-title-val').textContent = weights.title + '%';
  document.getElementById('weight-education-val').textContent = weights.education + '%';
  document.getElementById('weight-quota-val').textContent = weights.quota + '%';
}

function updateWeightDisplay(slider) {
  const name = slider.id.replace('weight-', '');
  document.getElementById(`weight-${name}-val`).textContent = slider.value + '%';
}

function saveWeights() {
  const weights = {
    major: parseInt(document.getElementById('weight-major').value),
    title: parseInt(document.getElementById('weight-title').value),
    education: parseInt(document.getElementById('weight-education').value),
    quota: parseInt(document.getElementById('weight-quota').value)
  };
  Storage.setWeights(weights);
  showToast('✅ Bobot matching disimpan', 'success');
}

// ===== Import/Export =====
function importListings(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        // Assign IDs if missing
        data.forEach((item, i) => {
          if (!item.id) item.id = i + 1;
        });
        currentListings = data;
        Storage.setListings(currentListings);
        document.getElementById('listing-count').textContent = currentListings.length;
        Renderer.renderListingsTable(currentListings, document.getElementById('listings-tbody'));
        Renderer.populateLocationFilter(currentListings);
        showToast(`📦 ${data.length} lowongan berhasil diimport`, 'success');
      } else {
        showToast('Format JSON tidak valid. Harus berupa array.', 'error');
      }
    } catch (err) {
      showToast('Error parsing JSON: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
  input.value = ''; // Reset
}

function exportResults() {
  if (currentResults.length === 0) {
    showToast('Belum ada hasil screening untuk diexport', 'error');
    return;
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    profile: currentProfile ? currentProfile.name : 'Unknown',
    totalListings: currentListings.length,
    results: currentResults.map(r => ({
      rank: currentResults.indexOf(r) + 1,
      title: r.title,
      company: r.company,
      location: r.location,
      matchScore: r.matchScore,
      tier: r.tier,
      breakdown: r.breakdown,
      quota: r.quota,
      education: r.education,
      url: r.url
    }))
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `maganghub-screening-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);

  showToast('📥 Hasil screening berhasil diexport', 'success');
}

function clearAllData() {
  if (confirm('Yakin ingin menghapus semua data tersimpan? Data lowongan, profil, dan hasil screening akan di-reset.')) {
    Storage.clearAll();
    currentProfile = null;
    currentResults = [];
    showToast('🗑️ Semua data berhasil dihapus', 'info');
    location.reload();
  }
}

// ===== Toast Notifications =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
