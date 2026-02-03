import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { School, Users } from 'lucide-react'

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState('')
  const [schoolCode, setSchoolCode] = useState('')
  const [createNewSchool, setCreateNewSchool] = useState(false)
  const [newSchoolName, setNewSchoolName] = useState('')
  const [grade, setGrade] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { profile, updateProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (profile && profile.school_id && profile.grade) {
      navigate('/dashboard')
    }
  }, [profile, navigate])

  const grades = ['א', 'ב', 'ג', 'ד', 'ה', 'ו']

  const generateSchoolCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleStep1 = async (e) => {
    e.preventDefault()
    if (!displayName.trim()) {
      setError('נא להזין שם')
      return
    }

    setLoading(true)
    try {
      await updateProfile({ display_name: displayName })
      setError('')
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStep2 = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let schoolId = null

      if (createNewSchool) {
        // Create new school
        const code = generateSchoolCode()
        const { data: school, error: schoolError } = await supabase
          .from('schools')
          .insert([{ name: newSchoolName, code }])
          .select()
          .single()

        if (schoolError) throw schoolError
        schoolId = school.id
      } else {
        // Join existing school
        const { data: school, error: schoolError } = await supabase
          .from('schools')
          .select('id')
          .eq('code', schoolCode.toUpperCase())
          .single()

        if (schoolError || !school) {
          setError('קוד בית ספר לא תקין')
          setLoading(false)
          return
        }
        schoolId = school.id
      }

      await updateProfile({ school_id: schoolId })
      setError('')
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStep3 = async (e) => {
    e.preventDefault()
    if (!grade) {
      setError('נא לבחור כיתה')
      return
    }

    setLoading(true)
    try {
      await updateProfile({ grade })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full ${
                  s === step ? 'bg-primary' : s < step ? 'bg-primary/50' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Step 1: Display Name */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-6">
            <div className="flex justify-center">
              <Users className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-center">איך קוראים לך?</h2>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="השם שלך"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              dir="rtl"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'שומר...' : 'המשך'}
            </button>
          </form>
        )}

        {/* Step 2: School */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-6">
            <div className="flex justify-center">
              <School className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-center">בחרו בית ספר</h2>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setCreateNewSchool(false)}
                className={`w-full p-4 border-2 rounded-lg text-right transition-colors ${
                  !createNewSchool ? 'border-primary bg-primary/5' : 'border-gray-300'
                }`}
              >
                <div className="font-medium">הצטרפות לבית ספר קיים</div>
                <div className="text-sm text-gray-600 mt-1">יש לכם קוד בית ספר?</div>
              </button>

              <button
                type="button"
                onClick={() => setCreateNewSchool(true)}
                className={`w-full p-4 border-2 rounded-lg text-right transition-colors ${
                  createNewSchool ? 'border-primary bg-primary/5' : 'border-gray-300'
                }`}
              >
                <div className="font-medium">יצירת בית ספר חדש</div>
                <div className="text-sm text-gray-600 mt-1">אתם הראשונים?</div>
              </button>
            </div>

            {!createNewSchool ? (
              <input
                type="text"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                placeholder="הזינו קוד בית ספר"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                dir="ltr"
              />
            ) : (
              <input
                type="text"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                placeholder="שם בית הספר"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                dir="rtl"
              />
            )}

            <button
              type="submit"
              disabled={loading || (!createNewSchool && !schoolCode) || (createNewSchool && !newSchoolName)}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'מצטרף...' : 'המשך'}
            </button>
          </form>
        )}

        {/* Step 3: Grade */}
        {step === 3 && (
          <form onSubmit={handleStep3} className="space-y-6">
            <h2 className="text-2xl font-bold text-center">באיזו כיתה אתם?</h2>
            <div className="grid grid-cols-3 gap-3">
              {grades.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`p-4 text-2xl font-bold rounded-lg border-2 transition-colors ${
                    grade === g
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 hover:border-primary/50'
                  }`}
                >
                  {g}&apos;
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={loading || !grade}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'מסיים...' : 'סיום'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
