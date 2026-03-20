import { FiSearch } from 'react-icons/fi'

const SearchBar = () => (
  <div className="relative flex flex-1 min-w-0">
    <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
    <input
      type="text"
      placeholder="Search for anything"
      className="w-full rounded-full border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
    />
  </div>
)

export default SearchBar
