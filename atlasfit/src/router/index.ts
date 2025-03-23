import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import CreateWorkouts from '../views/CreateWorkouts.vue';
import SearchWorkouts from '../views/SearchWorkouts.vue';
import WorkoutExecution from '@/views/WorkoutExecution.vue';
import ProfileView from '@/views/ProfileView.vue';
import WorkoutHistory from '@/views/WorkoutHistory.vue';
import VideoPlayer from '@/views/VideoPlayer.vue';
import WelcomePage from '@/views/WelcomePage.vue';


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/workouts',
    name: 'Workouts',
    component: SearchWorkouts
  },
  {
    path: '/createWorkout',
    name: 'Create-Workout',
    component: CreateWorkouts
  },
  {
    path: '/workouts/:workoutId',
    name: 'WorkoutExecution',
  component: WorkoutExecution,
  props: route => ({ 
    workoutId: Number(route.params.workoutId)}),
    meta: {
      hideGlobalHeader: true // A flag your layout can check
    }
  },
  {
    path: '/profile',
    name: 'ProfileView',
    component: ProfileView
  },
  {
    path: '/history',
    name: 'WorkoutHistory',
    component: WorkoutHistory
  },
  {
    path: '/edit',
    name: 'VideoPlayer.vue',
    component: VideoPlayer
  },
  {
     path: '/welcome',
    name: 'Welcome',
    component: WelcomePage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
