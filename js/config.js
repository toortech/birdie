/**
 * Birdie Bush Bandits - Configuration with Cloudflare Turnstile CAPTCHA
 * This configuration enforces maximum security with mandatory CAPTCHA verification
 * BUT also supports local authentication when Cloudflare is unavailable
 */

const BBB_CONFIG = {
  // Core Application Settings
  appName: 'Birdie Bush Bandits',
  version: '2.0.0-secure',
  founded: 'August 2020',
  
  // Cloudflare Settings (preferred but with fallback)
  cloudflareEnabled: true, // Try Cloudflare first
  requireCaptcha: true,    // Always require CAPTCHA
  
  // Cloudflare Worker Authentication URL
  authWorkerUrl: 'https://bbb-auth-worker.cf1demouk.workers.dev',
  
  // Cloudflare Turnstile CAPTCHA Configuration
  turnstile: {
    // Site key (public) - visible in client-side code
    siteKey: '0x4AAAAAABfEpGjFkd7F7pec',
    
    // Secret key (private) - only used in Cloudflare Worker
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
  
  // Member Configuration (for local fallback authentication)
  members: [
    'Amrit', 'Kam', 'Vish', 'Ravi', 'Bal', 'Vick', 
    'Michael', 'Justy', 'Phuperjee', 'Indy', 'Maj', 'Sama'
  ],
  
  // Gallery Configuration (with local fallback support)
  gallery: {
    // For local fallback authentication
    password: 'secret123', // Change this and use strong password
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
      'Richings Park Golf Club',
      'Thorney Park Golf Club',
      'London Airlinks Golf Club',
      'Royal Ascot Golf Club',
      'Stoke Park Golf Club',
      'Inspirations Golf Club'
    ]
  },
  
  // Course data (from old config)
  courses: {
    "Richings Park Golf Club": { 
      shortName: "Richings",
      par: [4,3,5,4,4,3,4,4,4,3,4,4,4,3,4,4,5,4],
      si:  [15,4,12,18,16,14,2,6,8,11,3,17,10,7,5,1,13,9],
      yards: {
        white: [287,199,545,345,335,165,397,299,388,172,417,328,356,201,420,431,423,402],
        yellow: [265,188,534,335,322,149,383,284,364,162,373,318,344,188,391,392,513,380],
        red: [237,158,490,300,289,130,353,257,344,132,351,294,323,177,391,337,479,360]
      },
      tees: {
        white: {courseRating: 70.7, slopeRating: 128},
        yellow: {courseRating: 68.3, slopeRating: 121},
        red: {courseRating: 65.9, slopeRating: 115}
      }
    },
    "Thorney Park Golf Club": { 
      shortName: "Thorney",
      par: [5,4,4,3,5,4,4,3,5,4,4,3,5,4,4,3,5,4],
      si:  [9,15,1,17,5,13,3,11,7,16,2,14,6,18,4,12,8,10],
      yards: {
        white: [475,360,410,155,495,345,375,160,500,350,370,150,480,355,385,145,505,365],
        yellow: [460,345,395,145,480,330,360,150,485,335,355,140,465,340,370,135,490,350],
        red: [440,320,370,130,450,305,335,135,455,310,330,125,435,315,345,120,460,325]
      },
      tees: {
        white: {courseRating: 68.7, slopeRating: 120},
        yellow: {courseRating: 67.0, slopeRating: 117},
        red: {courseRating: 69.3, slopeRating: 119}
      }
    },
    "London Airlinks Golf Club": { 
      shortName: "Airlinks",
      par: [4,3,4,5,3,4,4,5,4,3,4,4,5,3,4,4,3,5],
      si:  [6,14,4,10,16,2,8,12,1,18,7,5,11,17,3,9,15,13],
      yards: {
        white: [375,185,420,510,175,450,380,520,430,165,410,365,525,170,445,375,180,540],
        yellow: [360,175,405,495,165,435,365,510,415,155,395,355,515,160,430,365,170,525],
        red: [345,165,385,470,150,410,345,480,395,145,375,335,485,145,405,345,155,495]
      },
      tees: {
        white: {courseRating: 63.4, slopeRating: 102},
        yellow: {courseRating: 62.0, slopeRating: 98},
        red: {courseRating: 61.1, slopeRating: 92}
      }
    },
    "Royal Ascot Golf Club": { 
      shortName: "Ascot",
      par: [4,4,3,4,5,4,3,4,5,4,3,4,5,3,4,4,3,5],
      si:  [5,11,15,1,9,3,17,7,13,4,18,6,10,16,2,8,14,12],
      yards: {
        white: [410,385,175,440,525,430,180,415,545,425,170,435,530,185,445,405,175,540],
        yellow: [395,370,165,425,510,415,170,400,530,410,160,420,515,175,430,390,165,525],
        red: [365,340,145,395,480,385,150,370,500,380,140,390,485,155,400,360,145,495]
      },
      tees: {
        white: {courseRating: 70.3, slopeRating: 123},
        yellow: {courseRating: 68.5, slopeRating: 118},
        red: {courseRating: 70.0, slopeRating: 113}
      }
    },
    "Stoke Park Golf Club": { 
      shortName: "Stoke",
      par: [4,5,3,4,4,3,4,4,5,4,3,4,5,4,3,4,5,4],
      si:  [7,15,11,1,9,17,5,3,13,8,18,4,10,2,16,6,12,14],
      yards: {
        white: [405,510,190,450,430,175,415,425,535,420,165,440,520,430,180,425,545,410],
        yellow: [390,495,180,435,415,165,400,410,520,405,155,425,505,415,170,410,530,395],
        red: [360,465,160,405,385,145,370,380,490,375,135,395,475,385,150,380,500,365]
      },
      tees: {
        white: {courseRating: 70.9, slopeRating: 126},
        yellow: {courseRating: 69.1, slopeRating: 122},
        red: {courseRating: 68.5, slopeRating: 118}
      }
    },
    "Inspirations Golf Club": { 
      shortName: "Inspirations",
      par: [5,4,3,4,5,3,4,4,5,4,3,4,5,4,3,4,4,5],
      si:  [11,5,17,1,9,15,3,7,13,4,18,6,10,2,16,8,14,12],
      yards: {
        white: [530,440,185,460,540,175,445,430,555,435,180,450,535,465,170,425,410,540],
        yellow: [515,425,175,445,525,165,430,415,540,420,170,435,520,450,160,410,395,525],
        red: [485,395,155,415,495,145,400,385,510,390,150,405,490,420,140,380,365,495]
      },
      tees: {
        white: {courseRating: 74.3, slopeRating: 128},
        yellow: {courseRating: 72.1, slopeRating: 124},
        red: {courseRating: 70.5, slopeRating: 120}
      }
    }
  },
  
  // Tee color names
  teeColors: {
    white: "White",
    yellow: "Yellow", 
    red: "Red"
  },
  
  // Handicap calculation settings
  handicap: {
    minRounds: 3,
    maxRounds: 20,
    countMap: {3:1, 4:1, 5:1, 6:2, 7:2, 8:2, 9:3, 10:3, 11:3, 12:4, 13:4, 14:4, 15:5, 16:5, 17:6, 18:7, 19:8, 20:10}
  },
  
  // Database Configuration
  database: {
    useCloudflare: true, // Try Cloudflare first
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
  
  // Feature flags for different sections (from old config)
  features: {
    photoGallery: {
      enabled: true,
      requireAuth: true,
      allowUploads: true,
      adminOnlyDelete: true
    },
    scorecards: {
      enabled: true,
      requireAuth: true,
      allowSharing: false
    },
    handicapCalculator: {
      enabled: true,
      requireAuth: true,
      saveResults: true
    },
    members: {
      enabled: true,
      requireAuth: true,
      showProfiles: true
    },
    adminPanel: {
      enabled: true,
      adminOnly: true
    }
  },
  
  // API endpoints for different features
  api: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      verify: '/auth/verify',
      changePassword: '/auth/change-password'
    },
    users: {
      list: '/api/users',
      profile: '/api/users/profile',
      update: '/api/users/update'
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
   * Check if user is admin
   * @param {string} userRole - User's role
   * @returns {boolean} - True if admin
   */
  isAdmin: function(userRole) {
    return userRole === 'administrator';
  },
  
  /**
   * Check if user is member (includes admin)
   * @param {string} userRole - User's role
   * @returns {boolean} - True if member or admin
   */
  isMember: function(userRole) {
    return userRole === 'member' || userRole === 'administrator';
  },
  
  /**
   * Validate configuration on startup
   * @returns {Object} - Validation result
   */
  validateConfig: function() {
    const errors = [];
    const warnings = [];
    
    // Check mandatory Cloudflare settings (but allow fallback)
    if (!this.cloudflareEnabled) {
      warnings.push('Cloudflare authentication is disabled - using local fallback');
    }
    
    if (!this.requireCaptcha) {
      errors.push('CAPTCHA verification must be enabled');
    }
    
    // Check Turnstile configuration
    if (!this.turnstile.siteKey || this.turnstile.siteKey === 'YOUR_TURNSTILE_SITE_KEY_HERE') {
      warnings.push('Turnstile site key not properly configured - CAPTCHA may not work');
    }
    
    if (!this.authWorkerUrl || this.authWorkerUrl.includes('your-auth-worker')) {
      warnings.push('Cloudflare Worker URL not configured - will use local authentication');
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
    this.cloudflareEnabled = true; // Try Cloudflare but allow fallback
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
