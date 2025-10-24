function setWorld(worldState) {
  console.log('World state:', worldState);

  // Load game state
  if (!window.gameState.load()) {
    console.log('No saved game state found');
  }

  function makeTile(type) {
    return [sprite("tile"), { type }];
  }

  const map = [
    addLevel(
      [
        "                 ",
        " cdddddddddddde  ",
        " 30000000000002  ",
        " 30000000000002  ",
        " 30000000000002  ",
        " 30030000008889  ",
        " 30030000024445  ",
        " 300a8888897777  ",
        " 30064444457777  ",
        " 30000000000000  ",
        " 30000000021111  ",
        " 3000000002      ",
        " 1111111111      ",
        "      b          ",
        "     b      b    ",
        " b             b ",
      ],
      {
        tileWidth: 16,
        tileHeight: 16,
        tiles: {
          0: () => makeTile("grass-m"),
          1: () => makeTile("grass-water"),
          2: () => makeTile("grass-r"),
          3: () => makeTile("grass-l"),
          4: () => makeTile("ground-m"),
          5: () => makeTile("ground-r"),
          6: () => makeTile("ground-l"),
          7: () => makeTile("sand-1"),
          8: () => makeTile("grass-mb"),
          9: () => makeTile("grass-br"),
          a: () => makeTile("grass-bl"),
          b: () => makeTile("rock-water"),
          c: () => makeTile("grass-tl"),
          d: () => makeTile("grass-tm"),
          e: () => makeTile("grass-tr"),
        },
      }
    ),
    addLevel(
      [
        "      12       ",
        "      34       ",
        " 000    00  12 ",
        " 00   00    34 ",
        " 0    0        ",
        "      0  0     ",
        "           5   ",
        "           6   ",
        "     5         ",
        "     6   0     ",
        "               ",
        "               ",
        "               ",
      ],
      {
        tileWidth: 16,
        tileHeight: 16,
        tiles: {
          0: () => makeTile(),
          1: () => makeTile("bigtree-pt1"),
          2: () => makeTile("bigtree-pt2"),
          3: () => makeTile("bigtree-pt3"),
          4: () => makeTile("bigtree-pt4"),
          5: () => makeTile("tree-t"),
          6: () => makeTile("tree-b"),
        },
      }
    ),
    addLevel(
      [
        " 00000000000000 ",
        "0     11       0",
        "0           11 0",
        "0           11 0",
        "0              0",
        "0   2          0",
        "0   2      3333 ",
        "0   2      0   0",
        "0   3333333    0",
        "0    0         0",
        "0          0000 ",
        "0          0    ",
        " 0000000000     ",
        "                ",
      ],
      {
        tileWidth: 16,
        tileHeight: 16,
        tiles: {
          0: () => [
            area({ shape: new Rect(vec2(0), 16, 16) }),
            body({ isStatic: true }),
          ],
          1: () => [
            area({
              shape: new Rect(vec2(0), 8, 8),
              offset: vec2(4, 4),
            }),
            body({ isStatic: true }),
          ],
          2: () => [
            area({ shape: new Rect(vec2(0), 2, 16) }),
            body({ isStatic: true }),
          ],
          3: () => [
            area({
              shape: new Rect(vec2(0), 16, 20),
              offset: vec2(0, -4),
            }),
            body({ isStatic: true }),
          ],
        },
      }
    ),
  ];

  for (const layer of map) {
    layer.use(scale(4));
    for (const tile of layer.children) {
      if (tile.type) {
        tile.play(tile.type);
      }
    }
  }

  // Dynamic culture drops loading
  let cultureDrops = [];
  let gameUI = null;

  // Function to get walkable positions
  function getWalkablePositions() {
    const positions = [];
    const { width, height, tileSize } = { width: 40, height: 30, tileSize: 16 };

    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        // Check if position is walkable (not water or blocked)
        const tileX = x * tileSize * 4; // Scale factor
        const tileY = y * tileSize * 4;

        // Simple walkability check - avoid edges and water
        if (x > 1 && x < width - 1 && y > 1 && y < height - 1) {
          positions.push({ x: tileX, y: tileY });
        }
      }
    }
    return positions;
  }

  // Function to spawn culture boxes dynamically
  function spawnCultureBoxes(drops) {
    const walkablePositions = getWalkablePositions();
    const usedPositions = new Set();

    drops.forEach((drop, index) => {
      // Find a random walkable position
      let attempts = 0;
      let position;

      do {
        position = walkablePositions[Math.floor(Math.random() * walkablePositions.length)];
        attempts++;
      } while (usedPositions.has(`${position.x},${position.y}`) && attempts < 50);

      if (position) {
        usedPositions.add(`${position.x},${position.y}`);

        const rarityColor = window.gameState.getRarityColor(drop.rarity);
        const box = add([
          rect(32, 32),
          color(Color.fromHex(rarityColor)),
          outline(4, Color.fromHex("#FFFFFF")),
          area(),
          body({ isStatic: true }),
          pos(position.x, position.y),
          scale(2),
          drop.id || `drop${index}`,
          {
            dropData: {
              ...drop,
              id: drop.id || `drop${index}`,
              x: position.x,
              y: position.y
            }
          },
        ]);

        // Add rarity indicator
        add([
          text(drop.rarity, { size: 12 }),
          pos(position.x + 8, position.y - 8),
          color(255, 255, 255),
          fixed(),
        ]);
      }
    });
  }

  // Load culture drops from API
  async function loadCultureDrops() {
    try {
      const difficulty = window.gameState.difficulty || 'medium';
      const response = await fetch(`/api/game/drops?difficulty=${difficulty}`);
      const data = await response.json();

      if (data.ok) {
        cultureDrops = data.data.map((drop, index) => ({
          ...drop,
          id: drop.id || `drop${index}`
        }));

        window.gameState.init(cultureDrops, difficulty);
        spawnCultureBoxes(cultureDrops);
        createGameUI();
        addCollisionHandlers();
      } else {
        throw new Error('Failed to load drops');
      }
    } catch (error) {
      console.error('Failed to load culture drops:', error);

      // Fallback to hardcoded drops
      cultureDrops = [
        { id: 'drop1', title: 'Hauz Khas Village', city: 'Delhi', country: 'India', rarity: 'R', points: 50 },
        { id: 'drop2', title: 'Marine Drive', city: 'Mumbai', country: 'India', rarity: 'U', points: 30 },
        { id: 'drop3', title: 'Lalbagh Gardens', city: 'Bangalore', country: 'India', rarity: 'C', points: 20 },
        { id: 'drop4', title: 'Red Fort', city: 'Delhi', country: 'India', rarity: 'SR', points: 80 },
      ];

      window.gameState.init(cultureDrops, 'medium');
      spawnCultureBoxes(cultureDrops);
      createGameUI();
      addCollisionHandlers();
    }
  }

  // Create game UI
  function createGameUI() {
    // Progress bar
    const progressBar = add([
      rect(300, 20),
      color(100, 100, 100),
      pos(20, 20),
      fixed(),
    ]);

    const progressFill = add([
      rect(0, 20),
      color(76, 175, 80),
      pos(20, 20),
      fixed(),
    ]);

    // Score display
    const scoreText = add([
      text("Score: 0", { size: 20 }),
      pos(20, 50),
      color(255, 255, 255),
      fixed(),
    ]);

    // Timer display
    const timerText = add([
      text("Time: 0:00", { size: 20 }),
      pos(20, 80),
      color(255, 255, 255),
      fixed(),
    ]);

    // Progress text
    const progressText = add([
      text("0/0", { size: 16 }),
      pos(20, 110),
      color(255, 255, 255),
      fixed(),
    ]);

    // Difficulty indicator
    const difficultyText = add([
      text(`Difficulty: ${window.gameState.difficulty.toUpperCase()}`, { size: 16 }),
      pos(20, 140),
      color(255, 193, 7),
      fixed(),
    ]);

    gameUI = {
      progressBar,
      progressFill,
      scoreText,
      timerText,
      progressText,
      difficultyText
    };
  }

  // Update UI
  function updateUI() {
    if (!gameUI) return;

    const progress = window.gameState.getProgress();
    const score = window.gameState.score;
    const time = window.gameState.getFormattedTime();
    const collected = window.gameState.collectedDrops.length;
    const total = window.gameState.drops.length;

    // Update progress bar
    gameUI.progressFill.width = (progress / 100) * 300;

    // Update text displays
    gameUI.scoreText.text = `Score: ${score}`;
    gameUI.timerText.text = `Time: ${time}`;
    gameUI.progressText.text = `${collected}/${total}`;
  }

  // Load drops
  loadCultureDrops();

  add([
    sprite("npc"),
    scale(4),
    pos(600, 700),
    area(),
    body({ isStatic: true }),
    "npc",
  ]);

  const player = add([
    sprite("player-down"),
    pos(500, 700),
    scale(4),
    area(),
    body(),
    {
      currentSprite: "player-down",
      speed: 300,
      isInDialogue: false,
    },
  ]);

  let tick = 0;
  onUpdate(() => {
    camPos(player.pos);
    tick++;
    if (
      (isKeyDown("down") || isKeyDown("up")) &&
      tick % 20 === 0 &&
      !player.isInDialogue
    ) {
      player.flipX = !player.flipX;
    }

    // Update UI every frame
    updateUI();
  });

  function setSprite(player, spriteName) {
    if (player.currentSprite !== spriteName) {
      player.use(sprite(spriteName));
      player.currentSprite = spriteName;
    }
  }

  onKeyDown("down", () => {
    if (player.isInDialogue) return;
    setSprite(player, "player-down");
    player.move(0, player.speed);
  });

  onKeyDown("up", () => {
    if (player.isInDialogue) return;
    setSprite(player, "player-up");
    player.move(0, -player.speed);
  });

  onKeyDown("left", () => {
    if (player.isInDialogue) return;
    player.flipX = false;
    if (player.curAnim() !== "walk") {
      setSprite(player, "player-side");
      player.play("walk");
    }
    player.move(-player.speed, 0);
  });

  onKeyDown("right", () => {
    if (player.isInDialogue) return;
    player.flipX = true;
    if (player.curAnim() !== "walk") {
      setSprite(player, "player-side");
      player.play("walk");
    }
    player.move(player.speed, 0);
  });

  onKeyRelease("left", () => {
    player.stop();
  });

  onKeyRelease("right", () => {
    player.stop();
  });

  if (!worldState) {
    worldState = {
      playerPos: player.pos,
      collectedDrops: [],
    };
  }

  player.pos = vec2(worldState.playerPos);
  for (const collected of worldState.collectedDrops) {
    const box = get(collected)[0];
    if (box) destroy(box);
  }

  player.onCollide("npc", () => {
    player.isInDialogue = true;
    const dialogueBoxFixedContainer = add([fixed()]);
    const dialogueBox = dialogueBoxFixedContainer.add([
      rect(1000, 200),
      outline(5),
      pos(150, 500),
      fixed(),
    ]);
    const content = dialogueBox.add([
      text("", {
        size: 42,
        width: 900,
        lineSpacing: 15,
      }),
      color(10, 10, 10),
      pos(40, 30),
      fixed(),
    ]);

    if (window.gameState.collectedDrops.length < window.gameState.drops.length) {
      content.text = "Find all the culture drop boxes! Each color represents different rarity!";
    } else {
      content.text = "You found them all! You're a true explorer!";
    }

    onUpdate(() => {
      if (isKeyDown("space")) {
        destroy(dialogueBox);
        player.isInDialogue = false;
      }
    });
  });

  // Enhanced collision handlers with game state
  function onCollideWithBox(dropId, player) {
    player.onCollide(dropId, (boxObj) => {
      if (window.gameState.collectedDrops.includes(dropId)) return;

      player.isInDialogue = true;
      const dialogueBoxFixedContainer = add([fixed()]);
      const dialogueBox = dialogueBoxFixedContainer.add([
        rect(1000, 350),
        outline(5),
        pos(150, 350),
        fixed(),
      ]);

      const drop = boxObj.dropData;
      const rarityName = window.gameState.getRarityName(drop.rarity);
      const rarityColor = window.gameState.getRarityColor(drop.rarity);

      const content = dialogueBox.add([
        text(`📍 ${drop.title}\n\n${drop.city}, ${drop.country}\n\nRarity: ${rarityName}\nPoints: ${drop.points}\n\n✅ Collected!\n\nPress SPACE to continue`, {
          size: 32,
          width: 900,
          lineSpacing: 12,
        }),
        color(10, 10, 10),
        pos(40, 30),
        fixed(),
      ]);

      onUpdate(() => {
        if (isKeyDown("space")) {
          destroy(dialogueBoxFixedContainer);
          player.isInDialogue = false;
          destroy(boxObj);

          // Update game state
          window.gameState.collectDrop(dropId);

          // Win condition
          if (window.gameState.gameComplete) {
            player.isInDialogue = true;
            const winBox = add([
              rect(1000, 300),
              outline(5),
              pos(150, 400),
              fixed(),
            ]);

            const finalScore = window.gameState.score;
            const finalTime = window.gameState.getFormattedTime();

            winBox.add([
              text(`🎉 GAME COMPLETE!\n\nFinal Score: ${finalScore}\nTime: ${finalTime}\nDifficulty: ${window.gameState.difficulty.toUpperCase()}\n\nPress R to restart or refresh to play again`, {
                size: 36,
                width: 900,
                lineSpacing: 15,
              }),
              color(10, 10, 10),
              pos(40, 30),
              fixed(),
            ]);

            // Add restart handler
            onKeyPress("r", () => {
              window.gameState.reset();
              go("world");
            });
          }
        }
      });
    });
  }

  // Add collision handlers for all drops (will be called after drops are loaded)
  function addCollisionHandlers() {
    cultureDrops.forEach(drop => {
      onCollideWithBox(drop.id, player);
    });
  }
}
