<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="custom-toolbar">
        <ion-title>Verlauf</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="refreshHistory($event)">
        <ion-refresher-content
          pullingIcon="arrow-down"
          refreshingSpinner="crescent">
        </ion-refresher-content>
      </ion-refresher>
      
      <div class="full-height-container">
        <div class="tab-container">
          <div 
            class="tab-button" 
            :class="{ 'active': activeTab === 'history' }"
            @click="activeTab = 'history'"
          >
            <ion-icon :icon="timeOutline" class="tab-icon"></ion-icon>
            <span>Verlauf</span>
          </div>
          <div 
            class="tab-button" 
            :class="{ 'active': activeTab === 'analytics' }"
            @click="activeTab = 'analytics'"
          >
            <ion-icon :icon="analyticsOutline" class="tab-icon"></ion-icon>
            <span>Analyse</span>
          </div>
        </div>

        <!-- History Tab Content -->
        <div v-if="activeTab === 'history'" class="tab-content">
          <!-- Empty state message when no workouts exist -->
          <div v-if="isHistoryEmpty" class="empty-state">
            <ion-icon :icon="barbellOutline" class="empty-state-icon"></ion-icon>
            <h2>Keine Workouts abgeschlossen</h2>
            <p>Beende dein erstes Workout, um es hier anzuzeigen.</p>
          </div>
          
          <!-- Workout history when data exists -->
          <div v-else class="history-container">
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
          </div>
        </div>

        <!-- Analytics Tab Content -->
        <div v-if="activeTab === 'analytics'" class="tab-content">
          <div v-if="isHistoryEmpty" class="empty-state">
            <ion-icon :icon="analyticsOutline" class="empty-state-icon"></ion-icon>
            <h2>Keine Daten verfügbar</h2>
            <p>Beende einige Workouts, um Analysen zu sehen.</p>
          </div>
          
          <div v-else class="analytics-container">
            <!-- Workout frequency section -->
            <div class="analytics-card">
              <h3>Trainingsfrequenz</h3>
              <div class="statistics-container">
                <div class="statistic">
                  <div class="statistic-value">{{ workoutsThisMonth }}</div>
                  <div class="statistic-label">Diesen Monat</div>
                </div>
                <div class="statistic">
                  <div class="statistic-value">{{ workoutsPerWeek }}</div>
                  <div class="statistic-label">Durchschnitt/Woche</div>
                </div>
                <div class="statistic">
                  <div class="statistic-value">{{ mostFrequentWorkout }}</div>
                  <div class="statistic-label">Häufigstes Workout</div>
                </div>
              </div>
            </div>

            <!-- Progress section -->
            <div class="analytics-card">
              <h3>Fortschritt</h3>
              <div class="statistics-container">
                <div class="statistic">
                  <div class="statistic-value">{{ totalWeightLifted }} kg</div>
                  <div class="statistic-label">Gesamt gehoben</div>
                </div>
                <div class="statistic">
                  <div class="statistic-value">{{ totalWorkoutMinutes }}</div>
                  <div class="statistic-label">Trainingsminuten</div>
                </div>
                <div class="statistic">
                  <div class="statistic-value">{{ avgWeightPerWorkout }} kg</div>
                  <div class="statistic-label">Durchschnitt/Workout</div>
                </div>
              </div>
            </div>

            <!-- Exercise performance section with progress charts -->
            <div class="analytics-card">
              <h3>Übungsleistung</h3>
              <div class="exercise-select-container">
                <label for="exercise-select">Übung auswählen:</label>
                <select id="exercise-select" v-model="selectedExercise" class="exercise-select">
                  <option v-for="exercise in exerciseNames" :key="exercise" :value="exercise">
                    {{ exercise }}
                  </option>
                </select>
              </div>
              
              <!-- Exercise progress chart -->
              <div class="chart-container">
                <h4 class="chart-title">Gesamtes Volumen hinzugefügt (kg)</h4>
                <div class="chart-wrapper">
                  <svg class="progress-chart" viewBox="0 0 500 200">
                    <!-- Y-axis labels -->
                    <text x="20" y="20" class="chart-label">{{getMaxWeight(selectedExercise)}}</text>
                    <text x="20" y="100" class="chart-label">{{getMiddleWeight(selectedExercise)}}</text>
                    <text x="20" y="180" class="chart-label">0</text>
                    
                    <!-- Horizontal grid lines -->
                    <line x1="40" y1="20" x2="480" y2="20" class="chart-grid" />
                    <line x1="40" y1="100" x2="480" y2="100" class="chart-grid" />
                    <line x1="40" y1="180" x2="480" y2="180" class="chart-grid" />
                    
                    <!-- X-axis labels -->
                    <text x="40" y="195" class="chart-label">{{getFirstMonth(selectedExercise)}}</text>
                    <text x="260" y="195" class="chart-label">{{getMiddleMonth(selectedExercise)}}</text>
                    <text x="480" y="195" class="chart-label">{{getLastMonth(selectedExercise)}}</text>
                    
                    <!-- Progress line -->
                    <polyline
                      :points="getProgressPoints(selectedExercise)"
                      class="progress-line"
                    />
                    
                    <!-- Data points -->
                    <template v-for="(point, index) in getDataPoints(selectedExercise)" :key="index">
                      <circle
                        :cx="point.x"
                        :cy="point.y"
                        r="4"
                        class="data-point"
                      />
                    </template>
                  </svg>
                </div>
              </div>
              
              <!-- Exercise best performances -->
              <div class="exercise-performance">
                <div class="exercise-name">{{ selectedExercise }}</div>
                <div class="exercise-stats">
                  <div class="best-weight">{{ getExerciseBestWeight(selectedExercise) }} kg</div>
                  <div class="best-reps">{{ getExerciseBestReps(selectedExercise) }} Wdh</div>
                </div>
              </div>
              <!-- Exercise strength metrics -->
