import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { Store, ArrowRight, Plus, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'

export default function Marketplace() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (profile?.school_id) {
      fetchOffers()
      
      // Subscribe to new offers
      const channel = supabase
        .channel('marketplace-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'trade_offers',
          },
          (payload) => {
            fetchOffers()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [profile])

  const fetchOffers = async () => {
    try {
      // Get all active offers from same school
      const { data: offersData, error } = await supabase
        .from('trade_offers')
        .select(`
          *,
          creator:profiles!creator_id (
            id,
            display_name,
            grade
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filter by school (done client-side because of complex join)
      const filteredOffers = offersData.filter(
        (offer) => offer.creator.id !== user.id
      )

      setOffers(filteredOffers)
    } catch (error) {
      console.error('Error fetching offers:', error)
    } finally {
      setLoading(false)
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
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            Marketplace
          </h1>
          <button
            onClick={() => navigate('/create-offer')}
            className="p-2 text-primary hover:bg-primary/10 rounded-lg"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">טוען הצעות...</div>
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">אין הצעות כרגע</h2>
            <p className="text-gray-600 mb-6">תהיו הראשונים ליצור הצעת חילופין!</p>
            <button
              onClick={() => navigate('/create-offer')}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              צרו הצעה
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                onClick={() => navigate(`/offer/${offer.id}`)}
                className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-bold text-primary">
                        {offer.creator.display_name[0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{offer.creator.display_name}</div>
                      <div className="text-xs text-gray-600">כיתה {offer.creator.grade}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(offer.created_at), {
                      addSuffix: true,
                      locale: he,
                    })}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 mb-3">
                  <div className="text-sm text-gray-600 mb-1">מציע להחלפה:</div>
                  <div className="text-2xl font-bold">{offer.item_offered}</div>
                </div>

                {offer.message && (
                  <p className="text-gray-700 text-sm">{offer.message}</p>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="text-primary font-medium text-sm hover:underline">
                    הצע החלפה ←
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
