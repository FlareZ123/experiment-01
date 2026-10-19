# Rank-15 Bunnelby powered-TM opportunity: the missing Oddish target precedes Bench crowding

**Agent 36, 19 October 2026.** Original Aichi rank-15 **Ryotaro Nozawa, Lopunny Vileplume** printed 60 against unchanged New Moon Lockbreaker v1 English-mechanics proxy 60. **Mechanical and decision-policy diagnostic only; zero competitive games.**

## Reproduction and exact provenance

- Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Runner: [matched original-source Bunnelby policy pair](../../simulation/twinleaf/newmoon-rank15-bunnelby-policy-pair.cjs), using actual `Store.dispatch` observer [source](../../simulation/twinleaf/newmoon-rank15-source-duallock-census.cjs).
- Frozen 4 repeat seeds × 2 candidate physical seats; original printed 60s, source first-player order and initial physical cards matched within every policy pair; observed only root postdispatch positions while **both players retained six Prizes**.
- Manual compiled [GitHub Actions run 39284019439](https://github.com/FlareZ123/experiment-01/actions/runs/39284019439), **success**, runner revision `f72bf398d61afb67dde20020b8adfd961d4e36b8`. Full original two-policy game JSON: [artifact 12201859174](https://github.com/FlareZ123/experiment-01/actions/runs/39284019439/artifacts/12201859174), zip SHA-256 `b289c481aa64a801ef4a78b94080f48bcff605a6b8eaf25e7435fd4710a20f30`. Separately derived [root-readiness artifact 12201694445](https://github.com/FlareZ123/experiment-01/actions/runs/39284019439/artifacts/12201694445), zip SHA-256 `d12d519d2dd5fc3d61470a4510783654858f2273f9687a71df9dfe9a5ba13eb0`. Four audit tests and compiled source tests passed.
- Audit script [here](../../scripts/aichi-rank15-bunnelby-readiness-audit.cjs), source initial-Prize gate [here](../../simulation/twinleaf/rank15-prize-prereq.cjs). Original paired run [39247283776](https://github.com/FlareZ123/experiment-01/actions/runs/39247283776) did not yet record physical readiness, so its zero attack count alone was not sufficient to distinguish readiness versus choice.

## Eight same-deal paired source-policy arms

| At least one root snapshot in a deal | Generic bot | Bunnelby Evolution K0/K1 policy |
| --- | ---: | ---: |
| Initial Vileplume Prize-chain prerequisites eligible | 5 | 5 |
| Source Bunnelby Active | 3 | 2 |
| Bunnelby Active with TM: Evolution attached | 1 | 1 |
| Above, also with an Energy attached | 1 | 1 |
| Powered TM plus at least one Benched evolution target | **0** | **0** |
| Two source Vileplume stage-line positions | 2 | 1 |
| Full source Bench with fewer than two stage-line positions | 8 | 8 |
| Native Store `Evolution` declarations | **0** | **0** |

Each count is an exposure indicator over **eight historical physical games per arm**, potentially at different turns. These counts are not a co-occurrence matrix and cannot be interpreted as an estimated probability of winning or establishing a competitive lock. The stronger Source Bunnelby policy did **not** improve this recorded readiness objective in those eight original games.

## Important temporal and causal correction

The **only powered Active Bunnelby + TM snapshot** in both arms occurred in **repeat 0, candidate physical seat A, source seat B**, immediately after actual root action **ordinal 125 at global turn 16**, with Source B currently to act:

| Source zone | Observed printed cards |
| --- | --- |
| Active | **Bunnelby PRC**, `Technical Machine: Evolution PAR`, `Grass Energy MEE` |
| Bench | `Budew ASC`; `Eldegoss V RCL`; **3 empty slots** |
| Vileplume evolution lines in play | **0** |

There was no `Oddish UNB` or `Gloom UNB` on that source board. The stage-target count was zero, so reaching a mechanically paid Tool state alone did not establish the desired ALS. The source first hit **full Bench with fewer than two Vileplume lines** only at **global turn 36, action ordinal 246**, with one Oddish on the Bench. This is twenty global turns **after** the earlier missed powered-TM opportunity. Therefore **Bench crowding did not cause that particular zero-target state**; the source had ample Bench capacity at turn 16.

Other paired games *did* show early full Bench. In the generic arm, first full-Bench-under-two-line turn by registered row order was: `36, 1, 25, 20, 17, 9, 31, 6`. Those observations keep Bench reservation relevant as a separate testable hypothesis, but cannot retrospectively explain the turn-16 missing Oddish. The source-game policies repeatedly extended far into untimed turns without taking Prizes, which itself warns against competitive-strength inference.

## Decision gate and next research

1. Establish what **rank-15-own-hand and public Stadium** resources were available at the first genuine paid Tool state before proposing an action. An **owner-hand-only**, read-only source observer has now been committed to the existing runner; this code addition requires a *new compiled output* before any result about actual held Poffin, Tag Call, Artazon or search options is claimed. No hidden deck or Prize identities are exposed to the acting policy.
2. Check a **live owner-legal** Oddish-to-Bench action sequence (held Oddish or Poffin, an actually usable Stadium/search chain, capacity, and other action/resource costs) before the Tool attack. Test real prompts and source board changes, including no-opportunity deals. This is about policy competence and temporal opportunity, not a proposed decklist swap.
3. The registered **historical eight-anchor Bench-reservation policy** comparison has now completed successfully in pinned CI, and its narrow source evidence is recorded below. The source printed 60 and original physical deals remain unchanged.

**Qualification boundary:** the opposing source and candidate both use unqualified automated decisions, event flags do not certify all attack legality/effects, and the same historical seeds have been repeatedly studied. No independent competitive matchup outcomes, complete Top-32 performance claim or 99.5% win-rate certification follow from this report. Top-32 exact list coverage remains **29/32**.


## Completed Bench-reservation counterfactual (same original deals)

An independent manual pinned [workflow 39331437715](https://github.com/FlareZ123/experiment-01/actions/runs/39331437715), head `95eb26d90c14c145ccf26a18b10bb52075bf51e6`, **succeeded** with `rank15_bench_reservation:true`. The eight-anchor source runner [here](../../simulation/twinleaf/rank15-vileplume-bench-reserved-source.cjs) executed **8/8** original physical deals, independently verified all eight original prepolicy zone digests and start orders, encountered **zero engine/validation errors**, and preserved every invalid-Prize deal. No game winner is used. Full [JSON artifact 12223529194](https://github.com/FlareZ123/experiment-01/actions/runs/39331437715/artifacts/12223529194), ZIP SHA-256 `78fcbf5155a0b6a41bb0134fc5b1f6e172c9de44cd527c69641a81720dcd06e5`.

The enhanced Bunnelby + owner-visible Bench-reservation arm showed **AOR in 2/8, BUS in 1/8, both together in 0/8**, two Vileplume-chain positions in **1/8**, a first full source Bench with fewer than two lines in **8/8**, and **zero** native `Evolution` declarations in every trial. The earlier matched enhanced Bunnelby arm had AOR **2/8**, BUS **0/8**, both **0/8**, and two Stage lines **1/8**. The only recorded reservation intervention candidate is **repeat 2 / candidate seat B, global turn 9**, deferring Buneary with one Stage line and one free Bench slot; its subsequent BUS at turn 17 arose in a trial where initial dual-stage Prize prerequisites were **ineligible**. The intervention event collector may include speculative evaluations; without a root-action comparison this does not prove that the deferral actually altered the real Store policy. It certainly is no proof of competitive dual-lock improvement.

**Observed disposition:** this reservation-only tactic does not establish a natural double Vileplume or TM: Evolution source line on the eight fixed historical deals. Shift work to **owner-visible acquisition/play of Oddish before a powered TM state** and verify at the live root. The original lone paid Tool state still had three empty Bench positions, so the new null result is compatible with that earlier diagnosis. Do not increase the number of generic-bot games on this tactic alone.
