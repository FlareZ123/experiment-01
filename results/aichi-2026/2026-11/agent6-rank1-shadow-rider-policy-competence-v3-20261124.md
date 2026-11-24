# Rank-1 Shadow Rider opponent policy v3 — contract evidence and blocker repairs

**Status:** updated policy implementation; contract-validated, not independently competent and not native-game validated.

**Policy version:** `agent6-rank1-shadow-rider-opponent-v3`  
**Tested source revision:** `a5ba464b92092a033f015fcea79af8497b90151c`  
**Policy blob:** `0c8573581232a88a9c6b36d6040d622d0b3abe30`  
**Test blob:** `b39132ba87fca35c8238f3fe95e11fdbcb7cf61d`  
**Contract-only acceptance:** [run 45416861911](https://github.com/FlareZ123/experiment-01/actions/runs/45416861911) on the source commit and [run 45418790071](https://github.com/FlareZ123/experiment-01/actions/runs/45418790071) on the current-main-based review branch  
**Working branch:** `agent6/rank1-policy-v3-implementation-20261124`

This continues the earlier [rank-1 policy prototype](../../methodology/2026-11/agent6-rank1-shadow-rider-opponent-policy-prototype.md) and supersedes the initial v3 contract-only report. The published rank-1 60-card reference list is unchanged. No candidate deck, matchup result, or win-rate claim is produced by this work.

## Implemented repairs

### Quick Ball and Mysterious Treasure discard prompts

Quick Ball FST 237 now has a source- and phase-specific mandatory-payment branch. It requires the card-effect source, `effectName === 'Quick Ball'`, `CHOOSE_CARD_TO_DISCARD`, actor-owned hand metadata, exact 1-of-1 bounds, and a non-cancelable prompt. It ranks payment choices separately from the subsequent `CHOOSE_CARD_TO_HAND` deck search; the search remains governed by retrieval scoring.

The payment heuristic uses the fixed rank-1 list and visible hand multiplicities. It preserves singleton Shadow Rider V/VMAX, unique Pokémon and one-of utility cards, while preferring redundant search cards, stadiums, and duplicate Pokémon where available. If every legal payment is costly, it selects the least-bad legal card rather than abstaining from a mandatory prompt.

The Mysterious Treasure fallback also ranks all legal hand cards, including negative-score choices, rather than taking the first native choice. Singleton Shadow Rider V/VMAX are protected in that fallback. These are explicit heuristics, not empirically fitted discard values.

### Radiant Eternatus / Climactic Gate Ability locks

The Gate veto now uses public board state and the pinned actor-view Stadium/Tool epoch:

- Path to the Peak and Silent Lab are both recognized. A positive Stadium/Tool suppression epoch on either player disables both Stadium locks; absent or malformed epochs remain unknown and fail closed while either lock Stadium is present.
- Active Klefki with Mischievous Lock, Active Wobbuffet with Bide Barricade, and Active Iron Thorns ex with Initialization are checked on either side.
- Neutralizing Gas is checked only on the opponent's Active Pokémon, matching its opponent-only effect.
- Power of Alchemy is checked on any face-up board slot on either side.
- Garbotoxin is checked by Ability name on any face-up board slot and requires a Tool attached. This avoids relying on only one Garbodor printing; the Field Blower target heuristic also recognizes DRX 54, LTR 68, and BKP 57.

The suppression checks are conservative: an Ability with unknown suppression status is treated as potentially live for the Gate veto. The policy does not infer that an Ability lock is inactive merely because the actor view cannot prove its status.

### Dragon and Fairy Zone handling

The Clefairy search/play predicate now detects Dragon Pokémon across the opponent's Active and Bench. The attack-damage multiplier is narrower: it applies only when the current Active target is Dragon, Fairy Zone is explicitly known to be active, and Stealthy Hood does not protect that target while Tool effects are active.

The pinned actor-observation contract deliberately emits `abilitySuppressions[].suppressed: null` until the adapter can provide a source-attributed fact. Consequently, the live policy remains fail-closed and does **not** assume Fairy Zone is active from a printed Ability alone. Tests cover both explicit active/inactive status and unknown status, plus Stealthy Hood with active and disabled Tool effects. This is a remaining integration limitation, not a resolved live-game interaction.

### Field Blower

Field Blower is now considered when Underworld Door is available and either an effective lock Stadium or opponent-owned Tools with live Tool effects are present.

The prompt policy handles the two-mode SelectOption prompt using public target state:
- choose Stadium plus up to one Tool when a lock Stadium may be active, or Tool status is unknown/disabled;
- choose up to two Tools only when no effective lock Stadium is present and at least two opponent Tools have live effects.

For the subsequent Pokémon prompt it selects only visible opponent Pokémon with Tools, never the actor's own Tool-bearing Pokémon. It prioritizes a live Garbotoxin source and a Dragon protected by Stealthy Hood over generic Tool targets. If Tool effects are disabled or no opponent target exists, it selects no target. If a later card prompt asks which attached Tool to discard, Stealthy Hood is preferred when a Dragon is protected by it.

These decisions are prompt-contract heuristics. The current evidence does not show a complete native Field Blower game sequence.

## Contract evidence

Runs [45416861911](https://github.com/FlareZ123/experiment-01/actions/runs/45416861911) and [45418790071](https://github.com/FlareZ123/experiment-01/actions/runs/45418790071) both passed. The first ran on exact source revision `a5ba464b92092a033f015fcea79af8497b90151c`; the second ran on review-branch head `b5551c34bcf7ea86707223e8d574b32ac12edb52`, with the same policy and test blobs, after porting onto the latest main baseline.

- The rank-1 policy regression file contains **103 tests** and was included in the contract suite.
- The workflow's pure policy/prompt/worker/action-frontier contract step passed.
- The Docker policy-worker launcher contract and worker-isolation/canary steps passed.
- The contract-only receipt is designed to record `fixtureExecuted: false`; no native fixture/game was dispatched by this run.

This establishes deterministic contract behavior for the tested inputs. It does not establish that the policy makes strong decisions in live Twinleaf games, nor that the observation projection supplies every field assumed by the synthetic prompt fixtures.

## Limitations and disposition

- No native game, paired fixture, Aichi matchup, or competitive sample was run.
- Fairy Zone's live Ability status remains unknown in the actor observation contract; the damage multiplier is therefore unavailable unless a future adapter can prove a source-attributed status.
- The Field Blower and discard scores are heuristic. Their values and target priorities have not been calibrated against gameplay outcomes.
- The Radiant Gate veto is a conservative public-state model; native behavior still requires pinned-engine tests when an authorized fixture is available.
- No matchup win rates, confidence intervals, or evidence of a 99.5% result exist.
- The fixed rank-1 reference list remains [the published benchmark list](../benchmark-shadow-rider.md).

The earlier independent review is [Agent2's adversarial v3 review](agent2-rank1-v3-adversarial-review-20261124.md). Independent review of the repaired policy and its exact source/test blobs is still required. Stage A remains retry-frozen and Stage B remains blocked; do not launch another fixture or infer matchup competence from this contract-only pass.

## Next work

1. Have an independent reviewer challenge the updated Quick Ball, Ability-lock, Fairy Zone, and Field Blower branches against the exact source/test blobs above.
2. Resolve the actor-view Fairy Zone status gap with source-attributed evidence or explicitly keep the multiplier disabled.
3. Only after a separate owner/Critic authorization, validate the relevant prompt and lock cases through an already-authorized native fixture. Do not start a new game dispatch on this report alone.
