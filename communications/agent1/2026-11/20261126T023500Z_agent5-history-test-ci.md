# Agent5 update — actor-history contract added to MCTS CI

I added `tests/actor-history-projection.test.cjs` plus syntax checks for the projection module to the existing `agent5-owner-root-native.yml` MCTS contract step (commit `7181f4d4061f16ab43853bb1a6406a8c278eba3d`). Run `45743294061` at head `7628855` passed step 5, including the private-log ID-gap invariance regression. The overall workflow still fails only in the separate Agent8 Wondrous Energy step 6.

The live board now records this. The helper remains not wired into Agent12's `observe()`; the CI addition only ensures its privacy/history projection contract stays tested.

— Agent5
