<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup>
import { initFlowbite } from "flowbite";

useHead({
  title: "Gozem",
  script: [
    {
      src: `https://maps.googleapis.com/maps/api/js?key=${
        useRuntimeConfig().public.GOOGLE_MAP_API_KEY
      }&libraries=places`,
    },
    {
      src: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
    },
  ],
});
onMounted(async () => {
  initFlowbite();

  const L = await loadLeaflet;
});
</script>
