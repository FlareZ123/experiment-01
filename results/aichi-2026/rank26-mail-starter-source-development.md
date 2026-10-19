# Rank26: real source first-turn Mail before Meloetta is established

**Agent 4, 19 October 2026.** Predeclared bounded policy-development counterfactual. This experiment uses retrospectively identified authentic source deals, so **none of its cases belong in a prospective performance denominator**.

## Original evidence and hypothesis

The independently preregistered [24-deal cohort](rank26-firstturn-prospective-policy-exposure.md) verified 9 actual rank26-first opens and zero initial Meloetta ex in play among those 9. Seven of their initial owner-visible hands held Trainers' Mail, with four holding neither Risky Ruins nor Canceling Cologne. No source-first Mail was played in either original policy arm. The opt-in [v1 Mail scout](../../simulation/twinleaf/rank26-mail-recovery.cjs) explicitly required **Meloetta already Active**, in addition to the first-turn, hand/board, no-early-Stadium/no-Cologne, Iron Thorns and no-pending-prompt gates. This narrow condition creates a testable source-policy coverage gap. It does not prove that the correct strategic line on those deals is to use Mail.

The new **opt-in v2** keeps every previous restriction except for the already-Active-Meloetta requirement. The source-only bot branch uses the player's hand and public board; it does not consult deck order or Prize identities. Versioning retains the v1 default unchanged. All actual gameplay continues through the pinned Twinleaf Store, with printed original 60s, strict prompts, source deck hashes and draw-log verification.

## Four historical development openings

These were selected **after** examining the old 24-case JSON, specifically because the original source-first hand contained Mail but neither early-priority Item. Their outcome cannot be described as an unbiased evaluation of v2:

| Repeat, seat | Fixed actual seed | Initially Active |
| --- | ---: | --- |
| 43, A | 2046029502 | Squawkabilly ex |
| 46, A | 4158340325 | Unown |
| 48, B | 2818295704 | Unown |
| 49, A | 1839183531 | Exeggcute |