<div class="exercise-metrics">
  <div class="metric-title">Kraft-Metriken</div>
  <div class="metrics-container">
    <div class="metric">
      <div class="metric-value">{{ getExercise1RM(selectedExercise) }} kg</div>
      <div class="metric-label">1RM (Brzycki)</div>
    </div>
    <div class="metric">
      <div class="metric-value">{{ getExerciseBestWeight(selectedExercise) }} kg</div>
      <div class="metric-label">Max Gewicht</div>
    </div>
    <div class="metric">
      <div class="metric-value">{{ getExerciseMaxVolume(selectedExercise) }} kg</div>
      <div class="metric-label">Max Volumen</div>
    </div>
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
  scaleOutline,
  analyticsOutline
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

interface ExerciseProgressPoint {
  date: Date;
  weight: number;
  x: number;
  y: number;
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
    const activeTab = ref('history');
    const selectedExercise = ref('');
    
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
    
    // Computed property to check if there are no workouts
    const isHistoryEmpty = computed(() => {
      return completedWorkouts.value.length === 0;
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

    // Get list of all exercise names
    const exerciseNames = computed(() => {
      const nameSet = new Set<string>();
      
      completedWorkouts.value.forEach(workout => {
        workout.exercises.forEach(exercise => {
          nameSet.add(exercise.name);
        });
      });
      
      return Array.from(nameSet);
    });

    // Set default selected exercise when data loads
    const initializeSelectedExercise = () => {
      if (exerciseNames.value.length > 0 && !selectedExercise.value) {
        selectedExercise.value = exerciseNames.value[0];
      }
    };

    // Get exercise progress data for charts
    const getExerciseProgressData = (exerciseName: string) => {
      const progressData: {date: Date, weight: number}[] = [];
      
      completedWorkouts.value.forEach(workout => {
        const date = new Date(workout.completedAt);
        
        workout.exercises.forEach(exercise => {
          if (exercise.name === exerciseName) {
            // Find the highest weight used in any set
            let maxWeight = 0;
            exercise.sets.forEach(set => {
              if (set.weight > maxWeight) {
                maxWeight = set.weight;
              }
            });
            
            progressData.push({
              date,
              weight: maxWeight
            });
          }
        });
      });
      
      // Sort by date
      return progressData.sort((a, b) => a.date.getTime() - b.date.getTime());
    };

    // Calculate points for the SVG polyline
    const getProgressPoints = (exerciseName: string) => {
      const progressData = getExerciseProgressData(exerciseName);
      if (progressData.length === 0) return '';
      
      const points: string[] = [];
      const maxWeight = Math.max(...progressData.map(p => p.weight));
      const minDate = progressData[0].date.getTime();
      const maxDate = progressData[progressData.length - 1].date.getTime();
      const dateRange = maxDate - minDate;
      
      progressData.forEach(point => {
        // Calculate x position (date)
        const xPos = dateRange === 0 ? 40 : 40 + (440 * (point.date.getTime() - minDate) / dateRange);
        
        // Calculate y position (weight) - invert since SVG y-axis starts from top
        const yPos = maxWeight === 0 ? 180 : 180 - (160 * point.weight / maxWeight);
        
        points.push(`${xPos},${yPos}`);
      });
      
      return points.join(' ');
    };

    // Get data points for displaying circles on the line
    const getDataPoints = (exerciseName: string) => {
      const progressData = getExerciseProgressData(exerciseName);
      if (progressData.length === 0) return [];
      
      const points: ExerciseProgressPoint[] = [];
      const maxWeight = Math.max(...progressData.map(p => p.weight));
      const minDate = progressData[0].date.getTime();
      const maxDate = progressData[progressData.length - 1].date.getTime();
      const dateRange = maxDate - minDate;
      
      progressData.forEach(point => {
        // Calculate x position (date)
        const xPos = dateRange === 0 ? 40 : 40 + (440 * (point.date.getTime() - minDate) / dateRange);
        
        // Calculate y position (weight) - invert since SVG y-axis starts from top
        const yPos = maxWeight === 0 ? 180 : 180 - (160 * point.weight / maxWeight);
        
        points.push({
          date: point.date,
          weight: point.weight,
          x: xPos,
          y: yPos
        });
      });
      
      return points;
    };

    // Get max weight for y-axis label
    const getMaxWeight = (exerciseName: string) => {
      const progressData = getExerciseProgressData(exerciseName);
      if (progressData.length === 0) return '0';
      
      return Math.max(...progressData.map(p => p.weight)).toString();
    };

    // Get middle weight value for y-axis label
    const getMiddleWeight = (exerciseName: string) => {
      const progressData = getExerciseProgressData(exerciseName);
      if (progressData.length === 0) return '0';
      
      const maxWeight = Math.max(...progressData.map(p => p.weight));
      return Math.round(maxWeight / 2).toString();
    };

    // Get months for x-axis labels
    const getFirstMonth = (exerciseName: string) => {
      const progressData = getExerciseProgressData(exerciseName);
      if (progressData.length === 0) return '';
      
      return new Intl.DateTimeFormat('de', { month: 'short' }).format(progressData[0].date);
    };

    const getMiddleMonth = (exerciseName: string) => {
      const progressData = getExerciseProgressData(exerciseName);
      if (progressData.length < 2) return '';
      
      const middleIndex = Math.floor(progressData.length / 2);
      return new Intl.DateTimeFormat('de', { month: 'short' }).format(progressData[middleIndex].date);
    };

    const getLastMonth = (exerciseName: string) => {
      const progressData = getExerciseProgressData(exerciseName);
      if (progressData.length === 0) return '';
      
      return new Intl.DateTimeFormat('de', { month: 'short' }).format(progressData[progressData.length - 1].date);
    };

    // Get best weight and reps for selected exercise
    const getExerciseBestWeight = (exerciseName: string) => {
      let bestWeight = 0;
      
      completedWorkouts.value.forEach(workout => {
        workout.exercises.forEach(exercise => {
          if (exercise.name === exerciseName) {
            exercise.sets.forEach(set => {
              if (set.weight > bestWeight) {
                bestWeight = set.weight;
              }
            });
          }
        });
      });
      
      return bestWeight;
    };

    const getExerciseBestReps = (exerciseName: string) => {
      let bestReps = 0;
      
      completedWorkouts.value.forEach(workout => {
        workout.exercises.forEach(exercise => {
          if (exercise.name === exerciseName) {
            exercise.sets.forEach(set => {
              if (set.reps > bestReps) {
                bestReps = set.reps;
              }
            });
          }
        });
      });
      
      return bestReps;
    };

    // Analytics computed properties
    const workoutsThisMonth = computed(() => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      return completedWorkouts.value.filter(workout => {
        const workoutDate = new Date(workout.completedAt);
        return workoutDate.getMonth() === currentMonth && workoutDate.getFullYear() === currentYear;
      }).length;
    });

    const workoutsPerWeek = computed(() => {
      if (completedWorkouts.value.length === 0) return '0';
      
      const oldestWorkout = completedWorkouts.value.reduce((oldest, current) => {
        const oldestDate = new Date(oldest.completedAt);
        const currentDate = new Date(current.completedAt);
        return currentDate < oldestDate ? current : oldest;
      }, completedWorkouts.value[0]);
      
      const oldestDate = new Date(oldestWorkout.completedAt);
      const currentDate = new Date();
      
      const diffTime = Math.abs(currentDate.getTime() - oldestDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffWeeks = diffDays / 7;
      
      // Return the average, but don't divide by zero
      return diffWeeks > 0 ? (completedWorkouts.value.length / diffWeeks).toFixed(1) : completedWorkouts.value.length.toString();
    });

    const mostFrequentWorkout = computed(() => {
      if (completedWorkouts.value.length === 0) return '-';
      
      const workoutCounts: Record<string, number> = {};
      let maxCount = 0;
      let mostFrequent = '';
      
      completedWorkouts.value.forEach(workout => {
        if (!workoutCounts[workout.name]) {
          workoutCounts[workout.name] = 0;
        }
        workoutCounts[workout.name]++;
        
        if (workoutCounts[workout.name] > maxCount) {
          maxCount = workoutCounts[workout.name];
          mostFrequent = workout.name;
        }
      });
      
      return mostFrequent;
    });

    // Calculate 1RM using the Brzycki formula
const getExercise1RM = (exerciseName: string) => {
  let bestEstimated1RM = 0;
  
  completedWorkouts.value.forEach(workout => {
    workout.exercises.forEach(exercise => {
      if (exercise.name === exerciseName) {
        exercise.sets.forEach(set => {
          if (set.reps > 0 && set.weight > 0) {
            // Brzycki: load × (36 / (37 - reps))
            const estimated1RM = set.weight * (36 / (37 - set.reps));
            if (estimated1RM > bestEstimated1RM) {
              bestEstimated1RM = estimated1RM;
            }
          }
        });
      }
    });
  });
  
  return Math.round(bestEstimated1RM);
};

// Calculate max volume (weight × reps) for an exercise
const getExerciseMaxVolume = (exerciseName: string) => {
  let maxVolume = 0;
  
  completedWorkouts.value.forEach(workout => {
    workout.exercises.forEach(exercise => {
      if (exercise.name === exerciseName) {
        let workoutVolume = 0;
        exercise.sets.forEach(set => {
          workoutVolume += set.weight * set.reps;
        });
        
        if (workoutVolume > maxVolume) {
          maxVolume = workoutVolume;
        }
      }
    });
  });
  
  return maxVolume;
};

    const totalWeightLifted = computed(() => {
      return completedWorkouts.value.reduce((total, workout) => total + workout.totalWeight, 0);
    });

    const totalWorkoutMinutes = computed(() => {
      return completedWorkouts.value.reduce((total, workout) => {
        // Convert duration string like "45 min" to number
        const minutes = parseInt(workout.duration.split(' ')[0]);
        return total + (isNaN(minutes) ? 0 : minutes);
      }, 0);
    });

    const avgWeightPerWorkout = computed(() => {
      if (completedWorkouts.value.length === 0) return '0';
      return Math.round(totalWeightLifted.value / completedWorkouts.value.length);
    });

    // Get top exercizes with best performance
    const topExercises = computed(() => {
      const exerciseStats: Record<string, { bestWeight: number, bestReps: number }> = {};
      
      completedWorkouts.value.forEach(workout => {
        workout.exercises.forEach(exercise => {
          if (!exerciseStats[exercise.name]) {
            exerciseStats[exercise.name] = { bestWeight: 0, bestReps: 0 };
          }
          
          // Parse best set info
          exercise.sets.forEach(set => {
            if (set.weight > exerciseStats[exercise.name].bestWeight) {
              exerciseStats[exercise.name].bestWeight = set.weight;
            }
            if (set.reps > exerciseStats[exercise.name].bestReps) {
              exerciseStats[exercise.name].bestReps = set.reps;
            }
          });
        });
      });
      
      // Convert to array and sort by best weight
      return Object.entries(exerciseStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.bestWeight - a.bestWeight)
        .slice(0, 5); // Top 5 exercises
    });
    
    onMounted(() => {
      loadCompletedWorkouts();
      initializeSelectedExercise();
    });
    
    // Add this hook to reload data when component is activated
    onActivated(() => {
      refreshHistory();
      initializeSelectedExercise();
    });
    
    return {
      groupedWorkouts,
      isHistoryEmpty,
      formatDate,
      refreshHistory,
      activeTab,
      selectedExercise,
      exerciseNames,
      getProgressPoints,
      getDataPoints,
      getMaxWeight,
      getMiddleWeight,
      getFirstMonth,
      getMiddleMonth,
      getLastMonth,
      getExerciseBestWeight,
      getExerciseBestReps,
      workoutsThisMonth,
      workoutsPerWeek,
      mostFrequentWorkout,
      totalWeightLifted,
      totalWorkoutMinutes,
      avgWeightPerWorkout,
      topExercises,
      timeOutline,
      barbellOutline,
      personOutline,
      addOutline,
      scaleOutline,
      analyticsOutline,
      getExercise1RM,
  getExerciseMaxVolume
    };
  }
});
</script>

