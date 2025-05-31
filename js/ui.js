/**
 * Birdie Bush Bandits - UI Helper Module
 * Common UI functions and components
 */

const BBB_UI = {
  
  /**
   * Initialize UI module
   */
  init: function() {
    console.log('BBB_UI initialized');
    this.setupGlobalStyles();
    return this;
  },
  
  /**
   * Setup global styles
   */
  setupGlobalStyles: function() {
    // Add global styles if not already present
    if (!document.querySelector('#bbb-ui-styles')) {
      const style = document.createElement('style');
      style.id = 'bbb-ui-styles';
      style.textContent = `
        .bbb-btn {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, var(--bbb-secondary, #0046ad), var(--bbb-primary, #004d00));
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          font-size: 1rem;
        }
        
        .bbb-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 70, 173, 0.3);
        }
        
        .bbb-btn:active {
          transform: translateY(0);
        }
        
        .bbb-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .bbb-btn-secondary {
          background: linear-gradient(135deg, #6c757d, #495057);
        }
        
        .bbb-btn-success {
          background: linear-gradient(135deg, #28a745, #20c997);
        }
        
        .bbb-btn-danger {
          background: linear-gradient(135deg, #dc3545, #e83e8c);
        }
        
        .bbb-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        
        .bbb-modal.show {
          opacity: 1;
          visibility: visible;
        }
        
        .bbb-modal-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          transform: scale(0.8);
          transition: transform 0.3s ease;
        }
        
        .bbb-modal.show .bbb-modal-content {
          transform: scale(1);
        }
        
        .bbb-form-group {
          margin-bottom: 1.5rem;
        }
        
        .bbb-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--bbb-primary, #004d00);
        }
        
        .bbb-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }
        
        .bbb-input:focus {
          outline: none;
          border-color: var(--bbb-secondary, #0046ad);
          box-shadow: 0 0 0 3px rgba(0, 70, 173, 0.1);
        }
        
        .bbb-alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid transparent;
        }
        
        .bbb-alert-success {
          background: #d4edda;
          color: #155724;
          border-color: #c3e6cb;
        }
        
        .bbb-alert-error {
          background: #f8d7da;
          color: #721c24;
          border-color: #f5c6cb;
        }
        
        .bbb-alert-warning {
          background: #fff3cd;
          color: #856404;
          border-color: #ffeaa7;
        }
        
        .bbb-alert-info {
          background: #cce7ff;
          color: #004085;
          border-color: #b3d7ff;
        }
        
        .bbb-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border: 1px solid #dee2e6;
          transition: box-shadow 0.3s ease;
        }
        
        .bbb-card:hover {
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
        }
        
        .bbb-loading {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid var(--bbb-primary, #004d00);
          border-radius: 50%;
          animation: bbb-spin 1s linear infinite;
        }
        
        @keyframes bbb-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .bbb-fade-in {
          animation: bbb-fade-in 0.5s ease-out;
        }
        
        @keyframes bbb-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
  },
  
  /**
   * Create a button element
   * @param {string} text - Button text
   * @param {Object} options - Button options
   * @returns {HTMLElement} - Button element
   */
  createButton: function(text, options = {}) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = `bbb-btn ${options.variant ? 'bbb-btn-' + options.variant : ''}`;
    
    if (options.onclick) {
      button.addEventListener('click', options.onclick);
    }
    
    if (options.disabled) {
      button.disabled = true;
    }
    
    if (options.id) {
      button.id = options.id;
    }
    
    return button;
  },
  
  /**
   * Create a modal dialog
   * @param {string} title - Modal title
   * @param {string|HTMLElement} content - Modal content
   * @param {Object} options - Modal options
   * @returns {HTMLElement} - Modal element
   */
  createModal: function(title, content, options = {}) {
    const modal = document.createElement('div');
    modal.className = 'bbb-modal';
    
    if (options.id) {
      modal.id = options.id;
    }
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bbb-modal-content';
    
    // Title
    if (title) {
      const titleElement = document.createElement('h3');
      titleElement.textContent = title;
      titleElement.style.marginBottom = '1rem';
      titleElement.style.color = 'var(--bbb-primary, #004d00)';
      modalContent.appendChild(titleElement);
    }
    
    // Content
    if (typeof content === 'string') {
      const contentElement = document.createElement('div');
      contentElement.innerHTML = content;
      modalContent.appendChild(contentElement);
    } else if (content instanceof HTMLElement) {
      modalContent.appendChild(content);
    }
    
    // Buttons
    if (options.buttons) {
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = 'margin-top: 2rem; text-align: right; display: flex; gap: 1rem; justify-content: flex-end;';
      
      options.buttons.forEach(buttonConfig => {
        const button = this.createButton(buttonConfig.text, {
          variant: buttonConfig.variant,
          onclick: () => {
            if (buttonConfig.onclick) {
              buttonConfig.onclick();
            }
            if (buttonConfig.closeModal !== false) {
              this.closeModal(modal);
            }
          }
        });
        buttonContainer.appendChild(button);
      });
      
      modalContent.appendChild(buttonContainer);
    }
    
    modal.appendChild(modalContent);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal && options.closeOnBackdrop !== false) {
        this.closeModal(modal);
      }
    });
    
    // Close on escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape' && options.closeOnEscape !== false) {
        this.closeModal(modal);
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
    
    return modal;
  },
  
  /**
   * Show modal
   * @param {HTMLElement} modal - Modal element
   */
  showModal: function(modal) {
    document.body.appendChild(modal);
    
    // Trigger reflow for animation
    modal.offsetHeight;
    
    modal.classList.add('show');
  },
  
  /**
   * Close modal
   * @param {HTMLElement} modal - Modal element
   */
  closeModal: function(modal) {
    modal.classList.remove('show');
    
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  },
  
  /**
   * Create an alert
   * @param {string} message - Alert message
   * @param {string} type - Alert type (success, error, warning, info)
   * @returns {HTMLElement} - Alert element
   */
  createAlert: function(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `bbb-alert bbb-alert-${type}`;
    alert.textContent = message;
    return alert;
  },
  
  /**
   * Create a form group
   * @param {string} label - Label text
   * @param {string} inputType - Input type
   * @param {Object} options - Input options
   * @returns {HTMLElement} - Form group element
   */
  createFormGroup: function(label, inputType, options = {}) {
    const group = document.createElement('div');
    group.className = 'bbb-form-group';
    
    // Label
    const labelElement = document.createElement('label');
    labelElement.className = 'bbb-label';
    labelElement.textContent = label;
    
    if (options.id) {
      labelElement.setAttribute('for', options.id);
    }
    
    group.appendChild(labelElement);
    
    // Input
    const input = document.createElement('input');
    input.type = inputType;
    input.className = 'bbb-input';
    
    if (options.id) input.id = options.id;
    if (options.name) input.name = options.name;
    if (options.placeholder) input.placeholder = options.placeholder;
    if (options.required) input.required = true;
    if (options.value) input.value = options.value;
    
    group.appendChild(input);
    
    return group;
  },
  
  /**
   * Create a card
   * @param {string|HTMLElement} content - Card content
   * @param {Object} options - Card options
   * @returns {HTMLElement} - Card element
   */
  createCard: function(content, options = {}) {
    const card = document.createElement('div');
    card.className = 'bbb-card';
    
    if (options.title) {
      const title = document.createElement('h4');
      title.textContent = options.title;
      title.style.marginBottom = '1rem';
      title.style.color = 'var(--bbb-primary, #004d00)';
      card.appendChild(title);
    }
    
    if (typeof content === 'string') {
      const contentElement = document.createElement('div');
      contentElement.innerHTML = content;
      card.appendChild(contentElement);
    } else if (content instanceof HTMLElement) {
      card.appendChild(content);
    }
    
    if (options.onclick) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', options.onclick);
    }
    
    return card;
  },
  
  /**
   * Show loading spinner
   * @param {HTMLElement} element - Element to show loading in
   * @param {string} message - Loading message
   */
  showLoading: function(element, message = 'Loading...') {
    if (!element) return;
    
    const loading = document.createElement('div');
    loading.style.cssText = 'text-align: center; padding: 2rem;';
    loading.innerHTML = `
      <div class="bbb-loading" style="margin-bottom: 1rem;"></div>
      <div style="color: var(--bbb-text-muted, #666);">${message}</div>
    `;
    
    element.innerHTML = '';
    element.appendChild(loading);
  },
  
  /**
   * Animate element into view
   * @param {HTMLElement} element - Element to animate
   * @param {Object} options - Animation options
   */
  animateIn: function(element, options = {}) {
    if (!element) return;
    
    element.classList.add('bbb-fade-in');
    
    if (options.delay) {
      element.style.animationDelay = options.delay + 'ms';
    }
  },
  
  /**
   * Show confirmation dialog
   * @param {string} message - Confirmation message
   * @param {Function} onConfirm - Callback for confirm
   * @param {Function} onCancel - Callback for cancel
   */
  confirm: function(message, onConfirm, onCancel) {
    const modal = this.createModal('Confirm Action', message, {
      buttons: [
        {
          text: 'Cancel',
          variant: 'secondary',
          onclick: onCancel
        },
        {
          text: 'Confirm',
          variant: 'danger',
          onclick: onConfirm
        }
      ]
    });
    
    this.showModal(modal);
  },
  
  /**
   * Show alert dialog
   * @param {string} message - Alert message
   * @param {string} type - Alert type
   * @param {Function} onClose - Callback for close
   */
  alert: function(message, type = 'info', onClose) {
    const title = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information'
    }[type] || 'Alert';
    
    const modal = this.createModal(title, message, {
      buttons: [
        {
          text: 'OK',
          onclick: onClose
        }
      ]
    });
    
    this.showModal(modal);
  },
  
  /**
   * Format number for display
   * @param {number} number - Number to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} - Formatted number
   */
  formatNumber: function(number, decimals = 0) {
    if (isNaN(number)) return 'N/A';
    return Number(number).toFixed(decimals);
  },
  
  /**
   * Create a progress bar
   * @param {number} value - Progress value (0-100)
   * @param {Object} options - Progress bar options
   * @returns {HTMLElement} - Progress bar element
   */
  createProgressBar: function(value, options = {}) {
    const container = document.createElement('div');
    container.style.cssText = `
      width: 100%;
      height: ${options.height || 20}px;
      background: #e9ecef;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
    `;
    
    const bar = document.createElement('div');
    bar.style.cssText = `
      height: 100%;
      background: linear-gradient(90deg, var(--bbb-secondary, #0046ad), var(--bbb-primary, #004d00));
      width: ${Math.min(Math.max(value, 0), 100)}%;
      transition: width 0.3s ease;
      border-radius: 10px;
    `;
    
    if (options.showText) {
      const text = document.createElement('div');
      text.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-weight: bold;
        font-size: 12px;
      `;
      text.textContent = `${Math.round(value)}%`;
      container.appendChild(text);
    }
    
    container.appendChild(bar);
    return container;
  }
};

// Initialize UI
BBB_UI.init();

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BBB_UI;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.BBB_UI = BBB_UI;
}
