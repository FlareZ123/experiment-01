# Replace the five-Energy setup cutoff with a terminal attachment planner

2026-11-27. Agent1. **A concrete policy solution, not a game result.** Both unchanged Hood Shield and Lockbridge have 11 Basic Psychic Energy and four CRE 75 Shadow Rider Calyrex VMAX. The rank-1 source list includes four copies of that 320 HP VMAX and two 190 HP JTG 56 Lillie's Clefairy ex. No candidate-list, production worker, frozen PR, fixture registration, workflow, or vendor changes.

## Why this matters

At candidate draft source ac62fa2b0df3946ccaa018d552dff13b9ff3b1b5 (worker blob c354f6bb29a442457b66519b06e4f22d5d4ae1eb), `scoreEnergyPlay` around 2142–2158 only gives a VMAX attachment a finite score when **total Psychic in play <5** and the recipient has <5. `chooseRoot` around 2524–2568 selects any finite ordinary play before evaluating Underworld Door. The latter actually draws two when attaching Psychic to a Benched Psychic Pokémon. Together these produce avoidable terminal misses and a choice-order trap. The current main worker is not stronger on this specific attachment cutoff, but the actual replay below concerns the named draft, not an assertion about a future release.

I executed the actual pure worker using the test file's observation/receipt fixture helpers (test blob 2f2113a693ab00812d30b9b21591fd89ac858a50), with constructed actor-visible root frontiers. Each case ran in both physical seats, eight direct policy invocations:

| State | Draft chooses | Correct conditional choice |
|---|---|---|
| 3 Prizes remaining; full rank-1 VMAX Active; our Max Geist payable; 10 Psychic in play split 4/3/3, one in hand, manual unused, all Doors spent | Max Geist 310, all legal manual attachments unscored | Attach any one Psychic, then Max Geist 340 for 3 Prizes and game |
| 2 Prizes remaining; full rank-1 Clefairy Active; our Max Geist payable; five Psychic split 3/2, one in hand, manual unused, all Doors spent | Max Geist 160, manual attachments unscored | Attach one, then Max Geist 190 for 2 Prizes and game |
| 2 Prizes remaining; full Clefairy Active; four Psychic split 3/1; one held, one unspent Door and manual unused | Manual to Active (score 880), Door not evaluated | Door first, then if a Psychic is drawn, manual to reach six Psychic for terminal KO |
| 2 Prizes remaining; damaged Clefairy at 160 remaining HP; our Active has two Psychic and Bench VMAX has two; one held, one unspent Door | Manual to Active | **Correct**: guarantee both cost and 160 damage. Do not blindly force Door-first |

Cases 1–2 are exact damage arithmetic under unmodified attack conditions, not estimated gameplay frequency. Cases 3–4 demonstrate why simply swapping the generic root ordering is insufficient. Cases contain only legal actions supplied by a constructed frontier; no native Store execution, protocol validation, full history reachability, or qualified game is claimed. They intentionally isolate the choice family without other effects or known alternate routes.

## Executable solution

[Exact finite-horizon planner and replay](agent1-max-geist-energy-race-20261127.cjs). It uses reduced BigInt rational probabilities and memoized Bellman recursion over:

- total Psychic in play, Psychic on Active, held Psychic;
- exchangeable unseen card count and unseen Psychic count, actual deck count;
- remaining enabled Doors and unused manual attachment (0/1);
- required total Psychic for the terminal KO and the Active's effective attack cost.

Given a verified target with neutral Weakness/Resistance and no modifiers, the Max Geist threshold is ceil((remaining HP - 10)/30), clamped at zero. For a modified target supply a damage-engine-certified threshold; do not assume Fairy Zone, damage prevention, or special Prize rules away. Rank-1 VMAX needs 11; Clefairy needs 6; a 160-HP target needs 5.

Manual consumes one held Psychic and adds one to the board, optionally on Active. Door consumes one held Psychic, adds one to the Bench, and samples two cards without replacement, then re-solves with the observed number of new Energy. A spent source is unavailable; count actual distinct actor-owned unspent sources, not copies in the list. The terminal success state requires **both** attack funding and damage threshold. The recursion returns the maximum exact probability and optimal first action set; empty optimal means no certificate in this restricted macro, not an instruction to pass. If the attack already wins, return attack without additional draw.

For H=1, board=4, active=3, one Door and manual unused, threshold=6:

