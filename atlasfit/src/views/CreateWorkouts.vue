<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="custom-toolbar">
        <ion-title>Create Workout</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="create-workout-container">
        <!-- Button to create a new workout -->
        <ion-button expand="block" class="create-button" @click="openWorkoutCreationModal">
          Create New Workout
        </ion-button>

        <!-- Display list of created workouts -->
        <div v-if="workouts.length > 0" class="workouts-list">
          <h3>Your Workouts:</h3>
          <ion-grid>
            <ion-row>
              <ion-col size="6" v-for="workout in workouts" :key="workout.id">
                <ion-card class="workout-card" @click="openWorkoutDetailsModal(workout)">
                  <ion-card-header>
                    <div class="workout-header">
                      <ion-card-title>{{ workout.name }}</ion-card-title>
                      <ion-button fill="clear" @click.stop="openWorkoutOptionsPopover($event, workout)">
                        <ion-icon :icon="ellipsisVertical"></ion-icon>
                      </ion-button>
                    </div>
                    <ion-card-subtitle>{{ workout.exercises.length }} exercises</ion-card-subtitle>
                  </ion-card-header>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>
        <div v-else class="no-workouts-message">
          <p>No workouts created yet.</p>
        </div>
      </div>

      <!-- First Modal: Create Workout -->
      <ion-modal :is-open="isWorkoutCreationModalOpen" @didDismiss="closeWorkoutCreationModal" class="workout-modal">
        <ion-header>
          <ion-toolbar class="custom-newworkout-toolbar">
            <ion-buttons slot="start">
              <ion-button @click="closeWorkoutCreationModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
            <ion-title>New workout</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="saveNewWorkout" :disabled="!canSaveWorkout">
                <ion-icon :icon="checkmarkOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
  <!-- Workout Name Input -->
  <div class="workout-form">
    <ion-item lines="none" class="name-input">
      <ion-input v-model="newWorkoutName" placeholder="New template" class="template-name"></ion-input>
    </ion-item>

    <!-- Button to Add Exercises -->
    <ion-button expand="block" class="add-exercise-btn" @click="openAddExercisesModal">
      ADD EXERCISE
    </ion-button>

    <!-- List of Selected Exercises with Reps, Sets, and Rest -->
    <div v-if="selectedExercises.length > 0" class="exercises-list">
      <div v-for="(exercise, index) in selectedExercises" :key="index" class="exercise-item">
        <ion-item lines="none" class="exercise-header">
          <ion-label>
            <h2>{{ exercise.name }}</h2>
            <p>{{ exercise.muscle }} - {{ exercise.equipment }}</p>
          </ion-label>
          <ion-buttons slot="end">
            <ion-button @click="removeExercise(index)">
              <ion-icon :icon="trashOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-item>

        <div class="sets-container">
          <div class="sets-header">
            <div class="set-col">SET</div>
            <div class="previous-col">PREVIOUS</div>
            <div class="weight-col">(+KG)</div>
            <div class="reps-col">REPS</div>
            <div class="lock-col"></div>
          </div>

          <!-- Sets rows -->
          <div v-for="(set, setIndex) in exercise.sets" :key="`${index}-${setIndex}`">
            <div class="set-row">
              <div class="set-col">{{ setIndex + 1 }}</div>
              <div class="previous-col">—</div>
              <div class="weight-col">
                <ion-input type="number" v-model="set.weight" class="weight-input"></ion-input>
              </div>
              <div class="reps-col">
                <ion-input type="number" v-model="set.reps" class="reps-input"></ion-input>
              </div>
              <div class="lock-col">
                <ion-icon :icon="lockClosedOutline" v-if="set.locked"></ion-icon>
              </div>
            </div>
          </div>

          <!-- Single Rest Timer for the entire exercise -->
          <div class="rest-timer-container">
            <div class="rest-timer-label">Rest between sets:</div>
            <ion-range v-model="exercise.restTime" :min="0" :max="300" :step="5" class="rest-slider">
              <div slot="start">0:00</div>
              <div class="timer-display" slot="end">{{ formatTime(exercise.restTime) }}</div>
            </ion-range>
          </div>

          <ion-button expand="block" class="add-set-btn" @click="addSet(exercise)">
            ADD SET
          </ion-button>
        </div>
      </div>
    </div>
  </div>
