# Candidate Shadow Rider policy: five-Energy cutoff is a matchup-sensitive DCI risk

**Date:** 2026-11-26  
**Status:** static policy-risk analysis; not an observed game error, matchup result, or deck-strength estimate.

## Question

Does the candidate worker's five-attached-Psychic-Energy threshold preserve enough Max Geist damage and rank hand/deck discards correctly for the frozen Hood Shield Shadow Rider v1 vs original rank-1 Shadow Rider diagnostic pair?

## Sources and method

- Registered candidate worker on main: `simulation/evaluation/2026-11/agent46-candidate-policy.cjs`, blob `59466565caa241558c3ed62a331c56228c30e3d1`.
- Candidate-policy PR #69 head at review time: `64d77d32c57e3c87517e1fc302ff97ca4fabd165`; its worker retains the same relevant five-Energy thresholds.
- Candidate test file: `tests/2026-11/agent46-candidate-policy.test.cjs`, blob `13372f75e5a600ea66094a6541bd6040f3297168`.
- Candidate fixed 60: `results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md` (11 Basic Psychic Energy).
- Rank-1 reference: `results/aichi-2026/benchmark-shadow-rider.md` (Shadow Rider champion list; 4 Shadow Rider VMAX and 3 Shadow Rider V).
- Exact card data: supplied card pool `cards/en/swsh6.json`, Shadow Rider Calyrex VMAX CRE 75 (320 HP; Max Geist: 10+30 per Psychic Energy attached to all of the player's Pokémon), and Dialga-GX UPR 100 / Mimikyu GRI 58.
- Strategy concepts: supplied `human_concepts.md`, especially DCI, matchup-dependent discardability, AMR, and connector domination.

I compared the actual candidate and rank-1 policy source paths and computed the Max Geist damage breakpoints directly from the printed attack text. No game was run.

## Findings

### 1. Five Energy is a hard candidate-policy preference, not merely a discard heuristic

The candidate worker uses the same threshold in several parts of its policy:

| Decision path | Candidate behavior at five attached Psychic Energy |
|---|---|
| Deck search, `searchNeedScore()` | Psychic Energy score falls from 45 to 5 (main lines 474–476; PR #69 lines 1248–1250) |
| Hand/deck discard, `discardValue()` | Psychic Energy value falls from 80 to 2 (main lines 515–517; PR #69 lines 1279–1285) |
| Underworld Door recipient selection | Shadow Rider VMAX loses its +700 target priority once total Psychic Energy reaches five (main line 689; PR #69 line 1568) |
| Manual Energy attachment | Shadow Rider VMAX is eligible for the high-priority attachment only while total Psychic Energy is below five and that VMAX has fewer than five (main lines 1042–1057; PR #69 lines 2128–2141) |

For hand-discard prompts, `searchCandidates()` negates `discardValue()`; lower discard value therefore makes a card more likely to be selected for discard.

The effect is not necessarily a strict five-Energy cap on every possible attachment route: the worker still has other recipient/attacker branches. It does, however, systematically deprioritize searching for Energy, makes it a leading discard target, removes the VMAX-specific Underworld Door priority, and blocks the high-priority manual VMAX attachment after five total Energy.

An internal consistency point strengthens the concern: the same candidate worker computes Max Geist attack damage using the full 10 + 30 × attached-Psychic-Energy formula (main lines 330–334; PR #69 lines 748–756), but its search/discard/attachment heuristics do not carry that marginal damage value beyond the five-Energy threshold. The worker therefore recognizes the full damage scaling when evaluating an attack while largely ignoring it when deciding whether to find, keep, or attach the Energy that creates that damage.

### 2. Five attached Energy is only 160 Max Geist damage

Max Geist counts Psychic Energy attached to all of the attacker's Pokémon, not only the Active attacker. With the printed formula:

| Psychic Energy attached | Max Geist damage | Against a fresh 320-HP VMAX |
|---:|---:|---|
| 5 | 160 | Two hits exactly; no room for healing or damage reduction |
| 6 | 190 | Two hits total 380 |
| 7 | 220 | Can one-hit a 210-HP Shadow Rider V |
| 8 | 250 | Two hits total 500 |
| 9 | 280 | Can one-hit a 280-HP target |
| 10 | 310 | Still 10 short of a fresh VMAX |
| 11 | 340 | Can one-hit a fresh 320-HP VMAX |

The candidate has eleven Basic Psychic Energy. Five is a plausible unhealed two-hit baseline (160 × 2 = 320), so this analysis does **not** establish that every game should search or attach all eleven. The risk is that the worker uses a global threshold without considering target HP/damage, healing, available attackers, or whether the next 30 damage crosses a KO breakpoint. In a Shadow Rider mirror, the rank-1 list includes Acerola, making the unhealed two-hit assumption strategically fragile.

### 3. The current discard ordering is also wrong for the mirror's matchup-specific tech

The candidate includes Dialga-GX UPR 100 and Mimikyu GRI 58 for the Regidrago counter-line: Mimikyu Copycat can copy the opponent's Apex Dragon, which can select Timeless-GX from the candidate's Dialga discard. That line is matchup-specific.

Dialga-GX UPR 100 has no Ability and all its printed attacks require Metal Energy. The candidate contains only Basic Psychic Energy, so Dialga is not a normal attacker in this list. Against the rank-1 Shadow Rider opponent, there is no Regidrago/Apex Dragon line. Mimikyu can still have Filch/Copycat utility and should be evaluated separately; Dialga is the clearer low-DCI singleton in this matchup.

At five attached Energy, current candidate-worker discard values are:

| Card | Discard value when opponent is not Regidrago |
|---|---:|
| Psychic Energy | 2 |
| Mimikyu | 30 |
| Dialga-GX | 35 |

Because the prompt chooser negates these values, it can discard core Max Geist Energy before the matchup-dead Dialga. This is inconsistent with the candidate worker's own search logic, which only prioritizes Dialga/Mimikyu when Regidrago is visible, and with matchup-dependent DCI.

The existing test `mandatory discard uses dead or excess resources before Regidrago core pieces` (test lines 351–378) uses a Regidrago opponent and explicitly preserves Dialga/Mimikyu for that counter-line. It does not validate the discard ranking for the selected Shadow Rider mirror. It also uses an Ultra Ball prompt, while the candidate's actual fixed 60 contains Quick Ball and Mysterious Treasure, not Ultra Ball.

### 4. The frozen rank-1 policy uses a different Energy target

The registered rank-1 worker blob is `1c8aef18c6ddd2b45f5aeaa2bf958169301e7dcd`. Its `scoreManualPsychicEnergy()` gives a Shadow Rider VMAX a positive attachment score while that **target** has fewer than six Psychic Energy (lines 338–368). It does not impose the candidate's same global five-Energy threshold.

This is a concrete policy asymmetry in the chosen pair. It is not proof that the rank-1 policy is generally stronger: separate rank-1 defects are already preserved for post-trace remediation in Agent42's and Agent35's handoffs.

## Recommended follow-up

Preserve the registered V3 deck, policy hashes, runner, seed, seats, and fixture unchanged for its owner-authorized baseline. Do not use this static analysis as permission to change the first diagnostic.

After the baseline trace and scope decision, make one narrow candidate-policy correction in the existing PR #69 scope:

1. Replace the arbitrary global five-Energy cutoff with a state-/matchup-aware Energy value that considers Max Geist breakpoints, visible target HP/damage, attacker availability, and recoverability.
2. In the Shadow Rider mirror, prefer discarding the matchup-dead Dialga-GX before Psychic Energy when the relevant Regidrago line is absent; assess Mimikyu separately because Filch/Copycat may retain value.
3. Add exact candidate-worker regressions for both deck-search and hand-discard decisions at five attached Energy against the rank-1 Shadow Rider list, including a target where the sixth/seventh Energy changes the damage breakpoint.
4. Keep the current Regidrago counter-line test as a positive control, so the fix does not discard Dialga/Mimikyu when they are genuinely needed.

Do not modify frozen PR #71, create a new policy PR, add a workflow, or update the decision board for this hypothesis alone.

## Limitations

- This is static code/card-text analysis plus arithmetic, not a played game.
- The five-Energy target may be a deliberate baseline for some states; the value of further Energy is state-dependent.
- No observed action trace, independent review, matchup sample, win-rate estimate, or confidence interval supports a claim that this heuristic has already caused a loss.
- The first registered V3 pair remains unmodified and no game was dispatched.

