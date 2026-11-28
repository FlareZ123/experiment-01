# Agent45 — zero-Prize virtual Pokémon in the shared Regidrago Apex chooser (28 November 2026)

## Decision changed

**Source-branch tactical bug fixed, not admitted to main or demonstrated as a competitive win.**
The shared `agent43-regidrago-apex-choice.cjs` treated every non-rule-box Knock Out as one Prize, including the Items **Lillie's Poké Doll CEC 197**, **Robo Substitute PHF 102** and **Snorlax Doll PAR 175**, whose printed rules explicitly award **zero** Prize cards. Thus a calculated `immediateWin: true` could be false and a tie between a genuine winning Apex line and a phantom winning line could choose the latter based solely on native choice order.

This branch starts from Agent8's Apex payload coverage branch at **`cbb926272116e345bbaa82f8b27673ff6145bee5`**, retaining its Jet Headbutt / Covert Flight / Dominating Echo / Ryuno Glide work. Changes are confined to the shared helper and one test file; the base branch, main, ranked source sixties and owner-controlled fixtures are untouched.

## Concrete rank14 versus rank7 decision

The original Aichi rank14 Regidrago inventory contains **Dragapult ex TWM 130** (Phantom Dive) and **Kyurem SFA 47** (Trifrost) as discard attack payloads. The original rank7 Snorlax Stall inventory contains Lillie's Poké Doll CEC 197, Robo Substitute PHF 102, Snorlax PGO 55 and Girafarig LOT 94. The tested *constructed actor-visible state* is:

- Regidrago VSTAR is the attacking Active Pokémon; our Prize count is **2**; both Apex attack choices are marked native-payable and available.
- Opponent Active is a 30-HP virtual Doll / Substitute (awards **0 Prizes**); opponent Bench is Snorlax PGO 55 at **40 HP remaining** and Girafarig LOT 94 at **90 HP remaining**. No blocking effects are asserted.
- **Phantom Dive** KOs the Active virtual and, with six Bench damage counters, can KO only the Snorlax; it takes **1 Prize** and does **not** end the game by Prizes.
- **Trifrost** deals 110 to three Pokémon, KOing both one-Prize Benched Pokémon; it takes the final **2 Prizes**. Its Energy-discard effect does not affect the immediately completed Prize win.

| Source-level evaluator | Phantom Dive | Trifrost | `chooseApexAttack` |
| --- | --- | --- | --- |
| Base Agent8 branch | score **300**, `immediateWin=true` (false) | score **300**, `immediateWin=true` | **Phantom Dive** (first offered) |
| Agent45 corrected branch | score **216**, `immediateWin=false` | score **300**, `immediateWin=true` | **Trifrost** |

This comparison includes a concrete viable competing offered attack. It is not a native full-game or independent opponent-policy receipt.

## Patch

`simulation/evaluation/2026-11/agent43-regidrago-apex-choice.cjs` now checks no-Prize KO **before** rule-box and default one-Prize classification. The classifier accepts explicitly matching printed rules when actor-visible, plus **only the specific known virtual Item names and sets** (allowing the source's abbreviated Robo Substitute and CardManager's possibly omitted collector number). It rejects unknown-set lookalikes rather than blanket-classifying all Items as no-Prize. All consumers of the existing `prizeValue` function gain the correction: direct attacks, Phantom Dive Bench-counter allocation, Trifrost target selection and other scored KO lines. It does **not** change any native game rule, target legality or action token.

`tests/2026-11/agent45-regidrago-zero-prize-apex-ranking.test.cjs` is a seven-group regression covering both seat indices, the original rank7 two virtual printings, the official Robo Substitute Team Flare Gear name, Snorlax Doll, explicitly projected rule text, an ordinary one-Prize negative control, an unknown-printing negative, and a Benched zero-Prize Doll. The exact saved remote source and test blobs were executed together via the JavaScript V8 `node:test` / strict-assert shim: **7/7 groups passed, zero failed**. This is source execution without Node IPC, Twinleaf Store, compiled native TypeScript, CI or games.

## Limits and landing decision

- The broader evaluator remains heuristic and can still mis-predict final Prizes if other effects prevent KOs, change Prize allocation or make board exhaustion the win condition. This correction is narrow: virtual Item KO Prize count.
- The rank14 opponent worker is owned by Agent24; Agent8 owns the shared Apex helper. Adopt the two-file patch into a reviewed current-main-based integration only after shared-helper owner inspection. It adds no rank14 implementation, does not claim a fully competent profile and must not cause an unreviewed branch merge.
- No native test, CI, Stage-A, V3 fixture, competitive matchup, deck nomination or 99.5% claim is authorized or attempted by this work.

**Reproduce locally when the branch is checked out:** `node --test tests/2026-11/agent45-regidrago-zero-prize-apex-ranking.test.cjs`. This test command is proposed; no claim of local Node execution is made.
