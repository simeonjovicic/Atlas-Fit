<template>
  <ion-app>
    <HeaderNav v-if="!isFirstLaunch" />
    <ion-router-outlet></ion-router-outlet>
    <FooterNav v-if="!isFirstLaunch" />
  </ion-app>
</template>

<script>
import { IonApp, IonRouterOutlet } from "@ionic/vue";
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
    FooterNav,
    HeaderNav
  },
  setup() {
    const isFirstLaunch = ref(true);

    // Check first launch status
    const checkFirstLaunchStatus = () => {
      const firstLaunch = localStorage.getItem('firstLaunch') !== 'false';
      isFirstLaunch.value = firstLaunch;
      return firstLaunch;
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
      isFirstLaunch
    };
  }
});
</script>