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

  const slides = (await readFile('slides.md', 'utf8'))
    .split(/\n---\n/g)
    .filter((s) => !s.trim().startsWith('title:'));

  let idx = 1;
  for (const seg of slides) {
    const m = seg.match(/<!--\s*talk:\s*([\s\S]*?)-->/i);
    if (!m) {
      idx++;
      continue;
    }
    const text = m[1].trim();
    const out = `public/audio/${String(idx).padStart(2, '0')}.wav`;
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
