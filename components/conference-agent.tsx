"use client";

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Mic, FileText, List, Download } from 'lucide-react';
import { getGeminiResponse } from '@/lib/gemni';
import { transcribeAudio } from '@/lib/deepgram';
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  Track,
  ParticipantEvent,
} from 'livekit-client';

interface ConferenceAgentProps {
  room: Room;
}

export function ConferenceAgent({ room }: ConferenceAgentProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const audioSourcesRef = useRef<Map<string, MediaStreamAudioSourceNode>>(new Map());
  const deepgramConnection = useRef<any>(null);
  
  useEffect(() => {
    if (!room) return;

    // Initialize AudioContext and destination once
    const setupAudioContext = () => {
      audioContextRef.current = new AudioContext();
      audioDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
    };

    // Add a track to the mixed destination
    const addAudioTrack = (participantId: string, mediaStreamTrack: MediaStreamTrack) => {
      if (!audioContextRef.current || !audioDestinationRef.current) return;
      const source = audioContextRef.current.createMediaStreamSource(
        new MediaStream([mediaStreamTrack])
      );
      source.connect(audioDestinationRef.current);
      audioSourcesRef.current.set(participantId, source);
    };

    // Remove a track from the mixed destination
    const removeAudioTrack = (participantId: string) => {
      const source = audioSourcesRef.current.get(participantId);
      if (source) {
        source.disconnect();
        audioSourcesRef.current.delete(participantId);
      }
    };

    // Set up a participant's existing and future audio tracks
    const handleParticipantTracks = (participant: RemoteParticipant) => {
      // 1) Add already-published tracks
      participant.tracks.forEach((publication) => {
        if (publication.kind === Track.Kind.Audio && publication.track) {
          addAudioTrack(participant.identity, publication.track.mediaStreamTrack);
        }
      });

      // 2) Subscribe to new/unsubscribed tracks
      participant.on(ParticipantEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          addAudioTrack(participant.identity, track.mediaStreamTrack);
        }
      });

      participant.on(ParticipantEvent.TrackUnsubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          removeAudioTrack(participant.identity);
        }
      });
    };

    // 1) Create the AudioContext
    setupAudioContext();

    // 2) Add local participant's audio (if published)
    room.localParticipant.tracks.forEach((publication) => {
      if (publication.kind === Track.Kind.Audio && publication.track) {
        addAudioTrack(room.localParticipant.identity, publication.track.mediaStreamTrack);
      }
    });

    // 3) Add existing remote participants' audio
    room.participants.forEach((participant) => {
      handleParticipantTracks(participant);
    });

    // 4) When a new participant joins, set them up
    const handleParticipantConnected = (participant: RemoteParticipant) => {
      handleParticipantTracks(participant);
    };
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);

    // Cleanup when component unmounts
    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      audioSourcesRef.current.forEach((source) => source.disconnect());
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [room]);

  /**
   * Start recording from the mixed MediaStreamDestination
   */
  const startRecording = () => {
    if (isRecording) return;

    // if (!audioDestinationRef.current || isRecording) return;
    audioContextRef.current = new AudioContext();
    audioDestinationRef.current = audioContextRef.current.createMediaStreamDestination();

    // Reconnect all existing audio sources
    audioSourcesRef.current.forEach((source) => {
      source.disconnect();
      source.connect(audioDestinationRef.current!);
    });

    try {
      console.log("button clicked");
      mediaRecorderRef.current = new MediaRecorder(audioDestinationRef.current.stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      const chunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          
          try {
            const audioBlob = new Blob([event.data], { type: 'audio/webm' });
            const transcriptText = await transcribeAudio(audioBlob);
            
            if (transcriptText) {
              setTranscript((prev) => [
                ...prev,
                `Speaker ${new Date().toLocaleTimeString()}: ${transcriptText}`
              ]);
            }
          } catch (error) {
            console.error('Transcription error:', error);
          }
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        console.log('Final audio blob:', audioBlob);
        // TODO: send audioBlob to a speech-to-text service for real transcription
      };

      // Record in 3-second intervals
      mediaRecorderRef.current.start(3000);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  /**
   * Stop recording
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      generateSummary();
    }
  };

  // Demo helper: generate random speech lines
  const generateRandomSpeech = () => {
    const phrases = [
      "I think we should focus on the user experience.",
      "The latest metrics show positive growth.",
      "Let's schedule a follow-up meeting next week.",
      "I agree with the previous point about scalability.",
      "We need to prioritize this feature for the next sprint.",
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  // Demo helper: append lines to transcript
  const simulateTranscription = (text: string) => {
    setTranscript((prev) => [...prev, text]);
  };

  /**
   * Generate a summary from the transcript (using your custom Gemini call)
   */
  const generateSummary = async () => {
    setIsProcessing(true);
    try {
      const fullTranscript = transcript.join('\n');
      const prompt = `Please analyze this meeting transcript and provide a concise summary highlighting key points, decisions, and action items:\n\n${fullTranscript}`;
      const summaryResponse = await getGeminiResponse(prompt);
      setSummary(summaryResponse);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Download the transcript as a .txt file
   */
  const downloadTranscript = () => {
    const element = document.createElement('a');
    const file = new Blob([transcript.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `meeting-transcript-${new Date().toISOString()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="p-4 w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Conference Agent</h3>
        </div>
        <Button
          variant={isRecording ? 'destructive' : 'default'}
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
        >
          <Mic className={`w-4 h-4 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
      </div>

      <Tabs defaultValue="transcript" className="flex-1 flex flex-col">
        <TabsList>
          <TabsTrigger value="transcript">
            <FileText className="w-4 h-4 mr-2" />
            Transcript
          </TabsTrigger>
          <TabsTrigger value="summary">
            <List className="w-4 h-4 mr-2" />
            Summary
          </TabsTrigger>
        </TabsList>

        {/* Transcript Tab */}
        <TabsContent value="transcript" className="flex-1">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-2">
              {transcript.map((line, index) => (
                <p key={index} className="text-sm">
                  {line}
                </p>
              ))}
              {transcript.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTranscript}
                  className="mt-4"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Transcript
                </Button>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="flex-1">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {isProcessing ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Generating summary...</p>
              </div>
            ) : summary ? (
              <div className="prose prose-sm">
                <div className="whitespace-pre-wrap">{summary}</div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No summary available yet</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
