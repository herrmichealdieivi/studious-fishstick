# Mentorium - React Native App

A beautiful educational app with Roman-inspired architecture, built with React Native and Expo Router.

## Features

- **Roman Hallway Navigation**: Swipe or tap to navigate between different houses of knowledge
- **Four Main Sections**:
  - **Forum**: Central gathering place for discussions
  - **Houses**: Roman-style portal navigation to different knowledge domains
  - **Trials**: Track your learning progress and achievements
  - **Seal**: Personal profile and statistics

## Screenshots

The app features a classical Roman aesthetic with:
- Marble-like textures and stonework
- Elegant typography with serif fonts
- Smooth animations and transitions
- Intuitive swipe gestures for navigation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (optional)
- Expo Go app on your mobile device (for easy testing)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Scan the QR code with Expo Go app on your phone, or press:
   - `i` for iOS simulator
   - `a` for Android emulator
   - `w` for web browser

## Project Structure

```
app/
├── _layout.js          # Root layout with navigation setup
├── index.js           # Main menu screen
├── forum.js           # Forum section
├── houses.js          # Roman hallway with portal navigation
├── trials.js          # Progress tracking
└── seal.js            # Profile and statistics
```

## Key Components

### Roman Hallway (houses.js)
- Horizontal swipe navigation between portals
- Physics-based animations with spring effects
- Touch gesture support (pan, swipe, tap)
- Responsive design for all screen sizes
- Four distinct knowledge houses:
  - **Euler**: Mathematical Foundations
  - **Mendel**: Natural Observation
  - **Curie**: Fundamental Forces
  - **Austen**: Human Understanding

### Navigation System
- Expo Router for seamless navigation
- Back button support on all screens
- Tab-based menu from the main screen
- Smooth transitions between views

## Customization

### Colors
The app uses a classical color palette:
- `#EDE4D6` - Canvas (background)
- `#10443E` - Deep Green (accents)
- `#32704E` - Soft Green (secondary)
- `#171717` - Ink (text)
- `#D9D1C2` - Stone (UI elements)

### Fonts
Uses system serif fonts for a classical appearance.

## Technical Details

- Built with React Native and Expo
- Uses Expo Router for navigation
- Implements gesture handling with react-native-gesture-handler
- Animated with React Native's Animated API
- Responsive design with Dimension API

## Contributing

Feel free to fork this project and customize it for your own educational platform!

## License

MIT License - feel free to use this code for your projects.