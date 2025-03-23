<template>
    <ion-page>
      <ion-header>
        <ion-toolbar class="custom-toolbar">
          <ion-title>Profile</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <ion-content>
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
          <!-- Basic Information -->
          <div class="section">
            <div class="section-header">
              <h3>Personal Info</h3>
            </div>
            
            <ion-list lines="full">
              <ion-item>
                <ion-label>Name</ion-label>
                <ion-input v-model="profile.name" placeholder="Enter your name"></ion-input>
              </ion-item>
              
              <ion-item>
                <ion-label>Weight</ion-label>
                <ion-input 
                  type="number" 
                  v-model="profile.weight" 
                  placeholder="0.0"
                  step="0.1"
                  inputmode="decimal"
                ></ion-input>
                <div slot="end" class="unit-label">kg</div>
              </ion-item>
              <ion-item>
  <ion-label class="fixed-label">Workouts per Week</ion-label>
  <ion-input 
    type="number" 
    v-model="profile.workoutsPerWeek" 
    placeholder="0"
    min="0"
    max="7"
    inputmode="numeric"
  ></ion-input>
</ion-item>
              
              <ion-item>
                <ion-label>Height</ion-label>
                <ion-input 
                  type="number" 
                  v-model="profile.height" 
                  placeholder="0.0"
                  step="0.1"
                  inputmode="decimal"
                ></ion-input>
                <div slot="end" class="unit-label">cm</div>
              </ion-item>
            </ion-list>
          </div>
          
          <!-- Measurements -->
          <div class="section">
            <div class="section-header">
              <h3>Body Measurements</h3>
              <div class="unit-indicator">cm</div>
            </div>
            
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
              
              <div class="measurement-group">
                <h4>Arms</h4>
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
              </div>
              
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
              
              <div class="measurement-group">
                <h4>Legs</h4>
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
              </div>
              
            </ion-list>
          </div>
          
          
          
          <ion-button expand="block" class="save-button" @click="saveProfile">
            Save Changes
          </ion-button>
        </div>
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
    actionSheetController
  } from '@ionic/vue';
  import { camera } from 'ionicons/icons';
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
      IonIcon
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
  
      // Fetch profile data (simulated)
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
        selectImage,
        saveProfile
      };
    }
  });
  </script>
  
  <style scoped>
  /* Profile header styling */
.profile-header {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--ion-color-primary-shade);
  color: var(--ion-color-primary-contrast);
}

.profile-photo-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 12px;
}

.profile-photo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
}

.edit-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--ion-color-primary);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ion-color-primary-contrast);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.profile-name {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: white
}

/* Form styling */
.form-container {
  padding: 0;
  background: var(--ion-background-color);
}

.section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 8px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.unit-indicator {
  color: var(--ion-color-medium);
  font-size: 14px;
}

.unit-label {
  color: var(--ion-color-medium);
  margin-left: 4px;
  font-size: 14px;
}

/* Group styling */
.measurement-group {
  background: var(--ion-background-color);
  margin-bottom: 8px;
}

.measurement-group h4 {
  margin: 0;
  padding: 12px 16px 4px;
  font-size: 15px;
  font-weight: 500;
  color: var(--ion-color-medium);
}

/* Item styling */
ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 48px;
}

ion-input {
  --padding-start: 8px;
  text-align: right;
}

.save-button {
  margin: 20px 16px;
  padding-bottom: 80px;
  --background: var(--ion-color-primary);
  --color: var(--ion-color-primary-contrast);
}
.fixed-label {
  width: 150px;
  min-width: 200px;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.custom-toolbar{
  padding-top: 24px;
}
  </style>