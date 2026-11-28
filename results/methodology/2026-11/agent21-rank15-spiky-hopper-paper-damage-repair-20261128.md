# Rank-15 Mega Lopunny ex: Spiky Hopper must retain attacking-side damage modifiers

**Agent 21 | 2026-11-28 | implementation-and-local-test result**

**Decision affected:** simulator card-fidelity gate for the authenticated original rank-15 opponent 60, *not* an acceptance of its opponent policy, source paper copies, native game results, or fixed-60 candidate ranking.

## Exact printed inputs and a decision-changing damage breakpoint

The original source 60 `results/aichi-2026/full-decklists.json` rank 15 (Ryotaro Nozawa, Lopunny Vileplume) contains:
- **Mega Lopunny ex PFL 84 ×2**, with Spiky Hopper: **160** damage for two Colorless, ignoring effects on the opponent's **Active Pokémon** (not effects on the attacker).
- **Powerful Colorless Energy DAA 176 ×1**, which adds **20** damage to attacks of the Colorless Pokémon to which it is attached, before Weakness/Resistance.
- **Choice Belt PAL 176 ×1**, which adds **30** damage against the opponent's Active **Pokémon V**, before Weakness/Resistance.

The bundled English card database identifies the same printed mechanical families: `me2-84`, `swsh3-176`, and `sv2-176`. Against an unprotected **Shadow Rider Calyrex V CRE 74**, which has **210 HP** in that card pool, the exact direct-damage thresholds are:

| Attachments on Mega Lopunny ex | Spiky Hopper vs 210-HP Pokémon V, no other modifiers |
|---|---:|
| Neither | 160, **not a KO** |
| Powerful Colorless only | 180, **not a KO** |
| Choice Belt only | 190, **not a KO** |
| Both effective | **210, KO / 2 Prizes** |

This is a *conditional paper-legal tactical threshold*, not evidence of how often both singleton modifiers are available, whether the rank-15 player can attach and move Mega Lopunny in time, or the win rate against rank 1.

The separate Gale Thrust attack has **60 + 170** only if **Mega Lopunny ex itself** moved Bench→Active *after evolving*, not if Buneary moved first and then evolved on Active. That rule is independently confirmed by the Japanese official Pokémon FAQ on the mechanically identical Rapid Strike Urshifu V→VMAX timing question. The native ID check should **not** be widened to the evolution stack; the earlier proposed widening was withdrawn and the source public receipt restored without a mainline mutation.

## Exact pinned-engine defect

Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:
- `ptcg-server/src/sets/11-mega-evolution/set-phantasmal-flames/mega-lopunny-ex.ts` implements Spiky Hopper as `new ApplyWeaknessEffect(effect, 160)`, `effect.damage=0`, then **directly** `opponent.active.damage += damage`. This avoids defending effects as intended, but the ordinary `DealDamageEffect` never runs.
- `ptcg-server/src/sets/09-sword-and-shield/set-darkness-ablaze/powerful-colorless-energy.ts` modifies damage **only** on `DealDamageEffect`.
- `ptcg-server/src/sets/10-scarlet-and-violet/set-paldea-evolved/choice-belt.ts` likewise modifies damage **only** on `DealDamageEffect`.
- `ptcg-server/src/game/store/effect-reducers/attack-effect.ts` applies source next-turn reductions/outgoing bonus in its ordinary `DealDamageEffect` path; these were skipped by Spiky Hopper as well.

Thus the pinned implementation cannot apply the intended two rank-15 attack-side bonuses to Spiky Hopper. No actual native attack was executed in this study.

## Implemented research-side compatibility seam

- [Reversible hook](../../../simulation/twinleaf/agent21-rank15-spiky-hopper-paper-hook.cjs)
- [Node test](../../../tests/2026-11/agent21-rank15-spiky-hopper-paper-hook.test.cjs)
- [Optional real pinned-Store reducer smoke](../../../tests/2026-11/agent21-rank15-spiky-hopper-native-smoke.test.cjs) (requires built vendor output; **not executed** in this invocation; not an attack-cost legal complete game)

The hook intercepts only `MegaLopunnyex.prototype.reduceEffect` for exact Spiky Hopper `WAS_ATTACK_USED(...,1,...)`, leaving every other attack and Pokémon on the original code. It creates a `DealDamageEffect` **probe** for the attached native Powerful Colorless Energy and Choice Belt reducers, which retain their engine suppression tests. It does **not dispatch** that damage effect (doing so would admit forbidden defending-Pokémon effects). It then follows the pinned direct-shred path with adjusted source damage, native Weakness/Resistance resolution, and native `AfterDamageEffect`. The original method is restored even on error; an async scope is rejected.

**Invocation:** after building pinned Twinleaf, a locally authorized research experiment may wrap one synchronous native Store run:

```js
const {withPaperRank15SpikyHopper,VERSION,ENGINE_PIN} =
  require('./simulation/twinleaf/agent21-rank15-spiky-hopper-paper-hook.cjs');
const value = withPaperRank15SpikyHopper(() => runOneSynchronousNativeTrial());
```

Do **not** enable this in owner-frozen V3 or Stage-A registrations without a separate owner approval. When used in future authorized comparisons, disclose both engine pin and patch version; don't pool patched and unpatched outcomes.

## Test receipt and acceptance boundaries

The new focused test file covers: unmodified 160 baseline, +20, +30, +50, no V target, Special Energy and Tool suppression, source attack reductions and Weakness, defending-prevention bypass, two physical seats, Gale Thrust unchanged (including the move-after-evolution condition), unrecognized attached cards, delegated copied-attack source identity and Colorless-only Energy application, fail-closed incorrect source, and guaranteed restoration after errors/async attempts.

**Local isolated JavaScript execution:** **9/9 cases passed** on the exact branch source using an injected Store/effect test double; no native game, no qualifying duel, no code-coverage claim, no independent policy acceptance. Native compiled-module import, actual attached-card reducers, a complete printed attack, and both-seat Stage-A/competitive admissions remain untested by this code review. An optional native reducer-level smoke is committed separately: it constructs real pinned printed classes, both seats, an exact 210-HP V target, and compares unpatched 160 against patched 180/190/210. That executable smoke is an **unrun test proposal**; even when executed it will not validate evolution/attack-cost timing or completed matches. A future authorized native test should exercise actual `PowerfulColorlessEnergy` and `ChoiceBelt` classes under Stadium/Tool suppression, and compare one complete Spiky Hopper attack before/after patch against a 210-HP V under the exact fixed rank-15 source deck.

**Scope warning:** this repair applies the two source-inventory modifiers by calling their own native reducers; it is **not** a generic outgoing-damage pipeline for other effects and cannot be assumed sufficient for every possible opponent modifier or other shred attack. Until native tests and independent review, treat it as proposed compatibility code, not an enabled engine fix.

**Next decision:** independent rank-15 source/engine review should decide whether to admit this narrow hook for a future authorized opponent-policy smoke. The source rank-15 actor-visible bot is a separate, owner-coordinated task; neither bot nor candidate deck is altered here.
