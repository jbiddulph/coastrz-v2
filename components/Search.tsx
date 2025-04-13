import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { colors } from '@/utils/colors';

interface SearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export default function Search({ searchQuery, onSearchChange, placeholder = 'Search...' }: SearchProps) {
  return (
    <div className="relative">
      <div className={`flex items-center bg-[${colors.neutral}] rounded-lg px-3 py-2 w-64`}>
        <MagnifyingGlassIcon className={`h-5 w-5 text-[${colors.secondary}]`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className={`ml-2 w-full bg-transparent border-none focus:outline-none text-[${colors.secondary}] placeholder-[${colors['secondary-light']}]`}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className={`p-1 rounded-full hover:bg-[${colors['primary-light']}] text-[${colors.secondary}]`}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
} 