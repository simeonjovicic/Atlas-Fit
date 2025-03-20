<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="confirmExitWorkout">
              <ion-icon :icon="chevronDown"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>{{ currentTime }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="endWorkout">
              BEENDEN
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
  
      <ion-content>
        <div class="workout-container">
          <div class="exercise-header">
            <h1 class="exercise-name">{{ currentExercise?.name || 'Exercise' }}</h1>
            <ion-button fill="clear">
              <ion-icon :icon="ellipsisHorizontal" slot="icon-only"></ion-icon>
            </ion-button>
          </div>
  
          <div class="timer" v-if="restTimerActive">
            <div class="timer-display">{{ formatTime(remainingRestTime) }}</div>
            <ion-button @click="skipRestTimer" fill="clear" class="skip-button">
              <ion-icon :icon="playForward"></ion-icon>
            </ion-button>
          </div>
  
          <div class="sets-container" v-if="!restTimerActive">
            <div class="sets-header">
              <div class="set-col">SET</div>
              <div class="previous-col">VORHERIGES</div>
              <div class="weight-col">{{ currentExercise?.equipment === 'body weight' ? '(-KG)' : 'KG' }}</div>
              <div class="reps-col">WIEDERHOL</div>
              <div class="check-col"></div>
            </div>
  
            <div v-for="(set, index) in currentExercise?.sets" :key="index" class="set-row" :class="{ 'active-set': currentSetIndex === index, 'completed-set': setCompleted(index) }">
              <div class="set-col">{{ index + 1 }}</div>
              <div class="previous-col">{{ getPreviousSetInfo(index) }}</div>
              <div class="weight-col">
                <ion-input 
                  type="number" 
                  v-model="set.weight" 
                  :disabled="setCompleted(index)" 
                  class="weight-input"
                  :class="{ 'active-input': currentSetIndex === index }"
                ></ion-input>
              </div>
              <div class="reps-col">
                <ion-input 
                  type="number" 
                  v-model="set.reps" 
                  :disabled="setCompleted(index)" 
                  class="reps-input"
                  :class="{ 'active-input': currentSetIndex === index }"
                ></ion-input>
              </div>
              <div class="check-col">
                <ion-button 
                  fill="clear" 
                  @click="completeSet(index)" 
                  :disabled="setCompleted(index)" 
                  class="complete-button"
                  :class="{ 'active-button': currentSetIndex === index }"
                >
                  <ion-icon :icon="setCompleted(index) ? checkmarkCircle : checkmarkOutline"></ion-icon>
                </ion-button>
              </div>
            </div>
          </div>
  
          <ion-button 
            expand="block" 
            class="add-set-btn" 
            @click="addSet" 
            v-if="!restTimerActive && currentExercise"
          >
            SET HINZUFÜGEN
          </ion-button>
  
          <div class="navigation-buttons" v-if="!restTimerActive">
            <ion-button 
              @click="previousExercise" 
              :disabled="currentExerciseIndex === 0"
              class="nav-button"
            >
              <ion-icon :icon="chevronBack" slot="icon-only"></ion-icon>
            </ion-button>
            <div class="exercise-counter">{{ currentExerciseIndex + 1 }}/{{ workout?.exercises.length }}</div>
            <ion-button 
              @click="nextExercise" 
              :disabled="currentExerciseIndex === (workout?.exercises.length || 1) - 1"
              class="nav-button"
            >
              <ion-icon :icon="chevronForward" slot="icon-only"></ion-icon>
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonInput,
    IonButtons,
    alertController,
    toastController,
  } from '@ionic/vue';
  import {
    chevronDown,
    chevronBack,
    chevronForward,
    ellipsisHorizontal,
    checkmarkOutline,
    checkmarkCircle,
    playForward,
  } from 'ionicons/icons';
  import { useRouter } from 'vue-router';
  
  interface Set {
    reps: number;
    weight: number;
    completed?: boolean;
  }
  
  interface Exercise {
    name: string;
    type: string;
    muscle: string;
    equipment: string;
    difficulty: string;
    instructions: string;
    sets: Set[];
    restTime: number;
  }
  
  interface Workout {
    id: number;
    name: string;
    exercises: Exercise[];
    lastPerformed?: string;
  }
  
  export default defineComponent({
    name: 'WorkoutExecution',
    components: {
      IonPage,
      IonHeader,
      IonToolbar,
      IonTitle,
      IonContent,
      IonButton,
      IonIcon,
      IonInput,
      IonButtons,
    },
    props: {
      workoutId: {
        type: Number,
        required: true
      }
    },
    setup(props) {
      const router = useRouter();
      const workout = ref<Workout | null>(null);
      const currentExerciseIndex = ref(0);
      const currentSetIndex = ref(0);
      const startTime = ref(new Date());
      const currentTime = ref('0:00');
      const restTimerActive = ref(false);
      const remainingRestTime = ref(0);
      const completedSets = ref<Record<string, boolean>>({});
      let timerInterval: number | null = null;
      let restTimerInterval: number | null = null;
  
      const currentExercise = computed(() => {
        if (!workout.value || !workout.value.exercises.length) return null;
        return workout.value.exercises[currentExerciseIndex.value];
      });
  
      // Load workout data
      const loadWorkout = () => {
        const savedWorkouts = localStorage.getItem('workouts');
        if (savedWorkouts) {
          const workouts = JSON.parse(savedWorkouts);
          const foundWorkout = workouts.find((w: Workout) => w.id === props.workoutId);
          if (foundWorkout) {
            workout.value = foundWorkout;
            // Initialize sets as not completed
            workout.value.exercises.forEach((exercise, exerciseIndex) => {
              exercise.sets.forEach((set, setIndex) => {
                completedSets.value[`${exerciseIndex}-${setIndex}`] = false;
              });
            });
          }
        }
      };
  
      // Format time display (MM:SS)
      const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };
  
      // Update workout timer
      const updateTimer = () => {
        const elapsed = Math.floor((new Date().getTime() - startTime.value.getTime()) / 1000);
        currentTime.value = formatTime(elapsed);
      };
  
      // Start workout timer
      const startWorkoutTimer = () => {
        timerInterval = window.setInterval(updateTimer, 1000);
      };
  
      // Start rest timer
      const startRestTimer = () => {
        if (!currentExercise.value) return;
        
        restTimerActive.value = true;
        remainingRestTime.value = currentExercise.value.restTime || 60;
        
        restTimerInterval = window.setInterval(() => {
          remainingRestTime.value--;
          if (remainingRestTime.value <= 0) {
            skipRestTimer();
          }
        }, 1000);
      };
  
      // Skip rest timer
      const skipRestTimer = () => {
        if (restTimerInterval) {
          clearInterval(restTimerInterval);
          restTimerInterval = null;
        }
        restTimerActive.value = false;
        
        // Move to next set or exercise
        if (currentExercise.value && currentSetIndex.value < currentExercise.value.sets.length - 1) {
          currentSetIndex.value++;
        } else {
          // If this was the last set, move to next exercise
          nextExercise();
        }
      };
  
      // Complete a set
      const completeSet = (setIndex: number) => {
        if (!currentExercise.value) return;
        
        const key = `${currentExerciseIndex.value}-${setIndex}`;
        completedSets.value[key] = true;
        
        // Save this workout session progress
        saveWorkoutProgress();
        
        // Start rest timer if it's the current set
        if (setIndex === currentSetIndex.value) {
          startRestTimer();
        }
        
        // Show toast notification
        toastController.create({
          message: 'Set completed!',
          duration: 1000,
          position: 'bottom',
          color: 'success'
        }).then(toast => toast.present());
      };
  
      // Check if a set is completed
      const setCompleted = (setIndex: number) => {
        const key = `${currentExerciseIndex.value}-${setIndex}`;
        return completedSets.value[key] === true;
      };
  
      // Get previous set info
      const getPreviousSetInfo = (setIndex: number) => {
        if (!currentExercise.value) return '—';
        
        // For demonstration, we'll just show the previous workout's data
        // In a real app, you would fetch this from historical data
        if (setIndex === 0) {
          return '—';
        } else {
          const prevSet = currentExercise.value.sets[setIndex - 1];
          return `${prevSet.weight}kg × ${prevSet.reps}`;
        }
      };
  
      // Add a new set
      const addSet = () => {
        if (!currentExercise.value) return;
        
        const lastSet = currentExercise.value.sets[currentExercise.value.sets.length - 1];
        currentExercise.value.sets.push({
          reps: lastSet.reps,
          weight: lastSet.weight
        });
        
        // Save the updated workout
        saveWorkoutProgress();
      };
  
      // Go to previous exercise
      const previousExercise = () => {
        if (currentExerciseIndex.value > 0) {
          currentExerciseIndex.value--;
          currentSetIndex.value = 0;
        }
      };
  
      // Go to next exercise
      const nextExercise = () => {
        if (workout.value && currentExerciseIndex.value < workout.value.exercises.length - 1) {
          currentExerciseIndex.value++;
          currentSetIndex.value = 0;
        }
      };
  
      // Save workout progress
      const saveWorkoutProgress = () => {
        if (!workout.value) return;
        
        const savedWorkouts = localStorage.getItem('workouts');
        if (savedWorkouts) {
          const workouts = JSON.parse(savedWorkouts);
          const index = workouts.findIndex((w: Workout) => w.id === workout.value?.id);
          if (index !== -1) {
            workouts[index] = workout.value;
            localStorage.setItem('workouts', JSON.stringify(workouts));
          }
        }
      };
  
      // Confirm exit workout
      const confirmExitWorkout = async () => {
        const alert = await alertController.create({
          header: 'Exit Workout',
          message: 'Are you sure you want to exit this workout? Progress will be saved.',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Exit',
              handler: () => {
                endWorkout();
              }
            }
          ]
        });
        await alert.present();
      };
  
      // End workout
      // End workout
