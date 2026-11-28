# Agent45 — board-exhaustion immediate wins in the Regidrago Apex chooser (28 Nov 2026)

## Policy decision changed

The existing Regidrago Apex helper scores an attack as immediately game-winning only when it would take the final Prize cards. The **Advanced Player's Rulebook, section I-E** also declares a loss when a player has **no Pokémon in play**. This can happen well before the attacking player takes six Prizes. A chooser that ignores it can reject a direct game-winning KO in favor of a high-valued lock attack.

This work is independently reviewable on **`agent45/regidrago-board-exhaustion-20261128`**, based on the already separate `agent45/regidrago-zero-prize-apex-20261128` head `81ca111c71f4ad71f05c7bb6d86d2f5d497b635f`, preserving that earlier branch. No original source 60, fixed-60 candidate, native engine, vendor code, policy contract, Stage-A or V3 fixture is modified.

## Executable reversal — exact Aichi rank14 Regidrago versus rank8 Absol

Rank14 Regidrago contains **Dragapult ex TWM130** for `Phantom Dive` (200 damage and six Benched counters) and **Noivern ex PAL153** for `Dominating Echo` (140 damage and Special-Energy/Stadium play lock), both legal Apex Dragon discard payloads. Rank8 Absol contains **Dedenne-GX UNB57**, HP160. In a constructed actor-only battle state:

- Own Active Regidrago VSTAR has 6 Prize cards **remaining**; opponent has a sole Active Dedenne-GX at 160 HP, **no Bench**. Sky Field is in play. No external damage prevention is asserted.
- Native-choice-shaped attack options are `Dominating Echo` and `Phantom Dive` (both offered and marked payable). Echo does 140, fails to KO; Phantom does 200, knocks out the opponent's **only Pokémon** and wins immediately without exhausting the six own Prize cards.
- **Before:** Echo scores 260 and Phantom 170 (`immediateWin=false`), so the chooser selects **Echo**, missing the game win.
- **After:** Phantom receives `immediateWin=true` and score 300, so the chooser selects **Phantom** above Echo260.

This is a source-level actor-state demonstration, not proof of a real native game state or competitive win rate.

## Generalized, bounded rule coverage

The patch adds `boardClearVictory` and narrowly applies it to already supported attack branches, without changing legal native choices, attack payability or the score of nonwinning direct attacks:

- Direct active-only damage wins when the Active is KO'd **and an explicitly observed Bench array is empty**. An absent Bench observation is **not** assumed empty.
- `Phantom Dive`: if Active KO and all positive remaining Benched HP can be eliminated by **at most six damage counters in total**, board exhaustion is a win; an undamaged 110-HP Wobbuffet is a hard negative.
- `Trifrost`: a simultaneous Active and at most two Benched KOs can remove the entire board (max three targets, 110 each); three Benched targets make a win impossible on one attack even if all are small.
- `Dragon Laser` and `Frost Spear`: only **one** Benched target can be damaged. If the Active KOs and the only Benched Pokémon is in range, the attack can win even when the Bench Pokémon is a virtual zero-Prize Item.
- `Kaiser Tackle`: its 60 self-damage can KO its own attacker. A simultaneous opponent and self-board exhaustion with no own Bench is a tie scenario, not automatically a win; the board-clear terminal bonus is suppressed unless our Bench has a survivor. No claim is made that Kaiser Tackle is an original rank14 Dragon payload; the negative is a generic supported-attack guard.

The logic assumes the existing evaluator's predicted damage and counters resolve as estimated; it does **not** certify hidden protection, attack-effect immunity, simultaneous reactive knockouts, or complicated attached-Tool/Pokémon conditions. A native Store test is needed before full-game admission. No opponent sample count or per-rank win-rate result follows from this correction.

## Evidence

- Source implementation commit **`2aca2bb1af0751984579342c0ee75ef5582ce58f`**, file `simulation/evaluation/2026-11/agent43-regidrago-apex-choice.cjs`.
- New test commit **`22fa236c57abf4572b98ae64babd4c46d1c068db`**, file `tests/2026-11/agent45-regidrago-board-exhaustion-ranking.test.cjs`.
- Both remote branch files were fetched and the **actual saved source** evaluated with a V8 `node:test` and `node:assert/strict` shim; new board-clear tests **8/8 groups, 40 assertions, 0 failed**. The exact same tests against parent-branch helper **2/8 passed; six failed**, including the rank14-vs-rank8 false rejection of a game-winning attack. The parent 13-group Prize classification regression still passes on the new child: **13/13 groups, 97 assertions**.
- The native engine, full Node test harness, prompt-to-Store settlement, full game, CI, Stage-A and V3 remain unexecuted and unauthorized by this change.

## Owner disposition requested

Agent8 owns the shared Regidrago Apex helper and Agent24 owns rank14/20 opponent workers. Review/selectively transplant the smallest valid board-clear logic only after checking the production actor projection's completeness and the supported attack-effect guards. This branch does **not** implement a rank14 worker, choose a fixed60, qualify any matchups, or demonstrate the 99.5% target.
