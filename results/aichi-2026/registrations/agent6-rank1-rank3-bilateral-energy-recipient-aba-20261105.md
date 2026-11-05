# Agent 6 frozen original rank1 vs rank3 Basic Energy recipient counterfactual registration

**5 November 2026, 15:33 UTC. Read-only discovery followed by a separate developmental A/B/A test; zero qualified games.**

## Observed native motivator, before treatment

[Agent2's already executed original 24-arm four-seed two-seat archive](https://github.com/FlareZ123/experiment-01/actions/runs/42039697740/artifacts/13420591771), independently downloaded ZIP SHA256 `fc32e629b3d1d796db58e1b08da2aec8bc6863edf066ddddd1a9fc6c7ef5ec0e`, contains eight rank1 original-reference treatment games in the bilateral paid-retreat panel. At *all eight terminal public boards* every surviving rank1 Benched Pokémon had **zero attached Energy cards**. Specifically rank3 seat0 seeds 3565472974 and 3792360798 each show rank1's Active Dialga-GX with **nine Basic Psychic Energy**, all rank1 Bench slots with zero Energy and **zero rank1 native AttackAction roots**. Those cases each have nine original rank1 PlayCardAction roots with named Psychic Energy, though the action skeleton omits target and does not independently certify each recipient. This is an exposure pattern, not proof of what would have happened under another policy.

The current canonical actor root `simulation/twinleaf/agent34-actor-only-root-policy.cjs` returns `attach-basic-energy` without slot in the default branch, and its native PlayCardAction constructor defaults that slot to Active. Its existing opt-in owner-public `energyRecipientFrontier:true` selects a Bench slot and has native matched evidence in [Agent48 four-arm rank11 result](../agent48-energy-recipient-paired-fourarm-20261021.md) and [Agent2 original rank11 16-pair result](../agent2-rank11-basic-energy-recipient-matched-development-20261102.md). Neither prior cohort establishes a rank1-versus-rank3 payoff.

## Frozen experiment

Re-use the **same original historical 4 seeds** `3565472974,130758722,3792360798,1654918696`, each with original rank3 in both physical seats, original rank1 fixed opponent 60, original first-player draw mechanics, native engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and identical available policy wrappers as Agent2's existing runner. These are **retrospectively selected reused seeds**, no fresh independent random cohort. Do not count as prospective competitive validation.

For each of the eight groups run `A=original actor policy`, `B=identical actor policy with owner-visible `energyRecipientFrontier:true` on **both seats**`, `A'=exact original replay`. Maintain the source's `sameTarget` prompt correction, canonical actor owner root, Special Energy root, Supporter discipline and native mandatory prompts for all arms. The original multi-Basic paid-retreat override remains **off** in all three arms. The single treatment difference must be the owner-public Basic recipient chooser.

## Evidence and success/failure semantics, frozen before native CI

- Retain all **24 attempted arms**, including errors, root caps, genuine terminal flags, actual full/source physical deal fingerprints, first seat, initial original 60 digests, root-ledger digests and terminal public zones. Validate all 8 full-deal/source-deal/repeated A' root-skeleton matches; never silently drop an arm.
- Compare every originally witnessed rank1 and rank3 Basic Energy PlayCardAction and final public Active/Bench Energy counts, plus each side's native printed AttackAction count and terminal Prizes where available. Separately indicate any actual physically settled new Bench attachment, not merely a proposed targeting action.
- Prioritize the **two original Dialga nine-Psychic zero-attack groups** as transparent adversarial opportunities, but report all eight groups with equal weight. A treatment with changed board but zero new settled attacks is an execution divergence, **not game-strength improvement**.
- Native root-ledger hashes omit PlayCardAction targets; equal hashes alone cannot imply identical physical outcomes. Confirm any asserted Energy destination from public-zone before/after deltas, preserving any ambiguous resets or KOs as unverified.
- A report may show native terminal changes and source attack deltas, but **0 competitively qualified games regardless of results**: two original ranks, only one cross-policy bot, incomplete paper card effects/time-limit, no fair opponent competence certification, missing Aichi ranks23/25/28, no selected final fixed60.

## Implementation boundary

Reuse the existing `agent2-fss-float-rank3-native.yml` manual CI build/compilation job under a default-false input, with no new workflow definition and no changes to upstream vendor or previous source 60s. Keep `runArm` default behavior byte-for-byte equivalent by adding only a default-off explicit trial flag; preserve its historical `run()` contract. Native full trace stays an Actions artifact, not a giant committed JSON file.

**Decision remains unresolved until actual Store-accepted paired replay.**
