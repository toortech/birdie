/**
 * Birdie Bush Bandits - Enhanced Authentication Module
 * Handles user authentication with Cloudflare integration and CAPTCHA support
 */

const BBB_AUTH = {
  /**
   * Current user state
   */
  currentUser: null,
  isAuthenticated: false,
  userRoles: [],
  sessionToken: null,
  userPermissions: [],
  
  /**
   * Configuration
   */
  config: {
    storageKey: 'bbb_auth',
    tokenKey: 'bbb_session_token',
    userKey: 'bbb_current_user',
    expiresKey: 'bbb_session_expires',
    cloudflareEnabled: false,
    sessionDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    maxRetries: 3,
    retryDelay: 1000,
    captchaEnabled: true
  },
  
  /**
   * Initialize authentication module
   * @param {Object} options - Configuration options
   */
  init: function(options = {}) {
    console.log('Initializing BBB_AUTH with options:', options);
    
    // Merge options with defaults
    this.config = { ...this.config, ...options };
    
    // Use global config if available
    if (typeof BBB_CONFIG !== 'undefined') {
      this.config.cloudflareEnabled = BBB_CONFIG.cloudflareEnabled;
      this.config.authWorkerUrl = BBB_CONFIG.authWorkerUrl;
      this.config.sessionDuration = BBB_CONFIG.sessionDuration || this.config.sessionDuration;
      this.config.captchaEnabled = BBB_CONFIG.captchaEnabled !== false; // Default to true
    }
    
    console.log('Auth config:', this.config);
    
    // Check for existing session - priority #1
    this.checkSession();
    
    // Set up listeners for auth-protected elements
    this.setupProtectedElements();
    
    // For debugging - log authentication status
    console.log('Auth initialized:', { 
      isAuthenticated: this.isAuthenticated, 
      currentUser: this.currentUser,
      userRoles: this.userRoles,
      cloudflareEnabled: this.config.cloudflareEnabled,
      captchaEnabled: this.config.captchaEnabled
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
      if (this.config.cloudflareEnabled) {
        return this.checkCloudflareSession();
      } else {
        return this.checkLocalSession();
      }
    } catch (error) {
      console.error('Error checking session:', error);
      this.clearSession();
      return false;
    }
  },
  
  /**
   * Check Cloudflare session
   * @returns {boolean} - Authentication status
   */
  checkCloudflareSession: function() {
    const token = localStorage.getItem(this.config.tokenKey);
    const userData = localStorage.getItem(this.config.userKey);
    const expiresAt = localStorage.getItem(this.config.expiresKey);
    
    if (!token || !userData || !expiresAt) {
      console.log('No Cloudflare session found');
      return false;
    }
    
    // Check if session is expired
    if (new Date(expiresAt) <= new Date()) {
      console.log('Cloudflare session expired');
      this.clearSession();
      return false;
    }
    
    try {
      const user = JSON.parse(userData);
      
      // Restore session state
      this.currentUser = user;
      this.isAuthenticated = true;
      this.sessionToken = token;
      this.userRoles = user.role ? [user.role] : ['member'];
      this.userPermissions = user.permissions || this.getDefaultPermissions(user.role);
      
      console.log('Cloudflare session restored:', {
        user: this.currentUser,
        roles: this.userRoles,
        permissions: this.userPermissions,
        expiresAt: expiresAt
      });
      
      // Optionally verify token with server
      this.verifyTokenAsync();
      
      return true;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      this.clearSession();
      return false;
    }
  },
  
  /**
   * Check local session (fallback)
   * @returns {boolean} - Authentication status
   */
  checkLocalSession: function() {
    const storedSession = localStorage.getItem(this.config.storageKey);
    if (!storedSession) {
      console.log('No local session found');
      return false;
    }
    
    const session = JSON.parse(storedSession);
    console.log('Found local session:', session);
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      console.log('Local session expired');
      this.clearSession();
      return false;
    }
    
    // Session is valid
    this.currentUser = session.user;
    this.isAuthenticated = true;
    this.userRoles = session.roles || ['member'];
    this.userPermissions = session.permissions || this.getDefaultPermissions(session.user.role);
    
    console.log('Local session restored:', {
      user: this.currentUser,
      roles: this.userRoles,
      permissions: this.userPermissions,
      expiresAt: new Date(session.expiresAt).toLocaleString()
    });
    
    return true;
  },
  
  /**
   * Get default permissions for a role
   * @param {string} role - User role
   * @returns {Array} - Array of permissions
   */
  getDefaultPermissions: function(role) {
    const rolePermissions = {
      administrator: [
        'auth.reset_any_password', 'auth.view_all_users', 'auth.create_users', 'auth.manage_users',
        'auth.view_audit_logs', 'auth.access_admin', 'gallery.view_all', 'gallery.upload',
        'gallery.delete_any', 'gallery.moderate', 'scorecards.view_all', 'scorecards.create_any',
        'scorecards.edit_any', 'scorecards.delete_any', 'scorecards.manage_courses'
      ],
      member: [
        'auth.change_own_password', 'auth.view_own_profile', 'auth.edit_own_profile',
        'gallery.view_all', 'gallery.upload_limited', 'gallery.delete_own',
        'scorecards.view_own', 'scorecards.create_own', 'scorecards.edit_own',
        'scorecards.view_own_handicap', 'scorecards.use_calculator'
      ],
      gallery: [
        'gallery.view_all', 'gallery.upload_limited', 'gallery.delete_own'
      ]
    };
    
    return rolePermissions[role] || rolePermissions.member;
  },
  
  /**
   * Verify token with server asynchronously
   */
  verifyTokenAsync: async function() {
    if (!this.config.cloudflareEnabled || !this.sessionToken) {
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
   * ENHANCED: Login user with username/password (standard method)
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise} - Resolves with user or rejects with error
   */
  login: async function(username, password) {
    console.log('Standard login attempt for:', username);
    return this.loginWithCaptcha(username, password, null);
  },
  
  /**
   * NEW: Login user with CAPTCHA support
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {string|null} captchaToken - CAPTCHA verification token (optional for local auth)
   * @returns {Promise} - Resolves with user or rejects with error
   */
  loginWithCaptcha: async function(username, password, captchaToken = null) {
    try {
      console.log('Login attempt with CAPTCHA for:', username, 'CAPTCHA enabled:', this.config.captchaEnabled);
      
      // Validate CAPTCHA if enabled and using Cloudflare
      if (this.config.captchaEnabled && this.config.cloudflareEnabled && !captchaToken) {
        throw new Error('Security verification required. Please complete the CAPTCHA.');
      }
      
      let userData;
      
      if (this.config.cloudflareEnabled) {
        // Use enhanced Cloudflare authentication with CAPTCHA
        userData = await this.cloudflareLoginWithCaptcha(username, password, captchaToken);
      } else {
        // Fallback to local authentication (CAPTCHA optional)
        if (this.config.captchaEnabled && !captchaToken) {
          console.warn('CAPTCHA enabled but no token provided for local auth - proceeding anyway');
        }
        userData = this.localLogin(username, password);
      }
      
      if (!userData) {
        throw new Error('Authentication failed');
      }
      
      // Store session based on authentication method
      if (this.config.cloudflareEnabled) {
        this.storeCloudflareSession(userData);
      } else {
        this.storeLocalSession(userData);
      }
      
      // Update current state
      this.currentUser = userData.user || userData;
      this.isAuthenticated = true;
      this.userRoles = userData.user ? [userData.user.role] : (userData.roles || ['member']);
      this.sessionToken = userData.token || null;
      this.userPermissions = userData.permissions || this.getDefaultPermissions(this.currentUser.role);
      
      console.log('Login successful:', {
        user: this.currentUser,
        roles: this.userRoles,
        permissions: this.userPermissions,
        hasToken: !!this.sessionToken
      });
      
      // Update UI elements
      this.setupProtectedElements();
      
      return this.currentUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * ENHANCED: Login with Cloudflare Workers authentication and CAPTCHA
   * @param {string} username - Username
   * @param {string} password - Password 
   * @param {string|null} captchaToken - CAPTCHA verification token
   * @returns {Promise} - Resolves with user data
   */
  cloudflareLoginWithCaptcha: async function(username, password, captchaToken = null) {
    if (!this.config.authWorkerUrl) {
      throw new Error('Cloudflare auth worker URL not configured');
    }
    
    console.log('Attempting Cloudflare login with CAPTCHA for:', username);
    
    let lastError;
    
    // Retry logic for network issues
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const requestBody = { username, password };
        
        // Include CAPTCHA token if provided
        if (captchaToken && this.config.captchaEnabled) {
          requestBody.captchaToken = captchaToken;
          console.log('Including CAPTCHA token in login request');
        }
        
        const response = await fetch(`${this.config.authWorkerUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Login failed');
        }
        
        console.log('Cloudflare login with CAPTCHA successful:', data);
        
        // Process and return login data
        return {
          user: data.user,
          token: data.token,
          expiresAt: data.expiresAt,
          permissions: data.permissions || this.getDefaultPermissions(data.user.role)
        };
        
      } catch (error) {
        lastError = error;
        console.error(`Login attempt ${attempt} failed:`, error.message);
        
        // Don't retry on authentication errors (invalid credentials, CAPTCHA failure)
        if (error.message.includes('Invalid credentials') || 
            error.message.includes('Security verification') ||
            error.message.includes('captcha') ||
            error.message.includes('CAPTCHA')) {
          throw error;
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
   * Store Cloudflare session
   * @param {Object} authData - Authentication data from Cloudflare
   */
  storeCloudflareSession: function(authData) {
    try {
      localStorage.setItem(this.config.tokenKey, authData.token);
      localStorage.setItem(this.config.userKey, JSON.stringify(authData.user));
      localStorage.setItem(this.config.expiresKey, authData.expiresAt);
      
      console.log('Cloudflare session stored:', {
        token: authData.token.substring(0, 10) + '...',
        user: authData.user.username,
        expiresAt: authData.expiresAt
      });
    } catch (error) {
      console.error('Error storing Cloudflare session:', error);
      throw new Error('Failed to store session');
    }
  },
  
  /**
   * Store local session
   * @param {Object} userData - User data
   */
  storeLocalSession: function(userData) {
    const expiresAt = Date.now() + this.config.sessionDuration;
    const session = {
      user: userData,
      expiresAt,
      roles: userData.roles || ['member'],
      permissions: userData.permissions || this.getDefaultPermissions(userData.role)
    };
    
    localStorage.setItem(this.config.storageKey, JSON.stringify(session));
    
    console.log('Local session stored:', {
      user: userData.name || userData.username,
      expiresAt: new Date(expiresAt).toLocaleString()
    });
  },
  
  /**
   * ENHANCED: Local login logic as fallback when Cloudflare is not available
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Object|null} - User data or null if invalid
   */
  localLogin: function(username, password) {
    console.log('Attempting local login for:', username);
    
    // IMPORTANT: This is a simple implementation for development
    // In production, authentication should always use a secure backend
    
    // For the photo gallery, simple password protection
    if (username === 'gallery' && password === BBB_CONFIG?.gallery?.password) {
      return {
        id: 'gallery',
        name: 'Gallery User',
        username: 'gallery',
        role: 'gallery',
        roles: ['gallery', 'member'],
        permissions: this.getDefaultPermissions('gallery')
      };
    }
    
    // For admin access
    if (username === 'admin' && password === 'bbb123') {
      return {
        id: 'admin',
        name: 'Administrator',
        username: 'admin',
        role: 'administrator',
        roles: ['administrator', 'member'],
        permissions: this.getDefaultPermissions('administrator')
      };
    }
    
    // For regular members (simplified - each member would need own credentials)
    if (BBB_CONFIG?.members && BBB_CONFIG.members.includes(username) && password === 'member123') {
      return {
        id: username.toLowerCase(),
        name: username,
        username: username.toLowerCase(),
        role: 'member',
        roles: ['member'],
        permissions: this.getDefaultPermissions('member')
      };
    }
    
    console.log('Local login failed: Invalid credentials');
    return null;
  },
  
  /**
   * ENHANCED: Log out current user with better cleanup
   */
  logout: async function() {
    console.log('Logging out user:', this.currentUser?.username || this.currentUser?.name);
    
    // Set logout flags immediately to prevent race conditions
    try {
      sessionStorage.setItem('justLoggedOut', 'true');
      sessionStorage.setItem('bbb_logout_timestamp', Date.now().toString());
      sessionStorage.setItem('bbb_logging_out', 'true');
    } catch (error) {
      console.error('Error setting logout flags:', error);
    }
    
    // If using Cloudflare, notify the server
    if (this.config.cloudflareEnabled && this.sessionToken) {
      try {
        await fetch(`${this.config.authWorkerUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ token: this.sessionToken })
        });
        console.log('Server logout successful');
      } catch (error) {
        console.error('Server logout failed:', error);
        // Continue with local logout even if server logout fails
      }
    }
    
    // Clear all session data
    this.clearSession();
    
    // Update UI elements
    this.setupProtectedElements();
    
    console.log('Logout complete');
  },
  
  /**
   * ENHANCED: Clear all session data with better verification
   */
  clearSession: function() {
    // Clear all possible storage keys
    const keysToRemove = [
      this.config.storageKey,
      this.config.tokenKey,
      this.config.userKey,
      this.config.expiresKey
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      // Verify removal
      if (localStorage.getItem(key) !== null) {
        console.warn(`Failed to clear ${key}, trying again...`);
        localStorage.removeItem(key);
      }
    });
    
    // Reset auth state
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userRoles = [];
    this.sessionToken = null;
    this.userPermissions = [];
    
    console.log('Session cleared successfully');
  },
  
  /**
   * Change password (Cloudflare only)
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} - Resolves on success
   */
  changePassword: async function(currentPassword, newPassword) {
    if (!this.config.cloudflareEnabled) {
      throw new Error('Password change only available with Cloudflare authentication');
    }
    
    if (!this.sessionToken) {
      throw new Error('No active session');
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
          newPassword 
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Password change failed');
      }
      
      console.log('Password changed successfully');
      return data;
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  },
  
  /**
   * ENHANCED: Check if current user has a specific role
   * @param {string|Array} roles - Role or roles to check
   * @returns {boolean} - True if user has any of the specified roles
   */
  hasRole: function(roles) {
    if (!this.isAuthenticated || !this.userRoles) return false;
    
    const rolesToCheck = Array.isArray(roles) ? roles : [roles];
    return this.userRoles.some(role => rolesToCheck.includes(role));
  },
  
  /**
   * NEW: Check if user has specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean} - True if user has permission
   */
  hasPermission: function(permission) {
    if (!this.isAuthenticated || !this.userPermissions) return false;
    
    return this.userPermissions.includes(permission);
  },
  
  /**
   * Check if user has specific permission (legacy compatibility)
   * @param {string} permission - Permission to check
   * @returns {boolean} - True if user has permission
   */
  hasPermission: function(permission) {
    if (!this.isAuthenticated || !this.currentUser) return false;
    
    // Use permissions array if available
    if (this.userPermissions && this.userPermissions.length > 0) {
      return this.userPermissions.includes(permission);
    }
    
    // Use BBB_CONFIG permission system if available
    if (typeof BBB_CONFIG !== 'undefined' && BBB_CONFIG.hasPermission) {
      return BBB_CONFIG.hasPermission(this.currentUser.role, permission);
    }
    
    // Fallback permission check
    const role = this.currentUser.role;
    if (role === 'administrator') return true;
    if (role === 'member' && ['view_member_content', 'upload_photos', 'view_own_scorecards'].includes(permission)) return true;
    if (role === 'gallery' && ['view_gallery', 'upload_photos'].includes(permission)) return true;
    
    return false;
  },
  
  /**
   * Check if user is admin
   * @returns {boolean} - True if user is administrator
   */
  isAdmin: function() {
    return this.hasRole(['administrator', 'admin']);
  },
  
  /**
   * Check if user is member (includes admin)
   * @returns {boolean} - True if user is member or admin
   */
  isMember: function() {
    return this.hasRole(['member', 'administrator', 'admin']);
  },
  
  /**
   * NEW: Check if user can upload photos
   * @returns {boolean} - True if user can upload
   */
  canUploadPhotos: function() {
    return this.hasPermission('gallery.upload') || 
           this.hasPermission('gallery.upload_limited');
  },
  
  /**
   * NEW: Check if user can delete a specific photo
   * @param {string} photoOwnerId - ID of photo owner
   * @returns {boolean} - True if user can delete
   */
  canDeletePhoto: function(photoOwnerId) {
    return this.hasPermission('gallery.delete_any') || 
           (this.hasPermission('gallery.delete_own') && photoOwnerId === this.currentUser.id);
  },
  
  /**
   * Protect page based on required roles
   * @param {string|Array} requiredRoles - Role(s) required to access page
   * @param {string} redirectUrl - URL to redirect to if unauthorized
   */
  protectPage: function(requiredRoles, redirectUrl = '/login.html') {
    if (!this.isAuthenticated || !this.hasRole(requiredRoles)) {
      // Save current URL to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', window.location.href);
      window.location.href = redirectUrl;
    }
  },
  
  /**
   * ENHANCED: Setup auth-protected elements visibility with permissions
   */
  setupProtectedElements: function() {
    // Handle elements that should only be visible to authenticated users
    document.querySelectorAll('[data-auth-required]').forEach(el => {
      el.style.display = this.isAuthenticated ? '' : 'none';
    });
    
    // Handle elements with specific role requirements
    document.querySelectorAll('[data-role-required]').forEach(el => {
      const requiredRoles = el.dataset.roleRequired.split(',').map(r => r.trim());
      el.style.display = this.hasRole(requiredRoles) ? '' : 'none';
    });
    
    // NEW: Handle elements with specific permission requirements
    document.querySelectorAll('[data-permission-required]').forEach(el => {
      const requiredPermission = el.dataset.permissionRequired;
      el.style.display = this.hasPermission(requiredPermission) ? '' : 'none';
    });
    
    // Handle elements that should only be visible to unauthenticated users
    document.querySelectorAll('[data-auth-anonymous]').forEach(el => {
      el.style.display = !this.isAuthenticated ? '' : 'none';
    });
    
    // Handle admin-only elements
    document.querySelectorAll('[data-admin-only]').forEach(el => {
      el.style.display = this.isAdmin() ? '' : 'none';
    });
    
    // NEW: Handle upload-enabled elements
    document.querySelectorAll('[data-upload-required]').forEach(el => {
      el.style.display = this.canUploadPhotos() ? '' : 'none';
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
      onCancel: null,
      showCaptcha: this.config.captchaEnabled && this.config.cloudflareEnabled
    };
    
    const settings = { ...defaults, ...options };
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'login-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;
    
    // Create login box
    const loginBox = document.createElement('div');
    loginBox.id = 'login-box';
    loginBox.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 10px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    
    // Create title
    const title = document.createElement('h2');
    title.textContent = settings.title;
    title.style.cssText = `
      margin-bottom: 1rem;
      color: #004d00;
      text-align: center;
    `;
    
    // Create message
    const message = document.createElement('p');
    message.textContent = settings.message;
    message.style.cssText = `
      margin-bottom: 1.5rem;
      text-align: center;
      color: #666;
    `;
    
    // Create form
    const form = document.createElement('form');
    form.addEventListener('submit', e => {
      e.preventDefault();
      
      const username = settings.showUsername ? form.querySelector('#username').value : 'gallery';
      const password = form.querySelector('#password').value;
      const captchaToken = settings.showCaptcha ? form.querySelector('#captcha-token')?.value : null;
      
      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Logging in...';
      submitBtn.disabled = true;
      
      this.loginWithCaptcha(username, password, captchaToken)
        .then(user => {
          overlay.remove();
          if (settings.onSuccess) settings.onSuccess(user);
        })
        .catch(err => {
          errorMsg.style.display = 'block';
          errorMsg.textContent = err.message || 'Login failed';
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        });
    });
    
    // Create username field if needed
    if (settings.showUsername) {
      const usernameGroup = document.createElement('div');
      usernameGroup.className = 'form-group';
      usernameGroup.style.marginBottom = '1rem';
      
      const usernameInput = document.createElement('input');
      usernameInput.type = 'text';
      usernameInput.id = 'username';
      usernameInput.placeholder = settings.usernamePlaceholder;
      usernameInput.required = true;
      usernameInput.style.cssText = `
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
      `;
      
      usernameGroup.appendChild(usernameInput);
      form.appendChild(usernameGroup);
    }
    
    // Create password field
    const passwordGroup = document.createElement('div');
    passwordGroup.className = 'form-group';
    passwordGroup.style.marginBottom = '1rem';
    
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.placeholder = settings.passwordPlaceholder;
    passwordInput.required = true;
    passwordInput.style.cssText = `
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
    `;
    
    passwordGroup.appendChild(passwordInput);
    form.appendChild(passwordGroup);
    
    // Add CAPTCHA field if enabled
    if (settings.showCaptcha) {
      const captchaGroup = document.createElement('div');
      captchaGroup.className = 'form-group';
      captchaGroup.style.marginBottom = '1rem';
      
      const captchaLabel = document.createElement('label');
      captchaLabel.textContent = 'Security Verification';
      captchaLabel.style.cssText = `
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #333;
      `;
      
      const captchaNote = document.createElement('p');
      captchaNote.textContent = 'Complete the security check to continue';
      captchaNote.style.cssText = `
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 0.5rem;
      `;
      
      captchaGroup.appendChild(captchaLabel);
      captchaGroup.appendChild(captchaNote);
      form.appendChild(captchaGroup);
    }
    
    // Create error message
    const errorMsg = document.createElement('div');
    errorMsg.id = 'error-msg';
    errorMsg.className = 'error';
    errorMsg.style.cssText = `
      display: none;
      color: #dc3545;
      background: #f8d7da;
      padding: 0.75rem;
      border-radius: 5px;
      margin-bottom: 1rem;
      text-align: center;
    `;
    errorMsg.textContent = 'Incorrect credentials';
    form.appendChild(errorMsg);
    
    // Create buttons
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'form-group';
    buttonGroup.style.textAlign = 'center';
    
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn';
    submitButton.textContent = settings.submitButtonText;
    submitButton.style.cssText = `
      background: #004d00;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: bold;
    `;
    
    // Add cancel button if needed
    if (settings.onCancel) {
      const cancelButton = document.createElement('button');
      cancelButton.type = 'button';
      cancelButton.className = 'btn btn-secondary';
      cancelButton.textContent = settings.cancelButtonText;
      cancelButton.style.cssText = `
        background: #6c757d;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        margin-left: 10px;
      `;
      
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
      message: 'Enter your credentials to view the photo gallery',
      showUsername: this.config.cloudflareEnabled,
      passwordPlaceholder: this.config.cloudflareEnabled ? 'Password' : 'Gallery Password',
      submitButtonText: 'Access Gallery',
      showCaptcha: this.config.captchaEnabled && this.config.cloudflareEnabled
    });
  }
};

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BBB_AUTH;
}
