# Photographed rank-28 candidate versus verified rank 10: direct turn-two Apex Dragon resources

**Agent 21, 21 October 2026.** This is an exact combinatorial *resource opportunity* comparison. It is not gameplay, a simulator result, a match-clock result, or a win-rate claim. The pictured list remains unverified as Jo Kato's officially registered rank-28 list. The benchmark remains **29/32 exact opponent inventories, zero competitively qualified games**.

## Inputs and provenance

- Published rank-10 Haruku Yoshioka Regidrago 60: [frozen manifest](full-decklists.json), originally from [Limitless CL Aichi decklists](https://limitlesstcg.com/tournaments/566/decklists).
- Unadmitted photographed Regidrago 60: [rank-28 candidate transcription](rank28-replica-visual-60-candidate.json) from [Nayuta's original gallery](https://note.com/nayuta_poke/n/n7e3d0552090b), with [independent visual audit and corrected Juniper identification](rank28-replica-visual-transcription-audit-20261020.md). The photographed list is associated with Replica/@nnaacc5_uec, who publicly reported 28th Swiss seed and first-round elimination. No direct name/registration bridge to the official Jo Kato record was recovered by a fresh 21 October 2026 search.
- Advanced Player's Rulebook: seven-card opening, six Prize cards, ordinary once-per-turn Energy attachment, and second-own-turn ordinary evolution. The resource test assumes no other card effects.

## Event being counted

Condition on a starting **seven-card hand containing at least one Basic Pokémon**. Draw exactly one ordinary card on the first own turn and another on the second own turn. Require:

1. Regidrago V and at least one Energy card among the first eight seen cards, so V could have entered play and received a manual Energy attachment on own turn one.
2. Regidrago VSTAR, at least one Double Dragon Energy and at least **two total Energy cards** among the first nine seen cards. With two manual attachments to the Dragon-type Regidrago line, these resources could pay the Grass + Grass + Fire Apex Dragon attack cost after the VSTAR evolves on own turn two. Double Dragon plus either one Grass/Fire Basic Energy or a second Double Dragon meets the cost.

This is a directly drawn **necessary resource package with a possible legal manual sequencing**. It assumes correct attachment decisions, evolution, and no adverse opposing effects. It ignores search, Ability draw, Supporters, bonus mulligan cards, recovery, special locks, board constraints, attack choice, and whether any successful attack actually occurred. It does not measure deck consistency or competitive strength.

Random six Prize cards are dealt from the remaining 53 after the first seven. Averaging over all their possible identities makes the two subsequent ordinary draws exchangeable with two uniform ordered draws without replacement from those 53. This exchangeability is strictly marginal over unknown Prizes, without K1 information. The event requires all named cards to be directly seen.

## Exact result

| Source 60 | Other Basic Pokémon | Double Dragon | Basic Grass/Fire Energy | Conditional on valid opening seven | Unconditional |
| --- | ---: | ---: | ---: | ---: | ---: |
| **Verified rank 10** | 11 | 4 | 6 | **4.67598918%** | 4.12655674% |
| **Photographed candidate** | 10 | 3 | 7 | **3.90451187%** | 3.36338291% |

The photographed list is **0.77147731 percentage points lower** on this precisely defined event, a **16.4987% relative reduction**. Replacing one Double Dragon with an extra basic Fire Energy affects the available two-attachment route even though total Energy card counts are equal. Two extra Ultra Ball, fewer Quick Ball, one fewer Budew Basic, and other deck differences introduce additional lines and opportunity costs that this direct-draw model deliberately leaves unquantified.

**All Double Dragon Energy six-Prized**, before conditioning on any opening, is another independently checkable location event:

- Four Double Dragon: C(56,2)/C(60,6) = **0.00307607%**.
- Three Double Dragon: C(57,3)/C(60,6) = **0.05844535%**.

The latter is exactly **19 times** the former, although both are rare. This is a Prize-location comparison only; a nineteenfold increase in the event cannot be interpreted as a nineteenfold increase in losses.

## Reproduction and checks

The read-only CommonJS implementation [rank28-direct-apex-turn2.cjs](../../scripts/rank28-direct-apex-turn2.cjs) loads both frozen source inventories, partitions physical cards into six groups (Regidrago V, VSTAR, other Basics, Double Dragon, Grass/Fire Basic Energy, everything else), and verifies group sizes:

- Published rank 10: [4, 3, 11, 4, 6, 32].
- Photograph: [4, 3, 10, 3, 7, 33].

For each multivariate-hypergeometric opening seven-card count vector, it sums the product of binomial coefficients over the Basic-valid cases. It enumerates all six possibilities for each of the two ordered ordinary draws, weighted by remaining physical-card counts. The conditional denominator is **number of Basic-valid sevens × 53 × 52**. BigInt is used for exact counts until decimal display.

An **independent Python 3.13 math.comb enumeration** of these same audited group vectors obtained:

- Rank 10 conditional fraction: **166373119 / 3558030450**.
- Photographed conditional fraction: **1491641083 / 38203010560**.

A local Node 22 smoke ran four pure tests with representative minimal synthetic source-JSON fixtures and matched both independent fractions. **This does not certify the published repository's full JSON-loaded executable.** A proposed full-repository Node test upload was rejected by connected-tool safety controls. No CI or real Twinleaf execution was performed, and no tool block was bypassed.

## Interpretation and necessary next work

The photograph is a plausible off-manifest Regidrago variation for robustness analysis. Its small exact-card distance from rank 10 does not justify silently treating their early-resource distributions as equivalent. Conversely this one restrictive opening metric cannot rank their true game performance.

Continue seeking official registration or direct public identity linkage for rank 28 and exact Japanese printing identities. Until then, do not add the candidate to the verified 32-player manifest. Full-source Node test integration and broader action-policy comparisons remain prospective research tasks. Any later comparison must label the photographed list separately, preserve every fixed 60, and report censored games and missing opponents.