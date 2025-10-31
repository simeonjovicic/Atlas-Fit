<template>
  <ion-app>
    <HeaderNav v-if="showNavigation" />
    
    <!-- Settings Side Menu -->
    <ion-menu side="end" content-id="main-content" menu-id="settings-menu">
      <ion-header>
        <ion-toolbar class="custom-test">
          <ion-title>Einstellungen</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeSettingsMenu">
              <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="settings-content">
        <ion-list class="settings-list notification-section">
          <ion-item-divider>
            <ion-label>Benachrichtigungen</ion-label>
          </ion-item-divider>
          <ion-item>
            <ion-label>Benachrichtigungen</ion-label>
            <ion-toggle v-model="notificationsEnabled" @ionChange="saveSetting"></ion-toggle>
          </ion-item>
        </ion-list>
        
        <ion-list class="settings-list account-section" v-if="currentUser">
          <ion-item-divider>
            <ion-label>Account</ion-label>
          </ion-item-divider>
          <ion-item button @click="handleLogout" detail>
            <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
            <ion-label>Abmelden</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>
    
    <ion-router-outlet id="main-content"></ion-router-outlet>
    <FooterNav v-if="showNavigation" />
  </ion-app>
</template>

<script>
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, 
         IonTitle, IonContent, IonList, IonItem, IonLabel, IonToggle,
         IonButtons, IonButton, IonIcon, IonItemDivider, alertController } from "@ionic/vue";
import { closeOutline, logOutOutline } from "ionicons/icons";
import { menuController } from "@ionic/vue";
import FooterNav from "./components/FooterNav.vue";
import HeaderNav from "./components/HeaderNav.vue";
import { defineComponent, onMounted, ref, watch, computed } from "vue";
import { NotificationService } from "./components/NotificationService";
import router from "./router";
import { authService } from "./services/authService";

export default defineComponent({
  name: "App",
  components: {
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonButtons,
    IonButton,
    IonIcon,
    IonItemDivider,
    FooterNav,
    HeaderNav
  },
  setup() {
    const isFirstLaunch = ref(true);
    const notificationsEnabled = ref(false);
    const currentUser = ref(null);
    const currentRoute = ref(router.currentRoute.value.path);
    
    // Computed property to determine if navigation should be shown
    const showNavigation = computed(() => {
      const publicRoutes = ['/login', '/register', '/welcome'];
      const isPublicRoute = publicRoutes.includes(currentRoute.value);
      return !isPublicRoute && currentUser.value !== null;
    });

    const saveSetting = () => {
      localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled.value));
    };

    // Check first launch status
    const checkFirstLaunchStatus = () => {
      const firstLaunch = localStorage.getItem('firstLaunch') !== 'false';
      isFirstLaunch.value = firstLaunch;
      return firstLaunch;
    };

    const closeSettingsMenu = async () => {
      await menuController.close('settings-menu');
    };
    
    // Logout user
    const handleLogout = async () => {
      const alert = await alertController.create({
        header: 'Abmelden?',
        message: 'Möchtest du dich wirklich abmelden?',
        buttons: [
          {
            text: 'Abbrechen',
            role: 'cancel',
          },
          {
            text: 'Abmelden',
            role: 'confirm',
            handler: async () => {
              try {
                await authService.logout();
                await closeSettingsMenu();
                router.replace('/login');
              } catch (error) {
                console.error('Logout error:', error);
              }
            },
          },
        ],
      });

      await alert.present();
    };

    onMounted(async () => {
      // Set up authentication state observer
      authService.onAuthChange(async (user) => {
        currentUser.value = user;
        console.log('Auth state changed:', user ? user.email : 'No user');
        
        // If user logged in, run migration
        if (user) {
          try {
            const { migrationService } = await import('@/services/migrationService');
            const migrationCompleted = await migrationService.isMigrationCompleted();
            if (!migrationCompleted) {
              console.log('Running data migration...');
              await migrationService.runAllMigrations();
            }
          } catch (error) {
            console.error('Migration failed:', error);
            // Continue app execution even if migration fails
          }
        }
        
        // If user logged out, redirect to login
        if (!user && router.currentRoute.value.meta.requiresAuth) {
          router.replace('/login');
        }
      });

      // Initialize notification service when app starts
      await NotificationService.initialize();
      
      // Redirect to login if not authenticated
      if (!authService.getCurrentUser() && router.currentRoute.value.path !== '/login' && router.currentRoute.value.path !== '/register') {
        router.replace('/login');
      }

      // Load saved notification settings
      const storedValue = localStorage.getItem('notificationsEnabled');
      if (storedValue !== null) {
        notificationsEnabled.value = JSON.parse(storedValue);
      }
    });

    // Watch for route changes to update header/footer visibility
    watch(
      () => router.currentRoute.value.path,
      (newPath) => {
        currentRoute.value = newPath;
        // Recheck first launch status after navigation
        checkFirstLaunchStatus();
      }
    );

    return {
      isFirstLaunch,
      showNavigation,
      closeOutline,
      logOutOutline,
      closeSettingsMenu,
      notificationsEnabled,
      saveSetting,
      handleLogout,
      currentUser
    };
  }
});
</script>

<style>
.custom-test{
  padding-top: 24px;
}

ion-toggle{
 padding-left: 40px;
}

ion-menu.md ion-item {
  --padding-start: 16px;
  --inner-padding-end: 16px;
  border-radius: 4px;
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --inner-padding-end: 16px;
}

.settings-content {
  --padding-top: 16px;
  --padding-bottom: 16px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.settings-list {
  border-radius: 10px;
  overflow: hidden;
}

.account-section {
  margin-top: 30px;
}

ion-item-divider {
  --padding-start: 16px;
  font-weight: 500;
  letter-spacing: .4px;
  font-size: 0.9rem;
}

</style>