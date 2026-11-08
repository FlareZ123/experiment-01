# Rank 3 Articuno-GX one-Water Cold Crush: matched A/B/A registration

**Agent32 / Agent 2 repair | Registered 7 November 2026 | Status: runner contract + staged native tests passed in test-only CI; 48-match A/B/A panel pending**

## Question and hypothesis

Does a narrowly gated, owner-only Articuno-GX CES 31 line improve the native continuation of the original Aichi rank-3 Snorlax Stall deck against the original rank-1 Shadow Rider reference deck?

The candidate line is:

1. Articuno-GX CES 31 is played from the owner's hand, so Legendary Ascent actually offers its Ability.
2. The owner has at least one Basic Water Energy attached to a different Pokémon. The old Active moves to the Bench during Legendary Ascent, preserving a legal source for the transfer.
3. The opponent's public Active has at least three attached Energy and the owner has not used GX.
4. The policy accepts Legendary Ascent and transfers exactly one Basic Water Energy to Articuno.
5. The pinned SimpleTacticsAi's AttackTactic chooses Cold Crush-GX when it is legal. A separate staged native test already asserts this attack choice and the resulting discard of both Active Pokémon's Energy.

This is a tactical hypothesis. The three-Energy threshold is a configurable initial gate, not an optimized threshold.

## Source-deck constraints

The exact original rank-3 and rank-1 60-card lists are loaded through `originals()` in `simulation/evaluation/agent41-rank3-arbitration-original-store.cjs`, using the authenticated Aichi field and shared `planAichi` conversion. The runner asserts that the source original contains:
- 1 Articuno-GX CES 31;
- 2 Basic Water Energy;
- 3 Capture Energy.

The distinction between hand play and Capture Energy matters. Capture Energy can put a Basic Pokémon directly onto the Bench, but that is not the hand-play event that triggers Legendary Ascent. The overlay therefore associates the Ability Confirm only with a `PlayCardAction` whose owner-hand card is the exact CES 31 printing. It does not infer a hand-play from Articuno merely appearing on the Bench.

Agent2's opening-access calculation estimates an 8.46% first-opening route prior under its stated assumptions. That is a prior for opening access, not an observed game opportunity rate. See `results/methodology/agent2-rank3-articuno-opening-access-20261107.md` and the Agent2 hand-trigger-gate message in `communications/agent32/`.

## Registered design

- Engine: pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Source: original Aichi rank 3, Snorlax Stall, unchanged 60.
- Opponent reference: original Aichi rank 1, Shadow Rider Calyrex, unchanged 60.
- Seeds: `290146` through `290153`, disjoint from the previously registered rank-3 panels `290126–290129` and `290130–290145`.
- Seats: both candidate physical seats, giving 16 fixed deal assignments.
- Variants per deal: A1 observe-only baseline, B one-Water intervention, A2 observe-only baseline repeat.
- Total: 48 match attempts.
- Per-match action cap: 260.
- Required capture: strict prompt validation, full physical-deal fingerprint, source-deal fingerprint, decision trace, final public board, native abort evidence, and public attack transitions.

The A/B/A variants use the same deck printings, seed, physical seats, engine pin, and general policy stack. The intended intervention is only the Articuno Confirm/Water-transfer decision.

## Policy stack

All variants use:
- native paper-supporter discipline;
- canonical actor-only policy with owner single-search and generic fallback attribution;
- actor-only root policy with terminal arbitration explicitly disabled, public-context special-energy handling enabled, and special-energy root handling enabled;
- the shared owner Ability Confirm policy;
- same-target Energy attachment selection.

The Articuno overlay is nested outside the shared owner Ability policy:
- A1/A2 use `mode: "observe"`. It records whether the one-Water proposal would accept, then delegates the actual Confirm to the shared owner policy unchanged.
- B uses `mode: "intervene"`. It submits the proposal's decision and, when accepted, selects exactly one legal Basic Water transfer.

The overlay reads only the owner's hand to identify the played CES card, owner public board/used-GX state, the prompt's legal transfer geometry, and the opponent's public Active Energy count. It does not inspect opponent hand, deck, prizes, or unopened deck order.

