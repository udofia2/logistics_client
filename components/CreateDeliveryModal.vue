<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50"
  >
    <div class="bg-white p-6 rounded-md shadow-md w-full max-w-lg">
      <h2 class="text-xl font-semibold mb-4">Create Delivery</h2>
      <form @submit.prevent="createDelivery">
        <div class="mb-4">
          <label
            for="package_id"
            class="block text-sm font-medium text-gray-700"
            >Package</label
          >
          <select
            id="package_id"
            v-model="selectedPackageId"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          >
            <option value="" disabled>Select a package</option>
            <option
              v-for="(pkg, index) in filteredPackages"
              :key="index"
              :value="pkg.package_id"
            >
              {{ pkg.package_id }} - {{ pkg.description }}
            </option>
          </select>
        </div>
        <div class="flex justify-end space-x-4">
          <button
            type="button"
            @click="close"
            class="bg-gray-500 text-white py-2 px-4 rounded-md shadow hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="bg-green-500 text-white py-2 px-4 rounded-md shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Create Delivery
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";

const BASEURL = useRuntimeConfig().public.SERVER_URL;

const emit = defineEmits(["close"]);
const props = defineProps(["packages"]);
const selectedPackageId = ref("");

const createDelivery = async () => {
  try {
    const response = await axios.post(`${BASEURL}/v1/delivery`, {
      package_id: selectedPackageId.value,
    });

    alert("Delivery created successfully.");
    window.location.reload();
    emit("close");
  } catch (error) {
    console.error("Error creating delivery:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
      alert(`Error: ${error.response.data.message}`);
    } else if (error.request) {
      console.error("Error request:", error.request);
      alert("Error: No response from the server.");
    } else {
      console.error("Error:", error.message);
      alert(`Error: ${error.message}`);
    }
  }
};

const filteredPackages = computed(() => {
  return props.packages.filter((pkg) => !pkg.active_delivery_id);
});

const close = () => {
  emit("close");
};
</script>
