"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Bot, Loader2 } from 'lucide-react';
import { getGeminiResponse } from '@/lib/gemni';

export function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const aiResponse = await getGeminiResponse(prompt);
      setResponse(aiResponse);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 w-full max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">AI Assistant</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask the AI assistant..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ask'}
          </Button>
        </div>
      </form>

      {response && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </Card>
  );
}