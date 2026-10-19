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
