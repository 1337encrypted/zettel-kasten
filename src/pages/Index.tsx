
import React from 'react';

const Index = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4" style={{ fontFamily: "Inter, sans-serif" }}>
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary tracking-wide">
          Zettelkasten Notes
        </h1>
      </header>
      <main>
        <p className="text-lg text-muted-foreground">
          Welcome to your new Zettelkasten. We're starting fresh!
        </p>
      </main>
    </div>
  );
};

export default Index;
