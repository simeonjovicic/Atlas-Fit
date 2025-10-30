import { describe, expect, test, vi, beforeEach } from 'vitest'
import { authService } from '@/services/authService'

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  getAuth: vi.fn(() => ({ currentUser: null }))
}))

vi.mock('@/services/firebase', () => ({
  auth: {
    currentUser: null
  }
}))

describe('authService', () => {
  test('authService has all required methods', () => {
    expect(authService.login).toBeDefined()
    expect(authService.register).toBeDefined()
    expect(authService.loginWithGoogle).toBeDefined()
    expect(authService.logout).toBeDefined()
    expect(authService.getCurrentUser).toBeDefined()
    expect(authService.onAuthChange).toBeDefined()
  })

  test('getCurrentUser returns null when no user is logged in', () => {
    const currentUser = authService.getCurrentUser()
    expect(currentUser).toBeNull()
  })
})

