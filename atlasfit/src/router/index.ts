import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '@/views/HomePage.vue';
import CreateWorkouts from '@/views/CreateWorkouts.vue';
import SearchWorkouts from '@/views/SearchWorkouts.vue';
import WorkoutExecution from '@/views/WorkoutExecution.vue';
import ProfileView from '@/views/ProfileView.vue';
import WorkoutHistory from '@/views/WorkoutHistory.vue';
import LoginPage from '@/views/LoginPage.vue';
import RegisterPage from '@/views/RegisterPage.vue';
import { auth } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/workouts',
    name: 'Workouts',
    component: SearchWorkouts,
    meta: { requiresAuth: true }
  },
  {
    path: '/createWorkout',
    name: 'Create-Workout',
    component: CreateWorkouts,
    meta: { requiresAuth: true }
  },
  {
    path: '/workouts/:workoutId',
    name: 'WorkoutExecution',
    component: WorkoutExecution,
    props: route => ({ 
      workoutId: Number(route.params.workoutId)
    }),
    meta: {
      requiresAuth: true,
      hideGlobalHeader: true
    }
  },
  {
    path: '/profile',
    name: 'ProfileView',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'WorkoutHistory',
    component: WorkoutHistory,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Wait for Firebase Auth to initialize
let authInitialized = false;
let currentUser: any = null;

onAuthStateChanged(auth, (user) => {
  authInitialized = true;
  currentUser = user;
});

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  // Wait for auth to initialize (max 2 seconds)
  if (!authInitialized) {
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => resolve(), 2000);
      const unsubscribe = onAuthStateChanged(auth, () => {
        clearTimeout(timeout);
        unsubscribe();
        resolve();
      });
    });
  }

  const isAuthenticated = currentUser !== null || auth.currentUser !== null;
  const requiresAuth = to.meta.requiresAuth;
  const requiresGuest = to.meta.requiresGuest;
  const isPublic = to.meta.public;

  // If route requires authentication and user is not authenticated
  if (requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }

  // If route requires guest (login/register) and user is authenticated
  if (requiresGuest && isAuthenticated) {
    next('/home');
    return;
  }

  // Otherwise, proceed
  next();
});

export default router
