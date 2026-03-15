'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '../../utils/supabase-browser'
import { PLAN_DISPLAY, getPriceId, type PlanKey } from '../lib/pricing-plans'

export default function PricingPage() {
  const [loading, setLoading] = useState('')
  const [yearly, setYearly] = useState(false)
  const [autoTriggered, setAutoTriggered] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  const standardPriceId = useMemo(() => getPriceId('standard', yearly), [yearly])
  const premiumPriceId = useMemo(() => getPriceId('premium', yearly), [yearly])

  const startCheckout = async (priceId: string, auto = false) => {
    setCheckoutError('')

    if (!priceId) {
      setCheckoutError('Prijsconfig ontbreekt. Checkout kon niet starten.')
      return
    }

    setLoading(priceId)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const next = `/pricing?checkout=1&price=${encodeURIComponent(priceId)}`
      window.location.href = `/login?next=${encodeURIComponent(next)}`
      return
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, email: user.email, userId: user.id }),
      })

      const raw = await response.text()
      let payload: { url?: string; error?: string } = {}
      try {
        payload = raw ? JSON.parse(raw) : {}
      } catch {
        payload = { error: raw || `Onverwachte response (${response.status})` }
      }

      if (!response.ok || payload.error || !payload.url) {
        const message =
          payload.error ||
          `Checkout endpoint gaf status ${response.status} zonder URL terug.`
        setCheckoutError(`Checkout fout via /api/checkout: ${message}`)
        setLoading('')
        return
      }

      window.location.href = payload.url
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : auto
            ? 'Automatische checkout start mislukte.'
            : 'Er ging iets mis bij checkout.'
      setCheckoutError(`Checkout fout via /api/checkout: ${message}`)
      setLoading('')
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const shouldCheckout = params.get('checkout') === '1'
    const priceFromQuery = params.get('price')
    if (!shouldCheckout || !priceFromQuery || autoTriggered) return
    setAutoTriggered(true)
    void startCheckout(priceFromQuery, true)
  }, [autoTriggered])

  function PlanCard({ plan }: { plan: PlanKey }) {
    const display = PLAN_DISPLAY[plan]
    const priceId = plan === 'standard' ? standardPriceId : premiumPriceId
    const isLoading = loading === priceId

    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '32px',
          width: '320px',
          border:
            plan === 'premium'
              ? '1px solid rgba(240,198,122,0.4)'
              : '1px solid rgba(240,198,122,0.15)',
          position: 'relative',
        }}
      >
        {plan === 'premium' ? (
          <div
            style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #f0c67a, #f5dca8)',
              color: '#0d0d2b',
              padding: '4px 16px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            Meest gekozen
          </div>
        ) : null}

        <h2
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '24px',
            color: plan === 'premium' ? '#f0c67a' : '#f5dca8',
            marginBottom: '8px',
          }}
        >
          {display.name}
        </h2>
        <p
          style={{
            color: '#f5dca8',
            opacity: 0.6,
            fontSize: '14px',
            marginBottom: '24px',
          }}
        >
          {display.subtitle}
        </p>

        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '40px', color: '#f0c67a', fontWeight: 'bold' }}>
            {yearly ? display.yearlyPriceLabel : display.monthlyPriceLabel}
          </span>
          <span style={{ color: '#f5dca8', opacity: 0.6 }}>
            {yearly ? display.yearlySuffix : display.monthlySuffix}
          </span>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px', textAlign: 'left' }}>
          {display.features.map((item) => (
            <li
              key={item}
              style={{
                color: '#f5dca8',
                padding: '8px 0',
                fontSize: '14px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              ✦ {item}
            </li>
          ))}
        </ul>

        <button
          onClick={() => void startCheckout(priceId || '')}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            border:
              plan === 'premium' ? 'none' : '1px solid rgba(240,198,122,0.4)',
            background:
              plan === 'premium'
                ? 'linear-gradient(135deg, #f0c67a, #f5dca8)'
                : 'transparent',
            color: plan === 'premium' ? '#0d0d2b' : '#f0c67a',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {isLoading ? 'Even wachten...' : 'Start gratis proefperiode'}
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #0d0d2b, #1a1a3e)',
        padding: '60px 20px',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '40px',
            color: '#f0c67a',
            marginBottom: '8px',
          }}
        >
          Inner Sleep
        </h1>
        <p style={{ color: '#f5dca8', fontSize: '16px', marginBottom: '40px', opacity: 0.8 }}>
          Geef je kind een goede start — iedere nacht opnieuw
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          <span style={{ color: !yearly ? '#f0c67a' : '#f5dca8', opacity: !yearly ? 1 : 0.5 }}>
            Maandelijks
          </span>
          <div
            onClick={() => setYearly(!yearly)}
            style={{
              width: '52px',
              height: '28px',
              borderRadius: '14px',
              background: yearly ? '#f0c67a' : 'rgba(255,255,255,0.2)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.3s',
            }}
          >
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#0d0d2b',
                position: 'absolute',
                top: '3px',
                left: yearly ? '27px' : '3px',
                transition: 'left 0.3s',
              }}
            />
          </div>
          <span style={{ color: yearly ? '#f0c67a' : '#f5dca8', opacity: yearly ? 1 : 0.5 }}>
            Jaarlijks
          </span>
          {yearly ? (
            <span
              style={{
                background: 'rgba(240,198,122,0.2)',
                color: '#f0c67a',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              Bespaar 33%
            </span>
          ) : null}
        </div>

        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <PlanCard plan='standard' />
          <PlanCard plan='premium' />
        </div>

        {checkoutError ? (
          <p
            style={{
              marginTop: '16px',
              color: '#fca5a5',
              fontSize: '13px',
              lineHeight: 1.6,
            }}
          >
            {checkoutError}
          </p>
        ) : null}

        <p style={{ marginTop: '26px', color: '#f5dca8', opacity: 0.75, fontSize: '13px' }}>
          Door verder te gaan ga je akkoord met{' '}
          <Link href='/voorwaarden' style={{ color: '#f5dca8' }}>
            Voorwaarden
          </Link>{' '}
          en{' '}
          <Link href='/privacy' style={{ color: '#f5dca8' }}>
            Privacy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
