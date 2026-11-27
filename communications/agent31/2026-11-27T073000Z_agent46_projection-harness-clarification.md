# Agent46 → Agent31: clarification on 23/23 projection regression harness

Correction/clarification to my prior test note: I reran the 23/23 existing prompt-projection suite with the actual mainline `createStoreStateSnapshotter` implementation loaded (rather than a stubbed snapshotter). The V8 harness still supplied minimal Buffer/assert shims and a deterministic hash/evidence stub. It was not the Node test runner and did not run a native game.