<style scoped>
/* Full height container */
.full-height-container {
  min-height: 100%;
  background-color: var(--ion-color-light);
}

/* Tab navigation styles */
.tab-container {
  display: flex;
  justify-content: center;
  background-color: var(--ion-color-light-shade);
  border-radius: 8px;
  padding: 4px;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 6px;
  color: var(--ion-color-medium);
  font-weight: 500;
  transition: all 0.2s ease;
}

.tab-button.active {
  background-color: var(--ion-color-primary);
  color: white;
}

.tab-icon {
  margin-right: 6px;
}

.tab-content {
  padding-top: 8px;
  height: calc(100% - 56px); /* Adjust for tab height */
  overflow-y: auto;
}

.history-container {
  padding: 16px;
}

/* Analytics styles */
.analytics-container {
  padding: 16px;
}

.analytics-card {
  background-color: var(--ion-color-light-shade);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid var(--ion-color-light-tint);
}

.analytics-card h3 {
  margin: 0 0 16px 0;
  color: var(--ion-color-dark);
  font-size: 18px;
  font-weight: bold;
}

.statistics-container {
  display: flex;
  justify-content: space-between;
}

.statistic {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.statistic-value {
  font-size: 24px;
  font-weight: bold;
  color: #b388ff;
  margin-bottom: 4px;
}

.statistic-label {
  font-size: 12px;
  color: var(--ion-color-medium);
}

/* Exercise Selector */
.exercise-select-container {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.exercise-select-container label {
  margin-right: 8px;
  color: var(--ion-color-medium);
}

.exercise-select {
  flex: 1;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--ion-color-medium);
  background-color: var(--ion-color-light);
  color: var(--ion-color-dark);
}

/* Chart styles */
.chart-container {
  margin-bottom: 16px;
}

.chart-title {
  text-align: center;
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--ion-color-dark);
}

