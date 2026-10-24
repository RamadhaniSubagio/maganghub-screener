// ===== Renderer Module — UI Rendering Functions =====
const Renderer = {
  
  /**
   * Render recommendation card
   */
  renderRecCard(item, rank) {
    const isSaved = Storage.isSaved(item.id);
    const scoreColor = item.tier === 'high' ? '#10b981' : item.tier === 'medium' ? '#f59e0b' : '#ef4444';
    const circumference = 2 * Math.PI * 22;
    const dashOffset = circumference - (item.matchScore / 100) * circumference;

    return `
      <div class="rec-card ${item.tier}" onclick="showDetail(${item.id})" id="rec-card-${item.id}">
        <span class="rec-rank">#${rank}</span>
        <div class="rec-score-circle">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="4"/>
            <circle cx="28" cy="28" r="22" fill="none" stroke="${scoreColor}" stroke-width="4"
              stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
              stroke-linecap="round"/>
          </svg>
          <span class="rec-score-value" style="color:${scoreColor}">${item.matchScore}%</span>
        </div>
        <div class="rec-info">
          <div class="rec-title">${item.title}</div>
          <div class="rec-company">${item.company}</div>
          <div class="rec-tags">
            <span class="rec-tag location">📍 ${item.location}</span>
            <span class="rec-tag quota">👥 ${item.quota} kuota</span>
            <span class="rec-tag edu">🎓 ${item.education.join(', ')}</span>
          </div>
        </div>
        <div class="rec-actions">
          <button class="btn btn-bookmark btn-sm ${isSaved ? 'active' : ''}" 
            onclick="event.stopPropagation(); toggleBookmark(${item.id})" 
            title="${isSaved ? 'Hapus dari tersimpan' : 'Simpan'}"
            id="bookmark-btn-${item.id}">
            ${isSaved ? '★' : '☆'}
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Render recommendations list
   */
  renderRecommendations(results, container, limit) {
    const items = limit ? results.slice(0, limit) : results;
    
    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>Tidak ada hasil</h3>
          <p>Coba ubah filter atau jalankan screening ulang</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = items.map((item, i) => this.renderRecCard(item, i + 1)).join('');
  },

  /**
   * Render listings table
   */
  renderListingsTable(listings, tbody) {
    if (listings.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="8" style="text-align:center; padding: 2rem; color: var(--text-muted);">
          Tidak ada data lowongan
        </td></tr>
      `;
      return;
    }

    tbody.innerHTML = listings.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><a href="${item.url}" target="_blank" rel="noopener" class="table-link">${item.title}</a></td>
        <td>${item.company}</td>
        <td>${item.location}</td>
        <td class="majors-cell">${item.majors.join(', ')}</td>
        <td>${item.quota}</td>
        <td>${item.education.join(', ')}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="showDetail(${item.id})">Detail</button>
        </td>
      </tr>
    `).join('');
  },

  /**
   * Render profile page
   */
  renderProfile(profile) {
    // Personal Info
    document.getElementById('personal-info-body').innerHTML = `
      <div class="info-row"><span class="info-label">Nama</span><span class="info-value">${profile.name}</span></div>
      <div class="info-row"><span class="info-label">Email</span><span class="info-value">${profile.email}</span></div>
      <div class="info-row"><span class="info-label">Telepon</span><span class="info-value">${profile.phone}</span></div>
      <div class="info-row"><span class="info-label">Lokasi</span><span class="info-value">${profile.location}</span></div>
      <div class="info-row"><span class="info-label">Website</span><span class="info-value"><a href="https://${profile.website}" target="_blank" style="color:var(--accent-secondary);text-decoration:none;">${profile.website}</a></span></div>
      <div class="info-row"><span class="info-label">LinkedIn</span><span class="info-value"><a href="https://${profile.linkedin}" target="_blank" style="color:var(--accent-secondary);text-decoration:none;">LinkedIn Profile</a></span></div>
    `;

    // Education
    document.getElementById('education-body').innerHTML = profile.education.map(edu => `
      <div class="experience-item">
        <div class="exp-role">${edu.degree}</div>
        <div class="exp-company">${edu.institution}</div>
        <div class="exp-period">${edu.year} | ${edu.gpa ? 'GPA: ' + edu.gpa : 'Avg: ' + edu.grade} | ${edu.location}</div>
      </div>
    `).join('');

    // Skills
    const skillsHtml = `
      <div class="skill-category">Software & Tools</div>
      <div class="skill-tags">
        ${profile.skills.software.map(s => `<span class="skill-tag">${s}</span>`).join('')}
      </div>
      <div class="skill-category">Technical Skills</div>
      <div class="skill-tags">
        ${profile.skills.technical.map(s => `<span class="skill-tag">${s}</span>`).join('')}
      </div>
      <div class="skill-category">Soft Skills</div>
      <div class="skill-tags">
        ${profile.skills.soft.map(s => `<span class="skill-tag soft">${s}</span>`).join('')}
      </div>
      <div class="skill-category">Languages</div>
      <div class="skill-tags">
        ${profile.skills.languages.map(s => `<span class="skill-tag soft">${s}</span>`).join('')}
      </div>
    `;
    document.getElementById('skills-body').innerHTML = skillsHtml;

    // Work Experience
    document.getElementById('experience-body').innerHTML = profile.workExperience.map(exp => `
      <div class="experience-item">
        <div class="exp-role">${exp.role}</div>
        <div class="exp-company">${exp.company}</div>
        <div class="exp-period">${exp.period} | ${exp.location}</div>
      </div>
    `).join('');

    // Certifications
    document.getElementById('certifications-body').innerHTML = profile.certifications.map(cert => `
      <div class="cert-item">
        <div class="exp-role">${cert.name}</div>
        <div class="exp-company">${cert.issuer}</div>
        <div class="exp-period">${cert.type} • ${cert.year}</div>
      </div>
    `).join('');

    // Projects
    document.getElementById('projects-body').innerHTML = profile.projects.map(proj => `
      <div class="project-item">
        <div class="exp-role">${proj.name}</div>
        <div class="exp-company">${proj.type}</div>
        <div class="skill-tags" style="margin-top:6px;">
          ${proj.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
      </div>
    `).join('');
  },

  /**
   * Render stats
   */
  renderStats(results) {
    const total = results.length;
    const high = results.filter(r => r.tier === 'high').length;
    const medium = results.filter(r => r.tier === 'medium').length;
    const saved = Storage.getSaved().length;

    this.animateNumber('stat-total-num', total);
    this.animateNumber('stat-match-num', high);
    this.animateNumber('stat-good-num', medium);
    this.animateNumber('stat-saved-num', saved);
  },

  /**
   * Animate number counting
   */
  animateNumber(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const duration = 800;
    const start = parseInt(el.textContent) || 0;
    const startTime = Date.now();

    function update() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(start + (target - start) * eased);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(update);
    }
    
    requestAnimationFrame(update);
  },

  /**
   * Render match distribution chart
   */
  renderChart(results) {
    const container = document.getElementById('match-chart');
    const header = document.getElementById('chart-section-header');
    
    if (!results || results.length === 0) {
      container.style.display = 'none';
      header.style.display = 'none';
      return;
    }

    header.style.display = 'flex';
    container.style.display = 'block';

    // Group by 10% ranges
    const ranges = [];
    for (let i = 0; i <= 90; i += 10) {
      const upper = i + 10;
      const count = results.filter(r => r.matchScore >= i && r.matchScore < upper).length;
      ranges.push({ label: `${i}-${upper}%`, count, min: i });
    }
    // 100% exact
    const exact100 = results.filter(r => r.matchScore === 100).length;
    if (exact100 > 0) {
      ranges[ranges.length - 1].count += exact100;
    }

    const maxCount = Math.max(...ranges.map(r => r.count), 1);

    container.innerHTML = `
      <div class="chart-bars">
        ${ranges.map(r => {
          const height = Math.max((r.count / maxCount) * 120, 4);
          const colorClass = r.min >= 70 ? 'green' : r.min >= 50 ? 'yellow' : 'red';
          return `
            <div class="chart-bar-group">
              <span class="chart-bar-count">${r.count}</span>
              <div class="chart-bar ${colorClass}" style="height: ${height}px;"></div>
              <span class="chart-bar-label">${r.label}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  /**
   * Render detail modal
   */
  renderDetailModal(item) {
    const scoreColor = item.tier === 'high' ? '#10b981' : item.tier === 'medium' ? '#f59e0b' : '#ef4444';
    const scoreLabel = item.tier === 'high' ? 'Sangat Cocok' : item.tier === 'medium' ? 'Potensial' : 'Kurang Cocok';
    const isSaved = Storage.isSaved(item.id);

    const body = document.getElementById('modal-body');
    body.innerHTML = `
      <h2 class="modal-title">${item.title}</h2>
      <div class="modal-company">${item.company}</div>
      
      <div class="modal-score-section">
        <div class="modal-score-header">
          <div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">Match Score</div>
            <div class="modal-score-big" style="color:${scoreColor}">${item.matchScore}%</div>
          </div>
          <div style="text-align:right;">
            <span class="rec-tag" style="background:${scoreColor}20; color:${scoreColor}; border-color:${scoreColor}40; font-size:0.8rem; padding:4px 12px;">
              ${scoreLabel}
            </span>
          </div>
        </div>
        <div class="score-breakdown">
          ${this.renderScoreBar('Kesesuaian Jurusan', item.breakdown.major)}
          ${this.renderScoreBar('Relevansi Posisi', item.breakdown.title)}
          ${this.renderScoreBar('Pendidikan', item.breakdown.education)}
          ${this.renderScoreBar('Kuota', item.breakdown.quota)}
        </div>
      </div>

      <div class="modal-detail-grid">
        <div class="modal-detail-item">
          <div class="modal-detail-label">Lokasi</div>
          <div class="modal-detail-value">📍 ${item.location}</div>
        </div>
        <div class="modal-detail-item">
          <div class="modal-detail-label">Kuota</div>
          <div class="modal-detail-value">👥 ${item.quota} orang</div>
        </div>
        <div class="modal-detail-item">
          <div class="modal-detail-label">Pendidikan</div>
          <div class="modal-detail-value">🎓 ${item.education.join(', ')}</div>
        </div>
        <div class="modal-detail-item">
          <div class="modal-detail-label">Hari Kerja</div>
          <div class="modal-detail-value">📅 ${item.workDays}</div>
        </div>
      </div>

      <div style="margin-bottom:1.5rem;">
        <div class="modal-detail-label" style="margin-bottom:8px;">Jurusan yang Dibutuhkan</div>
        <div class="skill-tags">
          ${item.majors.map(m => {
            const isMatch = item.matchDetails && item.matchDetails.matchedMajors.map(mm => mm.toLowerCase()).includes(m.toLowerCase());
            return `<span class="skill-tag ${isMatch ? '' : 'soft'}" ${isMatch ? 'style="background:rgba(16,185,129,0.15);color:#10b981;border-color:rgba(16,185,129,0.2);"' : ''}>${isMatch ? '✓ ' : ''}${m}</span>`;
          }).join('')}
        </div>
      </div>

      <div style="display:flex; gap:0.75rem;">
        <a href="${item.url}" target="_blank" rel="noopener" class="btn btn-primary modal-apply-btn" style="flex:1;">
          🚀 Lihat di MagangHub
        </a>
        <button class="btn ${isSaved ? 'btn-outline' : 'btn-outline'}" onclick="toggleBookmark(${item.id}); Renderer.renderDetailModal(getResultById(${item.id}));" style="${isSaved ? 'color:var(--accent-yellow);border-color:var(--accent-yellow);' : ''}">
          ${isSaved ? '★ Tersimpan' : '☆ Simpan'}
        </button>
      </div>
    `;

    document.getElementById('detail-modal').classList.add('active');
  },

  /**
   * Render score breakdown bar
   */
  renderScoreBar(label, value) {
    const colorClass = value >= 70 ? 'green' : value >= 50 ? 'yellow' : 'red';
    return `
      <div class="score-bar-row">
        <span class="score-bar-label">${label}</span>
        <div class="score-bar-track">
          <div class="score-bar-fill ${colorClass}" style="width:${value}%"></div>
        </div>
        <span class="score-bar-val">${value}%</span>
      </div>
    `;
  },

  /**
   * Populate location filter
   */
  populateLocationFilter(listings) {
    const locations = [...new Set(listings.map(l => l.location))].sort();
    const select = document.getElementById('filter-location');
    if (!select) return;
    
    select.innerHTML = '<option value="all">Semua Lokasi</option>' +
      locations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
  },

  /**
   * Populate major filter
   */
  populateMajorFilter(listings) {
    const majors = [...new Set(listings.flatMap(l => l.majors))].sort();
    const select = document.getElementById('filter-major');
    if (!select) return;
    
    select.innerHTML = '<option value="all">Semua Jurusan</option>' +
      majors.map(m => `<option value="${m}">${m}</option>`).join('');
  }
};
