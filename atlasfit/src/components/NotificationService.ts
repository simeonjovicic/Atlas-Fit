// src/services/NotificationService.ts
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';

export class NotificationService {
  // Schedule daily notifications at 8:00 PM
  private static NOTIFICATION_HOUR = 14;
  private static NOTIFICATION_MINUTE = 45;
  
  // Initialize notifications when app starts
  public static async initialize(): Promise<void> {
    try {
      // Request permission to send notifications
      const permissionStatus = await LocalNotifications.requestPermissions();
      
      if (permissionStatus.display === 'granted') {
        console.log('Notification permission granted');
        await this.scheduleDailyWorkoutReminder();
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }
  
  // Schedule daily workout reminder notification
  public static async scheduleDailyWorkoutReminder(): Promise<void> {
    try {
      // Cancel any existing notifications first
      await this.cancelAllNotifications();
      
      // Get user's preferences
      const workoutsPerWeek = await this.getUserWorkoutTarget();
      
      if (workoutsPerWeek <= 0) {
        console.log('User has not set a weekly workout target');
        return;
      }
      
      // Schedule daily notification for the next 7 days
      const now = new Date();
      
      for (let i = 0; i < 7; i++) {
        const notificationDate = new Date();
        notificationDate.setDate(now.getDate() + i);
        notificationDate.setHours(this.NOTIFICATION_HOUR, this.NOTIFICATION_MINUTE, 0);
        
        // Only schedule if it's in the future
        if (notificationDate > now) {
          await LocalNotifications.schedule({
            notifications: [
              {
                id: 1000 + i,
                title: 'Workout Reminder',
                body: 'Checking your workout progress...',
                schedule: { at: notificationDate },
                extra: { type: 'workout-reminder' }
              }
            ]
          });
        }
      }
      
      // Register listener for when notification is triggered
      LocalNotifications.addListener('localNotificationReceived', async (notification) => {
        if (notification.extra?.type === 'workout-reminder') {
          // Update the notification with current progress when triggered
          await this.updateWorkoutReminderNotification(notification.id);
        }
      });
      
      console.log('Daily workout reminders scheduled');
    } catch (error) {
      console.error('Error scheduling workout reminders:', error);
    }
  }
  
  // Update notification content with current workout progress
  private static async updateWorkoutReminderNotification(notificationId: number): Promise<void> {
    try {
      const { workoutsCompleted, workoutsTarget, remainingWorkouts } = await this.getCurrentWeekStats();
      
      let notificationBody: string;
      
      if (remainingWorkouts <= 0) {
        notificationBody = `Congratulations! You've completed your goal of ${workoutsTarget} workouts this week! 💪`;
      } else {
        notificationBody = `You've completed ${workoutsCompleted}/${workoutsTarget} workouts this week. ${remainingWorkouts} more to reach your goal! 💪`;
      }
      
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: 'Workout Progress',
            body: notificationBody,
            schedule: { at: new Date(Date.now() + 1000) }, // Show immediately
            extra: { type: 'workout-progress' }
          }
        ]
      });
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  }
  
  // Get user's weekly workout target
  private static async getUserWorkoutTarget(): Promise<number> {
    try {
      const profileData = localStorage.getItem('profile');
      if (profileData) {
        const profile = JSON.parse(profileData);
        return profile.workoutsPerWeek || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting workout target:', error);
      return 0;
    }
  }
  
  // Get current week's workout statistics
  private static async getCurrentWeekStats(): Promise<{ 
    workoutsCompleted: number, 
    workoutsTarget: number, 
    remainingWorkouts: number 
  }> {
    try {
      // Get user's target
      const workoutsTarget = await this.getUserWorkoutTarget();
      
      // Get current week's date range (Monday to Sunday)
      const now = new Date();
      const dayOfWeek = now.getDay() || 7; // Convert Sunday (0) to 7
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (dayOfWeek - 1)); // Go back to Monday
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Sunday
      weekEnd.setHours(23, 59, 59, 999);
      
      // Count workouts in this week
      const completedWorkoutsStr = localStorage.getItem('completedWorkouts');
      let workoutsCompleted = 0;
      
      if (completedWorkoutsStr) {
        const completedWorkouts = JSON.parse(completedWorkoutsStr);
        workoutsCompleted = completedWorkouts.filter((workout: any) => {
          const workoutDate = new Date(workout.completedAt);
          return workoutDate >= weekStart && workoutDate <= weekEnd;
        }).length;
      }
      
      // Calculate remaining workouts
      const remainingWorkouts = Math.max(0, workoutsTarget - workoutsCompleted);
      
      return { workoutsCompleted, workoutsTarget, remainingWorkouts };
    } catch (error) {
      console.error('Error calculating weekly stats:', error);
      return { workoutsCompleted: 0, workoutsTarget: 0, remainingWorkouts: 0 };
    }
  }
  
  // Cancel all scheduled notifications
  private static async cancelAllNotifications(): Promise<void> {
    try {
      const pendingNotifications = await LocalNotifications.getPending();
      if (pendingNotifications.notifications.length > 0) {
        const ids = pendingNotifications.notifications.map(n => n.id);
        await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
      }
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }
}