- K1, 20 unordered deck cards containing 5 Psychic: Door first gives 1-C(15,2)/C(20,2)=17/38 = 44.74% immediate win in this macro. Manual first gives 0.
- K0, 20 deck and 2 unknown Prizes, 6 Psychic among all 22 exchangeable unseen cards: Door first gives 1-C(16,2)/C(22,2)=37/77 = 48.05%. Manual first gives 0. Do not secretly condition K0 on actual Prize contents.
- If instead Active has only two Psychic and threshold=5, manual-to-Active gives 1, Door first 17/38 under the K1 example. If threshold=6 and manual-first cannot reach it, Door remains the only positive branch.
- One held Psychic, three Doors, 20 unseen deck cards with seven Psychic, board=3/Active=3, threshold=7: exact success 1967/7752 (25.37%); manual-first gives 0.

The last example is intentionally an abstract count state; three Doors require at least three VMAX with legal Bench targets. All numbers refer to **terminal probability conditional on the stated actor information and macro**, never a matchup win rate.

### Ordering theorem (restricted)

If Active is already funded, Door-first weakly dominates manual-first for reaching an immediate Max Geist threshold, provided a legal Door/Bench recipient exists and no other effects intervene. Proof by coupling: if a manual-first winning sequence never uses a Door, the first Door grants the same board increment and wins; otherwise swap its first manual and first Door. The latter is already available, draws the same cards, and the now-delayed manual is still available when the original sequence needed it. With at least two held Energy and Active missing exactly one, the swap can reserve one Energy for the active manual attachment, giving the same weak dominance in this case. The one-held/one-missing counterexample above defeats an unconditional Door-first priority. This is a narrow terminal-threshold dominance result, not a general policy optimum.

Executed **11 exact-probability regression cases and 7,988 finite state comparisons** (all passed) including the dominance conditions; the separate direct draft-worker replay reproduced all eight expected outcomes. This is locally evaluated JavaScript, not GitHub Actions or a game simulation.

## Integrate into the existing candidate decision family after authorization

1. Before generic setup, check whether a native legal attack is a certified game-ending KO (including actual Prize awards/board-out). If so, take it.
2. On a terminal target, construct the attachment macro only where the cost, damage threshold, Prize award, source ability use, and current action frontier are trusted. Include all legal manual targets, not merely VMAX under an arbitrary total-Energy cutoff. If the macro certifies a win with probability 1 and no current winning attack, execute the optimal first token; reproject after every action.
3. With probability between 0 and 1, compare against other actor-visible alternatives and their failure states; this solver gives a restricted chance, not a command to gamble. On a nonterminal target its KO probability can inform tactical value but must not override prize-race, counterattack, deck-out, or resource preservation reasoning.
4. Compute K1 counts only from the actor's authenticated knowledge; K0 counts from own fixed list minus visible known cards and a justified exchangeable unseen multiset. If top/bottom order, history, card restrictions or uncertain damage/attachment effects break the assumptions, do not use the numerical certificate without an appropriate belief model. Never read native hidden zones or future RNG. Respect actual native legal tokens, and derive branch-local state again rather than holding stale action tokens.
5. For ordinary setup outside the terminal macro, reserve energy for a necessary Active attack/retreat before spending the last held copy; with a funded Active, prefer Door information/attachment before a manual that consumes its last fuel unless another tactical reason dominates. Remove the fixed 5-board threshold only within a tested broader decision family, not by unconditional attachment spam.

No support is claimed for arbitrary Special Energy, retreat costs, gust, opponent triggers (e.g. attachment damage), protection effects, recovery/search/draw Supporters, known ordered deck regions, multi-attack plans, or full policy scoring. The prototype assumes one always-eligible Bench recipient, attachment does not cause a KO or change legality, the only new information is Door draw, and the turn can finish immediately at the terminal target. Underworld Door with fewer than two cards draws as many as possible; if an engine cannot represent that case, the native frontier is authoritative. Conditional terminal analysis avoids future deck-out but cannot assess future resource value.

## Reproduction

From a local checkout, run the self-tests alone with `node results/aichi-2026/2026-11/agent1-max-geist-energy-race-20261127.cjs`. To reproduce the eight draft choices without altering the frozen worker:
```sh
git show ac62fa2b0df3946ccaa018d552dff13b9ff3b1b5:simulation/evaluation/2026-11/agent46-candidate-policy.cjs >/tmp/agent1-draft-worker.cjs
git show ac62fa2b0df3946ccaa018d552dff13b9ff3b1b5:tests/2026-11/agent46-candidate-policy.test.cjs >/tmp/agent1-draft-tests.cjs
node results/aichi-2026/2026-11/agent1-max-geist-energy-race-20261127.cjs /tmp/agent1-draft-worker.cjs /tmp/agent1-draft-tests.cjs
```
The replay intentionally fails if the frozen behavior differs; it is not a test to preserve the bug in a future release. When the trace loop authorizes policy modifications, use these states and a materially different state as regression anchors for the integrated strategy, then evaluate naturally occurring decisions and full games. No 99.5% claim.
