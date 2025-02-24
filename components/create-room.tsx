"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Video, Users } from 'lucide-react';

export function CreateRoom() {
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName && userName) {
      router.push(`/room/${roomName}?username=${userName}`);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
            className="w-full"
          />
          <Input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <Button type="submit" className="w-full">
          <Video className="w-4 h-4 mr-2" />
          Join Room
        </Button>
      </form>
    </Card>
  );
}