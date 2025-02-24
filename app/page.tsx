import { CreateRoom } from '@/components/create-room';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Video Conference
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create or join a room to start your video conference
          </p>
        </div>
        <CreateRoom />
      </div>
    </main>
  );
}