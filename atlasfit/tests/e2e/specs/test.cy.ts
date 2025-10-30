describe('Atlas Fit E2E Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage()
  })

  it('Redirects to login page when not authenticated', () => {
    cy.visit('/')
    cy.url().should('include', '/login')
  })

  it('Shows login page with email and password fields', () => {
    cy.visit('/login')
    cy.contains('Willkommen zurück')
    cy.get('ion-input[type="email"]').should('exist')
    cy.get('ion-input[type="password"]').should('exist')
    cy.contains('Anmelden')
    cy.contains('Mit Google anmelden')
  })

  it('Shows register page when clicking register link', () => {
    cy.visit('/login')
    cy.contains('Registrieren').click()
    cy.url().should('include', '/register')
    cy.contains('Konto erstellen')
  })

  it('Register page has all required fields', () => {
    cy.visit('/register')
    cy.get('ion-input').should('have.length.at.least', 4) // Name, Email, Password, Confirm Password
    cy.contains('Registrieren')
    cy.contains('Mit Google registrieren')
  })
})
