<script setup>
import { useThreeRenderer } from '@/composables'
useThreeRenderer()
</script>

<template>
  <canvas id="card"></canvas>
  <div id="loading">
    <div class="progress">
      <div class="bar">
        <div class="progressbar-overlay"></div>
        <div class="progressbar"></div>
      </div>
      <div class="percent">0%</div>
    </div>
  </div>
</template>