Opponent rank6 is verified Active Iron Thorns ex on each source-dealt root. Meloetta is absent from the opening field in all four. Both registered decks are exactly 60 cards. Fixed engine \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`, existing source profile \`rank26-autonomous-cologne-pump-propagation-v3\`, 120-action cap, legal prompt checks, consistent physical seat, independent actual draw-log and source deck hashes.

## Falsification gate and measurement

Run both current v1 and v2 with identical initial decklists and physical source deal. Assert v1 selects no first-turn Mail and that v2 selects **at least one real Mail PlayCardAction in each of the four cases**, with the source-root firstturn trace and \`cardsPlayedBySeat\` agreeing that the Store processed strictly more Mail. If source starts second, the opening hand differs, a chosen action is not played, source prints diverge, or the input match fails the actual draw-log, **the test must fail**. Preserve failure instead of substituting a favorable seed.

Record every source-first selected Item, selected search-prompt response when available, firstturn root attack declarations, opponent's observed Prize count and whether games are action-capped. Compare remaining firstturn actions to determine whether Mail resulted in an improved line or merely an extra Item. A passing Mail-use criterion confirms only one new legal, genuine root-decision channel. **Attacker conversion, [CCC] Energy readiness, TM Tool placement, five self-KO Prizes, legal Crisis Punch and opponent response are separate requirements.**

### Reproducibility

- Hook: [rank26-mail-recovery.cjs](../../simulation/twinleaf/rank26-mail-recovery.cjs), options \`starterAgnostic:true\`.
- Existing pure tests: [rank26-mail-recovery.test.cjs](../../tests/rank26-mail-recovery.test.cjs), including original v1 invariants.
- Source-paired runnable fixture: [rank26-mail-starter-source-pair.cjs](../../simulation/twinleaf/rank26-mail-starter-source-pair.cjs).
- Existing manual CI only: [aichi-damage-pump-fidelity.yml](../../.github/workflows/aichi-damage-pump-fidelity.yml), opt-in \`rank26_mail_starter_probe\`; complete machine artifact must be retained.

If the bounded source-decision transition is successful, the next relevant study is a **new preregistered, both-actual-start, failure-inclusive seed cohort**, not a second interpretation of these four historically chosen source deals. Opponent policy and printed-paper clock remain unqualified. Project status: 29/32 exact opposing 60s, zero competitively qualified games, no target-qualified final 60.


## Compiled source outcome, 19 October 2026

**The opt-in four-source experiment passed.** [Manual CI run 39182801014](https://github.com/FlareZ123/experiment-01/actions/runs/39182801014), head \`cd468eac98766a899de5ffb115138bec8d126fdc\`, compiled against pinned Twinleaf \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`. Complete source-specific JSON is [artifact 12155999903](https://github.com/FlareZ123/experiment-01/actions/runs/39182801014/artifacts/12155999903). The runner asserted each physical seed, source first-turn draw log and 60-card deck hashes, selected policies, genuine root \`PlayCardAction\` and matching physical Store card-play count.

| Source seed | v1 first-turn Mail roots | v2 first-turn Mail roots | Trainer cards selected in real Mail prompts |
| --- | ---: | ---: | --- |
| 2046029502 | 0 | **1** | Battle VIP Pass |
| 4158340325 | 0 | **3** | Bicycle, Carmine, Battle Compressor |
| 2818295704 | 0 | **1** | Hisuian Heavy Ball |
| 1839183531 | 0 | **2** | Quick Ball, Carmine |
| **Total** | **0** | **7** | **Seven actual prompt selections** |

All seven firstturn Mail plays came from the actual registered rank-26 source-hand copies, each with a Store-accepted \`PlayCardAction\` and a subsequent real \`ResolvePromptAction\`. In particular, the new v2 changes actual printed-card search behavior on **all four** historical source openings. The v1 game-wide Store count includes a later Mail in seed 2818295704, but its **first-turn root count is zero**, so cumulative card-play totals must not be mislabeled as first-turn counts.

The new access did not independently deliver an attacker. In seed 2818295704, the chosen **Hisuian Heavy Ball** was actually played and searched for **Squawkabilly ex**, which was Benched before Pass. In seed 2046029502, the Mail selected Battle VIP Pass, but the subsequent firstturn sequence was still Forest Seal Stone, Quick Ball, Bunnelby and Pass. In seed 4158340325, three Mail selections were followed by ordinary Exeggcute, basic Lightning and Pass. In seed 1839183531, two Mail selections were followed by ordinary Lightning, TM: Crisis Punch, Retreat and Pass. Across the **four** development cases:

- Firstturn **root AttackAction: 0/4**.
- Firstturn observed opponent Prize count below six: **0/4**.
- No firstturn Meloetta ex Bench or Active play is present in the source-root action summaries.
- No evidence that adding these Mail choices converted a real firstturn Crisis Punch or improved a competitive game result.

**Interpretation:** This closes the narrow source-bot Mail-action availability test, including genuine top-four Trainer selection. The experiment exposes a more important downstream decision bottleneck: search cards can enter the owner's hand without the generic policy playing them, finding Meloetta, reserving DCE, assigning TM to Meloetta, and taking the required five self-KO Prizes. This is an actual illustration of connector-action versus strategic-completion separation. The source seeds were selected using a previous cohort, so their 7/4 Mail action count is **not** a prospective probability, and the test supports no win-rate estimate. Do not extrapolate these cases to rank26's actual tournament player.

A defensible next investigation should follow one authentic, source-conserved opened Trainer into legal subsequent actions and the first opposing response, or redesign a competent combined search/Energy/Tool/attacker policy on a fresh set of source deals. No additional CI run is justified merely to repeat these seven Mail uses. **Status remains 29/32 exact field 60s, zero competitively qualified games, no target-qualified final fixed 60.**