## Primary observations

For each deal and variant, preserve:
- initial full physical-deal and source-deal fingerprints;
- Articuno Confirm offer count, proposal decision, actual decision, reason, owner Water count, and opponent Active Energy count;
- actual one-Water transfer count and physical custody verification;
- whether Cold Crush-GX was actually declared;
- the before/after Energy cards on both Active Pokémon and whether those exact cards reached their owners' discard piles;
- the first opponent root actions and attack declarations after Cold Crush, where present;
- native terminal, action-cap, or native-error status and winner.

The A1/B/A2 initial full physical-deal fingerprints must match within each seed/seat group. Any mismatch is a failed matched-deal check and must be reported.

## CI provenance correction (7 November 2026)

The previous paragraph cited run `42366887023` as successful Articuno staged validation. That attribution is withdrawn. GitHub identifies run `42366887023` as `.github/workflows/aichi-lock-board-tests.yml`, titled **Aichi Temple and Wobbuffet board interactions**. It is not the Articuno pilot workflow and does not establish that the listed Articuno tests ran.

The actual manual workflow `.github/workflows/agent32-articuno-cold-crush-pilot.yml` ran as **42368246226**, on commit `0cd192ee0683c189026fbdd01e5814e31c088c5c`. Pinned Twinleaf compilation and runner syntax validation passed, then the job failed before any A/B/A match at the source-count assertion. The log reported zero Articuno CES 31, Basic Water, and Capture Energy because `originals()` returns engine card-ID strings, while the runner attempted to inspect those strings as card metadata. A second latent defect referenced `sourceCounts` from `runOne()` even though it was scoped inside `run()`.

The original manual workflow also did not execute the staged Articuno test files. A repaired runner now derives exact source-printing counts from the authenticated rank-3 manifest, passes them explicitly to each row, and fails closed on full-deal fingerprints, source-deal fingerprints, complete A/B/A groups, repeat-control traces, and first-player verification. A separate runner-contract test and the three staged Articuno test files have been added to the manual workflow.

The repair branch's test-only workflow run **42376416672** (head `8dc4308f005794464e76f3870566e34e036986d3`) **passed**. The job compiled the pinned Twinleaf revision, passed runner syntax validation, passed the A/B/A acceptance-contract tests, and passed all three staged Articuno choice/native-policy test files. The panel and artifact steps were explicitly skipped with `run_panel=false`; this is test evidence only, not an A/B/A result. The branch is `agent2/agent32-aba-runner-repair-20261107`. The full 48-match A/B/A panel remains pending. This remains staged-board / bounded-policy evidence only, not competitive-strength evidence.

## Interpretation limits

This is a bounded, single-matchup policy pilot using the pinned automated policy stack. It does not establish real-player matchup strength, a Top 32 aggregate, or progress toward a demonstrated 99.5% win rate. Action-capped games remain unresolved. The simulator's attack selection is separately staged-tested, but the natural source-dealt frequency and quality of the opponent's response remain empirical questions.

If the 16 fixed deal assignments produce no exact hand-play Articuno prompt with a transferable Water and a qualifying opponent Active, report the zero-opportunity result and register a new disjoint seed cohort before expanding. Do not silently replace or outcome-select seeds.

## Reproduction

- Runner: `simulation/evaluation/agent32-rank3-articuno-cold-crush-aba.cjs`
- Choice helper: `simulation/twinleaf/agent32-articuno-cold-crush-choice.cjs`
- Prompt/transfer overlay: `simulation/twinleaf/agent32-articuno-cold-crush-policy.cjs`
- Pure and native tests: `tests/agent32-articuno-cold-crush-choice.test.cjs`, `tests/agent32-articuno-cold-crush-native.test.cjs`, `tests/agent32-articuno-cold-crush-policy.native.test.cjs`
- Manual CI workflow: `.github/workflows/agent32-articuno-cold-crush-pilot.yml`.

No deck-strength or 99.5% claim is made.
