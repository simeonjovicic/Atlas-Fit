<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :scroll-y="true">
      <ion-refresher slot="fixed" @ionRefresh="refreshHistory($event)">
        <ion-refresher-content
          pullingIcon="arrow-down"
          refreshingSpinner="crescent">
        </ion-refresher-content>
      </ion-refresher>
      
      <!-- Welcome Message -->
      <div class="welcome-message">
        <h1>Welcome back, {{ userName || 'User' }}</h1>
      </div>

      <div class="dashboard-container">
        <div class="stats-card">
          <h2>Deine Statistik</h2>
          <div class="stats-row">
            <div class="stat-box">
              <div class="stat-value">{{ totalWorkouts }}</div>
              <div class="stat-label">Workouts</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ totalWorkoutsThisMonth }}</div>
              <div class="stat-label">Diesen Monat</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ averageWorkoutsPerWeek }}</div>
              <div class="stat-label">Ø pro Woche</div>
            </div>
          </div>
        </div>

        <!-- Rest of the content remains the same -->
        <div class="graph-card">
          <div class="card-header">
            <h2>Workouts pro Woche</h2>
            <div class="period-selector">
              <span :class="{ active: selectedPeriod === 'month' }" @click="selectedPeriod = 'month'">Woche</span>
              <span :class="{ active: selectedPeriod === '3months' }" @click="selectedPeriod = '3months'">Monat</span>
              <span :class="{ active: selectedPeriod === 'year' }" @click="selectedPeriod = 'year'">Jahr</span>
            </div>
          </div>
          
          <div class="graph-container">
            <div class="graph-y-axis">
              <div v-for="n in 6" :key="n" class="y-label">{{ 6 - n }}</div>
            </div>
            <div class="graph-content">
              <div v-for="(week, index) in displayedWeeks" :key="index" class="graph-bar-container">
                <div class="graph-bar" :style="{ height: calculateBarHeight(week.count) }">
                  <div class="bar-value" v-if="week.count > 0">{{ week.count }}</div>
                </div>
                <div class="graph-x-label">{{ week.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="recent-workouts-card">
          <h2>Letzte Workouts</h2>
          <div v-if="recentWorkouts.length === 0" class="no-workouts">
            Keine abgeschlossenen Workouts gefunden.
          </div>
          <div v-else class="recent-workout-list">
            <div v-for="workout in recentWorkouts" :key="workout.id" class="recent-workout-item">
              <div class="workout-info">
                <h3>{{ workout.name }}</h3>
                <p>{{ formatDate(workout.completedAt) }}</p>
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
        </div>
        
        <!-- This spacer ensures content isn't hidden behind the navbar -->
        <div class="navbar-spacer"></div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, onActivated } from 'vue';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent
} from '@ionic/vue';
import { 
  timeOutline, 
  barbellOutline
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

interface WeekData {
  startDate: Date;
  endDate: Date;
  label: string;
  count: number;
}

export default defineComponent({
  name: 'HomePage',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonRefresher,
    IonRefresherContent
  },
  setup() {
    const completedWorkouts = ref<CompletedWorkout[]>([]);
    const selectedPeriod = ref('month');
    const isLoading = ref(false);
    const userName = ref(''); // Add a ref for the user's name

    // Fetch the user's name from localStorage
    const fetchUserName = () => {
      const savedProfile = localStorage.getItem('profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        userName.value = profile.name || 'User';
      }
    };

    const loadCompletedWorkouts = () => {
      isLoading.value = true;
      try {
        const savedWorkouts = localStorage.getItem('completedWorkouts');
        if (savedWorkouts) {
          completedWorkouts.value = JSON.parse(savedWorkouts);
        } else {
          completedWorkouts.value = [];
        }
      } catch (error) {
        console.error('Failed to load workouts:', error);
        completedWorkouts.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const refreshHistory = (event: CustomEvent) => {
      try {
        loadCompletedWorkouts();
      } catch (error) {
        console.error('Failed to refresh data:', error);
      } finally {
        // Always complete the refresher, even if there's an error
        if (event && event.target) {
          setTimeout(() => {
            event.target.complete();
          }, 500); // Simulate a delay for better UX
        }
      }
    };
    
    const totalWorkouts = computed(() => {
      return completedWorkouts.value.length;
    });
    
    const totalWorkoutsThisMonth = computed(() => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      return completedWorkouts.value.filter(workout => {
        const workoutDate = new Date(workout.completedAt);
        return workoutDate >= firstDayOfMonth;
      }).length;
    });
    
    const averageWorkoutsPerWeek = computed(() => {
      if (completedWorkouts.value.length === 0) return 0;
      
      const dates = completedWorkouts.value.map(w => new Date(w.completedAt));
      const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const now = new Date();
      
      const totalWeeks = Math.max(1, Math.ceil((now.getTime() - oldestDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
      return (completedWorkouts.value.length / totalWeeks).toFixed(1);
    });
    
    const recentWorkouts = computed(() => {
      return [...completedWorkouts.value]
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 3);
    });

    const getWeeksInPeriod = (periodType: string) => {
      const weeks: WeekData[] = [];
      const now = new Date();
      let startDate: Date;
      
      switch (periodType) {
        case 'month':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 28);
          break;
        case '3months':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 84);
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 28);
      }
      
      const startMonday = new Date(startDate);
      startMonday.setDate(startMonday.getDate() - (startMonday.getDay() - 1 + 7) % 7);
      startMonday.setHours(0, 0, 0, 0);
      
      const endMonday = new Date(now);
      endMonday.setDate(endMonday.getDate() - (endMonday.getDay() - 1 + 7) % 7);
      endMonday.setHours(0, 0, 0, 0);
      
      let numWeeks = Math.ceil((endMonday.getTime() - startMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
      
      const skipWeeks = periodType === 'year' ? Math.floor(numWeeks / 12) : 1;
      
      let weekStart = new Date(startMonday);
      while (weekStart <= now) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const label = `${weekStart.getDate()}.${weekStart.getMonth() + 1}.`;
        
        weeks.push({
          startDate: new Date(weekStart),
          endDate: new Date(weekEnd),
          label,
          count: 0
        });
        
        weekStart.setDate(weekStart.getDate() + 7 * skipWeeks);
      }
      
      return weeks.slice(-8);
    };
    
    const displayedWeeks = computed(() => {
      const weeks = getWeeksInPeriod(selectedPeriod.value);
      
      completedWorkouts.value.forEach(workout => {
        const workoutDate = new Date(workout.completedAt);
        
        for (const week of weeks) {
          if (workoutDate >= week.startDate && workoutDate <= week.endDate) {
            week.count++;
            break;
          }
        }
      });
      
      return weeks;
    });
    
    const calculateBarHeight = (count: number) => {
      const maxHeight = 100; // Max height in percentage
      const maxCount = 6; // Maximum number on the Y-axis
      const cappedCount = Math.min(count, maxCount);
      const height = (cappedCount / maxCount) * maxHeight;
      return `${height}%`;
    };
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('de', {
        weekday: 'short',
        day: 'numeric',
        month: 'long'
      });
    };
    
    onMounted(() => {
      // Fetch the user's name when the component is mounted
      fetchUserName();
      loadCompletedWorkouts();
    });

    onActivated(() => {
      // Fetch the user's name when the component is activated
      fetchUserName();
      loadCompletedWorkouts();
    });
    
    return {
      totalWorkouts,
      totalWorkoutsThisMonth,
      averageWorkoutsPerWeek,
      recentWorkouts,
      displayedWeeks,
      selectedPeriod,
      calculateBarHeight,
      formatDate,
      timeOutline,
      barbellOutline,
      refreshHistory,
      isLoading,
      userName // Return the user's name
    };
  }
});
</script>

