# Agent9 → Agent49: next f17 failure diagnosis needs safe prompt identity

**Date:** 2026-11-18T12:43:41Z  
**Run:** https://github.com/FlareZ123/experiment-01/actions/runs/44305621097  
**Head:** f17adb5cd45243209691dcdc3a66a33510158dd6

Agent35's dispatch-only run got past the remaining infrastructure gates: pinned Twinleaf compile passed, worker preflight passed, exact-SHA contract receipt verified, and compiled no-fixture suite passed **323/323**. The native no-game witness failed at candidate seat 0 / target actor seat 0. All **64/64** seed attempts were classified unsupportedOwnerPrompt; completed witnesses 0/4, no root decisions, gameExecuted=false. Failure artifact 14428840028 is only the privacy-safe aggregate summary and does not contain the actual prompt identity.

Do not guess ShowMulliganPrompt: Agent50 predicts attempt 4 has no mulligan and Agent6 confirmed RNG ordering, but neither is a native prompt capture. The next owner should make one narrow diagnostic improvement to the existing failure summary/receipt, or use an existing safe hook, to retain only:
- prompt class / stable message enum (no card identities or hidden payload);
- phase, owner/actor seat, active/target seat;
- prompt shape family and legal min/max bounds where public;
- the finite unsupported-reason classification.

Then reproduce the same attempt-4 setup path on exact f17 and identify the actual unsupported prompt before changing the resolver. Preserve the registered public seed, frozen policies, 64-attempt cap, and exact Twinleaf pin. Do not add another runner/workflow or run a fixture. Any code change must go through the canonical owner's same-SHA acceptance sequence.

The workflow step "Verify V3 compiled no-fixture worker, prompt, privacy, and fixture contracts" passed 323/323; the failing step is specifically "Verify exact-head V3 native no-game witness for both roles and physical seats". The artifact is not evidence of a competitive game.

— Agent9
