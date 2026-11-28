# One opt-in pinned Twinleaf fidelity bundle for four source-exact Aichi interactions

**Agent21 · 28 November 2026 · review branch, NOT owner-frozen V3 or Stage-A**

## Why this exists

The baseline Aichi Top32 research currently authenticates 29/32 original 60-card opponents and has **zero competitively qualified games**. Before attributing a future result to fixed-deck strength, its native card engine should not systematically change printed attacking-side bonuses, mandatory target selection, or discard-to-Lost-Zone disruption. Four independent source-exact defects are documented, and each has an isolated reversible fix. This branch collocates their exact immutable Git blobs without editing upstream/vendor code, and adds a **single compositional entrypoint** to prevent four scattered ad-hoc monkey-patch registrations.

The entire bundle is restricted to pinned Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, paper Pokémon Expanded, Black & White onward. It does **not** claim four arbitrary global fixes to all attacks, effects, or printings; only the source cases listed.

## Four source-exact corrections

| Scope / affected original opponents | Pinned native mismatch | Correct paper consequence | Isolated tests |
|---|---|---|---:|
| Rank 15 Mega Lopunny ex PFL84, attack Spiky Hopper | Direct 160 damage bypasses native **Powerful Colorless Energy DAA176** +20 and **Choice Belt PAL176** +30 versus Pokémon V | If both live and attached, **210**, not 160; can KO a 210HP Shadow Rider Calyrex V | **9/9** |
| Regidrago ranks 10/12/13/14/18/20/21/27/32 copying Dialga-GX UPR100 **Shred** | Direct 80 damage bypasses attacker Tool **Muscle Band XY121** +20 | Live attached Band gives **100**, not 80; 90HP Active Girafarig is KO | **8/8** |
| Same nine Regidrago lists copying Kyurem SFA47 **Trifrost** | Engine prompts `min:1,max:3` and accepts duplicate/own-slot targets | Exactly **min(3, available opposing Pokémon)** distinct targets must be selected | **10/10** |
| Provisional Hood Shadow Rider Girafarig LOT94 **Get Lost** | Engine allows cancel and duplicate refs with forced two even if only one opposing discard card | Exactly **min(2, opposing discard size)** distinct cards, no optional cancellation | **10/10** |

Detailed source, rules and limitations are in the accompanying reports:
- [Rank15 Spiky Hopper modifiers](agent21-rank15-spiky-hopper-paper-damage-repair-20261128.md)
- [Copied Dialga Shred / Muscle Band](agent21-regidrago-dialga-shred-muscle-band-paper-damage-repair-20261128.md)
- [Copied Kyurem Trifrost target count](agent21-kyurem-trifrost-compulsory-three-distinct-targets-20261128.md)
- [Girafarig Get Lost discard selection](agent21-girafarig-get-lost-compulsory-two-discard-cards-20261128.md)

Each original branch and this combined branch contain the exact hook, isolated test and **optional unrun pinned native Store smoke**. Pinned original source 60s and the provisional fixed 60 remain unchanged. This branch has no CI workflow, no engine vendor diff and no changed benchmark data.

## One reversible entrypoint

Use `simulation/twinleaf/agent21-paper-source-fidelity-bundle.cjs`:

```js
const {withPaperSourceFidelity, FEATURES, ENGINE_PIN} =
  require('./simulation/twinleaf/agent21-paper-source-fidelity-bundle.cjs');

// After independently building the EXACT pinned Twinleaf native output.
// Wrap ONE synchronous native root or prompt-continuation Store operation:
const result = withPaperSourceFidelity(() => store.reduceEffect(state, effect));

// For an end-to-end game, install for EACH native root/continuation action
// that may resolve one of the four sources, not only the first turn.
// Do not wrap Promises/async long-lived game sessions.
```

It nests all four source prototype overrides, then restores them in inverse order via the hooks' `finally` clauses, including when an operation throws. The two prompt fixes attach their restrictions to the **specific emitted native prompt object**, which remains valid when the Store later resolves the prompt even after prototypes are restored. All nested hooks agree on the same pinned engine SHA. Hook versions and printed scope are available as `FEATURES`, and experiments using this bundle **must record the exact bundle version, four constituent versions, fixed decklists and pin**.

Calls under owner V3/Stage A require separate explicit authorization and an independent native smoke review. No owner has yet admitted or integrated this branch.

## Test evidence and acceptance boundary

**Source-isolated JavaScript tests:** 9+8+10+10 = **37/37 pass**, previously executed directly on each original exact source branch with injected native Store/effect/prompt doubles; those same Git file blobs were copied to this branch via a single atomic tree commit. Separate **bundle-level composition tests: 5/5 pass**, executed against exact branch code, covering all four prototype changes active simultaneously, original attack delegation, reverse cleanup, thrown errors, forbidden Promise return, failed partial installation rollback and repeatable sequential operation. **Total 42 isolated tests; 0 native compiled Store tests executed** in this invocation.

Native smoke files committed (not executed):
- `tests/2026-11/agent21-rank15-spiky-hopper-native-smoke.test.cjs`
- `tests/2026-11/agent21-regidrago-dialga-shred-native-smoke.test.cjs` (includes Regidrago copied Shred session)
- `tests/2026-11/agent21-kyurem-trifrost-native-prompt-smoke.test.cjs` (includes copied Kyurem session)
- `tests/2026-11/agent21-girafarig-get-lost-native-prompt-smoke.test.cjs`

After a permitted local pinned build, the owner can run source-isolated tests without a CI workflow, and one native smoke at a time:

```sh
node --test \
  tests/2026-11/agent21-rank15-spiky-hopper-paper-hook.test.cjs \
  tests/2026-11/agent21-regidrago-dialga-shred-paper-hook.test.cjs \
  tests/2026-11/agent21-kyurem-trifrost-target-prompt-paper-hook.test.cjs \
  tests/2026-11/agent21-girafarig-get-lost-compulsory-selection-paper-hook.test.cjs \
  tests/2026-11/agent21-paper-source-fidelity-bundle.test.cjs
```

The compiled Store smokes use synthetic `AttackEffect` and do not by themselves prove attack Energy costs, legal Pokémon evolution timing, K0/K1 information, Item/Supporter lock, a complete original 60 or a qualified opponent policy. If they pass, a separate owner-authorized actor-visible **legally paid full action → prompt → attack → opponent response** should be required before using patched results as competitive data.

## Practical priority

The 210-HP KO threshold and mandatory Trifrost targeting can change Prize paths directly; copied Shred's 80→100 can change narrow KOs; Get Lost can remove Regidrago's attack payloads that would otherwise remain available. These interactions are **discrete tactical value**, not average-connectivity scores. The immediate win-rate benefit of fixing simulator fidelity is *unknown*. The bundle is a means to prevent measuring the wrong game, not evidence that any fixed 60 wins 99.5%, nor a pretext to retest old unqualified games under changed engine conditions without preregistration.
