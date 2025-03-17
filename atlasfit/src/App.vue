<template>
  <ion-app>
    <HeaderNav />
    <ion-router-outlet></ion-router-outlet>
    <FooterNav />
  </ion-app>
</template>

<script>
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import FooterNav from "./components/FooterNav.vue";
import HeaderNav from "./components/HeaderNav.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  components: {
    IonApp,
    IonRouterOutlet,
    FooterNav,
    HeaderNav
  }
});
</script>
