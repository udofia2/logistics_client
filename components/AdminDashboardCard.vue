<template>
  <div class="flex flex-col md:flex-row md:space-x-6">
    <div class="flex-1 flex flex-col space-y-6">
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
  <div class="flex space-x-2">
    <div>ID: {{ pk.package_id }}</div>
    <button
      @click="copyPackageId(pk.package_id)"
      class="flex justify-center items-center bg-gray-200 py-1 px-2 rounded-md shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 5H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2v-5M8 5a2 2 0 00-2 2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-14a2 2 0 01-2-2V6a2 2 0 00-2 2z"
        />
      </svg>
      Copy
    </button>
  </div>
            <div class="flex space-x-2 md:mt-2 mt-2">
              <button
                @click="viewPackage(pk.package_id)"
                class="bg-blue-500 text-white py-1 px-2 rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                View
              </button>
              <button
                @click="editPackage(pk.package_id)"
                class="bg-yellow-500 text-white py-1 px-2 rounded-md shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Edit
              </button>
              <button
                @click="deletePackage(pk.package_id)"
                class="bg-red-500 text-white py-1 px-2 rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </li>
          <li v-if="packages.length === 0" class="text-gray-500">
            No packages available.
          </li>
        </ul>
      </div>

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
            <div class="font-medium">
              Delivery ID: {{ delivery.delivery_id }}
            </div>
            <div>Status: {{ delivery.status }}</div>
          </li>
          <li v-if="deliveries.length === 0" class="text-gray-500">
            No deliveries available.
          </li>
        </ul>
      </div>
    </div>

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

  <CreatePackageModal
    v-if="showCreatePackageModal"
    @close="showCreatePackageModal = false"
  />

  <CreateDeliveryModal
    v-if="showCreateDeliveryModal"
    @close="showCreateDeliveryModal = false"
    :packages="packages"
  />
  <ViewPackageModal
    v-if="showViewPackageModal"
    @close="showViewPackageModal = false"
    :packageId="viewingPackageId"
  />

  <EditPackageModal
    v-if="showEditPackageModal"
    @close="showEditPackageModal = false"
    :packageId="editingPackageId"
  />
</template>

<script setup>
import axios from "axios";

const BASEURL = useRuntimeConfig().public.SERVER_URL;

const packages = ref([]);
const deliveries = ref([]);
const showCreatePackageModal = ref(false);
const showCreateDeliveryModal = ref(false);

const showViewPackageModal = ref(false);
const viewingPackageId = ref(null);

const showEditPackageModal = ref(false);
const editingPackageId = ref(null);

const emit = defineEmits(['update:packages', 'update:deliveries']);

const fetchData = async () => {
  try {
    const packageResponse = await axios.get(`${BASEURL}/v1/package`);
    packages.value = packageResponse.data.results;

    const deliveryResponse = await axios.get(`${BASEURL}/v1/delivery`);
    deliveries.value = deliveryResponse.data.results;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const deletePackage = async (packageId) => {
  try {
    const associatedDelivery = packages.value.find(
      (pkg) => pkg.package_id === packageId
    );
    console.log(associatedDelivery.active_delivery_id);
    if (associatedDelivery.active_delivery_id) {
      console.log(associatedDelivery);
      await axios.delete(
        `${BASEURL}/v1/delivery/${associatedDelivery.active_delivery_id}`
      );
    }

    await axios.delete(`${BASEURL}/v1/package/${packageId}`);

    await fetchData();
  } catch (error) {
    console.error("Error deleting package:", error);
  }
};

const viewPackage = (packageId) => {
  viewingPackageId.value = packageId;
  showViewPackageModal.value = true;
};

const editPackage = (packageId) => {
  editingPackageId.value = packageId;
  showEditPackageModal.value = true;
};

const copyPackageId = (packageId) => {
  navigator.clipboard.writeText(packageId);
  alert(`Package ID ${packageId} copied to clipboard!`);
};

onMounted(() => {
  fetchData().then(() => {
  emit('update:packages', packages.value);
  emit('update:deliveries', deliveries.value);
});
});
</script>
