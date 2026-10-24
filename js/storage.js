// ===== Storage Module =====
const Storage = {
  KEYS: {
    PROFILE: 'mhs_profile',
    LISTINGS: 'mhs_listings',
    RESULTS: 'mhs_results',
    SAVED: 'mhs_saved',
    WEIGHTS: 'mhs_weights',
  },

  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  clearAll() {
    Object.values(this.KEYS).forEach(key => this.remove(key));
  },

  // Profile
  getProfile() {
    return this.get(this.KEYS.PROFILE);
  },

  setProfile(profile) {
    return this.set(this.KEYS.PROFILE, profile);
  },

  // Listings
  getListings() {
    return this.get(this.KEYS.LISTINGS) || [];
  },

  setListings(listings) {
    return this.set(this.KEYS.LISTINGS, listings);
  },

  // Results
  getResults() {
    return this.get(this.KEYS.RESULTS) || [];
  },

  setResults(results) {
    return this.set(this.KEYS.RESULTS, results);
  },

  // Saved/Bookmarked
  getSaved() {
    return this.get(this.KEYS.SAVED) || [];
  },

  toggleSaved(listingId) {
    const saved = this.getSaved();
    const idx = saved.indexOf(listingId);
    if (idx === -1) {
      saved.push(listingId);
    } else {
      saved.splice(idx, 1);
    }
    this.set(this.KEYS.SAVED, saved);
    return idx === -1; // returns true if now saved
  },

  isSaved(listingId) {
    return this.getSaved().includes(listingId);
  },

  // Weights
  getWeights() {
    return this.get(this.KEYS.WEIGHTS) || {
      major: 35,
      title: 30,
      education: 20,
      quota: 15
    };
  },

  setWeights(weights) {
    return this.set(this.KEYS.WEIGHTS, weights);
  }
};
