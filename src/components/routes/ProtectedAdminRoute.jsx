import { Navigate } from 'react-router-dom'
import { getToken, getUser } from '../../utils/auth'

const defaultAllowed = ['admin', 'instructor', 'super_admin']

const ProtectedAdminRoute = ({ children, allowedRoles = defaultAllowed }) => {
  const token = getToken()
  const user = getUser()

  if (!token || !user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedAdminRoute
