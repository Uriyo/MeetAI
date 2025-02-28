# MeetAI

MeetAI is an advanced meeting assistant designed to enhance virtual collaboration. Built with Next.js and TypeScript, MeetAI integrates the power of the Gemini API for intelligent processing, Excalidraw for interactive whiteboarding, and the Livekit SDK for real-time audio and video streaming.

## Features

- **Real-Time Video Conferencing:**  
  Powered by Livekit SDK for seamless video and audio communication.

- **AI Assistant:**  
  Integrated AI assistant to enhance user experience with intelligent insights and automation.

- **Live Transcription:**  
  Uses Deepgram SDK for real-time transcription of conversations.

- **Whiteboarding:**  
  Utilize Excalidraw to enable dynamic diagramming and sketching during sessions.

- **User Authentication:**  
  Secure authentication mechanism ensuring only authorized users join meetings.

- **Modern, Scalable Architecture:**  
  Developed with Next.js and TypeScript for a robust and maintainable codebase.

## Technologies Used

- **[Next.js](https://nextjs.org/):** Framework for server-side rendering and static site generation.
- **[TypeScript](https://www.typescriptlang.org/):** Superset of JavaScript that adds static types.
- **[Gemini API](https://gemmni.com/):** AI-powered API for transcription and summarization.
- **[Excalidraw](https://excalidraw.com/):** Tool for creating interactive, hand-drawn style diagrams.
- **[Livekit SDK](https://livekit.io/):** SDK for real-time audio and video streaming.
- **[Deepgram SDK](https://deepgram.com/):** AI-based speech-to-text transcription service.

## Installation

### Prerequisites

- Node.js (v14 or later recommended)
- npm or yarn package manager

### Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/MeetAI.git
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   ```bash
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_LIVEKIT_URL=your_livekit_server_url
   NEXT_PUBLIC_LIVEKIT_API_KEY=your_livekit_api_key
   NEXT_PUBLIC_LIVEKIT_SECRET=your_livekit_secret
   NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_api_key
   ```
4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
5. **Access the Application:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

