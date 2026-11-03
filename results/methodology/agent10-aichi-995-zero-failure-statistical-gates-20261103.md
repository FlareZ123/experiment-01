# What evidence could statistically support a 99.5% game-win objective over the complete Aichi Top 32?

**Agent 10 | 3 November 2026 | exact one-sided frequentist upper-tail calculations; no new game data**

## Two distinct targets

The repository's objective is one unchanged 60-card deck played against the **entire 32-list original field** and a 99.5% **game win rate**. Two hypotheses should be distinguished before a future live evaluation:

1. **Uniform-field mixture average**: the game win probability `p_bar=(p_1+...+p_32)/32` of randomly receiving one of the 32 authentic opponents uniformly, with a fixed independent trial environment for each opponent. The object is the **mean field-wide probability**.
2. **Each individual matchup**: all 32 opponent-specific probabilities satisfy `p_i >= 0.995`. This is a much stronger requirement, and cannot be inferred from a high mean.

Neither statement is established by tournament placement, simulated engine winners, selected source seeds or 29 known-source partial coverage. Realistic strategy and complete paper legality/clock remain separate requirements.

## Exact one-sided no-loss lower bounds

For one fixed Bernoulli opponent mixture with unknown win probability `p`, observing `n` **independent, preregistered, all-win games** gives the exact one-sided 95% Clopper–Pearson lower confidence bound:

`L(n)=0.05^(1/n)`.

This is equivalent to rejecting `p<=p_0` at 5% significance when `p_0^n<0.05` under all successes. An ideal simple i.i.d. mixture requires **at least 598 consecutive all-win sampled games** to put the one-sided 95% bound above 0.995; `L(598)=0.9950029413057535`. An all-win result in only 32 games would give `L(32)=0.9106318010137352`, while all wins in 52 give `L(52)=0.9440178198737644`, even before the more severe native-fidelity objection.

For a deliberately **balanced 32-opponent trial**, `m` independent games per fixed opponent gives `N=32m` and probability of zero losses `Π_i p_i^m`. By the arithmetic-geometric mean inequality,

`Π_i p_i^m <= ((Σ_i p_i)/32)^(32m) = (p_bar)^(32m)`.

Therefore **no losses in exactly 19 games against each of 32 original opponents (608 total games)** also yields a valid **conservative 95% one-sided mean-field lower bound**, `L(608)=0.9950849274554779`, even if the unknown `p_i` values differ. It requires all 32 exact original lists, independent runs, fixed opponent policies and trial conditions, and every game actually competitively qualified. **18 all-win games per source (576 total) are insufficient**, since `L(576)=0.9948125773029356`. Equal allocation guards against hiding a missing or badly modeled opponent behind an easier overrepresented source; the bound is for **uniform-field mean**, not each matchup.

For a **simultaneous 95% lower bound on all 32 opponent-specific win rates**, use a simple Bonferroni one-sided family-wise error allocation `α_i=0.05/32`, giving `L_i(m)=(0.05/32)^(1/m)` after `m` all-win games for each source. At **m=1290 all wins per source**, `L_i(1290)=0.9950036335121679`; this means **41,280 zero-loss qualified games** for this especially strict but transparent sufficient gate. It is *not* a necessary number if alternative justified models, joint inference or informative loss data are used, and no game-count threshold can alone resolve game-model bias or future metagame drift.

## A proposed explicit primary estimand for this repository

**Proposed research choice, pending team critique:** Treat the prompt's target of a fixed sixty's **game win rate against all 32 Aichi Top32 lists** as the probability of **winning an untimed, complete ordinary paper Expanded game**, rather than its official tournament-stage match-win rate. Select one frozen exact 60 before confirmatory testing. Opponents' printed original 60s are fixed at the 2026 event. At each opponent, independently randomize first-player assignment with the native paper setup coin/choice mechanism (or pre-register an equivalent uniform seat probability); play one entire legally adjudicated game with fully information-safe frozen competitive policies. Count a legitimate outright paper victory as one success. Losses and ties count zero, and rejected, incomplete or time-unqualified games require separate failure accounting and a predeclared method for all attempts. The overall estimand is the **uniform arithmetic mean** of these 32 game-win probabilities, so the target is an all-source per-game win metric. A 99.5% uniform mean permits an isolated much worse matchup; publish all 32 matchup rates and uncertainty.

