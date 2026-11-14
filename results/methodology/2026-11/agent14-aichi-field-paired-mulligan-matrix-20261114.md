# Full-field paired mulligan-bonus eligibility: Hood Shield v1 against the published Aichi sixties

**Agent14 | 14 November 2026 | exact combinatorial setup analysis.** This extends Agent12's paired mulligan model across all 29 published Aichi lists. It is not a completed game, matchup result, policy evaluation, or deck-strength estimate.

## Question and inputs

For the frozen Hood Shield Shadow Rider v1 candidate (14 Basic Pokémon), how often does each of the 29 published Aichi source sixties create an optional pregame bonus-draw allowance for the candidate or its opponent under the actual simultaneous mulligan procedure?

Inputs:
- `results/aichi-2026/candidate-hood-shadow-rider.json`: exact candidate 60; 14 Basic Pokémon.
- `results/aichi-2026/full-decklists.json`: 29 authenticated published source sixties, 32 total placements; exact full lists remain missing at ranks 23, 25 and 28.
- `results/aichi-2026/opening-hand-audit.json`: source-verified Basic counts for all 29 lists, no unresolved Pokémon, and initial seven-card mulligan probabilities.
- `scripts/agent12-expanded-mulligan-pairing.cjs`: reused paired-protocol mathematics and tail helper from Agent12. This work does not fork or replace that model.
- The uploaded Advanced Player's Rulebook, section I.G, steps 4–7 (page 15), describes both-fail shared resets and the optional draw after one-sided mulligans. Agent12's Aichi format report additionally records the event's one-card-per-one-sided-mulligan procedure and absence of an eight-mulligan cap.

All 29 original Aichi lists are retained for the primary calculation. The five unchanged lists at ranks 3, 6, 7, 24 and 29 contain Japanese-only promo identities and are not unchanged international-Expanded-legal opponents under the strict contract. A 24-list sensitivity is shown separately; it is not a substitute for the unresolved owner format decision or for paper admission.

## Exact paired model

For a 60-card deck with `b` Basic Pokémon, let

\[
q(b)=\frac{\binom{60-b}{7}}{\binom{60}{7}},\qquad p(b)=1-q(b).
\]

For candidate `c=14` and opponent `o=b`, write `q_c=q(c)`, `q_o=q(o)`, `p_c=1-q_c`, `p_o=1-q_o`, and `D=1-q_cq_o`. The both-fail round repeats with probability (q_cq_o); shared restarts do not award a bonus. On the first decisive round, the mutually exclusive events are candidate-only failure, opponent-only failure, or both valid. Therefore:

\[
P(\text{candidate eligible for }\ge1)=\frac{p_cq_o}{D},
\qquad
E[\text{candidate maximum optional allowance}]=\frac{p_cq_o}{Dp_o}.
\]

\[
P(\text{opponent eligible for }\ge1)=\frac{q_cp_o}{D},
\qquad
E[\text{opponent maximum optional allowance}]=\frac{q_cp_o}{Dp_c}.
\]

For integer `k >= 1`, the tail probabilities are

\[
P(\text{candidate eligible for }\ge k)=\frac{p_cq_o^k}{D},
\qquad
P(\text{opponent eligible for }\ge k)=\frac{p_oq_c^k}{D}.
\]

The expectations are maximum *optional eligibility*, not cards necessarily drawn. The successful player may choose any number up to the one-sided mulligan count; this analysis reports the maximum allowance. It does not model the value of those cards, public-information/tempo effects, optional choices, whether a drawn Basic is benched, or any play after setup.

## Field-wide summary

| Published field interpretation | Lists | Candidate mean optional allowance | Opponent mean optional allowance | Candidate minus opponent |
| --- | ---: | ---: | ---: | ---: |
| All published original Aichi lists | 29 | **0.3040** | **0.1307** | **+0.1734** |
| International-Expanded-compatible sensitivity | 24 | 0.1715 | 0.1382 | +0.0334 |
| Five unchanged format-incompatible lists | 5 | 0.9399 | 0.0946 | +0.8453 |

Across all 29 lists, the candidate is eligible for at least one bonus card in an average **18.79%** of paired setups; the opponent is eligible in **11.26%**. On the strict-24 sensitivity, those rates are **14.12%** for the candidate and **11.90%** for the opponent. Candidate expected allowance is larger against 16 lists, equal against six, and smaller against seven. The all-29 mean is strongly influenced by the three four-Basic Iron Thorns lists, all of which are in the five format-incompatible ranks. Their combined candidate-minus-opponent entitlement is **4.02673** optional cards across the three rank pairings, or **80.10%** of the all-29 net total (**5.02734**); the other 26 lists contribute only **1.00061** in total (mean **+0.03849**). Within the five format-incompatible lists, those three Iron Thorns lists account for about **95.3%** of the net entitlement. Under the strict-24 sensitivity, the asymmetry is much smaller. This is a setup-entitlement observation, not evidence that the candidate is favored in those matchups.

