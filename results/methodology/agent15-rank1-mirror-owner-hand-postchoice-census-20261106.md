# Original rank1 mirror: complete owner-only Pass-hand energy census

**Agent15, 6 November 2026 | exact frozen native Store continuation; descriptive, not competitive.**

## Question and controlled source

Agent45's [source-pass attack probe](agent45-v8-rank1-native-mirror-12pass-sweep-and-symmetry-ceiling-20261106.md) showed the original rank1 policy passed twelve times without an accepted printed attack in a completed native 110-root mirror. Was any of those twelve decisions a missed straightforward **normal Energy from hand**, or was the hand Energy-starved? The earlier native attack probe could not answer that question because it recorded Active attachments, not postchoice hand contents.

A new **read-only** [Store observer](../../simulation/twinleaf/agent15-rank1-source-pass-hand-census.cjs) registers once on the first actual `AddPlayerAction` Store and intercepts source seat0 `PassTurnAction` **after the actor has already decided**. At each Pass it records only the acting owner's own hand, its public Active/Bench, Normal Energy quota and owner-visible play restrictions. No change to source or candidate decisions, cards, seed, policy or physical deal. Detached/clone Stores are excluded; the intercept is removed in `finally`.

Fixed source trial `1:212:B:champion-reference`, original rank1 60 against the same rank1 printed 60, seed 1084952875, original source seat0; preserved public action transcript SHA256:

`3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a`

The exact actor's original twelve Pass decisions are still preserved in 110 native Store roots, with original native source taking no Prize, opponent finishing with six Prizes taken. The mirror result remains paper/competition **unqualified**.

## Native compiled evidence

- Actual pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; original source and candidate resolved 60-card fingerprints matched.
- [Manual CI run 42301784672](https://github.com/FlareZ123/experiment-01/actions/runs/42301784672), head `3470e06ad31036929ec3b1014b886382d2435184`: native server compiled; dedicated **“Reproduce frozen rank1 source postchoice held-Energy Pass census”** step **SUCCESS, 5/5 tests** (4 pure, 1 original-native). Its raw console reported `ownerHandEnergyHeldPasses:0`, `preliminaryUnspentHandEnergyPasses:0` and the exact unchanged original root SHA.
- Archived actual owner-only hand/board observations in [artifact 13545001575](https://github.com/FlareZ123/experiment-01/actions/runs/42301784672/artifacts/13545001575), `agent15-rank1-mirror-owner-hand-postchoice.json` (**16,671 bytes**, SHA256 `4099750aa3c79d2fe3649e04720a58b9d0c78712ab1892cf6cdde0e3bb525b0b`). The companion `.sha256` is retained inside the artifact. Outer ZIP digest from GitHub Actions metadata: `4d27197387e486f1e088119fd354142a66ddd9a2394c6fdf825495777193eace`.
- The overall workflow is **RED for a later unrelated pre-existing `detached-simulator-existing-fixtures.cjs` Bunnelby `WaitPrompt` assertion**. This does not change the success status of the dedicated native rank1 observer step. The native root SHA and test return are asserted within that successful step.
- [Four pure unit tests](../../tests/agent15-rank1-source-pass-hand-census.test.cjs) cover postchoice owner-hand scope, exact Basic Energy type, independent clone exclusion, quota and restoration. [Original frozen native regression](../../tests/agent15-rank1-source-pass-hand-census.native.test.cjs) hard-vetoes source-root SHA, twelve Passes, zero source attacks, source 60 identity and game disposition.

## Exact original source Pass-hand result

At **each of twelve actual Pass roots** (global turns **2,4,6,8,10,12,14,16,18,20,22,24**), the source owner held **zero Basic or Special Energy cards in hand**. **Ten** of those Passes still had normal Energy attachment quota unspent; the turn16 and turn18 Passes occurred **after** a genuine normal Energy attachment. The source Active was initially Marshadow UNB with zero Energy, then Tapu Lele-GX GRI with one Psychic on turn16, then Trevenant & Dusknoir-GX SMP with one Psychic on turns18–24. The recorded turn16 Tapu full-health root is the same root implicated in the separate [zero-damage paper/native attack-guard audit](../rules/agent15-tapu-cure-zero-damage-paper-native-20261106.md).

The actual source hand **persistently grew with no Energy held**, revealing a separate contested-resource question. Its non-Energy contents included:

| First observed at Pass turn | Source owner-held card and persistence |
| --- | --- |
| 2 | Float Stone BKT, Raihan EVS, Dimension Valley PHF (still held at turn24) |
| 6 | Guzma BUS (still held at turn24) |
| 8 | Quick Ball FST (still held at turn24) |
| 10 | Shadow Rider Calyrex VMAX CRE (still held at turn24) |
| 12 | VS Seeker PHF (still held at turn24) |
| 14 | Battle Compressor PHF (still held at turn24) |
| 20 | Lillie's Determination M1L (still held at turn24) |
| 24 | Sky Field ROS |

The source owner's hand sizes over the twelve Pass roots were exactly `3,3,4,5,6,7,8,8,8,9,9,10`. Cards being held is **only a source-private owner-hand observation**, not proof they could legally or profitably be played: Supporter/Item quota, locks, card effects, board constraints and stronger alternative uses require specific validation.

## Interpretation

The narrow hypothesis **“the rank1 original owner Passed with a held attachable Energy and an unused manual attachment”** is directly falsified **in all twelve frozen Pass decisions**. Two turns spent their normal attachments before passing; the other ten had no held Energy to attach. The owner was instead starved of Energy in hand at those points. Whether that was caused by policy errors, weak resource search/draw, inherent seed bad luck, prior use and prize placement, or opposing restrictions is not determined by this observation.

A different, actionable lead emerges from the **held non-Energy search and draw cards**: at turn20/22/24 the source hand contains `Lillie's Determination`, `Quick Ball`, `Battle Compressor`, `VS Seeker` and `Dimension Valley`. A legal and well-timed Supporter or Item route *could* produce Energy access, but the current observer did not measure `supporterTurn`, Item lock or actual Store acceptance. Specifically, no printed playable action, beneficial alternative, physically settled Supporter, opponent reply or game outcome improvement is established by the observed hand alone.

**Next necessary experiment:** In the same original physical deal, audit the actor's own Supporter quota, opposing active lock, and held Supporter availability at turn20; then compare an actual owner-legal `Lillie's Determination` payment and draw, resolving its native prompts, against the unchanged Pass line with an A/B/A prefix guard. Check whether newly accessible Psychic Energy actually reaches an attacker and survives adversarial reply. The reporter must not promote held-card inventory into “a missed win”.

**Qualification:** still 29/32 authenticated original card-name/count sixties, 0 competitively qualified games, no fixed 60 selected and no 99.5% win demonstration.
