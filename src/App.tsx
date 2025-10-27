import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, Palette } from 'lucide-react'
import { useThemeStore } from './stores/useThemeStore'
import SearchPage from './pages/SearchPage'
import LibraryPage from './pages/LibraryPage'
import PalettesPage from './pages/PalettesPage'
import PaletteDetailsPage from './pages/PaletteDetailsPage'
import LabelsPage from './pages/LabelsPage'
import BrowsePage from './pages/BrowsePage'

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useThemeStore()

  useEffect(() => {
    console.log('Color Label App initialized')
  }, [])

  const navLinks = [
    { to: '/search', label: 'Search' },
    { to: '/browse', label: 'Browse' },
    { to: '/library', label: 'Library' },
    { to: '/palettes', label: 'Palettes' },
    { to: '/labels', label: 'Labels' },
  ]

  return (
    <HashRouter>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-sky-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm border-b border-primary-200/50 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-rose-400 dark:from-primary-500 dark:to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-rose-600 dark:from-primary-400 dark:to-rose-400 bg-clip-text text-transparent">
                    Shades of Hue
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                    Paint Organization Made Beautiful
                  </p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-lg shadow-primary-500/50'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="ml-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </button>
              </nav>

              {/* Mobile menu button */}
              <div className="flex md:hidden items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-800"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-800"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 space-y-1 animate-slide-in">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-lg'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/search" replace />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/palettes" element={<PalettesPage />} />
            <Route path="/palettes/:id" element={<PaletteDetailsPage />} />
            <Route path="/labels" element={<LabelsPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-primary-200/50 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Shades of Hue &copy; 2024 • Organize your paint colors beautifully
            </p>
          </div>
        </footer>
      </div>
    </HashRouter>
  )
}

export default App
