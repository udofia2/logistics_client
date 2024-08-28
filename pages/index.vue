<template>
  <div class="container mx-auto p-4 max-w-6xl">
    <h1 class="text-2xl font-bold mb-4 text-white">Admin Dashboard</h1>

    <div class="w-full flex flex-col space-y-4 mb-4">
      <div
        class="bg-white p-4 border border-gray-300 rounded-md shadow-md flex flex-col space-y-4"
      >
        <h3 class="text-lg font-semibold mb-4">Delivery Analitics</h3>

        <div class="w-full flex flex-col space-y-4 mb-4">
          <div class="grid grid-cols-3 md:grid-cols-6 xl:grid-cols-7 gap-4">
            <div
              v-for="(item, index) in dashboardItems"
              :key="index"
              class="bg-white p-2 border border-gray-300 rounded-md shadow-md flex flex-col space-y-2"
            >
              <h3 class="text-sm font-semibold">{{ item.title }}</h3>
              <div class="text-xl font-bold">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AdminDashboardCard
      v-model:packages="packages"
      v-model:deliveries="deliveries"
    />
  </div>
</template>

<script setup>
useHead({
  title: "Gozem - Admin Dashboard",
});

definePageMeta({
  layout: "default",
});

const packages = ref([]);
const deliveries = ref([]);

const dashboardItems = computed(() => [
  {
    title: "Total Packages",
    value: packages.value.length || 0,
  },
  {
    title: "Total Deliveries",
    value: deliveries.value.length || 0,
  },
  {
    title: "Delivered Packages",
    value: deliveries.value.filter((d) => d.status === "delivered").length || 0,
  },
  {
    title: "In Transit",
    value:
      deliveries.value.filter((d) => d.status === "in_transit").length || 0,
  },
  {
    title: "Open",
    value: deliveries.value.filter((d) => d.status === "open").length || 0,
  },
  {
    title: "Failed",
    value: deliveries.value.filter((d) => d.status === "failed").length || 0,
  },
  {
    title: "Pickup",
    value: deliveries.value.filter((d) => d.status === "pickup").length || 0,
  },
]);
</script>
