<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Admin Dashboard</h1>
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
