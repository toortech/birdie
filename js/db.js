/**
 * Birdie Bush Bandits - Simple Database Module
 * Handles local storage and data management
 */

const BBB_DB = {
  
  /**
   * Configuration
   */
  config: {
    useCloudflare: false,
    localStoragePrefix: 'bbb_',
    encryptLocalData: false,
    clearOnLogout: true
  },
  
  /**
   * Initialize database module
   * @param {Object} options - Configuration options
   */
  init: function(options = {}) {
    console.log('Initializing BBB_DB...');
    
    // Merge options with defaults
    this.config = { ...this.config, ...options };
    
    console.log('BBB_DB initialized:', this.config);
    return this;
  },
  
  /**
   * Get item from storage
   * @param {string} key - Storage key
   * @returns {any} - Stored value or null
   */
  get: function(key) {
    try {
      const fullKey = this.config.localStoragePrefix + key;
      const value = localStorage.getItem(fullKey);
      
      if (value === null) return null;
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    } catch (error) {
      console.error('Error getting from storage:', error);
      return null;
    }
  },
  
  /**
   * Set item in storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {boolean} - Success status
   */
  set: function(key, value) {
    try {
      const fullKey = this.config.localStoragePrefix + key;
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      localStorage.setItem(fullKey, stringValue);
      return true;
    } catch (error) {
      console.error('Error setting storage:', error);
      return false;
    }
  },
  
  /**
   * Remove item from storage
   * @param {string} key - Storage key
   * @returns {boolean} - Success status
   */
  remove: function(key) {
    try {
      const fullKey = this.config.localStoragePrefix + key;
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error('Error removing from storage:', error);
      return false;
    }
  },
  
  /**
   * Clear all BBB data from storage
   * @returns {boolean} - Success status
   */
  clear: function() {
    try {
      const keysToRemove = [];
      
      // Find all keys with our prefix
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.config.localStoragePrefix)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all found keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log(`Cleared ${keysToRemove.length} BBB storage items`);
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },
  
  /**
   * Get all keys with BBB prefix
   * @returns {Array} - Array of keys
   */
  keys: function() {
    const keys = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.config.localStoragePrefix)) {
          // Remove prefix from key name
          keys.push(key.substring(this.config.localStoragePrefix.length));
        }
      }
    } catch (error) {
      console.error('Error getting keys:', error);
    }
    return keys;
  },
  
  /**
   * Check if key exists
   * @param {string} key - Storage key
   * @returns {boolean} - True if exists
   */
  exists: function(key) {
    const fullKey = this.config.localStoragePrefix + key;
    return localStorage.getItem(fullKey) !== null;
  },
  
  /**
   * Get storage info
   * @returns {Object} - Storage information
   */
  getInfo: function() {
    const keys = this.keys();
    let totalSize = 0;
    
    keys.forEach(key => {
      const value = this.get(key);
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      totalSize += stringValue.length;
    });
    
    return {
      itemCount: keys.length,
      totalSize: totalSize,
      formattedSize: BBB_UTILS ? BBB_UTILS.formatFileSize(totalSize) : `${totalSize} chars`,
      keys: keys
    };
  },
  
  /**
   * Save scorecard data
   * @param {Object} scorecard - Scorecard data
   * @returns {boolean} - Success status
   */
  saveScorecard: function(scorecard) {
    if (!scorecard || !scorecard.id) {
      console.error('Invalid scorecard data');
      return false;
    }
    
    const key = `scorecard_${scorecard.id}`;
    return this.set(key, {
      ...scorecard,
      savedAt: new Date().toISOString()
    });
  },
  
  /**
   * Get scorecard data
   * @param {string} id - Scorecard ID
   * @returns {Object|null} - Scorecard data
   */
  getScorecard: function(id) {
    if (!id) return null;
    const key = `scorecard_${id}`;
    return this.get(key);
  },
  
  /**
   * Get all scorecards for a user
   * @param {string} userId - User ID
   * @returns {Array} - Array of scorecards
   */
  getUserScorecards: function(userId) {
    const keys = this.keys();
    const scorecards = [];
    
    keys.forEach(key => {
      if (key.startsWith('scorecard_')) {
        const scorecard = this.get(key);
        if (scorecard && scorecard.userId === userId) {
          scorecards.push(scorecard);
        }
      }
    });
    
    // Sort by date (newest first)
    return scorecards.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  },
  
  /**
   * Delete scorecard
   * @param {string} id - Scorecard ID
   * @returns {boolean} - Success status
   */
  deleteScorecard: function(id) {
    if (!id) return false;
    const key = `scorecard_${id}`;
    return this.remove(key);
  },
  
  /**
   * Save user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - User preferences
   * @returns {boolean} - Success status
   */
  saveUserPreferences: function(userId, preferences) {
    if (!userId) return false;
    
    const key = `preferences_${userId}`;
    return this.set(key, {
      ...preferences,
      updatedAt: new Date().toISOString()
    });
  },
  
  /**
   * Get user preferences
   * @param {string} userId - User ID
   * @returns {Object} - User preferences
   */
  getUserPreferences: function(userId) {
    if (!userId) return {};
    
    const key = `preferences_${userId}`;
    const preferences = this.get(key);
    
    // Return default preferences if none found
    return preferences || {
      theme: 'default',
      notifications: true,
      defaultCourse: '',
      preferredTee: 'yellow'
    };
  },
  
  /**
   * Save handicap calculation
   * @param {string} userId - User ID
   * @param {Object} handicapData - Handicap calculation data
   * @returns {boolean} - Success status
   */
  saveHandicap: function(userId, handicapData) {
    if (!userId || !handicapData) return false;
    
    const key = `handicap_${userId}`;
    return this.set(key, {
      ...handicapData,
      calculatedAt: new Date().toISOString()
    });
  },
  
  /**
   * Get handicap data
   * @param {string} userId - User ID
   * @returns {Object|null} - Handicap data
   */
  getHandicap: function(userId) {
    if (!userId) return null;
    
    const key = `handicap_${userId}`;
    return this.get(key);
  },
  
  /**
   * Export all user data
   * @param {string} userId - User ID
   * @returns {Object} - All user data
   */
  exportUserData: function(userId) {
    if (!userId) return {};
    
    return {
      scorecards: this.getUserScorecards(userId),
      preferences: this.getUserPreferences(userId),
      handicap: this.getHandicap(userId),
      exportedAt: new Date().toISOString()
    };
  },
  
  /**
   * Import user data
   * @param {string} userId - User ID
   * @param {Object} data - Data to import
   * @returns {boolean} - Success status
   */
  importUserData: function(userId, data) {
    if (!userId || !data) return false;
    
    try {
      // Import scorecards
      if (data.scorecards && Array.isArray(data.scorecards)) {
        data.scorecards.forEach(scorecard => {
          if (scorecard.id) {
            this.saveScorecard(scorecard);
          }
        });
      }
      
      // Import preferences
      if (data.preferences) {
        this.saveUserPreferences(userId, data.preferences);
      }
      
      // Import handicap
      if (data.handicap) {
        this.saveHandicap(userId, data.handicap);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  },
  
  /**
   * Clean up old data
   * @param {number} maxAge - Maximum age in days
   * @returns {number} - Number of items cleaned
   */
  cleanup: function(maxAge = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAge);
    
    const keys = this.keys();
    let cleanedCount = 0;
    
    keys.forEach(key => {
      const data = this.get(key);
      if (data && (data.savedAt || data.updatedAt || data.calculatedAt)) {
        const dataDate = new Date(data.savedAt || data.updatedAt || data.calculatedAt);
        if (dataDate < cutoffDate) {
          this.remove(key);
          cleanedCount++;
        }
      }
    });
    
    console.log(`Cleaned up ${cleanedCount} old data items`);
    return cleanedCount;
  }
};

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BBB_DB;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.BBB_DB = BBB_DB;
}
