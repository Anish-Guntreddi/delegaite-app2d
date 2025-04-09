// app/page.tsx
"use client";
import { useEffect, useRef } from "react";

interface Character {
  x: number;
  y: number;
  dx: number;
  dy: number;
  idleFrames: {
    down: HTMLImageElement[];
    up: HTMLImageElement[];
    left: HTMLImageElement[];
    right: HTMLImageElement[];
  };
  runFrames: {
    down: HTMLImageElement[];
    up: HTMLImageElement[];
    left: HTMLImageElement[];
    right: HTMLImageElement[];
  };
  direction: "down" | "up" | "left" | "right";
  idleTimer: number;
  isIdle: boolean;
}

interface Furniture {
  x: number;
  y: number;
  width: number;
  height: number;
  sprite: HTMLImageElement;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    canvas.width = 1024;
    canvas.height = 768;

    // Load background
    const background = new Image();
    background.src = "/OfficeSprites/Background/Background.png";

    // Load animations
    const loadFrames = (paths: string[]) => paths.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    // Helper function to load character animations
    const loadCharacterAnimations = (characterNum: number) => {
      const basePath = `/OfficeSprites/Character${characterNum}`;
      return {
        idleFrames: {
          down: loadFrames([
            `${basePath}/idle_anim_frames/downIdle/downIdle1.png`,
            `${basePath}/idle_anim_frames/downIdle/downIdle2.png`,
            `${basePath}/idle_anim_frames/downIdle/downIdle3.png`,
            `${basePath}/idle_anim_frames/downIdle/downIdle4.png`,
            `${basePath}/idle_anim_frames/downIdle/downIdle5.png`,
            `${basePath}/idle_anim_frames/downIdle/downIdle6.png`,
          ]),
          up: loadFrames([
            `${basePath}/idle_anim_frames/upIdle/upIdle1.png`,
            `${basePath}/idle_anim_frames/upIdle/upIdle2.png`,
            `${basePath}/idle_anim_frames/upIdle/upIdle3.png`,
            `${basePath}/idle_anim_frames/upIdle/upIdle4.png`,
            `${basePath}/idle_anim_frames/upIdle/upIdle5.png`,
            `${basePath}/idle_anim_frames/upIdle/upIdle6.png`,
          ]),
          left: loadFrames([
            `${basePath}/idle_anim_frames/leftIdle/leftIdle1.png`,
            `${basePath}/idle_anim_frames/leftIdle/leftIdle2.png`,
            `${basePath}/idle_anim_frames/leftIdle/leftIdle3.png`,
            `${basePath}/idle_anim_frames/leftIdle/leftIdle4.png`,
            `${basePath}/idle_anim_frames/leftIdle/leftIdle5.png`,
            `${basePath}/idle_anim_frames/leftIdle/leftIdle6.png`,
          ]),
          right: loadFrames([
            `${basePath}/idle_anim_frames/rightIdle/rightIdle1.png`,
            `${basePath}/idle_anim_frames/rightIdle/rightIdle2.png`,
            `${basePath}/idle_anim_frames/rightIdle/rightIdle3.png`,
            `${basePath}/idle_anim_frames/rightIdle/rightIdle4.png`,
            `${basePath}/idle_anim_frames/rightIdle/rightIdle5.png`,
            `${basePath}/idle_anim_frames/rightIdle/rightIdle6.png`,
          ])
        },
        runFrames: {
          down: loadFrames([
            `${basePath}/run_frames/downRun/downRun1.png`,
            `${basePath}/run_frames/downRun/downRun2.png`,
            `${basePath}/run_frames/downRun/downRun3.png`,
            `${basePath}/run_frames/downRun/downRun4.png`,
            `${basePath}/run_frames/downRun/downRun5.png`,
            `${basePath}/run_frames/downRun/downRun6.png`,
          ]),
          up: loadFrames([
            `${basePath}/run_frames/upRun/upRun1.png`,
            `${basePath}/run_frames/upRun/upRun2.png`,
            `${basePath}/run_frames/upRun/upRun3.png`,
            `${basePath}/run_frames/upRun/upRun4.png`,
            `${basePath}/run_frames/upRun/upRun5.png`,
            `${basePath}/run_frames/upRun/upRun6.png`,
          ]),
          left: loadFrames([
            `${basePath}/run_frames/leftRun/leftRun1.png`,
            `${basePath}/run_frames/leftRun/leftRun2.png`,
            `${basePath}/run_frames/leftRun/leftRun3.png`,
            `${basePath}/run_frames/leftRun/leftRun4.png`,
            `${basePath}/run_frames/leftRun/leftRun5.png`,
            `${basePath}/run_frames/leftRun/leftRun6.png`,
          ]),
          right: loadFrames([
            `${basePath}/run_frames/rightRun/rightRun1.png`,
            `${basePath}/run_frames/rightRun/rightRun2.png`,
            `${basePath}/run_frames/rightRun/rightRun3.png`,
            `${basePath}/run_frames/rightRun/rightRun4.png`,
            `${basePath}/run_frames/rightRun/rightRun5.png`,
            `${basePath}/run_frames/rightRun/rightRun6.png`,
          ])
        }
      };
    };

