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
        
        <ion-list class="settings-list data-section">
          <ion-item-divider>
            <ion-label>Datenverwaltung</ion-label>
          </ion-item-divider>
          <ion-item button @click="exportAllData" detail>
            <ion-icon :icon="downloadOutline" slot="start"></ion-icon>
            <ion-label>Alle Daten exportieren</ion-label>
          </ion-item>
          <ion-item button @click="showClearDataConfirm" class="danger-item" detail>
            <ion-icon :icon="trashOutline" slot="start" color="danger"></ion-icon>
            <ion-label color="danger">Alle Daten löschen</ion-label>
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
import { closeOutline, downloadOutline, trashOutline, logOutOutline } from "ionicons/icons";
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
    
    // Export all localstorage data as JSON file
    const exportAllData = () => {
      // Collect all data from localStorage
      const exportData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          exportData[key] = JSON.parse(localStorage.getItem(key));
        } catch (e) {
          exportData[key] = localStorage.getItem(key);
        }
      }
      
      // Create and download the JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'app-data-export.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
    
    // Show confirmation before clearing data
    const showClearDataConfirm = async () => {
      const alert = await alertController.create({
        header: 'Alle Daten löschen?',
        message: 'Diese Aktion wird alle gespeicherten Daten unwiderruflich löschen. Die App wird auf den Ausgangszustand zurückgesetzt.',
        buttons: [
          {
            text: 'Abbrechen',
            role: 'cancel',
          },
          {
            text: 'Löschen',
            role: 'destructive',
            handler: clearAllData,
          },
        ],
      });

      await alert.present();
    };
    
    // Clear all data from localStorage
    const clearAllData = () => {
      localStorage.clear();
      isFirstLaunch.value = true;
      notificationsEnabled.value = false;
      router.replace('/welcome');
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
      authService.onAuthChange((user) => {
        currentUser.value = user;
        console.log('Auth state changed:', user ? user.email : 'No user');
        
        // If user logged out, redirect to login
        if (!user && router.currentRoute.value.meta.requiresAuth) {
          router.replace('/login');
        }
      });

      // Initialize notification service when app starts
      await NotificationService.initialize();
      
      // Check if this is the first launch
      const firstLaunch = checkFirstLaunchStatus();
      
      // Redirect to welcome page if first launch and no user
      if (firstLaunch && !authService.getCurrentUser()) {
        router.replace('/welcome');
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
      downloadOutline,
      trashOutline,
      logOutOutline,
      closeSettingsMenu,
      notificationsEnabled,
      saveSetting,
      exportAllData,
      showClearDataConfirm,
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

.data-section {
  margin-top: 30px;
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

.danger-item {
  margin-bottom: 4px;
}
</style>