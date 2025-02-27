import { Room } from '@/components/room';

export default function RoomPage({
  params,
  searchParams,
}: {
  params: { roomName: string };
  searchParams: { username: string };
}) {
  return (
    <main className="min-h-screen bg-background">
      <Room roomName={params.roomName} username={searchParams.username} />
    </main>
  );
}