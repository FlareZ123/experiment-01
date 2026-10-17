# Agent 1: rank-8 Hood Shield source attack and Garbotoxin exposure gate

**17 October 2026, invocation 217. Evidence class:** independent read-only
interpretation of an already compiled actual-source Store observation, plus new
pure positive/negative regression tests. **No newly qualified competitive game.**

## Immutable source and independent checks

- Frozen candidate: [Hood Shield v1](candidate-hood-shadow-rider.md),
  physical **B**, going **second**. Opponent: Aichi rank 8 Yusuke
  Kobayashi's exact 60-card Absol/Garbodor source, physical **A**.
- Fixed seed: `1260748957` under the previously registered
  `decorrelated-slots-v3` start-order selection.
- Agent 15's [existing source-run specification](hood-rank8-actual-second-source.md)
  and [source live-board observer](../../simulation/twinleaf/hood-rank8-source-board-audit.cjs).
  Existing [compiled CI 39054167292](https://github.com/FlareZ123/experiment-01/actions/runs/39054167292)
  **passed** three observer/control games with identical source root-dispatch
  action-input stream hash; exact JSON artifact
  [12108432893](https://github.com/FlareZ123/experiment-01/actions/runs/39054167292/artifacts/12108432893).
  The observed engine terminal was a Hood win, **20 turns, 214 actions**,
  with **0 Prizes remaining for Hood versus 6 for rank 8**.
- I independently parsed both compact JSON excerpts from that successful job's
  log, then checked the attack texts of **Mega Absol ex MEG 86** and
  **Dark Patch ASR 139** against the supplied English card database.
  The source's Energy cards in the relevant Active positions were only Basic
  Darkness and Lightning, allowing direct cost comparison.
- Reusable [pure gate](../../simulation/twinleaf/rank8-hood-lock-attack-gate.cjs)
  consumes this existing audit JSON and emits print-aware per-attack status.
  [Three executable tests](../../tests/rank8-hood-lock-attack-gate.test.cjs),
  including positive cases where the lock and printed attack **are** possible,
  pass locally **and in subsequent compiled CI**. It can consume the
  existing archived source JSON without changing an opponent decision
  or dispatching another match.

## Source chronology and rejection reasons

| Source event | Actual source-game observation | Implication |
| --- | --- | --- |
| Turn 4 | Hood attached to a Shadow Rider VMAX | Position observed; does not yet establish anti-Garbotoxin benefit |
| Turn 8 | Two Underworld Door uses with Hood on the player's Active; source opponent had not evolved Garbodor | **Zero actual equipped-Garbodor exposures** for the two Doors |
| Turn 9 | Source rank 8 evolves Garbodor; source-visible Garbodor has **zero Tools** | Its attached-Tool Garbotoxin condition is absent |
| Turns **9, 11, 13, 15** | Mega Absol ex declares **Terminal Period** while the Defending Active has **zero** damage counters each time | Its printed **exactly six damage counters** Knock Out condition is false in **4/4** attacks |
| Same four turns | Mega Absol ex carries **one Basic Darkness and one Basic Lightning** | Terminal Period's `Darkness + Colorless` cost is satisfied; **Claw of Darkness** requires `Darkness + Darkness + Colorless` and is **unpayable** in each of these source positions |
| All 17 detailed source event snapshots printed in CI | The source opponent's discard pile contains **zero Basic Darkness Energy**; the complete shown Garbodor positions have no Tool (19 documented before/after appearances) | **Dark Patch has no source Energy to attach** in these observed positions; absence of a Dark Patch play by itself is not evidence of a mistaken legal-action choice |

The source list contains four Dark Patch and four Float Stone. Garbodor
lacking an attached Tool, no source Darkness Energy in discard, and inability
to pay the Claw cost can follow from earlier development decisions and
resource contingencies. **This audit cannot determine whether a better
opponent line was accessible from the actual historical information set.**
The Terminal Period declarations were themselves Energy-payable; the
failure was the printed conditional KO effect. No claim of an illegal source
attack follows.

The opponent used a different attack, Venomous Fang, on turn 17, and
still took zero Prizes in the engine game. Neither the observed Door nor
the source engine victory tested the actual claim that Stealthy Hood
protects a Shadow Rider Ability against **an equipped Garbodor**.

## Gate status and next falsification

This is a **noncompetitive, source-locked negative qualification outcome**:

- The completed game establishes a genuine second-seat start and an exact
  source matchup with an unmodified root action trace.
- It fails the essential **attached-Tool Garbotoxin challenge**.
- It fails the **effective Terminal Period attack** challenge in all four
  declarations. The opponent also lacked the attached Energy to choose
  Claw of Darkness during those specific root actions.
- No positive Hood efficacy or competitive win-rate inference is justified.

Next, one source-ranked, **opponent-information-set-valid** counterfactual
should establish equipped Garbodor and the legal attached-Energy/discard
development for Mega Absol, then preserve the candidate's actual reply
and both policies' exact versioned choices. A staged lock fixture may
establish a rule interaction, but must remain distinct from an independently
dealt competitive game. Preserve failure cases such as unsearchable Float
Stone or inaccessible Darkness Energy rather than injecting resources as
though they were naturally drawn.

The central [single-deck decision board](../critic-review-70.md) remains
unchanged: **29/32 exact benchmark lists, zero qualified competitive games,
no demonstrated 99.5% win rate**.

## Independent compiled gate confirmation

A fresh [manual-only source workflow CI 39068772288](https://github.com/FlareZ123/experiment-01/actions/runs/39068772288),
research head `8d683b33a85ebf259a6b0103a662eb15beaf15b0`, **passed** on
17 October 2026. Its existing compiled source observer replayed the same
fixed seed with control/observer/control equality, and the new production
gate consumed the emitted `rank8-hood-board-audit.json` in the same job.
The new **three** positive/negative unit tests also passed on the pinned
engine workflow. [Artifact 12113939717](https://github.com/FlareZ123/experiment-01/actions/runs/39068772288/artifacts/12113939717)
contains both original source board audit and `rank8-hood-action-gate.json`.

Verified compiled gate values: `terminalPeriod.length=4`,
`terminalPeriodKnockoutConditionsMet=0`,
`terminalTurnsWithClawEnergy=0`,
`terminalTurnsWithDiscardDarknessForPatch=0`,
`observedUnderworldDoorCount=2`,
`protectedUnderworldDoorAgainstEquippedGarbodor=0`,
`equippedGarbodorObservedTurns=[]`, and
`qualifiedForCompetitiveInference=false`.
The replayed result remains an exploratory generic-bot game and **does not
qualify any competitive wins**.
