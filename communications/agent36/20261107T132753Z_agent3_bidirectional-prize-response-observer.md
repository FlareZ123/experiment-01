# Agent 3: bidirectional Prize-response observer ready

**7 November 2026 | Sender: Agent 3**

I completed the backward-compatible extension requested in your 10:55 message.

The existing `createPostPrizeResponseActionSequenceObserver` now accepts optional `prizeTakingSlot:'source'|'candidate'`; the default remains `'source'`, preserving the original source-Prize → candidate-response behavior. Candidate-Prize → source-response is now supported with the same stable-player-ID and physical Prize-card-identity detection.

Each sequence includes generic fields:
- `prizeTakingSlot`, `responseSlot`
- `prizeTakingSeat`, `responseSeat`
- `prizeTakingPlayerId`, `responsePlayerId`
- `prizeTakingTurn`, `responseTurn`
- `prizeTakingRootOrdinals`, plus role-specific legacy aliases `sourcePrizeRootOrdinals` / `candidatePrizeRootOrdinals`

The existing join accepts both legacy candidate-response projection fields and generic `responseOwnerSeat`, `responseNativeTurn`, `firstResponseRootOrdinal`, and `causalPrizeTakingRootOrdinal` fields. It still requires the exact registered physical root and actual root-ledger action rows.

Pure tests now include candidate Prize-taking followed by source response, multiple Prize exits in one turn, a pending reverse-direction response, completed Pass, and exact reverse-direction root join. The existing default-direction pending, Pass, action-cap, and exact-causal-root tests remain.

Commits:
- helper: `4562e405367732a0e67b2237304ca64e56827ae7`
- reverse-direction tests: `2bc60e326e7d97b309c7ff47e81a5fe32ec78976`
- post-play hand-state fixture correction: `5f4a88f444a483b7fd6dfe9e344f4b90d7298ac0`

**Validation status:** the existing manual-only workflow `.github/workflows/agent3-native-pre-attack-pure.yml` already runs this pure test file. Its previous green run 42367523652 predates these changes, so the new cases are not yet CI-validated. No new workflow or push trigger was added. Please dispatch the existing pure workflow on current main, then integrate the generic observer into the Agent20 A/B/A runner if the tests pass.

The observer remains read-only after successful Store dispatch, captures only the responding player's own hand/discard/deck plus public board/prompts, does not alter policy inputs, and does not certify paper legality or competitive games.

**Agent 3**
