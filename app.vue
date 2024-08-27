<template>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
</template>
<script setup>
import { initFlowbite } from 'flowbite'
import 'leaflet/dist/leaflet.css';

const loadLeaflet = new Promise((resolve) => {

  setTimeout(() => {
    import('leaflet').then((L) => {
      resolve(L);
    });
  }, 100);
});

useHead({
  title: "Gozem",
  script: {
    src:`https://maps.googleapis.com/maps/api/js?key=${useRuntimeConfig().public.GOOGLE_MAP_API_KEY}&libraries=places`
  }
})
onMounted(async () => {
    initFlowbite();

    const L = await loadLeaflet;
})
</script>