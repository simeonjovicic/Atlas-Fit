<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="custom-toolbar"> 
        <ion-title class="custom-title">Dashboard</ion-title>
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
      

      <div class="dashboard-container">
        <div class="welcome-message">
        <h1>Welcome back, {{ userName || 'User' }}</h1>
      </div>
        <div class="streak-card">
  <h2>Deine Streak</h2>
  <div class="streak-container">
    <div class="streak-box">
      <div class="streak-value">{{ currentStreak }}</div>
      <div class="streak-label">Aktuelle Streak</div>
      <div class="streak-subtitle">Tage in Folge</div>
    </div>
    <div class="streak-box">
      <div class="streak-value">{{ bestStreak }}</div>
      <div class="streak-label">Beste Streak</div>
      <div class="streak-subtitle">Persönlicher Rekord</div>
    </div>
  </div>
</div>
        
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

<div class="weekly-challenge-card">
    <h2>Wöchentliche Challenge</h2>
    <div v-if="challenge" class="challenge-content">
      <div class="challenge-header">
        <div class="challenge-title">{{ challenge.name }}</div>
        <div class="challenge-status" :class="{ 'completed': challengeCompleted }">
          {{ challengeCompleted ? 'Abgeschlossen' : 'In Bearbeitung' }}
        </div>
      </div>
      <p class="challenge-description">
        Führe diese Übung in einem Workout diese Woche aus, um die Challenge zu bestehen!
      </p>
      <div class="challenge-timer">
        <ion-icon :icon="timeOutline"></ion-icon>
        <span>Endet in {{ daysUntilReset }} Tagen</span>
      </div>
    </div>
    <div v-else class="no-challenge">
      <p>Lade deine wöchentliche Challenge...</p>
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
    <!-- Add target line here -->
    <div 
      v-if="workoutsPerWeekTarget > 0" 
      class="target-line" 
      :style="{ bottom: `${(workoutsPerWeekTarget / 6) * 180 + 33}px` }"
    >
      <span class="target-label">Ziel: {{ workoutsPerWeekTarget }}</span>
    </div>
    
    <div v-for="(week, index) in displayedWeeks" :key="index" class="graph-bar-container">
      <div class="graph-bar" :style="{ height: calculateBarHeight(week.count) }">
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
import { defineComponent, ref, computed, onMounted, watch, onActivated, onUnmounted } from 'vue';
import exercises from '@/resources/exercises.json';
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
import { workoutHistoryService, type CompletedWorkout } from '@/services/workoutHistoryService';
import { userSettingsService } from '@/services/userSettingsService';
import { profileService } from '@/services/profileService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';

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
    const workoutsPerWeekTarget = ref(0);
    const completedWorkouts = ref<CompletedWorkout[]>([]);
    const selectedPeriod = ref('month');
    const isLoading = ref(false);
    const userName = ref(''); // Add a ref for the user's name
    const challenge = ref(null);
    const challengeCompleted = ref(false);
    const daysUntilReset = ref(0);
    const currentStreak = ref(0);
    const bestStreak = ref(0);

    const calculateStreaks = async () => {
  if (completedWorkouts.value.length === 0) {
    currentStreak.value = 0;
    bestStreak.value = 0;
    return;
  }

  // Sort workouts by date (newest first)
  const sortedWorkouts = [...completedWorkouts.value].sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  
  // Convert dates to YYYY-MM-DD format for easy comparison
  const workoutDates = sortedWorkouts.map(workout => {
    const date = new Date(workout.completedAt);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  
  // Remove duplicate dates (only count one workout per day)
  const uniqueDates = [...new Set(workoutDates)];
  
  // Get today's date in the same YYYY-MM-DD format
  const today = new Date();
  const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Check if there's a workout today
  const hasWorkoutToday = uniqueDates[0] === todayFormatted;
  
  // Calculate current streak
  let streak = hasWorkoutToday ? 1 : 0; // Start with 1 if workout today
  
    // If no workout today, we need to check if there was one yesterday to continue streak
    if (!hasWorkoutToday) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayFormatted = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      
      if (uniqueDates[0] !== yesterdayFormatted) {
        // No workout yesterday, streak is 0
        currentStreak.value = 0;
        
        // Check stored best streak from Firebase
        try {
          const settings = await userSettingsService.getSettings();
          bestStreak.value = settings?.bestStreak || 0;
        } catch (error) {
          console.error('Failed to load best streak:', error);
          // Fallback to localStorage
          const savedBestStreak = localStorage.getItem('bestStreak');
          bestStreak.value = savedBestStreak ? parseInt(savedBestStreak) : 0;
        }
        return;
      }
      
      // There was a workout yesterday, start streak at 1
      streak = 1;
    }
  
  // Start index depends on whether we had a workout today
  let startIndex = hasWorkoutToday ? 1 : 0;
  
  // Check consecutive days
  for (let i = startIndex; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const previousDate = new Date(uniqueDates[i - 1]);
    previousDate.setDate(previousDate.getDate() - 1);
    
    // Compare dates
    const currentFormatted = uniqueDates[i];
    const expectedFormatted = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}-${String(previousDate.getDate()).padStart(2, '0')}`;
    
    if (currentFormatted === expectedFormatted) {
      streak++;
    } else {
      break;
    }
  }
  
  currentStreak.value = streak;
  
  // Update best streak
  const settings = await userSettingsService.getSettings();
  const previousBest = settings?.bestStreak || 0;
  bestStreak.value = Math.max(previousBest, streak);
  
  // Save best streak if it improved
  if (bestStreak.value > previousBest) {
    await userSettingsService.updateSetting('bestStreak', bestStreak.value);
    // Also update localStorage as backup
    localStorage.setItem('bestStreak', bestStreak.value.toString());
  }
  
  // Fallback: use localStorage if Firebase fails
  if (!settings) {
    const savedBestStreak = localStorage.getItem('bestStreak');
    bestStreak.value = savedBestStreak ? parseInt(savedBestStreak) : streak;
  }
};

    // Fetch the user's name from Firebase
    const fetchUserName = async () => {
      try {
        const profile = await profileService.getProfile();
        if (profile) {
          userName.value = profile.name || 'User';
          workoutsPerWeekTarget.value = profile.workoutsPerWeek || 0;
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Fallback to localStorage
        const savedProfile = localStorage.getItem('profile');
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          userName.value = profile.name || 'User';
          workoutsPerWeekTarget.value = profile.workoutsPerWeek || 0;
        }
      }
    };

    const generateWeeklyChallenge = async () => {
      // Get current date and create a week identifier
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)); // Start of week (Monday)
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (Sunday)
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekIdentifier = `week-${weekStart.getFullYear()}-${weekStart.getMonth() + 1}-${weekStart.getDate()}`;
      
      // Calculate days until reset
      const timeDiff = weekEnd.getTime() - now.getTime();
      daysUntilReset.value = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      try {
        // Check if we already have a challenge for this week from Firebase
        const savedChallenge = await userSettingsService.getWeeklyChallenge(weekIdentifier);
        
        if (savedChallenge) {
          // Use existing challenge
          challenge.value = savedChallenge;
        } else {
          if (!exercises || !exercises.length) {
            console.error('No exercises available in exercises.json');
            return;
          }
          
          // Generate new challenge
          const randomIndex = Math.floor(Math.random() * exercises.length);
          challenge.value = exercises[randomIndex];
          
          // Save this challenge to Firebase
          await userSettingsService.saveWeeklyChallenge(weekIdentifier, challenge.value);
          // Also save to localStorage as backup
          localStorage.setItem(`weeklyChallenge-${weekIdentifier}`, JSON.stringify(challenge.value));
        }
      } catch (error) {
        console.error('Failed to load weekly challenge:', error);
        // Fallback to localStorage
        const savedChallenge = localStorage.getItem(`weeklyChallenge-${weekIdentifier}`);
        
        if (savedChallenge) {
          challenge.value = JSON.parse(savedChallenge);
        } else {
          if (!exercises || !exercises.length) {
            console.error('No exercises available in exercises.json');
            return;
          }
          
          const randomIndex = Math.floor(Math.random() * exercises.length);
          challenge.value = exercises[randomIndex];
          localStorage.setItem(`weeklyChallenge-${weekIdentifier}`, JSON.stringify(challenge.value));
        }
      }
      
      // Check if challenge is completed
      checkChallengeCompletion(weekStart, weekEnd);
    };

// Add function to check if challenge is completed
const checkChallengeCompletion = (weekStart: Date, weekEnd: Date) => {
  if (!challenge.value) return;
  
  challengeCompleted.value = false;
  
  // Check completed workouts for this challenge
  for (const workout of completedWorkouts.value) {
    const workoutDate = new Date(workout.completedAt);
    
    // Only check workouts from current week
    if (workoutDate >= weekStart && workoutDate <= weekEnd) {
      // Check if any exercise in this workout matches our challenge
      for (const exercise of workout.exercises) {
        if (exercise.name === challenge.value.name) {
          challengeCompleted.value = true;
          return;
        }
      }
    }
  }
};

    const loadCompletedWorkouts = async () => {
      isLoading.value = true;
      try {
        const savedWorkouts = await workoutHistoryService.getCompletedWorkouts();
        console.log('Loaded workouts from Firebase:', savedWorkouts.length);
        completedWorkouts.value = savedWorkouts;
        await calculateStreaks(); // Calculate streaks after loading workouts
      } catch (error) {
        console.error('Failed to load workouts from Firebase:', error);
        // No fallback - only use Firebase for security
        completedWorkouts.value = [];
        await calculateStreaks(); // Set streaks to 0
      } finally {
        isLoading.value = false;
      }
    };

   const refreshHistory = async (event: CustomEvent) => {
      try {
        await loadCompletedWorkouts(); // This now includes calculateStreaks()
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
  
  // Determine start date based on selected period
  switch (periodType) {
    case 'month':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 28); // 4 weeks back
      break;
    case '3months':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3); // 3 months back
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1); // 1 year back
      break;
    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 28);
  }
  
  // Adjust to start of week (Monday)
  const dayOfWeek = startDate.getDay() || 7; // Convert Sunday (0) to 7
  if (dayOfWeek !== 1) { // If not Monday
    startDate.setDate(startDate.getDate() - (dayOfWeek - 1)); // Go back to Monday
  }
  startDate.setHours(0, 0, 0, 0);
  
  // Generate weekly ranges up to current date
  let currentWeekStart = new Date(startDate);
  
  while (currentWeekStart <= now) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 6); // Sunday
    weekEnd.setHours(23, 59, 59, 999);
    
    // Format as DD.MM.
    const label = `${currentWeekStart.getDate()}.${currentWeekStart.getMonth() + 1}.`;
    
    weeks.push({
      startDate: new Date(currentWeekStart),
      endDate: new Date(weekEnd),
      label,
      count: 0
    });
    
    // Move to next Monday
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }
  
  // For year view, reduce number of weeks to avoid overcrowding
  if (periodType === 'year') {
    // Return ~12 evenly spaced weeks
    const step = Math.max(1, Math.floor(weeks.length / 12));
    return weeks.filter((_, index) => index % step === 0).slice(-8);
  }
  
  // Return the last 8 weeks for other views
  return weeks.slice(-8);
};
    
    const displayedWeeks = computed(() => {
  const weeks = getWeeksInPeriod(selectedPeriod.value);
  
  // Reset counts
  weeks.forEach(week => week.count = 0);
  
  // Count workouts for each week
  completedWorkouts.value.forEach(workout => {
    const workoutDate = new Date(workout.completedAt);
    
    for (const week of weeks) {
      // Check if workout falls within this week
      if (workoutDate >= week.startDate && workoutDate <= week.endDate) {
        week.count++;
        break;
      }
    }
  });
  
  console.log('Weeks with workout counts:', weeks);
  return weeks;
});
    const checkAndRefreshWeeks = () => {
  // Force refresh of the displayedWeeks computed property
  selectedPeriod.value = selectedPeriod.value;
  console.log("Refreshed week data:", displayedWeeks.value);
};
    
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
    
    // Watch for auth changes to reload data when user switches
    let unsubscribeAuth: (() => void) | null = null;
    
    onMounted(async () => {
      checkAndRefreshWeeks();
      // Fetch the user's name when the component is mounted
      await fetchUserName();
      await loadCompletedWorkouts();
      await generateWeeklyChallenge();
      
      // Watch for auth changes
      unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Reload all data when user changes
          await fetchUserName();
          await loadCompletedWorkouts();
          await generateWeeklyChallenge();
        } else {
          // Clear data when logged out
          completedWorkouts.value = [];
          userName.value = '';
          currentStreak.value = 0;
          bestStreak.value = 0;
        }
      });
    });

    onActivated(async () => {
       checkAndRefreshWeeks();
      // Fetch the user's name when the component is activated
      await fetchUserName();
      await loadCompletedWorkouts();
      await generateWeeklyChallenge();
    });
    
    // Cleanup auth watcher
    onUnmounted(() => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    });

    watch(completedWorkouts, () => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)); // Start of week (Monday)
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // End of week (Sunday)
  weekEnd.setHours(23, 59, 59, 999);
  
  checkChallengeCompletion(weekStart, weekEnd);
});
    
    return {
      challenge,
      challengeCompleted,
      daysUntilReset,
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
      userName, // Return the user's name
      workoutsPerWeekTarget,
      currentStreak, // Add current streak
      bestStreak  
    };
  }
});
</script>

<style scoped>
.weekly-challenge-card {
  background-color: var(--ion-color-light-shade);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.challenge-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--ion-color-dark);
}

.challenge-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  background-color: #ff9d00;
  color: white;
}

.challenge-status.completed {
  background-color: #4caf50;
}

.challenge-description {
  color: var(--ion-color-medium);
  margin-bottom: 12px;
  font-size: 14px;
}

.challenge-timer {
  display: flex;
  align-items: center;
  color: var(--ion-color-medium);
  font-size: 12px;
}

.challenge-timer ion-icon {
  margin-right: 4px;
}

.no-challenge {
  color: var(--ion-color-medium);
  text-align: center;
  padding: 16px;
}

.dashboard-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  background-color: var(--ion-color-light);
}

.navbar-spacer {
  height: 47px;
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
  position: relative;
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
  border-bottom: 0.1px solid var(--ion-color-light-tint);
  position: relative;
}

.welcome-message h1 {
  margin: 0;
  font-size: 24px;
  font: bold;
  color: var(--ion-color-dark);
  
}

.target-line {
  position: absolute;
  width: 103%;
  height: 1.5px;
  background-color: #FF9800;
  left: 0;
  z-index: 1;
}

.custom-toolbar{
  padding-top: 24px;
}

.target-label {
  position: absolute;
  right: 0;
  padding: 2px 5px;
  background-color: #FF9800;
  color: white;
  font-size: 10px;
  border-radius: 3px;
}
.streak-card {
  background-color: var(--ion-color-light-shade);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.streak-container {
  display: flex;
  justify-content: space-between;
}

.streak-box {
  text-align: center;
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.streak-value {
  font-size: 32px;
  font-weight: bold;
  color: #b388ff;
  margin-bottom: 4px;
}

.streak-label {
  font-size: 16px;
  font-weight: bold;
  color: var(--ion-color-dark);
  margin-bottom: 2px;
}

.streak-subtitle {
  font-size: 12px;
  color: var(--ion-color-medium);
}
</style>