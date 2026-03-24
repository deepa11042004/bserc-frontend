import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const Logo = ({ to = '/' }) => (
  <Link to={to} className="inline-flex items-center gap-2 text-xl font-bold text-white hover:text-[#22D3EE]">
    <img src={logo} alt="Bserc Logo" className="h-10 w-10 object-contain" />
    <span>BSERC</span>
  </Link>
)

export default Logo
