"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Save, Trash2 } from 'lucide-react';
import { Excalidraw, exportToBlob } from '@excalidraw/excalidraw';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types/types';

interface WhiteboardProps {
  roomId: string;
}

export function Whiteboard({ roomId }: WhiteboardProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [savedDrawings, setSavedDrawings] = useState<{
    elements: ExcalidrawElement[];
    state: Partial<AppState>;
    files: BinaryFiles;
  } | null>(null);

  useEffect(() => {
    // Load saved drawings from localStorage when component mounts
    const saved = localStorage.getItem(`drawings-${roomId}`);
    if (saved) {
      setSavedDrawings(JSON.parse(saved));
    }
  }, [roomId]);

  const saveDrawing = useCallback(() => {
    if (!excalidrawAPI) return;

    const elements = excalidrawAPI.getSceneElements();
    const state = excalidrawAPI.getAppState();
    const files = excalidrawAPI.getFiles();

    const drawingData = {
      elements,
      state,
      files,
    };

    localStorage.setItem(`drawings-${roomId}`, JSON.stringify(drawingData));
    setSavedDrawings(drawingData);
  }, [excalidrawAPI, roomId]);

  const clearDrawing = useCallback(() => {
    if (!excalidrawAPI) return;
    excalidrawAPI.resetScene();
    localStorage.removeItem(`drawings-${roomId}`);
    setSavedDrawings(null);
  }, [excalidrawAPI, roomId]);

  const downloadDrawing = useCallback(async () => {
    if (!excalidrawAPI) return;

    const blob = await exportToBlob({
      elements: excalidrawAPI.getSceneElements(),
      mimeType: "image/png",
      appState: excalidrawAPI.getAppState(),
      files: excalidrawAPI.getFiles(),
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whiteboard-${roomId}-${new Date().toISOString()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [excalidrawAPI, roomId]);

  return (
    <Card className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="font-semibold">Whiteboard</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={saveDrawing}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={downloadDrawing}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={clearDrawing}>
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={savedDrawings || undefined}
          theme="light"
          viewModeEnabled={false}
          zenModeEnabled={false}
          gridModeEnabled={false}
        />
      </div>
    </Card>
  );
}