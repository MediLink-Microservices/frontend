import { createContext, useContext } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const login = async (credentials) => {
    console.log('Login:', credentials)
    return { success: true }
  }

  const register = async (userData) => {
    console.log('Register:', userData)
    return { success: true }
  }

  const logout = () => {
    console.log('Logout')
  }

  const updateUser = (userData) => {
    console.log('Update user:', userData)
  }

  const value = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    login,
    register,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
