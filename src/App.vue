<script setup>
import { useThreeRenderer } from '@/composables'
useThreeRenderer()
</script>

<template>
  <canvas id="card"></canvas>
  <div id="loading">
    <div class="overlay">
      <img
        src="https://ru.ipakyulibank.uz/uploads/images/widget/2024/05/widget_1715843113_2633.png.webp"
        alt=""
      />
    </div>
    <div class="progress">
      <div class="bar">
        <div class="progressbar-overlay"></div>
        <div class="progressbar"></div>
      </div>
      <div class="percent">0%</div>
    </div>
  </div>
</template>
