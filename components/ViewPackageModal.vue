<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50"
  >
    <div class="bg-white p-6 rounded-md shadow-md w-full max-w-lg">
      <h2 class="text-xl font-semibold mb-4">Package Details</h2>
      <div v-if="pkg">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"
            >Package ID:</label
          >
          <span>{{ pkg.package_id }}</span>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"
            >Description:</label
          >
          <span>{{ pkg.description }}</span>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"
            >From:</label
          >
          <span>{{ pkg.from_name }} ({{ pkg.from_address }})</span>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"
            >To:</label
          >
          <span>{{ pkg.to_name }} ({{ pkg.to_address }})</span>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"
            >Dimensions:</label
          >
          <span>{{ pkg.height }} x {{ pkg.depth }} x {{ pkg.width }}</span>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"
            >Delivery Status:</label
          >
          <span>{{ pkg.delivery.status }}</span>
        </div>
      </div>
      <div class="flex justify-end space-x-4">
        <button
          type="button"
          @click="close"
          class="bg-gray-500 text-white py-2 px-4 rounded-md shadow hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";

const BASEURL = useRuntimeConfig().public.SERVER_URL;

const emit = defineEmits(["close"]);
const props = defineProps(["packageId"]);
const pkg = ref(null);
const delivery = ref(null);

const getPackage = async () => {
  try {
    const response = await axios.get(`${BASEURL}/v1/package/${props.packageId}`);
    pkg.value = response.data;
    if (pkg.value.active_delivery_id) {
      const deliveryResponse = await axios.get(
        `${BASEURL}/v1/delivery/${pkg.value.active_delivery_id}`
      );
      delivery.value = deliveryResponse.data;
    }
  } catch (error) {
    console.error("Error fetching package data:", error);
  }
};

const close = () => {
  emit("close");
};

onMounted(() => {
  getPackage();
});
</script>