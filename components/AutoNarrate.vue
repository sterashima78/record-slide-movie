<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue'
import { useNav } from '@slidev/client'

const nav = useNav()
const audio = ref<HTMLAudioElement | null>(null)
const preload = ref<HTMLAudioElement | null>(null)

const currentSrc = computed(() => `/audio/slide-${nav.currentPage.value}.wav`)
const nextSrc = computed(() => `/audio/slide-${nav.currentPage.value + 1}.wav`)

watchEffect(() => {
  audio.value?.play()
  preload.value?.load()
})
</script>

<template>
  <audio :src="currentSrc" autoplay @ended="nav.next()" ref="audio" />
  <audio :src="nextSrc" preload="auto" style="display:none" ref="preload" />
</template>
