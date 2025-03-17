<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Create Workout</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="create-workout-container">
        <!-- Button to create a new workout -->
        <ion-button @click="openWorkoutCreationModal">Create New Workout</ion-button>

        <!-- Display list of created workouts in a grid -->
        <div v-if="workouts.length > 0">
          <h3>Your Workouts:</h3>
          <ion-grid>
            <ion-row>
              <ion-col size="6" v-for="workout in workouts" :key="workout.id">
                <ion-card class="workout-card">
                  <ion-card-header>
                    <div class="workout-header">
                      <ion-card-title>{{ workout.name }}</ion-card-title>
                      <ion-button fill="clear" @click="openWorkoutOptionsPopover($event, workout)">
                        <ion-icon :icon="informationCircleOutline"></ion-icon>
                      </ion-button>
                    </div>
                    <ion-card-subtitle>{{ workout.exercises.length }} exercises</ion-card-subtitle>
                  </ion-card-header>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>
        <div v-else>
          <p>No workouts created yet.</p>
        </div>
      </div>

      <!-- First Modal: Create Workout -->
      <ion-modal :is-open="isWorkoutCreationModalOpen" @didDismiss="closeWorkoutCreationModal">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="closeWorkoutCreationModal"><ion-icon :icon="closeOutline"></ion-icon></ion-button>
            </ion-buttons>
            <ion-buttons slot="end">
              <ion-button @click="saveNewWorkout"><ion-icon :icon="checkmarkOutline"></ion-icon></ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <!-- Workout Name Input -->
          <ion-item>
            <ion-label position="stacked">Workout Name</ion-label>
            <ion-input v-model="newWorkoutName" placeholder="Enter workout name"></ion-input>
          </ion-item>

          <!-- Button to Add Exercises -->
          <ion-button expand="block" @click="openAddExercisesModal">Add Exercises</ion-button>

          <!-- List of Selected Exercises with Reps and Sets -->
          <ion-list>
            <ion-item v-for="(exercise, index) in selectedExercises" :key="index">
              <ion-label>
                <h3>{{ exercise.name }}</h3>
                <p>{{ exercise.muscle }} - {{ exercise.equipment }}</p>
              </ion-label>
              <ion-input
                type="number"
                placeholder="Reps"
                v-model="exercise.reps"
              ></ion-input>
              <ion-input
                type="number"
                placeholder="Sets"
                v-model="exercise.sets"
              ></ion-input>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-modal>

      <!-- Second Modal: Add Exercises -->
      <ion-modal :is-open="isAddExercisesModalOpen" @didDismiss="closeAddExercisesModal">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="closeAddExercisesModal"><ion-icon :icon="closeOutline"></ion-icon></ion-button>
            </ion-buttons>
            <ion-buttons slot="end">
              <ion-button @click="addSelectedExercises"><ion-icon :icon="checkmarkOutline"></ion-icon></ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            <ion-item v-for="exercise in exercises" :key="exercise.name">
              <ion-label>{{ exercise.name }}</ion-label>
              <ion-checkbox
                :checked="isExerciseSelected(exercise)"
                @ionChange="toggleExerciseSelection(exercise)"
              ></ion-checkbox>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-modal>

      <!-- Modal for viewing workout details -->
      <ion-modal :is-open="isWorkoutDetailsModalOpen" @didDismiss="closeWorkoutDetailsModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Workout Details</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeWorkoutDetailsModal">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div v-if="selectedWorkout">
            <h2>{{ selectedWorkout.name }}</h2>
            <ion-list>
              <ion-item v-for="(exercise, index) in selectedWorkout.exercises" :key="index">
                <ion-label>
                  <h3>{{ exercise.name }}</h3>
                  <p>{{ exercise.muscle }} - {{ exercise.equipment }}</p>
                  <p>Reps: {{ exercise.reps }}, Sets: {{ exercise.sets }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Popover for workout options -->
      <ion-popover
        :is-open="isWorkoutOptionsPopoverOpen"
        :event="popoverEvent"
        @didDismiss="closeWorkoutOptionsPopover"
        class="custom-popover"
      >
        <ion-content>
          <ion-list>
            <ion-item button @click="viewWorkoutDetails">
              <ion-label>View</ion-label>
            </ion-item>
            <ion-item button @click="deleteWorkout">
              <ion-label>Delete</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonModal,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonInput,
  IonButtons,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonPopover,
} from '@ionic/vue';
import exercises from '@/resources/exercises.json'; // Adjust the path to your JSON file
import { checkmarkOutline, closeOutline, informationCircleOutline } from 'ionicons/icons';

