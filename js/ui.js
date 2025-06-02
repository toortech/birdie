/**
 * Birdie Bush Bandits - UI Components
 * Reusable UI components for consistent interface
 */

const BBB_UI = {
  /**
   * Create page header with logo and navigation
   * @param {Object} options - Configuration options
   * @returns {HTMLElement} - Header element
   */
  createHeader: function(options = {}) {
    const defaults = {
      fixed: true,
      showHomeLinkText: true,
      additionalLinks: [],
      showLogo: true
    };
    
    const settings = { ...defaults, ...options };
    
    // Create header container
    const header = document.createElement('header');
    if (settings.fixed) {
      header.className = 'fixed-header';
    }
    
    // Create navigation
    const nav = document.createElement('nav');
    
    // Create home link
    const homeLink = document.createElement('a');
    homeLink.href = 'index.html';
    homeLink.className = 'home-link';
    
    if (settings.showHomeLinkText) {
      homeLink.innerHTML = '🏠 Home';
    } else {
      homeLink.innerHTML = '🏠';
    }
    
    nav.appendChild(homeLink);
    
    // Add additional links if provided
    if (settings.additionalLinks && settings.additionalLinks.length) {
      settings.additionalLinks.forEach(link => {
        const a = document.createElement('a');
        a.href = link.url;
        a.className = link.className || 'nav-link';
        a.innerHTML = link.text;
        a.style.marginLeft = '10px';
        nav.appendChild(a);
      });
    }
    
    header.appendChild(nav);
    
    // Create main content wrapper if fixed header
    const mainWrapper = document.createElement('div');
    if (settings.fixed) {
      mainWrapper.className = 'main-content';
    }
    
    // Add logo if needed
    if (settings.showLogo) {
      const topBar = document.createElement('div');
      topBar.className = 'top-bar';
      
      const logo = document.createElement('img');
      logo.src = 'bbb-logo.svg';
      logo.alt = 'Birdie Bush Bandits Logo';
      logo.className = 'corner-logo';
      
      topBar.appendChild(logo);
      document.body.appendChild(topBar);
    }
    
    // Return both elements
    return {
      header: header,
      mainWrapper: mainWrapper
    };
  },
  
  /**
   * Create page title with golf ball icons
   * @param {Object} options - Configuration options
   * @returns {HTMLElement} - Title element
   */
  createPageTitle: function(options = {}) {
    const defaults = {
      title: 'Birdie Bush Bandits',
      showFoundedText: true,
      showGolfballs: true,
      titleTag: 'h1'
    };
    
    const settings = { ...defaults, ...options };
    
    // Create container
    const container = document.createElement('div');
    container.className = 'title-container';
    
    // Create title
    const title = document.createElement(settings.titleTag);
    
    if (settings.showGolfballs) {
      const golfballLeft = document.createElement('img');
      golfballLeft.src = 'golfball.png';
      golfballLeft.alt = '';
      golfballLeft.setAttribute('aria-hidden', 'true');
      
      const golfballRight = document.createElement('img');
      golfballRight.src = 'golfball.png';
      golfballRight.alt = '';
      golfballRight.setAttribute('aria-hidden', 'true');
      
      title.appendChild(golfballLeft);
      title.appendChild(document.createTextNode(' ' + settings.title + ' '));
      title.appendChild(golfballRight);
    } else {
      title.textContent = settings.title;
    }
    
    container.appendChild(title);
    
    // Add founded text if needed
    if (settings.showFoundedText) {
      const founded = document.createElement('div');
      founded.className = 'founded';
      founded.textContent = 'Founded August 2020';
      container.appendChild(founded);
    }
    
    return container;
  },
  
  /**
   * Create status message element
   * @returns {HTMLElement} - Status message element
   */
  createStatusMessage: function() {
    const statusMessage = document.createElement('div');
    statusMessage.id = 'status-message';
    return statusMessage;
  },
  
  /**
   * Create main navigation links
   * @returns {HTMLElement} - Navigation element
   */
  createMainNavigation: function() {
    const nav = document.createElement('nav');
    nav.className = 'nav-boxes';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');
    
    const links = [
      { url: 'photo-gallery.html', text: 'Photo Gallery' },
      { url: 'view-saved-scores.html', text: 'Scorecards' },
      { url: 'handicap-calculator.html', text: 'Handicap Calculator' },
      { url: 'members.html', text: 'Members' }
    ];
    
    links.forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.textContent = link.text;
      nav.appendChild(a);
    });
    
    return nav;
  },
  
  /**
   * Create a button
   * @param {Object} options - Button options
   * @returns {HTMLElement} - Button element
   */
  createButton: function(options = {}) {
    const defaults = {
      text: 'Button',
      type: 'button',
      className: 'btn',
      onClick: null,
      disabled: false
    };
    
    const settings = { ...defaults, ...options };
    
    const button = document.createElement('button');
    button.type = settings.type;
    button.className = settings.className;
    button.textContent = settings.text;
    button.disabled = settings.disabled;
    
    if (settings.onClick) {
      button.addEventListener('click', settings.onClick);
    }
    
    return button;
  },
  
  /**
   * Create a button group
   * @param {Array} buttons - Array of button options
   * @returns {HTMLElement} - Button group element
   */
  createButtonGroup: function(buttons) {
    const group = document.createElement('div');
    group.className = 'button-group';
    
    buttons.forEach(buttonOptions => {
      const button = this.createButton(buttonOptions);
      group.appendChild(button);
    });
    
    return group;
  },
  
  /**
   * Create a card
   * @param {Object} options - Card options
   * @returns {HTMLElement} - Card element
   */
  createCard: function(options = {}) {
    const defaults = {
      title: null,
      content: null,
      footer: null,
      className: 'card'
    };
    
    const settings = { ...defaults, ...options };
    
    const card = document.createElement('div');
    card.className = settings.className;
    
    if (settings.title) {
      const header = document.createElement('div');
      header.className = 'card-header';
      
      const title = document.createElement('h3');
      title.className = 'card-title';
      title.textContent = settings.title;
      
      header.appendChild(title);
      card.appendChild(header);
    }
    
    if (settings.content) {
      const content = document.createElement('div');
      content.className = 'card-content';
      
      if (typeof settings.content === 'string') {
        content.innerHTML = settings.content;
      } else if (settings.content instanceof HTMLElement) {
        content.appendChild(settings.content);
      }
      
      card.appendChild(content);
    }
    
    if (settings.footer) {
      const footer = document.createElement('div');
      footer.className = 'card-footer';
      
      if (typeof settings.footer === 'string') {
        footer.innerHTML = settings.footer;
      } else if (settings.footer instanceof HTMLElement) {
        footer.appendChild(settings.footer);
      }
      
      card.appendChild(footer);
    }
    
    return card;
  },
  
  /**
   * Create a form
   * @param {Object} options - Form options
   * @returns {HTMLElement} - Form element
   */
  createForm: function(options = {}) {
    const defaults = {
      id: null,
      className: '',
      fields: [],
      buttons: [],
      onSubmit: null
    };
    
    const settings = { ...defaults, ...options };
    
    const form = document.createElement('form');
    if (settings.id) form.id = settings.id;
    form.className = settings.className;
    
    if (settings.onSubmit) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        settings.onSubmit(e);
      });
    }
    
    // Add fields
    settings.fields.forEach(field => {
      const formGroup = document.createElement('div');
      formGroup.className = 'form-group';
      
      if (field.label) {
        const label = document.createElement('label');
        label.setAttribute('for', field.id);
        label.textContent = field.label;
        formGroup.appendChild(label);
      }
      
      let input;
      
      switch (field.type) {
        case 'select':
          input = document.createElement('select');
          if (field.options) {
            field.options.forEach(option => {
              const opt = document.createElement('option');
              opt.value = option.value;
              opt.textContent = option.text;
              if (option.selected) opt.selected = true;
              input.appendChild(opt);
            });
          }
          break;
          
        case 'textarea':
          input = document.createElement('textarea');
          break;
          
        case 'checkbox':
        case 'radio':
          input = document.createElement('input');
          input.type = field.type;
          if (field.checked) input.checked = true;
          
          // Move label after input for checkboxes and radios
          if (field.label) {
            formGroup.innerHTML = '';
            formGroup.appendChild(input);
            
            const label = document.createElement('label');
            label.setAttribute('for', field.id);
            label.textContent = field.label;
            label.className = field.type;
            formGroup.appendChild(label);
          }
          break;
          
        default:
          input = document.createElement('input');
          input.type = field.type || 'text';
      }
      
      // Set common attributes
      if (field.id) input.id = field.id;
      if (field.name) input.name = field.name;
      if (field.placeholder) input.placeholder = field.placeholder;
      if (field.value) input.value = field.value;
      if (field.required) input.required = true;
      if (field.disabled) input.disabled = true;
      if (field.className) input.className = field.className;
      if (field.min !== undefined) input.min = field.min;
      if (field.max !== undefined) input.max = field.max;
      if (field.step !== undefined) input.step = field.step;
      if (field.pattern) input.pattern = field.pattern;
      
      // Add event listeners
      if (field.onChange) input.addEventListener('change', field.onChange);
      if (field.onInput) input.addEventListener('input', field.onInput);
      if (field.onFocus) input.addEventListener('focus', field.onFocus);
      if (field.onBlur) input.addEventListener('blur', field.onBlur);
      
      // Don't append input again for checkbox/radio as we already did
      if (field.type !== 'checkbox' && field.type !== 'radio') {
        formGroup.appendChild(input);
      }
      
      form.appendChild(formGroup);
    });
    
    // Add buttons
    if (settings.buttons.length) {
      const buttonGroup = document.createElement('div');
      buttonGroup.className = 'form-group button-group';
      
      settings.buttons.forEach(button => {
        buttonGroup.appendChild(this.createButton(button));
      });
      
      form.appendChild(buttonGroup);
    }
    
    return form;
  },
  
  /**
   * Create a table
   * @param {Object} options - Table options
   * @returns {HTMLElement} - Table element
   */
  createTable: function(options = {}) {
    const defaults = {
      headers: [],
      rows: [],
      caption: null,
      id: null,
      className: ''
    };
    
    const settings = { ...defaults, ...options };
    
    const table = document.createElement('table');
    if (settings.id) table.id = settings.id;
    table.className = settings.className;
    
    // Add caption
    if (settings.caption) {
      const caption = document.createElement('caption');
      caption.textContent = settings.caption;
      table.appendChild(caption);
    }
    
    // Add header
    if (settings.headers.length) {
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');
      
      settings.headers.forEach(header => {
        const th = document.createElement('th');
        
        if (typeof header === 'string') {
          th.textContent = header;
        } else {
          th.textContent = header.text;
          if (header.colspan) th.colSpan = header.colspan;
          if (header.rowspan) th.rowSpan = header.rowspan;
          if (header.className) th.className = header.className;
        }
        
        tr.appendChild(th);
      });
      
      thead.appendChild(tr);
      table.appendChild(thead);
    }
    
    // Add body
    if (settings.rows.length) {
      const tbody = document.createElement('tbody');
      
      settings.rows.forEach(row => {
        const tr = document.createElement('tr');
        if (row.className) tr.className = row.className;
        
        row.cells.forEach(cell => {
          const td = document.createElement('td');
          
          if (typeof cell === 'string' || typeof cell === 'number') {
            td.textContent = cell;
          } else {
            if (typeof cell.content === 'string' || typeof cell.content === 'number') {
              td.textContent = cell.content;
            } else if (cell.content instanceof HTMLElement) {
              td.appendChild(cell.content);
            } else if (typeof cell.html === 'string') {
              td.innerHTML = cell.html;
            }
            
            if (cell.colspan) td.colSpan = cell.colspan;
            if (cell.rowspan) td.rowSpan = cell.rowspan;
            if (cell.className) td.className = cell.className;
          }
          
          tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
      });
      
      table.appendChild(tbody);
    }
    
    return table;
  },
  
  /**
   * Create a scorecard entry form
   * @param {Object} options - Scorecard options
   * @returns {HTMLElement} - Scorecard form
   */
  createScorecardForm: function(options = {}) {
    const container = document.createElement('div');
    container.className = 'calculator';
    
    const form = this.createForm({
      id: 'scorecard-form',
      fields: [
        {
          id: 'course-select',
          type: 'select',
          label: 'Course:',
          options: Object.keys(BBB_CONFIG.courses).map(course => ({
            value: BBB_CONFIG.courses[course].shortName,
            text: course
          }))
        },
        {
          id: 'tee-select',
          type: 'select',
          label: 'Tee Colour:',
          options: Object.keys(BBB_CONFIG.teeColors).map(tee => ({
            value: tee,
            text: BBB_CONFIG.teeColors[tee]
          }))
        },
        // Add player selects and hole selection here
      ],
      buttons: [
        {
          text: 'Build Scorecard',
          id: 'build',
          className: 'btn'
        },
        {
          text: 'Reset',
          id: 'reset',
          className: 'btn'
        },
        {
          text: 'Save Scorecard',
          id: 'save',
          className: 'btn',
          disabled: true
        }
      ]
    });
    
    container.appendChild(form);
    
    return container;
  },
  
  /**
   * Create a handicap calculator form
   * @returns {HTMLElement} - Handicap form
   */
  createHandicapForm: function() {
    const container = document.createElement('div');
    container.className = 'calculator';
    
    const info = document.createElement('p');
    info.textContent = 'Enter up to 20 rounds. Minimum 3 to calculate.';
    container.appendChild(info);
    
    const roundsContainer = document.createElement('div');
    roundsContainer.id = 'rounds-container';
    container.appendChild(roundsContainer);
    
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';
    
    const addButton = this.createButton({
      text: 'Add Round',
      id: 'add-round',
      className: 'btn'
    });
    
    const calculateButton = this.createButton({
      text: 'Calculate Handicap',
      id: 'calculate',
      className: 'btn'
    });
    
    buttonGroup.appendChild(addButton);
    buttonGroup.appendChild(calculateButton);
    container.appendChild(buttonGroup);
    
    const result = document.createElement('div');
    result.className = 'result';
    result.id = 'handicap-result';
    container.appendChild(result);
    
    return container;
  },
  
  /**
   * Create a gallery view
   * @param {Array} images - Array of image objects
   * @returns {HTMLElement} - Gallery container
   */
  createGallery: function(images = []) {
    const container = document.createElement('div');
    container.className = 'gallery';
    
    images.forEach(image => {
      const img = document.createElement('img');
      img.src = image.src;
      img.alt = image.alt || '';
      img.className = 'gallery-img';
      img.dataset.id = image.id;
      
      container.appendChild(img);
    });
    
    return container;
  },
  
  /**
   * Create a lightbox for gallery images
   * @returns {HTMLElement} - Lightbox element
   */
  createLightbox: function() {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    
    const close = document.createElement('span');
    close.className = 'lightbox-close';
    close.innerHTML = '&times;';
    
    const img = document.createElement('img');
    img.className = 'lightbox-img';
    img.id = 'lightbox-img';
    img.alt = '';
    
    const caption = document.createElement('div');
    caption.id = 'lightbox-caption';
    caption.className = 'lightbox-caption';
    
    lightbox.appendChild(close);
    lightbox.appendChild(img);
    lightbox.appendChild(caption);
    
    return lightbox;
  }
};

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BBB_UI;
}
