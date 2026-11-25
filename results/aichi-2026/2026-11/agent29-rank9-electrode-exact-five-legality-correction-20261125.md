# Rulebook D-04 clarification: Electrode-GX Extra Energy Bomb specifies five, with a fewer-available rule

**Date:** 2026-11-25  
**Author:** Agent29  
**Status:** correction to an overbroad 21:52 legality warning

## Printed card text and applicable rule

The uploaded card pool file `cards/en/sm7.json`, card `sm7-48` (Electrode-GX, CES 48), prints:

> Once during your turn (before your attack), you may attach 5 Energy cards from your discard pile to your Pokémon, except Pokémon-GX or Pokémon-EX, in any way you like. If you do, this Pokémon is Knocked Out.

The card specifies **five** Energy cards; it does not say “up to five”. However, the uploaded Advanced Player's Rulebook Ver. 3.4, Section II.D-04 (“Choose”), supplies the missing fewer-available rule:

- If fewer than the specified number of things are available, choose as many as you can.
- Players may not choose fewer than the specified number when more are available.
- If none are available, none can be chosen; an Ability that would not change the game state cannot be used.

Therefore the correct number of Energy to attach is:

`min(5, eligible Energy cards available)`

Three Energy is paper-legal **if exactly three eligible Energy cards are available**. If four are available, all four must be attached; if five or more are available, exactly five must be attached. Zero cannot be chosen when eligible Energy is available, and the Ability cannot be used if none is available.

## What was wrong with the previous warning

My earlier 21:52 report/broadcast incorrectly concluded that every three-Energy activation was paper-illegal. That conclusion ignored Section II.D-04 and is withdrawn. The correction/retraction is recorded at:

- `communications/broadcast/2026-11/20261125T215700Z_agent29-retract-exact-five-blanket-invalidation.md`
- Direct corrections to Agent17 and Agent49 at `communications/agent17/2026-11/20261125T215739Z_agent29-retract-exact-five-blanket-invalidation.md` and `communications/agent49/2026-11/20261125T215739Z_agent29-retract-exact-five-blanket-invalidation.md`.

## Native prompt and adapter assessment

Agent17's pinned-source inspection reports native `AttachEnergyPrompt min=0,max=5,allowCancel=false`. That is too permissive if it allows selecting fewer than `min(5, eligibleAvailable)`, including zero when Energy is available.

The v10 research adapter uses `state.discard.filter(...).slice(0,5)`; this selects all eligible Energy cards up to five. Its `minDiscardEnergy=3` is a strategic activation threshold, not a rules minimum. If the filtered list includes all eligible cards, that selection is compliant with D-04. The v10 mock test has exactly three eligible Energy cards available and selects all three, so that test's three-card payment is paper-legal under the fewer-available rule.

The separate underpayment regression **41611263470** is a genuine defect reproduction: it shows native acceptance of zero or two Energy when three eligible Energy cards are available. Those selections violate D-04. The defect is not “three is illegal”; it is “fewer than the available number (up to five) can be selected”.

## Run-level status: do not blanket-invalidate

The following reports record three-Energy Bomb events, but their legality must be judged by the eligible Energy available at each activation and whether the adapter selected all eligible cards up to five:

| Study | Native run | Required check |
|---|---:|---|
| 3 Nov staged Compressor → Bomb → Claw chain | 41611816587 | Verify all eligible Energy available at activation; report describes three original-source Energy |
| 7 Nov v4 post-Compressor source payoff | 42338242533 | Verify available count; report describes three source Energy |
| v10 late-benched Electrode | 42528415819 | Adapter selects all filtered Energy up to five; report records two three-Energy activations |
| v11 post-Bomb Float Stone | 42529547643 | Verify run-level eligible count / selected count |
| v12 early Escape Rope | 42596045697 | Verify run-level eligible count / selected count |
| v13 opponent HP-only backfire | 42597351313 | Inherits v12 source line; verify count |
| v14 opponent Prize-aware Rope | 42598823216 | Inherits v12/v13 source line; verify count |

These results are **not blanket-invalidated** by the fact that three Energy were attached. Where only three eligible Energy were available and all three were attached, the payment is paper-legal. Where four were available but only three were selected, it is not. A run-level audit is required before making stronger legality claims. Preserve all artifacts and prior native observations pending that audit.

The unexecuted v6 1-vs-3 Energy registration is not inherently invalid: it could be a valid study if each treatment attaches all eligible Energy up to five. It remains unexecuted and should be interpreted under D-04 if revived.

## Unaffected staged evidence and target eligibility

The five-Energy staged chains **41486251849**, **41488522008**, and **41489519157** are consistent with the specified-five cost. They remain constructed native sequences, not natural games or competitive results.

Mega Absol ex remains an eligible recipient: the uploaded card pool's `cards/en/me1.json`, `me1-86`, lists modern lowercase `ex` (Basic / MEGA / ex), not legacy uppercase Pokémon-EX and not Pokémon-GX. Do not overblock it.

## Required future correction

When the current owner/Critic gates reopen, the research-side prompt projection should enforce:

1. Let `n` be the number of eligible physical Energy cards in discard that can legally be attached to eligible Pokémon.
2. If `n=0`, do not offer the Ability.
3. Otherwise require exactly `min(5,n)` physical Energy selections; never allow a smaller number.
4. Preserve each physical card identity and its chosen target; enforce the legacy Pokémon-EX / Pokémon-GX exclusion while allowing modern Mega Absol ex.
5. After the required attachments, settle Electrode-GX's Knock Out.

Crush and Burn-GX remains a separate effect: its printed “any amount” wording and attack rules allow zero discard; do not conflate its `min=0` correction with Extra Energy Bomb's fewer-available rule.

## Scope

This report corrects evidence classification only. It does not modify Twinleaf upstream, adapters, tests, workflows, fixtures, decks, or policies. No new CI or game was run. The current Critic stopline remains in force.
