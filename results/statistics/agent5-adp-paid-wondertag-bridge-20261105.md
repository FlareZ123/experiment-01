# Agent 5: paid Wonder Tag bridge added to exact ADP opening (5 November 2026)

**Status:** pure source-driven combinatorial research, local Node.js tests 8/8 PASS. Fixed [ADP–Thorton–Regidrago v2 60](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json); no new candidate, native Store game, qualified opponent policy, full game or win rate.

## Question

How much does preserving and playing the *one* Tapu Lele-GX in this candidate actually add to the **first-eight-card, going-second, enhanced Altered Creation-GX physical line**, once every Quick Ball, Ultra Ball and Guzma & Hala hand payment is actually funded?

This extends the prior [mechanically paid and DCI-conditional screen](agent5-adp-paid-opening-dci-sensitivity-20261105.md) and [Agent5's narrower original Lele startup-collision event](agent5-adp-opening-choice-active-priority-lele-20261104.md). The earlier 1.154245% physically missing-DDE/G&H/Tag event counted Lele already held/drawn under narrower conditions; it was **not** the total effect of Wonder Tag plus tutor-to-Lele access.

The supplied card database's printed Tapu Lele-GX GRI60 Ability, *Wonder Tag*, searches a Supporter when Lele is **played from hand to Bench during the turn**. A pregame Benched Lele or an Active Lele does not satisfy this. The screen deliberately starts ADP when in the initial seven; otherwise it prioritizes another Basic over Lele to preserve the optional turn-play trigger if possible. Lele can also be found through Quick Ball (discard one) or Ultra Ball (discard two), played to Bench, then find Guzma & Hala, whose **two other card** discard must still be paid before Double Dragon Energy is searched. ADP placement and the Switch-to-Active payment, Tutor copies, deck/prize availability, one Supporter and one manual attachment are simultaneously constrained.

## Exact source probabilities

The fixed 60 separates initial seven into 13 categories: ADP2, non-Lele other Basic4, Lele1, Switch2, Tag Call4, Quick Ball3, Ultra Ball4, Guzma & Hala3, Double Dragon Energy4, Dragon attack payload6, basic Grass/Fire Energy7, Battle Compressor4, remainder16. All probabilities are conditional on a Basic-valid original seven, with six physical Prizes and the first normal draw enumerated exactly, no mulligan compensation. The exact common weighted denominator is **250397245379590400**.

| Discard-eligibility scenario | Without Lele: exact numerator | With Lele: exact numerator | Extra weighted states | Extra percentage points |
|---|---:|---:|---:|---:|
| All nonessential cards mechanically eligible | 95104706171618399 | 109541773114908463 | 14437066943290064 | **+5.7656652418** |
| Only six Dragon payloads eligible | 50143475645198960 | 50778042472737262 | 634566827538302 | **+0.2534240449** |
| Dragon payloads plus seven basic Energy | 66636672290404688 | 69899599913538126 | 3262927623133438 | **+1.3031004467** |
| Those groups plus four Battle Compressor | 75395103067442776 | 80845853351768176 | 5450750284325400 | **+2.1768411534** |

The with-Wonder-Tag absolute resource probabilities are **43.7471957604%**, **20.2789940424%**, **27.9154827792%**, and **32.2870378343%**, respectively. The without-Wonder-Tag numerator for **all four** scenarios exactly reproduces the independent 12-category earlier screen. This is a strong cross-model consistency check.

## Executable evidence

- [Exact 13-category Wonder Tag expansion](../../simulation/evaluation/agent5-adp-wondertag-paid-opening.cjs), byte-identical local/GitHub blob SHA-1 **8043b4296e4f14c2b77c6e10d4362caf78736977**.
- [Eight tests](../../tests/agent5-adp-wondertag-paid-opening.test.cjs), byte-identical blob SHA-1 **36cd77f06f6cc4b72bb59a0417d7f747961611b9**. Real local Node 22 **8/8 PASS** including: no-Lele baseline exact parity for all profiles; Lele held behind ADP; Lele forced Active veto; preserved Lele behind a different Basic; Quick Ball fetched Lele with deck/Prize guard; a single Quick Ball cannot tutor two independent Pokémon; independent labeled-card toy exhaustive enumeration with seven-hand analogue, Prizes and first draw.
- The full exact count runs locally in approximately 10 seconds after grouping prize assignments by the **16 possible relevant deck-availability masks**. The manually dispatched existing **aichi-benchmark-stats.yml** includes both Agent5 pure test files; **no post-change Actions success or native test is claimed**.

## Critical bounds

**The mechanical 5.77pp is a search/payability opportunity under deliberately permissive discarding, not a realized payoff.** The Dragon-only profile yields only +0.25pp. Those DCI groupings are sensitivity assumptions. In an actual Regidrago line, some Dragon donors or Basic Energy may be worth protecting, and some currently excluded cards may be expendable.

The model assumes an open Bench slot, no opponent Ability/Item lock, a retained in-hand Lele rather than a setup Bench Lele, a rational first Active, and owner-only legal information. It omits Pokégear, VS Seeker, Crobat V draws, other Item/Supporter routes, turn-two requirements, current opponent board effects, actual native prompt fulfillment and the official match clock. In particular, **Iron Thorns ex Initialization can make the printed Wonder Tag route unavailable** until the lock is removed. This prevents the result from certifying a global line upper bound, source competence, an opponent matchup outcome or the 99.5% field target.

## Integration question

A two-seat owner policy should expose for each real held Lele: whether it is Active, prebenched, genuinely playable from hand on the current turn, whether Wonder Tag is currently enabled, which owner-visible physical discard targets can pay a G&H or Ball cost, and whether the actual Store settles the Supporter search and resulting payment. The correct route is matchup-dependent. This supports specific native regression cases, not a new one-off CI workflow or a fixed candidate promotion.
