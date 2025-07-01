<script setup lang="ts">
import { ref, watchEffect, computed, onBeforeUnmount } from 'vue'
import { useNav, useSlideContext } from '@slidev/client'

const props = defineProps<{ delay?: number; startDelay?: number }>()
const { $frontmatter } = useSlideContext()

const delay = computed(() => {
  const fmDelay = Number($frontmatter.value?.delay)
  return Number.isFinite(fmDelay) ? fmDelay : props.delay ?? 500
})

const startDelay = computed(() => {
  const fm = Number($frontmatter.value?.startDelay)
  return Number.isFinite(fm) ? fm : props.startDelay ?? 0
})

const nav = useNav()
const audio = ref<HTMLAudioElement | null>(null)
const preload = ref<HTMLAudioElement | null>(null)
const timer = ref<number>()

const currentSrc = computed(() => `/audio/slide-${nav.currentPage.value}.wav`)
const nextSrc = computed(() => `/audio/slide-${nav.currentPage.value + 1}.wav`)

const onEnded = () => {
  setTimeout(() => nav.next(), delay.value)
}

watchEffect(() => {
  if (!audio.value) return
  const el = audio.value
  el.pause()
  el.currentTime = 0
  clearTimeout(timer.value)
  timer.value = window.setTimeout(() => {
    el.play()
  }, startDelay.value)
  preload.value?.load()
})

onBeforeUnmount(() => {
  clearTimeout(timer.value)
})
</script>

<template>
  <audio :src="currentSrc" @ended="onEnded" ref="audio" />
  <audio :src="nextSrc" preload="auto" style="display:none" ref="preload" />
</template>
