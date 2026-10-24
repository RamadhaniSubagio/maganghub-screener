// ===== Matcher Module — Dynamic CV-to-Listing Matching Algorithm =====
// Algoritma ini bersifat DINAMIS: membaca jurusan, pendidikan, dan keyword
// dari file CV yang di-upload oleh pengguna. Tidak ada hardcode.

const Matcher = {
  // Database alias jurusan umum di MagangHub
  // Key = nama grup, Value = variasi nama yang sering muncul di MagangHub
  MAJOR_ALIASES: {
    'informatika': ['teknik informatika', 'informatika', 'ilmu informatika', 'ilmu komputer', 'teknologi informasi', 'sistem dan teknologi informasi', 'pendidikan teknik informatika & komputer', 'pendidikan teknologi informatika dan komputer', 'pendidikan teknologi informasi dan komunikasi', 'teknologi informatika multimedia digital'],
    'sistem informasi': ['sistem informasi', 'sistem informasi bisnis', 'manajemen informatika', 'sistem dan teknologi informasi'],
    'sains data': ['sains data', 'statistika dan sains data', 'sains data terapan', 'teknologi sains data', 'komputasi statistik'],
    'statistika': ['statistika', 'statistik', 'statistika bisnis', 'statistika terapan dan komputasi'],
    'matematika': ['matematika', 'tadris matematika'],
    'teknik elektro': ['teknik elektro', 'teknik elektronika', 'teknik telekomunikasi', 'teknik listrik'],
    'teknik mesin': ['teknik mesin', 'teknik manufaktur', 'teknik industri'],
    'teknik sipil': ['teknik sipil', 'teknik arsitektur', 'arsitektur'],
    'akuntansi': ['akuntansi', 'akuntansi perpajakan', 'akuntansi sektor publik', 'akuntansi keuangan'],
    'manajemen': ['manajemen', 'manajemen bisnis', 'manajemen pemasaran', 'administrasi bisnis', 'bisnis digital'],
    'ilmu komunikasi': ['ilmu komunikasi', 'komunikasi', 'jurnalistik', 'hubungan masyarakat', 'broadcasting'],
    'hukum': ['ilmu hukum', 'hukum', 'hukum bisnis'],
    'psikologi': ['psikologi', 'psikologi industri dan organisasi'],
    'desain': ['desain komunikasi visual', 'dkv', 'desain grafis', 'desain produk', 'multimedia'],
    'farmasi': ['farmasi', 'ilmu farmasi', 'apoteker'],
    'kedokteran': ['kedokteran', 'pendidikan dokter', 'kedokteran gigi'],
    'keperawatan': ['keperawatan', 'ilmu keperawatan', 'profesi ners'],
    'pertanian': ['pertanian', 'agribisnis', 'agroteknologi', 'teknologi pangan'],
    'sastra': ['sastra inggris', 'sastra indonesia', 'pendidikan bahasa inggris', 'bahasa dan sastra'],
  },

  /**
   * Extract user's primary major from their CV profile
   * Reads from education[0].degree and normalizes it
   */
  extractUserMajor(profile) {
    if (!profile.education || profile.education.length === 0) return '';
    const degree = profile.education[0].degree.toLowerCase();
    // Remove common prefixes: S-1, S1, D-3, D3, D-4, D4, etc.
    return degree.replace(/^(s-?[123]|d-?[1234]|profesi|magister|doktor)\s*/i, '').trim();
  },

  /**
   * Extract user's education level from their CV profile
   * Returns: 'sarjana', 'diploma', 'magister', etc.
   */
  extractUserEducationLevel(profile) {
    if (!profile.education || profile.education.length === 0) return 'sarjana';
    const degree = profile.education[0].degree.toLowerCase();
    if (/s-?1|sarjana/i.test(degree)) return 'sarjana';
    if (/s-?2|magister/i.test(degree)) return 'magister';
    if (/s-?3|doktor/i.test(degree)) return 'doktor';
    if (/d-?4/i.test(degree)) return 'sarjana'; // D4 setara S1
    if (/d-?[123]/i.test(degree)) return 'diploma';
    if (/profesi/i.test(degree)) return 'profesi';
    return 'sarjana';
  },

  /**
   * Find which alias group the user's major belongs to
   * Returns the group key (e.g. 'informatika', 'akuntansi') or null
   */
  findUserMajorGroup(profile) {
    const userMajor = this.extractUserMajor(profile);
    if (!userMajor) return null;

    for (const [group, aliases] of Object.entries(this.MAJOR_ALIASES)) {
      if (aliases.some(a => userMajor.includes(a) || a.includes(userMajor)) || group === userMajor) {
        return group;
      }
    }
    return null;
  },

  /**
   * Get the user's matchKeywords from their CV profile
   * Falls back to skills + about text if matchKeywords is not defined
   */
  getUserKeywords(profile) {
    if (profile.matchKeywords && profile.matchKeywords.length > 0) {
      return profile.matchKeywords.map(k => k.toLowerCase());
    }
    // Fallback: combine skills into keywords
    const keywords = [];
    if (profile.skills) {
      if (profile.skills.technical) keywords.push(...profile.skills.technical);
      if (profile.skills.software) keywords.push(...profile.skills.software);
    }
    return keywords.map(k => k.toLowerCase());
  },

  /**
   * Calculate match score between a CV profile and a listing
   * Returns object with total score and breakdown
   */
  calculateScore(profile, listing, weights) {
    const w = weights || Storage.getWeights();
    const totalWeight = w.major + w.title + w.education + w.quota;

    // 1. Major/Jurusan matching (most important)
    const majorScore = this.scoreMajorMatch(profile, listing);

    // 2. Title/Position relevance
    const titleScore = this.scoreTitleRelevance(profile, listing);

    // 3. Education level match
    const educationScore = this.scoreEducationMatch(profile, listing);

    // 4. Quota availability
    const quotaScore = this.scoreQuota(listing);

    // Weighted average
    const rawTotal = (
      (majorScore * w.major) +
      (titleScore * w.title) +
      (educationScore * w.education) +
      (quotaScore * w.quota)
    ) / totalWeight;

    // Round to integer percentage
    const total = Math.round(rawTotal);

    return {
      total,
      breakdown: {
        major: Math.round(majorScore),
        title: Math.round(titleScore),
        education: Math.round(educationScore),
        quota: Math.round(quotaScore)
      },
      matchDetails: {
        matchedMajors: this.getMatchedMajors(profile, listing),
        titleKeywords: this.getMatchedTitleKeywords(profile, listing),
        educationMatch: this.checkEducationMatch(profile, listing)
      }
    };
  },

  /**
   * Score how well the user's major matches the listing requirements
   * DYNAMIC: reads major from profile, not hardcoded
   */
  scoreMajorMatch(profile, listing) {
    const listingMajors = listing.majors.map(m => m.toLowerCase().trim());
    const userMajor = this.extractUserMajor(profile);
    const userGroup = this.findUserMajorGroup(profile);

    if (!userMajor) return 20; // No education data

    let bestScore = 0;

    // Check each alias group in the database
    for (const [group, aliases] of Object.entries(this.MAJOR_ALIASES)) {
      const matchingListingMajors = listingMajors.filter(m =>
        aliases.some(alias => m.includes(alias) || alias.includes(m))
      );

      if (matchingListingMajors.length > 0) {
        if (group === userGroup) {
          // User's exact major group matches listing!
          // Check if it's a direct match vs related field within the group
          const directMatches = matchingListingMajors.filter(m =>
            m.includes(userMajor) || userMajor.includes(m)
          );
          if (directMatches.length > 0) {
            bestScore = Math.max(bestScore, 100); // Exact match
          } else {
            bestScore = Math.max(bestScore, 85); // Same group, slightly different name
          }
        } else {
          // Not user's group — check if it's a related STEM/field
          // Give a moderate score for broadly related fields
          bestScore = Math.max(bestScore, 40);
        }
      }
    }

    // Direct keyword match in listing majors (catches unlisted groups)
    if (bestScore < 80) {
      const directMatch = listingMajors.some(m =>
        m.includes(userMajor) || userMajor.includes(m)
      );
      if (directMatch) {
        bestScore = Math.max(bestScore, 100);
      }
    }

    // If still no match, check for partial keyword matches from user's keywords
    if (bestScore === 0) {
      const userKeywords = this.getUserKeywords(profile);
      const hasPartialMatch = listingMajors.some(m =>
        userKeywords.some(k => m.includes(k) || k.includes(m))
      );
      if (hasPartialMatch) bestScore = 35;
    }

    return bestScore;
  },

  /**
   * Score how relevant the position title is for the user
   * DYNAMIC: uses profile.matchKeywords instead of hardcoded keywords
   */
  scoreTitleRelevance(profile, listing) {
    const title = listing.title.toLowerCase();
    const userKeywords = this.getUserKeywords(profile);

    if (userKeywords.length === 0) return 50; // No keywords defined

    // Count how many user keywords match the title
    const matchedKeywords = userKeywords.filter(kw => title.includes(kw));
    const matchRatio = matchedKeywords.length / Math.min(userKeywords.length, 5);

    if (matchedKeywords.length >= 3) return 100; // Excellent match — multiple keywords hit
    if (matchedKeywords.length === 2) return 90;
    if (matchedKeywords.length === 1) {
      // Single keyword match — score based on keyword specificity
      const kw = matchedKeywords[0];
      // Longer keywords are more specific and thus more valuable
      if (kw.length >= 10) return 85;
      if (kw.length >= 5) return 70;
      return 55;
    }

    // No direct keyword match — check partial overlaps with title words
    const titleWords = title.split(/[\s\-\/,]+/).filter(w => w.length > 2);
    const keywordWords = userKeywords.flatMap(k => k.split(/[\s\-\/,]+/).filter(w => w.length > 2));
    const wordOverlap = titleWords.filter(tw => keywordWords.some(kw => tw.includes(kw) || kw.includes(tw)));

    if (wordOverlap.length >= 2) return 50;
    if (wordOverlap.length === 1) return 35;

    return 15;
  },

  /**
   * Score education level compatibility
   * DYNAMIC: reads education level from profile
   */
  scoreEducationMatch(profile, listing) {
    const userLevel = this.extractUserEducationLevel(profile);
    const listingEdu = listing.education.map(e => e.toLowerCase());

    // Direct match
    if (listingEdu.includes(userLevel)) return 100;

    // User overqualified (S1 applying to D3 position = still eligible)
    const levelHierarchy = ['diploma', 'sarjana', 'profesi', 'magister', 'doktor'];
    const userIdx = levelHierarchy.indexOf(userLevel);

    for (const edu of listingEdu) {
      const eduIdx = levelHierarchy.indexOf(edu);
      if (eduIdx !== -1 && userIdx !== -1) {
        if (userIdx > eduIdx) return 70; // Overqualified
        if (userIdx < eduIdx) return 40; // Under-qualified
      }
    }

    return 30;
  },

  /**
   * Score based on available quota (higher quota = easier to get in)
   */
  scoreQuota(listing) {
    const q = listing.quota;
    if (q >= 10) return 100;
    if (q >= 5) return 90;
    if (q >= 3) return 80;
    if (q >= 2) return 70;
    return 50; // 1 quota is competitive
  },

  /**
   * Check education match for details
   */
  checkEducationMatch(profile, listing) {
    const userLevel = this.extractUserEducationLevel(profile);
    const listingEdu = listing.education.map(e => e.toLowerCase());
    return listingEdu.includes(userLevel);
  },

  /**
   * Get matched majors for display
   */
  getMatchedMajors(profile, listing) {
    const matched = [];
    const listingMajors = listing.majors.map(m => m.toLowerCase().trim());
    const userMajor = this.extractUserMajor(profile);
    const userGroup = this.findUserMajorGroup(profile);

    // Check direct user major match
    for (const major of listingMajors) {
      if (major.includes(userMajor) || userMajor.includes(major)) {
        matched.push(listing.majors.find(m => m.toLowerCase().trim() === major) || major);
      }
    }

    // Check alias group match
    if (userGroup && this.MAJOR_ALIASES[userGroup]) {
      const aliases = this.MAJOR_ALIASES[userGroup];
      for (const major of listingMajors) {
        if (aliases.some(a => major.includes(a) || a.includes(major))) {
          const original = listing.majors.find(m => m.toLowerCase().trim() === major) || major;
          if (!matched.includes(original)) {
            matched.push(original);
          }
        }
      }
    }

    return [...new Set(matched)];
  },

  /**
   * Get matched title keywords
   * DYNAMIC: uses profile matchKeywords
   */
  getMatchedTitleKeywords(profile, listing) {
    const title = listing.title.toLowerCase();
    const userKeywords = this.getUserKeywords(profile);
    return userKeywords.filter(kw => title.includes(kw));
  },

  /**
   * Run full screening: match all listings against profile
   * Returns sorted array with scores
   */
  screenAll(profile, listings, weights) {
    const results = listings.map(listing => {
      const score = this.calculateScore(profile, listing, weights);
      return {
        ...listing,
        matchScore: score.total,
        breakdown: score.breakdown,
        matchDetails: score.matchDetails,
        tier: score.total >= 70 ? 'high' : score.total >= 50 ? 'medium' : 'low'
      };
    });

    // Sort by score descending
    results.sort((a, b) => b.matchScore - a.matchScore);
    return results;
  }
};
