import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { colors } from '@/utils/colors';

interface SearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function Search({ searchQuery, onSearchChange, placeholder = 'Search...', className = '' }: SearchProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 pl-10 pr-10 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      {searchQuery && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          aria-label="Clear search"
        >
          <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
        </button>
      )}
    </div>
  );
} 