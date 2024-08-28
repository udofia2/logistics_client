<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50"
  >
    <div class="bg-white p-6 rounded-md shadow-md w-full max-w-lg">
      <h2 class="text-xl font-semibold mb-4">Edit Package</h2>
      <form @submit.prevent="editPackage">
        <div class="mb-4">
          <label
            for="description"
            class="block text-sm font-medium text-gray-700"
            >Description:</label
          >
          <input
            type="text"
            id="description"
            v-model="pkg.description"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div class="mb-4">
          <label
            for="from_name"
            class="block text-sm font-medium text-gray-700"
            >From Name:</label
          >
          <input
            type="text"
            id="from_name"
            v-model="pkg.from_name"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div class="mb-4">
          <label
            for="to_name"
            class="block text-sm font-medium text-gray-700"
            >To Name:</label
          >
          <input
            type="text"
            id="to_name"
            v-model="pkg.to_name"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
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
            class="bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Changes
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
const props = defineProps(["packageId"]);
const pkg = ref({});

const getPackage = async () => {
  try {
    const response = await axios.get(`${BASEURL}/v1/package/${props.packageId}`);
    pkg.value = response.data;
  } catch (error) {
    console.error("Error fetching package data:", error);
  }
};

const editPackage = async () => {
  try {
    await axios.patch(`${BASEURL}/v1/package/${props.packageId}`, {
      description: pkg.value.description,
      from_name: pkg.value.from_name,
      to_name: pkg.value.to_name,
    });
    emit("close");
  } catch (error) {
    console.error("Error editing package:", error);
  }
};

const close = () => {
  emit("close");
};

onMounted(() => {
  getPackage();
});
</script>