/**
 * Birdie Bush Bandits - Utility Functions
 * Shared functions used across multiple pages
 */

const BBB_UTILS = {
  /**
   * Show status message to user
   * @param {string} message - Message to display
   * @param {string} type - Message type ('success', 'error', 'warning', 'info')
   * @param {number} duration - Duration in ms (default 3000ms)
   */
  showMessage: function(message, type, duration = 3000) {
    const statusElement = document.getElementById('status-message');
    if (!statusElement) {
      console.warn('Status message element not found');
      return;
    }
    
    statusElement.textContent = message;
    statusElement.className = type;
    statusElement.style.display = 'block';
    
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, duration);
  },
  
  /**
   * Safe localStorage wrapper with error handling
   * @param {string} operation - 'get', 'set', or 'remove'
   * @param {string} key - Storage key
   * @param {*} data - Data to store (for 'set' operation)
   * @returns {*} Stored data for 'get', success boolean for others
   */
  safeStorage: function(operation, key, data) {
    try {
      if (operation === 'get') {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } else if (operation === 'set') {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } else if (operation === 'remove') {
        localStorage.removeItem(key);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`localStorage error (${operation}):`, error);
      return operation === 'get' ? null : false;
    }
  },
  
  /**
   * Calculate golf handicap index based on entered scores
   * @param {Array} differentials - Array of score differentials
   * @returns {number} Calculated handicap index
   */
  calculateHandicapIndex: function(differentials) {
    if (!differentials || differentials.length < BBB_CONFIG.handicap.minRounds) {
      return null;
    }
    
    // Sort differentials in ascending order
    differentials.sort((a, b) => a - b);
    
    // Determine how many scores to use
    const count = BBB_CONFIG.handicap.countMap[differentials.length] || 
                  Math.ceil(differentials.length / 3);
    
    // Calculate average of the best differentials
    const avg = differentials.slice(0, count).reduce((sum, val) => sum + val, 0) / count;
    
    // Apply 0.96 multiplier and return
    return (avg * 0.96).toFixed(1);
  },
  
  /**
   * Calculate course handicap from handicap index
   * @param {number} handicapIndex - Player's handicap index
   * @param {number} slopeRating - Course slope rating
   * @returns {number} Calculated course handicap
   */
  calculateCourseHandicap: function(handicapIndex, slopeRating) {
    return Math.round(handicapIndex * slopeRating / 113);
  },
  
  /**
   * Calculate Stableford points for a hole
   * @param {number} grossScore - Player's gross score on the hole
   * @param {number} par - Par value for the hole
   * @param {number} strokes - Number of strokes received on the hole
   * @returns {number} Calculated Stableford points
   */
  calculateStablefordPoints: function(grossScore, par, strokes) {
    const netScore = grossScore - strokes;
    
    if (netScore <= par - 3) return 5;      // Albatross or better
    if (netScore === par - 2) return 4;     // Eagle
    if (netScore === par - 1) return 3;     // Birdie
    if (netScore === par) return 2;         // Par
    if (netScore === par + 1) return 1;     // Bogey
    return 0;                              // Double bogey or worse
  },
  
  /**
   * Get strokes received on a hole based on handicap
   * @param {number} handicap - Player's course handicap
   * @param {number} holeIndex - Stroke index of the hole
   * @returns {number} Number of strokes received
   */
  getStrokesReceived: function(handicap, holeIndex) {
    if (handicap >= holeIndex + 18) return 2;
    if (handicap >= holeIndex) return 1;
    return 0;
  },
  
  /**
   * Format date for display
   * @param {string|Date} date - Date to format
   * @param {string} format - Format style ('short', 'medium', 'long')
   * @returns {string} Formatted date string
   */
  formatDate: function(date, format = 'medium') {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const options = { 
      short: { day: 'numeric', month: 'short', year: 'numeric' },
      medium: { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
      long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    };
    
    return dateObj.toLocaleDateString('en-GB', options[format] || options.medium);
  },
  
  /**
   * Validate form input
   * @param {HTMLElement} form - Form element to validate
   * @returns {boolean} True if form is valid
   */
  validateForm: function(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
      if (input.hasAttribute('required') && !input.value) {
        input.classList.add('missing');
        isValid = false;
      } else {
        input.classList.remove('missing');
      }
    });
    
    return isValid;
  },
  
  /**
   * Debounce function to limit execution frequency
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  debounce: function(func, delay = 200) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  }
};

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BBB_UTILS;
}
