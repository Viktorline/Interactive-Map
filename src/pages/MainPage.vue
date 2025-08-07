<script setup lang="ts"></script>

<template>
  <div class="wrapper">
    <div class="sidebar">
      <h2>Сайдбар</h2>
    </div>
    <div class="mapContainer">
      <h2>Карта</h2>
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
  border-right: 1px solid #ddd;
}

.mapContainer {
  width: 70%;
  padding: 20px;
  background-color: #fff;
}

h2 {
  margin: 0;
  color: #333;
}
</style>
