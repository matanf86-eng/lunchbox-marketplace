import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { analyzeLunchbox, fileToBase64 } from '../services/ai'
import { Camera, X, Check, Trash2, ArrowRight } from 'lucide-react'

export default function ScanLunchbox() {
  const [image, setImage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [items, setItems] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleImageCapture = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!imageFile) return

    setAnalyzing(true)
    setError('')

    try {
      const base64 = await fileToBase64(imageFile)
      const detectedItems = await analyzeLunchbox(base64)
      setItems(detectedItems)
    } catch (err) {
      setError('שגיאה בזיהוי הפריטים. נסו שוב.')
      console.error(err)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleAddItem = () => {
    const newItem = prompt('הוסיפו פריט:')
    if (newItem) {
      setItems([...items, { name: newItem, category: 'אחר', emoji: '🍱' }])
    }
  }

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (items.length === 0) {
      setError('נא להוסיף לפחות פריט אחד')
      return
    }

    setSaving(true)
    setError('')

    try {
      // Upload image to Supabase Storage
      const fileName = `${user.id}/${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('lunchbox-images')
        .upload(fileName, imageFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('lunchbox-images')
        .getPublicUrl(fileName)

      // Save lunchbox to database
      const today = new Date().toISOString().split('T')[0]
      const { error: dbError } = await supabase
        .from('lunchboxes')
        .insert([
          {
            user_id: user.id,
            image_url: publicUrl,
            items: JSON.stringify(items),
            scan_date: today,
            is_active: true,
          },
        ])

      if (dbError) throw dbError

      navigate('/dashboard')
    } catch (err) {
      setError('שגיאה בשמירה. נסו שוב.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">סרוק קופסת אוכל</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Image Capture */}
        {!image ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">צלמו את קופסת האוכל</h2>
            <p className="text-gray-600 mb-6">
              צלמו תמונה ברורה של כל הפריטים בקופסת האוכל שלכם
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageCapture}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              פתח מצלמה
            </button>
          </div>
        ) : (
          <>
            {/* Image Preview */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="relative">
                <img
                  src={image}
                  alt="Lunchbox"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setImage(null)
                    setImageFile(null)
                    setItems([])
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {items.length === 0 && (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full mt-4 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {analyzing ? 'מזהה פריטים...' : 'זהה פריטים אוטומטית 🤖'}
                </button>
              )}
            </div>

            {/* Items List */}
            {items.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">הפריטים שזוהו</h3>
                  <button
                    onClick={handleAddItem}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    + הוסף פריט
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.emoji}</span>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-600">{item.category}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    'שומר...'
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      שמור קופסת אוכל
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