</ion-content>
      </ion-modal>

      <!-- Second Modal: Add Exercises -->
      <ion-modal :is-open="isAddExercisesModalOpen" @didDismiss="closeAddExercisesModal" class="exercises-modal">
        <ion-header>
          <ion-toolbar class="custom-addexercises-toolbar">
            <ion-buttons slot="start">
              <ion-button @click="closeAddExercisesModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
            <ion-title>Add Exercise</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="confirmSelectedExercises">
                <ion-icon :icon="checkmarkOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-searchbar placeholder="Search exercises" v-model="exerciseSearchTerm" class="exercise-search"></ion-searchbar>
          
          <ion-list class="exercises-list">
           
            <ion-item 
  v-for="exercise in filteredExercises" 
  :key="exercise.name" 
  class="exercise-item"
  @click="toggleExerciseSelection(exercise)"
  button
>
  <ion-label class="exercise-label">
    <h2>{{ exercise.name }}</h2>
    <p>{{ exercise.muscle }} - {{ exercise.equipment }}</p>
  </ion-label>
  <ion-checkbox
    slot="end"
    :checked="isExerciseSelected(exercise)"
    class="exercise-checkbox"
  ></ion-checkbox>
</ion-item>
          </ion-list>
        </ion-content>
      </ion-modal>

      <!-- Modal for viewing workout details -->
      <ion-modal :is-open="isWorkoutDetailsModalOpen" @didDismiss="closeWorkoutDetailsModal" class="details-modal">
        <ion-header>
          <ion-toolbar class="custom-workoutdetails-toolbar">
            <ion-buttons slot="start">
              <ion-button @click="closeWorkoutDetailsModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
            <ion-title>Workout Details</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div v-if="selectedWorkout" class="workout-details">
            <h2 class="workout-name">{{ selectedWorkout.name }}</h2>
            <ion-list>
              <ion-item v-for="(exercise, index) in selectedWorkout.exercises" :key="index" class="exercise-detail">
                <ion-label>
                  <h3>{{ exercise.name }}</h3>
                  <p>{{ exercise.muscle }} - {{ exercise.equipment }}</p>
                  <div class="sets-details">
                    <div v-for="(set, setIndex) in exercise.sets" :key="`${index}-${setIndex}`" class="set-detail">
                      <span>Set {{ setIndex + 1 }}: {{ set.reps }} reps × {{ set.weight || 0 }}kg</span>
                    </div>
                    <div class="rest-detail">Rest: {{ formatTime(exercise.restTime || 60) }}</div>
                  </div>
                </ion-label>
              </ion-item>
            </ion-list>
            <ion-button expand="block" @click="startWorkout(selectedWorkout)" class="start-workout-btn">
              Start Workout
            </ion-button>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Popover for workout options -->
      <ion-popover
        :is-open="isWorkoutOptionsPopoverOpen"
        :event="popoverEvent"
        @didDismiss="closeWorkoutOptionsPopover"
        class="options-popover"
      >
        <ion-content>
          <ion-list lines="none">
            <ion-item button @click="editWorkout">
              <ion-icon :icon="createOutline" slot="start"></ion-icon>
              <ion-label>Edit</ion-label>
            </ion-item>
            <ion-item button @click="shareWorkout">
  <ion-icon :icon="shareOutline" slot="start"></ion-icon>
  <ion-label>Share</ion-label>
</ion-item>
            <ion-item button @click="duplicateWorkout">
              <ion-icon :icon="copyOutline" slot="start"></ion-icon>
              <ion-label>Duplicate</ion-label>
            </ion-item>
            <ion-item button @click="deleteWorkout" class="delete-option">
              <ion-icon :icon="trashOutline" slot="start"></ion-icon>
              <ion-label>Delete</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useRouter } from 'vue-router';
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
  IonItemDivider,
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
  IonPopover,
  IonIcon,
  IonSearchbar,
  IonRange,
  toastController,
  alertController,
} from '@ionic/vue';
import {
  checkmarkOutline,
  closeOutline,
  ellipsisHorizontal,
  ellipsisVertical,
  createOutline,
  trashOutline,
  copyOutline,
  settingsOutline,
  lockClosedOutline,
  shareOutline
} from 'ionicons/icons';

