<template>
  <ion-footer v-if="!$route.meta.hideGlobalHeader">
    <ion-toolbar>
      <ion-grid>
        <ion-row class="ion-justify-content-around">
          <ion-col class="ion-text-center">
            <ion-button :fill="isActive('/home')" :color="getColor('/home')" @click="$router.push('/home')">
              <ion-icon :icon="homeOutline"></ion-icon>
            </ion-button>
          </ion-col>
          <ion-col class="ion-text-center">
            <ion-button :fill="isActive('/history')" :color="getColor('/history')" @click="$router.push('/history')">
              <ion-icon :icon="statsChartOutline"></ion-icon>
            </ion-button>
          </ion-col>
          <ion-col class="ion-text-center">
            <ion-button :fill="isActive('/createWorkout')" :color="getColor('/createWorkout')" @click="$router.push('/createWorkout')">
              <ion-icon :icon="addCircleOutline"></ion-icon>
            </ion-button>
          </ion-col>
          <ion-col class="ion-text-center">
            <ion-button :fill="isActive('/workouts')" :color="getColor('/workouts')" @click="$router.push('/workouts')">
              <ion-icon :icon="barbellOutline"></ion-icon>
            </ion-button>
          </ion-col>
          <ion-col class="ion-text-center">
            <ion-button :fill="isActive('/profile')" :color="getColor('/profile')" @click="$router.push('/profile')">
              <ion-icon :icon="personOutline"></ion-icon>
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-toolbar>
  </ion-footer>
</template>

<script>
import { IonFooter, IonToolbar, IonGrid, IonRow, IonCol, IonButton, IonIcon } from "@ionic/vue";
import { homeOutline, personOutline, addCircleOutline, statsChartOutline, barbellOutline } from "ionicons/icons";
import { useRoute } from "vue-router";

export default {
  components: {
    IonFooter,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon
  },
  setup() {
    const route = useRoute();

    const isActive = (path) => {
      return route.path === path ? "solid" : "clear"; // 'solid' when active, 'clear' when inactive
    };

    const getColor = (path) => {
      return route.path === path ? "light" : "medium"; // White when active, Gray when inactive
    };

    return {
      homeOutline,
      statsChartOutline,
      addCircleOutline,
      personOutline,
      barbellOutline,
      isActive,
      getColor
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