Basic-count distribution among the 29 published source lists: 4 Basics (3 lists), 10 (1), 11 (6), 12 (3), 13 (3), 14 (6), 15 (4), and 16 (3). The missing ranks 23, 25 and 28 are not imputed.

## Per-rank results

Probabilities are the chance that the named player becomes eligible for at least one optional extra card. Expected values are maximum optional draw allowances in cards.

| Rank | Opponent | Basics | P(candidate ≥1) | E[candidate] | P(opponent ≥1) | E[opponent] |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | Yasunori Kato | 14 | 12.17% | 0.141 | 12.17% | 0.141 |
| 2 | Takahiro Ando | 14 | 12.17% | 0.141 | 12.17% | 0.141 |
| 3 | Haruto Miki | 11 | 19.77% | 0.254 | 11.12% | 0.129 |
| 4 | Shu Hosoda | 13 | 14.35% | 0.171 | 11.87% | 0.138 |
| 5 | Yamato Nakano | 11 | 19.77% | 0.254 | 11.12% | 0.129 |
| 6 | Kazuma Kashi | 4 | 56.42% | 1.412 | 6.04% | 0.070 |
| 7 | Hiroto Fuji | 12 | 16.87% | 0.208 | 11.52% | 0.134 |
| 8 | Yusuke Kobayashi | 10 | 23.11% | 0.312 | 10.66% | 0.124 |
| 9 | Shun Ito | 11 | 19.77% | 0.254 | 11.12% | 0.129 |
| 10 | Haruku Yoshioka | 15 | 10.29% | 0.117 | 12.43% | 0.144 |
| 11 | Wataru Yano | 11 | 19.77% | 0.254 | 11.12% | 0.129 |
| 12 | Risa Sato | 15 | 10.29% | 0.117 | 12.43% | 0.144 |
| 13 | Hiromu Sasaki | 11 | 19.77% | 0.254 | 11.12% | 0.129 |
| 14 | Manaya Asano | 14 | 12.17% | 0.141 | 12.17% | 0.141 |
| 15 | Ryotaro Nozawa | 14 | 12.17% | 0.141 | 12.17% | 0.141 |
| 16 | Takumi Matsumoto | 11 | 19.77% | 0.254 | 11.12% | 0.129 |
| 17 | Yuya Yamano | 13 | 14.35% | 0.171 | 11.87% | 0.138 |
| 18 | Hayato Omuro | 16 | 8.67% | 0.096 | 12.66% | 0.147 |
| 19 | Mark Takahashi | 16 | 8.67% | 0.096 | 12.66% | 0.147 |
| 20 | Satoru Imamura | 14 | 12.17% | 0.141 | 12.17% | 0.141 |
| 21 | Shun Nakajima | 14 | 12.17% | 0.141 | 12.17% | 0.141 |
| 22 | Haruya Mori | 12 | 16.87% | 0.208 | 11.52% | 0.134 |
| 24 | Ryoya Fujii | 4 | 56.42% | 1.412 | 6.04% | 0.070 |
| 26 | Hibiki Yamada | 12 | 16.87% | 0.208 | 11.52% | 0.134 |
| 27 | Yuya Nagatsuma | 15 | 10.29% | 0.117 | 12.43% | 0.144 |
| 29 | Kohei Hamamichi | 4 | 56.42% | 1.412 | 6.04% | 0.070 |
| 30 | Koki Takeda | 16 | 8.67% | 0.096 | 12.66% | 0.147 |
| 31 | Yuhi Yokoyama | 15 | 10.29% | 0.117 | 12.43% | 0.144 |
| 32 | Kaito Higuchi | 13 | 14.35% | 0.171 | 11.87% | 0.138 |

The three four-Basic Iron Thorns lists (ranks 6, 24 and 29) each reproduce Agent12's 4-vs-14 result:
- Candidate is eligible for at least one optional bonus card in **56.4234%** of paired setups.
- Candidate's mean maximum optional allowance is **1.41235 cards**.
- Candidate has **7.3369%** probability of an allowance of at least five cards.
- Opponent is eligible for at least one optional bonus card in **6.0393%** of paired setups, with **0.07011** expected optional cards.

The candidate has 14 Basics, so it is symmetric against each 14-Basic source list. Against the 15- and 16-Basic lists, the opponent has a modestly larger expected allowance because the candidate is more likely to mulligan.

## Reproduction and validation

Run from repository root:

```sh
node scripts/agent14-aichi-field-paired-mulligan-matrix.cjs
node --test tests/2026-11/agent14-aichi-field-paired-mulligan-matrix.test.cjs
```

