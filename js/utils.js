/**
 * Birdie Bush Bandits - Utility Functions
 * Essential helper functions for BBB website
 */

const BBB_UTILS = {
  
  /**
   * Initialize utility module
   */
  init: function() {
    console.log('BBB_UTILS initialized');
    return this;
  },
  
  /**
   * Format date for display
   * @param {Date|string} date - Date to format
   * @returns {string} - Formatted date string
   */
  formatDate: function(date) {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },
  
  /**
   * Format time for display
   * @param {Date|string} date - Date to format
   * @returns {string} - Formatted time string
   */
  formatTime: function(date) {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid email
   */
  validateEmail: function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  /**
   * Generate random ID
   * @param {number} length - Length of ID
   * @returns {string} - Random ID
   */
  generateId: function(length = 8) {
    return Math.random().toString(36).substr(2, length);
  },
  
  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function} - Debounced function
   */
  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  /**
   * Show toast notification
   * @param {string} message - Message to show
   * @param {string} type - Type of toast (success, error, warning, info)
   * @param {number} duration - Duration in ms
   */
  showToast: function(message, type = 'info', duration = 3000) {
    // Remove existing toast
    const existingToast = document.querySelector('.bbb-toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `bbb-toast bbb-toast-${type}`;
    toast.textContent = message;
    
    // Style the toast
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 350px;
    `;
    
    // Set background color based on type
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#007bff'
    };
    toast.style.backgroundColor = colors[type] || colors.info;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  },
  
  /**
   * Show loading spinner
   * @param {string} message - Loading message
   * @returns {HTMLElement} - Loading element
   */
  showLoading: function(message = 'Loading...') {
    // Remove existing loading
    this.hideLoading();
    
    const loading = document.createElement('div');
    loading.id = 'bbb-loading';
    loading.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
      font-size: 1.1rem;
    `;
    
    loading.innerHTML = `
      <div style="
        width: 50px;
        height: 50px;
        border: 4px solid #333;
        border-top: 4px solid #fff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      "></div>
      <div>${message}</div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    document.body.appendChild(loading);
    return loading;
  },
  
  /**
   * Hide loading spinner
   */
  hideLoading: function() {
    const loading = document.getElementById('bbb-loading');
    if (loading) {
      loading.remove();
    }
  },
  
  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml: function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  /**
   * Check if user is on mobile device
   * @returns {boolean} - True if mobile
   */
  isMobile: function() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise} - Resolves when copied
   */
  copyToClipboard: function(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      return new Promise((resolve, reject) => {
        if (document.execCommand('copy')) {
          resolve();
        } else {
          reject(new Error('Copy command failed'));
        }
        textArea.remove();
      });
    }
  },
  
  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted size string
   */
  formatFileSize: function(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  /**
   * Get URL parameters
   * @param {string} name - Parameter name
   * @returns {string|null} - Parameter value
   */
  getUrlParameter: function(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  },
  
  /**
   * Wait for specified time
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise} - Resolves after timeout
   */
  wait: function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// Initialize utils
BBB_UTILS.init();

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BBB_UTILS;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.BBB_UTILS = BBB_UTILS;
}
