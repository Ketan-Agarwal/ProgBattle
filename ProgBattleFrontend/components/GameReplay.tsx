// GameReplay.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

type GameStep = {
  ball_x: number;
  ball_y: number;
  paddle1_x: number;
  paddle2_x: number;
  score_bot1: number;
  score_bot2: number;
};

const cellSize = 20;
const paddleWidth = 60;
const paddleHeight = 10;
const ballRadius = 8;

function parseCSV(raw: string): GameStep[] {
  const lines = raw.trim().split("\n").slice(1); // Remove header
  return lines.map((line) => {
    const parts = line.split(",");
    return {
      ball_x: parseInt(parts[1]),
      ball_y: parseInt(parts[2]),
      paddle1_x: parseInt(parts[3]),
      paddle2_x: parseInt(parts[4]),
      score_bot1: parseInt(parts[7]),
      score_bot2: parseInt(parts[8]),
    };
  });
}

export default function GameSimulation({ log }: { log: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [steps, setSteps] = useState<GameStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!log) return;
    const parsedSteps = parseCSV(log);
    setSteps(parsedSteps);
    setCurrentStep(0);
  }, [log]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || steps.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const step = steps[currentStep];
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ball
      ctx.beginPath();
      ctx.arc(step.ball_x * cellSize, step.ball_y * cellSize, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#ff3e00";
      ctx.fill();

      // Paddles
      ctx.fillStyle = "#007aff";
      ctx.fillRect(step.paddle1_x * cellSize, 0, paddleWidth, paddleHeight);
      ctx.fillStyle = "#00c851";
      ctx.fillRect(step.paddle2_x * cellSize, canvas.height - paddleHeight, paddleWidth, paddleHeight);

      // Scores
      ctx.fillStyle = "#000";
      ctx.font = "16px Arial";
      ctx.fillText(`Bot1: ${step.score_bot1}`, 10, canvas.height / 2 - 20);
      ctx.fillText(`Bot2: ${step.score_bot2}`, 10, canvas.height / 2 + 20);
    };

    draw();
  }, [steps, currentStep]);

  useEffect(() => {
    if (!steps.length) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1 < steps.length ? prev + 1 : prev));
    }, 100); // Adjust speed here
    return () => clearInterval(interval);
  }, [steps]);

  return <canvas ref={canvasRef} width={800} height={600} />;
}
