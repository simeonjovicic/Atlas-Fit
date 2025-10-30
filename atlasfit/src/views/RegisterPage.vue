<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="register-container">
        <div class="logo-section">
          <h1 class="app-title">Atlas Fit</h1>
          <p class="app-subtitle">Starte deine Fitness-Reise</p>
        </div>

        <div class="form-section">
          <h2>Konto erstellen</h2>
          
          <form @submit.prevent="handleRegister">
            <ion-list lines="full" class="ion-no-padding">
              <ion-item>
                <ion-label position="floating">Name</ion-label>
                <ion-input
                  v-model="name"
                  type="text"
                  required
                  autocomplete="name"
                  :disabled="loading"
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="floating">E-Mail</ion-label>
                <ion-input
                  v-model="email"
                  type="email"
                  required
                  autocomplete="email"
                  :disabled="loading"
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Passwort</ion-label>
                <ion-input
                  v-model="password"
                  type="password"
                  required
                  autocomplete="new-password"
                  :disabled="loading"
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Passwort bestätigen</ion-label>
                <ion-input
                  v-model="confirmPassword"
                  type="password"
                  required
                  autocomplete="new-password"
                  :disabled="loading"
                ></ion-input>
              </ion-item>
            </ion-list>

            <div v-if="errorMessage" class="error-message">
              <ion-icon :icon="alertCircleOutline"></ion-icon>
              <span>{{ errorMessage }}</span>
            </div>

            <div class="password-requirements">
              <p>Passwort-Anforderungen:</p>
              <ul>
                <li :class="{ valid: password.length >= 6 }">
                  <ion-icon :icon="password.length >= 6 ? checkmarkCircle : ellipseOutline"></ion-icon>
                  Mindestens 6 Zeichen
                </li>
                <li :class="{ valid: password === confirmPassword && password.length > 0 }">
                  <ion-icon :icon="password === confirmPassword && password.length > 0 ? checkmarkCircle : ellipseOutline"></ion-icon>
                  Passwörter stimmen überein
                </li>
              </ul>
            </div>

            <ion-button
              expand="block"
              type="submit"
              class="register-button"
              :disabled="loading || !isFormValid"
            >
              <ion-spinner v-if="loading" name="crescent"></ion-spinner>
              <span v-else>Registrieren</span>
            </ion-button>
          </form>

          <div class="divider">
            <span>oder</span>
          </div>

          <ion-button
            expand="block"
            fill="outline"
            class="google-button"
            @click="handleGoogleRegister"
            :disabled="loading"
          >
            <ion-icon :icon="logoGoogle" slot="start"></ion-icon>
            Mit Google registrieren
          </ion-button>

          <div class="login-link">
            <p>
              Bereits ein Konto?
              <router-link to="/login">Anmelden</router-link>
            </p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonIcon,
  IonSpinner,
  toastController
} from '@ionic/vue';
import { logoGoogle, alertCircleOutline, checkmarkCircle, ellipseOutline } from 'ionicons/icons';
import { authService } from '@/services/authService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

