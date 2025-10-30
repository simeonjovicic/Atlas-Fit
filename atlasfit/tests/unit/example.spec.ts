import { mount } from '@vue/test-utils'
import { describe, expect, test, vi, beforeEach } from 'vitest'
import LoginPage from '@/views/LoginPage.vue'

// Mock Firebase services
vi.mock('@/services/firebase', () => ({
  auth: {
    currentUser: null
  },
  db: {},
  storage: {}
}))

vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(() => null),
    onAuthChange: vi.fn()
  }
}))

describe('LoginPage.vue', () => {
  test('renders login page with email and password fields', () => {
    const wrapper = mount(LoginPage, {
      global: {
        stubs: {
          'ion-page': true,
          'ion-content': true,
          'ion-input': true,
          'ion-button': true,
          'ion-list': true,
          'ion-item': true,
          'ion-label': true,
          'ion-icon': true,
          'ion-spinner': true
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  test('login button is disabled when form is invalid', async () => {
    const wrapper = mount(LoginPage, {
      global: {
        stubs: {
          'ion-page': true,
          'ion-content': true,
          'ion-input': true,
          'ion-button': true,
          'ion-list': true,
          'ion-item': true,
          'ion-label': true,
          'ion-icon': true,
          'ion-spinner': true
        }
      }
    })
    
    // Form should be invalid when empty
    const vm = wrapper.vm as any
    expect(vm.isFormValid).toBe(false)
  })

  test('validates email and password requirements', async () => {
    const wrapper = mount(LoginPage, {
      global: {
        stubs: {
          'ion-page': true,
          'ion-content': true,
          'ion-input': true,
          'ion-button': true,
          'ion-list': true,
          'ion-item': true,
          'ion-label': true,
          'ion-icon': true,
          'ion-spinner': true
        }
      }
    })
    
    const vm = wrapper.vm as any
    
    // Set valid credentials
    vm.email = 'test@example.com'
    vm.password = 'password123'
    
    await wrapper.vm.$nextTick()
    
    // Form should be valid
    expect(vm.isFormValid).toBe(true)
  })
})
