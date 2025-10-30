<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar class="custom-toolbar">
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    
    
    <ion-content class="ion-padding-bottom">
      <!-- Tab Navigation -->
      <div class="tab-container">
        <div 
          class="tab-button" 
          :class="{ 'active': activeTab === 'profile' }"
          @click="activeTab = 'profile'"
        >
          <ion-icon :icon="personCircle" class="tab-icon"></ion-icon>
          <span>Profile</span>
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
      
      <!-- Profile Tab Content -->
      <div v-if="activeTab === 'profile'" class="tab-content">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="profile-photo-container" @click="selectImage">
            <img :src="profilePhoto || '/assets/default-avatar.png'" alt="Profile" class="profile-photo" />
            <div class="edit-overlay">
              <ion-icon :icon="camera"></ion-icon>
            </div>
          </div>
          <h2 class="profile-name">{{ profile.name || 'Your Name' }}</h2>
        </div>
        
        <div class="form-container">
          <!-- Basic Information Card -->
          <ion-card class="profile-card">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="personCircle" class="section-icon"></ion-icon>
                Personal Info
              </ion-card-title>
            </ion-card-header>
            
            <ion-card-content>
              <ion-list lines="full">
                <ion-item>
                  <ion-label position="stacked">Name</ion-label>
                  <ion-input v-model="profile.name" placeholder="Enter your name"></ion-input>
                </ion-item>
                
                <ion-item>
                  <ion-label position="stacked">Weight (kg)</ion-label>
                  <ion-input 
                    type="number" 
                    v-model="profile.weight" 
                    placeholder="0.0"
                    step="0.1"
                    inputmode="decimal"
                  ></ion-input>
                </ion-item>
                
                <ion-item>
                  <ion-label position="stacked">Height (cm)</ion-label>
                  <ion-input 
                    type="number" 
                    v-model="profile.height" 
                    placeholder="0.0"
                    step="0.1"
                    inputmode="decimal"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="stacked">Workouts per Week</ion-label>
                  <ion-input 
                    type="number" 
                    v-model="profile.workoutsPerWeek" 
                    placeholder="0"
                    min="0"
                    max="7"
                    inputmode="numeric"
                  ></ion-input>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>
          
          <!-- Measurements Card -->
          <ion-card class="profile-card">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="bodyOutline" class="section-icon"></ion-icon>
                Body Measurements
                <span class="unit-indicator">cm</span>
              </ion-card-title>
            </ion-card-header>
            
            <ion-card-content>
              <!-- Upper Body -->
              <div class="measurement-section">
                <h4>
                  <ion-icon :icon="fitnessOutline" class="subsection-icon"></ion-icon>
                  Upper Body
                </h4>
                <ion-list lines="full">
                  <ion-item>
                    <ion-label>Chest</ion-label>
                    <ion-input 
                      type="number" 
                      v-model="profile.measurements.chest" 
                      placeholder="0.0"
                      step="0.1"
                      inputmode="decimal"
                    ></ion-input>
                  </ion-item>
                  
                  <ion-item>
                    <ion-label>Shoulders</ion-label>
                    <ion-input 
                      type="number" 
                      v-model="profile.measurements.shoulders" 
                      placeholder="0.0"
                      step="0.1"
                      inputmode="decimal"
                    ></ion-input>
                  </ion-item>
                  
                  <ion-item>
                    <ion-label>Waist</ion-label>
                    <ion-input 
                      type="number" 
                      v-model="profile.measurements.waist" 
                      placeholder="0.0"
                      step="0.1"
                      inputmode="decimal"
                    ></ion-input>
                  </ion-item>
                  
                  <ion-item>
                    <ion-label>Hips</ion-label>
                    <ion-input 
                      type="number" 
                      v-model="profile.measurements.hips" 
                      placeholder="0.0"
                      step="0.1"
                      inputmode="decimal"
                    ></ion-input>
                  </ion-item>
                </ion-list>
              </div>
              
              <!-- Arms Section -->
              <div class="measurement-section">
                <h4>
                  <ion-icon :icon="barbellOutline" class="subsection-icon"></ion-icon>
                  Arms
                </h4>
                <ion-list lines="full">
                  <ion-row>
                    <ion-col>
                      <ion-item>
                        <ion-label>Bicep (L)</ion-label>
                        <ion-input 
                          type="number" 
                          v-model="profile.measurements.bicepLeft" 
                          placeholder="0.0"
                          step="0.1"
                          inputmode="decimal"
                        ></ion-input>
                      </ion-item>
                    </ion-col>
                    <ion-col>
                      <ion-item>
                        <ion-label>Bicep (R)</ion-label>
                        <ion-input 
                          type="number" 
                          v-model="profile.measurements.bicepRight" 
                          placeholder="0.0"
                          step="0.1"
                          inputmode="decimal"
                        ></ion-input>
                      </ion-item>
                    </ion-col>
                  </ion-row>
                  
                  <ion-row>
                    <ion-col>
                      <ion-item>
                        <ion-label>Forearm (L)</ion-label>
                        <ion-input 
                          type="number" 
                          v-model="profile.measurements.forearmLeft" 
                          placeholder="0.0"
                          step="0.1"
                          inputmode="decimal"
                        ></ion-input>
                      </ion-item>
                    </ion-col>
                    <ion-col>
                      <ion-item>
                        <ion-label>Forearm (R)</ion-label>
                        <ion-input 
                          type="number" 
                          v-model="profile.measurements.forearmRight" 
                          placeholder="0.0"
                          step="0.1"
                          inputmode="decimal"
                        ></ion-input>
                      </ion-item>
                    </ion-col>
                  </ion-row>
                </ion-list>
              </div>
              
              <!-- Legs Section -->
              <div class="measurement-section">
                <h4>
                  <ion-icon :icon="walkOutline" class="subsection-icon"></ion-icon>
                  Legs
                </h4>
                <ion-list lines="full">
                  <ion-row>
                    <ion-col>
                      <ion-item>
                        <ion-label>Thigh (L)</ion-label>
                        <ion-input 
                          type="number" 
                          v-model="profile.measurements.thighLeft" 
                          placeholder="0.0"
                          step="0.1"
                          inputmode="decimal"
                        ></ion-input>
                      </ion-item>
                    </ion-col>
                    <ion-col>
                      <ion-item>
                        <ion-label>Thigh (R)</ion-label>
                        <ion-input 
                          type="number" 
                          v-model="profile.measurements.thighRight" 
                          placeholder="0.0"
                          step="0.1"
                          inputmode="decimal"
                        ></ion-input>
                      </ion-item>
                    </ion-col>
                  </ion-row>
                  
                  <ion-row>
                    <ion-col>
                      <ion-item>
                        <ion-label>Calf (L)</ion-label>
                        <ion-input 
                          type="number" 
                          v-model="profile.measurements.calfLeft" 
                          placeholder="0.0"
                          step="0.1"
                          inputmode="decimal"
                        ></ion-input>
                      </ion-item>
                    </ion-col>
                    <ion-col>
                      <ion-item>
                        <ion-label>Calf (R)</ion-label>
                        <ion-input 
                          type="number" 
                          v-model="profile.measurements.calfRight" 
                          placeholder="0.0"
                          step="0.1"
                          inputmode="decimal"
                        ></ion-input>
                      </ion-item>
                    </ion-col>
                  </ion-row>
                </ion-list>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
        
        <ion-button expand="block" class="save-button" @click="saveProfile">
          <ion-icon :icon="saveOutline" slot="start"></ion-icon>
          Save Changes
        </ion-button>
      </div>
      
      <!-- Analytics Tab Content -->
      <!-- Analytics Tab Content -->
