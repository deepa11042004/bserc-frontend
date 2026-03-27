import { Navigate } from 'react-router-dom'
import { getToken, getUser } from '../../utils/auth'

const ProtectedUserRoute = ({ children }) => {
  const token = getToken()
  const user = getUser()

  if (!token || !user || user.role !== 'user') {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedUserRoute
