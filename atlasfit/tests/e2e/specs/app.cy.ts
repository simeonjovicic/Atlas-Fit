describe('Atlas Fit App - E2E Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('zeigt Login-Seite und ermöglicht Navigation zur Register-Seite', () => {
    // Besuche die App (sollte zur Login-Seite redirecten)
    cy.visit('/')
    cy.url().should('include', '/login')
    
    // Prüfe dass Login-Seite alle Elemente zeigt
    cy.contains('Willkommen zurück')
    cy.contains('Atlas Fit')
    
    // Prüfe Input-Felder (ion-input enthält ein inneres input-Element)
    cy.get('ion-input').should('have.length', 2)
    cy.get('ion-input').first().find('input[type="email"]').should('exist')
    cy.get('ion-input').last().find('input[type="password"]').should('exist')
    
    // Prüfe Buttons - Text ist in einem span Element
    cy.contains('span', 'Anmelden').should('exist')
    cy.contains('Mit Google anmelden').should('exist')
    
    // Navigiere zur Register-Seite
    cy.contains('Jetzt registrieren').click()
    cy.url().should('include', '/register')
    
    // Prüfe dass Register-Seite alle Felder zeigt
    cy.contains('Konto erstellen')
    cy.get('ion-input').should('have.length.at.least', 4) // Name, Email, Password, Confirm Password (kann mehr geben)
    cy.contains('span', 'Registrieren').should('exist')
    cy.contains('Mit Google registrieren').should('exist')
  })

  it('validiert Login-Formular und aktiviert Button nur bei gültigen Eingaben', () => {
    cy.visit('/login')
    
    // Warte bis Seite geladen ist
    cy.contains('Willkommen zurück')
    
    // Finde den Login-Button (ion-button mit span "Anmelden")
    cy.contains('span', 'Anmelden').parent('ion-button').as('loginButton')
    
    // Button sollte initial deaktiviert sein (leeres Formular)
    cy.get('@loginButton').then(($btn) => {
      // Prüfe ob disabled gesetzt ist (als Property oder Attribut)
      const isDisabled = $btn.prop('disabled') || $btn.attr('disabled') !== undefined
      expect(isDisabled).to.be.true
    })
    
    // Nur Email eingegeben - sollte noch deaktiviert sein (mind. 6 Zeichen Passwort nötig)
    cy.get('ion-input').first().find('input').clear().type('test@example.com')
    cy.wait(100) // Kurz warten für Vue Reaktivität
    cy.get('@loginButton').then(($btn) => {
      const isDisabled = $btn.prop('disabled') || $btn.attr('disabled') !== undefined
      expect(isDisabled).to.be.true
    })
    
    // Email und Passwort eingegeben (mind. 6 Zeichen) - Button sollte aktiviert sein
    cy.get('ion-input').last().find('input').clear().type('password123')
    cy.wait(200) // Kurz warten für Vue Reaktivität
    cy.get('@loginButton').then(($btn) => {
      const isDisabled = $btn.prop('disabled') || $btn.attr('disabled') !== undefined
      expect(isDisabled).to.be.false
    })
    
    // Leere Passwort - Button sollte wieder deaktiviert sein
    cy.get('ion-input').last().find('input').clear()
    cy.wait(200) // Kurz warten für Vue Reaktivität
    cy.get('@loginButton').then(($btn) => {
      const isDisabled = $btn.prop('disabled') || $btn.attr('disabled') !== undefined
      expect(isDisabled).to.be.true
    })
  })

  it('erstellt ein neues Workout nach erfolgreichem Login', () => {
    // Login mit Testbenutzer
    cy.visit('/login')
    cy.contains('Willkommen zurück')
    
    // Email und Passwort eingeben
    cy.get('ion-input').first().find('input').type('test@gmail.com')
    cy.get('ion-input').last().find('input').type('12345678')
    
    // Login-Button klicken (warten bis aktiviert)
    cy.contains('span', 'Anmelden').parent('ion-button').should('not.be.disabled')
    cy.contains('span', 'Anmelden').parent('ion-button').click()
    
    // Warte auf Redirect zur Homepage
    cy.url({ timeout: 10000 }).should('include', '/home')
    cy.wait(1000) // Kurz warten bis Homepage geladen ist
    
    // Navigiere zur CreateWorkout Seite
    cy.visit('/createWorkout')
    cy.url().should('include', '/createWorkout')
    cy.contains('Create Workout')
    
    // Öffne Modal zum Erstellen eines neuen Workouts
    cy.contains('Create New Workout').click()
    cy.wait(500) // Warten bis Modal geöffnet ist
    
    // Prüfe dass Modal geöffnet ist
    cy.contains('New workout')
    cy.wait(300) // Warte bis Modal vollständig gerendert ist
    
    // Gebe Workout-Namen ein
    // Das Input-Feld befindet sich im Modal
    cy.get('ion-modal').should('exist')
    cy.get('ion-modal ion-input').first().find('input').clear().type('Test Workout E2E')
    cy.wait(300)
    
    // Öffne Modal zum Hinzufügen von Übungen
    cy.contains('ADD EXERCISE').click()
    cy.wait(500) // Warten bis Modal geöffnet ist
    
    // Prüfe dass Exercise-Modal geöffnet ist
    cy.contains('Add Exercise')
    
    // Suche nach einer Übung (z.B. "push")
    cy.get('ion-searchbar').find('input').type('push')
    cy.wait(1000) // Warten auf Filter-Ergebnisse
    
    // Warte bis Übungsliste geladen ist
    cy.get('ion-list').should('exist')
    cy.wait(500)
    
    // Wähle die erste verfügbare Übung aus
    // Versuche verschiedene Selektoren - ion-item mit exercise-item Klasse oder button Attribut
    cy.get('ion-item.exercise-item, ion-item[button]').first().should('be.visible').click({ force: true })
    cy.wait(300)
    
    // Bestätige die Auswahl (Checkmark-Button im Modal-Header)
    // Der Checkmark-Button ist der letzte Button im Toolbar mit "Add Exercise" Titel
    cy.contains('Add Exercise').parents('ion-toolbar').first().within(() => {
      cy.get('ion-button').last().click() // Checkmark-Button
    })
    cy.wait(800) // Warten bis Modal geschlossen ist
    
    // Prüfe dass Übung hinzugefügt wurde (Modal sollte wieder "New workout" zeigen)
    cy.contains('New workout')
    cy.contains('ADD EXERCISE') // Button sollte noch sichtbar sein
    
    // Speichere das Workout (Checkmark-Button im Modal-Header)
    // Der Checkmark-Button ist der letzte Button im Toolbar mit "New workout" Titel
    cy.contains('New workout').parents('ion-toolbar').first().within(() => {
      cy.get('ion-button').last().then(($btn) => {
        // Prüfe dass Button aktiviert ist
        const isDisabled = $btn.prop('disabled') || $btn.attr('disabled') !== undefined
        expect(isDisabled).to.be.false
        // Klicke auf Button
        cy.wrap($btn).click()
      })
    })
    cy.wait(1500) // Warten bis Workout gespeichert ist
    
    // Prüfe dass Workout erstellt wurde - sollte in der Liste erscheinen
    cy.contains('Your Workouts:')
    cy.contains('Test Workout E2E').should('exist')
    
    // Prüfe dass Modal geschlossen ist (Create New Workout Button sollte wieder sichtbar sein)
    cy.contains('Create New Workout').should('be.visible')
    
    // Lösche das erstellte Workout wieder
    // Finde das Workout-Card mit dem Namen "Test Workout E2E"
    cy.contains('Test Workout E2E').parents('ion-card').within(() => {
      // Klicke auf den drei-Punkte-Button (ellipsisVertical Icon)
      cy.get('ion-button').click({ force: true })
    })
    cy.wait(500) // Warte bis Popover geöffnet ist
    
    // Klicke auf "Delete" im Popover
    cy.contains('Delete').click()
    cy.wait(500) // Warte bis Alert erscheint
    
    // Bestätige das Löschen im Alert
    cy.contains('Are you sure').should('be.visible')
    cy.contains('button', 'Delete').click()
    cy.wait(1000) // Warte bis Workout gelöscht ist
    
    // Prüfe dass Workout gelöscht wurde
    cy.contains('Test Workout E2E').should('not.exist')
  })
})
