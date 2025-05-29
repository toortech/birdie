/**
 * Birdie Bush Bandits - Main Configuration File
 * Contains all shared data for the site including course information
 */

// Global site configuration
const BBB_CONFIG = {
  siteName: "Birdie Bush Bandits",
  foundedYear: 2020,
  version: "2.0",
  cloudflareEnabled: true, // Updated to true for Cloudflare integration
  
  // Cloudflare Authentication Configuration
  authWorkerUrl: 'https://bbb-auth-worker.cf1demouk.workers.dev',
  apiTimeout: 10000,
  sessionDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  environment: 'production',
  
  // Authentication settings
  auth: {
    sessionKey: 'bbb_session_token',
    userKey: 'bbb_current_user',
    expiresKey: 'bbb_session_expires',
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordMinLength: 6
  },
  
  // User roles and permissions
  roles: {
    administrator: {
      name: 'Administrator',
      permissions: [
        'view_all_content',
        'upload_photos',
        'delete_photos',
        'manage_users',
        'view_audit_logs',
        'manage_scorecards',
        'access_admin_panel'
      ]
    },
    member: {
      name: 'Member',
      permissions: [
        'view_member_content',
        'upload_photos',
        'view_own_scorecards',
        'create_scorecards',
        'use_handicap_calculator'
      ]
    }
  },
  
  // Default members list - will be replaced by database in future
  members: [
    "Amrit", "Kam", "Vish", "Ravi", "Bal", "Vick", 
    "Michael", "Justy", "Phuperjee", "Indy", "Maj", "Sama"
  ],
  
  // Course data consolidated in one place
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
  
  // Tee color names and display values
  teeColors: {
    white: "White",
    yellow: "Yellow",
    red: "Red"
  },
  
  // Gallery settings - Updated for Cloudflare auth
  gallery: {
    password: "secret123", // Legacy fallback - will be replaced with secure auth
    maxUploadSize: 5000000, // 5MB
    supportedTypes: ["image/jpeg", "image/png", "image/gif"],
    requireAuth: true, // New: Require authentication for gallery access
    adminOnlyUpload: false, // Set to true if only admins can upload
    adminOnlyDelete: true // Only admins can delete photos
  },
  
  // Handicap calculation settings
  handicap: {
    minRounds: 3,
    maxRounds: 20,
    countMap: {3:1, 4:1, 5:1, 6:2, 7:2, 8:2, 9:3, 10:3, 11:3, 12:4, 13:4, 14:4, 15:5, 16:5, 17:6, 18:7, 19:8, 20:10}
  },
  
  // Feature flags for different sections
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
  
  // Utility functions for permissions
  hasPermission: function(userRole, permission) {
    if (!userRole || !this.roles[userRole]) {
      return false;
    }
    return this.roles[userRole].permissions.includes(permission);
  },
  
  isAdmin: function(userRole) {
    return userRole === 'administrator';
  },
  
  isMember: function(userRole) {
    return userRole === 'member' || userRole === 'administrator';
  }
};

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BBB_CONFIG;
}
