import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Store, LogOut } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [todayLunchbox, setTodayLunchbox] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user from localStorage
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      navigate('/')
      return
    }
    setUser(JSON.parse(savedUser))
    fetchTodayLunchbox()
  }, [navigate])

  const fetchTodayLunchbox = async () => {
    try {
      // Get from localStorage for now
      const lunchboxData = localStorage.getItem('todayLunchbox')
      if (lunchboxData) {
        const data = JSON.parse(lunchboxData)
        const today = new Date().toISOString().split('T')[0]
        if (data.date === today) {
          setTodayLunchbox(data)
        }
      }
    } catch (error) {
      console.error('Error fetching lunchbox:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b-4 border-pink-300 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl">
                {user?.name?.[0] || '👤'}
              </span>
            </div>
            <div>
              <h1 className="font-black text-xl">{user?.name}</h1>
              <p className="text-sm text-gray-600 font-bold">כיתה {user?.grade}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Today's Lunchbox Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border-4 border-green-300">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
            🍱 קופסת האוכל שלי היום
          </h2>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">טוען...</div>
          ) : todayLunchbox ? (
            <div>
              {todayLunchbox.image_url && (
                <img
                  src={todayLunchbox.image_url}
                  alt="Lunchbox"
                  className="w-full h-48 object-cover rounded-2xl mb-4"
                />
              )}
              <div className="flex flex-wrap gap-2">
                {todayLunchbox.items?.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-green-100 to-blue-100 px-4 py-3 rounded-full flex items-center gap-2 border-2 border-green-300"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="font-bold text-lg">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-8xl mb-4">📸</div>
              <p className="text-gray-600 mb-4 text-lg font-bold">עדיין לא סרקת את קופסת האוכל היום</p>
              <button
                onClick={() => navigate('/scan')}
                className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-2xl font-black text-xl hover:shadow-xl transition-shadow inline-flex items-center gap-3"
              >
                <Camera className="w-6 h-6" />
                סרקו עכשיו! 🚀
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/scan')}
            className="bg-gradient-to-br from-green-400 to-emerald-500 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <Camera className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-black text-xl mb-1">סרוק קופסת אוכל</h3>
            <p className="text-sm opacity-90">צלמו והזינו פריטים</p>
          </button>

          <button
            onClick={() => navigate('/marketplace')}
            className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <Store className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-black text-xl mb-1">השוק 🛒</h3>
            <p className="text-sm opacity-90">ראו הצעות וצרו חילופים</p>
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-pink-300 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-around">
          <button className="flex flex-col items-center gap-1 text-green-500">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs font-black">בית</span>
          </button>
          <button
            onClick={() => navigate('/marketplace')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-orange-500 transition-colors"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-orange-100">
              <Store className="w-6 h-6" />
            </div>
            <span className="text-xs font-black">השוק</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
