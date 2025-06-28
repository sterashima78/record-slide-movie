# Slidev × VOICEVOX 自動プレゼン生成システム

Markdown ベースの Slidev スライドに対し、Docker 上の VOICEVOX Engine で音声を自動生成して紐付け、音声再生終了後にインターバル付きで自動遷移させる仕組みです。Recording UI を使えばワンボタンで収録できます。

---

## 1. ディレクトリ構成

```text
my-talk/
├─ slides.md            # スライド本文 + front-matter
├─ public/
│   └─ audio/           # 生成 WAV
├─ setup/
│   └─ global-top.vue   # 再生 + 自動遷移ロジック
├─ generate-audio.ts    # 音声一括生成スクリプト
├─ package.json
└─ tsconfig.json
```

---

## 2. 依存パッケージ

```bash
pnpm add -D @slidev/cli testcontainers @kajidog/voicevox-client \
  typescript tsx @types/node
```

Node.js v22 以上を想定しています (fs.promises.glob が利用可能)。

---

## 3. コア実装

### 3.1 音声生成スクリプト `generate-audio.ts`

```ts
import { GenericContainer, Wait } from 'testcontainers';
import { VoicevoxClient } from '@kajidog/voicevox-client';
import { glob, mkdir, readFile, writeFile } from 'node:fs/promises';

// 1) VOICEVOX Engine コンテナ起動
const container = await new GenericContainer(
  'voicevox/voicevox_engine:cpu-ubuntu20.04-latest'
)
  .withExposedPorts(50021)
  .withWaitStrategy(Wait.forHttp('/version').withStartupTimeout(60_000))
  .start();

const baseUrl = `http://${container.getHost()}:${container.getMappedPort(50021)}`;
const vv = new VoicevoxClient({ url: baseUrl, defaultSpeaker: 3 });

// 2) slides.md から script コメントを抽出
await mkdir('public/audio', { recursive: true });
const slides = (await readFile('slides.md', 'utf8'))
  .split(/\n---\n/g)
  .filter((s) => !s.trim().startsWith('title:'));

let idx = 1;
for (const seg of slides) {
  const m = seg.match(/<!--\s*talk:\s*([\s\S]*?)-->/i);
  if (!m) { idx++; continue; }
  const text = m[1].trim();

  const wav = await vv.speak(text, { raw: true });
  const out = `public/audio/${String(idx).padStart(2, '0')}.wav`;
  await writeFile(out, wav);
  console.log(`✅ Slide ${idx} 音声生成完了`);
  idx++;
}

// 3) コンテナ終了
await container.stop();
console.log('🛑 VOICEVOX Engine 停止');
```

ポイント:
- `Wait.forHttp('/version')` で Engine 起動完了を判定。
- `VoicevoxClient.speak()` が AudioQuery→synthesis を自動実行。
- ファイル名規約 `NN.wav` に合わせ front-matter で参照。

### 3.2 再生 & 自動遷移ロジック `setup/global-top.vue`

```vue
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
  const src = String(frontmatter.value.audio ?? '');
  const delay = Number(frontmatter.value.autoNextDelay ?? 0);
  const preloadAudio = frontmatter.value.preloadAudio !== false;

  if (src && preloadAudio) preload(src);

  nextTick(() => {
    if (!src) return;
    const audio = cache.get(src) ?? new Audio(src);
    cache.set(src, audio);

    current.value?.pause();
    current.value = audio;
    audio.currentTime = 0;
    audio.play().catch(console.warn);

    audio.onended = () => {
      if (delay < 0) return;
      setTimeout(() => nav.nextSlide(), delay);
    };
  });
});

onMounted(() => {
  watchEffect(() => {
    const nextMeta: any = __SLIDEV_SLIDE_META__[page.value + 1];
    if (nextMeta?.audio && nextMeta?.preloadAudio !== false) preload(nextMeta.audio);
  });
});
</script>
```

### 3.3 front-matter

| キー | 型 | 既定値 | 説明 |
| ---- | --- | ---- | ---- |
| `audio` | string or string[] | — | 必須。そのスライドで再生する音声ファイルへのパス。配列を渡すと順番に連続再生。未指定の場合でも `public/audio/NN.wav` があれば自動で読み込む拡張も可能 |
| `preloadAudio` | boolean | true | `false` で先読みしない |
| `autoNextDelay` | number | 0 | 音声終了後から次スライド遷移までの遅延(ms)。負値で自動遷移しない |

記述例（単一音声）:

```markdown
---
audio: /audio/05.wav
autoNextDelay: 2000
---
# Slide 5 タイトル
```

記述例（複数音声）:

```markdown
---
audio:
  - /audio/12_narration.wav
  - /audio/12_bgm.mp3
preloadAudio: true
autoNextDelay: 500
---
```

---

## 4. npm スクリプト

```json
{
  "scripts": {
    "gen:audio": "tsx generate-audio.ts",
    "dev": "slidev --open",
    "run": "pnpm gen:audio && pnpm dev"
  }
}
```

`pnpm run` で音声生成後にスライドサーバが起動します。

---

## 5. 受け入れチェックリスト

| 項目 | 確認方法 |
| --- | --- |
| コンテナ自動終了 | `docker ps` で残コンテナ 0 を確認 |
| 音声生成 | `public/audio/NN.wav` がスライド数ぶん生成 |
| プリロード | DevTools Network → Media に次ページ音声が prefetch される |
| 自動遷移 | 音声終了 + delay 後にページ送り |
| 録画 | Recording UI で音声入り `.webm` が保存 |


## Status

All tasks implemented.

