# Agent 1 — New Moon v3g Gladion Prize rescue is a matchup-specific structural option, not a free consistency win

**28 Nov 2026.** Mathematical counterfactual, not a game result or final deck nomination.

## Exact proposed 60 and purpose

The executable [New Moon Dusknoir v3 60](../../als/new-moon-dusknoir-shadow-bind-v3-60.json) has only **one Dusknoir SFA 20**, whose Stage-2 **Shadow Bind** is the clean 150-damage path through active Hooded BUS Vileplume Basic-attack lock without giving up a Prize. Its worst hard failure is a Prized Dusknoir: the Stage2 is unavailable regardless of how many search connectors are drawn.

A genuinely different resource trade is [the separate v3g 60](../../als/new-moon-dusknoir-gladion-prize-rescue-v3g-60.json): **-1 Ace Trainer ROS69; +1 Gladion CIN95**, otherwise identical. Gladion can retrieve the chosen Prize card in exchange for replacing a normal Supporter turn. This attacks Stage2 Prize collapse directly, rather than making a cosmetic card swap or adding another searchable access node. Printing Gladion CIN95, from Sun & Moon Crimson Invasion 2017, lies in the paper Expanded era (Black & White onward); current banlist still needs verified tournament-appropriate signoff before playing.

## What the math demonstrates (conditional on a legal opening seven)

[Exact source](../../../scripts/2026-11/agent1-newmoon-gladion-prize-tradeoff.py) enumerates every disjoint 6-card Prize composition weighted by the number of legal initial seven-card hands with at least one of the decks' 17 Basics. It checks physical unprized card roles, not access, payment, evolution timing, item/suppression locks, or wins. A Prized Dusknoir is marked rescue-capable only if the singleton Gladion is unprized. This is an *optimistic resource gate*; the player still needs to obtain and legally play Gladion, spend the Supporter slot, and choose the right Prize card.

| Necessary physical resource condition | v3: 2 Ace, 0 Gladion | v3g: 1 Ace, 1 Gladion | Change |
| --- | ---: | ---: | ---: |
| Duskull + Dusclops + unprized/recoverable Dusknoir | 88.390935% | **97.472741%** | **+9.081807 pp** |
| Above + Mewtwo & Mew-GX + Trevenant & Dusknoir-GX donor | 78.751269% | **87.004444%** | **+8.253176 pp** |
| Above + at least 1 unprized Ace Trainer | 78.018866% | **78.018866%** | **0.000000 pp** |
| At least one unprized Ace Trainer | **99.144530%** | 89.952466% | **−9.192064 pp** |

**Critical interpretation:** Gladion substantially expands the physical *Stage2 lockbreak* availability but gives **no improvement** to the six-role complete Night Watch + Ace Trainer resource gate; it also cuts physical Ace availability by over nine points. If the current objective is a four-action same-turn *Cursed Blast → Ace → Night Watch* completion, the swap has no demonstrated net accessibility gain. It may only pay off in **rank-15 hard-lock-specific states** where saving a prize, Stage2 evolution and successful Shadow Bind matters more than a second Ace.

## Real play and actor-policy requirements

- Before a search K0 state, do not assume the singleton is Prized. Even after searching, an owner-authenticated K1 deck inventory is not identical to certified Prize-card contents. A selector must use only correct owner-derived current knowledge, not opponent hidden information or arbitrary guessed indices.
- A Stage2 rescue through Gladion requires **a free Supporter turn**, an accessible Gladion, an owner-visible *exact* Prize choice, and actual Dusclops evolution timing plus three Psychic-compatible attack energy. Stoutland Supporter lock can prevent the rescue, exactly where the hard-lock player may need it.
- The other Ace copy can be Prized or consumed, and replacing Ace changes hand-compression/turn sequencing even if the Stage2 becomes physically available.
- To decide which fixed 60 is stronger, compare v3 and v3g under the same BUS/Hood + Supporter-lock opponent responses, actual policy, and legally offered actor prompts. Do not treat a physical Prize gate as a simulation win rate.

## Actor-policy implementation now exists

This is no longer just the preceding probability counterfactual. The distinct v3g candidate policy at [`simulation/evaluation/2026-11/agent1-newmoon-v3g-gladion-policy.cjs`](../../../simulation/evaluation/2026-11/agent1-newmoon-v3g-gladion-policy.cjs) attempts Gladion **only** when:

1. A currently valid exact owner K1 deck-membership snapshot plus **a complete accounting of all 60 physical cards** (remaining deck, own hand, own discard/Lost Zone, in-play Pokémon/evolutions/Tools/Energies/Stadium, and six-to-zero remaining Prizes) proves the unique Stage2 Dusknoir cannot be in any non-Prize zone. Unknown or incomplete custody fails closed; a generic K1 flag is not used as equivalent to certified Prize contents.
2. At least a Duskull or Dusclops is already established to receive the Stage2, a Supporter has not been played, no known Supporter prohibition applies, and the offered native PlayCard action is exactly Gladion from its *hand index*. If the host already offers a paid, certified immediate KO attack, do not spend the Supporter on Gladion.
3. The resulting Gladion owner prompt **actually reveals Dusknoir SFA 20** as an individually selectable Prize card; an unknown face-down slot, wrong source, stale turn or opponent-hidden selection makes the policy abstain instead of guessing. The source recognizes either a `ChooseCardsPrompt` owner-Prizes card-selection shape or a `ChoosePrizePrompt` only with an exposed correct physical printing. This is conditional on the native host actually projecting those contents.

