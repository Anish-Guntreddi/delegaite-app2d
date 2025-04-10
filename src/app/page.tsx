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
  sittingFrames: {
    up: HTMLImageElement[];
    down: HTMLImageElement[];
  };
  direction: "down" | "up" | "left" | "right";
  idleTimer: number;
  isIdle: boolean;
  isSitting: boolean;
  sittingTimer: number;
  sittingDesk: "up" | "down" | null;
  sittingDeskIndex: number | null;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    canvas.width = 1024;
    canvas.height = 768;

    // Define collision areas once
    const collisionAreas = [
      { x: canvas.width * 0.065, y: canvas.height * 0.004, width: canvas.width * 0.91, height: canvas.height * 0.12 },
      { x: canvas.width * 0.037, y: canvas.height * 0.37, width: canvas.width * 0.025, height: canvas.height * 0.26 },
      { x: canvas.width * 0.002, y: canvas.height * 0.37, width: canvas.width * 0.035, height: canvas.height * 0.3 },
      { x: canvas.width * 0.002, y: canvas.height * 0.003, width: canvas.width * 0.06, height: canvas.height * 0.24 },
      { x: canvas.width * 0.04, y: canvas.height * 0.61, width: canvas.width * 0.605, height: canvas.height * 0.12 },
      { x: canvas.width * 0.715, y: canvas.height * 0.61, width: canvas.width * 0.28, height: canvas.height * 0.12 },
      { x: canvas.width * 0.975, y: canvas.height * 0.005, width: canvas.width * 0.022, height: canvas.height * 0.99 },
      { x: canvas.width * 0, y: canvas.height * 0.61, width: canvas.width * 0.255, height: canvas.height * 0.39 },
      { x: canvas.width * 0.235, y: canvas.height * 0.98, width: canvas.width * 0.78, height: canvas.height * 0.02 }
    ];

    // Load background
    const background = new Image();
    background.src = "/OfficeSprites/Background/Office_Desig2.png";

    // Load desk
    const Downdesk = new Image();
    Downdesk.src = "/OfficeSprites/Furniture/DeskDown.png";

    const Updesk = new Image();
    Updesk.src = "/OfficeSprites/Furniture/DeskUp.png";

    // Define desk positions and sizes
    const downDesk = [
      { x: canvas.width * 0.15, y: canvas.height * 0.15, width: canvas.width * 0.2, height: canvas.height * 0.2 },
      { x: canvas.width * 0.45, y: canvas.height * 0.15, width: canvas.width * 0.2, height: canvas.height * 0.2 },
      { x: canvas.width * 0.75, y: canvas.height * 0.15, width: canvas.width * 0.2, height: canvas.height * 0.2 },
    ];

    const upDesk = [
      { x: canvas.width * 0.135 , y: canvas.height * 0.35, width: canvas.width * 0.23, height: canvas.height * 0.2 },
      { x: canvas.width * 0.45, y: canvas.height * 0.35, width: canvas.width * 0.22, height: canvas.height * 0.2 },
      { x: canvas.width * 0.75, y: canvas.height * 0.35, width: canvas.width * 0.22, height: canvas.height * 0.2 },
    ];

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
        },
        sittingFrames: {
          up: loadFrames([
            `${basePath}/SittingChairUp/Character${characterNum}SittingChairUp.png`
          ]),
          down: loadFrames([
            `${basePath}/SittingChairDown/Character${characterNum}SittingChairDownFrame1.png`,
            `${basePath}/SittingChairDown/Character${characterNum}SittingChairDownFrame2.png`
          ])
        }
      };
    };

    let frameCounter = 0;
    let currentFrame = 0;

    function getValidSpawnPosition(): { x: number, y: number } {
      if (!canvas) return { x: 0, y: 0 };
      
      const characterWidth = 64;
      const characterHeight = 100;

      // Function to check if a position is valid (not in collision areas)
      const isValidPosition = (x: number, y: number) => {
        for (const area of collisionAreas) {
          if (
            x + characterWidth > area.x &&
            x < area.x + area.width &&
            y + characterHeight > area.y &&
            y < area.y + area.height
          ) {
            return false;
          }
        }
        return true;
      };

      // Try to find a valid spawn position
      let attempts = 0;
      const maxAttempts = 100;
      
      while (attempts < maxAttempts) {
        // Define safe spawn regions (areas where characters are likely to spawn)
        const spawnRegions = [
          { x: canvas.width * 0.1, y: canvas.height * 0.2, width: canvas.width * 0.8, height: canvas.height * 0.3 }, // Upper middle
          { x: canvas.width * 0.1, y: canvas.height * 0.7, width: canvas.width * 0.8, height: canvas.height * 0.2 }  // Lower middle
        ];

        // Randomly select a spawn region
        const region = spawnRegions[Math.floor(Math.random() * spawnRegions.length)];
        
        // Generate random position within the selected region
        const x = region.x + Math.random() * (region.width - characterWidth);
        const y = region.y + Math.random() * (region.height - characterHeight);

        if (isValidPosition(x, y)) {
          return { x, y };
        }
        
        attempts++;
      }

      // If no valid position found after max attempts, return a default position
      return { x: canvas.width * 0.5, y: canvas.height * 0.5 };
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
        isIdle: false,
        isSitting: false,
        sittingTimer: 0,
        sittingDesk: null,
        sittingDeskIndex: null
      },
      {
        ...getValidSpawnPosition(),
        dx: -1,
        dy: 0,
        ...loadCharacterAnimations(2),
        direction: "left",
        idleTimer: 0,
        isIdle: false,
        isSitting: false,
        sittingTimer: 0,
        sittingDesk: null,
        sittingDeskIndex: null
      },
      {
        ...getValidSpawnPosition(),
        dx: 1,
        dy: 0,
        ...loadCharacterAnimations(3),
        direction: "right",
        idleTimer: 0,
        isIdle: false,
        isSitting: false,
        sittingTimer: 0,
        sittingDesk: null,
        sittingDeskIndex: null
      },
      {
        ...getValidSpawnPosition(),
        dx: -1,
        dy: 0,
        ...loadCharacterAnimations(4),
        direction: "left",
        idleTimer: 0,
        isIdle: false,
        isSitting: false,
        sittingTimer: 0,
        sittingDesk: null,
        sittingDeskIndex: null
      }
    ];

    function updateCharacter(character: Character) {
      if (!canvas) return;
      
      // Handle sitting state
      if (character.isSitting) {
        character.sittingTimer--;
        if (character.sittingTimer <= 0) {
          character.isSitting = false;
          character.sittingDesk = null;
          character.sittingDeskIndex = null;
          // Randomly choose a new direction
          const directions = ["up", "down", "left", "right"] as const;
          const newDirection = directions[Math.floor(Math.random() * directions.length)];
          character.direction = newDirection;
          character.dx = newDirection === "left" ? -1 : newDirection === "right" ? 1 : 0;
          character.dy = newDirection === "up" ? -1 : newDirection === "down" ? 1 : 0;
        }
        return;
      }

      // Check if character is near a desk
      const characterWidth = 64;
      const characterHeight = 100;
      const deskProximity = 50; // Distance threshold to trigger sitting

      const checkDeskProximity = (desk: { x: number, y: number, width: number, height: number }, type: "up" | "down") => {
        const deskCenterX = desk.x + desk.width / 2;
        const deskCenterY = desk.y + desk.height / 2;
        const characterCenterX = character.x + characterWidth / 2;
        const characterCenterY = character.y + characterHeight / 2;
        
        const distance = Math.sqrt(
          Math.pow(deskCenterX - characterCenterX, 2) + 
          Math.pow(deskCenterY - characterCenterY, 2)
        );

        if (distance < deskProximity) {
          character.isSitting = true;
          character.sittingTimer = Math.floor(Math.random() * 100) + 50; // Sit for 50-150 frames
          character.sittingDesk = type;
          character.sittingDeskIndex = downDesk.findIndex(d => d.x === desk.x && d.y === desk.y);
          character.dx = 0;
          character.dy = 0;
          return true;
        }
        return false;
      };

      // Check proximity to all desks
      for (const desk of downDesk) {
        if (checkDeskProximity(desk, "down")) return;
      }
      for (const desk of upDesk) {
        if (checkDeskProximity(desk, "up")) return;
      }

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

      // Check for collisions with collision areas
      const checkCollision = (x: number, y: number) => {
        for (const area of collisionAreas) {
          if (
            x + characterWidth > area.x &&
            x < area.x + area.width &&
            y + characterHeight > area.y &&
            y < area.y + area.height
          ) {
            return true;
          }
        }
        return false;
      };

      // Try to move character
      const newX = character.x + character.dx;
      const newY = character.y + character.dy;

      // Check if the new position would cause a collision
      if (checkCollision(newX, character.y)) {
        // Reverse horizontal direction and update animation
        character.dx = -character.dx;
        character.direction = character.dx > 0 ? "right" : "left";
      } else {
        character.x = newX;
      }

      if (checkCollision(character.x, newY)) {
        // Reverse vertical direction and update animation
        character.dy = -character.dy;
        character.direction = character.dy > 0 ? "down" : "up";
      } else {
        character.y = newY;
      }

      // Keep within canvas bounds
      if (character.x < 0) {
        character.x = 0;
        character.dx = -character.dx;
        character.direction = "right";
      }
      if (character.x > canvas.width - characterWidth) {
        character.x = canvas.width - characterWidth;
        character.dx = -character.dx;
        character.direction = "left";
      }
      if (character.y < 0) {
        character.y = 0;
        character.dy = -character.dy;
        character.direction = "down";
      }
      if (character.y > canvas.height - characterHeight) {
        character.y = canvas.height - characterHeight;
        character.dy = -character.dy;
        character.direction = "up";
      }
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Draw all desks that aren't being sat at
      downDesk.forEach((deskPos, index) => {
        const isDeskOccupied = characters.some(char => 
          char.isSitting && char.sittingDesk === "down" && char.sittingDeskIndex === index
        );
        if (!isDeskOccupied) {
          ctx.drawImage(Downdesk, deskPos.x, deskPos.y, deskPos.width, deskPos.height);
        }
      });

      upDesk.forEach((deskPos, index) => {
        const isDeskOccupied = characters.some(char => 
          char.isSitting && char.sittingDesk === "up" && char.sittingDeskIndex === index
        );
        if (!isDeskOccupied) {
          ctx.drawImage(Updesk, deskPos.x, deskPos.y, deskPos.width, deskPos.height);
        }
      });

  

      // Update and draw each character
      characters.forEach(character => {
        updateCharacter(character);

        // Choose frame based on direction and movement
        let sprite: HTMLImageElement;
        let width = 64;
        let height = 100;
        let x = character.x;
        let y = character.y;

        if (character.isSitting && character.sittingDesk !== null && character.sittingDeskIndex !== null) {
          // Use sitting animation based on desk type
          const frames = character.sittingFrames[character.sittingDesk];
          sprite = frames[currentFrame % frames.length];
          
          // Get the correct desk array based on type
          const deskArray = character.sittingDesk === "up" ? upDesk : downDesk;
          const desk = deskArray[character.sittingDeskIndex];
          
          if (desk) {
            // Adjust dimensions for sitting animations
            if (character.sittingDesk === "up") {
              width = 120;
              height = 150;
            } else {
              width = 100;
              height = 120;
            }
            
            // Center the sitting character on the desk
            const deskCenterX = desk.x + desk.width / 2;
            const deskCenterY = desk.y + desk.height / 2;
            x = deskCenterX - width / 2;
            y = deskCenterY - height / 2;
          }
        } else if (character.isIdle || (character.dx === 0 && character.dy === 0)) {
          sprite = character.idleFrames[character.direction][currentFrame % character.idleFrames[character.direction].length];
        } else {
          sprite = character.runFrames[character.direction][currentFrame % character.runFrames[character.direction].length];
        }

        ctx.drawImage(sprite, x, y, width, height);
      });

      frameCounter++;
      if (frameCounter % 30 === 0) currentFrame++;

      requestAnimationFrame(draw);
    }

    // Wait for all images to load
    const images = [background, Downdesk, Updesk];
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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <canvas ref={canvasRef} className="border border-gray-300" />
    </main>
  );
}
