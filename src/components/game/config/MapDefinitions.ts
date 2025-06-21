import { platform } from "os";
import { MonsterType } from "../../types/Game";

export interface MapPlatform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MapBomb {
  x: number;
  y: number;
  order: number; // 1-24, the correct collection order
  group: number; // Group identifier (1-6, with 4 bombs per group)
}

export interface MapMonster {
  x: number;
  y: number;
  type: MonsterType;
  patrolStartX?: number;
  patrolEndX?: number;
  speed?: number;
}

export interface MapDefinition {
  id: string;
  name: string;
  width: number;
  height: number;
  playerStartX: number;
  playerStartY: number;
  platforms: MapPlatform[];
  bombs: MapBomb[];
  monsters: MapMonster[];
  backgroundColor: string;
  theme: string;
  groupSequence: number[]; // The order in which groups must be completed
}

// Map 1: Basic Training Ground - Grouped bomb placement
export const map1: MapDefinition = {
  id: "training",
  name: "Training Ground",
  width: 800,
  height: 600,
  playerStartX: 50,
  playerStartY: 450,
  backgroundColor: "#1E293B",
  theme: "office",
  groupSequence: [1, 2, 3, 4, 5, 6], // Groups must be completed in order
  platforms: [
    // Solid ground platform (no holes)
    { x: 0, y: 550, width: 800, height: 50 },
    // Progressive platforms from left to right, bottom to top
    { x: 150, y: 450, width: 120, height: 20 },
    { x: 350, y: 350, width: 120, height: 20 },
    { x: 550, y: 250, width: 120, height: 20 },
    { x: 100, y: 300, width: 100, height: 20 },
    { x: 600, y: 150, width: 100, height: 20 },
  ],
  bombs: [
    // Group 1: Bottom left area (1-4)
    { x: 50, y: 520, order: 1, group: 1 },
    { x: 90, y: 520, order: 2, group: 1 },
    { x: 130, y: 520, order: 3, group: 1 },
    { x: 170, y: 520, order: 4, group: 1 },

    // Group 2: Bottom right area (5-8)
    { x: 550, y: 520, order: 5, group: 2 },
    { x: 590, y: 520, order: 6, group: 2 },
    { x: 630, y: 520, order: 7, group: 2 },
    { x: 670, y: 520, order: 8, group: 2 },

    // Group 3: First platform cluster (9-12)
    { x: 160, y: 420, order: 9, group: 3 },
    { x: 190, y: 420, order: 10, group: 3 },
    { x: 220, y: 420, order: 11, group: 3 },
    { x: 250, y: 420, order: 12, group: 3 },

    // Group 4: Mid-level platforms cluster (13-16)
    { x: 360, y: 320, order: 13, group: 4 },
    { x: 390, y: 320, order: 14, group: 4 },
    { x: 420, y: 320, order: 15, group: 4 },
    { x: 450, y: 320, order: 16, group: 4 },

    // Group 5: Upper platform cluster (17-20)
    { x: 560, y: 220, order: 17, group: 5 },
    { x: 590, y: 220, order: 18, group: 5 },
    { x: 620, y: 220, order: 19, group: 5 },
    { x: 650, y: 220, order: 20, group: 5 },

    // Group 6: Top platform cluster (21-24)
    { x: 610, y: 120, order: 21, group: 6 },
    { x: 640, y: 120, order: 22, group: 6 },
    { x: 670, y: 120, order: 23, group: 6 },
    { x: 700, y: 120, order: 24, group: 6 },
  ],
  monsters: [
    // {
    //   x: 200,
    //   y: 400,
    //   type: MonsterType.REGULATOR,
    //   patrolStartX: 150,
    //   patrolEndX: 300,
    //   speed: 0.0001,
    // },
    {
      x: 500,
      y: 250,
      type: MonsterType.TAXMAN,
      patrolStartX: 400,
      patrolEndX: 600,
      speed: 0.01,
    },
    {
      x: 500,
      y: 250,
      type: MonsterType.BUREAUCRAT,
      patrolStartX: 400,
      patrolEndX: 600,
      speed: 1.5,
    },
  ],
};