    // Load furniture
    const chair = new Image();
    chair.src = "/OfficeSprites/Furniture/Chair.png";

    const cubicle = new Image();
    cubicle.src = "/OfficeSprites/Furniture/Cubicle.png";

    const waterTank = new Image();
    waterTank.src = "/OfficeSprites/Furniture/WaterTank.png";

    const plant = new Image();
    plant.src = "/OfficeSprites/Furniture/Plant.png";

    const table = new Image();
    table.src = "/OfficeSprites/Furniture/Table.png";

    // Define office layout
    const furniture: Furniture[] = [
      // Cubicles
      { x: 150, y: 200, width: 250, height: 200, sprite: cubicle },
      { x: 400, y: 200, width: 250, height: 200, sprite: cubicle },
      { x: 650, y: 200, width: 250, height: 200, sprite: cubicle },
      
      // Tables
      { x: 200, y: 500, width: 150, height: 150, sprite: table },
      { x: 650, y: 500, width: 150, height: 150, sprite: table },
      
      // Chairs
      { x: 150, y: 450, width: 150, height: 96, sprite: chair },
      { x: 350, y: 450, width: 150, height: 96, sprite: chair },
      { x: 550, y: 450, width: 150, height: 96, sprite: chair },
      { x: 750, y: 450, width: 150, height: 96, sprite: chair },
      
      // Plants
      { x: 50, y: 200, width: 64, height: 64, sprite: plant },
      { x: 50, y: 500, width: 64, height: 64, sprite: plant },
      { x: 900, y: 200, width: 64, height: 64, sprite: plant },
      { x: 900, y: 500, width: 64, height: 64, sprite: plant },
      
      // Water tank
      { x: 900, y: 400, width: 64, height: 128, sprite: waterTank }
    ];

    let frameCounter = 0;
    let currentFrame = 0;

    function isPositionValid(x: number, y: number): boolean {
      // Create a temporary character to check collision
      const tempChar = {
        x,
        y,
        width: 64,
        height: 64
      };

      // Check collision with all furniture
      for (const item of furniture) {
        if (
          tempChar.x + tempChar.width > item.x &&
          tempChar.x < item.x + item.width &&
          tempChar.y + tempChar.height > item.y &&
          tempChar.y < item.y + item.height
        ) {
          return false;
        }
      }
      return true;
    }

    function getValidSpawnPosition(): { x: number, y: number } {
      if (!canvas) return { x: 0, y: 0 };
      
      let x, y;
      do {
        // Try positions along the bottom of the screen
        x = Math.random() * (canvas.width - 64);
        y = canvas.height - 100; // Spawn near the bottom
      } while (!isPositionValid(x, y));
      return { x, y };
    }

    // Initialize characters with their animations
    const characters: Character[] = [
      {
        ...getValidSpawnPosition(),
        dx: 1,
        dy: 0,
        ...loadCharacterAnimations(1),
        direction: "right",
        idleTimer: 0,
        isIdle: false
      },
      {
        ...getValidSpawnPosition(),
        dx: -1,
        dy: 0,
        ...loadCharacterAnimations(2),
        direction: "left",
        idleTimer: 0,
        isIdle: false
      },
      {
        ...getValidSpawnPosition(),
        dx: 1,
        dy: 0,
        ...loadCharacterAnimations(3),
        direction: "right",
        idleTimer: 0,
        isIdle: false
      },
      {
        ...getValidSpawnPosition(),
        dx: -1,
        dy: 0,
        ...loadCharacterAnimations(4),
        direction: "left",
        idleTimer: 0,
        isIdle: false
      }
    ];

