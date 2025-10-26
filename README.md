# Color Label App

A modern web application for managing paint colors, creating palettes, and designing printable labels. Search through colors from major paint brands, save your favorites to a library, organize them into palettes, and create beautiful labels for your paint samples.

## Features

### 🎨 Color Search
- Search paint colors from major brands (Benjamin Moore, Sherwin Williams, Behr, Valspar)
- Search by color name, brand, or code
- Visual color previews with hex codes
- One-click add to library

### 📚 Color Library
- Save your favorite colors for easy access
- Persistent storage using localStorage
- Bulk selection for batch operations
- Quick actions: remove, create palette, or create labels
- Export/import library as JSON
- Track paint inventory by sheen (flat, eggshell, satin, semi-gloss, gloss) and can size

### 🎯 Palette Management
- Organize colors into named palettes
- Visual palette preview
- Easy palette deletion
- Perfect for project organization
- Detailed palette view with individual color cards
- Export palettes as PDF
- Copy color list to clipboard

### 🔍 Browse Colors
- Browse entire color database organized by color families
- Filter by color categories (reds, blues, greens, yellows, etc.)
- Statistics showing total colors and library count
- Quick add to library from browse view

### 🏷️ Label Designer
- Create printable labels for paint samples
- Multiple layout options (Default, Minimal, Detailed)
- Advanced typography controls:
  - Font family selection (sans-serif, serif, monospace)
  - Font weight adjustment
  - Text alignment options
  - Individual size controls for each text element
  - Line height adjustment
- Customizable display options
- Auto-contrast text for readability
- Export labels as PNG images
- Batch label generation

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **React Router** - Client-side routing
- **colornerd** - Comprehensive paint color database
- **jsPDF** - PDF generation for palettes
- **html2canvas** - Label export functionality
- **date-fns** - Date formatting
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/andrewyoung918/color-label-app.git
cd color-label-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Searching for Colors

1. Navigate to the **Search** page
2. Type a color name, brand, or code in the search box
3. Browse the results
4. Click the **+** button to add colors to your library

### Managing Your Library

1. Go to the **Library** page to see saved colors
2. Click **Select** to enter selection mode
3. Choose multiple colors for batch actions
4. Create palettes or labels from selected colors

### Creating Palettes

1. Select colors from your library
2. Click **Create Palette**
3. Name your palette
4. View all palettes on the **Palettes** page

### Designing Labels

1. Navigate to the **Labels** page
2. Select colors from your library or use the **Select Colors** button
3. Choose a layout style (Default, Minimal, or Detailed)
4. Customize display options
5. Click **Export** to download labels as PNG

## Project Structure

```
color-label-app/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── stores/         # Zustand state stores
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

## Key Components

- **ColorCard** - Individual color display with actions
- **ColorGrid** - Grid layout for multiple colors
- **LabelPreview** - Label design preview component
- **SearchPage** - Color search interface
- **LibraryPage** - Saved colors management
- **PalettesPage** - Palette organization
- **LabelsPage** - Label designer interface

## State Management

The app uses Zustand for state management with three main stores:

- **useColorStore** - Manages color search and library
- **usePaletteStore** - Handles palette creation and management
- **useLabelStore** - Controls label configuration and export

## Local Storage

All data is stored locally in your browser:
- Color library
- Created palettes
- Label settings

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Tailwind CSS for styling
- ESLint for code quality

## Deployment

### GitHub Pages

This app is configured for easy deployment to GitHub Pages.

#### Option 1: Manual Deployment

1. Build and deploy to GitHub Pages:
```bash
npm run deploy
```

This will build the app and push it to the `gh-pages` branch.

#### Option 2: Automatic Deployment (Recommended)

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the main branch.

To set this up:

1. Go to your GitHub repository settings
2. Navigate to Settings → Pages
3. Under "Build and deployment", select "GitHub Actions" as the source
4. Push your code to the main branch
5. The app will be automatically built and deployed

Your app will be available at: `https://andrewyoung918.github.io/color-label-app/`

### Alternative Deployment Options

Since this is a static web app, you can also deploy to:

- **Netlify**: Drop the `dist` folder or connect your GitHub repo
- **Vercel**: Import your GitHub repo directly
- **Cloudflare Pages**: Connect your GitHub repo
- **AWS S3 + CloudFront**: Upload the `dist` folder to S3

Note: If deploying to a service other than GitHub Pages, update the `base` configuration in `vite.config.ts` to `/` instead of `/color-label-app/`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Cloud sync for libraries and palettes
- [ ] Color harmony suggestions
- [ ] QR codes on labels
- [ ] Import colors from images
- [ ] Share palettes via URL
- [ ] PDF export for labels
- [ ] Custom brand additions
- [ ] Print queue management

## License

MIT

## Author

Andrew Young (@andrewyoung918)

## Acknowledgments

- Paint color data from various paint manufacturers
- Icons by Lucide
- Built with React and Vite