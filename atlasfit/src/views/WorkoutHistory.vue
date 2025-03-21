<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Verlauf</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :scroll-y="true">
      <ion-refresher slot="fixed" @ionRefresh="refreshHistory($event)">
        <ion-refresher-content
          pullingIcon="arrow-down"
          refreshingSpinner="crescent">
        </ion-refresher-content>
      </ion-refresher>
      
      <div class="history-container">
        <div v-for="(monthData, month) in groupedWorkouts" :key="month" class="month-section">
          <div class="month-header">
            <h2>{{ month }}</h2>
            <span class="workout-count">{{ monthData.workouts.length }} Workouts</span>
          </div>
          
          <div v-for="workout in monthData.workouts" :key="workout.id + workout.completedAt" class="workout-card">
            <div class="workout-header">
              <h3>{{ workout.name }}</h3>
              <p>{{ formatDate(workout.completedAt) }}</p>
            </div>

            <div class="sets-section">
              <div class="sets-label">Sets</div>
              <div class="best-set-label">Bestes Set</div>
            </div>

            <div v-for="(exercise, index) in workout.exercises" :key="index" class="exercise-row">
              <div class="sets-info">
                {{ exercise.completedSets }} × {{ exercise.name }}
              </div>
              <div class="best-set-info">
                {{ exercise.bestSet }}
              </div>
            </div>

            <div class="workout-stats">
              <div class="stat">
                <ion-icon :icon="timeOutline"></ion-icon>
                {{ workout.duration }}
              </div>
              <div class="stat">
                <ion-icon :icon="barbellOutline"></ion-icon>
                {{ workout.totalWeight }} kg
              </div>
            </div>
          </div>
        </div>
        
        <!-- This spacer ensures content isn't hidden behind the navbar -->
        <div class="navbar-spacer"></div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onActivated } from 'vue';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButtons,
  IonIcon,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonRouterOutlet,
  IonRefresher,
  IonRefresherContent
} from '@ionic/vue';
import { 
  timeOutline, 
  barbellOutline, 
  personOutline, 
  addOutline, 
  scaleOutline 
} from 'ionicons/icons';

interface CompletedSet {
  reps: number;
  weight: number;
}

interface CompletedExercise {
  name: string;
  completedSets: number;
  sets: CompletedSet[];
  bestSet: string;
}

interface CompletedWorkout {
  id: number;
  name: string;
  completedAt: string;
  duration: string;
  exercises: CompletedExercise[];
  totalWeight: number;
}

interface MonthData {
  workouts: CompletedWorkout[];
}

export default defineComponent({
  name: 'WorkoutHistory',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonIcon,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonRouterOutlet,
    IonRefresher,
    IonRefresherContent
  },
  setup() {
    const completedWorkouts = ref<CompletedWorkout[]>([]);
    
    const loadCompletedWorkouts = () => {
      const savedWorkouts = localStorage.getItem('completedWorkouts');
      if (savedWorkouts) {
        completedWorkouts.value = JSON.parse(savedWorkouts);
      }
    };
    
    const refreshHistory = (event?: CustomEvent) => {
      loadCompletedWorkouts();
      if (event) {
        setTimeout(() => {
          event.target.complete();
        }, 500);
      }
    };
    
    const groupedWorkouts = computed(() => {
      const grouped: Record<string, MonthData> = {};
      
      completedWorkouts.value.forEach(workout => {
        const date = new Date(workout.completedAt);
        const monthName = new Intl.DateTimeFormat('de', { month: 'long' }).format(date);
        
        if (!grouped[monthName]) {
          grouped[monthName] = {
            workouts: []
          };
        }
        
        grouped[monthName].workouts.push(workout);
      });
      
      Object.values(grouped).forEach(monthData => {
        monthData.workouts.sort((a, b) => 
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
      });
      
      return grouped;
    });
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('de', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace('um ', 'um ');
    };
    
    onMounted(() => {
      loadCompletedWorkouts();
    });
    
    // Add this hook to reload data when component is activated
    onActivated(() => {
      refreshHistory();
    });
    
    return {
      groupedWorkouts,
      formatDate,
      refreshHistory,
      timeOutline,
      barbellOutline,
      personOutline,
      addOutline,
      scaleOutline
    };
  }
});
</script>

<style scoped>
.history-container {
  padding: 16px;
  height: 100%; /* Ensure the container takes up the full height */
  overflow-y: auto; 
}

.navbar-spacer {
  height: 56px; /* Adjust this value to match your navbar's height */
}

.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.month-header h2 {
  margin: 0;
  font-size: 24px;
  color: #ffffff;
}

.workout-count {
  color: #777777;
}

.month-section {
  margin-bottom: 24px;
}

.workout-card {
  background-color: #111111;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.workout-header {
  margin-bottom: 16px;
}

.workout-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 20px;
  font-weight: bold;
}

.workout-header p {
  margin: 4px 0 0;
  color: #777777;
  font-size: 14px;
}

.sets-section {
  display: flex;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid #222222;
  margin-bottom: 8px;
}

.sets-label, .best-set-label {
  font-size: 14px;
  color: #777777;
  font-weight: bold;
}

.exercise-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #222222;
}

.sets-info {
  flex: 1;
  color: #ffffff;
}

.best-set-info {
  color: #ffffff;
  text-align: right;
}

.workout-stats {
  display: flex;
  margin-top: 16px;
  color: #777777;
  font-size: 14px;
}

.stat {
  display: flex;
  align-items: center;
  margin-right: 24px;
}

.stat ion-icon {
  margin-right: 6px;
}
</style>