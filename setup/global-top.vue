<script setup lang="ts">
import { ref, watchEffect, nextTick, onMounted } from 'vue';
import { useSlideContext, useNav } from '@slidev/client';

const cache = new Map<string, HTMLAudioElement>();
const current = ref<HTMLAudioElement | null>(null);
const { frontmatter, page } = useSlideContext();
const nav = useNav();

function preload(src: string) {
  if (!cache.has(src)) {
    const a = new Audio(src);
    a.preload = 'auto';
    cache.set(src, a);
  }
}

watchEffect(() => {
  const src = String(frontmatter.value.audio ?? '')
  const delay = Number(frontmatter.value.autoNextDelay ?? 0)
  const preloadAudio = frontmatter.value.preloadAudio !== false

  if (src && preloadAudio) preload(src)

  nextTick(() => {
    if (!src) return
    const audio = cache.get(src) ?? new Audio(src)
    cache.set(src, audio)

    current.value?.pause()
    current.value = audio
    audio.currentTime = 0
    audio.play().catch(console.warn)

    audio.onended = () => {
      if (delay < 0) return
      setTimeout(() => nav.nextSlide(), delay)
    }
  })
})

onMounted(() => {
  watchEffect(() => {
    const nextMeta: any = __SLIDEV_SLIDE_META__[page.value + 1]
    if (nextMeta?.audio && nextMeta?.preloadAudio !== false) preload(nextMeta.audio)
  })
})
</script>
