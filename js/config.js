/**
 * Birdie Bush Bandits - Configuration with Cloudflare Turnstile CAPTCHA
 * This configuration enforces maximum security with mandatory CAPTCHA verification
 */

const BBB_CONFIG = {
  // Core Application Settings
  appName: 'Birdie Bush Bandits',
  version: '2.0.0-secure',
  founded: 'August 2020',
  
  // MANDATORY: Cloudflare Settings (always enabled for BBB)
  cloudflareEnabled: true, // CANNOT be disabled
  requireCaptcha: true,    // CANNOT be disabled
  
  // Cloudflare Worker Authentication URL
  // IMPORTANT: Replace with your actual Cloudflare Worker URL
  authWorkerUrl: 'https://bbb-auth-worker.cf1demouk.workers.dev',
  
  // Cloudflare Turnstile CAPTCHA Configuration
  // IMPORTANT: Replace with your actual Turnstile keys from Cloudflare Dashboard
  turnstile: {
    // Site key (public) - visible in client-side code
    // TODO: Replace with your actual Turnstile site key
    siteKey: '0x4AAAAAABfEpGjFkd7F7pec',
    
    // Secret key (private) - only used in Cloudflare Worker
    // DO NOT include the secret key in client-side code!
    // This is here for reference only - set it as environment variable in your Worker
    secretKey: 'YOUR_TURNSTILE_SECRET_KEY_HERE', // Use env.TURNSTILE_SECRET_KEY in Worker
    
    // Turnstile theme and appearance
    theme: 'light', // 'light', 'dark', or 'auto'
    size: 'normal', // 'normal', 'compact'
    
    // Security settings
    retry: 'auto',
    retryInterval: 8000, // 8 seconds
    refreshExpired: 'auto'
  },
  
  // Enhanced Security Settings
  security: {
    level: 'MAXIMUM',
    enforceHttps: true,
    sessionDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    maxLoginAttempts: 3,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes
    requireStrongPasswords: true,
    auditAllActions: true,
    
    // CAPTCHA requirements
    captchaRequired: {
      login: true,           // Always required
      passwordChange: true,  // Always required
      adminActions: true,    // Always required
      userCreation: true     // Always required
    }
  },
  
  // Session Management
  sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
  sessionCleanupInterval: 60 * 60 * 1000, // 1 hour
  
  // User Roles and Permissions
  roles: {
    administrator: {
      name: 'Administrator',
      permissions: [
        'view_all_content',
        'manage_users',
        'manage_scorecards',
        'manage_gallery',
        'view_analytics',
        'manage_system',
        'access_admin_panel',
        'create_users',
        'delete_users',
        'modify_permissions',
        'view_audit_logs'
      ],
      securityLevel: 'MAXIMUM'
    },
    member: {
      name: 'Member',
      permissions: [
        'view_member_content',
        'upload_photos',
        'view_own_scorecards',
        'create_scorecards',
        'view_gallery',
        'update_profile'
      ],
      securityLevel: 'MAXIMUM'
    },
    gallery: {
      name: 'Gallery Viewer',
      permissions: [
        'view_gallery'
      ],
      securityLevel: 'MAXIMUM'
    }
  },
  
  // Member Configuration (for local fallback - not recommended for production)
  members: [
    'dan_c',
    'john_m', 
    'steve_h',
    'mike_r',
    'chris_w',
    'tom_b',
    'paul_s',
    'dave_l'
  ],
  
  // Gallery Configuration
  gallery: {
    // For local fallback only - use Cloudflare authentication in production
    password: 'bbb2024secure!', // Change this and use strong password
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    thumbnailSize: 300,
    requireLogin: true,
    requireCaptcha: true // Always require CAPTCHA for gallery access
  },
  
  // Scorecard Configuration
  scorecards: {
    requireLogin: true,
    requireCaptcha: true, // Always require CAPTCHA for scorecard operations
    allowGuestView: false,
    maxScorecardsPerUser: 100,
    defaultCourses: [
      'Birdie Bush Golf Course',
      'Local Municipal Course',
      'Championship Links'
    ]
  },
  
  // Database Configuration
  database: {
    useCloudflare: true, // MANDATORY - always use Cloudflare
    localStoragePrefix: 'bbb_secure_',
    encryptLocalData: true,
    clearOnLogout: true
  },
  
  // UI Configuration
  ui: {
    theme: 'default',
    showSecurityIndicators: true, // Always show security status
    showCaptchaStatus: true,      // Always show CAPTCHA status
    animateSecurityActions: true,
    highlightSecureElements: true,
    securityBadgeColor: '#28a745',
    
    // Colors
    colors: {
      primary: '#004d00',    // Dark green
      secondary: '#0046ad',  // Blue  
      accent: '#ffd700',     // Gold
      success: '#28a745',    // Green
      warning: '#ffc107',    // Yellow
      danger: '#dc3545',     // Red
      security: '#007bff'    // Security blue
    }
  },
  
  // Error Handling
  errors: {
    showDetailedErrors: false, // Security: don't expose internal errors
    logAllErrors: true,
    retryAttempts: 3,
    retryDelay: 1000,
    
    // Security-specific error messages
    messages: {
      captchaRequired: 'Security verification is required to continue.',
      captchaFailed: 'Security verification failed. Please try again.',
      sessionExpired: 'Your secure session has expired. Please log in again.',
      insufficientPermissions: 'You do not have permission to access this resource.',
      securityViolation: 'Security violation detected. This incident has been logged.'
    }
  },
  
  // Development Settings
  development: {
    enabled: false, // Set to true only for development
    mockAuth: false, // NEVER enable in production
    skipCaptcha: false, // NEVER enable - CAPTCHA always required
    verboseLogging: false,
    showDebugInfo: false
  },
  
  // Utility Functions
  
  /**
   * Check if user has specific permission
   * @param {string} userRole - User's role
   * @param {string} permission - Permission to check
   * @returns {boolean} - True if user has permission
   */
  hasPermission: function(userRole, permission) {
    if (!userRole || !permission) return false;
    
    const role = this.roles[userRole];
    if (!role) return false;
    
    return role.permissions.includes(permission);
  },
  
  /**
   * Get security level for user role
   * @param {string} userRole - User's role
   * @returns {string} - Security level
   */
  getSecurityLevel: function(userRole) {
    if (!userRole) return 'NONE';
    
    const role = this.roles[userRole];
    return role ? role.securityLevel : 'NONE';
  },
  
  /**
   * Check if CAPTCHA is required for specific action
   * @param {string} action - Action to check
   * @returns {boolean} - True if CAPTCHA required (always true for BBB)
   */
  isCaptchaRequired: function(action) {
    // CAPTCHA is ALWAYS required for all actions in BBB
    return true;
  },
  
  /**
   * Get Turnstile configuration for client
   * @returns {Object} - Client-safe Turnstile config
   */
  getTurnstileConfig: function() {
    return {
      siteKey: this.turnstile.siteKey,
      theme: this.turnstile.theme,
      size: this.turnstile.size,
      retry: this.turnstile.retry,
      retryInterval: this.turnstile.retryInterval,
      refreshExpired: this.turnstile.refreshExpired
    };
  },
  
  /**
   * Validate configuration on startup
   * @returns {Object} - Validation result
   */
  validateConfig: function() {
    const errors = [];
    const warnings = [];
    
    // Check mandatory Cloudflare settings
    if (!this.cloudflareEnabled) {
      errors.push('Cloudflare authentication must be enabled');
    }
    
    if (!this.requireCaptcha) {
      errors.push('CAPTCHA verification must be enabled');
    }
    
    // Check Turnstile configuration
    if (!this.turnstile.siteKey || this.turnstile.siteKey === 'YOUR_TURNSTILE_SITE_KEY_HERE') {
      errors.push('Turnstile site key must be configured');
    }
    
    if (!this.authWorkerUrl || this.authWorkerUrl.includes('your-auth-worker')) {
      errors.push('Cloudflare Worker URL must be configured');
    }
    
    // Check development settings in production
    if (this.development.enabled && window.location.hostname !== 'localhost') {
      warnings.push('Development mode is enabled in production');
    }
    
    if (this.development.mockAuth) {
      errors.push('Mock authentication must be disabled in production');
    }
    
    if (this.development.skipCaptcha) {
      errors.push('CAPTCHA skip mode must be disabled - CAPTCHA is always required');
    }
    
    // Security validations
    if (this.security.level !== 'MAXIMUM') {
      warnings.push('Security level should be set to MAXIMUM');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      securityLevel: this.security.level,
      captchaEnabled: this.requireCaptcha,
      cloudflareEnabled: this.cloudflareEnabled
    };
  },
  
  /**
   * Initialize configuration with security checks
   * @returns {boolean} - True if initialization successful
   */
  init: function() {
    console.log('Initializing BBB Configuration with Maximum Security...');
    
    // Force security settings
    this.cloudflareEnabled = true;
    this.requireCaptcha = true;
    this.security.level = 'MAXIMUM';
    
    // Validate configuration
    const validation = this.validateConfig();
    
    if (!validation.valid) {
      console.error('Configuration validation failed:', validation.errors);
      throw new Error('Invalid configuration: ' + validation.errors.join(', '));
    }
    
    if (validation.warnings.length > 0) {
      console.warn('Configuration warnings:', validation.warnings);
    }
    
    console.log('BBB Configuration initialized successfully:', {
      securityLevel: validation.securityLevel,
      captchaEnabled: validation.captchaEnabled,
      cloudflareEnabled: validation.cloudflareEnabled,
      version: this.version
    });
    
    return true;
  }
};

// Immediately initialize and validate configuration
try {
  BBB_CONFIG.init();
} catch (error) {
  console.error('CRITICAL: Configuration initialization failed:', error);
  // You might want to prevent the application from starting here
}

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BBB_CONFIG;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.BBB_CONFIG = BBB_CONFIG;
}