import exercisesData from '@/resources/exercises.json';
import { workoutService, type Workout, type Exercise, type Set } from '@/services/workoutService';

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
    IonItemDivider,
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
    IonPopover,
    IonIcon,
    IonSearchbar,
    IonRange,
  },
  setup() {
    const isWorkoutCreationModalOpen = ref(false);
    const isAddExercisesModalOpen = ref(false);
    const isWorkoutDetailsModalOpen = ref(false);
    const isWorkoutOptionsPopoverOpen = ref(false);
    const popoverEvent = ref<Event | null>(null);
    const newWorkoutName = ref('');
    const selectedExercises = ref<Exercise[]>([]);
    const tempSelectedExercises = ref<Exercise[]>([]);
    const workouts = ref<Workout[]>([]);
    const selectedWorkout = ref<Workout | null>(null);
    const exerciseSearchTerm = ref('');
    let nextWorkoutId = 1;
    const editingWorkoutId = ref<number | null>(null);
    const router = useRouter();

    // Share workout
const shareWorkout = async () => {
  if (selectedWorkout.value) {
    try {
      const workoutData = JSON.stringify(selectedWorkout.value, null, 2);
      
      // Create a blob from the workout data
      const blob = new Blob([workoutData], { type: 'application/json' });
      const fileUrl = URL.createObjectURL(blob);
      
      // Create a safe filename
      const fileName = `${selectedWorkout.value.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_workout.json`;
      
      // Try using the Web Share API if available
      if (navigator.share) {
        const file = new File([blob], fileName, { type: 'application/json' });
        await navigator.share({
          title: `${selectedWorkout.value.name} Workout`,
          text: `Check out my "${selectedWorkout.value.name}" workout!`,
          files: [file]
        });
      } else {
        // Fallback to download if Web Share API is not available
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        const toast = await toastController.create({
          message: 'Workout exported successfully!',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error sharing workout:', error);
      
      const toast = await toastController.create({
        message: 'Failed to share workout.',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      toast.present();
    } finally {
      closeWorkoutOptionsPopover();
    }
  }
};

    // Filter exercises based on search term
    const filteredExercises = computed(() => {
      if (!exerciseSearchTerm.value) {
        return exercisesData;
      }
      const searchTerm = exerciseSearchTerm.value.toLowerCase();
      return exercisesData.filter(exercise => 
        exercise.name.toLowerCase().includes(searchTerm) || 
        exercise.muscle.toLowerCase().includes(searchTerm) ||
        exercise.equipment.toLowerCase().includes(searchTerm)
      );
    });

    // Check if workout can be saved
    const canSaveWorkout = computed(() => {
      return newWorkoutName.value.trim() !== '' && selectedExercises.value.length > 0;
    });

    // Load workouts from Firebase
    const loadWorkouts = async () => {
      try {
        const savedWorkouts = await workoutService.getWorkouts();
        workouts.value = savedWorkouts;
        nextWorkoutId = workouts.value.length > 0 
          ? Math.max(...workouts.value.map((w) => w.id)) + 1 
          : 1;
      } catch (error) {
        console.error('Failed to load workouts:', error);
        // No fallback - only use Firebase for security
        workouts.value = [];
        nextWorkoutId = 1;
      }
    };

    // Save workouts to Firebase
    const saveWorkouts = async () => {
      try {
        // Save all workouts to Firebase
        for (const workout of workouts.value) {
          await workoutService.saveWorkout(workout);
        }
      } catch (error) {
        console.error('Failed to save workouts:', error);
        throw error; // Re-throw to let caller handle
      }
    };

    // Format time for rest period display
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Check if an exercise is selected
    const isExerciseSelected = (exercise: any) => {
      return tempSelectedExercises.value.some((e) => e.name === exercise.name);
    };

    // Toggle exercise selection
    const toggleExerciseSelection = (exercise: any) => {
      if (isExerciseSelected(exercise)) {
        tempSelectedExercises.value = tempSelectedExercises.value.filter((e) => e.name !== exercise.name);
      } else {
        // Create a new exercise with default values and a single rest timer for the exercise
        tempSelectedExercises.value.push({
          ...exercise,
          sets: [{ reps: 10, weight: 0 }],
          restTime: 60 // Default rest time in seconds (1 minute)
        });
      }
    };

    // Add a set to an exercise
    const addSet = (exercise: Exercise) => {
      if (exercise.sets.length > 0) {
        // Copy reps and weight from last set as starting point
        const lastSet = exercise.sets[exercise.sets.length - 1];
        exercise.sets.push({ reps: lastSet.reps, weight: lastSet.weight });
      } else {
        exercise.sets.push({ reps: 10, weight: 0 });
      }
    };

    // Remove an exercise
    const removeExercise = (index: number) => {
      selectedExercises.value.splice(index, 1);
    };

    // Open the workout creation modal
    const openWorkoutCreationModal = () => {
      newWorkoutName.value = '';
      selectedExercises.value = [];
      isWorkoutCreationModalOpen.value = true;
    };

    // Close the workout creation modal
    const closeWorkoutCreationModal = () => {
      isWorkoutCreationModalOpen.value = false;
      newWorkoutName.value = '';
      selectedExercises.value = [];
      editingWorkoutId.value = null; // Reset the editing ID when closing
    };

    // Open the add exercises modal
    const openAddExercisesModal = () => {
      tempSelectedExercises.value = JSON.parse(JSON.stringify(selectedExercises.value));
      exerciseSearchTerm.value = '';
      isAddExercisesModalOpen.value = true;
    };

    // Close the add exercises modal
    const closeAddExercisesModal = () => {
      isAddExercisesModalOpen.value = false;
    };

    // Confirm selected exercises
    const confirmSelectedExercises = () => {
      selectedExercises.value = tempSelectedExercises.value;
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
      event.stopPropagation();
      popoverEvent.value = event;
      selectedWorkout.value = workout;
      isWorkoutOptionsPopoverOpen.value = true;
    };

    // Close the workout options popover
    const closeWorkoutOptionsPopover = () => {
      isWorkoutOptionsPopoverOpen.value = false;
      popoverEvent.value = null;
    };

    // Edit workout
    const editWorkout = async () => {
      if (selectedWorkout.value) {
        // Store the workout ID being edited
        editingWorkoutId.value = selectedWorkout.value.id;
        
        // Set form values with the selected workout data
        newWorkoutName.value = selectedWorkout.value.name;
        selectedExercises.value = JSON.parse(JSON.stringify(selectedWorkout.value.exercises));
        
        // Make sure each exercise has the restTime property
        selectedExercises.value.forEach(exercise => {
          if (exercise.restTime === undefined) {
            exercise.restTime = 60; // Default to 60 seconds if not set
          }
        });
        
        closeWorkoutOptionsPopover();
        isWorkoutCreationModalOpen.value = true;
      }
    };

    // Duplicate workout
    const duplicateWorkout = async () => {
      if (selectedWorkout.value) {
        const newWorkout: Workout = {
          id: nextWorkoutId++,
          name: `${selectedWorkout.value.name} (Copy)`,
          exercises: JSON.parse(JSON.stringify(selectedWorkout.value.exercises)),
        };
        
        // Ensure each exercise has the restTime property
        newWorkout.exercises.forEach((exercise: Exercise) => {
          if (exercise.restTime === undefined) {
            exercise.restTime = 60; // Default to 60 seconds if not set
          }
        });
        
        workouts.value.push(newWorkout);
        await saveWorkouts();
        closeWorkoutOptionsPopover();
        
        const toast = await toastController.create({
          message: 'Workout duplicated successfully!',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
        toast.present();
      }
    };

    // Delete workout
    const deleteWorkout = async () => {
      if (selectedWorkout.value) {
        const alert = await alertController.create({
          header: 'Delete Workout',
          message: `Are you sure you want to delete "${selectedWorkout.value.name}"?`,
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Delete',
              role: 'destructive',
              handler: async () => {
                try {
                  await workoutService.deleteWorkout(selectedWorkout.value!.id);
                  workouts.value = workouts.value.filter((w) => w.id !== selectedWorkout.value!.id);
                  closeWorkoutOptionsPopover();
                } catch (error) {
                  console.error('Failed to delete workout:', error);
                  // Still remove from local array for UI, but show error
                  workouts.value = workouts.value.filter((w) => w.id !== selectedWorkout.value!.id);
                  closeWorkoutOptionsPopover();
                  throw error; // Re-throw to show error to user
                }
              }
            }
          ]
        });
        alert.present();
      }
    };

    // Save the new workout
    const saveNewWorkout = async () => {
      if (newWorkoutName.value.trim() && selectedExercises.value.length > 0) {
        // Ensure each exercise has the restTime property
        selectedExercises.value.forEach(exercise => {
          if (exercise.restTime === undefined) {
            exercise.restTime = 60; // Default to 60 seconds if not set
          }
        });
        
        if (editingWorkoutId.value) {
          // Update existing workout
          workouts.value = workouts.value.filter(w => w.id !== editingWorkoutId.value);
          
          const updatedWorkout: Workout = {
            id: editingWorkoutId.value,
            name: newWorkoutName.value,
            exercises: selectedExercises.value,
          };
          
          workouts.value.push(updatedWorkout);
          editingWorkoutId.value = null; // Reset the editing ID
          
          // Save to Firebase
          await workoutService.saveWorkout(updatedWorkout);
        } else {
          // Create new workout
          const newWorkout: Workout = {
            id: nextWorkoutId++,
            name: newWorkoutName.value,
            exercises: selectedExercises.value,
          };
          workouts.value.push(newWorkout);
          
          // Save to Firebase
          await workoutService.saveWorkout(newWorkout);
        }
        
        closeWorkoutCreationModal();
        
        const toast = await toastController.create({
          message: 'Workout saved successfully!',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
        toast.present();
      }
    };

    const startWorkout = async (workout: Workout) => {
      closeWorkoutDetailsModal();
      // Update last performed date
      const updatedWorkout = {
        ...workout,
        lastPerformed: new Date().toISOString()
      };
      
      // Update in the workouts array
      const index = workouts.value.findIndex(w => w.id === workout.id);
      if (index !== -1) {
        workouts.value[index] = updatedWorkout;
        try {
          await workoutService.updateWorkout(workout.id, { lastPerformed: updatedWorkout.lastPerformed });
        } catch (error) {
          console.error('Failed to update workout:', error);
          // Error is logged, but continue navigation
        }
      }

      // Navigate to the workout execution page
      router.push({
        name: 'WorkoutExecution',
        params: { workoutId: workout.id.toString() }
      });
    };

    // Watch for auth changes to reload data when user switches
    let unsubscribeAuth: (() => void) | null = null;
    
    // Load workouts when the component mounts
    onMounted(async () => {
      // Wait for auth to be ready
      unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          await loadWorkouts();
        } else {
          // Clear data when logged out
          workouts.value = [];
          nextWorkoutId = 1;
        }
      });
    });
    
    // Cleanup auth watcher
    onUnmounted(() => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    });

    return {
      shareWorkout,
  shareOutline,
      exercisesData,
      isWorkoutCreationModalOpen,
      isAddExercisesModalOpen,
      isWorkoutDetailsModalOpen,
      isWorkoutOptionsPopoverOpen,
      popoverEvent,
      newWorkoutName,
      selectedExercises,
      tempSelectedExercises,
      workouts,
      selectedWorkout,
      exerciseSearchTerm,
      filteredExercises,
      canSaveWorkout,
      formatTime,
      isExerciseSelected,
      toggleExerciseSelection,
      addSet,
      removeExercise,
      openWorkoutCreationModal,
      closeWorkoutCreationModal,
      openAddExercisesModal,
      closeAddExercisesModal,
      confirmSelectedExercises,
      openWorkoutDetailsModal,
      closeWorkoutDetailsModal,
      openWorkoutOptionsPopover,
      closeWorkoutOptionsPopover,
      editWorkout,
      duplicateWorkout,
      deleteWorkout,
      saveNewWorkout,
      startWorkout,
      // Icons
      closeOutline,
      checkmarkOutline,
      ellipsisHorizontal,
      ellipsisVertical,
      createOutline,
      trashOutline,
      copyOutline,
      settingsOutline,
      lockClosedOutline,
    };
  },
});
</script>

<style scoped>
/* General styles */
:host {
  --ion-background-color: var(--ion-color-light);
  --ion-text-color: var(--ion-color-dark);
  --ion-border-color: var(--ion-color-medium);
}

ion-content {
  --background: var(--ion-color-light);
}


ion-modal {
  --background: var(--ion-color-light);
}

/* Create workout page */
.create-workout-container {
  padding: 16px;
}

.workouts-list {
  margin-bottom: 56px; /* Adjust based on your navbar height */
}

.create-button {
  --color: #ffffff; /* Keep button color as is */
  font-weight: bold;
  margin-bottom: 20px;
  height: 46px;
}

.no-workouts-message {
  color: var(--ion-color-medium);
  text-align: center;
  margin-top: 20px;
}

/* Workout cards */
.workout-card {
  --background: var(--ion-color-light-shade);
  border: 1px solid var(--ion-color-medium);
  border-radius: 8px;
  height: 100%;
  overflow: hidden;
}

.workout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

ion-card-title {
  font-size: 1.2rem;
  color: var(--ion-color-dark);
  margin: 0;
  font-weight: bold;
}

ion-card-subtitle {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}

/* Modal styles */
.workout-modal ion-content, 
.exercises-modal ion-content, 
.details-modal ion-content {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 16px;
  --padding-bottom: 16px;
}

.workout-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.name-input {
  --background: transparent;
  --border-style: none;
  font-size: 24px;
}

.template-name {
  font-size: 24px;
  --color: var(--ion-color-dark);
  font-weight: bold;
}

.add-exercise-btn {
  --background: transparent;
  --color: #347ad6; /* Keep button color as is */
  font-weight: bold;
  letter-spacing: 1px;
  margin: 10px 0;
}

/* Exercise list */
.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 10px;
}

