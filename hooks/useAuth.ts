// AuthModel tsx de input lardan alınan login ve register bilgisi buradan server ımıza gönderilecek

import axios from 'axios'

import { useContext } from 'react'
import { AuthenticationContext } from '../app/context/AuthContext'
import { getCookie,deleteCookie  } from 'cookies-next'

const useAuth = () => {
  const { setAuthState } = useContext(AuthenticationContext)

  const signin = async (
    {
      email, // input data
      password, // input data
    }: {
      email: string
      password: string
    },
    handleClose: () => void // login olduktan sonra AuthModal kapatmak için kullanıcaz
  ) => {
    // console.log(email,password);
    // LOADING
    setAuthState({
      data: null,
      error: null,
      loading: true,
    })
    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/signin',
        {
          email,
          password,
        }
      )
      // DATA
      // console.log(response.data);

      setAuthState({
        data: response.data,
        error: null,
        loading: false,
      })
      handleClose()
    } catch (error: any) {
      // ERROR
      setAuthState({
        data: null,
        error: error.response.data.errorMessage,
        loading: false,
      })
    }
  }
  const signup = async ({
    email,
    password,
    firstName,
    lastName,
    city,
    phone,
  }: {
    email: string
    password: string
    firstName: string
    lastName: string
    city: string
    phone: string
  }, handleClose: () => void ) => {
    setAuthState({
      data: null,
      error: null,
      loading: true,
    })
     
    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/signup',
        {
          email,
          password,
          firstName,
          lastName,
          city,
          phone,
        }
      )
      setAuthState({
        data: response.data, // sadece user bilgileri var (token server tarafından browser a set edildi)
        error: null,
        loading: false,
      })
      handleClose()
    } catch (error: any) {
      setAuthState({
        data: null,
        error: error.response.data.errorMessage,
        loading: false,
      })
      
    }
  }

  const signout = () => {
   deleteCookie("jwt")

    setAuthState({
      data: null,
      error: null,
      loading: false,
    })
  }




  return {
    signin,
    signup,
    signout,
  }
}

export default useAuth
