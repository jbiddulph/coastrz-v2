export const colors = {
  light: {
    primary: '#43C6C3',    // Turquoise - Main brand color, primary actions
    secondary: '#804D37',  // Rich Brown - Text and secondary elements
    neutral: '#F5F4ED',    // Off White - Backgrounds and neutral elements
    accent: '#F2C749',     // Golden Yellow - Highlights and edit actions
    danger: '#F75A33',     // Coral Red - Warnings and delete actions
    
    // Variations with opacity
    'primary-light': 'rgba(67, 198, 195, 0.1)',  // For hover states and subtle backgrounds
    'secondary-light': 'rgba(128, 77, 55, 0.8)',  // For secondary text
    'secondary-border': 'rgba(128, 77, 55, 0.1)', // For dividers and borders
    
    // Text colors
    'text-primary': '#804D37',
    'text-light': '#F5F4ED',
    'text-muted': 'rgba(128, 77, 55, 0.8)',
    
    // States
    'hover-primary': '#3BB5B2',  // Darker version of primary for hover
    'hover-accent': 'rgba(242, 199, 73, 0.8)',
    'hover-danger': 'rgba(247, 90, 51, 0.8)',

    // Backgrounds
    'bg-main': '#FFFFFF',
    'bg-secondary': '#F5F4ED',
    'bg-hover': 'rgba(67, 198, 195, 0.05)'
  },
  dark: {
    primary: '#43C6C3',    // Keep the brand color consistent
    secondary: '#E6D5CC',  // Lighter version of brown for better contrast
    neutral: '#2D2420',    // Dark brown background
    accent: '#F2C749',     // Keep accent color
    danger: '#F75A33',     // Keep danger color
    
    // Variations with opacity
    'primary-light': 'rgba(67, 198, 195, 0.15)',  // Brighter for dark mode
    'secondary-light': 'rgba(230, 213, 204, 0.8)', // Lighter text
    'secondary-border': 'rgba(230, 213, 204, 0.1)', // Lighter borders
    
    // Text colors
    'text-primary': '#E6D5CC',
    'text-light': '#2D2420',
    'text-muted': 'rgba(230, 213, 204, 0.8)',
    
    // States
    'hover-primary': '#4DD8D5',  // Brighter version for dark mode
    'hover-accent': 'rgba(242, 199, 73, 0.9)',
    'hover-danger': 'rgba(247, 90, 51, 0.9)',

    // Backgrounds
    'bg-main': '#1A1614',      // Very dark brown
    'bg-secondary': '#2D2420', // Dark brown
    'bg-hover': 'rgba(67, 198, 195, 0.1)'
  }
}; 