<template>
  <ion-page>
    <ion-content :scroll-y="false">
      <swiper
        class="video-swiper"
        direction="vertical"
        :slides-per-view="1"
        @swiper="setSwiperRef"
        @slideChange="onSlideChange"
      >
        <swiper-slide v-for="(video, index) in videos" :key="index" class="video-slide">
          <div class="video-container">
            <video
              ref="videoRefs"
              class="video-player"
              :src="video.url"
              playsinline
              webkit-playsinline
              @click="togglePlay(index)"
              loop
            ></video>
          </div>
        </swiper-slide>
      </swiper>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';

export default defineComponent({
  name: 'VideoFeed',
  components: {
    IonPage,
    IonContent,
    Swiper,
    SwiperSlide
  },
  setup() {
    const videos = ref([
      { id: 1, url: '/videos/1.mp4' },
      { id: 2, url: '/videos/2.mp4' },
      { id: 3, url: '/videos/3.mp4' },
      { id: 4, url: '/videos/4.mp4' },
      { id: 5, url: '/videos/5.mp4' },
      { id: 6, url: '/videos/6.mp4' },
      { id: 7, url: '/videos/7.mp4' },
      { id: 8, url: '/videos/8.mp4' },
      { id: 9, url: '/videos/9.mp4' },
      { id: 10, url: '/videos/10.mp4' }
    ]);
    
    const swiperRef = ref(null);
    const videoRefs = ref([]);
    const currentVideoIndex = ref(0);
    
    const setSwiperRef = (swiper) => {
      swiperRef.value = swiper;
    };
    
    const onSlideChange = () => {
      if (!swiperRef.value) return;
      
      // Pause current video
      if (videoRefs.value[currentVideoIndex.value]) {
        videoRefs.value[currentVideoIndex.value].pause();
      }
      
      // Update current index
      currentVideoIndex.value = swiperRef.value.activeIndex;
      
      // Play new current video
      if (videoRefs.value[currentVideoIndex.value]) {
        videoRefs.value[currentVideoIndex.value].play();
      }
    };
    
    const togglePlay = (index) => {
      const video = videoRefs.value[index];
      if (!video) return;
      
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    };
    
    onMounted(() => {
      // Initialize the first video
      setTimeout(() => {
        if (videoRefs.value[0]) {
          videoRefs.value[0].play();
        }
      }, 100);
    });
    
    return {
      videos,
      videoRefs,
      setSwiperRef,
      onSlideChange,
      togglePlay
    };
  }
});
</script>

<style scoped>
.video-swiper {
  height: 100%;
  width: 100%;
}

.video-slide {
  height: 100%;
  width: 100%;
}

.video-container {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  background-color: #000;
}

.video-player {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.video-info {
  position: absolute;
  bottom: 80px;
  left: 16px;
  color: white;
  z-index: 10;
}

.video-number {
  font-size: 18px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}
</style>