<div v-if="activeTab === 'analytics'" class="tab-content">
  <div v-if="profileHistory.length <= 1" class="empty-state">
    <ion-icon :icon="analyticsOutline" class="empty-state-icon"></ion-icon>
    <h2>No Data Available</h2>
    <p>Save your profile multiple times to track changes.</p>
  </div>
  
  <div v-else class="analytics-container">
    <!-- Stats Overview Card -->
    <div class="analytics-card">
      <h3>Tracking Overview</h3>
      <div class="statistics-container">
        <div class="statistic">
          <div class="statistic-value">{{ profileHistory.length }}</div>
          <div class="statistic-label">Measurements</div>
        </div>
        <div class="statistic">
          <div class="statistic-value">{{ totalTrackedDays }}</div>
          <div class="statistic-label">Days Tracked</div>
        </div>
        <div class="statistic">
          <div class="statistic-value">{{ getMeasurementChange('weight') }}</div>
          <div class="statistic-label">Weight Change</div>
        </div>
      </div>
    </div>

    <!-- Measurement Progress Card -->
    <div class="analytics-card">
      <h3>Body Measurement Progress</h3>
      <div class="exercise-select-container">
        <label for="measurement-select">Select Measurement:</label>
        <select id="measurement-select" v-model="selectedMeasurement" class="exercise-select">
          <option v-for="measurement in measurementNames" :key="measurement" :value="measurement">
            {{ measurement }}
          </option>
        </select>
      </div>
      
      <div class="chart-container">
        <h4 class="chart-title">
          {{ selectedMeasurement }} Progress 
          ({{ getMeasurementUnit(selectedMeasurement) }})
        </h4>
        <div class="chart-wrapper">
          <svg class="progress-chart" viewBox="0 0 500 200">
            <!-- Y-axis labels -->
            <text x="20" y="20" class="chart-label">{{getMaxValue(selectedMeasurement)}}</text>
            <text x="20" y="100" class="chart-label">{{getMiddleValue(selectedMeasurement)}}</text>
            <text x="20" y="180" class="chart-label">{{getMinValue(selectedMeasurement)}}</text>
            
            <!-- Horizontal grid lines -->
            <line x1="40" y1="20" x2="480" y2="20" class="chart-grid" />
            <line x1="40" y1="100" x2="480" y2="100" class="chart-grid" />
            <line x1="40" y1="180" x2="480" y2="180" class="chart-grid" />
            
            <!-- X-axis labels -->
            <text x="40" y="195" class="chart-label">{{getFirstDate(selectedMeasurement)}}</text>
            <text x="260" y="195" class="chart-label">{{getMiddleDate(selectedMeasurement)}}</text>
            <text x="480" y="195" class="chart-label">{{getLastDate(selectedMeasurement)}}</text>
            
            <!-- Progress line -->
            <polyline
              :points="getProgressPoints(selectedMeasurement)"
              class="progress-line"
            />
            
            <!-- Data points -->
            <template v-for="(point, index) in getDataPoints(selectedMeasurement)" :key="index">
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
      
      <!-- Progress metrics -->
      <div class="exercise-metrics">
        <div class="metric-title">Measurement Metrics</div>
        <div class="metrics-container">
          <div class="metric">
            <div class="metric-value">{{getMaxValue(selectedMeasurement)}} {{getMeasurementUnit(selectedMeasurement)}}</div>
            <div class="metric-label">Maximum</div>
          </div>
          <div class="metric">
            <div class="metric-value">{{getMinValue(selectedMeasurement)}} {{getMeasurementUnit(selectedMeasurement)}}</div>
            <div class="metric-label">Minimum</div>
          </div>
          <div class="metric">
            <div class="metric-value">{{getMeasurementChange(selectedMeasurement)}} {{getMeasurementUnit(selectedMeasurement)}}</div>
            <div class="metric-label">Change</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
      
      <div class="navbar-spacer"></div>
    </ion-content>
  </ion-page>
