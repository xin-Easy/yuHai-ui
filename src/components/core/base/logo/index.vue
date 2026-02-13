<template>
  <div class="flex-cc" :style="logoStyle">
    <svg
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      class="w-full h-full transition-colors duration-300"
      aria-label="Logo"
    >
      <defs>
        <mask id="shu-mask">
          <!-- White area is visible, Black area is hidden -->
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <!-- The text cuts out the fruit -->
          <text
            x="512"
            y="660"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="320"
            font-weight="bold"
            font-family="system-ui, -apple-system, sans-serif"
            fill="black"
            style="letter-spacing: -10px;"
          >
            薯
          </text>
        </mask>
      </defs>

      <!-- Outer Circle Background (Light Opacity) -->
      <circle cx="512" cy="512" r="512" fill="currentColor" fill-opacity="0.1" />

      <!-- Fruit Body (Masked) -->
      <ellipse
        cx="512"
        cy="550"
        rx="360"
        ry="300"
        fill="currentColor"
        mask="url(#shu-mask)"
      />

      <!-- Leaf -->
      <path
        d="M520 280 C 580 180, 720 220, 640 350"
        fill="currentColor"
      />
      
      <!-- Stem/Detail -->
      <path
        d="M560 300 Q 520 320, 480 300"
        stroke="currentColor"
        stroke-width="24"
        stroke-linecap="round"
        fill="none"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'Logo' })

interface Props {
  /** logo 大小 */
  size?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  size: 36
})

const logoStyle = computed(() => ({ width: `${props.size}px` }))
</script>
