Slidev における音声自動再生と自動ページ送りの実装方針

---

1. 目的

Slidev で作成したスライドを録画する際、各ページのトークスクリプトを自動合成した wav を再生し、再生完了後に次ページへ自動遷移させることで、ハンズフリーでプレゼン動画を生成する。

---

2. 現状の構成

要素内容

音声合成VOICEVOX Engine を Testcontainers で起動し、slides.md 内の <!--script: … --> コメントを抽出して /public/audio/slide-{n}.wav を一括生成
音声再生<AutoNarrate> コンポーネント（グローバルレイヤーに常駐）
ページ送り<audio> 要素の ended イベントで useNav().next() を呼び出し
先読み現在ページ + 1 の wav を preload="auto" で読み込み
配置場所global-bottom.vue に <AutoNarrate> を 1 個だけ配置

---

3. 音声自動再生コンポーネントの責務

1. 現在ページの wav を自動再生する。
2. 次ページの wav を事前ロードして遅延を排除する。
3. 再生完了 (ended) で Slidev のナビゲーション API を呼び出して次へ進む。
4. ページ切替時に自動で再生・先読みを更新する。


```mermaid
graph LR
  subgraph AutoNarrate
    A[watchEffect nav.currentPage] -->|src 更新| B(再生: currentSrc)
    A -->|preload 更新| C(先読み: nextSrc)
    B -->|ended| D[$nav.next()]
  end
```

---

4. 実装詳細

### 4.1 コンポーネント (components/AutoNarrate.vue)

データ依存: useNav().currentPage

算出プロパティ

currentSrc: /audio/slide-${page}.wav
nextSrc: /audio/slide-${page+1}.wav

テンプレート

```vue
<audio :src="currentSrc" autoplay @ended="nav.next()" ref="audio" />
<audio :src="nextSrc" preload="auto" style="display:none" ref="preload" />
```

ロジック

```ts
watchEffect(() => {
  audio.value?.play();
  preload.value?.load();
});
```

### 4.2 グローバルレイヤー (global-bottom.vue)

```vue
<template>
  <AutoNarrate />
</template>
```

> 理由: グローバルに 1 つだけ常駐させ、各スライドのマークアップを汚さない。

### 4.3 wav 生成スクリプト変更点

配列インデックス 0 → ページ番号 1 へオフセット。
slide-${page}.wav と命名し、番号に穴が開かないようにする。

---

5. 期待されるユーザーフロー

1. pnpm run voice で wav 全生成。
2. pnpm slidev --remote でスライドを開く。
3. ページ遷移は完全自動。録画 UI で Start Recording を押すだけ。
4. 取得した mp4 をそのまま公開可能。

---
