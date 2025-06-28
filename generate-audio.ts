import { GenericContainer, Wait } from 'testcontainers';
import { VoicevoxClient } from '@kajidog/voicevox-client';
import { mkdir, readFile } from 'node:fs/promises';

async function main() {
  const container = await new GenericContainer(
    'voicevox/voicevox_engine:cpu-ubuntu20.04-latest'
  )
    .withExposedPorts(50021)
    .withWaitStrategy(Wait.forHttp('/version', 50021).withStartupTimeout(60_000))
    .start();

  const baseUrl = `http://${container.getHost()}:${container.getMappedPort(50021)}`;
  const vv = new VoicevoxClient({ url: baseUrl, defaultSpeaker: 3 });

  await mkdir('public/audio', { recursive: true });

  const markdown = await readFile('slides.md', 'utf8');
  const matches = [...markdown.matchAll(/<!--\s*script:\s*([\s\S]*?)-->/gi)];

  let idx = 1;
  for (const m of matches) {
    const text = m[1].trim();
    const out = `public/audio/slide-${idx}.wav`;
    await vv.generateAudioFile(text, out);
    console.log(`✅ Slide ${idx} 音声生成完了`);
    idx++;
  }

  await container.stop();
  console.log('🛑 VOICEVOX Engine 停止');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
