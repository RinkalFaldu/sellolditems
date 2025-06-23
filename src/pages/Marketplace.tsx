import React, { useState, useMemo } from 'react';
import { Filter, Grid, List, SlidersHorizontal, TrendingUp, Star } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import ItemCard from '../components/ItemCard';
import FilterSidebar from '../components/FilterSidebar';

interface MarketplaceProps {
  onItemClick: (itemId: string) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ onItemClick }) => {
  const { items, searchQuery, selectedCategory, priceRange, setSelectedCategory } = useMarketplace();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');

  const filteredItems = useMemo(() => {
    let filtered = items.filter((item) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !item.title.toLowerCase().includes(query) &&
          !item.description.toLowerCase().includes(query) &&
          !item.category.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory && item.category !== selectedCategory) {
        return false;
      }

      // Price range filter
      if (item.price < priceRange[0] || item.price > priceRange[1]) {
        return false;
      }

      return item.isAvailable;
    });

    // Sort items
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        // For now, sort by newest as we don't have view counts
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filtered;
  }, [items, searchQuery, selectedCategory, priceRange, sortBy]);

  const categories = [
    { key: '', label: 'All Categories', count: items.length },
    { key: 'textbooks', label: 'Textbooks', count: items.filter(i => i.category === 'textbooks').length },
    { key: 'electronics', label: 'Electronics', count: items.filter(i => i.category === 'electronics').length },
    { key: 'furniture', label: 'Furniture', count: items.filter(i => i.category === 'furniture').length },
    { key: 'clothing', label: 'Clothing', count: items.filter(i => i.category === 'clothing').length },
    { key: 'sports', label: 'Sports', count: items.filter(i => i.category === 'sports').length },
    { key: 'misc', label: 'Miscellaneous', count: items.filter(i => i.category === 'misc').length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Category Filter Tabs - Below Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 py-4 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.key
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                {category.label}
                <span className="ml-2 text-xs opacity-75">({category.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Desktop Sidebar - Fixed position */}
          <div className="hidden lg:block flex-shrink-0 w-72">
            <div className="sticky top-24 h-[calc(100vh-8rem)]">
              <FilterSidebar isOpen={true} onClose={() => {}} />
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <div className="flex-1 lg:ml-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-purple-700 bg-clip-text text-transparent">
                    {searchQuery ? `Search Results` : 'Marketplace'}
                  </h1>
                  <p className="text-gray-600 mt-2 flex items-center space-x-2">
                    <span>{filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} available</span>
                    {searchQuery && (
                      <>
                        <span>•</span>
                        <span>for "{searchQuery}"</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="popular">Most Popular</option>
                    </select>
                    <SlidersHorizontal className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="hidden md:flex bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'grid'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'list'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-gray-700 hover:border-purple-300 hover:text-purple-700 transition-all duration-200 shadow-sm"
                  >
                    <Filter className="h-4 w-4" />
                    <span className="font-medium">Filters</span>
                  </button>
                </div>
              </div>

              {/* Featured/Trending Section */}
              {!searchQuery && (
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 mb-8 text-white">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">Trending This Week</h2>
                  </div>
                  <p className="text-purple-100 mb-4">
                    Popular items among UW students right now
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['MacBook Pro', 'Textbooks', 'Dorm Furniture', 'Winter Clothes'].map((trend) => (
                      <span key={trend} className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                        {trend}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Items Grid/List */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No items found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  {searchQuery
                    ? `No items match your search for "${searchQuery}". Try adjusting your filters or search terms.`
                    : 'No items match your current filters. Try adjusting your criteria.'}
                </p>
                <button
                  onClick={() => setShowFilters(true)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium shadow-lg hover:shadow-purple-200"
                >
                  Adjust Filters
                </button>
              </div>
            ) : (
              <div className={`${
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'
                  : 'space-y-6'
              }`}>
                {filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ItemCard
                      item={item}
                      onClick={() => onItemClick(item.id)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {filteredItems.length > 0 && (
              <div className="text-center mt-12">
                <button className="bg-white text-gray-700 border border-gray-200 px-8 py-3 rounded-xl hover:border-purple-300 hover:text-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md">
                  Load More Items
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar - Only shows on mobile */}
      <div className="lg:hidden">
        <FilterSidebar isOpen={showFilters} onClose={() => setShowFilters(false)} />
      </div>
    </div>
  );
};

export default Marketplace;