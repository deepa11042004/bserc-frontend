import { Link } from 'react-router-dom'

const Logo = () => (
  <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-slate-900 hover:text-teal-700">
    <span className="rounded-lg bg-teal-600 px-2 py-1 text-white">B</span>
    <span>Bserc-LMS</span>
  </Link>
)

export default Logo
