/**
 * Birdie Bush Bandits - Database Module
 * Handles data persistence with Cloudflare KV/D1 integration
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