The policy reuses the existing v3 shared setup and attack policy when Gladion is not justified. A new three-module deterministic bundler [`build-agent1-newmoon-v3g-worker.cjs`](../../../simulation/evaluation/2026-11/build-agent1-newmoon-v3g-worker.cjs) produces the no-runtime-import [standalone worker](../../../simulation/evaluation/2026-11/agent1-newmoon-v3g-worker-standalone.cjs) compatible in principle with the production worker's disabled-`require` sandbox. Exact list identity SHA-256 over canonical sorted `id:count` rows is `1a5f094b06f79ff9168ca68c71fbb5f57db5352ecfe4877db48d6b93e51fcfc0`.

**Executed tests:** [40 synthetic physical-census/owner-prompt assertions](../../../tests/2026-11/agent1-newmoon-v3g-gladion-policy.test.cjs) pass in V8 on checked-in source and production-standalone bundle. [Two sequential root/Prize-prompt phases](../../../tests/2026-11/agent1-newmoon-v3g-protocol-contract.test.cjs) also passed `agent49-policy-protocol.cjs` init, complete observation, request, decision and audit validators. This establishes **actor protocol shape and decision safeguards only**. It is still not a pinned Twinleaf `Store`, not a legal Gladion native-effect reproduction, and not a qualified match.

## Native owner-only Prize projection and actual integration surface

The ordinary [agent36 prompt projector](../../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs) correctly marks hidden face-down Prize choices `isOwnerVisible:false` (and emits the native kind **`prize`**, not `prize-slot`). This is the right behavior for ordinary Prize prompts but **cannot implement Gladion**, whose printed text explicitly lets the player look at their own face-down Prizes. A v3g actor policy that expects a visible Prize printing would otherwise always abstain; attempting to read opponent Prize faces would be an information leak. This was a **real integration blocker**, not a math problem.

The research-side adapter [`agent1-gladion-owner-prize-projection.cjs`](../../../simulation/twinleaf/agent1-gladion-owner-prize-projection.cjs) now wraps the canonical projector with one narrowly authorized exception. It inspects the acting player's own Prize-card objects only after a provenance hook attests a *live Gladion card effect from that same player's Supporter zone*, correct player/prompt ownership, an actual one-card Prize selection, and no opponent Prize option. It handles `ChoosePrizePrompt` (native kind `prize`) and `ChooseCardsPrompt` (native kind `card`). Other sources delegate to the unchanged hiding projector. Unsupported prompt shapes throw a bounded failure rather than silently exposing hidden contents.

An [explicit opt-in projector factory](../../../simulation/twinleaf/agent1-newmoon-v3g-runtime-projection.cjs) only accepts the v3g policy version and preserves all strict projector functions except the single source-specific `projectPrompt` override. It can be supplied through the existing `createV3WorkerDecisionResolver({promptProjection: ...})` injection point; **no pinned Twinleaf or shared runner file was changed**. Tests: [33 owner-boundary assertions](../../../tests/2026-11/agent1-gladion-owner-prize-projection.test.cjs), [opt-in factory contract](../../../tests/2026-11/agent1-newmoon-v3g-runtime-projection.test.cjs), and a [single end-to-end source-attested sequence](../../../tests/2026-11/agent1-newmoon-v3g-native-gladion-reveal-chain.test.cjs) that selects **the actual Dusknoir in physical Prize slot 2**, validates the production actor decision/audit, and decodes the worker token back to the exact native Prize index while leaving opponent Prizes concealed.

The physical 60-card proof now uses the **actual top-inclusive** `evolutionPrintings: slot.cards.map(printing)` contract. A prior count that added the top Pokémon again would reject every legitimate Stack; that bug has been fixed, with a malformed-stack negative regression. The import-free v3g worker bundle was rebuilt accordingly.

**Limits that still matter:** the full live Native Store/Gladion effect has *not* been executed, so this is a native-shaped adapter/actor proof, not demonstrated game integration or matchup strength. Actual source provenance metadata and offered prompt shape still have to match an authorized pinned game. If not, the code fails closed and the full-field target remains unsupported.

## Recommendation

**Keep v3 unpromoted and v3g separate.** The direct actor-visible Gladion policy now exists, so the next decision gate is whether the native Gladion effect supplies a legal owner-visible Prize choice and whether Stage2 rescue really converts wins against the hard-lock field despite Supporter contention. Do **not** replace the leading fixed deck or treat either as qualified before those missing evaluations. No permission to run owner-gated native games or edit the main candidate freeze follows from this report.
