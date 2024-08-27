<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <div class="mb-6 flex items-center space-x-4">
      <input
        type="text"
        v-model="trackingNumber"
        placeholder="Enter Tracking Number"
        class="flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        @click="trackPackage"
        class="bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Track Package
      </button>
    </div>
    <div class="flex flex-col md:flex-row md:space-x-6">
      <div
        class="flex-1 bg-white p-4 border border-gray-300 rounded-md shadow-md"
      >
        <h3 class="text-lg font-semibold mb-4">Package & Delivery Details</h3>
        <div v-if="loading" class="text-center">Loading...</div>

        <div v-if="packageDetail" class="space-y-4">
          <div>
            <h4 class="font-medium">Package Details:</h4>
            <ul class="list-disc pl-5">
              <li>ID: {{ packageDetail.package_id }}</li>
              <li>Description: {{ packageDetail.description }}</li>
              <li>
                From: {{ packageDetail.from_name }} ({{
                  packageDetail.from_address
                }})
              </li>
              <li>
                To: {{ packageDetail.to_name }} ({{ packageDetail.to_address }})
              </li>
              <li>
                Dimensions: {{ packageDetail.height }} x
                {{ packageDetail.depth }} x {{ packageDetail.width }} cm
              </li>
            </ul>
          </div>
          <div v-if="deliveryDetail">
            <h4 class="font-medium">Delivery Details:</h4>
            <ul class="list-disc pl-5">
              <li>ID: {{ deliveryDetail.delivery_id }}</li>
              <li>Pickup Time: {{ formatDate(deliveryDetail.pickup_time) }}</li>
              <li>Start Time: {{ formatDate(deliveryDetail.start_time) }}</li>
              <li>End Time: {{ formatDate(deliveryDetail.end_time) }}</li>
              <li>Status: {{ deliveryDetail.status }}</li>
            </ul>
          </div>
          <div v-else class="text-center text-gray-500 py-10">
            Map only loads when there is a delivery attached to the package.
          </div>
        </div>
        <p v-else class="text-gray-500">No details available.</p>
      </div>
      <div
        class="flex-1 bg-white p-4 border border-gray-300 rounded-md shadow-md mt-6 md:mt-0"
      >
        <h3 class="text-lg font-semibold mb-4">Driver Location</h3>
        <div
          class="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md"
        >
          <div ref="mapElement" class="w-full h-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import io from "socket.io-client";

const BASEURL = useRuntimeConfig().public.SERVER_URL;

const trackingNumber = ref("");
const packageDetail = ref(null);
const deliveryDetail = ref(null);
const mapElement = ref(null);
const map = ref(null);
const loading = ref(false);

const socket = io(BASEURL);

const trackPackage = async () => {
  loading.value = true;
  try {
    const response = await axios.get(
      `${BASEURL}/v1/package/${trackingNumber.value}`
    );

    packageDetail.value = response.data;
    deliveryDetail.value = response.data.delivery;

    
    if (map?.value?.remove) {
      map.value.off();
      map.value.remove();
    }

    initMap();
  
  } catch (error) {
    console.error("Error fetching package details:", error);
    packageDetail.value = null;
    deliveryDetail.value = null;

    if (map.value) {
      map.value.off();
      map.value.remove();
    }
  } finally {
    loading.value = false;
  }
};


const initMap = () => {
  if (!packageDetail.value.from_location || !deliveryDetail.value.location) return;

  if (map.value && map.value.remove) {
    map.value.off();
    map.value.remove();
  }

  map.value = L.map(mapElement.value).setView(
    [
      packageDetail.value.from_location.lat,
      packageDetail.value.from_location.lng,
    ],
    10
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value);

  L.marker([
    packageDetail.value.from_location.lat,
    packageDetail.value.from_location.lng,
  ])
    .addTo(map.value)
    .bindPopup("Starting Location")
    .openPopup();

  L.marker([
    packageDetail.value.to_location.lat,
    packageDetail.value.to_location.lng,
  ])
    .addTo(map.value)
    .bindPopup("Destination Location");

  L.marker([
    deliveryDetail.value.location.lat,
    deliveryDetail.value.location.lng,
  ])
    .addTo(map.value)
    .bindPopup("Driver Location")
    .openPopup();


  const route1 = [
    [
      packageDetail.value.from_location.lat,
      packageDetail.value.from_location.lng,
    ],
    [deliveryDetail.value.location.lat, deliveryDetail.value.location.lng],
  ];
  L.polyline(route1, { color: "blue" }).addTo(map.value);


  const route2 = [
    [deliveryDetail.value.location.lat, deliveryDetail.value.location.lng],
    [packageDetail.value.to_location.lat, packageDetail.value.to_location.lng],
  ];
  L.polyline(route2, { color: "green" }).addTo(map.value);
};

const formatDate = (date) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(date).toLocaleDateString(undefined, options);
};

socket.on("delivery_updated", (updatedDelivery) => {
  if (updatedDelivery) {
    deliveryDetail.value = updatedDelivery.delivery;
    if (map.value) {
      initMap();
    }
  }
});


onMounted(() => {
  if (packageDetail.value && deliveryDetail.value) {
    initMap();
  }
});

onUnmounted(() => {
  socket.disconnect();
});
</script>