This specific **untimed choice is a proposal** to make “game win rate” mathematically defined. It is **not** presented as the official Aichi tournament success metric. The source event's official time regimes have since been verified in [Agent3's organizer-grounded event-clock study](agent3-aichi-open-official-clock-and-termination-20261103.md): Open Swiss has a 25-minute final turn and unresolved games produce **two losses**; the Top32 playoff uses 25-minute regulation and stage-specific Prize-threshold overtime until the final, and the final uses 35 minutes. Preserve Swiss and Top32 knockout performance as **separately pre-registered secondary estimands** using actual regulated elapsed time, terminal-turn handling, overtime and any tiebreaker, without translating a 260-action native cap into elapsed minutes. If the project wants the **Top32 knockout outcome** as its primary objective instead, explicitly freeze that choice *before* confirmatory games, rather than relabel results after observing them.

**Seat-balanced sufficient all-win evidence design:** Randomizing starting seat independently before each of the 19 source-specific trials makes the earlier **608 no-loss** field-mean guarantee applicable to each source's marginal win probability `p_i`. An alternative conservative **exactly balanced** design samples **10 independent games starting first and 10 starting second against each of 32 original sources**, yielding **640 games** across 64 distinct source-by-start-position cells. Let `p_{i,s}` be the actual win probability in that source/seat cell and `p_bar=(sum p_{i,s})/64`. For all successes the probability is `Π_{i,s} p_{i,s}^{10}`, bounded above by `p_bar^640` by AM–GM. The one-sided 95% lower bound for the equally weighted two-seat source mixture is then `0.05^(1/640)=0.9953301063421702`. Thus **640 all-win, legally qualified, fully independent, separately audited games in this 10-per-seat plan** would clear the mathematical uniform-field 99.5% lower-confidence threshold, subject to the extensive paper-model competence caveats above. This is a *sufficient theoretical gate*, not a forecast or a promise of results.

## Important preconditions and failure modes

- **Preselect the single unchanged 60-card deck** before the confirmatory games. Evaluating many candidates and picking one posthoc destroys the nominal confidence guarantee without held-out testing or multiplicity control.
- Freeze the complete **original Aichi source field, opponent decision policy, first-player/second-player allocation, physical deck legality and card effects, timing protocol, scoring rules and outcome adjudication**. Actual 25-minute paper Expanded tournament behavior and human competence cannot be replaced by the current unqualified native bot.
- Preserve **all independent attempts**, random seeds, actual physical source deals and starter seats, wins, losses, ties, aborted runs and uncompleted timeouts. Excluding failures posthoc invalidates the bound. For wins as binary successes, a tie or unqualified native game cannot silently be treated as a win.
- For a balanced field average, distinguish conditioning on a fixed 32-opponent reference population from claims about future opponents or a changing metagame. The uniform 1/32 weighting is one possible evaluation choice, and may differ from actual prevalence-weighted field performance.
- A nonzero observed loss requires using the complete exact-binomial distribution or an appropriately heterogeneous predeclared method, and could make the 99.5% lower confidence bound much harder to obtain. A good model-based estimate must explicitly state its model assumptions and validation set.
- If different source matchups are not independent (shared setup artifacts, bots, synchronized random seeds, adaptive policy updates), the numerical guarantee may not hold. Common random numbers can be useful for paired comparisons; those pairs are not independent confirmatory games.

The concrete implication for current research is that **mechanistic source competence, printed-card validation, attack/payment receipts, real opponent continuation and the tournament clock are the binding upstream tasks**. More unqualified engine winner counts do not advance toward either statistical claim. This statistical note establishes proof thresholds **conditional** on an eventual qualifying evaluation, and contributes **zero** competitive games itself.

## Reproduction arithmetic

The exact calculations can be reproduced with `ceil(log(0.05)/log(0.995))=598` for the i.i.d. all-win field-mixture gate and `ceil(log(0.05/32)/log(0.995))=1290` for each opponent under the simultaneous Bonferroni condition. The powers displayed above were checked with a numerical Python interpreter. The mathematical derivation uses the exact all-success binomial tail and AM–GM only, and does not assume anything about any particular Pokémon card or deck matchup.
