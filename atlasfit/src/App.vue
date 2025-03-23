<template>
  <ion-app>
    <HeaderNav v-if="!isFirstLaunch" />
    
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
      </ion-content>
    </ion-menu>
    
    <ion-router-outlet id="main-content"></ion-router-outlet>
    <FooterNav v-if="!isFirstLaunch" />
  </ion-app>
</template>

<script>
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, 
         IonTitle, IonContent, IonList, IonItem, IonLabel, IonToggle,
         IonButtons, IonButton, IonIcon, IonItemDivider, alertController } from "@ionic/vue";
import { closeOutline, downloadOutline, trashOutline } from "ionicons/icons";
import { menuController } from "@ionic/vue";
import FooterNav from "./components/FooterNav.vue";
import HeaderNav from "./components/HeaderNav.vue";
import { defineComponent, onMounted, ref, watch } from "vue";
import { NotificationService } from "./components/NotificationService";
import router from "./router";

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

    onMounted(async () => {
      // Initialize notification service when app starts
      await NotificationService.initialize();
      
      // Check if this is the first launch
      const firstLaunch = checkFirstLaunchStatus();
      
      // Redirect to welcome page if first launch
      if (firstLaunch) {
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
      () => {
        // Recheck first launch status after navigation
        checkFirstLaunchStatus();
      }
    );

    return {
      isFirstLaunch,
      closeOutline,
      downloadOutline,
      trashOutline,
      closeSettingsMenu,
      notificationsEnabled,
      saveSetting,
      exportAllData,
      showClearDataConfirm
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