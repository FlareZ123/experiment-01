# Rank 29 Kohei Hamamichi Iron Thorns — actionable actor-only policy prototype

**Status:** Isolated review branch only. **Not on main; not merged, frozen, native-executed, independently judged, or competitively qualified.** No CI/fixture/game was dispatched. No change to the registered Aichi source, candidate 60s, Stage-A, V3 or natural64 plan.

## Decision this work enables

The exact original Aichi rank-29 source is published but the live policy panel had no rank-specific executable opponent policy. This work creates one concrete, source-bound decision worker so future candidate-vs-rank29 comparisons need not use a rank-generic bot. It is a **development prototype** and cannot yet be used as an admitted opponent.

- Code: [rank-29 opponent module](../../../simulation/evaluation/2026-11/agent4-rank29-iron-thorns-opponent-policy.cjs)
- Deterministic tests: [rank-29 source/prompt/root suite](../../../tests/2026-11/agent4-rank29-iron-thorns-opponent-policy.test.cjs)
- Exact source: [full-decklists.json](../full-decklists.json), rank 29; Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`
- Frozen engine target: Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`
- Shared worker protocol against which all 20 decisions were checked: `simulation/evaluation/2026-11/agent49-policy-protocol.cjs`, blob `d8349ae6f3537816b357b8309e9ab140ddec51eb`
- Rank 29 original 60: **4 Pokémon / 48 Trainers / 8 Energy**; sole Basic line: Iron Thorns ex TWM 77 ×4.

## Concrete implementation

Rank 29 shares 32 distinct card names with the exact rank-6 Iron Thorns list. The new module copies the standalone rank-6 actor-visible root-and-prompt implementation as an implementation base, leaving rank 6 unmodified, then adds rank-29 identity and action logic. The rank-29-only three names replace rank-6-only Gladion/Palace Book/Echoing Horn:

| Rank-29-only card | Root decision | Actor-owned continuation |
|---|---|---|
| **Field Blower GRI 125 ×1** | Plays to remove an opponent's Stealthy Hood, other Tool, or Stadium; Hood response receives higher priority than routine Energy denial | Chooses up to two targetable opponent Tools/Stadium, prioritizing Stealthy Hood; does not target own Tools |
| **Target Whistle PHF 106 ×1** | Plays only if opponent has an open Bench slot and a *visible known Basic from the registered candidate 60s* in discard; no false access for arbitrary discard entries | Selects a known Basic in the opponent's discard, preserving source-zone information when the destination is Bench |
| **Peonia CRE 149 ×1** | Explicitly avoids committing to a Prize exchange without a complete actor-only continuation | Abstains with production-approved `UNSUPPORTED_PRIZE_SELECTION` rather than guessing private Prize identities |

Additional rank-29 changes: **Palace Belt ×2** (up from one) receives a positive Active Iron Thorns setup score when no Tool is attached; **Trainers' Mail ×2, Enhanced Hammer ×1, Tropical Beach ×2** remain the rank-29 source counts. Existing common source actions (Energy denial, Guzma, Tag Call/Guzma & Hala, Lusamine/Handiwork, Thunder Mountain, tool-lock responses, Volt Cyclone) are retained. **VS Seeker ×3 was previously a dead root card in the copied policy**; this module adds its public-discard-dependent Item root and typed actor-owned Supporter retrieval prompt, distinguishing immediate Active Energy removal from lower-priority deck milling.

**Actual native setup choices are now implemented:** choose available Iron Thorns Basics in the engine's setup order, choose second when offered pre-deal GO_FIRST (a strategic hypothesis to enable Guzma & Hala on the first own turn), accept available post-mulligan Bench placements, and take the largest legal mulligan bonus-draw choice. Setup prompts are accepted only when their typed engine source and phase agree. The going-second decision is not empirically qualified.

## Decision checks, not game evidence

At branch code/test state on 27 Nov, **20/20 isolated V8 synchronous cases passed**. The harness executed the exact branch module, test callbacks and production protocol `validateRequest`/`validateDecision` semantics in a JavaScript V8 runtime. These were **not** `node --test` runs against an installed checkout or pinned Twinleaf native matches; therefore they are a narrow executable protocol/decision receipt, not an acceptance or policy-competence result.

The cases cover full source-list count and identity; two-seat role/version checks; Field Blower vs Plumeria with an opposing Hood; actor-owned target selection and spoofed-description negatives; Target Whistle with/without a genuine Basic or Bench space; Palace Belt with/without a competing Tool; explicit Peonia abstention; Crushing Hammer baseline; pre-deal GO_FIRST; first and bonus setup placements; mulligan bonus and bad-phase/source negatives; VS Seeker root, Item-lock refusal and actor-only discard choices. A discovered integration defect was corrected locally: the copied rank-6 implementation returned arbitrary rank-specific abstention labels, but the real worker rejects them as `BAD_ABSTENTION_CODE`; this module now uses the worker's approved codebook. No shared protocol modifications were made.

Recommended local exact-branch command for a reviewer with a repository checkout:

```sh
node --test tests/2026-11/agent4-rank29-iron-thorns-opponent-policy.test.cjs
```

## Explicit unsupported / next admission gate

The new module is **not** a policy competence claim. Peonia's physical Prize-for-hand exchange, Player's Ceremony end-turn draw, Handheld Fan's attachment movement, certain tool/field option prompts, and any untested native continuation remain unsupported or inherited limitations. The Typed native Engine/Worker split and actor-custody handling have not yet been exercised on this branch; no full game has completed. The intentional two-profile Target Whistle Basic recognizer must be widened or safely abstain if a different candidate becomes the fixed-60 contender. No opponent-side K1 facts, hidden contents, physical Prize slots or real-native game state were leaked into policy input.

**Next:** Independent review of this isolated branch, then a separately authorized local/contract qualification and exact pinned-native decision trace before considering merge or attaching a frozen identity to the rank-29 policy manifest. Preserve the source list unchanged and do not count this as a 30th qualified opponent, an extra game, or a demonstrated contribution to the 99.5% target.

The benchmark remains **29/32 authenticated exact original lists**, ranks **23, 25, 28** missing, **0/32 competitively qualified matchups**, no nominated fixed 60 and no demonstrated 99.5% win rate.