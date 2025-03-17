<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Search Workouts</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen="true" class="ion-padding-bottom">
      <ion-searchbar
        v-model="searchQuery"
        debounce="500"
        @ionInput="filterExercises"
        placeholder="Search exercises..."
      ></ion-searchbar>

      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size="12" size-md="8" size-lg="6">
            <ion-list class="custom-list">
              <template v-for="(exercises, letter) in groupedExercises" :key="letter">
                <ion-item-divider class="letter-divider">{{ letter }}</ion-item-divider>
                
                <template v-for="(exercise, index) in exercises" :key="exercise.name">
                  <ion-item 
                    class="custom-item" 
                    @click="openModal(exercise)"
                  >
                    <ion-label>
                      <h2 class="exercise-title">{{ exercise.name }}</h2>
                      <p class="muscle-name"><strong>{{ exercise.muscle }}</strong></p>
                    </ion-label>
                  </ion-item>
                  <div v-if="index === exercises.length - 1" class="group-padding"></div>
                </template>
              </template>
            </ion-list>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-spinner v-if="loading"></ion-spinner>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </ion-content>

    <!-- Modal to show exercise details -->
    <ion-modal :is-open="isOpen" @willDismiss="closeModal">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="closeModal()">
              <ion-icon :icon="arrowBackOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>{{ selectedExercise?.name }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding">
        <ion-item class="modal-item">
          <ion-label class="modal-label">
            <h2>{{ selectedExercise?.name }}</h2>
            <p class="modal-type"><strong>Type:</strong> {{ selectedExercise?.type }}</p>
            <p class="modal-muscle"><strong>Muscle:</strong> {{ selectedExercise?.muscle }}</p>
            <p class="modal-equipment"><strong>Equipment:</strong> {{ selectedExercise?.equipment }}</p>
            <p class="modal-difficulty"><strong>Difficulty:</strong> {{ selectedExercise?.difficulty }}</p>
            <p class="modal-instructions"><strong>Instructions:</strong></p>
            <p>{{ selectedExercise?.instructions }}</p>
          </ion-label>
        </ion-item>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script>
import { ref, computed } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonItemDivider,
  IonModal,
  IonButton,
  IonButtons,
} from "@ionic/vue";
import exercisesData from "@/resources/exercises.json";
import { arrowBackOutline } from "ionicons/icons";

export default {
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonItemDivider,
    IonModal,
    IonButton,
    IonButtons
  },
  setup() {
    const searchQuery = ref("");
    const exercises = ref(exercisesData);
    const loading = ref(false);
    const errorMessage = ref("");
    const isOpen = ref(false);
    const selectedExercise = ref(null);

    const filteredExercises = computed(() => {
      let filtered = exercises.value;

      if (searchQuery.value.trim()) {
        filtered = exercises.value.filter((exercise) =>
          exercise.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      }

      return filtered.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
    });

    const groupedExercises = computed(() => {
      return filteredExercises.value.reduce((groups, exercise) => {
        const firstLetter = exercise.name.charAt(0).toUpperCase();
        if (!groups[firstLetter]) {
          groups[firstLetter] = [];
        }
        groups[firstLetter].push(exercise);
        return groups;
      }, {});
    });

    const openModal = (exercise) => {
      selectedExercise.value = exercise;
      isOpen.value = true;
    };

    const closeModal = () => {
      isOpen.value = false;
    };

    return { searchQuery, groupedExercises, loading, errorMessage, isOpen, selectedExercise, openModal, closeModal, arrowBackOutline };
  },
};
</script>

<style scoped>
.error-message {
  color: red;
  text-align: center;
}

.exercise-title {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 5px;
}

.muscle-name {
  text-transform: capitalize;
}

.custom-list {
  background: var(--ion-background-color);
}

.custom-item {
  --background: var(--ion-background-color);
  color: var(--ion-text-color);
}

.letter-divider {
  border-bottom: none;
  font-size: 2.4em;
  font-weight: bold;
  background: transparent;
  color: var(--ion-text-color);
  padding: 8px 16px;
}

.group-padding {
  padding: 10px;
}

/* Styling for the modal content */
.modal-item {
  padding: 16px;
  background: var(--ion-background-color);
}

.modal-label {
  font-size: 1.2em;
}

.modal-type,
.modal-muscle,
.modal-equipment,
.modal-difficulty {
  font-size: 1.1em;
  margin-top: 12px;
}

.modal-instructions {
  font-size: 1.1em;
  margin-top: 16px;
}

h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 10px;
}

ion-button {
  margin-left: 0;
}

ion-icon {
  font-size: 1.5em;
}

</style>
