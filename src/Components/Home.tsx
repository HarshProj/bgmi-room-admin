import  { useState, useEffect } from 'react'

interface Room {
  _id: string
  roomName: string
  password: string
  capacity: number
  occupied: number
  roomSlots: number
  freeSlots: number
  occupiedSlots: number
  isEmpty: boolean
  createdAt: string
  updatedAt: string
}

export const Home = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'full'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  // const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const backend_url=import.meta.env.VITE_API_URL;
  useEffect(() => {
    fetchRooms()
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
      // setIsAuthenticated(!!token)
  }, [])
  // if (isAuthenticated === null) {
  //   return <div>Loading...</div>
  // }
  
  // if (!isAuthenticated) {
  //   return <div>Redirecting to login...</div>
  // }
  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${backend_url}/api/room/all-rooms`) // Replace with your actual API endpoint
      if (!response.ok) throw new Error('Failed to fetch rooms')
      const data = await response.json()
      setRooms(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = 
      filterStatus === 'all' ? true :
      filterStatus === 'available' ? room.freeSlots > 0 :
      room.freeSlots === 0
    return matchesSearch && matchesFilter
  })

  const stats = {
    totalRooms: rooms.length,
    availableRooms: rooms.filter(r => r.freeSlots > 0).length,
    fullRooms: rooms.filter(r => r.freeSlots === 0).length,
    totalPlayers: rooms.reduce((sum, r) => sum + r.occupied, 0),
    totalCapacity: rooms.reduce((sum, r) => sum + r.capacity, 0)
  }

  if (loading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            BGMI Admin Panel
          </h1>
          <p className="text-slate-600">Monitor and manage all game rooms</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500">
            <div className="text-sm font-medium text-slate-600 mb-1">Total Rooms</div>
            <div className="text-3xl font-bold text-slate-800">{stats.totalRooms}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-green-500">
            <div className="text-sm font-medium text-slate-600 mb-1">Available</div>
            <div className="text-3xl font-bold text-green-600">{stats.availableRooms}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-red-500">
            <div className="text-sm font-medium text-slate-600 mb-1">Full Rooms</div>
            <div className="text-3xl font-bold text-red-600">{stats.fullRooms}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-purple-500">
            <div className="text-sm font-medium text-slate-600 mb-1">Total Players</div>
            <div className="text-3xl font-bold text-purple-600">{stats.totalPlayers}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-orange-500">
            <div className="text-sm font-medium text-slate-600 mb-1">Capacity</div>
            <div className="text-3xl font-bold text-orange-600">{stats.totalCapacity}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Rooms
              </button>
              <button
                onClick={() => setFilterStatus('available')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'available'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setFilterStatus('full')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'full'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Full
              </button>
            </div>
            
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            
            <button
              onClick={fetchRooms}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Rooms Grid */}
        {filteredRooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center border border-slate-200">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No rooms found</h3>
            <p className="text-slate-500">
              {searchQuery ? 'Try adjusting your search or filters' : 'No rooms available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div
                key={room._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-slate-200 overflow-hidden"
              >
                <div className={`h-2 ${room.freeSlots === 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-1">
                        {room.roomName}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          room.freeSlots === 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {room.freeSlots === 0 ? 'Full' : 'Available'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 font-medium">Players:</span>
                      <span className="text-slate-800 font-semibold">
                        {room.occupied} / {room.capacity}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          room.occupied / room.capacity >= 0.8
                            ? 'bg-red-500'
                            : room.occupied / room.capacity >= 0.5
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Room Slots</p>
                        <p className="text-sm font-semibold text-slate-800">{room.roomSlots}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Free Slots</p>
                        <p className="text-sm font-semibold text-green-600">{room.freeSlots}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Occupied Slots</p>
                        <p className="text-sm font-semibold text-blue-600">{room.occupiedSlots}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Status</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {room.isEmpty ? 'Empty' : 'Active'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500">
                        Created: {new Date(room.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}