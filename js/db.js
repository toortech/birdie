/**
 * Birdie Bush Bandits - Complete Enhanced Database Module
 * Handles data persistence with course data management and all existing functionality
 */

const BBB_DB = {
  /**
   * Configuration
   */
  config: {
    useCloudflare: false,        // Set to true when Cloudflare integration is ready
    localStoragePrefix: 'bbb_',  // Prefix for localStorage keys
    apiEndpoint: '/api',         // Base endpoint for API requests
  },
  
  /**
   * Storage collections
   */
  collections: {
    SCORECARDS: 'scorecards',
    MEMBERS: 'members',
    HANDICAPS: 'handicaps',
    GALLERY: 'gallery',
    SETTINGS: 'settings',
    COURSES: 'courses'  // Course data collection
  },

  // =============================================================================
  // COURSE DATA MANAGEMENT
  // =============================================================================

  /**
   * Golf course data - centralized in DB module
   */
  courseData: {
    "Richings Park Golf Club": {
      shortName: "Richings",
      fullName: "Richings Park Golf Club",
      location: "Iver, Buckinghamshire",
      par: [4,3,5,4,4,3,4,4,4,3,4,4,4,3,4,4,5,4],
      si:  [15,4,12,18,16,14,2,6,8,11,3,17,10,7,5,1,13,9],
      yards: {
        white: [287,199,545,345,335,165,397,299,388,172,417,328,356,201,420,431,423,402],
        yellow: [265,188,534,335,322,149,383,284,364,162,373,318,344,188,391,392,513,380],
        red: [237,158,490,300,289,130,353,257,344,132,351,294,323,177,391,337,479,360]
      },
      tees: {
        white: {courseRating: 70.7, slopeRating: 128, name: "White Tees"},
        yellow: {courseRating: 68.3, slopeRating: 121, name: "Yellow Tees"},
        red: {courseRating: 65.9, slopeRating: 115, name: "Red Tees"}
      },
      totalPar: 72,
      totalYards: {
        white: 6182,
        yellow: 5883,
        red: 5432
      }
    },
    
    "Thorney Park Golf Club": {
      shortName: "Thorney",
      fullName: "Thorney Park Golf Club",
      location: "Iver, Buckinghamshire",
      par: [5,4,4,3,5,4,4,3,5,4,4,3,5,4,4,3,5,4],
      si:  [9,15,1,17,5,13,3,11,7,16,2,14,6,18,4,12,8,10],
      yards: {
        white: [475,360,410,155,495,345,375,160,500,350,370,150,480,355,385,145,505,365],
        yellow: [460,345,395,145,480,330,360,150,485,335,355,140,465,340,370,135,490,350],
        red: [440,320,370,130,450,305,335,135,455,310,330,125,435,315,345,120,460,325]
      },
      tees: {
        white: {courseRating: 68.7, slopeRating: 120, name: "White Tees"},
        yellow: {courseRating: 67.0, slopeRating: 117, name: "Yellow Tees"},
        red: {courseRating: 69.3, slopeRating: 119, name: "Red Tees"}
      },
      totalPar: 72,
      totalYards: {
        white: 6505,
        yellow: 6280,
        red: 5885
      }
    },
    
    "London Airlinks Golf Club": {
      shortName: "Airlinks",
      fullName: "London Airlinks Golf Club",
      location: "Southall, London",
      par: [4,3,4,5,3,4,4,5,4,3,4,4,5,3,4,4,3,5],
      si:  [6,14,4,10,16,2,8,12,1,18,7,5,11,17,3,9,15,13],
      yards: {
        white: [375,185,420,510,175,450,380,520,430,165,410,365,525,170,445,375,180,540],
        yellow: [360,175,405,495,165,435,365,510,415,155,395,355,515,160,430,365,170,525],
        red: [345,165,385,470,150,410,345,480,395,145,375,335,485,145,405,345,155,495]
      },
      tees: {
        white: {courseRating: 63.4, slopeRating: 102, name: "White Tees"},
        yellow: {courseRating: 62.0, slopeRating: 98, name: "Yellow Tees"},
        red: {courseRating: 61.1, slopeRating: 92, name: "Red Tees"}
      },
      totalPar: 72,
      totalYards: {
        white: 6620,
        yellow: 6485,
        red: 6180
      }
    },
    
    "Royal Ascot Golf Club": {
      shortName: "Ascot",
      fullName: "Royal Ascot Golf Club",
      location: "Ascot, Berkshire",
      par: [4,4,3,4,5,4,3,4,5,4,3,4,5,3,4,4,3,5],
      si:  [5,11,15,1,9,3,17,7,13,4,18,6,10,16,2,8,14,12],
      yards: {
        white: [410,385,175,440,525,430,180,415,545,425,170,435,530,185,445,405,175,540],
        yellow: [395,370,165,425,510,415,170,400,530,410,160,420,515,175,430,390,165,525],
        red: [365,340,145,395,480,385,150,370,500,380,140,390,485,155,400,360,145,495]
      },
      tees: {
        white: {courseRating: 70.3, slopeRating: 123, name: "White Tees"},
        yellow: {courseRating: 68.5, slopeRating: 118, name: "Yellow Tees"},
        red: {courseRating: 70.0, slopeRating: 113, name: "Red Tees"}
      },
      totalPar: 72,
      totalYards: {
        white: 7020,
        yellow: 6740,
        red: 6280
      }
    },
    
    "Stoke Park Golf Club": {
      shortName: "Stoke",
      fullName: "Stoke Park Golf Club",
      location: "Stoke Poges, Buckinghamshire",
      par: [4,5,3,4,4,3,4,4,5,4,3,4,5,4,3,4,5,4],
      si:  [7,15,11,1,9,17,5,3,13,8,18,4,10,2,16,6,12,14],
      yards: {
        white: [405,510,190,450,430,175,415,425,535,420,165,440,520,430,180,425,545,410],
        yellow: [390,495,180,435,415,165,400,410,520,405,155,425,505,415,170,410,530,395],
        red: [360,465,160,405,385,145,370,380,490,375,135,395,475,385,150,380,500,365]
      },
      tees: {
        white: {courseRating: 70.9, slopeRating: 126, name: "White Tees"},
        yellow: {courseRating: 69.1, slopeRating: 122, name: "Yellow Tees"},
        red: {courseRating: 68.5, slopeRating: 118, name: "Red Tees"}
      },
      totalPar: 72,
      totalYards: {
        white: 6960,
        yellow: 6710,
        red: 6270
      }
    },
    
    "Inspirations Golf Club": {
      shortName: "Inspirations",
      fullName: "Inspirations Golf Club",
      location: "Eastcote, London",
      par: [5,4,3,4,5,3,4,4,5,4,3,4,5,4,3,4,4,5],
      si:  [11,5,17,1,9,15,3,7,13,4,18,6,10,2,16,8,14,12],
      yards: {
        white: [530,440,185,460,540,175,445,430,555,435,180,450,535,465,170,425,410,540],
        yellow: [515,425,175,445,525,165,430,415,540,420,170,435,520,450,160,410,395,525],
        red: [485,395,155,415,495,145,400,385,510,390,150,405,490,420,140,380,365,495]
      },
      tees: {
        white: {courseRating: 74.3, slopeRating: 128, name: "White Tees"},
        yellow: {courseRating: 72.1, slopeRating: 124, name: "Yellow Tees"},
        red: {courseRating: 70.5, slopeRating: 120, name: "Red Tees"}
      },
      totalPar: 72,
      totalYards: {
        white: 7275,
        yellow: 7005,
        red: 6530
      }
    }
  },

  /**
   * Tee color configuration
   */
  teeColors: {
    white: { name: "White", difficulty: "Championship" },
    yellow: { name: "Yellow", difficulty: "Regular" },
    red: { name: "Red", difficulty: "Forward" }
  },

  /**
   * Get all available courses
   * @returns {Object} - All course data
   */
  getCourses: function() {
    try {
      // Try to get from storage first (for future dynamic course management)
      const storedCourses = this.localGet(this.collections.COURSES, 'all');
      
      if (storedCourses && Object.keys(storedCourses).length > 0) {
        console.log('Using stored course data');
        return storedCourses;
      }
      
      // Fall back to static course data
      console.log('Using static course data');
      return this.courseData;
      
    } catch (error) {
      console.warn('Error getting courses, using static data:', error);
      return this.courseData;
    }
  },

  /**
   * Get course names for dropdown population
   * @returns {Array} - Array of course names
   */
  getCourseNames: function() {
    const courses = this.getCourses();
    return Object.keys(courses).sort();
  },

  /**
   * Get specific course data
   * @param {string} courseName - Name of the course
   * @returns {Object|null} - Course data or null if not found
   */
  getCourse: function(courseName) {
    const courses = this.getCourses();
    return courses[courseName] || null;
  },

  /**
   * Get course rating and slope for specific tee
   * @param {string} courseName - Name of the course
   * @param {string} teeColor - Tee color (white, yellow, red)
   * @returns {Object|null} - {courseRating, slopeRating} or null
   */
  getCourseRatings: function(courseName, teeColor) {
    const course = this.getCourse(courseName);
    
    if (!course || !course.tees || !course.tees[teeColor]) {
      console.warn(`Course ratings not found: ${courseName}, ${teeColor}`);
      return null;
    }
    
    return {
      courseRating: course.tees[teeColor].courseRating,
      slopeRating: course.tees[teeColor].slopeRating,
      name: course.tees[teeColor].name
    };
  },

  /**
   * Get available tee colors for a course
   * @param {string} courseName - Name of the course
   * @returns {Array} - Array of available tee colors
   */
  getAvailableTees: function(courseName) {
    const course = this.getCourse(courseName);
    
    if (!course || !course.tees) {
      return Object.keys(this.teeColors); // Return default tees
    }
    
    return Object.keys(course.tees);
  },

  /**
   * Calculate score differential for a round
   * @param {number} score - Gross score
   * @param {string} courseName - Course name
   * @param {string} teeColor - Tee color
   * @returns {number|null} - Score differential or null if calculation fails
   */
  calculateDifferential: function(score, courseName, teeColor) {
    const ratings = this.getCourseRatings(courseName, teeColor);
    
    if (!ratings || !score) {
      return null;
    }
    
    // Formula: (Score - Course Rating) * 113 / Slope Rating
    const differential = ((score - ratings.courseRating) * 113) / ratings.slopeRating;
    
    return Math.round(differential * 10) / 10; // Round to 1 decimal place
  },

  /**
   * Get course statistics
   * @param {string} courseName - Course name
   * @returns {Object|null} - Course statistics
   */
  getCourseStats: function(courseName) {
    const course = this.getCourse(courseName);
    
    if (!course) {
      return null;
    }
    
    return {
      name: course.fullName || courseName,
      shortName: course.shortName,
      location: course.location,
      totalPar: course.totalPar || course.par.reduce((sum, p) => sum + p, 0),
      totalYards: course.totalYards,
      holes: course.par.length,
      availableTees: this.getAvailableTees(courseName)
    };
  },

  /**
   * Enhanced handicap calculation with course data integration
   * @param {Array} rounds - Array of round objects {score, courseName, teeColor}
   * @returns {Object} - {handicapIndex, differentials, roundsUsed}
   */
  calculateHandicapFromRounds: function(rounds) {
    if (!rounds || rounds.length < 3) {
      return { error: 'Minimum 3 rounds required for handicap calculation' };
    }
    
    // Calculate differentials for each round
    const differentials = [];
    const validRounds = [];
    
    rounds.forEach((round, index) => {
      const differential = this.calculateDifferential(
        round.score, 
        round.courseName, 
        round.teeColor
      );
      
      if (differential !== null) {
        differentials.push(differential);
        validRounds.push({
          ...round,
          differential: differential,
          index: index + 1
        });
      } else {
        console.warn(`Could not calculate differential for round ${index + 1}`);
      }
    });
    
    if (differentials.length < 3) {
      return { error: 'Minimum 3 valid rounds required for handicap calculation' };
    }
    
    // Use BBB_UTILS calculation if available, otherwise calculate directly
    let handicapIndex;
    if (typeof BBB_UTILS !== 'undefined' && BBB_UTILS.calculateHandicapIndex) {
      handicapIndex = BBB_UTILS.calculateHandicapIndex(differentials);
    } else {
      // Fallback calculation
      differentials.sort((a, b) => a - b);
      const countToUse = this.getHandicapRoundsToUse(differentials.length);
      const average = differentials.slice(0, countToUse).reduce((sum, diff) => sum + diff, 0) / countToUse;
      handicapIndex = (average * 0.96).toFixed(1);
    }
    
    return {
      handicapIndex: parseFloat(handicapIndex),
      differentials: differentials,
      validRounds: validRounds,
      roundsUsed: this.getHandicapRoundsToUse(differentials.length),
      calculatedAt: new Date().toISOString()
    };
  },

  /**
   * Get number of rounds to use for handicap calculation
   * @param {number} totalRounds - Total number of rounds
   * @returns {number} - Number of rounds to use
   */
  getHandicapRoundsToUse: function(totalRounds) {
    const countMap = {
      3: 1, 4: 1, 5: 1, 6: 2, 7: 2, 8: 2, 9: 3, 10: 3, 
      11: 3, 12: 4, 13: 4, 14: 4, 15: 5, 16: 5, 17: 6, 
      18: 7, 19: 8, 20: 10
    };
    
    return countMap[totalRounds] || Math.min(10, Math.floor(totalRounds / 2));
  },

  // =============================================================================
  // CORE DATABASE FUNCTIONS
  // =============================================================================
  
  /**
   * Initialize database module
   * @param {Object} options - Configuration options
   */
  init: function(options = {}) {
    this.config = { ...this.config, ...options };
    return this;
  },
  
  /**
   * Get an item from storage
   * @param {string} collection - Collection name
   * @param {string|null} id - Item ID (null for entire collection)
   * @returns {Promise} - Resolves with data
   */
  get: async function(collection, id = null) {
    try {
      if (this.config.useCloudflare) {
        try {
          return await this.cloudflareGet(collection, id);
        } catch (cloudflareError) {
          console.warn(`Cloudflare get failed for ${collection}/${id}, falling back to local storage: ${cloudflareError.message}`);
          return this.localGet(collection, id);
        }
      } else {
        return this.localGet(collection, id);
      }
    } catch (error) {
      console.error(`Error getting ${collection}/${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Save an item to storage
   * @param {string} collection - Collection name
   * @param {string} id - Item ID
   * @param {*} data - Data to save
   * @returns {Promise} - Resolves when complete
   */
  save: async function(collection, id, data) {
    try {
      if (this.config.useCloudflare) {
        try {
          return await this.cloudflareSave(collection, id, data);
        } catch (cloudflareError) {
          console.warn(`Cloudflare save failed for ${collection}/${id}, falling back to local storage: ${cloudflareError.message}`);
          return this.localSave(collection, id, data);
        }
      } else {
        return this.localSave(collection, id, data);
      }
    } catch (error) {
      console.error(`Error saving ${collection}/${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete an item from storage
   * @param {string} collection - Collection name
   * @param {string} id - Item ID
   * @returns {Promise} - Resolves when complete
   */
  delete: async function(collection, id) {
    try {
      if (this.config.useCloudflare) {
        try {
          return await this.cloudflareDelete(collection, id);
        } catch (cloudflareError) {
          console.warn(`Cloudflare delete failed for ${collection}/${id}, falling back to local storage: ${cloudflareError.message}`);
          return this.localDelete(collection, id);
        }
      } else {
        return this.localDelete(collection, id);
      }
    } catch (error) {
      console.error(`Error deleting ${collection}/${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Query items from storage
   * @param {string} collection - Collection name
   * @param {Function} filterFn - Filter function
   * @returns {Promise} - Resolves with filtered items
   */
  query: async function(collection, filterFn) {
    try {
      if (this.config.useCloudflare) {
        try {
          return await this.cloudflareQuery(collection, filterFn);
        } catch (cloudflareError) {
          console.warn(`Cloudflare query failed for ${collection}, falling back to local storage: ${cloudflareError.message}`);
          return this.localQuery(collection, filterFn);
        }
      } else {
        return this.localQuery(collection, filterFn);
      }
    } catch (error) {
      console.error(`Error querying ${collection}:`, error);
      throw error;
    }
  },

  // =============================================================================
  // MEMBER MANAGEMENT FUNCTIONS
  // =============================================================================
  
  /**
   * Get all members with caching and fallback support
   * @param {Object} options - Loading options
   * @returns {Promise} - Resolves with members array
   */
  getMembers: async function(options = {}) {
    const defaults = {
      useCache: true,
      fallbackToStatic: true,
      strategy: 'cloudflare-first'
    };
    
    const settings = { ...defaults, ...options };
    
    console.log('Getting members with strategy:', settings.strategy);
    
    try {
      // Check cache first if enabled
      if (settings.useCache) {
        const cached = this.getCachedMembers();
        if (cached) {
          console.log('Returning cached members:', cached.length);
          return cached;
        }
      }
      
      // Strategy-based loading
      switch (settings.strategy) {
        case 'cloudflare-first':
          return await this.getMembersCloudflareFirst(settings);
          
        case 'static-only':
          return this.getStaticMembers();
          
        case 'cache-first':
          // Cache check already done above, fall through to cloudflare-first
          return await this.getMembersCloudflareFirst(settings);
          
        default:
          return await this.getMembersCloudflareFirst(settings);
      }
      
    } catch (error) {
      console.error('Error in getMembers:', error);
      
      // Final fallback to static members
      if (settings.fallbackToStatic) {
        console.log('Using static members as final fallback');
        return this.getStaticMembers();
      }
      
      throw error;
    }
  },
  
  /**
   * Try Cloudflare first, fallback to static
   * @param {Object} settings - Loading settings
   * @returns {Promise} - Resolves with members array
   */
  getMembersCloudflareFirst: async function(settings) {
    const maxRetries = 2;
    const retryDelay = 1000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}: Loading members from Cloudflare`);
        
        if (this.config.useCloudflare) {
          const members = await this.getMembersFromCloudflare();
          
          if (members && members.length > 0) {
            // Cache the results
            this.cacheMembers(members);
            console.log('Successfully loaded members from Cloudflare:', members.length);
            return members;
          }
        }
        
        throw new Error('Cloudflare returned no members or is disabled');
        
      } catch (cloudflareError) {
        console.warn(`Cloudflare attempt ${attempt} failed:`, cloudflareError.message);
        
        if (attempt < maxRetries) {
          console.log(`Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    // If all Cloudflare attempts failed, use static fallback
    if (settings.fallbackToStatic) {
      console.log('All Cloudflare attempts failed, using static members');
      return this.getStaticMembers();
    }
    
    throw new Error('Failed to load members from Cloudflare and static fallback disabled');
  },
  
  /**
   * Get static members as fallback
   * @returns {Array} - Array of static member objects
   */
  getStaticMembers: function() {
    const staticMembers = [
      "Amrit", "Kam", "Vish", "Ravi", "Bal", "Vick", 
      "Michael", "Justy", "Phuperjee", "Indy", "Maj", "Sama"
    ];
    
    return staticMembers.map(name => ({
      id: name.toLowerCase(),
      username: name.toLowerCase(),
      display_name: name,
      user_id: name.toLowerCase(),
      joined_date: '2020-08-01',
      is_active: 1,
      source: 'static',
      role: 'member'
    }));
  },

  /**
   * Cache members data
   * @param {Array} members - Members to cache
   */
  cacheMembers: function(members) {
    try {
      const cacheData = {
        members: members,
        timestamp: Date.now(),
        source: members[0]?.source || 'unknown',
        count: members.length
      };
      
      localStorage.setItem('bbb_members_cache', JSON.stringify(cacheData));
      console.log('Cached members data:', { count: members.length, source: cacheData.source });
    } catch (error) {
      console.warn('Failed to cache members:', error);
    }
  },
  
  /**
   * Get cached members if valid
   * @returns {Array|null} - Cached members or null if invalid/expired
   */
  getCachedMembers: function() {
    try {
      const cached = localStorage.getItem('bbb_members_cache');
      if (!cached) {
        return null;
      }
      
      const cacheData = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;
      const ttl = 5 * 60 * 1000; // 5 minutes
      
      if (age > ttl) {
        console.log('Member cache expired');
        localStorage.removeItem('bbb_members_cache');
        return null;
      }
      
      console.log('Using cached members:', { count: cacheData.count, age: Math.round(age / 1000) + 's' });
      return cacheData.members;
      
    } catch (error) {
      console.warn('Error reading member cache:', error);
      localStorage.removeItem('bbb_members_cache');
      return null;
    }
  },

  // =============================================================================
  // HANDICAP FUNCTIONS
  // =============================================================================

  /**
   * Get handicap data for a member
   * @param {string} memberId - Member ID
   * @returns {Promise} - Resolves with handicap data
   */
  getMemberHandicap: async function(memberId) {
    try {
      return await this.get(this.collections.HANDICAPS, memberId);
    } catch (error) {
      console.error(`Error getting handicap for ${memberId}:`, error);
      return null;
    }
  },
  
  /**
   * Save handicap data for a member
   * @param {string} memberId - Member ID
   * @param {Object} handicapData - Handicap data
   * @returns {Promise} - Resolves when complete
   */
  saveMemberHandicap: async function(memberId, handicapData) {
    try {
      return await this.save(this.collections.HANDICAPS, memberId, handicapData);
    } catch (error) {
      console.error(`Error saving handicap for ${memberId}:`, error);
      throw error;
    }
  },

  // =============================================================================
  // SCORECARD FUNCTIONS
  // =============================================================================
  
  /**
   * Get all scorecards
   * @returns {Promise} - Resolves with scorecards
   */
  getScorecards: async function() {
    try {
      return await this.get(this.collections.SCORECARDS);
    } catch (error) {
      console.error('Error getting scorecards:', error);
      return {};
    }
  },
  
  /**
   * Save a scorecard
   * @param {Object} scorecard - Scorecard data
   * @returns {Promise} - Resolves when complete
   */
  saveScorecard: async function(scorecard) {
    try {
      // Generate ID if not provided
      const id = scorecard.id || `sc_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      scorecard.id = id;
      
      // Add timestamp if not provided
      if (!scorecard.createdAt) {
        scorecard.createdAt = new Date().toISOString();
      }
      
      return await this.save(this.collections.SCORECARDS, id, scorecard);
    } catch (error) {
      console.error('Error saving scorecard:', error);
      throw error;
    }
  },
  
  /**
   * Delete a scorecard
   * @param {string} id - Scorecard ID
   * @returns {Promise} - Resolves when complete
   */
  deleteScorecard: async function(id) {
    try {
      return await this.delete(this.collections.SCORECARDS, id);
    } catch (error) {
      console.error(`Error deleting scorecard ${id}:`, error);
      throw error;
    }
  },

  // =============================================================================
  // GALLERY FUNCTIONS
  // =============================================================================
  
  /**
   * Get gallery images
   * @returns {Promise} - Resolves with gallery images
   */
  getGalleryImages: async function() {
    try {
      const gallery = await this.get(this.collections.GALLERY, 'images');
      return gallery || { images: [] };
    } catch (error) {
      console.error('Error getting gallery images:', error);
      return { images: [] };
    }
  },
  
  /**
   * Save gallery image
   * @param {Object} imageData - Image data
   * @returns {Promise} - Resolves when complete
   */
  saveGalleryImage: async function(imageData) {
    try {
      // Get existing gallery
      const gallery = await this.getGalleryImages();
      
      // Add new image
      const newImage = {
        id: `img_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        src: imageData.src,
        alt: imageData.alt || 'Gallery image',
        uploadedAt: new Date().toISOString()
      };
      
      gallery.images.push(newImage);
      
      // Save gallery
      return await this.save(this.collections.GALLERY, 'images', gallery);
    } catch (error) {
      console.error('Error saving gallery image:', error);
      throw error;
    }
  },
  
  /**
   * Delete gallery image
   * @param {string} imageId - Image ID
   * @returns {Promise} - Resolves when complete
   */
  deleteGalleryImage: async function(imageId) {
    try {
      // Get existing gallery
      const gallery = await this.getGalleryImages();
      
      // Remove image with matching ID
      gallery.images = gallery.images.filter(img => img.id !== imageId);
      
      // Save gallery
      return await this.save(this.collections.GALLERY, 'images', gallery);
    } catch (error) {
      console.error(`Error deleting gallery image ${imageId}:`, error);
      throw error;
    }
  },

  // =============================================================================
  // CLOUDFLARE STUB FUNCTIONS
  // =============================================================================
  
  /**
   * Get from Cloudflare KV/D1
   * @param {string} collection - Collection name
   * @param {string|null} id - Item ID
   * @returns {Promise} - Resolves with data
   */
  cloudflareGet: async function(collection, id) {
    // This will be implemented when Cloudflare integration is ready
    const endpoint = id 
      ? `${this.config.apiEndpoint}/${collection}/${id}` 
      : `${this.config.apiEndpoint}/${collection}`;
      
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },
  
  /**
   * Save to Cloudflare KV/D1
   * @param {string} collection - Collection name
   * @param {string} id - Item ID
   * @param {*} data - Data to save
   * @returns {Promise} - Resolves when complete
   */
  cloudflareSave: async function(collection, id, data) {
    // This will be implemented when Cloudflare integration is ready
    const endpoint = `${this.config.apiEndpoint}/${collection}/${id}`;
    
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },
  
  /**
   * Delete from Cloudflare KV/D1
   * @param {string} collection - Collection name
   * @param {string} id - Item ID
   * @returns {Promise} - Resolves when complete
   */
  cloudflareDelete: async function(collection, id) {
    // This will be implemented when Cloudflare integration is ready
    const endpoint = `${this.config.apiEndpoint}/${collection}/${id}`;
    
    const response = await fetch(endpoint, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return true;
  },
  
  /**
   * Query from Cloudflare KV/D1
   * @param {string} collection - Collection name
   * @param {Object} query - Query parameters
   * @returns {Promise} - Resolves with filtered items
   */
  cloudflareQuery: async function(collection, query) {
    // This will be implemented when Cloudflare integration is ready
    const endpoint = `${this.config.apiEndpoint}/${collection}/query`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },

  // =============================================================================
  // LOCAL STORAGE FUNCTIONS
  // =============================================================================
  
  /**
   * Get from localStorage
   * @param {string} collection - Collection name
   * @param {string|null} id - Item ID
   * @returns {*} - Data
   */
  localGet: function(collection, id) {
    try {
      if (id) {
        // Get single item
        const item = localStorage.getItem(`${this.config.localStoragePrefix}${collection}_${id}`);
        return item ? JSON.parse(item) : null;
      } else {
        // Get entire collection
        const prefix = `${this.config.localStoragePrefix}${collection}_`;
        const items = {};
        
        // Iterate over all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          
          // If key starts with our prefix, it's part of our collection
          if (key && key.startsWith(prefix)) {
            const id = key.substring(prefix.length);
            items[id] = JSON.parse(localStorage.getItem(key));
          }
        }
        
        return items;
      }
    } catch (error) {
      console.error('localStorage get error:', error);
      return id ? null : {};
    }
  },
  
  /**
   * Save to localStorage
   * @param {string} collection - Collection name
   * @param {string} id - Item ID
   * @param {*} data - Data to save
   * @returns {boolean} - Success
   */
  localSave: function(collection, id, data) {
    try {
      const key = `${this.config.localStoragePrefix}${collection}_${id}`;
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('localStorage save error:', error);
      return false;
    }
  },
  
  /**
   * Delete from localStorage
   * @param {string} collection - Collection name
   * @param {string} id - Item ID
   * @returns {boolean} - Success
   */
  localDelete: function(collection, id) {
    try {
      const key = `${this.config.localStoragePrefix}${collection}_${id}`;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('localStorage delete error:', error);
      return false;
    }
  },
  
  /**
   * Query localStorage
   * @param {string} collection - Collection name
   * @param {Function} filterFn - Filter function
   * @returns {Object} - Filtered items
   */
  localQuery: function(collection, filterFn) {
    try {
      // Get all items in collection
      const allItems = this.localGet(collection);
      
      // If no filter function, return all items
      if (!filterFn) return allItems;
      
      // Filter items
      const filteredItems = {};
      for (const [id, item] of Object.entries(allItems)) {
        if (filterFn(item, id)) {
          filteredItems[id] = item;
        }
      }
      
      return filteredItems;
    } catch (error) {
      console.error('localStorage query error:', error);
      return {};
    }
  }
};

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BBB_DB;
}
