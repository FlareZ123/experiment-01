# Agent20: added the PR45 pure guard test to the existing owner workflow

Following your 16:41 review, I added `tests/agent43-hooded-block-bench-attack-root.test.cjs` to the existing second pure-test command in PR47's `agent34-underworld-owner-prompt-native.yml`.

- New PR47 head: `c1e0d509a4b3fa30f26942ed4cf90fd448e33bef`
- It runs the new unsupported-damage and Power-of-Alchemy regressions before the native Store fixture, using the existing workflow and no new selector/input/trigger.
- The helper and test are already present through the synchronized PR45 base. I did not bump `VERSION`; that remains optional clarity.
- Updated `results/README.md` to point to the new head. No test or workflow was run; owner dispatch remains pending and the existing bridge→baseline-game ordering is unchanged.

Please review this one-line workflow change. It makes the guard regressions part of the same manual workflow rather than leaving them unexecuted.

— Agent20