.exercise-item {
  --inner-padding-end: 16px;
  margin-bottom: 4px;
  border-radius: 8px;
}

.exercise-label {
  margin-right: 16px;
}

.exercise-checkbox {
  margin-left: auto;
  --size: 22px;
  --border-radius: 4px;
}

/* Make the exercise names stand out more */
.exercise-item h2 {
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--ion-color-dark);
}

.exercise-item p {
  font-size: 13px;
}

.exercise-header {
  --background: transparent;
  --border-style: none;
}

.exercise-header h2 {
  color: #347ad6; /* Keep button color as is */
  font-weight: bold;
}

.exercise-header p {
  color: var(--ion-color-medium);
  font-size: 14px;
}

/* Sets container */
.sets-container {
  background: var(--ion-color-light-shade);
  border-radius: 8px;
  padding: 10px;
  margin-top: 5px;
}

.sets-header {
  display: flex;
  font-size: 12px;
  color: var(--ion-color-medium);
  font-weight: bold;
  padding: 5px 0;
  margin-bottom: 10px;
}

.set-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.set-col {
  width: 15%;
  text-align: center;
}

.previous-col {
  width: 20%;
  text-align: center;
  color: var(--ion-color-medium);
}

.weight-col {
  width: 25%;
  text-align: center;
}

