<template>
  <ion-header v-if="!$route.meta.hideGlobalHeader" class="custom-header">
    <ion-toolbar class="custom-header">
      <ion-buttons slot="end">
        <ion-button @click="goToSettings">
          <ion-icon :icon="settingsOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script>
import { defineComponent } from "vue";
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon } from "@ionic/vue";
import { settingsOutline } from "ionicons/icons";
import { useRouter } from "vue-router";

export default defineComponent({
  components: { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon },
  setup() {
    const router = useRouter();

    const goToSettings = () => {
      router.push("/settings");
    };

    return { settingsOutline, goToSettings };
  },
});
</script>

<style scoped>
.custom-header {
  --ion-toolbar-background: transparent; /* Makes toolbar transparent */
  box-shadow: none; /* Removes shadow */
  height: calc(56px + env(safe-area-inset-top)); /* Adjust height dynamically */
  padding-top: env(safe-area-inset-top); /* Ensures status bar is considered */
}


</style>
