'use client';

import { css } from '@emotion/react';

export default function Home() {
  return (
    <main
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
      `}
    >
      <h1
        css={css`
          color: hotpink;
          font-size: 3rem;
          margin-bottom: 1rem;
          text-align: center;
        `}
      >
        Hello World
      </h1>
      <p
        css={css`
          color: #666;
          font-size: 1.2rem;
          text-align: center;
          max-width: 600px;
        `}
      >
        Welcome to TransMenu - AI-powered menu translation application built
        with Next.js 14, TypeScript, Emotion, and PostgreSQL.
      </p>
    </main>
  );
}
