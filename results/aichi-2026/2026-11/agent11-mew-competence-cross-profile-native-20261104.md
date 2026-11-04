# Agent 11: symmetric Mew competence changes native outcomes, while five of eight copied attacks remain empty (4 Nov 2026)

**Disposition:** Developmental retrospective source-policy stress, **zero competitively qualified games**. This is an independent analysis of two existing immutable native archives. No fixed candidate 60 is selected or ranked.

## Motivation and design

The original Aichi rank-5 Mew/Genesect source played zero attacks in the previous rank-5 vs rank-11 Mega Absol/Garbodor native retrospective, making native rank-11 terminals a weak opponent-competence metric. Agent11's default-off symmetric Mew capability enables natural evolution to Mew VMAX, special-energy usage, Genesect Fusion draw, and choosing copied Genesect V Techno Blast with Mew VMAX's Cross Fusion Strike in both physical seats. Existing known-dead attack selection and owner resource tutor were retained.

**Comparison:** Eight previously examined physical seeds 11312101–11312108, both rank-5 physical seats, control and owner-resource-tutor arms, 32 arms per policy. This is intentionally **retrospective**; seeds had been inspected in earlier runs, and the comparisons are neither prospectively selected nor independent tournament games.

- **Baseline:** [manual CI 41704310656](https://github.com/FlareZ123/experiment-01/actions/runs/41704310656), pinned research commit `2614e5a5fac0cb44a674792391eb1b5e31b24c9d`, artifact `13264188350`. ZIP SHA256 `0960023d63c2295902fc685a158bba8b3ddf1d6933ec32de417251d7f697b412`; extracted `agent11-owner-tutor-native-v2.json` SHA256 `c73786e611a7f74a78f4ee0de10f251119b94ab2ed55181f9ab38be706924c87`.
- **Symmetric Mew stress:** [manual CI 41706674107](https://github.com/FlareZ123/experiment-01/actions/runs/41706674107), pinned research commit `57d26e16873a92ddbd43b80f116aa19acb435481`, artifact `13265925365`. ZIP SHA256 `e523180e6a8fc5ef7a47e4a3798ebb594917152d717c0a365185f51d6b355ea7`; extracted JSON SHA256 `7b9433550dbdae33e77905b832f865c162c2ab9d97a8bce2ab8de560d3f4eda6`.
- Same pinned Twinleaf engine: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both runs: 32/32 observed, 0 engine errors, 8 native terminals, 24 action caps, 0 competitively qualified games.
- Independent cross-run join on (seed, rank-5 physical seat, mode) verified **32/32 identical `initialFullPhysicalDealDigest`**. Owner-resource-tutor receipt fields matched **32/32**, including accepted Item counts, physical target counts, selected families, accepted seats and individual accepted prompt examples. Across both versions the tutor accepted 17 Items and moved 34 physical targets. Root ledgers rightly diverged after policy intervention.

## Exact outcomes and attack payoffs

| Profile | Mode (16 arms each) | Rank-5 native wins | Rank-11 native wins | Action caps | Rank-5 attack declarations | Rank-5 cumulative Prizes |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Baseline known-dead + tutor option | Control | 0 | 3 | 13 | 0 | 0 |
| Baseline known-dead + tutor option | Tutor | 0 | 5 | 11 | 0 | 0 |
| Symmetric Mew capability added | Control | 1 | 3 | 12 | 5 | 5 |
| Symmetric Mew capability added | Tutor | 0 | 4 | 12 | 3 | 0 |

**All eight** rank-5 Cross Fusion Strike declarations had real, complete native attack-resolution traces. **Five** occurred with no Benched Genesect V and changed neither observed defender damage nor Prizes. The remaining **three** had a Benched Genesect V, all in **seed 11312103, rank5Seat=1, control**. They delivered (i) 210 damage onto Mega Absol ex, (ii) a subsequent 3-Prize KO of that Mega Absol ex, and (iii) a 2-Prize KO of Squawkabilly ex. Rank 5 became the native engine winner with 1 Prize remaining and the opposing board emptied. This is a settled original-source tactical response, a narrower result than general Mew/Genesect competence.

Two and only two arms changed their status/winner across policy profiles:

1. `11312103:rank5Seat1:control`: baseline action cap, no winner, [6,6] Prizes; symmetric-Mew profile **rank-5 native win** with [6,1] Prizes. In the same source deal, **tutor** produced a rank-11 native win with [0,6] Prizes (three genuine Items: two played by rank 11 and one by rank 5). This 1–1 contrast cannot be reported as a field win rate.
2. `11312108:rank5Seat1:resource-tutor`: baseline rank-11 native win [0,6]; symmetric-Mew profile action cap [1,6]. One rank-5 Cross Fusion Strike declaration occurred with no Benched Genesect V and zero observed payoff. A native policy perturbation can erase an apparent victory without producing an effective opposing attack.

The other 30/32 cross-profile arms retained their native status/winner. Note that all eight Cross Fusion declarations had Double Colorless Energy on Mew VMAX in the pre-attack snapshot; this is **not** a certification of every evolution, copy, legality, cost, or hidden-information decision under paper rules.

## Interpretation for the shared release

- Opponent competence is **game-state and payoff dependent**. Counting accepted AttackActions is insufficient. Five newly declared attacks were actual zero-payoff lines with no Benched Genesect V; a simple attack-count metric would incorrectly score them as equally capable.
- One fully settled copied-attack sequence changed an outcome on an identical physical deal, demonstrating that a single opponent continuation policy can invalidate earlier rank-11 winner interpretations. The second changed outcome was a terminal-to-cap regression.
- Tutor access by itself remains an experimental component. In the rank5Seat1/seed11312103 tutor arm, two source-rank11 Items and a source-rank5 Battle VIP Pass resolved, and rank 11 won natively; no matched trial establishes true causal improvement in tournament strength.
- **Release gate:** a prospective shared symmetric policy needs owner-information-safe source Trainer/attack choices, target and exact payment checks, paper-effect validation, realistic competing root selection, 25-minute match timing, and all 32 authenticated original opponents. This experiment covers neither those gates nor previously missing ranks 23, 25, 28.

## Reproduction

Download both linked immutable artifact ZIPs, verify their SHA256, and extract `agent11-owner-tutor-native-v2.json` from each to distinct paths. Run [the independent exact-archive audit](../../../scripts/agent11-mew-competence-archive-audit.cjs) on baseline JSON then Mew-profile JSON. The script checks original JSON digests, 32 physical deal matches, identical tutor receipt fields, attack settlement and prize consequences, 2 changed dispositions and all reported counts. Keep native terminals and caps separate. It is deliberately not a simulation of new games.
