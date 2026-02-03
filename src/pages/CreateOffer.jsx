import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { ArrowRight, Send } from 'lucide-react'

export default function CreateOffer() {
  const [lunchbox, setLunchbox] = useState(null)
  const [selectedItem, setSelectedItem] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTodayLunchbox()
  }, [])

  const fetchTodayLunchbox = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('lunchboxes')
        .select('*')
        .eq('user_id', user.id)
        .eq('scan_date', today)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No lunchbox found
          setError('עדיין לא סרקתם את קופסת האוכל היום')
        } else {
          throw error
        }
      } else {
        setLunchbox(data)
      }
    } catch (error) {
      console.error('Error fetching lunchbox:', error)
      setError('שגיאה בטעינת קופסת האוכל')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedItem) {
      setError('נא לבחור פריט להחלפה')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const { error } = await supabase.from('trade_offers').insert([
        {
          creator_id: user.id,
          lunchbox_id: lunchbox.id,
          item_offered: selectedItem,
          message: message || null,
          status: 'active',
        },
      ])

      if (error) throw error

      navigate('/marketplace')
    } catch (error) {
      console.error('Error creating offer:', error)
      setError('שגיאה ביצירת ההצעה')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">טוען...</div>
      </div>
    )
  }

  if (!lunchbox) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/marketplace')}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">צור הצעת החלפה</h1>
            <div className="w-9" />
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <h2 className="text-xl font-bold mb-2">אופס!</h2>
            <p className="text-gray-600 mb-6">
              כדי ליצור הצעת החלפה, תחילה צריך לסרוק את קופסת האוכל שלכם היום
            </p>
            <button
              onClick={() => navigate('/scan')}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              סרקו קופסת אוכל
            </button>
          </div>
        </main>
      </div>
    )
  }

  const items = JSON.parse(lunchbox.items)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/marketplace')}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">צור הצעת החלפה</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Item */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">מה תרצו להציע להחלפה?</h2>
            <div className="grid grid-cols-2 gap-3">
              {items.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedItem(item.name)}
                  className={`p-4 rounded-xl border-2 transition-all text-right ${
                    selectedItem === item.name
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-600">{item.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <label className="block text-lg font-bold mb-4">
              הוסיפו הודעה (אופציונלי)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='למשל: "מי רוצה להחליף? יש לי תפוח מתוק!"'
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows="4"
              dir="rtl"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!selectedItem || submitting}
            className="w-full bg-primary text-white py-4 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              'מפרסם...'
            ) : (
              <>
                <Send className="w-5 h-5" />
                פרסם הצעה
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
