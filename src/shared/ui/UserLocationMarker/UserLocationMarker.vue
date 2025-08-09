<template>
  <div class="user-location">
    <div class="marker-dot"></div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.user-location {
  display: flex;
  align-items: center;
  justify-content: center;
}

.marker-dot {
  width: 20px;
  height: 20px;
  background: #28a745;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}
</style>