// Map 2: Bureaucracy Maze - Grouped bomb placement
export const map2: MapDefinition = {
  id: "bureaucracy",
  name: "Bureaucracy Maze",
  width: 800,
  height: 600,
  playerStartX: 50,
  playerStartY: 450,
  backgroundColor: "#374151",
  theme: "government",
  groupSequence: [1, 2, 3, 4, 5, 6], // Groups must be completed in order
  platforms: [
    // Solid ground platform (no holes)
    { x: 0, y: 550, width: 800, height: 50 },
    // Structured maze-like platforms
    { x: 100, y: 450, width: 100, height: 20 },
    { x: 300, y: 400, width: 200, height: 20 },
    { x: 150, y: 350, width: 100, height: 20 },
    { x: 450, y: 300, width: 150, height: 20 },
    { x: 200, y: 250, width: 120, height: 20 },
    { x: 500, y: 200, width: 100, height: 20 },
    { x: 100, y: 150, width: 200, height: 20 },
  ],
  bombs: [
    // Group 1: Left ground area (1-4)
    { x: 75, y: 520, order: 1, group: 1 },
    { x: 105, y: 520, order: 2, group: 1 },
    { x: 135, y: 520, order: 3, group: 1 },
    { x: 165, y: 520, order: 4, group: 1 },

    // Group 2: Right ground and first platform (5-8)
    { x: 500, y: 520, order: 5, group: 2 },
    { x: 530, y: 520, order: 6, group: 2 },
    { x: 120, y: 420, order: 7, group: 2 },
    { x: 150, y: 420, order: 8, group: 2 },

    // Group 3: Mid platform cluster (9-12)
    { x: 320, y: 370, order: 9, group: 3 },
    { x: 350, y: 370, order: 10, group: 3 },
    { x: 380, y: 370, order: 11, group: 3 },
    { x: 410, y: 370, order: 12, group: 3 },

    // Group 4: Left side vertical cluster (13-16)
    { x: 170, y: 320, order: 13, group: 4 },
    { x: 200, y: 320, order: 14, group: 4 },
    { x: 220, y: 220, order: 15, group: 4 },
    { x: 250, y: 220, order: 16, group: 4 },

    // Group 5: Right side platform cluster (17-20)
    { x: 470, y: 270, order: 17, group: 5 },
    { x: 500, y: 270, order: 18, group: 5 },
    { x: 530, y: 270, order: 19, group: 5 },
    { x: 520, y: 170, order: 20, group: 5 },

    // Group 6: Top area cluster (21-24)
    { x: 550, y: 170, order: 21, group: 6 },
    { x: 130, y: 120, order: 22, group: 6 },
    { x: 160, y: 120, order: 23, group: 6 },
    { x: 190, y: 120, order: 24, group: 6 },
  ],
  monsters: [
    {
      x: 200,
      y: 400,
      type: MonsterType.BUREAUCRAT,
      patrolStartX: 150,
      patrolEndX: 300,
      speed: 1,
    },
    {
      x: 500,
      y: 250,
      type: MonsterType.TAXMAN,
      patrolStartX: 400,
      patrolEndX: 600,
      speed: 1.5,
    },
  ],
};

// Map 3: Innovation Tower - Grouped bomb placement
export const map3: MapDefinition = {
  id: "tower",
  name: "Innovation Tower",
  width: 800,
  height: 600,
  playerStartX: 375,
  playerStartY: 520,
  backgroundColor: "#1F2937",
  theme: "tech",
  groupSequence: [1, 2, 3, 4, 5, 6], // Groups must be completed in order
  platforms: [
    // Solid ground platform (no holes)
    { x: 0, y: 550, width: 800, height: 50 },
    // Tower structure - wider at bottom, narrower at top
    { x: 300, y: 480, width: 200, height: 20 },
    { x: 250, y: 420, width: 300, height: 20 },
    { x: 200, y: 360, width: 400, height: 20 },
    { x: 150, y: 300, width: 500, height: 20 },
    { x: 100, y: 240, width: 600, height: 20 },
    { x: 50, y: 180, width: 700, height: 20 },
    { x: 350, y: 120, width: 100, height: 20 },
  ],
  bombs: [
    // Group 1: Ground level cluster left (1-4)
    { x: 100, y: 520, order: 1, group: 1 },
    { x: 130, y: 520, order: 2, group: 1 },
    { x: 160, y: 520, order: 3, group: 1 },
    { x: 190, y: 520, order: 4, group: 1 },

    // Group 2: Ground level cluster right (5-8)
    { x: 500, y: 520, order: 5, group: 2 },
    { x: 530, y: 520, order: 6, group: 2 },
    { x: 560, y: 520, order: 7, group: 2 },
    { x: 590, y: 520, order: 8, group: 2 },

    // Group 3: Level 1-2 cluster (9-12)
    { x: 320, y: 450, order: 9, group: 3 },
    { x: 350, y: 450, order: 10, group: 3 },
    { x: 380, y: 450, order: 11, group: 3 },
    { x: 410, y: 450, order: 12, group: 3 },

    // Group 4: Level 2-3 cluster (13-16)
    { x: 280, y: 390, order: 13, group: 4 },
    { x: 320, y: 390, order: 14, group: 4 },
    { x: 360, y: 390, order: 15, group: 4 },
    { x: 400, y: 390, order: 16, group: 4 },

    // Group 5: Level 3-4 cluster (17-20)
    { x: 250, y: 330, order: 17, group: 5 },
    { x: 300, y: 330, order: 18, group: 5 },
    { x: 350, y: 330, order: 19, group: 5 },
    { x: 400, y: 330, order: 20, group: 5 },

    // Group 6: Top levels cluster (21-24)
    { x: 200, y: 270, order: 21, group: 6 },
    { x: 400, y: 270, order: 22, group: 6 },
    { x: 370, y: 90, order: 23, group: 6 },
    { x: 400, y: 90, order: 24, group: 6 },
  ],
  monsters: [
    // {
    //   x: 300,
    //   y: 420,
    //   type: MonsterType.REGULATOR,
    //   patrolStartX: 250,
    //   patrolEndX: 550,
    //   speed: 0.8,
    // },
    {
      x: 150,
      y: 300,
      type: MonsterType.BUREAUCRAT,
      patrolStartX: 150,
      patrolEndX: 650,
      speed: 1.2,
    },
  ],
};

