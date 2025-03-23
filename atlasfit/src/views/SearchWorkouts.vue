<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="custom-toolbar">
        <ion-title class="custom-title">Search Workouts</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen="true" class="ion-padding-bottom">
      <ion-searchbar
        v-model="searchQuery"
        debounce="500"
        @ionInput="filterExercises"
        placeholder="Search exercises..."
      ></ion-searchbar>

      <ion-segment v-model="filterType" @ionChange="filterExercises">
        <ion-segment-button value="all">
          <ion-label>All</ion-label>
        </ion-segment-button>
        <ion-segment-button value="saved">
          <ion-label>Saved</ion-label>
        </ion-segment-button>
      </ion-segment>

      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size="12" size-md="8" size-lg="6">
            <ion-list class="custom-list">
              <template v-for="(exercises, letter) in groupedExercises" :key="letter">
                <ion-item-divider class="letter-divider">{{ letter }}</ion-item-divider>
                
                <template v-for="(exercise, index) in exercises" :key="exercise.name">
                  <ion-item class="custom-item" @click="openModal(exercise)">
                    <ion-label>
                      <h2 class="exercise-title">{{ exercise.name }}</h2>
                      <p class="muscle-name"><strong>{{ exercise.muscle }}</strong></p>
                    </ion-label>
                    <ion-icon
                      :icon="exercise.saved ? bookmarkSharp : bookmarkOutline"
                      slot="end"
                      class="bookmark-icon"
                      @click.stop="toggleBookmark(exercise)"
                    ></ion-icon>
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
    <ion-modal :is-open="isOpen" @willDismiss="closeModal" class="exercise-modal">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="closeModal()">
              <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>Exercise Details</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="toggleBookmark(selectedExercise)">
              <ion-icon :icon="selectedExercise?.saved ? bookmarkSharp : bookmarkOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding-bottom">
        <div class="exercise-header">
          <h1 class="exercise-name">{{ selectedExercise?.name }}</h1>
          <div class="exercise-muscle-badge">{{ selectedExercise?.muscle }}</div>
        </div>

        <div class="exercise-stats">
          <div class="stat-item">
            <ion-icon :icon="barbellOutline" class="stat-icon"></ion-icon>
            <div class="stat-label">Type</div>
            <div class="stat-value">{{ selectedExercise?.type }}</div>
          </div>
          <div class="stat-item">
            <ion-icon :icon="fitnessOutline" class="stat-icon"></ion-icon>
            <div class="stat-label">Muscle</div>
            <div class="stat-value">{{ selectedExercise?.muscle }}</div>
          </div>
          <div class="stat-item">
            <ion-icon :icon="constructOutline" class="stat-icon"></ion-icon>
            <div class="stat-label">Equipment</div>
            <div class="stat-value">{{ selectedExercise?.equipment }}</div>
          </div>
          <div class="stat-item">
            <ion-icon :icon="speedometerOutline" class="stat-icon"></ion-icon>
            <div class="stat-label">Difficulty</div>
            <div class="stat-value">{{ selectedExercise?.difficulty }}</div>
          </div>
        </div>

        <div class="instructions-section">
          <h2 class="section-title">
            <ion-icon :icon="documentTextOutline" class="section-icon"></ion-icon>
            Instructions
          </h2>
          <p class="instructions-text">{{ selectedExercise?.instructions }}</p>
        </div>

        <div class="recommendations-section">
          <h2 class="section-title">
            <ion-icon :icon="flameOutline" class="section-icon"></ion-icon>
            Recommended Sets & Reps
          </h2>
          <div class="recommendation-list">
            <div class="recommendation-item">
              <div class="recommendation-label">Beginner</div>
              <div class="recommendation-value">{{ selectedExercise?.recommendations.beginner }}</div>
            </div>
            <div class="recommendation-item">
              <div class="recommendation-label">Intermediate</div>
              <div class="recommendation-value">{{ selectedExercise?.recommendations.intermediate }}</div>
            </div>
            <div class="recommendation-item">
              <div class="recommendation-label">Advanced</div>
              <div class="recommendation-value">{{ selectedExercise?.recommendations.advanced }}</div>
            </div>
          </div>
        </div>
      </ion-content>
    </ion-modal>
    <div class="navbar-spacer"></div>
  </ion-page>
</template>

<script>
import { ref, computed, watch } from "vue";
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
  IonIcon,
  IonSegment,
  IonSegmentButton,
} from "@ionic/vue";
import exercisesData from "@/resources/exercises.json";