</template>

<script>
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonList,
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonRow,
  IonCol,
  actionSheetController
} from '@ionic/vue';
import { 
  camera, 
  personCircle, 
  bodyOutline, 
  fitnessOutline, 
  barbellOutline, 
  walkOutline, 
  saveOutline,
  analyticsOutline,
  timeOutline
} from 'ionicons/icons';
import { defineComponent, ref, computed } from 'vue';
import profilePicture from '@/resources/default-profile.jpg';
import { profileService } from '@/services/profileService';
import { toastController } from '@ionic/vue';

export default defineComponent({
  name: 'ProfilePage',
  components: {
    IonPage, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonList,
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonRow,
    IonCol
  },
  setup() {
    const profilePhoto = ref('');
    const activeTab = ref('profile');
    const selectedMeasurement = ref('');
    
    const profile = ref({
      name: '',
      weight: null,
      height: null,
      workoutsPerWeek: null,
      measurements: {
        chest: null,
        bicepLeft: null,
        bicepRight: null,
        forearmLeft: null,
        forearmRight: null,
        shoulders: null,
        waist: null,
        hips: null,
        thighLeft: null,
        thighRight: null,
        calfLeft: null,
        calfRight: null
      }
    });

    // For storing profile history
    const profileHistory = ref([]);

    // Fetch profile data
    const fetchProfile = async () => {
      try {
        // Try to migrate from localStorage first (one-time)
        await profileService.migrateFromLocalStorage();
        
        // Fetch the profile data from Firestore
        const firestoreProfile = await profileService.getProfile();
        
        if (firestoreProfile) {
          profile.value = {
            name: firestoreProfile.name || '',
            weight: firestoreProfile.weight,
            height: firestoreProfile.height,
            workoutsPerWeek: firestoreProfile.workoutsPerWeek,
            measurements: firestoreProfile.measurements
          };
          
          // Set profile photo URL
          if (firestoreProfile.profilePhotoURL) {
            profilePhoto.value = firestoreProfile.profilePhotoURL;
          } else {
            profilePhoto.value = profilePicture;
          }
        } else {
          // Initialize empty profile
          profile.value = {
            name: '',
            weight: null,
            height: null,
            workoutsPerWeek: null,
            measurements: {
              chest: null,
              bicepLeft: null,
              bicepRight: null,
              forearmLeft: null,
              forearmRight: null,
              shoulders: null,
              waist: null,
              hips: null,
              thighLeft: null,
              thighRight: null,
              calfLeft: null,
              calfRight: null
            }
          };
          profilePhoto.value = profilePicture;
        }
        
        // Load profile history
        const history = await profileService.getProfileHistory();
        profileHistory.value = history;
        
        // Initialize selected measurement
        initializeSelectedMeasurement();
      } catch (error) {
        console.error('Error fetching profile:', error);
        const toast = await toastController.create({
          message: 'Fehler beim Laden des Profils',
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
      }
    };

    const selectImage = async () => {
      const actionSheet = await actionSheetController.create({
        header: 'Profile Photo',
        buttons: [
          {
            text: 'Choose from Gallery',
            handler: async () => {
              // Create a file input element
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              
              // When a file is selected
              input.onchange = async (event) => {
                const file = event.target.files[0];
                if (file) {
                  try {
                    // Show loading toast
                    const loadingToast = await toastController.create({
                      message: 'Bild wird hochgeladen...',
                      duration: 0,
                      position: 'top'
                    });
                    await loadingToast.present();
                    
                    // Upload to Firebase Storage
                    const downloadURL = await profileService.uploadProfilePhoto(file);
                    profilePhoto.value = downloadURL;
                    
                    // Close loading toast
                    await loadingToast.dismiss();
                    
                    // Show success toast
                    const successToast = await toastController.create({
                      message: 'Profilbild erfolgreich hochgeladen!',
                      duration: 2000,
                      position: 'top',
                      color: 'success'
                    });
                    await successToast.present();
                  } catch (error) {
                    console.error('Error uploading profile photo:', error);
                    const errorToast = await toastController.create({
                      message: 'Fehler beim Hochladen des Bildes',
                      duration: 3000,
                      position: 'top',
                      color: 'danger'
                    });
                    await errorToast.present();
                  }
                }
              };
              
              // Trigger file selection dialog
              input.click();
            }
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]
      });
      
      await actionSheet.present();
    };

    const saveProfile = async () => {
      try {
        // Create a history record before saving
        const timestamp = new Date().toISOString();
        const historyRecord = {
          timestamp,
          weight: profile.value.weight,
          height: profile.value.height,
          measurements: { ...profile.value.measurements }
        };
        
        // Add the new record to history
        await profileService.addProfileHistoryEntry(historyRecord);
        profileHistory.value.push(historyRecord);
        
        // Limit local history display
        if (profileHistory.value.length > 100) {
          profileHistory.value = profileHistory.value.slice(-100);
        }
        
        // Save the current profile to Firestore
        await profileService.saveProfile({
          name: profile.value.name,
          weight: profile.value.weight,
          height: profile.value.height,
          workoutsPerWeek: profile.value.workoutsPerWeek,
          measurements: profile.value.measurements
        });

        console.log('Saving profile:', profile.value);
        console.log('Profile history:', profileHistory.value);

        // Show success toast
        const toast = await toastController.create({
          message: 'Profil erfolgreich aktualisiert!',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
      } catch (error) {
        console.error('Error saving profile', error);
        const toast = await toastController.create({
          message: 'Fehler beim Speichern des Profils',
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
      }
    };
    
    // Get list of all available measurements
    const measurementNames = computed(() => {
      const basicMeasurements = ['weight', 'height'];
      const bodyMeasurements = Object.keys(profile.value.measurements);
      
      return [...basicMeasurements, ...bodyMeasurements];
    });
    
    // Initialize selected measurement when data loads
    const initializeSelectedMeasurement = () => {
      if (measurementNames.value.length > 0 && !selectedMeasurement.value) {
        selectedMeasurement.value = 'weight'; // Default to weight
      }
    };
    
    // Get measurement progress data for charts
    const getMeasurementProgressData = (measurement) => {
      const progressData = [];
      
      profileHistory.value.forEach(record => {
        const date = new Date(record.timestamp);
        let value = null;
        
        // Check if it's a basic measurement or body measurement
        if (measurement === 'weight' || measurement === 'height') {
          value = record[measurement];
        } else if (record.measurements && record.measurements[measurement] !== undefined) {
          value = record.measurements[measurement];
        }
        
        if (value !== null && value !== undefined) {
          progressData.push({
            date,
            value
          });
        }
      });
      
      // Sort by date
      return progressData.sort((a, b) => a.date.getTime() - b.date.getTime());
    };
    
    // Calculate points for the SVG polyline
    const getProgressPoints = (measurement) => {
      const progressData = getMeasurementProgressData(measurement);
      if (progressData.length === 0) return '';
      
      const points = [];
      const maxValue = Math.max(...progressData.map(p => p.value));
      const minValue = Math.min(...progressData.map(p => p.value));
      const valueRange = maxValue - minValue;
      
      const minDate = progressData[0].date.getTime();
      const maxDate = progressData[progressData.length - 1].date.getTime();
      const dateRange = maxDate - minDate;
      
      progressData.forEach(point => {
        // Calculate x position (date)
        const xPos = dateRange === 0 ? 40 : 40 + (440 * (point.date.getTime() - minDate) / dateRange);
        
        // Calculate y position (value) - invert since SVG y-axis starts from top
        // Add padding by using 0.9 * value range to not hit the exact top/bottom
        const yPos = valueRange === 0 ? 100 : 
                    180 - (160 * (point.value - minValue) / (valueRange * 1.1));
        
        points.push(`${xPos},${yPos}`);
      });
      
      return points.join(' ');
    };
    
    // Get data points for displaying circles on the line
    const getDataPoints = (measurement) => {
      const progressData = getMeasurementProgressData(measurement);
      if (progressData.length === 0) return [];
      
      const points = [];
      const maxValue = Math.max(...progressData.map(p => p.value));
      const minValue = Math.min(...progressData.map(p => p.value));
      const valueRange = maxValue - minValue;
      
      const minDate = progressData[0].date.getTime();
      const maxDate = progressData[progressData.length - 1].date.getTime();
      const dateRange = maxDate - minDate;
      
      progressData.forEach(point => {
        // Calculate x position (date)
        const xPos = dateRange === 0 ? 40 : 40 + (440 * (point.date.getTime() - minDate) / dateRange);
        
        // Calculate y position (value) - invert since SVG y-axis starts from top
        const yPos = valueRange === 0 ? 100 : 
                    180 - (160 * (point.value - minValue) / (valueRange * 1.1));
        
        points.push({
          date: point.date,
          value: point.value,
          x: xPos,
          y: yPos
        });
      });
      
      return points;
    };
    
    // Get max value for y-axis label
    const getMaxValue = (measurement) => {
      const progressData = getMeasurementProgressData(measurement);
      if (progressData.length === 0) return '0';
      
      return Math.max(...progressData.map(p => p.value)).toFixed(1);
    };
    
    // Get middle value for y-axis label
    const getMiddleValue = (measurement) => {
      const progressData = getMeasurementProgressData(measurement);
      if (progressData.length === 0) return '0';
      
      const maxVal = Math.max(...progressData.map(p => p.value));
      const minVal = Math.min(...progressData.map(p => p.value));
      return ((maxVal + minVal) / 2).toFixed(1);
    };
    
    // Get min value for y-axis label
    const getMinValue = (measurement) => {
      const progressData = getMeasurementProgressData(measurement);
      if (progressData.length === 0) return '0';
      
      return Math.min(...progressData.map(p => p.value)).toFixed(1);
    };
    
    // Get dates for x-axis labels
    const getFirstDate = (measurement) => {
      const progressData = getMeasurementProgressData(measurement);
      if (progressData.length === 0) return '';
      
      return new Intl.DateTimeFormat('de', { month: 'short', day: 'numeric' }).format(progressData[0].date);
    };
    
    const getMiddleDate = (measurement) => {
      const progressData = getMeasurementProgressData(measurement);
      if (progressData.length < 2) return '';
      
      const middleIndex = Math.floor(progressData.length / 2);
      return new Intl.DateTimeFormat('de', { month: 'short', day: 'numeric' }).format(progressData[middleIndex].date);
    };
    
    const getLastDate = (measurement) => {
      const progressData = getMeasurementProgressData(measurement);
      if (progressData.length === 0) return '';
      
      return new Intl.DateTimeFormat('de', { month: 'short', day: 'numeric' }).format(progressData[progressData.length - 1].date);
    };
    
    // Calculate measurement statistics
    const getMeasurementChange = (measurement) => {
      const progressData = getMeasurementProgressData(measurement);
      if (progressData.length < 2) return '0';
      
      const firstValue = progressData[0].value;
      const lastValue = progressData[progressData.length - 1].value;
      const change = lastValue - firstValue;
      
      return change.toFixed(1);
    };
    
    const getMeasurementUnit = (measurement) => {
      if (measurement === 'weight') return 'kg';
      if (measurement === 'height') return 'cm';
      return 'cm'; // Default for body measurements
    };
    
    // Total number of tracked days
    const totalTrackedDays = computed(() => {
      if (profileHistory.value.length < 2) return 0;
      
      const firstDate = new Date(profileHistory.value[0].timestamp);
      const lastDate = new Date(profileHistory.value[profileHistory.value.length - 1].timestamp);
      const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    });

    // Call fetchProfile when component is mounted
    fetchProfile();

    return {
      profile,
      profilePhoto,
      profileHistory,
      activeTab,
      selectedMeasurement,
      measurementNames,
      camera,
      personCircle,
      bodyOutline,
      fitnessOutline,
      barbellOutline,
      walkOutline,
      saveOutline,
      analyticsOutline,
      timeOutline,
      selectImage,
      saveProfile,
      getProgressPoints,
      getDataPoints,
      getMaxValue,
      getMiddleValue,
      getMinValue,
      getFirstDate,
      getMiddleDate,
      getLastDate,
      getMeasurementChange,
      getMeasurementUnit,
      totalTrackedDays
    };
  }
});
</script>

<!-- Add these styles at the end of your <style> section -->
<style scoped>
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
/* Tab navigation styles */
.tab-container {
  display: flex;
  justify-content: center;
  background-color: var(--ion-color-light-shade);
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 16px;
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

/* Analytics container */
.analytics-container {
  padding: 0 16px;
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

.empty-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background-color: var(--ion-color-light);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.empty-chart p {
  margin: 0;
  color: var(--ion-color-medium);
}

.empty-chart-subtitle {
  font-size: 14px;
  margin-top: 8px;
}

.progress-chart {
  width: 100%;
  height: 100%;
}

.progress-line {
  fill: none;
  stroke: var(--ion-color-primary);
  stroke-width: 2;
}

.data-point {
  fill: var(--ion-color-primary);
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

/* Measurement select */
.exercise-select-container {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.exercise-select-container label {
  margin-right: 8px;
  color: var(--ion-color-medium);
}

.measurement-select {
  flex: 1;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--ion-color-medium);
  background-color: var(--ion-color-light);
  color: var(--ion-color-dark);
}

/* Statistics styles */
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
  color: var(--ion-color-medium);
  margin-bottom: 4px;
}

.statistic-label {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.positive-change {
  color: #4caf50; /* Green for positive change */
}

.negative-change {
  color: #f44336; /* Red for negative change */
}

.profile-header {
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(to bottom, var(--ion-color-primary), var(--ion-color-primary-shade));
  color: var(--ion-color-primary-contrast);
  border-radius: 0 0 24px 24px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.profile-photo-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
}

.profile-photo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.edit-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--ion-color-primary);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border: 2px solid white;
}

.profile-name {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Form styling */
.form-container {
  padding: 0 16px;
}

.profile-card {
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

ion-card-header {
  padding-bottom: 8px;
}

ion-card-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}

.section-icon {
  margin-right: 8px;
  font-size: 20px;
  color: var(--ion-color-primary);
}

.unit-indicator {
  margin-left: auto;
  color: var(--ion-color-medium);
  font-size: 14px;
  font-weight: normal;
}

/* Measurement sections */
.measurement-section {
  margin-bottom: 16px;
}

.measurement-section h4 {
  margin: 8px 0;
  padding: 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--ion-color-dark);
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--ion-color-light);
}
.navbar-spacer {
  height: 26px; /* Adjust this value to match your navbar's height */
}

.subsection-icon {
  margin-right: 8px;
  font-size: 18px;
  color: var(--ion-color-primary);
}

/* Item styling */
ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  --min-height: 48px;
  --border-color: var(--ion-color-light);
}

ion-input {
  --padding-start: 8px;
  text-align: right;
}

ion-label {
  margin: 0;
  color: var(--ion-color-dark);
}

/* Button styling */
.save-button {
  margin: 8px 16px 32px;
  --border-radius: 12px;
  --background: var(--ion-color-primary);
  --color: var(--ion-color-primary-contrast);
  font-weight: 600;
  height: 48px;
  box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.4);
}

/* Toolbar styling */
.custom-toolbar {
  padding-top: 24px;
}

/* Column layouts */
ion-row {
  width: 100%;
}

ion-col {
  padding: 0;
}

ion-col:first-child ion-item {
  border-right: 1px solid var(--ion-color-light);
}
</style>