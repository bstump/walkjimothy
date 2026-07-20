export function createInitialState(width, height) {
  const groundY = height - 72;
  return {
    width,
    height,
    groundY,
    speed: 8,
    gravity: 0.48,
    player: {
      x: 120,
      y: groundY - 64,
      width: 64,
      height: 64,
      vy: 0,
      grounded: true,
    },
    obstacles: [],
    score: 0,
    status: "ready",
    spawnTimer: 1.2,
    backgroundOffset: 0,
  };
}

export function startGame(state) {
  return {
    ...state,
    status: "running",
    score: 0,
    obstacles: [],
    backgroundOffset: 0,
    player: {
      ...state.player,
      y: state.groundY - state.player.height,
      vy: 0,
      grounded: true,
    },
  };
}

export function jump(state) {
  if (state.status !== "running" || !state.player.grounded) {
    return state;
  }

  return {
    ...state,
    player: {
      ...state.player,
      vy: -11.5,
      grounded: false,
    },
  };
}

function createObstacle(width, height) {
  const kind = Math.random() > 0.5 ? "car" : "cone";
  const obstacleWidth = kind === "car" ? 54 : 34;
  const obstacleHeight = kind === "car" ? 34 : 44;

  return {
    x: width + 40,
    width: obstacleWidth,
    height: obstacleHeight,
    kind,
  };
}

function intersects(player, obstacle, groundY) {
  const playerBox = {
    x: player.x,
    y: player.y,
    width: player.width,
    height: player.height,
  };
  const obstacleBox = {
    x: obstacle.x,
    y: groundY - obstacle.height,
    width: obstacle.width,
    height: obstacle.height,
  };

  return (
    playerBox.x + playerBox.width > obstacleBox.x &&
    playerBox.x < obstacleBox.x + obstacleBox.width &&
    playerBox.y + playerBox.height > obstacleBox.y &&
    playerBox.y < obstacleBox.y + obstacleBox.height
  );
}

export function stepGameState(state, dt = 1 / 60) {
  if (state.status !== "running") {
    return state;
  }

  const nextSpeed = 8 + Math.min(8, state.score / 250);
  const nextPlayer = { ...state.player };
  nextPlayer.vy += state.gravity * dt * 60;
  nextPlayer.y += nextPlayer.vy * dt * 60;

  if (nextPlayer.y >= state.groundY - nextPlayer.height) {
    nextPlayer.y = state.groundY - nextPlayer.height;
    nextPlayer.vy = 0;
    nextPlayer.grounded = true;
  } else {
    nextPlayer.grounded = false;
  }

  const nextObstacles = state.obstacles
    .map((obstacle) => ({
      ...obstacle,
      x: obstacle.x - nextSpeed * 1.15 * dt * 60,
    }))
    .filter((obstacle) => obstacle.x + obstacle.width > -20);

  let nextSpawnTimer = state.spawnTimer - dt;
  let nextObstacleList = nextObstacles;

  if (nextSpawnTimer <= 0) {
    nextObstacleList = [...nextObstacleList, createObstacle(state.width, state.height)];
    nextSpawnTimer = 1.35 - Math.min(0.65, state.score / 1000);
  }

  const collision = nextObstacleList.some((obstacle) => intersects(nextPlayer, obstacle, state.groundY));

  return {
    ...state,
    speed: nextSpeed,
    player: nextPlayer,
    obstacles: nextObstacleList,
    spawnTimer: Math.max(0, nextSpawnTimer),
    score: state.score + dt * 14,
    status: collision ? "gameover" : "running",
    backgroundOffset: (state.backgroundOffset + nextSpeed * dt * 60) % 240,
  };
}
