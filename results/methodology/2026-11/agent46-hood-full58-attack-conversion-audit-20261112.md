# Hood Shield v1: full-cohort attack-conversion audit (58 native games)

**Agent46, 12 November 2026.** Post-hoc descriptive analysis of the already completed 9 November all-29 native development artifact. No games were rerun and no candidate inventory was changed.

## Question

The six-game reversal audit found the old common policy repeatedly using Filch/Red Knuckles instead of converting Shadow Rider VMAX into Max Geist. Is that pattern confined to the six selected reversals, or does it characterize the completed Hood Shield v1 cohort?

## Evidence and method

- GitHub Actions run: [42578010606](https://github.com/FlareZ123/experiment-01/actions/runs/42578010606).
- Artifact: **13656062292**, `agent3-hood-vs-shadow-all29-native` (5.33 MB ZIP; 148,390,993-byte JSON).
- Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Registered comparison: 58 source groups / 116 game attempts; 29 published source 60s. Ranks **23, 25, 28** were explicitly missing.
- Candidate run: `hood-shield-v1`, 58 rows.
- The exact `candidatePolicy` string is identical for champion-reference and Hood Shield v1; `policyAudit.candidateIdentityUsedForDecisions=false`. The later Hood/Arven candidate-only policy was not installed in this experiment.
- Counts below use only `candidateAttackSettlement.attacks` (settled printed attacks), not attack proposals. Completed outcomes require `finished=true` and a non-null winner. The other rows are reported separately rather than silently discarded.

## Full-cohort result

| Hood v1 outcome | Games | Settled attacks | Max Geist | Filch | Red Knuckles | Games with Max Geist | Games with zero attacks | Mean first settled attack turn* |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Win | 31 | 215 | 50 | 16 | 19 | 16 / 31 | 0 / 31 | 9.7 |
| Loss | 13 | 63 | 1 | 36 | 20 | 1 / 13 | 5 / 13 | 2.9 |
| Action limit | 11 | 152 | 5 | 0 | 0 | 3 / 11 | 2 / 11 | 12.9 |
| Error / no terminal | 3 | 0 | 0 | 0 | 0 | 0 / 3 | 3 / 3 | — |

*Mean first settled attack turn is calculated only among games in that outcome group with at least one settled attack; it is not a tempo or strength estimate.

Two high-signal contrasts:

- **Max Geist appeared in 16/31 completed wins but only 1/13 completed losses.** The 13 losses produced 36 Filch and 20 Red Knuckles attacks; those two attacks account for **56/63 (88.9%)** of all settled attacks in losses. In wins, Filch plus Red Knuckles account for only **35/215 (16.3%)**.
- The losing games that did attack did so earlier: mean first attack turn **2.9** versus **9.7** in wins. This is a warning against optimizing for an early attack or draw action without valuing the attacker's actual prize/damage conversion. The early low-impact attack pattern is not evidence of better tempo.

The candidate had 31 wins and 13 losses among 44 completed games, with 11 action-limit rows and 3 errors. This is **not** a field win-rate estimate: all 58 games are development-only and zero are competitively paper-qualified.

## A concrete full-cohort failure: rank 19, candidate slot B

The candidate lost this completed game (`candidateSeat=1`, winner seat 0, turn 29):

- Mimikyu stayed Active and made **12 consecutive Filch attacks** on turns 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23 and 25.
- Public attack snapshots show a Benched Shadow Rider Calyrex VMAX with **3 Psychic Energy at turns 21 and 23**, then **4 at turn 25**.
- The first and only Max Geist came on **turn 27**: a direct, settled attack by the physical Shadow Rider VMAX with **5 Psychic Energy**. The attack's prize ledger changed from `[6,6]` to `[6,4]`, and the opponent's Active Raging Bolt ex was replaced by Latias ex, consistent with a two-Prize KO.
- A deck-sourced prompt at turn 27 recorded `sourceZoneCardCountBefore=0`; the game ended at turn 29 with `endReason=engine-game-end`. The final board still had the candidate at 4 Prizes and the opponent at 6. This is consistent with an empty-deck loss after repeated draw attacks, but the artifact does not expose a more specific terminal reason, so deck-out is not asserted as proven.

This is a high-value policy review target: the common policy spent 12 attacks on Filch before its only Max Geist conversion, despite the VMAX accumulating Energy on the Bench from turns 21–25. The final Max Geist did take two Prizes, but came immediately before the terminal sequence and did not prevent the loss. The public snapshots do not establish every retreat/switch option in hand at each earlier turn, so they do not prove exactly when an earlier Max Geist line was legally available. They do establish a very late conversion and repeated draw-attack pattern in a game that reached a zero-card deck prompt.

## Decision for candidate-policy work

Do not interpret this as a reason to cut or add a card. It is evidence that the old shared policy is not a competent evaluator of the Hood list's central attack engine. The next candidate role should:

1. Evaluate Shadow Rider VMAX setup as a complete line: evolve, attach/accelerate Psychic Energy, promote or switch when legal, and calculate Max Geist's damage from all Psychic Energy on the board.
2. Compare that line against Filch/Red Knuckles and Clefairy ex attacks using damage, prize map, active retreat/switch cost, and opponent board—not a generic preference for the first affordable attack or draw-two attack.
3. Penalize repeated draw attacks when deck size is low and the opponent's prize count remains untouched.
4. Keep Arven-to-Hood and Underworld Door protection as a distinct anti-lock layer; the old cohort never tests the later candidate-only Hood/Arven policy.

This should be integrated into the existing candidate-policy/role work, not another detached one-card or micro-helper experiment. Agent7's [six-game reversal audit](agent7-hood-field-reversal-attack-sequence-audit-20261112.md) remains the detailed matchup case study; this report extends its attack-pattern evidence to all 58 Hood rows.

## Limits

- The experiment covers 29/32 source ranks; ranks 23/25/28 are absent.
- The 11 action-limit rows and 3 errors are censored/nonterminal, not wins or losses.
- Both fixed lists used the same common policy; candidate identity was not used for decisions.
- The candidate-only Hood/Arven policy was not installed.
- The experiment's competitive qualification count is **zero**; its policy-information-set and paper-clock audits do not establish competitive paper games.
- These observations do not select Hood Shield v1, estimate real matchup strength, or support the 99.5% target.

## Reproduction

Download artifact 13656062292 from run 42578010606, then run:

```python
import collections, json, zipfile

with zipfile.ZipFile("agent3-hood-vs-shadow-all29-native.zip") as z:
    data = json.load(z.open("agent3-hood-vs-shadow-all29-native.json"))

run = next(x for x in data["actualNativeRuns"]
           if x["registeredCandidateIds"] == ["hood-shield-v1"])

def outcome(row):
    if row.get("finished") is True and row.get("winner") is not None:
        return "win" if row["winner"] == row["candidateSeat"] else "loss"
    if row.get("endReason") == "action-limit":
        return "action-limit"
    return "error"

summary = collections.defaultdict(collections.Counter)
for row in run["rows"]:
    group = summary[outcome(row)]
    attacks = row.get("candidateAttackSettlement", {}).get("attacks", [])
    counts = collections.Counter(a["attackName"] for a in attacks)
    group["games"] += 1
    group["settled_attacks"] += len(attacks)
    for name, count in counts.items():
        group[name] += count
    group["games_with_max_geist"] += counts["Max Geist"] > 0
    group["games_zero_attacks"] += not attacks
    turns = [a["turnBefore"] for a in attacks]
    if turns:
        group["first_attack_turn_sum"] += min(turns)
        group["first_attack_turn_n"] += 1

for group, counts in summary.items():
    mean_first = (counts["first_attack_turn_sum"] /
                  counts["first_attack_turn_n"]
                  if counts["first_attack_turn_n"] else None)
    print(group, dict(counts), "mean_first_attack_turn", mean_first)
```
