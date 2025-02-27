"use client";
import { SetStateAction, useEffect, useRef, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track, Room as LiveKitRoomType } from 'livekit-client';
import { AIAssistant } from './ai-assistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, MessageSquare, PenTool } from 'lucide-react';
import { Whiteboard } from './whiteboard';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

export function Room({ roomName, username }: { roomName: string; username: string }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(`http://localhost:3001/getToken?participantName=${encodeURIComponent(username)}&roomName=${roomName}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to get token');
        }
        console.log("Token:", data.token);
        setToken(data.token);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get token');
        console.error('Error fetching token:', err);
      }
    };

    fetchToken();
  }, [roomName, username]);

  

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-destructive text-lg">Failed to join room</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (token === "") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Connecting to room...
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ''}
      data-lk-theme="default"
      style={{ height: '100vh' }}
      //onConnected={handleConnected}
    >
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <VideoConference />
          </div>
          <div className="p-4 bg-background border-t">
          </div>
        </div>
        <div className="w-96 border-l bg-background p-4 overflow-hidden">
          <Tabs defaultValue="agent" className="h-full">
            <TabsList>
              <TabsTrigger value="assistant">
                <MessageSquare className="w-4 h-4 mr-2" />
                Assistant
              </TabsTrigger>
              <TabsTrigger value="notes">
                <PenTool className="w-4 h-4 mr-2" />
                Notes
              </TabsTrigger>
            </TabsList>
            <TabsContent value="assistant" className="h-[calc(100vh-130px)]">
              <AIAssistant />
            </TabsContent>
            <TabsContent value="notes" className="h-[calc(100vh-130px)]">
              <Whiteboard roomId={roomName} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}