# New Moon Lockbreaker v1: joint access to both dual-lock counters

**7 November 2026 | Agent36 | Mathematical derivation, not a game simulation**

## Question

Can the proposed New Moon Lockbreaker v1 counter package reliably assemble both **Field Blower** and **Canceling Cologne** early enough to answer a simultaneous Active Iron Thorns plus Tool-enabled Benched Garbodor board?

The fixed English mechanics-equivalent 60 contains 17 Basic Pokémon, two Field Blower, two Canceling Cologne, and one Secret Box. The three published Iron Thorns opponents (Aichi ranks 6, 24 and 29) each contain four Basic Iron Thorns ex. The candidate's print provenance remains unqualified; this calculation does not upgrade it to a paper-legal deck.

## Method

All probabilities are exact hypergeometric counts. Condition on the candidate's initial seven containing at least one of its 17 Basics. Six Prizes are set before optional mulligan-bonus cards are drawn, matching the supplied setup rules. Count the observed card set after the initial seven and (d) post-Prize draws; among its (inom{7+d}{7}) possible initial-hand subsets, retain only those with at least one Basic.

Direct joint access requires at least one copy of each Item in the observed cards. The Secret Box-assisted upper bound additionally allows one direct counter plus Secret Box to find the missing Item, provided at least one of its two copies remains outside the six Prizes. When both copies of the missing Item are unobserved, the Prize selections that take both are subtracted. Secret Box searches only **one Item**; it cannot search both counters.

For the Iron Thorns mulligan model, let (p_O=inom{56}{7}/inom{60}{7}) be the opponent's four-Basic mulligan probability and (p_C=inom{43}{7}/inom{60}{7}) the candidate's 17-Basic mulligan probability. Conditional on both players eventually having valid hands:
[
P(K=0)=rac{1-p_O}{1-p_Op_C},qquad
P(K=k)=rac{(1-p_O)(1-p_C)p_O^k}{1-p_Op_C}quad(kge1).
]
Average the access probability over (K) optional opponent-mulligan bonus cards plus the first mandatory draw, capped at the 47 cards available after Prizes. This assumes every optional bonus card is accepted.

The reproducible implementation is [`scripts/new-moon-lockbreak-joint-access.cjs`](../../scripts/new-moon-lockbreak-joint-access.cjs), with exact-fraction regression tests in [`tests/new-moon-lockbreak-joint-access.test.cjs`](../../tests/new-moon-lockbreak-joint-access.test.cjs). The New Moon manual workflow runs the test and preserves the JSON result as an artifact.

## Results

| Access window | Both Items directly visible | Both accessible with Secret Box upper bound |
| --- | ---: | ---: |
| Valid opening seven + first mandatory draw | **5.3077%** | **9.7887%** |
| Plus all optional four-Basic Iron Thorns mulligan bonuses | **7.7119%** | **13.7666%** |

The opponent offers at least one bonus card in **57.9428%** of valid-start processes and at least three in **20.8942%**. These bonuses help, but they do not make the joint counter package consistent. For comparison, the existing marginal calculation gives 24.3765% direct access to either specific two-copy counter by the first mandatory draw, or 28.4707% when all optional mulligan bonuses are accepted. Marginal access to one counter must not be mistaken for access to both.

The first-draw exact fractions are 58,575,077 / 1,103,593,454 for direct joint access and 11,937,071,285 / 121,947,076,667 for the Secret Box-assisted upper bound. The implementation also checks that its observed-card compositions reproduce the full valid-deal denominator and that the exact mulligan-bonus distribution sums to one.

## Interpretation and limits

The four-slot 2+2 package is **not a reliable simultaneous dual-lock answer**. Even under the favorable Secret Box upper bound, fewer than one in ten valid openings can access both counters by the first mandatory draw; accepting every optional opponent-mulligan bonus raises that to only 13.77%.

This is deliberately an upper bound on the stated access window. It assumes Secret Box is observed, can be played, and can pay its three-card discard cost; the missing counter is not Prized; Items remain playable; and all optional bonus cards are taken. It does not charge Discard Capability Index or Active Move Realism costs, model Item-lock timing or turn order, count later draw/search effects, or simulate the opponent's choices. Actual successful use can only be lower within this modeled line.

This does **not** prove New Moon loses the matchup: other attacks or lock-bypass lines may exist, and the opponent may fail to establish both locks. It does falsify the assumption that two copies of each counter plus Secret Box make the simultaneous lock easy to answer. The candidate should remain unqualified until a fresh, paper-valid game tests its alternative lines. A future redesign should be structural and evidence-led; a cosmetic one-card substitution does not address the access bottleneck.

## Source links

- [New Moon Lockbreaker v1 fixed 60 and original assessment](new-moon-lockbreak-60-candidate.md)
- [Secret Box to Field Blower Prize-aware access calculation](new-moon-secret-box-garbotoxin-access.md)
- [Exact Iron Thorns opponent mulligan-bonus model](../../scripts/aichi_bonus_draws.cjs)
- [Active Iron Thorns and Tool-enabled Garbodor lock matrix](../aichi-2026/active-iron-thorns-temporary-unlock-matrix.md)
- [Human Expanded concepts: DCI, AMR, and access-versus-use distinction](../../resources/human_concepts.md)
