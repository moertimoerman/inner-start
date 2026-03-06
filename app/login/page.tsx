'use client'

import { createClient } from '../../utils/supabase-browser'
import { useState } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        window.location.href = '/'
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Check je email om je account te bevestigen!')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0d0d2b, #1a1a3e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        border: '1px solid rgba(240,198,122,0.2)',
      }}>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '32px',
          color: '#f0c67a',
          textAlign: 'center',
          marginBottom: '8px',
        }}>
          Inner
        </h1>
        <p style={{
          color: '#f5dca8',
          textAlign: 'center',
          marginBottom: '32px',
          fontSize: '14px',
        }}>
          {isLogin ? 'Welkom terug' : 'Maak je account aan'}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-mailadres"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(240,198,122,0.3)',
              background: 'rgba(255,255,255,0.05)',
              color: '#f8e8c4',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box' as const,
            }}
          />
          <input
            type="password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '24px',
              borderRadius: '8px',
              border: '1px solid rgba(240,198,122,0.3)',
              background: 'rgba(255,255,255,0.05)',
              color: '#f8e8c4',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box' as const,
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #f0c67a, #f5dca8)',
              color: '#0d0d2b',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Even wachten...' : isLogin ? 'Inloggen' : 'Account aanmaken'}
          </button>
        </form>

        {message && (
          <p style={{
            marginTop: '16px',
            textAlign: 'center',
            color: message.includes('Check') ? '#4ade80' : '#f87171',
            fontSize: '14px',
          }}>
            {message}
          </p>
        )}

        <p
          onClick={() => setIsLogin(!isLogin)}
          style={{
            marginTop: '24px',
            textAlign: 'center',
            color: '#f5dca8',
            fontSize: '14px',
            cursor: 'pointer',
            opacity: 0.7,
          }}
        >
          {isLogin ? 'Nog geen account? Registreer hier' : 'Al een account? Log in'}
        </p>
      </div>
    </div>
  )
}