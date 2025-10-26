import { useEffect } from 'react'
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import SearchPage from './pages/SearchPage'
import LibraryPage from './pages/LibraryPage'
import PalettesPage from './pages/PalettesPage'
import PaletteDetailsPage from './pages/PaletteDetailsPage'
import LabelsPage from './pages/LabelsPage'
import BrowsePage from './pages/BrowsePage'

function App() {
  useEffect(() => {
    // Initialize app
    console.log('Color Label App initialized')
  }, [])

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Color Label App
                </h1>
              </div>
              <nav className="flex space-x-4">
                <NavLink
                  to="/search"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-gray-900'
                    }`
                  }
                >
                  Search
                </NavLink>
                <NavLink
                  to="/browse"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-gray-900'
                    }`
                  }
                >
                  Browse
                </NavLink>
                <NavLink
                  to="/library"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-gray-900'
                    }`
                  }
                >
                  Library
                </NavLink>
                <NavLink
                  to="/palettes"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-gray-900'
                    }`
                  }
                >
                  Palettes
                </NavLink>
                <NavLink
                  to="/labels"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-gray-900'
                    }`
                  }
                >
                  Labels
                </NavLink>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
    </HashRouter>
  )
}

export default App