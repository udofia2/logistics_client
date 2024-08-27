<template>
  <div class="container mx-auto p-4 max-w-6xl">
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
        Track Delivery
      </button>
    </div>
    <div class="flex flex-col md:flex-row md:space-x-6">
      <div
        class="flex-1 bg-white p-4 border border-gray-300 rounded-md shadow-md"
      >
        <h3 class="text-lg font-semibold mb-4">Package & Delivery Details</h3>
        <div v-if="packageDetail && deliveryDetail" class="space-y-4">
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
          <div>
            <h4 class="font-medium">Delivery Details:</h4>
            <ul class="list-disc pl-5">
              <li>ID: {{ deliveryDetail.delivery_id }}</li>
              <li>Pickup Time: {{ formatDate(deliveryDetail.pickup_time) }}</li>
              <li>Start Time: {{ formatDate(deliveryDetail.start_time) }}</li>
              <li>End Time: {{ formatDate(deliveryDetail.end_time) }}</li>
              <li>Status: {{ deliveryDetail.status }}</li>
            </ul>
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
      <div class="flex flex-col space-y-2 w-full md:w-1/4">
        <button
          @click="updateStatus('picked-up')"
          class="bg-yellow-500 text-white py-2 px-4 rounded-md shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          Picked Up
        </button>
        <button
          @click="updateStatus('in-transit')"

          class="bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          In-Transit
        </button>
        <button
          @click="updateStatus('delivered')"
          class="bg-green-500 text-white py-2 px-4 rounded-md shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Delivered
        </button>
        <button
          @click="updateStatus('fail')"
          class="bg-red-500 text-white py-2 px-4 rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Fail
        </button>
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
const socket = io(BASEURL);

const trackPackage = async () => {
  try {
    const response = await axios.get(
      `${BASEURL}/v1/delivery/${trackingNumber.value}`
    );

    packageDetail.value = response.data;
    deliveryDetail.value = response.data.delivery;

    if (map.value) {
      map.value.off();
      map.value.remove();
      // mapElement.value.innerHTML  = ""
    }

    initMap();
  } catch (error) {
    console.error("Error fetching package details:", error);
    if (map.value) {
      map.value.off();
      map.value.remove();
    }

    packageDetail.value = null;
    deliveryDetail.value = null;
  }
};

const initMap = () => {
  if (!packageDetail.value || !deliveryDetail.value) return;

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

  const route1 = [
    [
      packageDetail.value.from_location.lat,
      packageDetail.value.from_location.lng,
    ],
    [packageDetail.value.to_location.lat, packageDetail.value.to_location.lng],
  ];
  L.polyline(route1, { color: "blue" }).addTo(map.value);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;

        L.marker([currentLat, currentLng])
          .addTo(map.value)
          .bindPopup("Driver Location")
          .openPopup();

        map.value.setView([currentLat, currentLng], 12);

        const route2 = [
          [currentLat, currentLng],
          [
            packageDetail.value.from_location.lat,
            packageDetail.value.from_location.lng,
          ],
        ];
        L.polyline(route2, { color: "red" }).addTo(map.value);
      },
      (error) => {
        console.error("Error getting current location:", error);
        alert("Unable to determine current location.");
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
    alert("Geolocation is not supported by this browser.");
  }
};

const updateStatus = (status) => {
  if (!deliveryDetail.value) return;
  const now = new Date().toISOString();
  let updatedStatus = status;

  if (deliveryDetail.value.status === "picked-up" && status !== "in-transit")
    return;
  if (
    deliveryDetail.value.status === "in-transit" &&
    status !== "delivered" &&
    status !== "fail"
  )
    return;

  if (status === "picked-up") {
    packageDetail.value.pickup_time = now;
  } else if (status === "in-transit") {
    packageDetail.value.start_time = now;
  } else if (status === "delivered" || status === "fail") {
    packageDetail.value.end_time = now;
  }

  socket.emit("status_changed", {
    event: "status_changed",
    delivery_id: deliveryDetail.value.delivery_id,
    status: updatedStatus,
  });
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

let intervalId;

const fetchAndSendLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;

        const newLocation = [currentLat, currentLng];
        map?.value?.setView(newLocation, 12);
        L.marker(newLocation).addTo(map.value).bindPopup('Driver Location').openPopup();

        socket.emit('location_changed', {
          event: 'location_changed',
          delivery_id: deliveryDetail.value.delivery_id,
          location: {
            lat: currentLat,
            lng: currentLng,
          },
        });
      },
      (error) => {
        console.error('Error fetching current location:', error);
      }
    );
  } else {
    console.error('Geolocation is not supported by this browser.');
  }
};


onUnmounted(() => {
  clearInterval(intervalId); 
});

onMounted(() => {
  intervalId = setInterval(fetchAndSendLocation, 20000);

  socket.on("delivery_updated", (updatedDelivery) => {
    if (updatedDelivery) {
      deliveryDetail.value = updatedDelivery.delivery;
    }
  });

  if (packageDetail.value && deliveryDetail.value) {
    initMap();
  }
});

onUnmounted(() => {
  socket.disconnect();
});
</script>