export default defineComponent({
  name: 'RegisterPage',
  components: {
    IonPage,
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonIcon,
    IonSpinner
  },
  setup() {
    const router = useRouter();
    const name = ref('');
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const loading = ref(false);
    const errorMessage = ref('');

    const isFormValid = computed(() => {
      return (
        name.value.length > 0 &&
        email.value.length > 0 &&
        password.value.length >= 6 &&
        password.value === confirmPassword.value
      );
    });

    const showToast = async (message: string, color: string = 'danger') => {
      const toast = await toastController.create({
        message,
        duration: 3000,
        position: 'top',
        color
      });
      await toast.present();
    };

    const createUserProfile = async (userId: string, userName: string, userEmail: string) => {
      try {
        const profileRef = doc(db, 'users', userId, 'profile', 'data');
        await setDoc(profileRef, {
          name: userName,
          email: userEmail,
          createdAt: new Date().toISOString(),
          weight: null,
          height: null,
          workoutsPerWeek: null,
          measurements: {
            chest: null,
            bicepLeft: null,
            bicepRight: null,
            forearmLeft: null,
            forearmRight: null,
            shoulders: null,
            waist: null,
            hips: null,
            thighLeft: null,
            thighRight: null,
            calfLeft: null,
            calfRight: null
          }
        });
      } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }
    };

    const handleRegister = async () => {
      errorMessage.value = '';
      loading.value = true;

      try {
        const userCredential = await authService.register(email.value, password.value);
        
        // Create initial profile in Firestore
        await createUserProfile(userCredential.user.uid, name.value, email.value);
        
        await showToast('Konto erfolgreich erstellt!', 'success');
        router.replace('/home');
      } catch (error: any) {
        console.error('Register error:', error);
        
        // Firebase error handling
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage.value = 'Diese E-Mail-Adresse wird bereits verwendet.';
            break;
          case 'auth/invalid-email':
            errorMessage.value = 'Ungültige E-Mail-Adresse.';
            break;
          case 'auth/weak-password':
            errorMessage.value = 'Das Passwort ist zu schwach.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage.value = 'Registrierung ist momentan nicht möglich.';
            break;
          default:
            errorMessage.value = 'Registrierung fehlgeschlagen. Bitte versuche es erneut.';
        }
        
        await showToast(errorMessage.value);
      } finally {
        loading.value = false;
      }
    };

    const handleGoogleRegister = async () => {
      errorMessage.value = '';
      loading.value = true;

      try {
        const userCredential = await authService.loginWithGoogle();
        
        // Create initial profile in Firestore
        const displayName = userCredential.user.displayName || 'User';
        const userEmail = userCredential.user.email || '';
        await createUserProfile(userCredential.user.uid, displayName, userEmail);
        
        await showToast('Konto erfolgreich mit Google erstellt!', 'success');
        router.replace('/home');
      } catch (error: any) {
        console.error('Google register error:', error);
        
        if (error.code === 'auth/popup-closed-by-user') {
          errorMessage.value = 'Registrierung abgebrochen.';
        } else if (error.code === 'auth/account-exists-with-different-credential') {
          errorMessage.value = 'Ein Konto mit dieser E-Mail existiert bereits.';
        } else {
          errorMessage.value = 'Google-Registrierung fehlgeschlagen.';
        }
        
        await showToast(errorMessage.value);
      } finally {
        loading.value = false;
      }
    };

    return {
      name,
      email,
      password,
      confirmPassword,
      loading,
      errorMessage,
      isFormValid,
      handleRegister,
      handleGoogleRegister,
      logoGoogle,
      alertCircleOutline,
      checkmarkCircle,
      ellipseOutline
    };
  }
});
</script>

<style scoped>
.register-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.app-title {
  font-size: 48px;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  font-size: 16px;
  color: var(--ion-color-medium);
  margin-top: 8px;
}

.form-section {
  margin-top: 20px;
}

.form-section h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
}

ion-list {
  margin-bottom: 16px;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 16px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  margin-bottom: 16px;
  background-color: rgba(var(--ion-color-danger-rgb), 0.1);
  border-radius: 8px;
  color: var(--ion-color-danger);
  font-size: 14px;
}

.error-message ion-icon {
  font-size: 20px;
}

.password-requirements {
  margin-bottom: 16px;
  padding: 12px;
  background-color: rgba(var(--ion-color-light-rgb), 0.3);
  border-radius: 8px;
}

.password-requirements p {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-medium);
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--ion-color-medium);
  margin-bottom: 4px;
}

.password-requirements li.valid {
  color: var(--ion-color-success);
}

.password-requirements ion-icon {
  font-size: 16px;
}

.register-button {
  margin-top: 24px;
  height: 48px;
  font-weight: 600;
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
  text-align: center;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--ion-color-light);
}

.divider span {
  padding: 0 16px;
  color: var(--ion-color-medium);
  font-size: 14px;
}

.google-button {
  height: 48px;
  font-weight: 600;
  --border-color: var(--ion-color-light);
}

.login-link {
  text-align: center;
  margin-top: 24px;
}

.login-link p {
  color: var(--ion-color-medium);
  font-size: 14px;
}

.login-link a {
  color: var(--ion-color-primary);
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>

