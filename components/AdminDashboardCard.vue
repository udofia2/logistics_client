<template>
  <div class="container mx-auto p-4 max-w-6xl">
    <div class="flex flex-col md:flex-row md:space-x-6">
      <!-- Left Sidebar -->
      <div class="flex-1 flex flex-col space-y-6">
        <!-- Packages List -->
        <div
          class="bg-white p-4 border border-gray-300 rounded-md shadow-md flex-1"
        >
          <h3 class="text-lg font-semibold mb-4">Created Packages</h3>
          <ul class="space-y-2">
            <li
              v-for="pk in packages"
              :key="pk?.package_id"
              class="border-b border-gray-200 pb-2"
            >
              <div class="font-medium">{{ pk.description }}</div>
              <div>ID: {{ pk.package_id }}</div>
            </li>
            <li v-if="packages.length === 0" class="text-gray-500">
              No packages available.
            </li>
          </ul>
        </div>
        <!-- Deliveries List -->
        <div
          class="bg-white p-4 border border-gray-300 rounded-md shadow-md flex-1"
        >
          <h3 class="text-lg font-semibold mb-4">Created Deliveries</h3>
          <ul class="space-y-2">
            <li
              v-for="delivery in deliveries"
              :key="delivery.id"
              class="border-b border-gray-200 pb-2"
            >
              <div class="font-medium">Delivery ID: {{ delivery.delivery_id }}</div>
              <div>Status: {{ delivery.status }}</div>
            </li>
            <li v-if="deliveries.length === 0" class="text-gray-500">
              No deliveries available.
            </li>
          </ul>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="w-full md:w-1/4 flex flex-col space-y-4">
        <div
          class="bg-white p-4 border border-gray-300 rounded-md shadow-md flex flex-col space-y-4"
        >
          <h3 class="text-lg font-semibold mb-4">Actions</h3>
          <button
            @click="showCreatePackageModal = true"
            class="bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Package
          </button>
          <button
            @click="showCreateDeliveryModal = true"
            class="bg-green-500 text-white py-2 px-4 rounded-md shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Create Delivery
          </button>
        </div>
      </div>
    </div>

    <!-- Modals for Creating Package and Delivery -->
    <CreatePackageModal
      v-if="showCreatePackageModal"
      @close="showCreatePackageModal = false"
    />
    <CreateDeliveryModal
      v-if="showCreateDeliveryModal"
      @close="showCreateDeliveryModal = false"
      :packages="packages"
    />
  </div>
</template>

<script setup>
// import CreatePackageModal from './CreatePackageModal.vue';
// import CreateDeliveryModal from './CreateDeliveryModal.vue';
import axios from "axios";

const BASEURL = useRuntimeConfig().public.SERVER_URL;
// const BASEURL_LIVE = useRuntimeConfig().public.LIVE_SERVER;

const packages = ref([]);
const deliveries = ref([]);
const showCreatePackageModal = ref(false);
const showCreateDeliveryModal = ref(false);

const fetchData = async () => {
  try {
    const packageResponse = await axios.get(`${BASEURL}/v1/package`);
    packages.value = packageResponse.data.results;

    console.log(packageResponse.data);
    const deliveryResponse = await axios.get(`${BASEURL}/v1/delivery`);
    deliveries.value = deliveryResponse.data.results;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

onMounted(() => {
  fetchData();
});
</script>
