<template>
  <ion-header v-if="!$route.meta.hideGlobalHeader" class="custom-header">
    <ion-toolbar class="custom-header">
      <ion-buttons slot="end">
        <ion-button @click="openSettingsMenu">
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
import { menuController } from "@ionic/vue";

export default defineComponent({
  components: { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon },
  setup() {
    const openSettingsMenu = async () => {
      await menuController.open('settings-menu');
    };
    
    return { settingsOutline, openSettingsMenu };
  },
});
</script>

<style scoped>
.custom-header {
  --ion-toolbar-background: transparent; /* Makes toolbar transparent */
  box-shadow: none; /* Removes shadow */
  padding-top: 12px;
}
</style>