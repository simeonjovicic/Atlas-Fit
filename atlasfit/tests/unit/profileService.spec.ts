import { describe, expect, test, vi } from 'vitest'
import { profileService } from '@/services/profileService'

// Mock Firebase services
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  collection: vi.fn()
}))

vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn()
}))

vi.mock('@/services/firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user-id' }
  },
  db: {},
  storage: {}
}))

describe('profileService', () => {
  test('profileService has all required methods', () => {
    expect(profileService.getProfile).toBeDefined()
    expect(profileService.saveProfile).toBeDefined()
    expect(profileService.getProfileHistory).toBeDefined()
    expect(profileService.addProfileHistoryEntry).toBeDefined()
    expect(profileService.uploadProfilePhoto).toBeDefined()
    expect(profileService.deleteProfilePhoto).toBeDefined()
    expect(profileService.migrateFromLocalStorage).toBeDefined()
  })

  test('saveProfile requires authenticated user', async () => {
    // Mock no authenticated user
    vi.mock('@/services/firebase', () => ({
      auth: { currentUser: null },
      db: {},
      storage: {}
    }))

    try {
      await profileService.saveProfile({ name: 'Test User' })
    } catch (error: any) {
      expect(error.message).toContain('No authenticated user')
    }
  })
})

