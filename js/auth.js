/**
 * Birdie Bush Bandits - Authentication Module
 * Handles user authentication with future Cloudflare integration
 */

const BBB_AUTH = {
  /**
   * Current user state
   */
  currentUser: null,
  isAuthenticated: false,
  userRoles: [],
  
  /**
   * Configuration
   */
  config: {
    storageKey: 'bbb_auth',
    cloudflareEnabled: false,
    sessionDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  },
  
  /**
   * Initialize authentication module
   * @param {Object} options - Configuration options
   */
  init: function(options = {}) {
    // Merge options with defaults
    this.config = { ...this.config, ...options };
    
    // Check for existing session - priority #1
    this.checkSession();
    
    // Set up listeners for auth-protected elements
    this.setupProtectedElements();
    
    // For debugging - log authentication status
    console.log('Auth initialized:', { 
      isAuthenticated: this.isAuthenticated, 
      currentUser: this.currentUser,
      userRoles: this.userRoles
    });
    
    // Return for chaining
    return this;
  },
  
  /**
   * Check if user has an existing session
   * @returns {boolean} - Authentication status
   */
  checkSession: function() {
    try {
      // Get stored session
      const storedSession = localStorage.getItem(this.config.storageKey);
      if (!storedSession) {
        console.log('No stored session found');
        return false;
      }
      
      const session = JSON.parse(storedSession);
      console.log('Found stored session:', session);
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        console.log('Session expired, logging out');
        this.logout();
        return false;
      }
      
      // Session is valid
      this.currentUser = session.user;
      this.isAuthenticated = true;
      this.userRoles = session.roles || [];
      
      console.log('Valid session restored:', {
        user: this.currentUser,
        roles: this.userRoles,
        expiresAt: new Date(session.expiresAt).toLocaleString()
      });
      
      return true;
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  },
  
  /**
   * Login user with username/password
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise} - Resolves with user or rejects with error
   */
  login: async function(username, password) {
    try {
      let userData;
      
      if (this.config.cloudflareEnabled) {
        // When Cloudflare is enabled, use their authentication
        userData = await this.cloudflareLogin(username, password);
      } else {
        // Fallback to local authentication
        userData = this.localLogin(username, password);
      }
      
      if (!userData) {
        throw new Error('Authentication failed');
      }
      
      // Create and store session
      const expiresAt = Date.now() + this.config.sessionDuration;
      const session = {
        user: userData,
        expiresAt,
        roles: userData.roles || ['member']
      };
      
      localStorage.setItem(this.config.storageKey, JSON.stringify(session));
      
      // Update current state
      this.currentUser = userData;
      this.isAuthenticated = true;
      this.userRoles = userData.roles || ['member'];
      
      console.log('Login successful:', {
        user: this.currentUser,
        roles: this.userRoles,
        expiresAt: new Date(expiresAt).toLocaleString()
      });
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Login with Cloudflare Workers authentication
   * @param {string} username - Username
   * @param {string} password - Password 
   * @returns {Promise} - Resolves with user data
   */
  cloudflareLogin: async function(username, password) {
    // This will be implemented when Cloudflare integration is ready
    // For now it just returns a placeholder
    console.log('Cloudflare login would happen here with:', username);
    
    // Placeholder for Cloudflare API call
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ username, password })
    // });
    // return await response.json();
    
    throw new Error('Cloudflare authentication not implemented yet');
  },
  
  /**
   * Local login logic as fallback when Cloudflare is not available
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Object|null} - User data or null if invalid
   */
  localLogin: function(username, password) {
    console.log('Attempting local login for:', username);
    
    // IMPORTANT: This is a simple implementation for development
    // In production, authentication should always use a secure backend
    
    // For the photo gallery, simple password protection
    if (username === 'gallery' && password === BBB_CONFIG.gallery.password) {
      return {
        id: 'gallery',
        name: 'Gallery User',
        roles: ['gallery']
      };
    }
    
    // For admin access
    if (username === 'admin' && password === 'bbb123') {
      return {
        id: 'admin',
        name: 'Administrator',
        roles: ['admin', 'member']
      };
    }
    
    // For regular members (simplified - each member would need own credentials)
    if (BBB_CONFIG.members && BBB_CONFIG.members.includes(username) && password === 'member123') {
      return {
        id: username.toLowerCase(),
        name: username,
        roles: ['member']
      };
    }
    
    console.log('Login failed: Invalid credentials');
    return null;
  },
  
  /**
   * Log out current user
   */
  logout: function() {
    console.log('Logging out user:', this.currentUser?.name);
    
    // Clear session storage
    localStorage.removeItem(this.config.storageKey);
    
    // Reset auth state
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userRoles = [];
    
    console.log('Logout complete');
  },
  
  /**
   * Check if current user has a specific role
   * @param {string|Array} roles - Role or roles to check
   * @returns {boolean} - True if user has any of the specified roles
   */
  hasRole: function(roles) {
    if (!this.isAuthenticated) return false;
    
    const rolesToCheck = Array.isArray(roles) ? roles : [roles];
    return this.userRoles.some(role => rolesToCheck.includes(role));
  },
  
  /**
   * Protect page based on required roles
   * @param {string|Array} requiredRoles - Role(s) required to access page
   * @param {string} redirectUrl - URL to redirect to if unauthorized
   */
  protectPage: function(requiredRoles, redirectUrl = '/index.html') {
    if (!this.isAuthenticated || !this.hasRole(requiredRoles)) {
      // Save current URL to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      window.location.href = redirectUrl;
    }
  },
  
  /**
   * Setup auth-protected elements visibility
   */
  setupProtectedElements: function() {
    // Handle elements that should only be visible to authenticated users
    document.querySelectorAll('[data-auth-required]').forEach(el => {
      el.style.display = this.isAuthenticated ? '' : 'none';
    });
    
    // Handle elements with specific role requirements
    document.querySelectorAll('[data-role-required]').forEach(el => {
      const requiredRoles = el.dataset.roleRequired.split(',');
      el.style.display = this.hasRole(requiredRoles) ? '' : 'none';
    });
    
    // Handle elements that should only be visible to unauthenticated users
    document.querySelectorAll('[data-auth-anonymous]').forEach(el => {
      el.style.display = !this.isAuthenticated ? '' : 'none';
    });
  },
  
  /**
   * Create login form and overlay
   * @param {Object} options - Login options
   * @returns {HTMLElement} - Login overlay element
   */
  createLoginForm: function(options = {}) {
    const defaults = {
      title: 'Login Required',
      message: 'Please enter your credentials to continue',
      showUsername: true,
      usernamePlaceholder: 'Username',
      passwordPlaceholder: 'Password',
      submitButtonText: 'Login',
      cancelButtonText: 'Cancel',
      onSuccess: null,
      onCancel: null
    };
    
    const settings = { ...defaults, ...options };
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'login-overlay';
    
    // Create login box
    const loginBox = document.createElement('div');
    loginBox.id = 'login-box';
    
    // Create title
    const title = document.createElement('h2');
    title.textContent = settings.title;
    
    // Create message
    const message = document.createElement('p');
    message.textContent = settings.message;
    
    // Create form
    const form = document.createElement('form');
    form.addEventListener('submit', e => {
      e.preventDefault();
      
      const username = settings.showUsername ? form.querySelector('#username').value : 'gallery';
      const password = form.querySelector('#password').value;
      
      this.login(username, password)
        .then(user => {
          overlay.remove();
          if (settings.onSuccess) settings.onSuccess(user);
        })
        .catch(err => {
          errorMsg.style.display = 'block';
          errorMsg.textContent = err.message || 'Login failed';
        });
    });
    
    // Create username field if needed
    if (settings.showUsername) {
      const usernameGroup = document.createElement('div');
      usernameGroup.className = 'form-group';
      
      const usernameInput = document.createElement('input');
      usernameInput.type = 'text';
      usernameInput.id = 'username';
      usernameInput.placeholder = settings.usernamePlaceholder;
      usernameInput.required = true;
      
      usernameGroup.appendChild(usernameInput);
      form.appendChild(usernameGroup);
    }
    
    // Create password field
    const passwordGroup = document.createElement('div');
    passwordGroup.className = 'form-group';
    
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.placeholder = settings.passwordPlaceholder;
    passwordInput.required = true;
    
    passwordGroup.appendChild(passwordInput);
    form.appendChild(passwordGroup);
    
    // Create error message
    const errorMsg = document.createElement('div');
    errorMsg.id = 'error-msg';
    errorMsg.className = 'error';
    errorMsg.style.display = 'none';
    errorMsg.textContent = 'Incorrect credentials';
    form.appendChild(errorMsg);
    
    // Create buttons
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'form-group';
    
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn';
    submitButton.textContent = settings.submitButtonText;
    
    // Add cancel button if needed
    if (settings.onCancel) {
      const cancelButton = document.createElement('button');
      cancelButton.type = 'button';
      cancelButton.className = 'btn btn-secondary';
      cancelButton.textContent = settings.cancelButtonText;
      cancelButton.style.marginLeft = '10px';
      
      cancelButton.addEventListener('click', () => {
        overlay.remove();
        if (settings.onCancel) settings.onCancel();
      });
      
      buttonGroup.appendChild(cancelButton);
    }
    
    buttonGroup.appendChild(submitButton);
    form.appendChild(buttonGroup);
    
    // Add all elements to login box
    loginBox.appendChild(title);
    loginBox.appendChild(message);
    loginBox.appendChild(form);
    
    // Add login box to overlay
    overlay.appendChild(loginBox);
    
    // Add keyup listener for ESC key
    document.addEventListener('keyup', function(e) {
      if (e.key === 'Escape' && settings.onCancel) {
        overlay.remove();
        settings.onCancel();
      }
    });
    
    // Return overlay
    return overlay;
  },
  
  /**
   * Show login form
   * @param {Object} options - Login options
   * @returns {Promise} - Resolves when authenticated
   */
  showLoginForm: function(options = {}) {
    return new Promise((resolve, reject) => {
      const formOptions = {
        ...options,
        onSuccess: user => resolve(user),
        onCancel: () => reject(new Error('Login cancelled'))
      };
      
      const overlay = this.createLoginForm(formOptions);
      document.body.appendChild(overlay);
      
      // Focus first input
      setTimeout(() => {
        const firstInput = overlay.querySelector('input');
        if (firstInput) firstInput.focus();
      }, 100);
    });
  },
  
  /**
   * Show a simplified login form for gallery access
   * @returns {Promise} - Resolves when authenticated
   */
  showGalleryLogin: function() {
    return this.showLoginForm({
      title: 'Gallery Access',
      message: 'Enter the password to view the photo gallery',
      showUsername: false,
      passwordPlaceholder: 'Gallery Password',
      submitButtonText: 'Unlock Gallery'
    });
  },
  
  /**
   * When Cloudflare is enabled, setup the auth hooks
   */
  setupCloudflareAuth: function() {
    // This is placeholder for future Cloudflare implementation
    // Will include JWT token validation, refresh tokens, etc.
    console.log('Cloudflare Auth setup would happen here');
  }
};

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BBB_AUTH;
}
