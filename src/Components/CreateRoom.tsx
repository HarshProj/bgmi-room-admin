import React, { useEffect, useState } from 'react'

interface FormData {
  roomName: string
  password: string
  capacity: number
  roomSlots: number
}

interface FormErrors {
  roomName?: string
  password?: string
  capacity?: string
  roomSlots?: string
}

export const CreateRoom = () => {
  const [formData, setFormData] = useState<FormData>({
    roomName: '',
    password: '',
    capacity: 100,
    roomSlots: 25
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // fetchRooms()
      if (typeof window !== 'undefined' && localStorage.getItem('token') === null) {
        window.location.href = '/login'
      }
      const token = localStorage.getItem('token')
      if (!token) {
        // Give user feedback before redirecting
        setTimeout(() => {
          window.location.href = '/login'
        }, 1000)
      }
      setIsAuthenticated(!!token)
  }, [])
  if (isAuthenticated === null) {
    return <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading...</p>
        </div>
      </div>
  }
  
  if (!isAuthenticated) {
    return <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
      <p className="text-slate-600 text-lg">Redirecting to login...</p>
    </div>
  </div>
  }
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Room Name validation
    if (!formData.roomName.trim()) {
      newErrors.roomName = 'Room name is required'
    } else if (formData.roomName.length < 3) {
      newErrors.roomName = 'Room name must be at least 3 characters'
    } else if (formData.roomName.length > 50) {
      newErrors.roomName = 'Room name must be less than 50 characters'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters'
    }

    // Capacity validation
    if (formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1'
    } else if (formData.capacity > 1000) {
      newErrors.capacity = 'Capacity cannot exceed 1000'
    }

    // Room Slots validation
    if (formData.roomSlots < 1) {
      newErrors.roomSlots = 'Room slots must be at least 1'
    } else if (formData.roomSlots > 100) {
      newErrors.roomSlots = 'Room slots cannot exceed 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'roomSlots' ? Number(value) : value
    }))

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setApiError(null)
    setSuccess(false)

    try {
      const response = await fetch('http://localhost:3000/api/room/create', { // Replace with your actual API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          occupied: 0,
          freeSlots: formData.roomSlots,
          occupiedSlots: 0,
          isEmpty: true
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create room')
      }

      const data = await response.json()
      console.log('Room created:', data)
      
      setSuccess(true)
      
      // Reset form after successful creation
      setTimeout(() => {
        setFormData({
          roomName: '',
          password: '',
          capacity: 100,
          roomSlots: 25
        })
        setSuccess(false)
      }, 3000)

    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      roomName: '',
      password: '',
      capacity: 100,
      roomSlots: 25
    })
    setErrors({})
    setApiError(null)
    setSuccess(false)
  }

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 mb-6">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Create New Room
          </h1>
          <p className="text-slate-600">Set up a new game room for players</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3 animate-pulse">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-green-800 font-semibold">Room created successfully!</p>
              <p className="text-green-700 text-sm">The new room is now available for players.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-800 font-semibold">Error creating room</p>
              <p className="text-red-700 text-sm">{apiError}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-6">
              
              {/* Room Name */}
              <div>
                <label htmlFor="roomName" className="block text-sm font-semibold text-slate-700 mb-2">
                  Room Name *
                </label>
                <input
                  type="text"
                  id="roomName"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleInputChange}
                  placeholder="Enter unique room name"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.roomName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {errors.roomName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.roomName}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">Must be unique and 3-50 characters long</p>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Room Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter room password"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">Minimum 4 characters required</p>
              </div>

              {/* Capacity and Room Slots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Capacity */}
                <div>
                  <label htmlFor="capacity" className="block text-sm font-semibold text-slate-700 mb-2">
                    Player Capacity *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.capacity
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  {errors.capacity && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.capacity}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">Maximum players allowed (1-100)</p>
                </div>

                {/* Room Slots */}
                <div>
                  <label htmlFor="roomSlots" className="block text-sm font-semibold text-slate-700 mb-2">
                    Room Slots *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="roomSlots"
                      name="roomSlots"
                      value={formData.roomSlots}
                      onChange={handleInputChange}
                      min="1"
                      max="25"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.roomSlots
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>
                  {errors.roomSlots && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.roomSlots}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">Available team/squad slots (1-100)</p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Default Values</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Initial occupied players: 0</li>
                      <li>• Free slots will equal total room slots</li>
                      <li>• Occupied slots: 0</li>
                      <li>• Room status: Empty</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            {/* Form Actions */}
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Room...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Room
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Tips */}
        <div className="mt-6 bg-white rounded-lg shadow-md border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Quick Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="flex gap-2">
              <span className="text-blue-600">•</span>
              <p>Use descriptive room names for easy identification</p>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600">•</span>
              <p>Set appropriate capacity based on game mode</p>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600">•</span>
              <p>Room slots typically represent team/squad positions</p>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600">•</span>
              <p>Password protects your room from unauthorized access</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}