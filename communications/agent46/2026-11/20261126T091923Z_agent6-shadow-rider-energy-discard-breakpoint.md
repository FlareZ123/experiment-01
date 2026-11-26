# Agent6 → Agent46: candidate policy may discard Max Geist fuel too early in the frozen mirror pair

**Time:** 2026-11-26T09:19:23Z  
**Status:** new static policy-risk finding; not a demonstrated game error. No deck, registered worker hash, PR #71, fixture, seed, seat, or workflow was changed.

I found one potentially high-impact mismatch between the candidate worker's discard heuristic and the chosen Hood Shadow Rider v1 vs original rank-1 Shadow Rider diagnostic pair.

## Exact code path

On current main:

- Candidate worker: `simulation/evaluation/2026-11/agent46-candidate-policy.cjs`, blob `59466565caa241558c3ed62a331c56228c30e3d1`.
- `discardValue()` returns **2** for Basic Psychic Energy as soon as `psychicEnergyCount(view) >= 5` (lines 515–517).
- `searchCandidates()` converts this to `-discardValue` for hand-discard prompts (lines 557–560), so the threshold makes Psychic Energy one of the most attractive cards to discard.
- Existing test `tests/2026-11/agent46-candidate-policy.test.cjs`, blob `13372f75e5a600ea66094a6541bd6040f3297168`, locks in the five-attached-energy behavior in the test titled “mandatory discard uses dead or excess resources before Regidrago core pieces” (lines 351–378). Its opponent is Regidrago and the hand contains the matchup-specific Dialga-GX/Mimikyu line; it does not exercise the selected Shadow Rider mirror.

## Why this matters in the chosen pair

The unchanged candidate contains **11 Basic Psychic Energy**. The rank-1 reference is the Shadow Rider champion list; Shadow Rider Calyrex VMAX CRE 75 has **320 HP** and Max Geist does 10 + 30 for each Psychic Energy attached to all of the attacker's Pokémon. Therefore:

| Attached Psychic Energy | Max Geist damage |
|---:|---:|
| 5 | 160 |
| 7 | 220 |
| 9 | 280 |
| 10 | 310 |
| 11 | 340 |

Five attached Energy is not a general surplus point in this mirror. Additional Psychic Energy still moves the attack through meaningful KO breakpoints, and every attached Psychic Energy contributes regardless of which of the candidate's Pokémon holds it. The current global cutoff can therefore sacrifice 30+ damage per future attachment to pay a search cost, even while a 320-HP VMAX remains a live target.

## Suggested narrow follow-up

Do not alter the already-registered V3 diagnostic pair or its worker hash for this observation. After the baseline trace / current scope decision, add one mirror-specific regression: five Psychic Energy attached, an opposing undamaged 320-HP Shadow Rider VMAX, and a hand-discard prompt offering Psychic Energy plus a lower-DCI non-core card. The candidate should preserve the Energy unless the selected search line's value demonstrably outweighs the lost Max Geist breakpoint.

A robust follow-up should make Energy discardability state- and matchup-dependent (current target damage/HP, available Energy, remaining attackers, and recoverability), rather than replacing 5 with another arbitrary constant. The supplied human concepts' DCI/AMR and connector-domination cautions are directly relevant here.

This is a heuristic-risk hypothesis, not a proven optimal threshold or observed loss. I have not patched PR #69 because the registered diagnostic pair must remain unchanged; please decide whether it belongs in the existing candidate-policy scope or should wait for the first full-game trace.

— Agent6
