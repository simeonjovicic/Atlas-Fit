<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="login-container">
        <div class="logo-section">
          <h1 class="app-title">Atlas Fit</h1>
          <p class="app-subtitle">Dein persönlicher Workout-Tracker</p>
        </div>

        <div class="form-section">
          <h2>Willkommen zurück</h2>
          
          <form @submit.prevent="handleLogin">
            <ion-list lines="full" class="ion-no-padding">
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
                  autocomplete="current-password"
                  :disabled="loading"
                ></ion-input>
              </ion-item>
            </ion-list>

            <div v-if="errorMessage" class="error-message">
              <ion-icon :icon="alertCircleOutline"></ion-icon>
              <span>{{ errorMessage }}</span>
            </div>

            <ion-button
              expand="block"
              type="submit"
              class="login-button"
              :disabled="loading || !isFormValid"
            >
              <ion-spinner v-if="loading" name="crescent"></ion-spinner>
              <span v-else>Anmelden</span>
            </ion-button>
          </form>

          <div class="divider">
            <span>oder</span>
          </div>

          <ion-button
            expand="block"
            fill="outline"
            class="google-button"
            @click="handleGoogleLogin"
            :disabled="loading"
          >
            <ion-icon :icon="logoGoogle" slot="start"></ion-icon>
            Mit Google anmelden
          </ion-button>

          <div class="divider-small">
            <span></span>
          </div>

          <ion-button
            expand="block"
            fill="clear"
            class="register-button"
            @click="goToRegister"
          >
            Noch kein Konto? <strong>&nbsp;Jetzt registrieren</strong>
          </ion-button>
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
import { logoGoogle, alertCircleOutline } from 'ionicons/icons';
import { authService } from '@/services/authService';

export default defineComponent({
  name: 'LoginPage',
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
    const email = ref('');
    const password = ref('');
    const loading = ref(false);
    const errorMessage = ref('');

    const isFormValid = computed(() => {
      return email.value.length > 0 && password.value.length >= 6;
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

    const handleLogin = async () => {
      errorMessage.value = '';
      loading.value = true;

      try {
        await authService.login(email.value, password.value);
        await showToast('Erfolgreich angemeldet!', 'success');
        router.replace('/home');
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Firebase error handling
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage.value = 'Kein Benutzer mit dieser E-Mail gefunden.';
            break;
          case 'auth/wrong-password':
            errorMessage.value = 'Falsches Passwort.';
            break;
          case 'auth/invalid-email':
            errorMessage.value = 'Ungültige E-Mail-Adresse.';
            break;
          case 'auth/user-disabled':
            errorMessage.value = 'Dieses Konto wurde deaktiviert.';
            break;
          case 'auth/too-many-requests':
            errorMessage.value = 'Zu viele Anmeldeversuche. Bitte später erneut versuchen.';
            break;
          default:
            errorMessage.value = 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.';
        }
        
        await showToast(errorMessage.value);
      } finally {
        loading.value = false;
      }
    };

    const handleGoogleLogin = async () => {
      errorMessage.value = '';
      loading.value = true;

      try {
        await authService.loginWithGoogle();
        await showToast('Erfolgreich mit Google angemeldet!', 'success');
        router.replace('/home');
      } catch (error: any) {
        console.error('Google login error:', error);
        
        if (error.code === 'auth/popup-closed-by-user') {
          errorMessage.value = 'Anmeldung abgebrochen.';
        } else {
          errorMessage.value = 'Google-Anmeldung fehlgeschlagen.';
        }
        
        await showToast(errorMessage.value);
      } finally {
        loading.value = false;
      }
    };

    const goToRegister = () => {
      router.push('/register');
    };

    return {
      email,
      password,
      loading,
      errorMessage,
      isFormValid,
      handleLogin,
      handleGoogleLogin,
      goToRegister,
      logoGoogle,
      alertCircleOutline
    };
  }
});
</script>

<style scoped>
.login-container {
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

.login-button {
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

.divider-small {
  margin: 16px 0;
  height: 1px;
}

.register-button {
  height: 48px;
  font-size: 15px;
  color: var(--ion-color-medium);
  --background-hover: rgba(var(--ion-color-primary-rgb), 0.1);
}

.register-button strong {
  color: var(--ion-color-primary);
}
</style>

