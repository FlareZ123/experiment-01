# Rank26: authenticated Quick Ball discard-cost alternative

**Agent 4, 19 October 2026. Predeclared before the first compiled execution.** A separate narrow decision-quality test on genuine source-root choices, not a benchmark game-win study.

## Observation

The prior [compiled owner Quick Ball search](rank26-quick-ball-attacker-choice-source.md) found one true source-first Quick Ball play on seed `2046029502`, physical source seat A. At action ordinal 19 the pinned generic bot selected the **singleton Dowsing Machine ACE SPEC** from its hand for the Quick Ball discard cost; its opening hand also held `Iono PAL`. At ordinal 20, the owner-deck search was legally changed from Bunnelby to Meloetta ex, which was then played. The variant still passed without attacking; the entire four-case development panel had zero opponent Prize decrease.

The new hypothesis is that the source first-turn policy can preserve Dowsing Machine by choosing a currently unplayable first-turn Iono as the Quick Ball discard cost. This **may** improve short-term resource retention, but it could remove later disruption, draw or utility. No general card-quality superiority is assumed. Quick Ball requires a discard and can search a Basic; the official first-player Supporter restriction and actual card references bound this diagnostic.

## Frozen study

Retain all four previously registered `20261105/pilot/rank26` seeds and seats: `2046029502/A`, `4158340325/A`, `2818295704/B`, `1839183531/A`. Both arms use printed original-source rank26 and rank6 60s, the same actual source first turn, action cap 120, strict Store prompt validation, original `rank26-autonomous-cologne-pump-propagation-v3` and `rank26-mail-scout-starter-agnostic-v2`, plus the now established owner-deck `rank26-owner-quick-ball-meloetta-v1` selection policy. Engine must be `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; verify seed from `deriveSlotSeeds`, first-player draw log, source 60 identity hashes and source profile.

The only additional variant behavior is [rank26-quick-ball-discard.cjs](../../simulation/twinleaf/rank26-quick-ball-discard.cjs). The source-only adapter arms on a **real selected Quick Ball root action**, then responds to its genuine owner-hand `ChooseCardsPrompt` before the deck search. If both Dowsing Machine and Iono are physically in the own hand, the prompt pool consists entirely of real owner-hand references, and the engine validator accepts exactly one Iono, choose Iono. Otherwise preserve the original bot choice. The unchanged owner-deck Meloetta search runs afterward. The policy does not inspect hidden cards or force a Quick Ball root action.

## Falsification and outcomes

- Require the previously witnessed `2046029502` source opportunity to execute one genuine Iono cost choice. If it fails or validator rejects the card, mark the program failed; do not search a replacement historical seed.
- Retain all four source cases. Count Quick Ball roots, validation-approved Iono costs and any no-op cases; record the entire firstturn source action trace, selected cost and attacker, actual subsequent card plays, opponent remaining Prizes, root attack declarations and incomplete delegated-attack visibility. Do not infer that missing root AttackAction establishes no printed attack effect without a fuller observer.
- Compare exact initial original-source deal identity, actual first-player order and same owner-prompt selection policy. Later game states can legitimately diverge after a different discard choice and corresponding fresh shuffle.
- This remains a **retrospectively selected development panel**, not an independent efficacy estimate. No timed match or competent source-rank6 opponent policy certification follows from a successful Iono discard.

Run the [four-deal source comparison](../../simulation/twinleaf/rank26-quick-ball-discard-source-pair.cjs) using manual-only existing [Damage Pump workflow](../../.github/workflows/aichi-damage-pump-fidelity.yml), input `rank26_quick_ball_discard_probe`. Pure safety tests are in [rank26-quick-ball-discard.test.cjs](../../tests/rank26-quick-ball-discard.test.cjs). Archive the full JSON named `rank26-quick-ball-discard-development-unqualified`.

No decklist changes. Project still has 29/32 verified exact opposing 60s, zero competitively qualified games and no target-qualified 99.5% nominee.


## Compiled outcome: Iono cost achieved, followed by immediate ACE SPEC consumption

**Manual CI [39207882769](https://github.com/FlareZ123/experiment-01/actions/runs/39207882769) succeeded** with pinned compiled Twinleaf. All registered four source-dealt, source-first cases passed the original seed, actual first-draw, 60-card hash, policy-version, own-hand prompt and real Store transition assertions. Complete full JSON: [artifact 12166472876](https://github.com/FlareZ123/experiment-01/actions/runs/39207882769/artifacts/12166472876), `rank26-quick-ball-discard-development-unqualified`. It was independently parsed as a four-case record.

On the sole seed with a firstturn Quick Ball, `2046029502/A`, the source bot's Quick Ball discard prompt **17** and root action ordinal **19** selected `Dowsing Machine PLS` under control and `Iono PAL` with the new real-hand-validated source policy. Both arms selected `Meloetta ex SV11B` through the **same** actual owner-deck search prompt **18** at root ordinal **20**, then played Meloetta onto the board at ordinal **24**. This isolates the cost alternative before the two policies diverged.

The newly retained Dowsing Machine was **immediately consumed by the generic bot on the same first turn**, with an obviously questionable sequence that demonstrates why access and resource preservation do not by themselves confer successful tactics:

| Firstturn root ordinal | Original target policy | New Iono-cost policy |
| --- | --- | --- |
| 19 | Discard Dowsing Machine for Quick Ball | Discard Iono for Quick Ball |
| 20 | Search Meloetta ex | Search Meloetta ex |
| 24 | Put Meloetta ex in play | Put Meloetta ex in play |
| 25 | Play Float Stone | Play Float Stone |
| 26 | Pass | **Play Dowsing Machine** |
| 27 | No further action | Discard **Bicycle + Order Pad** as cost |
| 28 | No further action | Retrieve the just-discarded **Iono** |
| 29 | No further action | Pass |

The policy did accomplish its **literal legal cost-selection test**, and the two source deck choices remained equal as predeclared. The full firstturn line nonetheless **spent the ACE SPEC anyway**, with two additional Trainer discards and no demonstrated added attacker readiness. The actual Float Stone recipient and any tactical merit of a later Iono are not established by this trace; comparisons of full game strength are inappropriate.

Across the four registered retrospective source cases: one genuine Quick Ball root, one legal Iono-cost substitution, three unchanged/no-op cases, **zero root attacks** and **zero firstturn opposing Prize decreases**. The three no-op cases' firstturn root traces were byte-for-byte identical across the arms. All four are historic development cases and contribute **zero** to the competitive win-rate denominator.

**Methodological conclusion:** A policy that protects a valuable resource at an upstream connector can be defeated by an immediately downstream generic bot choice. A meaningful objective would evaluate both the Quick Ball discard and the full sequence of Dowsing Machine activation, cost selection and recovery target, considering firstturn usability, real attacker conversion, and future opportunity cost. Do not declare card preservation or tactical improvement from the local discard change alone. Source rank26 firstturn attack and complete opponent response remain unresolved.
