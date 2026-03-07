'use client'

import { useState } from 'react'
import { createClient } from '../../utils/supabase-browser'

export default function PricingPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState('')
  const [yearly, setYearly] = useState(false)

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, email: user.email }),
      })
      const { url, error } = await response.json()
      if (error) {
        alert(error)
        setLoading('')
        return
      }
      window.location.href = url
    } catch {
      alert('Er ging iets mis. Probeer het opnieuw.')
      setLoading('')
    }
  }

  const standardPrice = yearly
    ? process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD_YEARLY
    : process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD_MONTHLY
  const premiumPrice = yearly
    ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY
    : process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #0d0d2b, #1a1a3e)', padding: '60px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '40px', color: '#f0c67a', marginBottom: '8px' }}>Inner Sleep</h1>
        <p style={{ color: '#f5dca8', fontSize: '16px', marginBottom: '40px', opacity: 0.8 }}>Geef je kind een goede start — iedere nacht opnieuw</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '40px' }}>
          <span style={{ color: !yearly ? '#f0c67a' : '#f5dca8', opacity: !yearly ? 1 : 0.5 }}>Maandelijks</span>
          <div onClick={() => setYearly(!yearly)} style={{ width: '52px', height: '28px', borderRadius: '14px', background: yearly ? '#f0c67a' : 'rgba(255,255,255,0.2)', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0d0d2b', position: 'absolute', top: '3px', left: yearly ? '27px' : '3px', transition: 'left 0.3s' }} />
          </div>
          <span style={{ color: yearly ? '#f0c67a' : '#f5dca8', opacity: yearly ? 1 : 0.5 }}>Jaarlijks</span>
          {yearly && <span style={{ background: 'rgba(240,198,122,0.2)', color: '#f0c67a', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Bespaar 33%</span>}
        </div>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '32px', width: '320px', border: '1px solid rgba(240,198,122,0.15)' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#f5dca8', marginBottom: '8px' }}>Standard</h2>
            <p style={{ color: '#f5dca8', opacity: 0.6, fontSize: '14px', marginBottom: '24px' }}>Alle basis-affirmaties</p>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '40px', color: '#f0c67a', fontWeight: 'bold' }}>{yearly ? '39,99' : '4,99'}</span>
              <span style={{ color: '#f5dca8', opacity: 0.6 }}>{yearly ? '/jaar' : '/maand'}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px', textAlign: 'left' }}>
              {['Twee-fase slaapmodel', 'Alle leeftijdsgroepen', 'Rustgevende soundscapes', '7 dagen gratis proberen'].map((item) => (
                <li key={item} style={{ color: '#f5dca8', padding: '8px 0', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>✦ {item}</li>
              ))}
            </ul>
            <button onClick={() => handleCheckout(standardPrice || '')} disabled={loading === standardPrice} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid rgba(240,198,122,0.4)', background: 'transparent', color: '#f0c67a', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading === standardPrice ? 'Even wachten...' : 'Start gratis proefperiode'}
            </button>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '32px', width: '320px', border: '1px solid rgba(240,198,122,0.4)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f0c67a, #f5dca8)', color: '#0d0d2b', padding: '4px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Meest gekozen</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#f0c67a', marginBottom: '8px' }}>Personal</h2>
            <p style={{ color: '#f5dca8', opacity: 0.6, fontSize: '14px', marginBottom: '24px' }}>Gepersonaliseerd voor jouw kind</p>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '40px', color: '#f0c67a', fontWeight: 'bold' }}>{yearly ? '79,99' : '9,99'}</span>
              <span style={{ color: '#f5dca8', opacity: 0.6 }}>{yearly ? '/jaar' : '/maand'}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px', textAlign: 'left' }}>
              {['Alles van Standard', 'Naam van je kind in affirmaties', "Keuze uit thema's", 'AI-gepersonaliseerde content', '7 dagen gratis proberen'].map((item) => (
                <li key={item} style={{ color: '#f5dca8', padding: '8px 0', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>✦ {item}</li>
              ))}
            </ul>
            <button onClick={() => handleCheckout(premiumPrice || '')} disabled={loading === premiumPrice} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #f0c67a, #f5dca8)', color: '#0d0d2b', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading === premiumPrice ? 'Even wachten...' : 'Start gratis proefperiode'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}