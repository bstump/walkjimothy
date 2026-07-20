import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState, jump, stepGameState } from "./game.js";

test("jump starts the player upward", () => {
  const state = createInitialState(960, 460);
  const jumped = jump({ ...state, status: "running" });

  assert.equal(jumped.player.grounded, false);
  assert.equal(jumped.player.vy < 0, true);
});

test("running the game ends when a collision occurs", () => {
  const state = createInitialState(960, 460);
  const started = { ...state, status: "running", player: { ...state.player, y: state.groundY - 64 } };
  const collided = {
    ...started,
    obstacles: [{ x: 160, width: 54, height: 34, kind: "car" }],
  };

  const result = stepGameState(collided, 1 / 60);

  assert.equal(result.status, "gameover");
});
