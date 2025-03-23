<template>
  <ion-page>
    <ion-content class="welcome-content">
      <div class="welcome-container">
        <div class="logo-section">
          <img src="/favicon.png" alt="Atlas-Fit Logo" class="welcome-logo" />
          <h1>Atlas-Fit</h1>
          <p class="slogan">Stronger with you</p>
        </div>
        
        <div class="inspiration-text">
          <p>Your fitness journey begins here. Every rep brings you closer to the stronger version of yourself.</p>
        </div>
        
        <div class="info-card">
          <div class="card-content">
            <div class="card-header">
              <h2>Begin your transformation</h2>
            </div>
            
            <div class="welcome-form">
              <div class="input-container">
                <ion-label>Your Name</ion-label>
                <ion-input 
                  v-model="name" 
                  placeholder="Enter your name"
                  class="custom-input"
                ></ion-input>
              </div>
              
              <div class="input-container">
                <ion-label>Workouts per Week</ion-label>
                <ion-input 
                  type="number" 
                  v-model="workoutsPerWeek" 
                  placeholder="3"
                  min="0"
                  max="7"
                  inputmode="numeric"
                  class="custom-input"
                ></ion-input>
              </div>
            </div>
          </div>
          
          <div class="slider-container">
            <div 
              ref="sliderTrack"
              class="slider-track"
            >
              <div 
                ref="sliderButton"
                class="slider-button" 
                :class="{ 'sliding': isDragging }"
                :style="{ transform: `translateX(${sliderPosition}px)` }" 
                @touchstart.prevent="startSlide"
                @touchmove.prevent="moveSlide" 
                @touchend.prevent="endSlide"
                @mousedown.prevent="startSlide"
              >
                <ion-icon :icon="arrowForwardOutline"></ion-icon>
              </div>
              <div class="slider-text">Slide to continue</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Hidden audio element for fanfare -->
      <audio ref="fanfareSound" preload="auto">
        <source src="/sounds/magic-3glitterarrival-45359.mp3" type="audio/mpeg">
      </audio>
    </ion-content>
  </ion-page>
</template>

<script>
import { 
  IonPage, 
  IonContent, 
  IonLabel, 
  IonInput,
  IonIcon
} from '@ionic/vue';
import { arrowForwardOutline } from 'ionicons/icons';
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';

export default defineComponent({
  name: 'WelcomePage',
  components: {
    IonPage, 
    IonContent,
    IonLabel, 
    IonInput,
    IonIcon
  },
  setup() {
    const name = ref('');
    const workoutsPerWeek = ref(3); // Default value
    const fanfareSound = ref(null);
    
    // Slider functionality
    const sliderPosition = ref(0);
    const isDragging = ref(false);
    const sliderTrack = ref(null);
    const sliderButton = ref(null);
    const startX = ref(0);
    
    const startSlide = (event) => {
      if (!name.value.trim()) {
        alert('Please enter your name to continue');
        return;
      }
      
      isDragging.value = true;
      
      // Get clientX from either touch or mouse event
      const clientX = event.type.includes('touch') 
        ? event.touches[0].clientX 
        : event.clientX;
      
      startX.value = clientX - sliderPosition.value;
      
      // Add mouse event listeners when starting drag with mouse
      if (event.type === 'mousedown') {
        document.addEventListener('mousemove', moveSlide);
        document.addEventListener('mouseup', endSlide);
      }
      
      // Prevent default to avoid text selection during drag
      event.preventDefault();
    };
    
    const moveSlide = (event) => {
      if (!isDragging.value) return;
      
      // Get clientX from either touch or mouse event
      const clientX = event.type.includes('touch')
        ? event.touches[0].clientX
        : event.clientX;
      
      const trackWidth = sliderTrack.value.offsetWidth;
      const buttonWidth = sliderButton.value.offsetWidth;
      const maxSlide = trackWidth - buttonWidth;
      
      // Calculate new position with constraints
      let newPosition = clientX - startX.value;
      newPosition = Math.max(0, Math.min(newPosition, maxSlide));
      
      sliderPosition.value = newPosition;
      
      // If slider reaches end position, trigger continue
      if (newPosition >= maxSlide * 0.9) {
        endSlide();
        continueToApp();
      }
      
      // Prevent default to avoid scrolling during drag
      event.preventDefault();
    };
    
    const endSlide = (event) => {
      if (!isDragging.value) return;
      
      isDragging.value = false;
      
      // Remove mouse event listeners
      document.removeEventListener('mousemove', moveSlide);
      document.removeEventListener('mouseup', endSlide);
      
      // Reset position if not completed
      const trackWidth = sliderTrack.value.offsetWidth;
      const buttonWidth = sliderButton.value.offsetWidth;
      const maxSlide = trackWidth - buttonWidth;
      
      if (sliderPosition.value < maxSlide * 0.9) {
        sliderPosition.value = 0;
      }
      
      // Prevent default to be consistent
      if (event) event.preventDefault();
    };
    
    onMounted(() => {
      // Update slider width on resize
      window.addEventListener('resize', updateSliderConstraints);
      
      // Play fanfare sound when component is mounted
      playFanfare();
    });
    
    onUnmounted(() => {
      window.removeEventListener('resize', updateSliderConstraints);
      document.removeEventListener('mousemove', moveSlide);
      document.removeEventListener('mouseup', endSlide);
    });
    
    const updateSliderConstraints = () => {
      // Reset position when resizing to avoid issues
      sliderPosition.value = 0;
    };
    
    const playFanfare = () => {
      // Small timeout to ensure audio is ready and to give visual elements time to render
      setTimeout(() => {
        if (fanfareSound.value) {
          // Set volume to a comfortable level
          fanfareSound.value.volume = 0.7;
          
          // Play the sound with a promise and catch any errors (mobile browsers may block autoplay)
          const playPromise = fanfareSound.value.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.log('Autoplay prevented:', error);
              // You could add a play button here if autoplay is not allowed
            });
          }
        }
      }, 500);
    };

    const continueToApp = () => {
      // Check if name is provided - this is also checked in startSlide
      if (!name.value.trim()) {
        sliderPosition.value = 0;
        return;
      }

      // Get existing profile or create a new one
      let profile = JSON.parse(localStorage.getItem('profile')) || {
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
        },
        notifications: {
          dailyReminders: true,
          reminderTime: '20:00'
        }
      };

      // Update profile with welcome page data
      profile.name = name.value;
      profile.workoutsPerWeek = workoutsPerWeek.value;
      profile.height = profile.height || null;
      profile.weight = profile.weight || null;

      // Save to localStorage
      localStorage.setItem('profile', JSON.stringify(profile));
      
      // Set first launch flag to false
      localStorage.setItem('firstLaunch', 'false');
      
      // Force a page reload to ensure App.vue refreshes its state
      window.location.href = '/';
    };

    return {
      name,
      workoutsPerWeek,
      sliderPosition,
      isDragging,
      sliderTrack,
      sliderButton,
      startSlide,
      moveSlide,
      endSlide,
      arrowForwardOutline,
      fanfareSound
    };
  }
});
</script>

