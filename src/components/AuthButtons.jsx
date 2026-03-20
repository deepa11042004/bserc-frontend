import { Link } from 'react-router-dom'

const AuthButtons = () => (
  <div className="inline-flex items-center gap-2">
    <Link
      to="/dashboard"
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
    >
      Login
    </Link>
    <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
      Signup
    </button>
  </div>
)

export default AuthButtons
