// app/page.tsx
"use client";
import { useEffect, useRef } from "react";

// Define global constants for character dimensions
const CHARACTER_WIDTH = 64;
const CHARACTER_HEIGHT = 100;

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
  sittingCooldown: number;
}

// Add interface for desk occupancy tracking
interface DeskOccupancy {
  up: boolean[];
  down: boolean[];
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const deskOccupancy = useRef<DeskOccupancy>({
    up: [false, false, false],
    down: [false, false, false]
  });

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

    // Define sitting trigger borders for each desk
    const sittingTriggerBorders = {
      down: downDesk.map(desk => ({
        x: desk.x + 20, // Increased from 10 to 20
        y: desk.y - 40, // Increased from -30 to -40
        width: desk.width - 40, // Increased from -30 to -40
        height: desk.height + 30, // Increased from +20 to +30
        deskIndex: downDesk.indexOf(desk)
      })),
      up: upDesk.map(desk => ({
        x: desk.x + 35, // Increased from 25 to 35
        y: desk.y - 20, // Increased from -10 to -20
        width: desk.width - 70, // Increased from -60 to -70
        height: desk.height - 20, // Increased from -10 to -20
        deskIndex: upDesk.indexOf(desk)
      }))
    };

    // Add safe zones between desks
    const deskSafeZones = [
      // Safe zones between down desks
      { x: downDesk[0].x + downDesk[0].width, y: 0, width: 50, height: canvas.height },
      { x: downDesk[1].x + downDesk[1].width, y: 0, width: 50, height: canvas.height },
      // Safe zones between up desks
      { x: upDesk[0].x + upDesk[0].width, y: 0, width: 50, height: canvas.height },
      { x: upDesk[1].x + upDesk[1].width, y: 0, width: 50, height: canvas.height }
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
            `${basePath}/SittingChairUp/Character${characterNum}SittingChairUpFrame1.png`,
            `${basePath}/SittingChairUp/Character${characterNum}SittingChairUpFrame2.png`,
            
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

    function getValidSpawnPosition(currentCharacter: Character): { x: number, y: number } {
      if (!canvas) return { x: 0, y: 0 };
      
      const characterWidth = 64;
      const characterHeight = 100;

      // Define directions array
      const directions = [
        { x: 1, y: 0 },   // right
        { x: -1, y: 0 },  // left
        { x: 0, y: 1 },   // down
        { x: 0, y: -1 }   // up
      ];

      // Function to check if a position is valid
      const isValidPosition = (x: number, y: number) => {
        // Check canvas bounds
        if (
          x < 0 || 
          x > canvas.width - characterWidth ||
          y < 0 || 
          y > canvas.height - characterHeight
        ) {
          return false;
        }
        
        // Check collision areas
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
        
        // Check trigger boxes
        for (const border of [...sittingTriggerBorders.down, ...sittingTriggerBorders.up]) {
          if (
            x >= border.x &&
            x <= border.x + border.width &&
            y >= border.y &&
            y <= border.y + border.height
          ) {
            return false;
          }
        }

        // Check safe zones
        for (const zone of deskSafeZones) {
          if (
            x + characterWidth > zone.x &&
            x < zone.x + zone.width &&
            y + characterHeight > zone.y &&
            y < zone.y + zone.height
          ) {
            return true;
          }
        }
        
        return true;
      };
      
      // Try each direction with increasing distance until we find a valid position
      for (let distance = 150; distance <= 300; distance += 50) {
        for (const dir of directions) {
          const spawnX = currentCharacter.x + dir.x * distance;
          const spawnY = currentCharacter.y + dir.y * distance;
          
          if (isValidPosition(spawnX, spawnY)) {
            return { x: spawnX, y: spawnY };
          }
        }
      }
      
      // If no valid position found, try random positions in safe areas
      const safeAreas = [
        { x: 0, y: 0, width: canvas.width, height: canvas.height * 0.2 }, // Top area
        { x: 0, y: canvas.height * 0.8, width: canvas.width, height: canvas.height * 0.2 }, // Bottom area
        { x: 0, y: 0, width: canvas.width * 0.2, height: canvas.height }, // Left area
        { x: canvas.width * 0.8, y: 0, width: canvas.width * 0.2, height: canvas.height } // Right area
      ];
      
      for (const area of safeAreas) {
        for (let attempts = 0; attempts < 10; attempts++) {
          const spawnX = area.x + Math.random() * (area.width - characterWidth);
          const spawnY = area.y + Math.random() * (area.height - characterHeight);
          
          if (isValidPosition(spawnX, spawnY)) {
            return { x: spawnX, y: spawnY };
          }
        }
      }
      
      // If still no valid position found, return a default position
      return { x: canvas.width * 0.5, y: canvas.height * 0.5 };
    }

    // Initialize characters with their animations
    const characters: Character[] = [
      {
        ...getValidSpawnPosition({
          x: canvas.width * 0.5,
          y: canvas.height * 0.5,
          dx: 1,
          dy: 0,
          ...loadCharacterAnimations(1),
          direction: "right",
          idleTimer: 0,
          isIdle: false,
          isSitting: false,
          sittingTimer: 0,
          sittingDesk: null,
          sittingDeskIndex: null,
          sittingCooldown: 0
        }),
        dx: 1,
        dy: 0,
        ...loadCharacterAnimations(1),
        direction: "right",
        idleTimer: 0,
        isIdle: false,
        isSitting: false,
        sittingTimer: 0,
        sittingDesk: null,
        sittingDeskIndex: null,
        sittingCooldown: 0
      },
      {
        ...getValidSpawnPosition({
          x: canvas.width * 0.5,
          y: canvas.height * 0.5,
          dx: -1,
          dy: 0,
          ...loadCharacterAnimations(2),
          direction: "left",
          idleTimer: 0,
          isIdle: false,
          isSitting: false,
          sittingTimer: 0,
          sittingDesk: null,
          sittingDeskIndex: null,
          sittingCooldown: 0
        }),
        dx: -1,
        dy: 0,
        ...loadCharacterAnimations(2),
        direction: "left",
        idleTimer: 0,
        isIdle: false,
        isSitting: false,
        sittingTimer: 0,
        sittingDesk: null,
        sittingDeskIndex: null,
        sittingCooldown: 0
      },
      {
        ...getValidSpawnPosition({
          x: canvas.width * 0.5,
          y: canvas.height * 0.5,
          dx: 1,
          dy: 0,
          ...loadCharacterAnimations(3),
          direction: "right",
          idleTimer: 0,
          isIdle: false,
          isSitting: false,
          sittingTimer: 0,
          sittingDesk: null,
          sittingDeskIndex: null,
          sittingCooldown: 0
        }),
        dx: 1,
        dy: 0,
        ...loadCharacterAnimations(3),
        direction: "right",
        idleTimer: 0,
        isIdle: false,
        isSitting: false,
        sittingTimer: 0,
        sittingDesk: null,
        sittingDeskIndex: null,
        sittingCooldown: 0
      },
      {
        ...getValidSpawnPosition({
          x: canvas.width * 0.5,
          y: canvas.height * 0.5,
          dx: -1,
          dy: 0,
          ...loadCharacterAnimations(4),
          direction: "left",
          idleTimer: 0,
          isIdle: false,
          isSitting: false,
          sittingTimer: 0,
          sittingDesk: null,
          sittingDeskIndex: null,
          sittingCooldown: 0
        }),
        dx: -1,
        dy: 0,
        ...loadCharacterAnimations(4),
        direction: "left",
        idleTimer: 0,
        isIdle: false,
        isSitting: false,
        sittingTimer: 0,
        sittingDesk: null,
        sittingDeskIndex: null,
        sittingCooldown: 0
      }
    ];

    function updateCharacter(character: Character) {
      if (!canvas) return;
      
      // Handle sitting state
      if (character.isSitting) {
        character.sittingTimer--;
        if (character.sittingTimer <= 0) {
          // Mark desk as unoccupied when character leaves
          if (character.sittingDesk !== null && character.sittingDeskIndex !== null) {
            deskOccupancy.current[character.sittingDesk][character.sittingDeskIndex] = false;
          }
          character.isSitting = false;
          character.sittingDesk = null;
          character.sittingDeskIndex = null;
          character.sittingCooldown = 200; // Set cooldown period
          
          // Find a valid spawn position outside trigger boxes
          const newPos = getValidSpawnPosition(character);
          character.x = newPos.x;
          character.y = newPos.y;
          
          // Set movement direction based on spawn position
          const directions = ["up", "down", "left", "right"] as const;
          const newDirection = directions[Math.floor(Math.random() * directions.length)];
          character.direction = newDirection;
          character.dx = newDirection === "left" ? -1 : newDirection === "right" ? 1 : 0;
          character.dy = newDirection === "up" ? -1 : newDirection === "down" ? 1 : 0;
        }
        return;
      }

      // Decrease sitting cooldown if it's active
      if (character.sittingCooldown > 0) {
        character.sittingCooldown--;
        return;
      }

      // Check if character is near a desk
      const deskProximity = 50;
      const deskCooldownDistance = 150; // Minimum distance required to sit again

      const checkDeskProximity = (desk: { x: number, y: number, width: number, height: number }, type: "up" | "down") => {
        const characterCenterX = character.x + CHARACTER_WIDTH / 2;
        const characterCenterY = character.y + CHARACTER_HEIGHT / 2;
        
        // Find the corresponding trigger border
        const borders = sittingTriggerBorders[type];
        const border = borders.find(b => b.deskIndex === (type === "up" ? upDesk : downDesk).indexOf(desk));
        
        if (border) {
          // Check if character center is within the trigger border
          if (
            characterCenterX >= border.x &&
            characterCenterX <= border.x + border.width &&
            characterCenterY >= border.y &&
            characterCenterY <= border.y + border.height
          ) {
            // Check if desk is already occupied and character is not in cooldown
            const deskIndex = border.deskIndex;
            if (!deskOccupancy.current[type][deskIndex] && character.sittingCooldown === 0) {
              character.isSitting = true;
              character.sittingTimer = Math.floor(Math.random() * 100) + 50;
              character.sittingDesk = type;
              character.sittingDeskIndex = deskIndex;
              character.dx = 0;
              character.dy = 0;
              // Mark desk as occupied
              deskOccupancy.current[type][deskIndex] = true;
              return true;
            }
          }
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
            x + CHARACTER_WIDTH > area.x &&
            x < area.x + area.width &&
            y + CHARACTER_HEIGHT > area.y &&
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
      if (character.x > canvas.width - CHARACTER_WIDTH) {
        character.x = canvas.width - CHARACTER_WIDTH;
        character.dx = -character.dx;
        character.direction = "left";
      }
      if (character.y < 0) {
        character.y = 0;
        character.dy = -character.dy;
        character.direction = "down";
      }
      if (character.y > canvas.height - CHARACTER_HEIGHT) {
        character.y = canvas.height - CHARACTER_HEIGHT;
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
              width = 200;
              height = 200;
            } else {
              width = 200;
              height = 200;
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
