import { NextRequest, NextResponse } from 'next/server';
import { generateNarration } from '@/lib/gemini';

// Create a 44-byte WAV header for raw PCM L16 data
function createWavHeader(pcmLength: number, sampleRate: number = 24000, channels: number = 1, bitsPerSample: number = 16): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const dataSize = pcmLength;
  const fileSize = 36 + dataSize;

  header.write('RIFF', 0);
  header.writeUInt32LE(fileSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20);  // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return header;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { script, useMock = false } = body;

    // Validate required fields
    if (!script) {
      return NextResponse.json(
        { error: 'Missing required field: script' },
        { status: 400 }
      );
    }

    // For mock mode or no API key, return empty (frontend will skip audio)
    if (useMock || !process.env.GEMINI_API_KEY) {
      console.log('Skipping TTS in mock mode');
      return NextResponse.json({ audioBase64: null, mimeType: null, mock: true });
    }

    // Generate narration using Gemini TTS
    const { data, mimeType } = await generateNarration(script);

    // If the response is raw PCM (L16), prepend a WAV header so browsers can play it
    if (mimeType.includes('L16') || mimeType.includes('pcm') || mimeType.includes('raw')) {
      const pcmBuffer = Buffer.from(data, 'base64');
      // Parse sample rate from mimeType if present (e.g. "audio/L16;rate=24000")
      const rateMatch = mimeType.match(/rate=(\d+)/);
      const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
      const wavHeader = createWavHeader(pcmBuffer.length, sampleRate);
      const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);
      const wavBase64 = wavBuffer.toString('base64');
      return NextResponse.json({ audioBase64: wavBase64, mimeType: 'audio/wav' });
    }

    return NextResponse.json({ audioBase64: data, mimeType });
  } catch (error) {
    console.error('Error in narrate API:', error);
    return NextResponse.json(
      { audioBase64: null, mimeType: null, error: 'Failed to generate narration' },
      { status: 500 }
    );
  }
}
