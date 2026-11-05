# Agent 5: paid ADP opening-line sensitivity (5 November 2026)

**Scope:** The immutable ADP–Thorton–Regidrago v2 candidate, paper Expanded, opening turn **going second**. This is an exact resource-access calculation, **not** a native game, win rate, new candidate, or Issue #25 policy release.

## Physical line family

Given a Basic-valid seven-card hand, six Prizes and the first own draw, the screen checks whether a player can:
1. Select ADP Active whenever it is in the initial seven, otherwise start an available Basic.
2. If another Basic starts Active, obtain ADP and promote it with an actually held Switch.
3. Obtain Double Dragon Energy, attach it to ADP, and pay the single manual Energy attachment to enable enhanced Altered Creation-GX.
4. Complete every Quick Ball (one discarded card), Ultra Ball (two), and Guzma & Hala (two) payment actually used, reserving necessary line pieces first. One Tag Call can search **both ADP and Guzma & Hala**, because both are TAG TEAM cards.

The printed rules and card database support these actions. The exact category count vector, checked against the frozen candidate v2 inventory in the test, is:

| ADP | Other Basics | Switch | Tag Call | Quick Ball | Ultra Ball | Guzma & Hala | DDE | Dragon payloads | Basic Energy | Battle Compressor | Other |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 | 5 | 2 | 4 | 3 | 4 | 3 | 4 | 6 | 7 | 4 | 16 |

**Exact conditional denominator for every row: 250397245379590400 weighted physical states.**

| Allowed discard group | Exact qualifying numerator | Probability |
|---|---:|---:|
| Any nonessential card (pure mechanical payment) | 95104706171618399 | **37.9815305186%** |
| Only the six Dragon attack-payload cards | 50143475645198960 | **20.0255699975%** |
| Dragons and seven Grass/Fire basic Energy | 66636672290404688 | **26.6123823325%** |
| Those groups plus four Battle Compressor | 75395103067442776 | **30.1101966809%** |

The mechanical screen independently reproduces the prior Agent5 ADP-first-eight Tag/Quick/Ultra figure, 37.981531%. The more restrictive Dragon-only scenario is 17.9559605212 percentage points lower. These are **scenario-specific DCI assumptions**, not universal claims that those groups are safe to discard or that all remaining cards must be protected.

## Reproducibility

- Fixed input: [candidate v2](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json), published candidate-card fingerprint bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b.
- Executable: [exact enumerator and payment-path selector](../../simulation/evaluation/agent5-adp-paid-opening.cjs); source blob SHA-1 8cd513eacd19354128625c8d1ad86f139dafe3a0.
- [Seven tests](../../tests/agent5-adp-paid-opening.test.cjs), source blob SHA-1 91420124750acc5dc99b80cef0d937b9276b82ed, locally Node.js 22 **7/7 PASS**. Includes an independent exhaustive labeled-card miniature deck that places opening hand, Prizes and first draw in physical sequence. Local candidate-inventory crosscheck used a reconstructed fixed v2 list; the repository test reads the actual JSON.
- Registered the tests in the **existing manual** .github/workflows/aichi-benchmark-stats.yml. **No post-change remote CI execution has been verified.** No extra workflow was created.

The enumeration conditions on a Basic-valid opening and excludes mulligan bonuses; the first draw and Prize configuration are treated exactly by exchangeability. It allows at most one Supporter and one manual Energy attachment. It checks only deck presence after Prizes for ADP, Guzma & Hala and Double Dragon Energy.

The model **excludes** Wonder Tag, Pokégear, VS Seeker, additional draw engines and other searches, opponent locks, first-turn going first, optional Bench triggers, strategic payoff of the discarded cards, the eventual Regidrago VSTAR development, competent opposing responses and native Store validation. Thus 37.9815% is an optimistic bound **only for the explicitly enumerated line family**, never a ceiling for every possible first-turn ADP line or a game win rate.

## Implication for integration

Before crediting a source attack line, a real two-seat policy must enumerate *owner-visible physical discardable cards*, pay every required discard through the native Store, preserve strategically important future cards when appropriate, and compare connector contention. Report actual physical-copy payments, line selection, opponent reply and independent paper-validity controls. This work supports that release task and does not promote this fifth candidate into the selected shortlist.
