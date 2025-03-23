<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-label>Enable Notifications</ion-label>
          <ion-toggle v-model="notificationsEnabled" @ionChange="saveSetting"></ion-toggle>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonToggle } from '@ionic/vue';

const notificationsEnabled = ref(false);

const saveSetting = () => {
  localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled.value));
};

onMounted(() => {
  const storedValue = localStorage.getItem('notificationsEnabled');
  if (storedValue !== null) {
    notificationsEnabled.value = JSON.parse(storedValue);
  }
});
</script>

<style scoped>
</style>