.chart-wrapper {
  background-color: var(--ion-color-light);
  border-radius: 8px;
  padding: 8px;
  height: 240px;
}

.progress-chart {
  width: 100%;
  height: 100%;
}

.progress-line {
  fill: none;
  stroke: #673ab7;
  stroke-width: 2;
}

.data-point {
  fill: #673ab7;
  stroke: white;
  stroke-width: 1;
}

.chart-grid {
  stroke: #d0d0d0;
  stroke-width: 0.5;
  stroke-dasharray: 4,4;
}

.chart-label {
  font-size: 10px;
  fill: var(--ion-color-medium);
}

.exercise-performance {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--ion-color-light-tint);
}

.exercise-performance:last-child {
  border-bottom: none;
}

.exercise-name {
  color: var(--ion-color-dark);
  font-weight: 500;
}

.exercise-stats {
  display: flex;
  gap: 16px;
  color: var(--ion-color-medium);
}

.best-weight, .best-reps {
  font-size: 14px;
}

/* Empty state styling */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh; /* Use viewport height instead of 100% */
  padding: 32px;
  text-align: center;
  color: var(--ion-color-medium);
}

.empty-state-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: var(--ion-color-medium);
}

.empty-state h2 {
  margin: 0 0 8px 0;
  font-size: 22px;
  color: var(--ion-color-dark); /* Ensure consistent text color */
}

