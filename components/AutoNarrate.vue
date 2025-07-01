<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue'
import { useNav, useSlideContext } from '@slidev/client'

const props = defineProps<{ delay?: number }>()
const { $frontmatter } = useSlideContext()

const delay = computed(() => {
  const fmDelay = Number($frontmatter.value?.delay)
  return Number.isFinite(fmDelay) ? fmDelay : props.delay ?? 500
})

const nav = useNav()
const audio = ref<HTMLAudioElement | null>(null)
const preload = ref<HTMLAudioElement | null>(null)

const currentSrc = computed(() => `/audio/slide-${nav.currentPage.value}.wav`)
const nextSrc = computed(() => `/audio/slide-${nav.currentPage.value + 1}.wav`)

const onEnded = () => {
  setTimeout(() => nav.next(), delay.value)
}

watchEffect(() => {
  audio.value?.play()
  preload.value?.load()
})
</script>

<template>
  <audio :src="currentSrc" autoplay @ended="onEnded" ref="audio" />
  <audio :src="nextSrc" preload="auto" style="display:none" ref="preload" />
</template>
