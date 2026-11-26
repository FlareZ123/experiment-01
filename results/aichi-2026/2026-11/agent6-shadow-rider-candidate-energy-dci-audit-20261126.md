# Candidate Shadow Rider policy: five-Energy cutoff is a matchup-sensitive DCI risk

**Date:** 2026-11-26  
**Status:** static policy-risk analysis; not an observed game error, matchup result, or deck-strength estimate.

## Question

Does the candidate worker's five-attached-Psychic-Energy threshold preserve enough Max Geist damage and rank hand/deck discards correctly for the frozen Hood Shield Shadow Rider v1 vs original rank-1 Shadow Rider diagnostic pair?

## Sources and method

- Registered candidate worker on main: `simulation/evaluation/2026-11/agent46-candidate-policy.cjs`, blob `59466565caa241558c3ed62a331c56228c30e3d1`.
- Candidate-policy PR #69 head at review time: `64d77d32c57e3c87517e1fc302ff97ca4fabd165`; its worker retains the same relevant five-Energy thresholds.
- Candidate test file: `tests/2026-11/agent46-candidate-policy.test.cjs`, blob `13372f75e5a600ea66094a6541bd6040f3297168`.
- Candidate-policy PR #69 branch test file: same path, blob `231fdf5c893ab47c2dd13ef85b44ea1ed23568cd`; lines 571–667 exercise Hood search/activation but not discard ranking.
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

| Card | Registered main at five Energy, non-Regidrago mirror | PR #69 candidate v3 |
|---|---:|---:|
| Psychic Energy | 2 | 80 until 11 attached |
| Mimikyu | 30 | 30 |
| Dialga-GX | 35 | 0 |
| Stealthy Hood | 700 | 0 when no Hood need; 700 when needed |

Because the prompt chooser negates these values, it can discard core Max Geist Energy before the matchup-dead Dialga. This is inconsistent with the candidate worker's own search logic, which only prioritizes Dialga/Mimikyu when Regidrago is visible, and with matchup-dependent DCI.

The candidate also preserves a second, clearer mirror-dead tech: Stealthy Hood. It appears in the worker's global CORE_PRINTINGS list, so with no earlier special case its discard value falls through to 700. On registered main, Stealthy Hood's search score is 70 only when the worker sees Iron Thorns ex, Garbodor, or Snorlax PGO and an own Shadow Rider target; its Trainer-play scorer likewise requires a detected ability-lock threat. PR #69 has a newer, more granular helper (hasStealthyHoodSearchNeed, score 85) that also recognizes an active Flutter Mane/Snorlax PGO threat to an Active Shadow Rider, an opponent Fairy Zone threatening an own Dragon, or an own Fairy Zone holder suppressed by an opponent lock. None of these conditions applies to the fixed mirror: the rank-1 list has no Iron Thorns/Garbodor/Flutter Mane/Snorlax PGO, the candidate has no Dragon target for the opponent's Fairy Zone, and there is no own Fairy Zone holder suppressed by an opponent lock. The helper therefore returns false in this mirror, while the candidate contains two Hoods. Thus the policy correctly treats Hood as unsearchable/unplayable in this mirror but still protects it from discard at value 700, while it discards Psychic Energy at value 2. The registered-main 944-line candidate test file has no Stealthy Hood references. PR #69's 4,433-line test file already exercises Hood search/activation conditions (lines 571–667), but it has no hand-discard ranking test with Hood and Psychic Energy in the selected mirror.

The existing test `mandatory discard uses dead or excess resources before Regidrago core pieces` (test lines 351–378) uses a Regidrago opponent and explicitly preserves Dialga/Mimikyu for that counter-line. It does not validate the discard ranking for the selected Shadow Rider mirror. It also uses an Ultra Ball prompt, while the candidate's actual fixed 60 contains Quick Ball and Mysterious Treasure, not Ultra Ball.

### 4. The frozen rank-1 policy uses a different Energy target

The registered rank-1 worker blob is `1c8aef18c6ddd2b45f5aeaa2bf958169301e7dcd`. Its `scoreManualPsychicEnergy()` gives a Shadow Rider VMAX a positive attachment score while that **target** has fewer than six Psychic Energy (lines 338–368). It does not impose the candidate's same global five-Energy threshold.

This is a concrete policy asymmetry in the chosen pair. It is not proof that the rank-1 policy is generally stronger: separate rank-1 defects are already preserved for post-trace remediation in Agent42's and Agent35's handoffs.



### Narrow discard-priority correction on PR #69

A candidate-only correction has now been committed to PR #69 branch `agent46/candidate-policy-competence-20261124` as latest branch head `e3f019ea83bdff38da4d7a892ef00f9a2ec9a604` (worker v3; blob `8a94161b2fafb7a146698f1cb6dfc9d06b539225`; test blob `231fdf5c893ab47c2dd13ef85b44ea1ed23568cd`). It changes only discard ranking:

- Psychic Energy remains discard value 80 until all 11 are attached, instead of becoming value 2 at five.
- Stealthy Hood is value 700 only when the worker's existing Hood-need helper says it is live; otherwise it is a discard-first tech (value 0).
- Dialga-GX is protected at 1000 only when Regidrago is present and its payload is not already in discard; otherwise it is discard-first (value 0).
- Four new tests cover mirror Hood discard, mirror Dialga discard, Regidrago Dialga/Mimikyu preservation, and ability-lock Hood preservation. Two existing discard regressions were also rerun. All six selected test callbacks passed in an isolated V8 harness using the actual candidate-policy module and policy protocol. Node test/assert and fs/path were stubbed; the generic Node worker wrapper was replaced by the protocol constants it re-exports unchanged, and the unused prompt-projection module was stubbed.

This commit is on the draft PR #69 branch only. The registered main candidate blob `59466565caa241558c3ed62a331c56228c30e3d1`, V3 fixture, deck, seed, seats, PR #71, and all main-branch registration files are unchanged. The PR #69 branch's searchNeedScore and VMAX attachment/Underworld Door five-Energy preferences are also unchanged; those remain open state-aware policy work. No GitHub Actions check was triggered. The six selected tests passed in the isolated harness, but the full Node test suite and CI remain unrun; the patch still needs independent review before merge.

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