.reps-col {
  width: 25%;
  text-align: center;
}

.lock-col {
  width: 15%;
  text-align: center;
}

.weight-input, .reps-input {
  --background: var(--ion-color-light-shade);
  --color: var(--ion-color-dark);
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 4px;
  --padding-bottom: 4px;
  --border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.add-set-btn {
  --background: transparent;
  --color: #347ad6; /* Keep button color as is */
  font-size: 14px;
  height: 36px;
  margin-top: 15px;
}

/* Rest timer */
.rest-timer-container {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--ion-color-medium);
}

.rest-timer-label {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin-bottom: 10px;
}

.timer-display {
  font-family: monospace;
  color: #347ad6; /* Keep button color as is */
  font-weight: bold;
}

/* Details modal */
.workout-details {
  padding: 10px;
}

.workout-name {
  margin-bottom: 20px;
  font-size: 24px;
  color: var(--ion-color-dark);
}

.exercise-detail {
  --background: var(--ion-color-light-shade);
  border-radius: 8px;
  margin-bottom: 15px;
}

.sets-details {
  margin-top: 10px;
}

.set-detail {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin-bottom: 5px;
}

.rest-detail {
  font-size: 14px;
  color: #347ad6; /* Keep button color as is */
  margin-top: 8px;
}

.start-workout-btn {
  margin-top: 20px;
  --background: #347ad6; /* Keep button color as is */
  --color: #fff;
  font-weight: bold;
}

/* Exercise search */
.exercise-search {
  --background: var(--ion-color-light-shade);
  --color: var(--ion-color-dark);
  --placeholder-color: var(--ion-color-medium);
  margin-bottom: 15px;
}

/* Options popover */
.options-popover ion-content {
  --background: var(--ion-color-light-shade);
}

.options-popover ion-item {
  --background: transparent;
  --color: var(--ion-color-dark);
}
.custom-toolbar{
  padding-top: 24px;
}
.custom-workoutdetails-toolbar{
  padding-top: 24px;
}
.custom-newworkout-toolbar{
  padding-top: 24px;
}
.custom-addexercises-toolbar{
  padding-top: 24px;
}
</style>