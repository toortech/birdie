/**
 * Birdie Bush Bandits - Updated Database Module
 * Handles data persistence with Cloudflare KV/D1 integration and dynamic member loading
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
    SETTINGS: 'settings'
  },
  
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
  // MEMBER MANAGEMENT FUNCTIONS (NEW)
  // =============================================================================
  
  /**
   * Get all members with caching and fallback support
   * @param {Object} options - Loading options
   * @returns {Promise} - Resolves with members array
   */
  getMembers: async function(options = {}) {
    const defaults = {
      useCache: BBB_CONFIG.memberCache?.enabled || true,
      fallbackToStatic: BBB_CONFIG.memberLoading?.fallbackToStatic || true,
      strategy: BBB_CONFIG.memberLoading?.strategy || 'cloudflare-first'
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
    const maxRetries = BBB_CONFIG.memberLoading?.retryAttempts || 2;
    const retryDelay = BBB_CONFIG.memberLoading?.retryDelay || 1000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}: Loading members from Cloudflare`);
        
        if (this.config.useCloudflare && BBB_CONFIG.cloudflareEnabled) {
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
   * Load members from Cloudflare Auth Worker
   * @returns {Promise} - Resolves with members array
   */
  getMembersFromCloudflare: async function() {
    if (!BBB_CONFIG.authWorkerUrl) {
      throw new Error('Auth Worker URL not configured');
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BBB_CONFIG.apiTimeout || 10000);
    
    try {
      const response = await fetch(`${BBB_CONFIG.authWorkerUrl}/auth/members`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch members');
      }
      
      // Transform Cloudflare member data to standard format
      return this.transformCloudflareMembers(data.members || []);
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  },
  
  /**
   * Transform Cloudflare member data to standard format
   * @param {Array} cloudflareMembers - Raw member data from Cloudflare
   * @returns {Array} - Standardized member objects
   */
  transformCloudflareMembers: function(cloudflareMembers) {
    return cloudflareMembers.map(member => ({
      id: member.id || member.user_id,
      username: member.username,
      display_name: member.display_name || member.first_name || member.username,
      user_id: member.user_id,
      email: member.email,
      role: member.role,
      joined_date: member.joined_date,
      last_login: member.last_login,
      handicap_index: member.handicap_index,
      bio: member.bio,
      favorite_course: member.favorite_course,
      total_rounds: member.total_rounds || 0,
      best_score: member.best_score,
      is_active: member.is_active,
      user_active: member.user_active,
      stats_count: member.stats_count || 0,
      source: 'cloudflare',
      // Add any additional fields
      ...member
    }));
  },
  
  /**
   * Get static members as fallback
   * @returns {Array} - Array of static member objects
   */
  getStaticMembers: function() {
    if (typeof BBB_CONFIG !== 'undefined' && BBB_CONFIG.members?.getStaticMembers) {
      return BBB_CONFIG.members.getStaticMembers();
    }
    
    // Fallback if BBB_CONFIG method not available
    const staticMembers = BBB_CONFIG?.staticMembers || [
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
    if (!BBB_CONFIG.memberCache?.enabled) {
      return;
    }
    
    try {
      const cacheData = {
        members: members,
        timestamp: Date.now(),
        source: members[0]?.source || 'unknown',
        count: members.length
      };
      
      localStorage.setItem(BBB_CONFIG.memberCache.key, JSON.stringify(cacheData));
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
    if (!BBB_CONFIG.memberCache?.enabled) {
      return null;
    }
    
    try {
      const cached = localStorage.getItem(BBB_CONFIG.memberCache.key);
      if (!cached) {
        return null;
      }
      
      const cacheData = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;
      
      if (age > BBB_CONFIG.memberCache.ttl) {
        console.log('Member cache expired');
        localStorage.removeItem(BBB_CONFIG.memberCache.key);
        return null;
      }
      
      console.log('Using cached members:', { count: cacheData.count, age: Math.round(age / 1000) + 's' });
      return cacheData.members;
      
    } catch (error) {
      console.warn('Error reading member cache:', error);
      localStorage.removeItem(BBB_CONFIG.memberCache.key);
      return null;
    }
  },
  
  /**
   * Clear member cache
   */
  clearMemberCache: function() {
    try {
      localStorage.removeItem(BBB_CONFIG.memberCache.key);
      console.log('Member cache cleared');
    } catch (error) {
      console.warn('Error clearing member cache:', error);
    }
  },
  
  /**
   * Get specific member profile
   * @param {string} memberId - Member ID
   * @returns {Promise} - Resolves with member data
   */
  getMemberProfile: async function(memberId) {
    try {
      // First try to get from current members list
      const members = await this.getMembers();
      const member = members.find(m => 
        m.id === memberId || 
        m.username === memberId || 
        m.display_name?.toLowerCase() === memberId.toLowerCase()
      );
      
      if (member) {
        console.log('Found member in members list:', member.display_name);
        return member;
      }
      
      // If not found and using Cloudflare, try direct API call
      if (this.config.useCloudflare && BBB_CONFIG.cloudflareEnabled) {
        console.log('Attempting direct member profile fetch:', memberId);
        return await this.getMemberProfileFromCloudflare(memberId);
      }
      
      // Check if it's a static member
      if (BBB_CONFIG.members?.isStaticMember) {
        const memberName = memberId.charAt(0).toUpperCase() + memberId.slice(1);
        if (BBB_CONFIG.members.isStaticMember(memberName)) {
          return {
            id: memberId,
            username: memberId,
            display_name: memberName,
            user_id: memberId,
            joined_date: '2020-08-01',
            is_active: 1,
            source: 'static',
            role: 'member'
          };
        }
      }
      
      console.log('Member not found:', memberId);
      return null;
      
    } catch (error) {
      console.error(`Error getting member profile for ${memberId}:`, error);
      return null;
    }
  },
  
  /**
   * Get member profile directly from Cloudflare
   * @param {string} memberId - Member ID
   * @returns {Promise} - Resolves with member data
   */
  getMemberProfileFromCloudflare: async function(memberId) {
    try {
      const response = await fetch(`${BBB_CONFIG.authWorkerUrl}/auth/members/${encodeURIComponent(memberId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.member) {
        return this.transformCloudflareMembers([data.member])[0];
      }
      
      return null;
      
    } catch (error) {
      console.error(`Error fetching member profile from Cloudflare:`, error);
      throw error;
    }
  },
  
  /**
   * Refresh members data (clear cache and reload)
   * @returns {Promise} - Resolves with fresh member data
   */
  refreshMembers: async function() {
    console.log('Refreshing members data...');
    
    // Clear cache
    this.clearMemberCache();
    
    // Force reload from source
    return await this.getMembers({ useCache: false });
  },
  
  // =============================================================================
  // EXISTING FUNCTIONS (UNCHANGED)
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
          if (key.startsWith(prefix)) {
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
  },
  
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
  }
};

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BBB_DB;
}
