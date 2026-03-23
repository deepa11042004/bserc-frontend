import { FiSearch } from 'react-icons/fi'

const SearchBar = () => (
  <div className="relative flex min-w-0 flex-1">
    <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      type="text"
      placeholder="Search for anything"
      className="w-full rounded-full border border-indigo-500/30 bg-[#111827] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/50"
    />
  </div>
)

export default SearchBar
