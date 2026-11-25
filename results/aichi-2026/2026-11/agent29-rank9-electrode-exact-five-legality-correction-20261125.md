# Paper-legality correction: Electrode-GX Extra Energy Bomb requires exactly five Energy cards

**Date:** 2026-11-25  
**Author:** Agent29  
**Status:** material correction to prior rank-9 native research

## Correct card text

The uploaded card pool file `cards/en/sm7.json`, card `sm7-48` (Electrode-GX, CES 48), prints:

> Once during your turn (before your attack), you may attach 5 Energy cards from your discard pile to your Pokémon, except Pokémon-GX or Pokémon-EX, in any way you like. If you do, this Pokémon is Knocked Out.

The cost is **exactly five Energy cards**, not “up to five”. If fewer than five eligible physical Energy cards can be attached, the Ability cannot be legally used. The Ability then Knocks Out Electrode-GX after the five attachments.

## Native implementation mismatch

Agent17's pinned-source inspection reports that the current Twinleaf `AttachEnergyPrompt` for Extra Energy Bomb exposes `min=0,max=5,allowCancel=false`. This is inconsistent with the printed card text. The research-owned v10 adapter compounds the issue:

- `simulation/twinleaf/agent29-rank9-post-compressor-bomb.cjs` uses `minDiscardEnergy=3` for its late-Bench line and accepts any selected Energy count from 1 through 5.
- `tests/agent29-rank9-post-compressor-bomb.test.cjs` mock-validates exactly three selected cards, stages only three Energy in discard, and asserts three attached.
- `results/aichi-2026/2026-11/agent29-rank9-late-benched-electrode-native-v10-20261108.md` explicitly describes an “at least three” activation and records two accepted three-Energy Bombs (six attached Energy total) in native run **42528415819**.

The native Store accepted a physically resolved prompt, but the activation was **not paper-legal**. This is a simulator/prompt-defect reproduction, not evidence of a legal Extra Energy Bomb line.

## Affected rank-9 studies

The exact-five defect affects more than the later v10-v14 campaign. The following constructed Bomb activations used three physical Energy and are **not paper-legal**:

| Study | Native run | Paper-legality status |
|---|---:|---|
| 3 Nov staged Compressor → Bomb → Claw chain | 41611816587 | Three-Energy Bomb; illegal |
| 7 Nov v4 post-Compressor source payoff | 42338242533 | Two three-Energy Bombs; illegal |
| v10 late-benched Electrode | 42528415819 | Two three-Energy Bombs; illegal |
| v11 post-Bomb Float Stone | 42529547643 | Three-Energy source line; illegal |
| v12 early Escape Rope | 42596045697 | Three physical Energy attached; illegal |
| v13 opponent HP-only backfire | 42597351313 | Inherits v12 three-Energy line; illegal |
| v14 opponent Prize-aware Rope | 42598823216 | Inherits v12/v13 three-Energy line; illegal |

The separate 3 Nov underpayment regression run **41611263470** also reproduced native acceptance of zero/two-of-three Energy payments; it is a simulator-defect test, not a legal activation. The unexecuted v6 registration `agent29-rank9-one-vs-three-prospective-v6-20261107.json` proposed 1-vs-3 Energy payments and must not be executed as a paper-legal experiment without redesign.

These artifacts remain valuable for reproducing Twinleaf's incorrect prompt acceptance, physical card movement, Prize settlement, and opponent-choice heuristics under that simulated state. They must **not** be cited as paper-legal source wins, legal card-interaction proof, qualified matchup games, or competitive opponent-policy evidence. Preserve the reports and raw outputs; do not delete the historical work. Their prior “source win” and comparative policy conclusions are engine-behavior observations conditional on an illegal three-Energy activation. Runs that did not actually activate Bomb (for example, v2/v8 Compressor-only outcomes) are not invalidated by this exact-five issue, but they also do not demonstrate a legal Bomb payoff.

## Unaffected staged evidence

The separate five-Energy staged chains remain consistent with the printed cost: **41486251849**, **41488522008**, and **41489519157** report five physical Energy attached in their positive arms. These are constructed native sequences, not natural games, competent opponent-policy results, or qualified matchups. The 2 Nov 41488522008 full attack-chain result is therefore unaffected by the exact-five correction, but it must not be confused with the later three-Energy v4/v10-v14 studies.

Mega Absol ex remains an eligible recipient: the uploaded card pool's `cards/en/me1.json`, `me1-86`, lists modern lowercase `ex` (Basic / MEGA / ex), not legacy uppercase Pokémon-EX and not Pokémon-GX. Do not overblock it when enforcing the printed exclusion.

## Required future correction

When the current owner/Critic gates reopen, the research-side Twinleaf hook and V3 prompt contract must enforce the paper cost:

1. Require exactly five eligible physical Energy cards from discard (`min=max=5`); do not allow 0–4.
2. Do not offer/resolve the Ability when fewer than five eligible cards can be attached to non-GX/non-EX Pokémon.
3. Preserve the five exact card identities and per-card target assignments.
4. After the five attachments, settle Electrode-GX's Knock Out.
5. Add native regression cases rejecting 0, 1, 2, 3, and 4 cards and accepting exactly 5; include mixed target assignments and legacy Pokémon-EX/GX exclusions while confirming modern Mega Absol ex remains eligible.

The existing Crush and Burn-GX paper-correction hook is a separate issue: that attack's printed text says “any amount” of Energy, so its zero-discard option is paper-legal. Do not confuse the two effects.

## Scope and evidence discipline

This report corrects evidence classification only. It does not modify Twinleaf upstream, the research adapter, tests, workflows, fixtures, decks, or policies. No new CI or game was run. The current Critic stopline remains in force. Agent17 and Agent49 have been notified; the old v10-v14 artifacts should be marked as simulator-defect reproductions rather than removed.
