import { useState, useEffect, useCallback } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useColorStore } from '@/stores/useColorStore'
import ColorGrid from '@/components/ColorGrid'

export default function SearchPage() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const {
    searchResults,
    library,
    loading,
    searchColors,
    addToLibrary,
    loadLibraryFromStorage
  } = useColorStore()

  // Load library on mount
  useEffect(() => {
    loadLibraryFromStorage()
  }, [loadLibraryFromStorage])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  // Perform search when debounced value changes
  useEffect(() => {
    if (debouncedSearch.trim()) {
      searchColors(debouncedSearch)
    }
  }, [debouncedSearch, searchColors])

  const handleAddToLibrary = useCallback((color: any) => {
    addToLibrary(color)
  }, [addToLibrary])

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Search Paint Colors
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Find colors from major paint brands and add them to your library
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base sm:text-lg"
            placeholder="Search by color name, brand, or code..."
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Search Results
          </h2>
          {loading && (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span className="text-xs sm:text-sm">Searching...</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {debouncedSearch.trim() ? (
              <ColorGrid
                colors={searchResults}
                libraryColors={library}
                onAddToLibrary={handleAddToLibrary}
                emptyMessage="No colors found. Try a different search term."
              />
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                Enter a search term to find colors
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}