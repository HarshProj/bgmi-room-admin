import { useState, useEffect } from 'react'

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

interface EditFormData {
  roomName: string
  capacity: number
  roomSlots: number
  newPassword: string
  confirmPassword: string
}

export const Home = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'full'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    roomName: '',
    capacity: 0,
    roomSlots: 0,
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const backend_url = import.meta.env.VITE_API_URL||"http://localhost:3000"

  useEffect(() => {
    fetchRooms()
    if (typeof window !== 'undefined' && localStorage.getItem('token') === null) {
      window.location.href = '/login'
    }
    const token = localStorage.getItem('token')
    if (!token) {
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
    }
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${backend_url}/api/room/all-rooms`)
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

  const handleDelete = async (roomId: string, roomName: string) => {
    if (!confirm(`Are you sure you want to delete "${roomName}"?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${backend_url}/api/room/delete-slot/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to delete room')

      setRooms(rooms.filter(room => room._id !== roomId))
      alert('Room deleted successfully')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete room')
    }
  }

  const handleEdit = (room: Room) => {
    setEditingRoomId(room._id)
    setEditFormData({
      roomName: room.roomName,
      capacity: room.capacity,
      roomSlots: room.roomSlots,
      newPassword: '',
      confirmPassword: ''
    })
    setPasswordError(null)
    setShowEditModal(true)
  }

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    // Validate password if user is trying to change it
    if (editFormData.newPassword || editFormData.confirmPassword) {
      if (editFormData.newPassword !== editFormData.confirmPassword) {
        setPasswordError('Passwords do not match')
        return
      }
      if (editFormData.newPassword.length < 4) {
        setPasswordError('Password must be at least 4 characters long')
        return
      }
    }

    try {
      const token = localStorage.getItem('token')
      
      // Prepare update payload
      const updatePayload: any = {
        roomName: editFormData.roomName,
        capacity: editFormData.capacity,
        roomSlots: editFormData.roomSlots
      }

      // Only include password if user entered a new one
      if (editFormData.newPassword) {
        updatePayload.password = editFormData.newPassword
      }

      const response = await fetch(`${backend_url}/api/room/update-slot/${editingRoomId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      })

      if (!response.ok) throw new Error('Failed to update room')

      const updatedRoom = await response.json()
      setRooms(rooms.map(room => room._id === updatedRoom._id ? updatedRoom : room))
      setShowEditModal(false)
      setEditingRoomId(null)
      setEditFormData({
        roomName: '',
        capacity: 0,
        roomSlots: 0,
        newPassword: '',
        confirmPassword: ''
      })
      alert('Room updated successfully')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update room')
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
                    <button 
                      onClick={() => handleEdit(room)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(room._id, room.roomName)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-800">Edit Room</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingRoomId(null)
                  setPasswordError(null)
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Room Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.roomName}
                  onChange={(e) => setEditFormData({ ...editFormData, roomName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={editFormData.capacity}
                  onChange={(e) => setEditFormData({ ...editFormData, capacity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Room Slots <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={editFormData.roomSlots}
                  onChange={(e) => setEditFormData({ ...editFormData, roomSlots: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="25"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Change Password (Optional)
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Leave blank to keep the current password
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={editFormData.newPassword}
                      onChange={(e) => {
                        setEditFormData({ ...editFormData, newPassword: e.target.value })
                        setPasswordError(null)
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new password (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={editFormData.confirmPassword}
                      onChange={(e) => {
                        setEditFormData({ ...editFormData, confirmPassword: e.target.value })
                        setPasswordError(null)
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {passwordError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-800">{passwordError}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingRoomId(null)
                    setPasswordError(null)
                  }}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}