    function checkCollision(character: Character, furniture: Furniture): boolean {
      // Add a small buffer around the character for better collision detection
      const buffer = 10;
      return (
        character.x + 64 - buffer > furniture.x &&
        character.x + buffer < furniture.x + furniture.width &&
        character.y + 64 - buffer > furniture.y &&
        character.y + buffer < furniture.y + furniture.height
      );
    }

    function updateCharacter(character: Character) {
      if (!canvas) return;
      
      // Handle idle state
      if (character.isIdle) {
        character.idleTimer--;
        if (character.idleTimer <= 0) {
          character.isIdle = false;
          // Randomly choose a new direction
          const directions = ["up", "down", "left", "right"] as const;
          const newDirection = directions[Math.floor(Math.random() * directions.length)];
          character.direction = newDirection;
          character.dx = newDirection === "left" ? -1 : newDirection === "right" ? 1 : 0;
          character.dy = newDirection === "up" ? -1 : newDirection === "down" ? 1 : 0;
        }
        return;
      }

      // Randomly decide to go idle
      if (Math.random() < 0.005) {
        character.isIdle = true;
        character.idleTimer = Math.floor(Math.random() * 100) + 50;
        character.dx = 0;
        character.dy = 0;
        return;
      }

      // Store current position
      const oldX = character.x;
      const oldY = character.y;

      // Update position
      character.x += character.dx;
      character.y += character.dy;

      // Check for collisions with furniture
      let hasCollision = false;
      for (const item of furniture) {
        if (checkCollision(character, item)) {
          hasCollision = true;
          break;
        }
      }

      // If collision detected, revert position and change direction
      if (hasCollision) {
        character.x = oldX;
        character.y = oldY;
        // Choose a new random direction
        const directions = ["up", "down", "left", "right"] as const;
        const newDirection = directions[Math.floor(Math.random() * directions.length)];
        character.direction = newDirection;
        character.dx = newDirection === "left" ? -1 : newDirection === "right" ? 1 : 0;
        character.dy = newDirection === "up" ? -1 : newDirection === "down" ? 1 : 0;
      }

      // Keep within bounds
      if (character.x < 0) {
        character.x = 0;
        character.dx = -character.dx;
        character.direction = character.dx > 0 ? "right" : "left";
      }
      if (character.x > canvas.width - 64) {
        character.x = canvas.width - 64;
        character.dx = -character.dx;
        character.direction = character.dx > 0 ? "right" : "left";
      }
      if (character.y < 0) {
        character.y = 0;
        character.dy = -character.dy;
        character.direction = character.dy > 0 ? "down" : "up";
      }
      if (character.y > canvas.height - 64) {
        character.y = canvas.height - 64;
        character.dy = -character.dy;
        character.direction = character.dy > 0 ? "down" : "up";
      }
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Draw furniture
      furniture.forEach(item => {
        ctx.drawImage(item.sprite, item.x, item.y, item.width, item.height);
      });

      // Update and draw each character
      characters.forEach(character => {
        updateCharacter(character);

        // Choose frame based on direction and movement
        let sprite: HTMLImageElement;
        if (character.isIdle || (character.dx === 0 && character.dy === 0)) {
          sprite = character.idleFrames[character.direction][currentFrame % character.idleFrames[character.direction].length];
        } else {
          sprite = character.runFrames[character.direction][currentFrame % character.runFrames[character.direction].length];
        }

        ctx.drawImage(sprite, character.x, character.y, 64, 64);
      });

      frameCounter++;
      if (frameCounter % 30 === 0) currentFrame++;

      requestAnimationFrame(draw);
    }

    // Wait for all images to load
    const images = [background, chair, cubicle, waterTank, plant, table];
    let loadedImages = 0;
    images.forEach(img => {
      img.onload = () => {
        loadedImages++;
        if (loadedImages === images.length) {
          draw();
        }
      };
    });
  }, []);

  return (
    <main className="w-screen h-screen flex items-center justify-center bg-black">
      <canvas ref={canvasRef} />
    </main>
  );
}
