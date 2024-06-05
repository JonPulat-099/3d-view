<script setup>
import { useThreeRenderer } from "@/composables";
useThreeRenderer()
</script>

<template>
  <canvas id="card"></canvas>
  <div id="loading">
    <div class="progress"><div class="progressbar"></div></div>
  </div>
</template>
