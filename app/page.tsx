'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'hello world' }),
    })
    .then(res => res.json())
    .then(data => setReply(data.reply || 'No response'))
    .catch(() => setReply('Error: Failed to get response from AI'))
    .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: 'hotpink', fontSize: '3rem', marginBottom: '1rem' }}>
        Hello World
      </h1>
      <p style={{ color: '#666', fontSize: '1.2rem', maxWidth: '600px', marginBottom: '2rem' }}>
        Welcome to TransMenu - AI-powered menu translation application built
        with Next.js, TypeScript, and OpenAI.
      </p>
      
      <div 
        data-testid="ai-response"
        style={{ 
        minHeight: '100px', 
        padding: '1rem', 
        backgroundColor: '#f5f5f5',
        borderRadius: '0.5rem',
        borderLeft: '4px solid hotpink',
        maxWidth: '500px',
        width: '100%'
      }}>
        {loading ? (
          <p style={{ margin: 0, color: '#999', fontStyle: 'italic' }}>
            AI が応答を生成中です...
          </p>
        ) : reply ? (
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1rem' }}>
              AI 応答:
            </h3>
            <p style={{ margin: 0, color: '#666', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
              {reply}
            </p>
          </div>
        ) : (
          <p style={{ margin: 0, color: '#999', fontStyle: 'italic' }}>
            AI からの応答がここに表示されます
          </p>
        )}
      </div>
    </main>
  );
}
