<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>Search Workouts</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content>
        <ion-searchbar v-model="searchQuery" debounce="500" @ionInput="fetchExercises" placeholder="Search exercises..."></ion-searchbar>
  
        <ion-list>
          <ion-item v-for="exercise in exercises" :key="exercise.name">
            <ion-label>
              <h2 class="exercise-title">{{ exercise.name }}</h2>
              <p class="muscle-name"><strong>{{ exercise.muscle }}</strong></p>
            </ion-label>
          </ion-item>
        </ion-list>
  
        <ion-spinner v-if="loading"></ion-spinner>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </ion-content>
    </ion-page>
  </template>
  
  <script>
  import { ref } from "vue";
  import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonList, IonItem, IonLabel, IonSpinner } from "@ionic/vue";
  import axios from "axios";
  
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
    },
    setup() {
      const searchQuery = ref("");
      const exercises = ref([]);
      const loading = ref(false);
      const errorMessage = ref("");
  
      const fetchExercises = async () => {
        if (!searchQuery.value.trim()) {
          exercises.value = [];
          return;
        }
  
        loading.value = true;
        errorMessage.value = "";
  
        try {
          const response = await axios.get("https://api.api-ninjas.com/v1/exercises", {
            params: { name: searchQuery.value },
            headers: { "X-Api-Key": "N77p08xdC6V3g5J4QXigMA==Pj9uI6NTp05N90aj" },
          });
  
          exercises.value = response.data;
        } catch (error) {
          errorMessage.value = "Failed to fetch exercises. Please try again.";
          console.error(error);
        } finally {
          loading.value = false;
        }
      };
  
      return { searchQuery, exercises, loading, errorMessage, fetchExercises };
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
  
  ion-label p {
    font-size: 1em;
  }

  .muscle-name {
    text-transform: capitalize;
  }

  </style>
  