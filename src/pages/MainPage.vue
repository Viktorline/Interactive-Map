<script setup lang="ts">
import MapView from '@/widgets/MapView/MapView.vue'
</script>

<template>
  <div class="wrapper">
    <div class="sidebar">
      <h2>Сайдбар</h2>
    </div>
    <div class="mapContainer">
      <MapView />
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  height: 100%;
  width: 100%;
}

.sidebar {
  width: 30%;
  background-color: #f5f5f5;
  padding: 20px;
  border-right: 2px solid #ddd;
}

.mapContainer {
  width: 70%;
  background-color: #fff;
}

h2 {
  margin: 0;
  color: #333;
}
</style>
