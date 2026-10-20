# Rank26 native VIP → Cologne continuation: actual owner line still passes

**Agent 4, 20 October 2026. Development-only native Store evidence.** This is a preidentified, retrospectively selected first-player rank26 source hand, not a fresh competitive trial or a deck-win observation.

## Frozen experiment and falsification

- Source: exact published **rank26 Meloetta Donk** 60 against exact published **rank6 Iron Thorns** 60; physical rank26 seat **B/1**, original seed **2614852201**, registered repeat **83:B** from the preexisting five-case VIP-after-Pass study. The pinned engine is **`twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**.
- Baseline and VIP-only reference arms are preserved. The sole new treatment adds an **opt-in** owner-visible `Canceling Cologne` proposal *after* a genuine VIP root, owner-deck prompt resolution and public Bench confirmation. The source must have Cologne physically in hand, Meloetta visibly in play, Iron Thorns ex visibly Active, no live Item lock, and the genuine Store must accept the proposed `PlayCardAction`.
- Predeclared native postconditions: source physical Cologne exits hand, enters discard, ordinary action trace records the root, and all firstturn attacks and opposing Prize transitions remain reported even if they do not improve. No synthetic card was inserted, moved, or fabricated. The wrapper still delegates all further decisions to the unqualified original bot.
- Reversible policy code: [VIP with owner-only Cologne option](../../simulation/twinleaf/rank26-first-own-vip-after-pass.cjs); [five-case runner with **only 83:B** receiving the optional third arm](../../simulation/twinleaf/rank26-vip-after-pass-source-pair.cjs). Original default-off options and first five VIP fixture identities are unchanged. [Owner-only predicate unit test](../../tests/rank26-first-own-vip-after-pass.test.cjs) includes a deliberate opponent-secret-world change.

## Compiled outcome

[Manual CI 39414565751](https://github.com/FlareZ123/experiment-01/actions/runs/39414565751) **PASSED** at head `a8520ae7f258e5b02a7a0ecfe245c97553103fcb`; all six focused owner-VIP/unit tests passed; the exact existing five-case original-control/VIP-only validation also passed. New treatment used the already frozen rank26 source-dealt `83:B` first turn. [Full original JSON archive](https://github.com/FlareZ123/experiment-01/actions/runs/39414565751/artifacts/12260826639), ZIP SHA256 `17ed80b8cbe0552d8e88b0ec83f49173e6579d447853b026be87ca18e6332ed3`.

The authentic owner opening had **Bunnelby PRC Active**, **Dedenne GX UNB Benched**, and six hand cards: `Float Stone BKT`, `Battle VIP Pass FST`, `Dowsing Machine PLS`, `Counter Catcher PAR`, `Canceling Cologne ASR`, `Rescue Carrier EVS`. Source held no directly playable Crisis Punch, DCE, Risky Ruins, or Damage Pump in that visible original hand. Their eventual access is not resolved here.

| Original-source treatment | Actual rank26 first-turn native decisions | Root attack | Opponent Prizes after turn |
| --- | --- | ---: | ---: |
| Unmodified bot | Float Stone → Pass | 0 | 6 |
| Owner-first VIP repair only | Float Stone → VIP → authentic deck search chooses Meloetta ex SV11B + Exeggcute PLF → Pass | 0 | 6 |
| Owner-first VIP **plus** owner-visible Cologne follow-up | Float Stone → VIP → same physical search → **Canceling Cologne ASR** → Pass | **0** | **6** |

The optional Cologne action had `nativeValid:true`, appeared as a native `PlayCardAction` for `Canceling Cologne`, then had `sourceHasCologne:false` and `sourceDiscardHasCologne:true` at its next genuine source-root callback. In the treatment's public post-VIP Bench, Dedenne GX, Meloetta ex and Exeggcute were actually present. The final game remained bounded and unfinished. There were **no** source `AttackAction` roots, no first-turn Prize changes and no competitive-qualified games.

## Interpretation and next qualification gate

This is another **action → authentic owner-deck prompt → public board postcondition → subsequent native Item** witness, with a genuine non-conversion at the next decision. It closes the narrow question whether a physically held Cologne could be natively played immediately after the successful VIP search in that exact source state. It **does not independently inspect the powered-on ability set after the second Item**; the separate [authentic source Cologne Active-Meloetta witness](rank26-thorns-authenticated-firstturn-source.md) tested Ability restoration in a different real source start. Do not merge those physical setups or treat this as demonstrated firstturn Ability activation for benched Meloetta.

Further progress needs a legal **multi-resource turn** that obtains Tool, Energy, 2+2+1 self-KOs, correct Active positioning, and attack, with genuine prompt and opponent continuation. Playing Cologne early may itself be a **strategically dominated expense** when no same-turn attack is possible: the source uses its unique lock-breaking Item and still passes. Owner-information safety for the new predicate does not certify the inherited generic bot's decisions or full-match hidden-state parity. No attack/Prize-positive case should be selected for performance without preserving the original negative denominators.

**Project status remains 29/32 exact source decklists, zero competitively qualified matches, no demonstrated 99.5% fixed 60.**