<style scoped>
.dashboard-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  background-color: var(--ion-color-light);
}

.navbar-spacer {
  height: 56px;
}

.stats-card, .graph-card, .recent-workouts-card {
  background-color: var(--ion-color-light-shade);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

h2 {
  margin: 0 0 16px 0;
  color: var(--ion-color-dark);
  font-size: 20px;
  font-weight: bold;
}

.stats-row {
  display: flex;
  justify-content: space-between;
}

.stat-box {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #b388ff; /* Keep button color as is */
}

.stat-label {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.period-selector {
  display: flex;
  font-size: 14px;
}

.period-selector span {
  padding: 4px 8px;
  margin-left: 8px;
  cursor: pointer;
  color: var(--ion-color-medium);
  border-radius: 4px;
}

.period-selector span.active {
  background-color: var(--ion-color-light-tint);
  color: var(--ion-color-dark);
}

.graph-container {
  height: 200px;
  display: flex;
  align-items: flex-end;
  margin-top: 16px;
}

.graph-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 180px;
  padding-right: 8px;
  margin-bottom: 20px;
}

.y-label {
  color: var(--ion-color-medium);
  font-size: 12px;
  height: 30px;
  display: flex;
  align-items: center;
}

.graph-content {
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
  height: 100%;
}

.graph-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 4px;
  height: 180px;
  position: relative;
}

.graph-bar {
  width: 100%;
  max-width: 24px;
  background-color: #b388ff; /* Keep button color as is */
  border-radius: 4px;
  position: absolute;
  bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.bar-value {
  position: absolute;
  top: -20px;
  color: var(--ion-color-dark);
  font-size: 12px;
}

.graph-x-label {
  color: var(--ion-color-medium);
  font-size: 12px;
  position: absolute;
  bottom: 0;
  text-align: center;
}

.recent-workout-list {
  display: flex;
  flex-direction: column;
}

.recent-workout-item {
  border-bottom: 1px solid var(--ion-color-light-tint);
  padding: 12px 0;
}

.recent-workout-item:last-child {
  border-bottom: none;
}

.workout-info h3 {
  margin: 0;
  font-size: 16px;
  color: var(--ion-color-dark);
}

.workout-info p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.workout-stats {
  display: flex;
  margin-top: 8px;
}

.stat {
  display: flex;
  align-items: center;
  color: var(--ion-color-medium);
  font-size: 12px;
  margin-right: 16px;
}

.stat ion-icon {
  margin-right: 4px;
}

.no-workouts {
  color: var(--ion-color-medium);
  text-align: center;
  padding: 16px;
}

/* Add styles for the welcome message */
.welcome-message {
  padding: 16px;
  background-color: var(--ion-color-light-shade);
  border-bottom: 1px solid var(--ion-color-light-tint);
}

.welcome-message h1 {
  margin: 0;
  font-size: 24px;
  color: var(--ion-color-dark);
}
</style>