import { 
  arrowBackOutline, 
  closeOutline,
  bookmarkOutline,
  bookmarkSharp,
  barbellOutline,
  fitnessOutline,
  constructOutline,
  speedometerOutline,
  documentTextOutline,
  flameOutline
} from "ionicons/icons";

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
    IonIcon,
    IonSegment,
    IonSegmentButton,
  },
  setup() {
    const searchQuery = ref("");
    const exercises = ref(exercisesData);
    const loading = ref(false);
    const errorMessage = ref("");
    const isOpen = ref(false);
    const selectedExercise = ref(null);
    const filterType = ref("all");

    const filteredExercises = computed(() => {
      let filtered = exercises.value;

      // Filter by search query
      if (searchQuery.value.trim()) {
        filtered = filtered.filter((exercise) =>
          exercise.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      }

      // Filter by saved status
      if (filterType.value === "saved") {
        filtered = filtered.filter((exercise) => exercise.saved);
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

    const toggleBookmark = (exercise) => {
      if (!exercise) return;

      // Toggle the saved state
      exercise.saved = !exercise.saved;

      // Find the exercise in the original data and update it
      const index = exercises.value.findIndex(e => e.name === exercise.name);
      if (index !== -1) {
        exercises.value[index].saved = exercise.saved;
      }

      // Here you would typically save the updated state to localStorage or a database
      // For example:
      localStorage.setItem('savedExercises', JSON.stringify(exercises.value));
    };

    const filterExercises = () => {
      // This function is called when the search input changes or the segment changes
      // The filtering logic is handled by the computed property
    };

    // Optional: Load saved state from localStorage on component creation
    const loadSavedState = () => {
      const savedData = localStorage.getItem('savedExercises');
      if (savedData) {
        exercises.value = JSON.parse(savedData);
      }
     };
     
    loadSavedState();

    return { 
      searchQuery, 
      groupedExercises, 
      loading, 
      errorMessage, 
      isOpen, 
      selectedExercise, 
      openModal, 
      closeModal, 
      toggleBookmark,
      filterType,
      filterExercises,
      arrowBackOutline,
      closeOutline,
      bookmarkOutline,
      bookmarkSharp,
      barbellOutline,
      fitnessOutline,
      constructOutline,
      speedometerOutline,
      documentTextOutline,
      flameOutline
    };
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
  color: var(--ion-color-dark); /* Ensure text color is visible */
}

.muscle-name {
  text-transform: capitalize;
  color: var(--ion-color-medium); /* Ensure text color is visible */
}

.custom-list {
  background: var(--ion-background-color); /* Use theme background color */
}

.custom-item {
  --background: var(--ion-background-color); /* Use theme background color */
  color: var(--ion-text-color); /* Ensure text color is visible */
}

.letter-divider {
  border-bottom: none;
  font-size: 2.4em;
  font-weight: bold;
  background: transparent;
  color: var(--ion-text-color); /* Ensure text color is visible */
  padding: 8px 16px;
}

.group-padding {
  padding: 10px;
}

.bookmark-icon {
  font-size: 1.4em;
  color: var(--ion-color-primary); /* Use theme primary color */
}

/* Modal specific styles */
.exercise-modal {
  --height: 85%;
  --width: 100%;
  --border-radius: 16px 16px 0 0;
  --box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
}

.exercise-header {
  padding: 16px 16px 0;
  margin-bottom: 16px;
}

.exercise-name {
  font-size: 2em;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--ion-color-dark); /* Ensure text color is visible */
}

.exercise-muscle-badge {
  display: inline-block;
  background-color: var(--ion-color-primary); /* Use theme primary color */
  color: white;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9em;
  text-transform: uppercase;
}

.exercise-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 0 16px 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: var(--ion-color-light); /* Use theme light color */
  border-radius: 12px;
  padding: 16px;
}

.stat-icon {
  font-size: 1.6em;
  color: var(--ion-color-primary); /* Use theme primary color */
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.9em;
  color: var(--ion-color-medium); /* Ensure text color is visible */
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.1em;
  font-weight: 600;
  color: var(--ion-color-dark); /* Ensure text color is visible */
  text-transform: capitalize;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.4em;
  font-weight: 600;
  color: var(--ion-color-dark); /* Ensure text color is visible */
  margin: 0 0 16px 0;
}

.section-icon {
  margin-right: 8px;
  font-size: 1.2em;
  color: var(--ion-color-primary); /* Use theme primary color */
}

.instructions-section {
  padding: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.instructions-text {
  font-size: 1.1em;
  line-height: 1.6;
  color: var(--ion-color-dark); /* Ensure text color is visible */
}

.recommendations-section {
  padding: 0 16px 16px;
  margin-bottom: 16px;
}

.recommendation-list {
  background-color: var(--ion-color-light); /* Use theme light color */
  border-radius: 12px;
  overflow: hidden;
}

.recommendation-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.navbar-spacer {
  height: 56px; /* Adjust this value to match your navbar's height */
}

.recommendation-item:last-child {
  border-bottom: none;
}

.recommendation-label {
  font-weight: 600;
  color: var(--ion-color-dark); /* Ensure text color is visible */
}

.recommendation-value {
  color: var(--ion-color-medium); /* Ensure text color is visible */
}

.action-buttons {
  padding: 0 16px 24px;
}

ion-button {
  margin-bottom: 12px;
  height: 48px;
  font-weight: 600;
  --border-radius: 12px;
}

.watch-button {
  --background: var(--ion-color-light);
  --color: var(--ion-color-dark);
}
.custom-toolbar{
  padding-top: 24px;
}
</style>