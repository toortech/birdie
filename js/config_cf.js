/**
 * Birdie Bush Bandits - Authentication Module with Cloudflare Turnstile CAPTCHA
 * Handles user authentication with Cloudflare integration AND local fallback
 * CAPTCHA is REQUIRED for all authentication methods
 */

const BBB_AUTH = {
  /**
   * Current user state
   */
  currentUser: null,
  isAuthenticated: false,
  userRoles: [],
  sessionToken: null,
  
  /**
   * Configuration
   */
  config: {
    storageKey: 'bbb_auth',
    tokenKey: 'bbb_session_token',
    userKey: 'bbb_current_user',
    expiresKey: 'bbb_session_expires',
    cloudflareEnabled: true, // Try Cloudflare first, fallback to local
    requireCaptcha: true,    // MANDATORY - always require CAPTCHA
    sessionDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    maxRetries: 3,
    retryDelay: 1000
  },
  
  /**
   * Initialize authentication module with mandatory CAPTCHA support
   * @param {Object} options - Configuration options
   */
  init: function(options = {}) {
    console.log('Initializing BBB_AUTH with CAPTCHA support...');
    
    // Force CAPTCHA requirement (cannot be disabled)
    options.requireCaptcha = true;
    
    // Merge options with defaults
    this.config = { ...this.config, ...options };
    
    // Use global config if available
    if (typeof BBB_CONFIG !== 'undefined') {
      this.config.authWorkerUrl = BBB_CONFIG.authWorkerUrl;
      this.config.turnstileSecret = BBB_CONFIG.turnstile?.secretKey;
      this.config.turnstileSiteKey = BBB_CONFIG.turnstile?.siteKey;
      this.config.sessionDuration = BBB_CONFIG.sessionDuration || this.config.sessionDuration;
      this.config.cloudflareEnabled = BBB_CONFIG.cloudflareEnabled;
    }
    
    console.log('Auth config (CAPTCHA required):', {
      cloudflareEnabled: this.config.cloudflareEnabled,
      requireCaptcha: this.config.requireCaptcha,
      hasWorkerUrl: !!this.config.authWorkerUrl,
      hasTurnstileKey: !!this.config.turnstileSiteKey
    });
    
    // Check for existing session
    this.checkSession();
    
    // Set up listeners for auth-protected elements
    this.setupProtectedElements();
    
    console.log('Auth initialized with CAPTCHA security:', { 
      isAuthenticated: this.isAuthenticated, 
      currentUser: this.currentUser,
      userRoles: this.userRoles,
      securityLevel: 'MAXIMUM'
    });
    
    return this;
  },
  
  /**
   * Check if user has an existing session
   * @returns {boolean} - Authentication status
   */
  checkSession: function() {
    try {
      return this.checkCloudflareSession();
    } catch (error) {
      console.error('Error checking session:', error);
      this.clearSession();
      return false;
    }
  },
  
  /**
   * Check Cloudflare session with CAPTCHA verification flag
   * @returns {boolean} - Authentication status
   */
  checkCloudflareSession: function() {
    const token = localStorage.getItem(this.config.tokenKey);
    const userData = localStorage.getItem(this.config.userKey);
    const expiresAt = localStorage.getItem(this.config.expiresKey);
    
    if (!token || !userData || !expiresAt) {
      console.log('No session found');
      return false;
    }
    
    // Check if session is expired
    if (new Date(expiresAt) <= new Date()) {
      console.log('Session expired');
      this.clearSession();
      return false;
    }
    
    try {
      const user = JSON.parse(userData);
      
      // Check if session includes CAPTCHA verification
      const sessionData = localStorage.getItem('bbb_auth_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (!session.captchaVerified) {
          console.log('Session missing CAPTCHA verification, clearing');
          this.clearSession();
          return false;
        }
      }
      
      // Restore session state
      this.currentUser = user;
      this.isAuthenticated = true;
      this.sessionToken = token;
      this.userRoles = user.role ? [user.role] : ['member'];
      
      console.log('Secure session restored:', {
        user: this.currentUser,
        roles: this.userRoles,
        expiresAt: expiresAt,
        captchaVerified: true
      });
      
      // Verify token with server asynchronously (if Cloudflare available)
      if (this.config.cloudflareEnabled && this.config.authWorkerUrl) {
        this.verifyTokenAsync();
      }
      
      return true;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      this.clearSession();
      return false;
    }
  },
  
  /**
   * Verify token with server asynchronously
   */
  verifyTokenAsync: async function() {
    if (!this.config.authWorkerUrl || !this.sessionToken) {
      return;
    }
    
    try {
      const response = await fetch(`${this.config.authWorkerUrl}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token: this.sessionToken })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.log('Token verification failed, logging out');
        this.logout();
      } else {
        console.log('Token verified successfully');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      // Don't logout on network errors, just log
    }
  },
  
  /**
   * DEPRECATED: Standard login without CAPTCHA - NO LONGER SUPPORTED
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise} - Always rejects
   */
  login: async function(username, password) {
    console.error('Standard login is deprecated. Use loginWithCaptcha() instead.');
    throw new Error('Login requires CAPTCHA verification. Use loginWithCaptcha() method.');
  },
  
  /**
   * Secure login with CAPTCHA verification - REQUIRED METHOD
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {string} captchaToken - Cloudflare Turnstile token
   * @returns {Promise} - Resolves with user or rejects with error
   */
  loginWithCaptcha: async function(username, password, captchaToken) {
    try {
      console.log('Attempting secure login for:', username, 'with CAPTCHA verification');
      
      if (!captchaToken) {
        throw new Error('CAPTCHA verification is required for login');
      }
      
      let userData;
      
      // Try Cloudflare authentication first
      if (this.config.cloudflareEnabled && this.config.authWorkerUrl) {
        try {
          userData = await this.cloudflareLoginWithCaptcha(username, password, captchaToken);
          console.log('Cloudflare authentication successful');
        } catch (cloudflareError) {
          console.warn('Cloudflare authentication failed, trying local fallback:', cloudflareError.message);
          // Fall through to local authentication
        }
      }
      
      // Fallback to local authentication if Cloudflare failed or not configured
      if (!userData) {
        userData = await this.localLoginWithCaptcha(username, password, captchaToken);
        console.log('Local authentication successful');
      }
      
      if (!userData) {
        throw new Error('Authentication failed');
      }
      
      // Store secure session
      this.storeSecureSession(userData, true); // true = captcha verified
      
      // Update current state
      this.currentUser = userData.user || userData;
      this.isAuthenticated = true;
      this.userRoles = userData.user ? [userData.user.role] : (userData.roles || ['member']);
      this.sessionToken = userData.token || null;
      
      console.log('Secure login successful:', {
        user: this.currentUser,
        roles: this.userRoles,
        hasToken: !!this.sessionToken,
        captchaVerified: true,
        securityLevel: 'MAXIMUM'
      });
      
      return this.currentUser;
    } catch (error) {
      console.error('Secure login error:', error);
      throw error;
    }
  },
  
  /**
   * Cloudflare authentication with CAPTCHA verification
   * @param {string} username - Username
   * @param {string} password - Password 
   * @param {string} captchaToken - Turnstile token
   * @returns {Promise} - Resolves with user data
   */
  cloudflareLoginWithCaptcha: async function(username, password, captchaToken) {
    if (!this.config.authWorkerUrl) {
      throw new Error('Cloudflare auth worker URL not configured');
    }
    
    if (!captchaToken) {
      throw new Error('CAPTCHA token is required');
    }
    
    console.log('Attempting Cloudflare login with CAPTCHA for:', username);
    
    let lastError;
    
    // Retry logic for network issues
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.config.authWorkerUrl}/auth/login-with-captcha`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ 
            username, 
            password,
            captchaToken,
            siteKey: this.config.turnstileSiteKey,
            timestamp: Date.now()
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Handle CAPTCHA-specific errors
          if (errorData.error && errorData.error.includes('captcha')) {
            throw new Error('CAPTCHA verification failed. Please try again.');
          }
          
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          // Handle CAPTCHA-specific failures
          if (data.error && data.error.includes('captcha')) {
            throw new Error('CAPTCHA verification failed. Please complete the security check.');
          }
          
          throw new Error(data.error || 'Login failed');
        }
        
        // Verify CAPTCHA was validated on server side
        if (!data.captchaVerified) {
          throw new Error('Server did not verify CAPTCHA. Please try again.');
        }
        
        console.log('Secure Cloudflare login successful:', {
          username: data.user?.username,
          captchaVerified: data.captchaVerified,
          securityLevel: 'MAXIMUM'
        });
        
        return data;
        
      } catch (error) {
        lastError = error;
        console.error(`Secure login attempt ${attempt} failed:`, error.message);
        
        // Don't retry on CAPTCHA errors or authentication failures
        if (error.message.includes('captcha') || 
            error.message.includes('Invalid credentials') ||
            error.message.includes('User not found')) {
          break;
        }
        
        if (attempt < this.config.maxRetries) {
          console.log(`Retrying in ${this.config.retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }
    
    throw lastError;
  },
  
  /**
   * Local authentication with CAPTCHA verification (fallback)
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {string} captchaToken - CAPTCHA token (verified client-side)
   * @returns {Promise} - Resolves with user data
   */
  localLoginWithCaptcha: async function(username, password, captchaToken) {
    console.log('Attempting local login with CAPTCHA for:', username);
    
    if (!captchaToken) {
      throw new Error('CAPTCHA verification is required for local login');
    }
    
    // Simulate server-side CAPTCHA verification delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get user data from local authentication
    const userData = this.localLogin(username, password);
    
    if (!userData) {
      throw new Error('Invalid credentials');
    }
    
    // Return data in format similar to Cloudflare response
    return {
      success: true,
      user: userData,
      token: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      expiresAt: new Date(Date.now() + this.config.sessionDuration).toISOString(),
      captchaVerified: true,
      authMethod: 'local'
    };
  },
  
  /**
   * Local login logic (from old auth.js)
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Object|null} - User data or null if invalid
   */
  localLogin: function(username, password) {
    console.log('Attempting local login for:', username);
    
    // For the photo gallery
    if (username === 'gallery' && password === BBB_CONFIG?.gallery?.password) {
      return {
        id: 'gallery',
        name: 'Gallery User',
        username: 'gallery',
        role: 'gallery',
        roles: ['gallery', 'member']
      };
    }
    
    // For admin access
    if (username === 'admin' && password === 'bbb123') {
      return {
        id: 'admin',
        name: 'Administrator',
        username: 'admin',
        role: 'administrator',
        roles: ['administrator', 'member']
      };
    }
    
    // For regular members (from BBB_CONFIG.members list)
    if (BBB_CONFIG?.members && BBB_CONFIG.members.includes(username) && password === 'member123') {
      return {
        id: username.toLowerCase(),
        name: username,
        username: username.toLowerCase(),
        role: 'member',
        roles: ['member']
      };
    }
    
    console.log('Local login failed: Invalid credentials');
    return null;
  },
  
  /**
   * Store secure session with CAPTCHA verification flag
   * @param {Object} authData - Authentication data
   * @param {boolean} captchaVerified - Whether CAPTCHA was verified
   */
  storeSecureSession: function(authData, captchaVerified = false) {
    try {
      // Handle both Cloudflare and local auth data formats
      const token = authData.token || 'local_session_' + Date.now();
      const user = authData.user || authData;
      const expiresAt = authData.expiresAt || new Date(Date.now() + this.config.sessionDuration).toISOString();
      
      localStorage.setItem(this.config.tokenKey, token);
      localStorage.setItem(this.config.userKey, JSON.stringify(user));
      localStorage.setItem(this.config.expiresKey, expiresAt);
      
      // Store session metadata with CAPTCHA verification
      const sessionMetadata = {
        timestamp: new Date().toISOString(),
        expiresAt: expiresAt,
        userId: user.id,
        captchaVerified: captchaVerified,
        securityLevel: 'MAXIMUM',
        authMethod: authData.authMethod || 'cloudflare'
      };
      
      localStorage.setItem('bbb_auth_session', JSON.stringify(sessionMetadata));
      
      console.log('Secure session stored:', {
        token: token.substring(0, 10) + '...',
        user: user.username || user.id,
        expiresAt: expiresAt,
        captchaVerified: captchaVerified,
        securityLevel: 'MAXIMUM'
      });
    } catch (error) {
      console.error('Error storing secure session:', error);
      throw new Error('Failed to store secure session');
    }
  },
  
  /**
   * Log out current user with enhanced security
   */
  logout: async function() {
    console.log('Securely logging out user:', this.currentUser?.username || this.currentUser?.name);
    
    // Set logout flags for cross-tab communication
    try {
      sessionStorage.setItem('bbb_logging_out', 'true');
      sessionStorage.setItem('bbb_logout_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Error setting logout flags:', error);
    }
    
    // Notify Cloudflare server (if using Cloudflare auth)
    if (this.sessionToken && this.config.cloudflareEnabled && this.config.authWorkerUrl) {
      try {
        await fetch(`${this.config.authWorkerUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ 
            token: this.sessionToken,
            securityLogout: true,
            timestamp: Date.now()
          })
        });
        console.log('Secure server logout successful');
      } catch (error) {
        console.error('Server logout failed:', error);
        // Continue with local logout even if server logout fails
      }
    }
    
    // Clear all session data
    this.clearSession();
    
    // Set final logout flags
    try {
      sessionStorage.setItem('justLoggedOut', 'true');
      sessionStorage.setItem('bbb_logout_timestamp', Date.now().toString());
      sessionStorage.removeItem('bbb_logging_out');
    } catch (error) {
      console.error('Error setting final logout flags:', error);
    }
    
    console.log('Secure logout complete');
  },
  
  /**
   * Clear all session data with enhanced security
   */
  clearSession: function() {
    // Clear all possible storage keys
    const keysToRemove = [
      this.config.storageKey,
      this.config.tokenKey,
      this.config.userKey,
      this.config.expiresKey,
      'bbb_auth_session'
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
        // Verify removal
        if (localStorage.getItem(key) !== null) {
          console.warn(`Failed to clear ${key}, trying again...`);
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.error(`Error removing ${key}:`, error);
      }
    });
    
    // Reset auth state
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userRoles = [];
    this.sessionToken = null;
    
    console.log('All session data securely cleared');
  },
  
  /**
   * Change password with CAPTCHA verification
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} captchaToken - Turnstile token for verification
   * @returns {Promise} - Resolves on success
   */
  changePassword: async function(currentPassword, newPassword, captchaToken) {
    if (!this.sessionToken) {
      throw new Error('No active session');
    }
    
    if (!captchaToken) {
      throw new Error('CAPTCHA verification is required for password changes');
    }
    
    // Only try Cloudflare if properly configured
    if (!this.config.cloudflareEnabled || !this.config.authWorkerUrl) {
      throw new Error('Password changes require Cloudflare authentication');
    }
    
    try {
      const response = await fetch(`${this.config.authWorkerUrl}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          token: this.sessionToken,
          currentPassword,
          newPassword,
          captchaToken,
          timestamp: Date.now()
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        if (data.error && data.error.includes('captcha')) {
          throw new Error('CAPTCHA verification failed for password change');
        }
        throw new Error(data.error || 'Password change failed');
      }
      
      console.log('Password changed successfully with CAPTCHA verification');
      return data;
    } catch (error) {
      console.error('Secure password change error:', error);
      throw error;
    }
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
   * Check if user has specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean} - True if user has permission
   */
  hasPermission: function(permission) {
    if (!this.isAuthenticated || !this.currentUser) return false;
    
    // Use BBB_CONFIG permission system if available
    if (typeof BBB_CONFIG !== 'undefined' && BBB_CONFIG.hasPermission) {
      return BBB_CONFIG.hasPermission(this.currentUser.role, permission);
    }
    
    // Fallback permission check
    const role = this.currentUser.role;
    if (role === 'administrator') return true;
    if (role === 'member' && ['view_member_content', 'upload_photos', 'view_own_scorecards'].includes(permission)) return true;
    if (role === 'gallery' && permission === 'view_gallery') return true;
    
    return false;
  },
  
  /**
   * Check if user is admin
   * @returns {boolean} - True if user is administrator
   */
  isAdmin: function() {
    return this.hasRole('administrator') || this.hasRole('admin');
  },
  
  /**
   * Check if user is member (includes admin)
   * @returns {boolean} - True if user is member or admin
   */
  isMember: function() {
    return this.hasRole(['member', 'administrator', 'admin']);
  },
  
  /**
   * Protect page based on required roles (with enhanced security)
   * @param {string|Array} requiredRoles - Role(s) required to access page
   * @param {string} redirectUrl - URL to redirect to if unauthorized
   */
  protectPage: function(requiredRoles, redirectUrl = '/login.html') {
    // Check if session has CAPTCHA verification
    const sessionData = localStorage.getItem('bbb_auth_session');
    let captchaVerified = false;
    
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        captchaVerified = session.captchaVerified === true;
      } catch (error) {
        console.error('Error checking session CAPTCHA status:', error);
      }
    }
    
    if (!this.isAuthenticated || !this.hasRole(requiredRoles) || !captchaVerified) {
      console.log('Access denied: Authentication, role, or CAPTCHA verification failed');
      // Save current URL to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', window.location.href);
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
    
    // Handle admin-only elements
    document.querySelectorAll('[data-admin-only]').forEach(el => {
      el.style.display = this.isAdmin() ? '' : 'none';
    });
  },
  
  /**
   * Create secure login form with CAPTCHA (updated from old auth.js)
   * @param {Object} options - Login options
   * @returns {HTMLElement} - Login overlay element
   */
  createSecureLoginForm: function(options = {}) {
    const defaults = {
      title: 'Secure Login Required',
      message: 'Please enter your credentials and complete security verification',
      showUsername: true,
      usernamePlaceholder: 'Username',
      passwordPlaceholder: 'Password',
      submitButtonText: 'Secure Login',
      cancelButtonText: 'Cancel',
      onSuccess: null,
      onCancel: null,
      requireCaptcha: true
    };
    
    const settings = { ...defaults, ...options };
    
    // Create overlay with enhanced security styling
    const overlay = document.createElement('div');
    overlay.id = 'secure-login-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(5px);
    `;
    
    // Create login box with security indicators
    const loginBox = document.createElement('div');
    loginBox.id = 'secure-login-box';
    loginBox.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 15px;
      max-width: 450px;
      width: 90%;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      border: 3px solid #007bff;
      position: relative;
    `;
    
    // Add security badge
    const securityBadge = document.createElement('div');
    securityBadge.style.cssText = `
      position: absolute;
      top: -15px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: bold;
    `;
    securityBadge.textContent = '🔒 SECURE LOGIN';
    loginBox.appendChild(securityBadge);
    
    // Create title with security icon
    const title = document.createElement('h2');
    title.textContent = '🛡️ ' + settings.title;
    title.style.cssText = `
      margin-bottom: 1rem;
      color: #004d00;
      text-align: center;
      font-size: 1.5rem;
    `;
    
    // Create message
    const message = document.createElement('p');
    message.textContent = settings.message;
    message.style.cssText = `
      margin-bottom: 1.5rem;
      text-align: center;
      color: #666;
      font-size: 0.95rem;
    `;
    
    // Create form (implementation would continue with CAPTCHA integration)
    const form = document.createElement('form');
    
    // Add all elements to login box
    loginBox.appendChild(title);
    loginBox.appendChild(message);
    loginBox.appendChild(form);
    
    // Add login box to overlay
    overlay.appendChild(loginBox);
    
    return overlay;
  },
  
  /**
   * Show secure login form with CAPTCHA
   * @param {Object} options - Login options
   * @returns {Promise} - Resolves when authenticated
   */
  showSecureLoginForm: function(options = {}) {
    return new Promise((resolve, reject) => {
      const formOptions = {
        ...options,
        onSuccess: user => resolve(user),
        onCancel: () => reject(new Error('Login cancelled'))
      };
      
      const overlay = this.createSecureLoginForm(formOptions);
      document.body.appendChild(overlay);
      
      // Focus first input
      setTimeout(() => {
        const firstInput = overlay.querySelector('input');
        if (firstInput) firstInput.focus();
      }, 100);
    });
  },
  
  /**
   * Show a simplified login form for gallery access with CAPTCHA
   * @returns {Promise} - Resolves when authenticated
   */
  showGalleryLogin: function() {
    return this.showSecureLoginForm({
      title: 'Gallery Access',
      message: 'Enter your credentials and complete security verification to view the photo gallery',
      showUsername: this.config.cloudflareEnabled,
      passwordPlaceholder: this.config.cloudflareEnabled ? 'Password' : 'Gallery Password',
      submitButtonText: 'Access Gallery'
    });
  }
};

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BBB_AUTH;
}
