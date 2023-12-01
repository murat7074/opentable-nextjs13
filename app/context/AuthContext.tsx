'use client'
import axios from 'axios'
import { getCookie } from 'cookies-next'
import React, { createContext, useEffect, useState } from 'react'

// layout.tsx de sarmalayacağız
// sadece "client" componentlerden buradaki bilgilere ulaşabiliriz

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  city: string
  phone: string
}

interface State {
  loading: boolean
  data: User | null
  error: string | null
}

interface AuthState extends State {
  setAuthState: React.Dispatch<React.SetStateAction<State>>
}

export const AuthenticationContext = createContext<AuthState>({
  loading: false, 
  data: null,
  error: null,
  setAuthState: () => {},
})

const AuthContext = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<State>({
    loading: true, // başlangıçta false yaptık çünkü refresh yaptığımızda signin ve signout butonları gözükmesin
    data: null,
    error: null,
  })

  // User sitemizden çıktığında veya sayfayı refresh yaptığında
  // Browser ında "jwt" token ı duruyorsa ve süresi dolmadıysa tekrar login olmadan girecek "auth/me"
  const fetchUser = async () => {
    setAuthState({
      data: null,
      error: null,
      loading: true,
    })

    try {
      const jwt = getCookie('jwt')
      if (!jwt) {
        return setAuthState({
          data: null,
          error: null,
          loading: false,
        })
      }
      const response = await axios.get('http://localhost:3000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })

      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`

      setAuthState({
        data: response.data,
        error: null,
        loading: false,
      })
    } catch (error: any) {
      setAuthState({
        data: null,
        error: error.response.data.errorMessage,
        loading: false,
      })
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])


  

  return (
    <AuthenticationContext.Provider value={{ ...authState, setAuthState }}>
      {children}
    </AuthenticationContext.Provider>
  )
}

export default AuthContext
