'use client'
import Link from 'next/link'
import AuthModal from './AuthModal'
import { useContext } from 'react'
import { AuthenticationContext } from '../context/AuthContext'
import useAuth from '../../hooks/useAuth'

const NavBar = () => {
  const { data, loading } = useContext(AuthenticationContext)
  const { signout } = useAuth()
  return (
    <nav className='bg-white p-2 flex justify-between'>
      <Link href='/' className='font-bold text-gray-700 text-2xl'>
        OpenTable
      </Link>
      {/* loading varsa null olmalı yoksa sayfayı refresh ettiğimizde
      ve "token" browser da ise user login yapmadan login olmalı ve 
      "AuthModal lar" user bilgisi hemen gelmeden önce sergilenmesini önlemeliyiz
      */}
      {loading ? null : (
        <div>
          <div className='flex'>
            {data ? (
              <button
                className='bg-blue-400 text-white border p-1 px-4 rounded mr-3'
                onClick={signout}
              >
                Sign out
              </button>
            ) : (
              <>
                <AuthModal isSignin={true} />
                <AuthModal isSignin={false} />
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default NavBar
