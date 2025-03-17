<template>
  <ion-app>
    <ion-router-outlet></ion-router-outlet>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>My App</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <router-view />
      </ion-content>

      <FooterNav />
    </ion-page>
  </ion-app>
</template>

<script>
import { IonApp, IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonRouterOutlet } from "@ionic/vue";
import FooterNav from "./components/FooterNav.vue";
import { defineComponent } from "vue";

export default defineComponent ({
  name:'App',
  components: {
    IonApp,
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonRouterOutlet,
    FooterNav
  }
});
</script>
