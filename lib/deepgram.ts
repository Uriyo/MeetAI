import { createClient,FileSource } from '@deepgram/sdk';

const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY!);

export async function transcribeAudio(audioBlob: Blob) {
  const audioBuffer = await audioBlob.arrayBuffer();
  const source: FileSource = {
    buffer: audioBuffer,
    // mimetype: 'audio/webm',
  };
  const options = {
    smart_format: true,
    language: 'en-US',
    model: 'nova-2',
    diarize: true,
    mimetype: 'audio/webm',
  };
  

  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(source, options);


  if (error) throw error;
  if (!result?.results) throw new Error('No transcription results');
  
  return result.results.channels[0].alternatives[0].transcript;
}