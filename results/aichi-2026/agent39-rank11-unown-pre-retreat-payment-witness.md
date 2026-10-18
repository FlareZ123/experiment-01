# Rank-11 candidate-first Unown retreat: a payable printed attack before the later Pass

**Agent 39, 18 October 2026.** This is a source-choice resource-payment audit for a single retrospectively selected candidate-first New Moon deal. The source is Agent 2's [16-arm compiled direct-rank11 report](agent2-rank11-heldshake-candidate-response-16arms.md), archived in [manual CI 39118444773](https://github.com/FlareZ123/experiment-01/actions/runs/39118444773) artifact `12132319883`. The same source was used in our [post-retreat Pass Energy/Bench audit](agent39-rank11-candidate-first-early-pass-energy-gates.md). This audit corrects any overly broad inference that the candidate lacked a payable printed attack *throughout* its turn.

## Actual observed root sequence

At physical candidate seat B, actual candidate-first source deal **`second-b=2809154458`**, all three unchanged New Moon policy variants recorded the same global-turn-3 root sequence:

| Actual root ordinal | Action | Relevant source evidence |
| ---: | --- | --- |
| **25** | Play Psychic Energy | Candidate own-hand printings and source `PlayCardAction` identify the attached card |
| **26** | Retreat | `retreatTransition.fromActive` is **Unown** with a physically attached **Psychic Energy**, and its printed `Hidden Power` attack has **one Colorless Energy** cost; the accepted retreat promotes **Galarian Articuno V** |
| **27** | Pass | New Active Articuno has one Psychic Energy, insufficient for printed three-Energy `Psyray`. Source turn has no candidate attack declaration |

The root `RetreatAction` is an actual Store action, not a detached bot proposal. Its recorded `benchAfter` contains the retreated Unown with **zero attached Energy**. Each of the three policy variants repeated the same source-deal decision sequence. There was **one source deal** in this evidence, repeated under three candidate policies.

The supplied card database confirms **Unown AOR 30 / XY7-30** has printed **Hidden Power**, cost one Colorless, damage **10**. A Basic Psychic Energy can satisfy the printed one-Colorless Energy requirement. Thus **before accepting root 26**, the candidate's Active had the Energy *to pay for* Hidden Power. Its subsequent Retreat and Pass create the observed underpowered Articuno end state. Whether Hidden Power was fully legal under every intervening attack-prevention/status effect, whether a competent player would prefer to attack for 10, and whether the attack would change the game outcome **remain unverified**. There is no cloned pinned-Store acceptance replay at that exact root.

## Why this distinction matters

The later Pass state in our [early-Pass report](agent39-rank11-candidate-first-early-pass-energy-gates.md) accurately has no payable printed attack on the *then Active* Articuno. It is only a post-decision observation. The earlier real turn had a **different Active with a payable attack** and the policy chose to expend the attachment on a retreat. Calling the turn's entire no-attack trace an unavoidable Energy-availability failure would overlook the actual root-level choice and its opportunity cost.

Potential tactical benefits of retaining Unown active, attacking for 10, promoting Articuno, or advancing another attacker require an authentic source-bound player-policy/attack-effects comparison. The opposing Tool-equipped Garbodor suppresses Unown's **Farewell Letter Ability**, which requires Unown to be Benched, but Garbotoxin does **not** itself forbid using the printed Hidden Power attack.

## Reproduction and status

- [Fail-closed archived-root validator](../../scripts/rank11-unown-pre-retreat-payment-audit.cjs), [three pure regression tests](../../tests/rank11-unown-pre-retreat-payment-audit.test.cjs).
- The validator requires the exact root ordinals 25, 26 and 27, source identity, the actual one-Energy Unown, printed attack cost, accepted retreat into Articuno and subsequent Pass. Its output labels other legal-attack constraints and tactical optimality **unreviewed**.
- Both this test and the complementary Energy/Bench-state test are included in existing manually triggered `aichi-garbotoxin-crosslock.yml`. No per-commit CI was added.

The parent cohort was retrospectively selected from source lock opportunities. **No independently qualified competitive game result**, no inferred win probability, and no 99.5% deck-level evidence follow from this necessary-condition witness. Opponent source coverage remains 29/32. Preserve all arms and independent-seed opportunity denominators in future work.
