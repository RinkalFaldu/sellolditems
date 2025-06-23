// src/components/FilterSidebar.tsx
import { Filter, X, Sliders, DollarSign, Tag } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { key: '', label: 'All Categories', icon: '🏪' },
  { key: 'textbooks', label: 'Textbooks', icon: '📚' },
  { key: 'electronics', label: 'Electronics', icon: '💻' },
  { key: 'furniture', label: 'Furniture', icon: '🪑' },
  { key: 'clothing', label: 'Clothing', icon: '👕' },
  { key: 'sports', label: 'Sports & Recreation', icon: '⚽' },
  { key: 'misc', label: 'Miscellaneous', icon: '📦' },
];

const conditions = [
  { key: 'new', label: 'New', color: 'bg-emerald-100 text-emerald-800' },
  { key: 'like-new', label: 'Like New', color: 'bg-blue-100 text-blue-800' },
  { key: 'good', label: 'Good', color: 'bg-amber-100 text-amber-800' },
  { key: 'fair', label: 'Fair', color: 'bg-orange-100 text-orange-800' },
  { key: 'poor', label: 'Poor', color: 'bg-red-100 text-red-800' },
];

const FilterSidebar: React.FC<FilterSidebarProps> = ({ isOpen, onClose }) => {
  const { selectedCategory, setSelectedCategory, priceRange, setPriceRange } = useMarketplace();

  const handlePriceChange = (index: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const newRange: [number, number] = [...priceRange];
    newRange[index] = numValue;
    setPriceRange(newRange);
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200 
          transform transition-all duration-300 ease-out z-50 overflow-y-auto shadow-2xl rounded-r-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:block lg:static lg:transform-none lg:w-full lg:h-full lg:bg-white/95 lg:backdrop-blur-xl 
          lg:border-r lg:border-gray-200 lg:overflow-y-auto lg:shadow-none lg:rounded-none
        `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                <Filter className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <p className="text-sm text-gray-500">Refine your search</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="h-4 w-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Category</h3>
            </div>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center space-x-3 ${
                    selectedCategory === category.key
                      ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 font-semibold border-2 border-purple-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 border-2 border-transparent'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Price Range</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Min Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange(0, e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Max Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange(1, e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>
              <div className="px-2">
                <div className="h-2 bg-gray-200 rounded-full relative">
                  <div 
                    className="h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full absolute"
                    style={{
                      left: `${(priceRange[0] / 1000) * 100}%`,
                      width: `${((priceRange[1] - priceRange[0]) / 1000) * 100}%`
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$0</span>
                  <span>$1000+</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Filters</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Under $25', range: [0, 25] as [number, number] },
                { label: '$25 - $100', range: [25, 100] },
                { label: '$100 - $500', range: [100, 500] },
                { label: 'Over $500', range: [500, 10000] },
              ].map((filter) => (
                <button
                  key={filter.label}
                  onClick={() => setPriceRange(filter.range)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200 border-2 border-gray-200 hover:border-purple-200"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Sliders className="h-4 w-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Condition</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {conditions.map((condition) => (
                <button
                  key={condition.key}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all duration-200 ${condition.color} border-current hover:scale-105`}
                >
                  {condition.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setSelectedCategory('');
                setPriceRange([0, 1000]);
              }}
              className="w-full bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 py-3 px-4 rounded-xl hover:from-gray-200 hover:to-gray-100 transition-all duration-200 font-semibold border-2 border-gray-200 hover:border-gray-300"
            >
              Clear All Filters
            </button>

            <button
              onClick={onClose}
              className="w-full lg:hidden bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-semibold shadow-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
