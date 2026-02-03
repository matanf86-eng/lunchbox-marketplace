import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Apple, Sparkles } from 'lucide-react'

export default function Welcome() {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('')
  const navigate = useNavigate()

  const grades = ['א', 'ב', 'ג', 'ד', 'ה', 'ו']

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !grade) return

    // Save to localStorage
    localStorage.setItem('user', JSON.stringify({ name, grade, id: Date.now() }))
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8 animate-bounce">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-2xl mb-4">
            <Apple className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-5xl font-black text-white drop-shadow-lg mb-2">
            קופסת האוכל שלי
          </h1>
          <p className="text-xl text-white/90 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            מחליפים וגם מתכבדים!
            <Sparkles className="w-5 h-5" />
          </p>
        </div>

        {/* Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <label className="block text-2xl font-bold text-gray-800 mb-3 text-center">
              🙋‍♂️ איך קוראים לך?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="הכנס את השם שלך..."
              className="w-full px-6 py-4 text-xl text-center border-4 border-green-300 rounded-2xl focus:ring-4 focus:ring-green-400 focus:border-green-500 font-bold"
              dir="rtl"
              required
            />
          </div>

          {/* Grade Selection */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <label className="block text-2xl font-bold text-gray-800 mb-4 text-center">
              📚 באיזו כיתה אתה?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {grades.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`py-6 text-3xl font-black rounded-2xl transition-all transform hover:scale-110 ${
                    grade === g
                      ? 'bg-gradient-to-br from-green-400 to-blue-500 text-white shadow-xl scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {g}&apos;
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name.trim() || !grade}
            className="w-full bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 text-white py-6 rounded-3xl font-black text-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          >
            🚀 בואו נתחיל!
          </button>
        </form>

        {/* Fun decoration */}
        <div className="text-center mt-8 text-white/80 text-lg">
          🍎 🍪 🥕 🧃 🍌 🥪
        </div>
      </div>
    </div>
  )
}
