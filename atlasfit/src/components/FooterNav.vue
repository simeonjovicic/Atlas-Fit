<template>
    <ion-footer>
      <ion-toolbar>
        <ion-grid>
          <ion-row class="ion-justify-content-around">
            <ion-col class="ion-text-center">
              <ion-button fill="clear" @click="$router.push('/home')">
                <ion-icon :icon="homeOutline"></ion-icon>
              </ion-button>
            </ion-col>
            <ion-col class="ion-text-center">
              <ion-button fill="clear" @click="$router.push('/statistic')">
                <ion-icon :icon="statsChartOutline"></ion-icon>
              </ion-button>
            </ion-col>
            <ion-col class="ion-text-center">
              <ion-button fill="clear" @click="$router.push('/creatWorkout')">
                <ion-icon :icon="addCircleOutline"></ion-icon>
              </ion-button>
            </ion-col>
            <ion-col class="ion-text-center">
              <ion-button fill="clear" @click="$router.push('/workouts')">
                <ion-icon :icon="barbellOutline"></ion-icon>
              </ion-button>
            </ion-col>
            <ion-col class="ion-text-center">
              <ion-button fill="clear" @click="$router.push('/profile')">
                <ion-icon :icon="personOutline"></ion-icon>
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-toolbar>
    </ion-footer>
  </template>
  
  <script>
  import { IonFooter, IonToolbar, IonGrid, IonRow, IonCol, IonButton, IonIcon } from '@ionic/vue';
  import { homeOutline, personOutline, addCircleOutline, analyticsOutline, statsChartOutline, barbellOutline } from 'ionicons/icons';
  
  export default {
    components: {
      IonFooter, IonToolbar, IonGrid, IonRow, IonCol, IonButton, IonIcon
    },
    data() {
      return {
        homeOutline,
        analyticsOutline,
        addCircleOutline,
        personOutline,
        barbellOutline,
        statsChartOutline
      };
    }
  };
  </script>
  
  <style scoped>
  ion-footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: var(--ion-color-light);
  }
  </style>
  