The script reads the three exact JSON inputs, reuses Agent12's paired-protocol helper, checks candidate Basic composition, verifies each source list against its opening audit, rejects unresolved Pokémon and missing-rank imputation, and emits machine-readable JSON. The regression suite checks the 29/32 coverage boundary, the three exact four-Basic cross-checks, symmetry, probability normalization, and both field summaries. No native Twinleaf run or GitHub Actions dispatch is required for this pure combinatorial result.

**Validation performed 14 November:** Node 22.16.0 ran the six regression tests successfully (6/6) against a synthetic 29-row fixture preserving the published ranks, player/archetype identities, Basic counts, candidate inventory, and missing-rank boundary. Separately, the actual repository JSON inputs passed live V8 checks: all 29 source/audit identities match; all 29 source lists sum to 60; candidate inventory sums to 60 with 14 Basics; no opponent Pokémon is unresolved; all 29 opening-mulligan probabilities match the exact helper; and missing ranks remain 23/25/28. The synthetic test fixture is not a substitute for those actual source inputs. No GitHub Actions run was dispatched.


## Limitations and use

- The 29 lists are authenticated original source inventories, not 29 paper-admitted Expanded opponents. Five are format-incompatible unchanged under strict international Expanded, and the event-format interpretation remains owner-controlled.
- Ranks 23, 25 and 28 are absent. No Basic count or bonus entitlement is imputed for them.
- The candidate is the current Hood Shield v1 research challenger, not a nominated final deck.
- Optional bonus-draw eligibility is not actual cards drawn, effective hand size, opening-board quality, turn-one tempo, or game win probability.
- The analysis assumes independent uniform seven-card deals after full shuffles and the uncapped one-sided mulligan rule. It does not model player choice to draw fewer cards.
- The field means weight each published rank equally; they are not tournament frequencies or matchup-weighted aggregate performance.

This extension identifies a real, exact starting-condition asymmetry for the original Aichi field and shows how much of it disappears under the strict-24 sensitivity. It supplies a reproducible setup input for later full-game evaluation; it does not support a deck change or a 99.5% claim.


## Pinned Twinleaf setup implementation check

Static source inspection at the repository's recorded Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` (`vendor/twinleaf`, remote `https://github.com/twinleafgg/twinleafgg.git`) confirms that the normal seven-card `setupGame` path in `ptcg-server/src/game/store/reducers/setup-reducer.ts` follows the same paired protocol:

1. Both players draw seven.
2. If both lack a Basic, both mulligan counters increment, both hands return, and both redraw. Shared failures therefore add equally and do not create a bonus for either player.
3. Once only one player has a Basic, that player completes setup while the other continues to redraw; only the continuing player's counter increases.
4. The first player receives a `WANT_TO_DRAW_CARDS` `SelectPrompt` with choices from zero through the difference in mulligan counters. The chosen number is moved from deck to hand, and the engine then offers extra Bench placement for newly drawn Basics. The mirrored branch does the same for the other seat.

This matches the mathematical model's one-sided failure count after shared resets and preserves the optional nature of the bonus draw. No Twinleaf hook or patch is indicated for this specific setup rule at the pinned revision. This is static source inspection, not a runtime integration test; it does not validate every setup-tagged card or any competitive game outcome. The separate alternative-setup path is not the normal seven-card path modeled here.


## Prompt-v3 projection and candidate-policy handoff

Read-only inspection of `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` confirms that the existing host projection is sufficient for this native prompt; no new choice-value schema field is needed:

- `projectSimplePrompt` projects a native `SelectPrompt` into choice tokens, labels and `publicMetadata.choiceIndex`; prompt-level metadata includes the number of choices. The opaque token maps to the native option index. `makeSource` marks it as `sourceKind: 'engine'`, and the projected description is the native message. At the pinned `ptcg-server/src/game/game-message.ts`, `GameMessage.WANT_TO_DRAW_CARDS` is the exact string `WANT_TO_DRAW_CARDS`.
- `dispatchPromptSelection` passes that index to the native `SelectPrompt` callback.
- In the pinned setup reducer, `WANT_TO_DRAW_CARDS` options are built in **descending** order: `extraDraws, extraDraws-1, ..., 0`, with labels `Draw i card(s)` and native values `i`. Therefore, for this specific prompt, `drawCount = choiceCount - 1 - choiceIndex`; the visible label is a cross-check. Do not equate `choiceIndex` directly with draw count.

A separate, concrete policy gap remains: Agent46's current candidate policy `choosePrompt` accepts `SelectPrompt` only when there is one choice and otherwise abstains with `AMBIGUOUS_SIMPLE_PROMPT`. It therefore does not yet make the multi-choice `WANT_TO_DRAW_CARDS` decision. A narrow candidate-policy branch can recognize the engine setup prompt and select the token corresponding to a deliberate draw count using the existing `choiceIndex`, choice count and descending labels. This requires no host-schema change or new fixture. The policy choice itself may depend on hand-disruption considerations; this report does not prescribe taking the maximum.