<style scoped>
.welcome-content {
  --background: #121212; /* Black background */
  --color: white;
}

.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100vh;
  max-height: 100%;
  padding: 10px;
  text-align: center;
  color: white;
  overflow: hidden;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: min(5vh, 20px);
  margin-bottom: 0;
}

.welcome-logo {
  width: min(60px, 15vw);
  height: min(60px, 15vw);
  margin-bottom: 8px;
}

h1 {
  font-size: min(28px, 7vw);
  font-weight: bold;
  margin: 0;
  letter-spacing: 0.5px;
}

.slogan {
  font-size: min(16px, 4.5vw);
  margin: 4px 0 0 0;
  opacity: 0.9;
  font-style: italic;
  color: #1a73e8; /* Blue accent for slogan */
}

.inspiration-text {
  margin: 10px 0;
  max-width: 300px;
  line-height: 1.3;
}

.inspiration-text p {
  margin: 0;
  font-size: min(14px, 3.8vw);
  color: rgba(255, 255, 255, 0.8);
}

.info-card {
  background: #1e1e1e; /* Dark card that stands out from black background */
  border-radius: 24px 24px 0 0;
  width: 100%;
  margin-top: 10px;
  padding: min(24px, 6vh) 16px min(16px, 4vh) 16px;
  color: white;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  max-height: 70vh;
}

.card-header {
  margin-bottom: min(16px, 4vh);
}

.card-header h2 {
  font-size: min(20px, 5.5vw);
  color: #1a73e8; /* Blue accent */
  margin: 0;
}

.welcome-form {
  margin-top: min(16px, 4vh);
}

.input-container {
  margin-bottom: min(16px, 4vh);
  text-align: left;
}

.input-container:last-child {
  margin-bottom: min(12px, 3vh);
}

.input-container ion-label {
  font-size: min(13px, 3.5vw);
  color: #bbb;
  margin-bottom: 4px;
  display: block;
}

.custom-input {
  --background: #2a2a2a;
  --color: white;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  --border-radius: 10px;
  --placeholder-color: #888;
  margin-top: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  height: min(42px, 11vw);
  font-size: min(14px, 4vw);
}

.slider-container {
  margin-top: min(16px, 4vh);
  width: 100%;
}

.slider-track {
  position: relative;
  height: min(48px, 12vw);
  background: #2a2a2a;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  touch-action: none; /* Important for touch devices */
}

.slider-button {
  position: absolute;
  left: 0;
  top: 0;
  width: min(54px, 14vw);
  height: 100%;
  background: #1a73e8;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: min(20px, 5vw);
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 0 10px rgba(26, 115, 232, 0.6);
  will-change: transform; /* Performance optimization */
  touch-action: none; /* Important for touch devices */
}

.slider-button.sliding {
  transition: none; /* Remove transition when actively sliding */
}

.slider-button:active {
  background: #1565c0;
}

.slider-text {
  color: #aaa;
  font-size: min(14px, 3.8vw);
  font-weight: 500;
  pointer-events: none;
}

/* Media queries for very small devices */
@media (max-height: 480px) {
  .welcome-container {
    padding: 5px;
  }
  
  .logo-section {
    margin-top: 10px;
  }
  
  .info-card {
    padding: 12px 12px 10px 12px;
  }
  
  .card-header {
    margin-bottom: 10px;
  }
  
  .input-container {
    margin-bottom: 10px;
  }
  
  .inspiration-text {
    display: none; /* Hide on very small screens */
  }
}
</style>