interface Exercise {
  name: string;
  type: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions: string;
  reps?: number; // Added for reps
  sets?: number; // Added for sets
}

interface Workout {
  id: number;
  name: string;
  exercises: Exercise[];
}

export default defineComponent({
  name: 'CreateWorkouts',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonModal,
    IonList,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonInput,
    IonButtons,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonPopover,
  },
  setup() {
    const isWorkoutCreationModalOpen = ref(false); // Controls the workout creation modal
    const isAddExercisesModalOpen = ref(false); // Controls the add exercises modal
    const isWorkoutDetailsModalOpen = ref(false); // Controls the workout details modal
    const isWorkoutOptionsPopoverOpen = ref(false); // Controls the workout options popover
    const popoverEvent = ref<Event | null>(null); // Stores the event for the popover
    const newWorkoutName = ref(''); // Stores the name of the new workout
    const selectedExercises = ref<Exercise[]>([]); // Stores selected exercises for the new workout
    const workouts = ref<Workout[]>([]); // Stores all created workouts
    const selectedWorkout = ref<Workout | null>(null); // Stores the currently selected workout for details
    let nextWorkoutId = 1; // Unique ID for each workout

    // Load workouts from JSON file (simulated using localStorage)
    const loadWorkouts = () => {
      const savedWorkouts = localStorage.getItem('workouts');
      if (savedWorkouts) {
        workouts.value = JSON.parse(savedWorkouts);
        nextWorkoutId = workouts.value.length > 0 ? Math.max(...workouts.value.map((w) => w.id)) + 1 : 1;
      }
    };

    // Save workouts to JSON file (simulated using localStorage)
    const saveWorkouts = () => {
      localStorage.setItem('workouts', JSON.stringify(workouts.value));
    };

    // Check if an exercise is selected
    const isExerciseSelected = (exercise: Exercise) => {
      return selectedExercises.value.some((e) => e.name === exercise.name);
    };

    // Toggle exercise selection
    const toggleExerciseSelection = (exercise: Exercise) => {
      if (isExerciseSelected(exercise)) {
        selectedExercises.value = selectedExercises.value.filter((e) => e.name !== exercise.name);
      } else {
        selectedExercises.value.push({ ...exercise, reps: 0, sets: 0 }); // Add reps and sets
      }
    };

    // Open the workout creation modal
    const openWorkoutCreationModal = () => {
      isWorkoutCreationModalOpen.value = true;
    };

    // Close the workout creation modal and reset form
    const closeWorkoutCreationModal = () => {
      isWorkoutCreationModalOpen.value = false;
      newWorkoutName.value = '';
      selectedExercises.value = [];
    };

    // Open the add exercises modal
    const openAddExercisesModal = () => {
      isAddExercisesModalOpen.value = true;
    };

    // Close the add exercises modal
    const closeAddExercisesModal = () => {
      isAddExercisesModalOpen.value = false;
    };

    // Add selected exercises to the workout
    const addSelectedExercises = () => {
      closeAddExercisesModal();
    };

    // Open the workout details modal
    const openWorkoutDetailsModal = (workout: Workout) => {
      selectedWorkout.value = workout;
      isWorkoutDetailsModalOpen.value = true;
    };

    // Close the workout details modal
    const closeWorkoutDetailsModal = () => {
      isWorkoutDetailsModalOpen.value = false;
      selectedWorkout.value = null;
    };

    // Open the workout options popover
    const openWorkoutOptionsPopover = (event: Event, workout: Workout) => {
      popoverEvent.value = event;
      selectedWorkout.value = workout;
      isWorkoutOptionsPopoverOpen.value = true;
    };

    // Close the workout options popover
    const closeWorkoutOptionsPopover = () => {
      isWorkoutOptionsPopoverOpen.value = false;
      popoverEvent.value = null;
    };

    // View workout details
    const viewWorkoutDetails = () => {
      if (selectedWorkout.value) {
        openWorkoutDetailsModal(selectedWorkout.value);
        closeWorkoutOptionsPopover();
      }
    };

    // Delete workout
    const deleteWorkout = () => {
      if (selectedWorkout.value) {
        workouts.value = workouts.value.filter((w) => w.id !== selectedWorkout.value!.id);
        saveWorkouts(); // Save updated workouts to localStorage
        closeWorkoutOptionsPopover();
      }
    };

    // Save the new workout
    const saveNewWorkout = () => {
      if (newWorkoutName.value.trim() && selectedExercises.value.length > 0) {
        const newWorkout: Workout = {
          id: nextWorkoutId++,
          name: newWorkoutName.value,
          exercises: selectedExercises.value,
        };
        workouts.value.push(newWorkout);
        saveWorkouts(); // Save workouts to JSON file (simulated)
        closeWorkoutCreationModal();
      } else {
        alert('Please enter a workout name and select at least one exercise.');
      }
    };

    // Load workouts when the component mounts
    onMounted(() => {
      loadWorkouts();
    });

    return {
      exercises,
      isWorkoutCreationModalOpen,
      isAddExercisesModalOpen,
      isWorkoutDetailsModalOpen,
      isWorkoutOptionsPopoverOpen,
      popoverEvent,
      newWorkoutName,
      selectedExercises,
      workouts,
      selectedWorkout,
      isExerciseSelected,
      toggleExerciseSelection,
      openWorkoutCreationModal,
      closeWorkoutCreationModal,
      openAddExercisesModal,
      closeAddExercisesModal,
      addSelectedExercises,
      openWorkoutDetailsModal,
      closeWorkoutDetailsModal,
      openWorkoutOptionsPopover,
      closeWorkoutOptionsPopover,
      viewWorkoutDetails,
      deleteWorkout,
      saveNewWorkout,
      closeOutline,
      checkmarkOutline,
      informationCircleOutline,
    };
  },
});
</script>

<style scoped>
.create-workout-container {
  padding: 16px;
}

.workout-card {
  background: transparent; /* Make the card transparent */
  border: 1px solid #ccc; /* Add a gray border */
  border-radius: 8px; /* Optional: Add rounded corners */
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.workout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

ion-card-header {
  padding-bottom: 0;
}

ion-card-title {
  font-size: 1.2rem;
  color: #ffffff; /* Ensure text is visible */
  margin: 0; /* Remove default margin */
}

ion-card-subtitle {
  font-size: 0.9rem;
  color: #666; /* Ensure text is visible */
}

ion-card-content {
  padding-top: 0;
}

ion-button {
  margin: 0; /* Remove default margin */
}

/* Custom styles for the popover */
.custom-popover {
  --width: 150px; /* Set the width of the popover */
  --height: auto; /* Let the height adjust to content */
}

.custom-popover ion-content {
  --padding-top: 8px; /* Reduce top padding */
  --padding-bottom: 8px; /* Reduce bottom padding */
}

.custom-popover ion-list {
  padding: 0; /* Remove default padding */
}

.custom-popover ion-item {
  --padding-start: 16px; /* Adjust item padding */
  --padding-end: 16px;
  --min-height: 40px; /* Reduce item height */
}
</style>