import { Room } from '@/components/room';

export default function RoomPage({
  params,
  searchParams,
}: {
  params: { roomId: string };
  searchParams: { username: string };
}) {
  return (
    <main className="min-h-screen bg-background">
      <Room roomId={params.roomId} username={searchParams.username} />
    </main>
  );
}