import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import CreateWorkouts from '../views/CreateWorkouts.vue';
import SearchWorkouts from '../views/SearchWorkouts.vue';


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
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