export const playgroundMap: MapDefinition = {
  id: "playground",
  name: "Playground",
  width: 800,
  height: 600,
  playerStartX: 375,
  playerStartY: 300,
  backgroundColor: "#1F2937",
  theme: "tech",
  groupSequence: [], // Groups must be completed in order
  platforms: [
    // Solid ground platform (no holes)
    { x: 0, y: 550, width: 800, height: 50 },

    // UPPER PLATFORMS
    { x: 110, y: 130, width: 200, height: 20 },
    { x: 430, y: 130, width: 200, height: 20 },

    // MIDDLE PLATFORM
    { x: 360, y: 350, width: 200, height: 20 },

    // LOWER PLATFORMS
    { x: 80, y: 400, width: 200, height: 20 },
    { x: 490, y: 450, width: 200, height: 20 },
  ],
  bombs: [
    { x: 400, y: 160, order: 1, group: 1 },
    { x: 460, y: 160, order: 2, group: 1 },
    { x: 510, y: 160, order: 3, group: 1 },
    { x: 570, y: 160, order: 4, group: 1 },

    // RIGHT VERTICAL PLATFORMS
    { x: 770, y: 200, order: 5, group: 2 },
    { x: 770, y: 260, order: 6, group: 2 },
    { x: 770, y: 310, order: 7, group: 2 },
    { x: 770, y: 370, order: 8, group: 2 },

    // LEFT VERTICAL PLATFORMS
    { x: 10, y: 200, order: 9, group: 3 },
    { x: 10, y: 260, order: 10, group: 3 },
    { x: 10, y: 310, order: 11, group: 3 },
    { x: 10, y: 370, order: 12, group: 3 },

    // SECOND LOWEST BOMBS
    { x: 610, y: 420, order: 16, group: 5 },
    { x: 550, y: 420, order: 17, group: 5 },
    { x: 490, y: 420, order: 18, group: 5 },

    // BOTTOM LEFT BOMBS
    { x: 220, y: 500, order: 19, group: 6 },
    { x: 160, y: 500, order: 20, group: 6 },
    { x: 100, y: 500, order: 21, group: 6 },

    // TOP LEFT BOMBS
    { x: 100, y: 20, order: 13, group: 4 },
    { x: 160, y: 20, order: 14, group: 4 },
    { x: 220, y: 20, order: 15, group: 4 },

    // TOP RIGHT BOMBS
    { x: 760, y: 20, order: 22, group: 7 },
    { x: 710, y: 20, order: 23, group: 7 },
    { x: 660, y: 20, order: 24, group: 7 },
  ],
  monsters: [
    // {
    //   x: 430,
    //   y: 100,
    //   type: MonsterType.BUREAUCRAT,
    //   patrolStartX: 430,
    //   patrolEndX: 630,
    //   speed: 1.5,
    // },
    // {
    //   x: 490,
    //   y: 420,
    //   type: MonsterType.BUREAUCRAT,
    //   patrolStartX: 490,
    //   patrolEndX: 690,
    //   speed: 1.5,
    // },
    {
      x: 490,
      y: 420,
      type: MonsterType.BUREAUCRAT_CLONE,
      patrolStartX: 490,
      patrolEndX: 690,
      speed: 1.5,
    },
  ],
};

export const mapDefinitions: MapDefinition[] = [
  map1,
  map2,
  map3,
  playgroundMap,
];
export const getMapById = (id: string): MapDefinition | undefined => {
  return mapDefinitions.find((map) => map.id === id);
};
