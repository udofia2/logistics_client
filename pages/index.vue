<template>
    <div class="container mx-auto p-4 max-w-6xl">
    <h1 class="text-2xl font-bold mb-4  text-white">Admin Dashboard</h1>
    <AdminDashboardCard />
  </div>
</template>

<script setup>
useHead({
  title: "Gozem - Admin Dashboard",
});

definePageMeta({
  layout: "default",
});
</script>