.empty-state p {
  margin: 0;
  font-size: 16px;
  color: var(--ion-color-medium); /* Ensure consistent text color */
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
  color: var(--ion-color-dark);
}

.workout-count {
  color: var(--ion-color-medium);
}

.month-section {
  margin-bottom: 24px;
}

.workout-card {
  background-color: var(--ion-color-light-shade);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid var(--ion-color-light-tint); /* Added border using theme variable */
}

.workout-header {
  margin-bottom: 16px;
}

.workout-header h3 {
  margin: 0;
  color: var(--ion-color-dark);
  font-size: 20px;
  font-weight: bold;
}

.workout-header p {
  margin: 4px 0 0;
  color: var(--ion-color-medium);
  font-size: 14px;
}

.sets-section {
  display: flex;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ion-color-light-tint);
  margin-bottom: 8px;
}

.sets-label, .best-set-label {
  font-size: 14px;
  color: var(--ion-color-medium);
  font-weight: bold;
}

.exercise-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--ion-color-light-tint);
}

.sets-info {
  flex: 1;
  color: var(--ion-color-dark);
}

.best-set-info {
  color: var(--ion-color-dark);
  text-align: right;
}

.workout-stats {
  display: flex;
  margin-top: 16px;
  color: var(--ion-color-medium);
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

.custom-toolbar{
  padding-top: 24px;
}
.exercise-metrics {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--ion-color-light-tint);
}

.metric-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--ion-color-dark);
}

.metrics-container {
  display: flex;
  justify-content: space-between;
}

.metric {
  flex: 1;
  text-align: center;
  padding: 8px;
  background-color: var(--ion-color-light);
  border-radius: 8px;
  margin: 0 4px;
}

.metric:first-child {
  margin-left: 0;
}

.metric:last-child {
  margin-right: 0;
}

.metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #673ab7;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 12px;
  color: var(--ion-color-medium);
}
</style>