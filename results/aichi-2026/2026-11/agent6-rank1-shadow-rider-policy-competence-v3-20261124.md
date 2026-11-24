# Rank-1 Shadow Rider opponent policy v3 — contract evidence and blocker repairs

**Status:** updated policy implementation; contract-validated, not independently competent and not native-game validated.

**Policy version:** `agent6-rank1-shadow-rider-opponent-v3`  
**Tested source revision:** `10b6643a323b950eb11a66f664f817100d700c12`  
**Policy blob:** `021ae42b392df08d56587a10091d1c83dbed7ef3`  
**Test blob:** `dd37d16326f40989e6441d5aa1d5fca9b3c80a7a`  
**Contract-only acceptance:** [run 45469819354](https://github.com/FlareZ123/experiment-01/actions/runs/45469819354) passed on exact source/test revision `10b6643a323b950eb11a66f664f817100d700c12`  
**Working branch:** `agent6/rank1-policy-v3-review-20261124`

This continues the earlier [rank-1 policy prototype](../../methodology/2026-11/agent6-rank1-shadow-rider-opponent-policy-prototype.md) and supersedes the initial v3 contract-only report. The published rank-1 60-card reference list is unchanged. No candidate deck, matchup result, or win-rate claim is produced by this work.

## Implemented repairs

### Quick Ball and Mysterious Treasure discard prompts

Quick Ball FST 237 now has a source- and phase-specific mandatory-payment branch. It requires the card-effect source, `effectName === 'Quick Ball'`, `CHOOSE_CARD_TO_DISCARD`, actor-owned hand metadata, exact 1-of-1 bounds, and a non-cancelable prompt. It ranks payment choices separately from the subsequent `CHOOSE_CARD_TO_HAND` deck search; the search remains governed by retrieval scoring.

The payment heuristic uses the fixed rank-1 list and visible hand multiplicities. It preserves singleton Shadow Rider V/VMAX, unique Pokémon and one-of utility cards, while preferring redundant search cards, stadiums, and duplicate Pokémon where available. If every legal payment is costly, it selects the least-bad legal card rather than abstaining from a mandatory prompt.

The Mysterious Treasure fallback also ranks all legal hand cards, including negative-score choices, rather than taking the first native choice. It protects the fixed-list singleton Pokémon (Trevenant & Dusknoir-GX, Latias ex, Dialga-GX, Girafarig, Mimikyu, Marshadow, Radiant Eternatus) and one-of Trainers / Items (including Carmine, Iono, Teammates, Raihan, Acerola, Guzma, Tulip, Quick Ball, Hisuian Heavy Ball, Battle Compressor, Field Blower, Night Stretcher, Unfair Stamp, Float Stone, Forest Seal Stone, and Dimension Valley). It uses visible hand multiplicities for multi-copy Shadow Rider V/VMAX, Clefairy, Tapu Lele-GX, Lillie's Determination, Mysterious Treasure, Fog Crystal, VS Seeker, and Sky Field. These remain explicit heuristics, not empirically fitted discard values.

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

The pinned actor-observation contract deliberately emits `abilitySuppressions[].suppressed: null` until the adapter can provide a source-attributed fact. Consequently, the live policy requires an explicit `suppressed === false` row and remains fail-closed when status is unknown; it no longer attempts to infer completeness from a hand-maintained list of public suppressors. Tests cover explicit active/inactive status, unknown status with and without visible public suppressors, and Stealthy Hood with active and disabled Tool effects. This is a remaining integration limitation, not a resolved live-game interaction.

### Field Blower

Field Blower is now considered when Underworld Door is available and either an effective lock Stadium or opponent-owned Tools with live Tool effects are present.

The prompt policy handles the two-mode SelectOption prompt using public target state:
- choose Stadium plus up to one Tool when a Path to the Peak / Silent Lab lock may be active;
- preserve our own beneficial Sky Field or Dimension Valley and choose the Tools-only mode when the opponent has a Tool, even if only one;
- otherwise choose up to two Tools only when no effective lock Stadium is present and at least two opponent Tools have live effects.

For the subsequent Pokémon prompt it selects only visible opponent Pokémon with Tools, never the actor's own Tool-bearing Pokémon. It prioritizes a live Garbotoxin source and a Dragon protected by Stealthy Hood over generic Tool targets. If Tool effects are disabled or no opponent target exists, it selects no target. If a later card prompt asks which attached Tool to discard, Stealthy Hood is preferred when a Dragon is protected by it.

These decisions are prompt-contract heuristics. The current evidence does not show a complete native Field Blower game sequence.

### Underworld Door cancel-only prompt

The rank-1 worker now accepts the pinned Underworld Door `AttachEnergyPrompt`'s native cancel-only choice when no Psychic Energy / Psychic Bench assignment exists and `allowCancel === true`. It still selects a scored legal assignment when one is present. A regression covers both physical actor seats; the host-side projection remains separately tested by Agent49.

### Pale Moon-GX and Energy Drive scoring

The rank-1 attack scorer now reflects the card-pool text for Trevenant & Dusknoir-GX: Pale Moon-GX always creates the delayed Knock Out at the end of the opponent's next turn; the extra-Psychic-Energy clause separately discards all Energy from the opponent's Active Pokémon. The extra condition recognizes Dimension Valley's Colorless-cost reduction, discounts the delayed-KO score for a visible retreat path and a weak hand-size escape-risk proxy, and keeps an immediate Night Watch knockout ahead of the delayed threat. Visible Float Stone and Air Balloon count as retreat outs only while Tool effects are live; suppressed Tools are ignored.

Tapu Lele-GX's Energy Drive now counts only Energy attached to both Active Pokémon and never applies Weakness / Resistance multipliers, matching the printed card text. Regression coverage deliberately adds Energy to both Benches and an Active Dragon target to catch the former overcount and weakness multiplier.

## Contract evidence

The latest exact-head contract-only run [45469819354](https://github.com/FlareZ123/experiment-01/actions/runs/45469819354) passed on source/test revision `10b6643a323b950eb11a66f664f817100d700c12`, with policy blob `021ae42b392df08d56587a10091d1c83dbed7ef3` and test blob `dd37d16326f40989e6441d5aa1d5fca9b3c80a7a`.

- The rank-1 policy regression file contains **110 test cases** and was included in the contract suite.
- The pure policy/prompt/worker/action-frontier contract step passed.
- The Docker policy-worker launcher contract, pinned-runtime preflight, worker isolation on both physical seats, and canary evidence steps passed.
- The exact-SHA contract-only acceptance receipt was written and preserved.
- `contract_only: true` skipped Twinleaf checkout/compilation, the native no-game witness, and every fixture/game mode. No native fixture/game was dispatched.

This establishes deterministic contract behavior for the tested inputs. It does not establish that the policy makes strong decisions in live Twinleaf games, nor that the observation projection supplies every field assumed by the synthetic prompt fixtures.

## Limitations and disposition

- No native game, paired fixture, Aichi matchup, or competitive sample was run.
- Fairy Zone's live Ability status remains unknown in the actor observation contract; the damage multiplier is therefore unavailable unless a future adapter can prove a source-attributed status.
- The Field Blower, discard, Pale Moon-GX escape-risk, and attack-score values are heuristics. Their values and target priorities have not been calibrated against gameplay outcomes.
- The Pale Moon retreat estimator only recognizes visible Float Stone / Air Balloon plus a conservative attached-Energy-card payment bound; other retreat-reducing Abilities, special-Energy payment edge cases, and hidden switch-card identities remain unmodeled.
- Underworld Door cancel-only behavior is contract-tested on synthetic prompts and still lacks a new native fixture confirmation.
- The Radiant Gate veto is a conservative public-state model; native behavior still requires pinned-engine tests when an authorized fixture is available.
- No matchup win rates, confidence intervals, or evidence of a 99.5% result exist.
- The fixed rank-1 reference list remains [the published benchmark list](../benchmark-shadow-rider.md).

The earlier independent review is [Agent2's adversarial v3 review](agent2-rank1-v3-adversarial-review-20261124.md). Independent review of the repaired policy and its exact source/test blobs is still required. Stage A remains retry-frozen and Stage B remains blocked; do not launch another fixture or infer matchup competence from this contract-only pass.

## Next work

1. Have Agent2 and Agent11 independently challenge the exact tested source/test blobs above, including Mysterious Treasure singleton payments, Field Blower own-Stadium preservation, Underworld Door cancel-only handling, Pale Moon-GX, and Energy Drive.
2. Resolve the actor-view Fairy Zone status gap with source-attributed evidence or explicitly keep the multiplier disabled.
3. Only after a separate owner/Critic authorization, validate the relevant prompt and lock cases through an already-authorized native fixture. Do not start a new game dispatch on this report alone.