const endWorkout = () => {
  if (workout.value) {
    // Calculate total workout duration
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.value.getTime()) / 1000);
    const durationFormatted = formatTime(duration);
    
    // Create a workout history entry
    const completedWorkout = {
      id: workout.value.id,
      name: workout.value.name,
      completedAt: endTime.toISOString(),
      duration: durationFormatted,
      exercises: workout.value.exercises.map(exercise => {
        // Count completed sets
        const completedSetsCount = exercise.sets.filter((_, index) => {
          const key = `${currentExerciseIndex.value}-${index}`;
          return completedSets.value[key] === true;
        }).length;
        
        // Find best set (highest weight × reps)
        let bestSet = '';
        let bestSetValue = 0;
        
        exercise.sets.forEach(set => {
          const setValue = set.weight * set.reps;
          if (setValue > bestSetValue) {
            bestSetValue = setValue;
            bestSet = `${set.weight} kg × ${set.reps}`;
          }
        });
        
        return {
          name: exercise.name,
          completedSets: completedSetsCount,
          sets: exercise.sets.map(set => ({
            reps: set.reps,
            weight: set.weight
          })),
          bestSet: bestSet
        };
      }),
      totalWeight: workout.value.exercises.reduce((total, exercise) => {
        return total + exercise.sets.reduce((setTotal, set) => {
          return setTotal + (set.weight * set.reps);
        }, 0);
      }, 0)
    };
    
    // Save to localStorage
    const savedCompletedWorkouts = localStorage.getItem('completedWorkouts');
    let completedWorkouts = [];
    
    if (savedCompletedWorkouts) {
      completedWorkouts = JSON.parse(savedCompletedWorkouts);
    }
    
    completedWorkouts.push(completedWorkout);
    localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts));
    
    // Also update the regular workout data
    workout.value.lastPerformed = endTime.toISOString();
    saveWorkoutProgress();
    
    // Show completion toast
    toastController.create({
      message: 'Workout completed!',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    }).then(toast => toast.present());
  }
  
  // Navigate back to workout list
  router.push('/home');
};
  
      // Component lifecycle hooks
      onMounted(() => {
        loadWorkout();
        startWorkoutTimer();
      });
  
      onBeforeUnmount(() => {
        if (timerInterval) {
          clearInterval(timerInterval);
        }
        if (restTimerInterval) {
          clearInterval(restTimerInterval);
        }
      });
  
      return {
        workout,
        currentExercise,
        currentExerciseIndex,
        currentSetIndex,
        currentTime,
        restTimerActive,
        remainingRestTime,
        formatTime,
        completeSet,
        setCompleted,
        getPreviousSetInfo,
        addSet,
        previousExercise,
        nextExercise,
        skipRestTimer,
        confirmExitWorkout,
        endWorkout,
        // Icons
        chevronDown,
        chevronBack,
        chevronForward,
        ellipsisHorizontal,
        checkmarkOutline,
        checkmarkCircle,
        playForward,
      };
    }
  });
  </script>
  
  <style scoped>
  /* General styles */
  .workout-container {
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .exercise-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .exercise-name {
    font-size: 24px;
    font-weight: bold;
    color: #347ad6;
    margin: 0;
  }
  
  /* Timer styles */
  .timer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    background-color: #111111;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .timer-display {
    font-size: 48px;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 20px;
  }
  
  .skip-button {
    --color: #347ad6;
  }
  
  /* Sets container */
  .sets-container {
    background-color: #111111;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 20px;
  }
  
  .sets-header {
    display: flex;
    font-size: 12px;
    color: #777777;
    font-weight: bold;
    padding: 5px 0;
    margin-bottom: 10px;
  }
  
  .set-row {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #222222;
  }
  
  .set-col {
    width: 10%;
    text-align: center;
  }
  
  .previous-col {
    width: 25%;
    text-align: center;
    color: #555555;
    font-size: 14px;
  }
  
  .weight-col {
    width: 25%;
    text-align: center;
  }
  
  .reps-col {
    width: 25%;
    text-align: center;
  }
  
  .check-col {
    width: 15%;
    text-align: center;
  }
  
  .weight-input, .reps-input {
    --background: #222222;
    --color: #ffffff;
    --border-radius: 4px;
    --padding-start: 8px;
    --padding-end: 8px;
    font-size: 16px;
    text-align: center;
  }
  
  .active-set {
    background-color: #1a1a1a;
  }
  
  .active-input {
    --background: #333333;
  }
  
  .active-button {
    --color: #347ad6;
  }
  
  .completed-set {
    opacity: 0.7;
  }
  
  .complete-button {
    --padding-start: 4px;
    --padding-end: 4px;
  }
  
  /* Navigation buttons */
  .navigation-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding: 10px 0;
  }
  
  .exercise-counter {
    font-size: 16px;
    color: #777777;
  }
  
  .nav-button {
    --background: #222222;
    --border-radius: 50%;
    --padding-start: 8px;
    --padding-end: 8px;
    width: 40px;
    height: 40px;
  }
  
  .add-set-btn {
    --background: transparent;
    --color: #347ad6;
    font-weight: bold;
    margin: 10px 0;
  }
  </style>