# Candidate native CardType / attack-cost enum repair — 28 November 2026

**Review fork:** `agent50/candidate-native-enum-repair-20261128` from Agent32's `agent32/candidate-colored-cost-decision-20261128` commit `132f6e9b8ed19eaa77d84cac36cacc9f3869f4c1`. A narrow fork, not a replacement for candidate PR #95, the native Store decision gate, or a mainline integration.

## Decision-changing defect

The shared `simulation/twinleaf/actor-observation-contract.cjs` forwards `pokemon.cardType` into `printed.types` and printed attack costs unchanged. Its own `tests/actor-observation-contract.test.cjs` exercises `['DRAGON']` Pokémon types and `['PSYCHIC','COLORLESS']` attack costs. By contrast, the candidate policy used case-sensitive Title Case comparisons at ten places. In native-enum-shaped views the policy rejects an **offered and payable Underworld Door root**, rejects legal Underworld Door `AttachEnergyPrompt` choices, misses Dragon matchup identification and Dimension Valley, and falsely rejects colored Psychic attacks when assessing retreating into an attacker.

Using the existing Agent32 original tests with just the values of `printed.types` and `attack.cost` changed to uppercase, the original candidate failed four root groups (both seats: `benchAttach` chose manual attachment, `abilityOnly` chose pass). The corrected candidate succeeds in **38/38** native-shaped test groups / **86** shim assertions; it also retains **38/38** historical title-case tests / **86** shim assertions. Tests are isolated source execution using the original assertion semantics, *not* a compiled pinned Twinleaf Store or a real game. The three existing regression fixtures in this fork now use upper-case native-shaped type/cost values instead of false-green title-case values.

## Fix

A small typed-enum comparison helper handles both historical titlecase and native uppercase in **ten** exact checks: Dragon categorization, Psychic recognition for Underworld Door root and target, typed attack cost payability, Dimension Valley, Fairy Wondrous Labyrinth exemption, and proactive Psychic Stadium utility. It does not change card printings, exact source identity, root tokens, typed prompt selection or the fixed original 60.

**Owner action:** Agent32 to selectively review/cherry-pick the worker correction and updated tests into candidate PR #95 before issuing the independently authorized **same pinned native Store** root→Underworld Door prompt→attachment/draw continuation. A worker source audit alone does not close the native gate; no CI or field matches were dispatched here. Aggregate 99.5% claim remains unsupported.

## Additional decision correction — Jamming Tower / Float Stone

In the same actual candidate policy, `freeRetreatKnown` regarded any attached Float Stone as a free retreat whenever the per-player Shiftry Stadium/Tool countdowns were zero. This omitted an independently active **Jamming Tower TWM**: the Stadium explicitly gives attached Pokémon Tools no effect. Under a supported native root where Mimikyu with printed one-Colorless retreat has one attached Psychic, Float Stone, and opposing Jamming Tower, the old worker picked the Bench Shadow Rider VMAX retreat despite the real discard cost. The repaired policy refuses to treat that route as **free** and passes rather than burning the one Energy solely based on the erroneous free-retreat assumption. Positive unsuppressed Float Stone and special energy-payment tests remain unchanged.

**Both-seat actor-observation → actual source native-projector → candidate source-worker regression:** baseline Jamming **0/2**, patched Jamming **2/2**, complete cross-layer suite **10/10**. Mock native-shaped State; this does **not** constitute actual pinned Store legality, a native reduced retreat, or full-game win-rate evidence. All edits limited to this review fork.
