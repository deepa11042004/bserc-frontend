import Logo from './Logo'
import ExploreMenu from './ExploreMenu'
import SearchBar from './SearchBar'
import AuthButtons from './AuthButtons'

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Logo />
        <ExploreMenu />
        <SearchBar />
        <AuthButtons />
      </div>
    </header>
  )
}

export default Navbar
