'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #0d0d2b, #1a1a3e)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '40px', maxWidth: '500px', width: '100%', border: '1px solid rgba(240,198,122,0.2)', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✦</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', color: '#f0c67a', marginBottom: '8px' }}>Welkom bij Inner Sleep</h1>
        <p style={{ color: '#f5dca8', fontSize: '16px', marginBottom: '32px', opacity: 0.8 }}>Je proefperiode van 7 dagen is gestart. Geef je kind een goede start — iedere nacht opnieuw.</p>
        <a href="/" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: '8px', background: 'linear-gradient(135deg, #f0c67a, #f5dca8)', color: '#0d0d2b', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none' }}>Ga naar de app</a>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0d0d2b' }} />}>
      <SuccessContent />
    </Suspense>
  )
}