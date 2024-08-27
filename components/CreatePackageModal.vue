<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50"
  >
    <div class="bg-white p-6 rounded-md shadow-md w-full max-w-lg">
      <h2 class="text-xl font-semibold mb-4">Create Package</h2>
      <form @submit.prevent="createPackage">
        <!-- Description -->
        <div class="mb-4">
          <label
            for="description"
            class="block text-sm font-medium text-gray-700"
            >Description</label
          >
          <input
            id="description"
            v-model="description"
            type="text"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <!-- From Name -->
        <div class="mb-4">
          <label for="from_name" class="block text-sm font-medium text-gray-700"
            >From Name</label
          >
          <input
            id="from_name"
            v-model="fromName"
            type="text"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <!-- From Address -->
        <div class="mb-4">
          <label
            for="from_address"
            class="block text-sm font-medium text-gray-700"
            >From Address</label
          >
          <input
            id="from_address"
            v-model="fromAddress"
            type="text"
            required
            @input="fetchAddresses('from')"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
          <ul
            v-if="fromAddresses.length > 0"
            class="absolute bg-white border border-gray-300 rounded-md shadow-md p-2"
          >
            <li
              v-for="(address, index) in fromAddresses"
              :key="index"
              @click="selectAddress(address, 'from')"
              class="cursor-pointer py-2"
            >
              {{ address.description }}
            </li>
          </ul>
        </div>

        <!-- To Name -->
        <div class="mb-4">
          <label for="to_name" class="block text-sm font-medium text-gray-700"
            >To Name</label
          >
          <input
            id="to_name"
            v-model="toName"
            type="text"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <!-- To Address -->
        <div class="mb-4">
          <label
            for="to_address"
            class="block text-sm font-medium text-gray-700"
            >To Address</label
          >
          <input
            id="to_address"
            v-model="toAddress"
            type="text"
            required
            @input="fetchAddresses('to')"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
          <ul
            v-if="toAddresses.length > 0"
            class="absolute bg-white border border-gray-300 rounded-md shadow-md p-2"
          >
            <li
              v-for="(address, index) in toAddresses"
              :key="index"
              @click="selectAddress(address, 'to')"
              class="cursor-pointer py-2"
            >
              {{ address.description }}
            </li>
          </ul>
        </div>

        <!-- Dimensions -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"
            >Dimensions (cm)</label
          >
          <div class="flex space-x-2">
            <div class="w-full">
              <label
                for="height"
                class="block text-sm font-medium text-gray-700"
                >Height</label
              >
              <input
                id="height"
                v-model.number="height"
                type="number"
                placeholder="Height"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div class="w-full">
              <label for="width" class="block text-sm font-medium text-gray-700"
                >Width</label
              >
              <input
                id="width"
                v-model.number="width"
                type="number"
                placeholder="Width"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div class="w-full">
              <label for="depth" class="block text-sm font-medium text-gray-700"
                >Depth</label
              >
              <input
                id="depth"
                v-model.number="depth"
                type="number"
                placeholder="Depth"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <button
            type="button"
            @click="$emit('close')"
            class="bg-gray-500 text-white py-2 px-4 rounded-md shadow hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Package
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";

const BASEURL = useRuntimeConfig().public.SERVER_URL;
const GOOGLE_MAP_API_KEY = useRuntimeConfig().public.GOOGLE_MAP_API_KEY;
console.log(useRuntimeConfig().public.GOOGLE_MAP_API_KEY);

const autocompleteFrom = new google.maps.places.AutocompleteService();
const autocompleteTo = new google.maps.places.AutocompleteService();

let fromTimeout;
let toTimeout;

const description = ref("");
const fromName = ref("");
const fromAddress = ref("");
const toName = ref("");
const toAddress = ref("");
const height = ref(0);
const width = ref(0);
const depth = ref(0);
const fromLocation = ref({ lat: null, lng: null });
const toLocation = ref({ lat: null, lng: null });
const fromAddresses = ref([]);
const toAddresses = ref([]);
const emit = defineEmits(["close"]);

const fetchAddresses = async (addressType) => {
  const address = addressType === "from" ? fromAddress.value : toAddress.value;
  if (!address) return;

  const predictions =
    addressType === "from"
      ? await autocompleteFrom.getPlacePredictions({ input: address })
      : await autocompleteTo.getPlacePredictions({ input: address });

  if (addressType === "from") {
    fromAddresses.value = predictions.predictions;
  } else {
    toAddresses.value = predictions.predictions;
  }
};

const selectAddress = async (prediction, addressType) => {
  const placeId = prediction.place_id;
  const geocoder = new google.maps.Geocoder();

  try {
    const response = await geocoder.geocode({ placeId });
    const location = response.results[0].geometry.location;

    if (addressType === "from") {
      fromLocation.value = { lat: location.lat(), lng: location.lng() };
      fromAddress.value = prediction.description;
      fromAddresses.value = [];
    } else {
      toLocation.value = { lat: location.lat(), lng: location.lng() };
      toAddress.value = prediction.description;
      toAddresses.value = [];
    }
  } catch (error) {
    console.error("Error geocoding address:", error);
  }
};

// Function to create package
const createPackage = async () => {
  try {
    const response = await axios.post(`${BASEURL}/v1/package`, {
      description: description.value,
      from_name: fromName.value,
      from_address: fromAddress.value,
      from_location: fromLocation.value,
      to_name: toName.value,
      to_address: toAddress.value,
      to_location: toLocation.value,
      height: height.value,
      width: width.value,
      depth: depth.value,
    });
    alert("Delivery created successfully.");

    emit("close");
    window.location.reload();
  } catch (error) {
    console.error("Error creating package:", error);
  }
};

const close = () => {
  emit("close");
};
</script>
