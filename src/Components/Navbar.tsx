import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserCircle } from 'phosphor-react'

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className='w-full border-b-2 border-gray-300 bg-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link to="/" className='flex-shrink-0'>
            <div className='bg-black text-white px-4 py-2 rounded font-bold text-lg'>
              LOGO
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:block'>
            <ul className='flex space-x-8 items-center'>
              <li className='cursor-pointer hover:text-gray-600 transition-colors font-medium'>
                <Link to="/">Home</Link>
              </li>
              <li className='cursor-pointer hover:text-gray-600 transition-colors font-medium'>
                <Link to="/create-room">Create Room</Link>
              </li>
              <li className='cursor-pointer hover:text-gray-600 transition-colors font-medium'>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li className='cursor-pointer transition-colors'>
                <Link 
                  to="/profile" 
                  className='flex items-center hover:text-gray-600 transition-colors'
                >
                  <UserCircle size={32} weight="duotone" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <button
              onClick={toggleMenu}
              className='text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900'
              aria-label='Toggle menu'
            >
              <svg
                className='h-6 w-6'
                fill='none'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                {isMenuOpen ? (
                  <path d='M6 18L18 6M6 6l12 12' />
                ) : (
                  <path d='M4 6h16M4 12h16M4 18h16' />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <ul className='px-4 pt-2 pb-4 space-y-2 bg-gray-100'>
          <li className='cursor-pointer hover:bg-gray-200 px-3 py-2 rounded transition-colors font-medium'>
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          </li>
          <li className='cursor-pointer hover:bg-gray-200 px-3 py-2 rounded transition-colors font-medium'>
            <Link to="/create-room" onClick={() => setIsMenuOpen(false)}>Create Room</Link>
          </li>
          <li className='cursor-pointer hover:bg-gray-200 px-3 py-2 rounded transition-colors font-medium'>
            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
          </li>
          <li className='cursor-pointer hover:bg-gray-200 rounded transition-colors'>
            <Link 
              to="/profile" 
              onClick={() => setIsMenuOpen(false)}
              className='flex items-center gap-2 px-3 py-2'
            >
              <UserCircle size={24} weight="duotone" />
              <span className='font-medium'>Profile</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}