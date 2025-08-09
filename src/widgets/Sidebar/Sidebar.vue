<script setup lang="ts">
import { useMarkersStore } from '@/shared/stores/useMarkersStore'
import MarkerItem from './MarkerItem/MarkerItem.vue'
import SearchInput from './SearchInput/SearchInput.vue'
import { MapPin, Plus, Loader2 } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { TEXTS } from '@/shared/constants/texts'

interface Props {
  focusOnCoordinates?: ((coordinates: [number, number], zoom?: number) => void) | null
  setAddingMarkerMode?: ((enabled: boolean) => void) | null
  isAddingMarker?: boolean
}

const props = defineProps<Props>()

const store = useMarkersStore()
const isInitializing = ref(true)

onMounted(async () => {
  try {
    await store.loadMarkersFromStorage()
  } finally {
    isInitializing.value = false
  }
})

const handleAddLocation = () => {
  if (props.setAddingMarkerMode) {
    const newValue = !props.isAddingMarker
    props.setAddingMarkerMode(newValue)
  }
}

const myLocationMarker = computed(() => store.myLocationMarker)

const hasMyLocation = computed(() => !!myLocationMarker.value)

const showLoading = computed(
  () => isInitializing.value || (!hasMyLocation.value && !isInitializing.value),
)

const handleMyLocation = () => {
  if (myLocationMarker.value && props.focusOnCoordinates) {
    props.focusOnCoordinates(myLocationMarker.value.coordinates as [number, number], 15)
  }
}
</script>

<template>
  <aside class="sidebar">
    <SearchInput />

    <div class="location-buttons">
      <button
        @click="handleMyLocation"
        class="location-btn my-location"
        :disabled="!hasMyLocation"
        :title="hasMyLocation ? TEXTS.goToMyLocation : TEXTS.determiningLocationTitle"
      >
        <MapPin v-if="hasMyLocation" />
        <Loader2 v-else-if="showLoading" class="animate-spin" />
        <span class="location-btn-text">{{
          hasMyLocation ? TEXTS.myLocation : TEXTS.determiningLocation
        }}</span>
      </button>
      <button
        @click="handleAddLocation"
        class="location-btn add-location"
        :class="{ active: props.isAddingMarker }"
        :title="props.isAddingMarker ? 'Отменить добавление' : 'Добавить новую локацию'"
      >
        <Plus />
        <span>{{ props.isAddingMarker ? 'Отменить' : TEXTS.addLocation }}</span>
      </button>
    </div>

    <section class="marker-list">
      <MarkerItem
        v-for="m in store.markers"
        :key="m.id"
        :marker="m"
        @focus="props.focusOnCoordinates?.(m.coordinates as [number, number])"
        @remove="store.removeMarker($event)"
      />
    </section>
  </aside>
</template>

<style scoped>
.sidebar {
  color: black;
  display: flex;
  flex-direction: column;
  padding-left: 16px;
  width: 100%;
  height: 100%;
}

.location-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding-right: 16px;
}

.location-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  color: #333;
  max-width: 50%;
}

.location-btn-text {
  white-space: wrap;
}

.location-btn:hover:not(:disabled) {
  border-color: #007bff;
  background: #f8f9fa;
}

.location-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

.location-btn svg {
  width: 20px;
  height: 20px;
}

.my-location {
  border-color: #28a745;
  color: #28a745;
}

.my-location:hover:not(:disabled) {
  background: #f8fff9;
  border-color: #20c997;
}

.my-location:disabled {
  border-color: #6c757d;
  color: #6c757d;
}

.add-location {
  border-color: #6c757d;
  color: #6c757d;
}

.add-location.active {
  border-color: #007bff;
  color: #007bff;
  background: #f8f9fa;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.marker-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;

  max-height: 100%;
  position: relative;
  padding-right: 16px;
}

.marker-list::-webkit-scrollbar {
  width: 2px;
  left: -10px !important;
}

.marker-list::-webkit-scrollbar-thumb {
  background-color: #999;
  border-radius: 4px;
}
</style>
