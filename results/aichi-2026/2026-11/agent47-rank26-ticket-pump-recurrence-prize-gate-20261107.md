# Original rank26 first-turn Meloetta: Damage Pump recurrence Prize obstruction

**Agent47 | 7 November 2026 | exact Basic-valid-hand-conditioned finite-population proof | zero competitive games**

## Why the third Damage Pump activation matters

The unchanged original Aichi rank26 [60-card inventory](../full-decklists.json) contains **four Damage Pump (LOR 156)**, **one Dowsing Machine (PLS 128)**, **one Redeemable Ticket (JTG 156)**, two Exeggcute (PLF 4), and four Risky Ruins (MEG 127). The supplied card corpus gives the relevant printed effects:

* Risky Ruins places two 10-damage counters on a Basic non-Darkness Pokémon Benched during a player's turn. Exeggcute has 30 HP, so entering play alone does not Knock it Out.
* Damage Pump moves **up to two** existing damage counters from one of your Pokémon to your other Pokémon. Each previously undamaged Exeggcute entering via Risky Ruins needs at least one further damage counter to be Knocked Out.
* Exeggcute's Propagation may recover it from discard for reuse. Unown AOR 30's Farewell Letter discards itself and **explicitly does not count as a Knock Out**.
* Technical Machine: Crisis Punch (PAF 90) can attack only when the opponent has **exactly one Prize card remaining**. From six starting Prizes, the original first-player self-KO route must give the opponent five Prizes before the attack. Against original all-Iron-Thorns ranks 6/24/29, the prepared [source-conserved continuous native witness](../agent47-rank26-unownless-single-lightning-full-chain-native-20261103.md) supplies five 1-Prize Exeggcute Knock Outs with **three paid Damage Pumps**, including two simultaneous self-KOs from each of the first two Pump activations and a fifth from the third.
* Dowsing Machine can recover a Trainer card already in the discard pile, at the cost of discarding two cards, but can be used only once as the deck's ACE SPEC. Redeemable Ticket moves the current Prize set to the bottom of the deck and replaces it; when Ticket is itself Prized, this reset route is unavailable. Neither the two Hisuian Heavy Balls nor the deck's other printed Trainers can directly recover a Prized Damage Pump.

The argument here is an **access impossibility for this exact source-first turn-one Crisis line**, assuming no previously modified board, no opponent-provided Prize acceleration, and only the printed original 60. At most two Pump activations can add a damage counter to at most four freshly Risky-Ruins-damaged Exeggcute entries, whereas the Prize requirement is five. The original has no demonstrated different first-turn damage-counter source or alternative self-KO mechanism that would bypass this bottleneck. If one is identified, reassess the strategic impossibility interpretation while preserving the card-location probability.

## New sufficient obstruction G

Label the four physical Pump copies P1–P4, the Ticket T, and Dowsing Machine W. Let P be the number of Pump copies in the source's six Prizes.

**G = {T Prized AND [P >= 3 OR (P >= 2 AND W Prized)]}.**

When P>=3, at most one real Pump copy is outside Prizes; even a playable Dowsing Machine can increase that to only two activations. When P>=2 and Dowsing is also Prized, only two Pump copies can be activated. A Prized Ticket removes the original's reset route to those cards before the required first-turn attack. G is sufficient to deny the specified first-turn attack sequence against a live original Iron Thorns ex. G alone does not mean the game is lost.

## Exact model and overlap with existing Prize obstruction

The existing obstruction [F](../agent47-rank26-ticket-prize-obstruction-exact-20261105.md) is

`F = {T Prized AND [Cologne Prized OR DCE Prized OR both Basic Lightning Prized]}`.

All ten distinguished physical cards for F and G (T,C,D,L1,L2,P1–P4,W) are **non-Basic**. Original rank26 has 12 Basic and 48 non-Basic copies; a Basic-valid opening seven is required before setting the six Prizes.

For `k=2..6`, define the exact conditional chance `q_k` that *k specified distinct non-Basics* are among the six Prizes:

```text
q_k = [C(60-k,7) - C(48-k,7)] C(53-k,6-k)
      / {[C(60,7)-C(48,7)] C(53,6)}.
```

By inclusion-exclusion over physical Pumps, **P(G | valid opening seven) = 10q4 - 15q5 + 6q6**, giving the exact rational `246645247/821428536390 = 0.0300263791764%`. The previous exact F probability is `2564127669643/149499993622980 = 1.71513563814%`.

F and G overlap. A direct independent enumeration of all **1,024 marked Prize patterns**, completed by the twelve Basics and 38 other non-Basics, yields:

| Event conditional on source valid opening seven | Probability |
| --- | ---: |
| Earlier F | 1.715135638% |
| New G | 0.030026379% |
| G outside F (novel trapped resources) | **0.027805479%** |
| **F or G** | **1.742941117%** |

The exact new union probability is **`93060602099/5339285486535`**, so the necessary *Prize-only* upper bound on this original first-player turn-one Crisis Punch win against the three Iron Thorns-only originals improves to **98.257058883%**, before any search, sequencing, Stadium, damage, Bench or opponent-policy failures.

For the previously specified [defensive bench-all, accept-all-mulligan-bonus setup policy](../agent47-rank26-bilateral-bench-all-firstturn-cap-20261105.md), the four-Basic Iron Thorns originals finish with one Basic with probability `S4=0.8367357777206609`. The source final valid seven and its subsequent Prize permutation are independent of this opposing setup statistic under the paired-mulligan process. The **joint necessary upper bound** is therefore

```text
S4 * [1 - P(F or G | source valid seven)]
= 0.8221519658100914
= 82.215196581%.
```

The earlier 82.238462420% bound remains correct as a weaker bound. This new value tightens it by **0.023265839 percentage points**. It is a ceiling on an immediate first-turn win against a specified setup policy, not a claim about any first-turn success rate, eventual match win rate, optimal gameplay, or the project’s proposed fixed deck.

## Reproducer and evidence status

[Single runnable CJS exact enumerator and assertions](../../../scripts/agent47-rank26-prize-pump-obstruction.cjs) checks the 1,024-pattern count and valid-seven normalization, independent `q_k` inclusion-exclusion identities, the earlier F rational, the new G rational, the F∪G rational, and the bench-all reduction. The committed file blob `fa049119824e9da0bb9ec4d34316918fc289384a` was fetched back from GitHub and its **exact JavaScript source executed in V8 with a minimal Node assert shim: all assertions passed**, producing the five displayed percentages. This is direct exact-code execution, **not a native Node 22 workflow run or a Twinleaf match**. The same arithmetic was independently computed with Python exact fractions.

No card pool, existing candidate 60, shared policy, CI workflow, vendor code, result index, or match classification has been changed. The standing benchmark remains **29/32 authenticated original name/count lists; missing 23,25,28; zero competitively qualified games; no selected final 60; no demonstrated 99.5% win rate.**
