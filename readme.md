# Birdie Bush Bandits Golf Club Website

A modern, modular website for the Birdie Bush Bandits golf group, featuring photo galleries, scorecards, handicap calculations, and member management.

## 🏌️‍♂️ Overview

This project is a complete rewrite of the Birdie Bush Bandits website, following best practices for code organization, reusability, and maintainability. The site is designed to eventually integrate with Cloudflare services for enhanced security, performance, and data management.

## 📂 Project Structure

```
birdie-bush-bandits/
├── css/
│   └── style.css          # Main stylesheet with variables and responsive design
├── js/
│   ├── config.js          # Centralized configuration (courses, tees, settings)
│   ├── utils.js           # Utility functions (calculations, formatting)
│   ├── auth.js            # Authentication module (login, session management)
│   ├── db.js              # Data persistence (localStorage/Cloudflare)
│   └── ui.js              # Reusable UI components
├── img/
│   ├── bbb-logo.svg       # Club logo
│   ├── golfball.png       # Golf ball icon
│   └── golf-flag.jpeg     # Main page image
├── index.html             # Home page
├── handicap-calculator.html # Handicap calculator page
├── photo-gallery.html     # Photo gallery (password protected)
├── view-saved-scores.html # View scorecards
├── members.html           # Members directory
└── README.md              # Project documentation
```

## 🛠️ Technology Stack

- **Frontend:** Pure JavaScript, HTML5, CSS3
- **Data Storage:** localStorage (client-side) with prepared Cloudflare integration
- **Authentication:** Custom auth system with JWT support for Cloudflare
- **Deployment:** Static hosting with plans for Cloudflare Pages

## ✨ Key Features

### Modular Architecture

The codebase uses a modular approach with separate files for different functionality:

- **Configuration (`config.js`)**: Centralizes all site configuration, including course data, tee colors, and settings.
- **Utilities (`utils.js`)**: Provides helper functions for calculations, formatting, and common operations.
- **Authentication (`auth.js`)**: Handles user authentication, session management, and role-based access control.
- **Database (`db.js`)**: Manages data persistence with support for both local storage and Cloudflare integration.
- **UI Components (`ui.js`)**: Contains reusable UI elements for consistent look and feel.

### Responsive Design

- The site is fully responsive, working on mobile, tablet, and desktop screens.
- CSS variables are used for consistent styling and easy theming.
- Semantic HTML5 elements improve accessibility and SEO.

### Golf Features

1. **Handicap Calculator**
   - Calculates handicap index based on the World Handicap System.
   - Supports multiple courses and tee options.
   - Saves handicap history for logged-in users.

2. **Scorecard System**
   - Creates and saves scorecards for multiple players.
   - Calculates Stableford points automatically.
   - Supports full 18-hole rounds or front/back 9.

3. **Photo Gallery**
   - Password-protected image gallery.
   - Upload and display golf outing photos.
   - Lightbox view for individual images.

4. **Member Management**
   - Displays member information and handicaps.
   - Role-based access control for admin features.

## 🚀 Cloudflare Integration

The site is prepared for Cloudflare integration with:

- **Authentication:** Ready for JWT-based auth using Cloudflare Workers.
- **Data Storage:** Support for Cloudflare D1 database or KV storage.
- **Image Hosting:** Prepared for R2 storage integration for gallery images.

See the [Cloudflare Integration Plan](CLOUDFLARE.md) for detailed implementation steps.

## 🔒 Security Features

- **Authentication:** Secure login system with role-based permissions.
- **Data Validation:** Input validation on client and server side.
- **Password Protection:** Sensitive areas like the photo gallery require authentication.
- **JWT Support:** Ready for secure token-based authentication.

## 📱 Mobile Optimization

- **Responsive Layouts:** Adapts to different screen sizes.
- **Touch-Friendly UI:** Large touch targets for mobile users.
- **Performance Optimization:** Fast loading on mobile networks.

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- Basic knowledge of HTML, CSS, and JavaScript (for development)
- (Optional) Cloudflare account for advanced features

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/birdie-bush-bandits.git
   cd birdie-bush-bandits
   ```

2. **Local Development:**
   - Simply open `index.html` in your browser for basic functionality
   - For advanced features, use a local server:
     ```bash
     # Using Python
     python -m http.server 8080
     
     # Or using Node.js with http-server
     npx http-server
     ```

3. **Configuration:**
   - Edit `js/config.js` to customize course data, tee colors, and other settings
   - For testing user accounts, use the following credentials:
     - Gallery access: username: `gallery`, password: `secret123`
     - Admin access: username: `admin`, password: `admin123`
     - Member access: Any member name + password: `member123`

### Cloudflare Setup

For full Cloudflare integration, see the detailed [Cloudflare Integration Plan](CLOUDFLARE.md).

## 📝 Code Structure and Customization

### Adding a New Course

To add a new golf course, edit the `courses` object in `js/config.js`:

```javascript
"New Course Name": { 
  shortName: "NewCourse",
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
}
```

### Adding New Members

To add new members, update the `members` array in `js/config.js`:

```javascript
members: [
  "Amrit", "Kam", "Vish", "Ravi", "Bal", "Vick", 
  "Michael", "Justy", "Phuperjee", "Indy", "Maj", "Sama",
  "New Member Name"
]
```

### Customizing Styles

The site uses CSS variables for easy theming. Edit them in `css/style.css`:

```css
:root {
  --bbb-primary: #003300;     /* Main color */
  --bbb-secondary: #004c99;   /* Action color */
  /* Add or modify other variables as needed */
}
```

## 🔄 Data Migration

To migrate from the old system to the new modular structure:

1. **Handicap Data:**
   ```javascript
   // In the old system
   const oldHandicaps = JSON.parse(localStorage.getItem('golfHandicaps') || '[]');
   
   // Convert to new format
   oldHandicaps.forEach(oldData => {
     BBB_DB.saveMemberHandicap(oldData.player, {
       index: oldData.handicap,
       calculatedAt: new Date().toISOString(),
       differentials: oldData.differentials || [],
       rounds: oldData.rounds || 0
     });
   });
   ```

2. **Scorecard Data:**
   ```javascript
   // In the old system
   const oldScorecards = JSON.parse(localStorage.getItem('golfScorecards') || '[]');
   
   // Convert to new format
   oldScorecards.forEach(oldCard => {
     BBB_DB.saveScorecard({
       date: oldCard.date,
       course: oldCard.course,
       tee: oldCard.tee,
       holes: oldCard.holes,
       players: oldCard.players,
       createdAt: new Date().toISOString()
     });
   });
   ```

## 📈 Future Enhancements

Planned features for future versions:

1. **Tournament Management:**
   - Create and manage golf tournaments
   - Track results and leaderboards

2. **Statistics Dashboard:**
   - Player performance analytics
   - Course statistics and difficulty rankings

3. **Mobile App:**
   - Native mobile experience with PWA technology
   - Offline scorecard entry

4. **Social Features:**
   - Comments on gallery photos
   - Event organization and RSVP

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For questions or support, contact the Birdie Bush Bandits admin at admin@birdiebandit.com
