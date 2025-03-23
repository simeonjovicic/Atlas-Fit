<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar class="custom-toolbar">
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding-bottom">
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
    </ion-content>
    <div class="navbar-spacer"></div>
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
  saveOutline 
} from 'ionicons/icons';
import { defineComponent, ref } from 'vue';
import profilePicture from '@/resources/default-profile.jpg';

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

    // Fetch profile data
    const fetchProfile = async () => {
      // Fetch the profile data from localStorage
      const savedProfile = localStorage.getItem('profile');
      const savedProfilePhoto = localStorage.getItem('profilePhoto');

      if (savedProfile && savedProfilePhoto) {
        profile.value = JSON.parse(savedProfile);
        profilePhoto.value = savedProfilePhoto;
      } else {
        // Simulate fetching data if not found in localStorage
        setTimeout(() => {
          profile.value = {
            name: '',
            weight: null,
            height: null,
            workoutsPerWeek: 5,
            notifications: {
              dailyReminders: true,
              reminderTime: '20:00' // Default to 8:00 PM
            },
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

          // Save the simulated data to localStorage
          localStorage.setItem('profile', JSON.stringify(profile.value));
          localStorage.setItem('profilePhoto', profilePhoto.value);
        }, 500);
      }
    };

    const selectImage = async () => {
      const actionSheet = await actionSheetController.create({
        header: 'Profile Photo',
        buttons: [
          {
            text: 'Choose from Gallery',
            handler: () => {
              // Create a file input element
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              
              // When a file is selected
              input.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    profilePhoto.value = e.target.result;
                  };
                  reader.readAsDataURL(file);
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
        // Save the profile data to localStorage
        localStorage.setItem('profile', JSON.stringify(profile.value));
        localStorage.setItem('profilePhoto', profilePhoto.value);

        console.log('Saving profile:', profile.value);
        console.log('Profile photo:', profilePhoto.value);

        // Simulate a successful save
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Error saving profile', error);
        alert('There was an error updating your profile. Please try again.');
      }
    };

    // Call fetchProfile when component is mounted
    fetchProfile();

    return {
      profile,
      profilePhoto,
      camera,
      personCircle,
      bodyOutline,
      fitnessOutline,
      barbellOutline,
      walkOutline,
      saveOutline,
      selectImage,
      saveProfile
    };
  }
});
</script>

<style scoped>
/* Profile header styling */
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