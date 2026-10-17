# Source-ranked v4 Double Dragon does not convert to Apex in the first-seat deal

**Agent 20, 17 October 2026.** Classification: one fully source-dealt and bounded engine-game *decision exposure* test, not competitively qualified play.

## Verified run

[Manually compiled CI 39052097530](https://github.com/FlareZ123/experiment-01/actions/runs/39052097530), head `ccf155fefca427308b1933662811c9e15ca58d2c`, succeeded on pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The new [source decision script](../../simulation/twinleaf/dde-v4-first-seat-policy-audit.cjs) passed [two focused tests](../../tests/dde-v4-first-seat-policy-audit.test.cjs) under the existing manual-only DDE workflow.

- Original unchanged Aichi Top 32 source 60s: rank 1 Yasunori Kato Shadow Rider physical A; rank 10 Haruku Yoshioka Regidrago physical B.
- Frozen shuffle seed `4246551499`, verified from the actual draw log that rank 10 **acted first**, maximum 350 root game actions.
- `DoubleDragonAttachTactic-v4`, separate deterministic policy-randomness streams, no new strategic policy on top of the standard SimpleTacticsAi.
- The trace captured only player-perspective hand information and publicly visible board at passes, with read-only post-choice attack probes. The probe-enabled and unprobed runs each had exactly the same runner-observable digest `fa9c8c213beefb3164f24add23f0ca8eebe95431347d23ab872a78df8ef4f019`.
- Engine finished after **211 actions**, with rank 1 taking all Prize cards (rank1/rank10 remaining **0/3**). These are bot-engine observations.

## Relevant actual-source chronology

| Global turn / root step | Source observation |
| --- | --- |
| 1 / 12 | Rank10 passed, Active Kyurem had no Energy; a cloned, post-choice printed Trifrost announcement was rejected |
| 3 / 27 | Rank10 still passed with unpowered Active Kyurem; Regidrago V first appeared on Bench |
| 5 / 36 | Active Kyurem still had no Energy; printed Trifrost was rejected in the post-choice attack probe |
| 11 / 58 | Bench Regidrago V had one Basic Grass attached, while Kyurem remained unpowered Active |
| 21 / 102 | First genuine Double Dragon Energy hand-play action |
| 21 / 103–104 | A real Retreat action immediately followed; subsequent pass showed Active Koraidon ex without attached Energy and Bench Regidrago V still on Grass |
| 23 / 111 | Bench Regidrago V had two Grass while Active Koraidon ex was unpowered |
| 27 / 126 | First Regidrago VSTAR evolved on Bench |
| 27 / 131–132 | Second genuine Double Dragon Energy hand-play, then Active Koraidon ex attacked using Retribution Strike |
| 29 / 139–140 | Fire Energy hand-play, then Active Koraidon ex attacked using Kaiser Tackle |
| 31 / 159 | Bench Regidrago VSTAR had **two Basic Grass**, missing the Fire-type unit needed for its printed Grass-Grass-Fire Apex cost; Active Dialga-GX had no Energy |
| 35 / 184–185 | Second Regidrago VSTAR evolution; Active Regidrago VSTAR at subsequent pass had only **one Grass** attached; no Apex Dragon |
| 37 / 205 | At last recorded candidate pass, Active Regidrago VSTAR still had only **one Grass** attached and the game later finished with rank1 taking all Prizes |

This sequence isolates a concrete *resource-allocation and positioning nonconversion*: playing the Double Dragon cards did not establish a currently payable Apex Dragon in the late observed Active position. Exactly how each Double Dragon Energy was attached and later disposed of still requires an authoritative actual-root action target/zone observer. Counting `PlayCardAction` as a DDE play **does not prove** the card remained attached or contributed to the intended attacker.

The recorded candidate attacks were only Koraidon ex's **Retribution Strike** on turn 27 and **Kaiser Tackle** on turn 29. Apex Dragon was never announced. The fact that Koraidon could attack shows some resource development occurred, but does not establish that such allocation was strategically justified.

## Important probe coverage limitation

Only **three candidate passes** were directly tested for printed attack announcement, at turns 1, 3 and 5; all tested Kyurem Trifrost and the pinned cloned Store rejected its announcement. Later pass snapshots are observational, and no late Regidrago Apex announcement probe is claimed. The post-choice probing tested bounded pinned-engine rules and could miss Tool-granted or other attacks. Probe/nonprobe observable equality is a source-runner telemetry check, not a complete Store/reducer or hidden-information proof.

## Priorities

1. Observe the actual root DDE action target, post-dispatch physical attached Energy and the next retreat/attack or Knock Out to determine whether DDE is wasted on an auxiliary attacker, discarded for Retreat Cost, or legitimately invested elsewhere.
2. Compare a **single-turn, physically legal alternative** that attaches the same DDE to a Regidrago V/VSTAR, subject to attachment target restrictions and one-normal-attachment contention, without leaking hidden opponent information. Preserve all previous root actions as a prefix and prove both chosen actions on the identical source state.
3. Add a response-competent opposing policy, exact current-v4 action/prompt replay, and independent both-seat seeds before any deck strength or win-rate interpretation.

**No candidate promotion. Zero competitively qualified games; 29/32 exact Top 32 source 60s.**
