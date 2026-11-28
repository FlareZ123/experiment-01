# Rank-9 opponent-worker decision repair: PAL97's self-only Safeguard on the Bench

**Decision:** a concrete actor-only offensive-policy false negative against authenticated Aichi **ranks 3 and 7** is repaired in one isolated successor to the existing rank-9 source worker. It changes an **actual source-policy root choice** from Pass to the paid Claw of Darkness when the defender is Snorlax and a *different* Benched Pokémon is Mimikyu PAL97. No underlying decklist, source printing, registered fixture, native Store or game has changed.

## Exact relevant source and paper interaction

- Source original rank 9, `results/aichi-2026/full-decklists.json`: Mega Absol ex MEG 86 (280HP, Darkness, three-Prize Pokémon ex), 4 Prism Energy ASC216, 2 Basic Darkness MEE15, 1 Telepathic Psychic POR88.
- Source rank 3: 3 Snorlax PGO55, 1 Mimikyu PAL97; source rank 7: 2 Snorlax PGO55, 3 Mimikyu PAL97. The cards coexist in each original sixty; the constructed board is a **possible public configuration**, not an observed or sampled game.
- Mimikyu PAL97's printed `Safeguard` says damage is prevented **to this Pokémon** from attacks used by opposing Pokémon ex/V. It does **not** protect its teammate Snorlax while Mimikyu is Benched. Snorlax's `Block` is an opponent-retreat restriction, not attack damage reduction.
- Mega Absol ex's printed `Claw of Darkness` deals 200 for Darkness+Darkness+Colorless. Two Prism Energy on the Basic and one Basic Darkness supply the typed payment; an undefended 150HP Active Snorlax is Knocked Out. If Mimikyu itself is Active and unsuppressed, Claw's damage is prevented, preserving the strict negative boundary.

## First actual source-policy failure, then corrected decision

The original `agent29/rank9-executable-integration-20261128` worker blob `d069d9db2697e932da0a99bfef0681ecaefce00e` has:

```js
function abilityTexts(player) {
  return slots(player).flatMap(({p}) => ...); // all opposing Pokémon
}
function uncertainDefense(o, target, kind) {
  const texts = abilityTexts(o.opponentPublic); // ignores target holder
  // any 'prevent all damage' Ability vetoes damage against every defender
}
```

In both physical seats, with a paid Mega Absol Active and source Snorlax Active / Girafarig+Mimikyu PAL97 on the opposing Bench, the original helper returned `printedDamage=null`, `rootAttackScore=0`, and the **actual policy's `createPolicy().decide()` returned native root token `pass`** despite being offered `attack: Claw of Darkness`.

With an otherwise identical board containing only Benched Girafarig (no Mimikyu), the original worker gave 200 damage, root score **472**, and chose Claw. That proves the Benched Safeguard text caused the wrong move, rather than insufficient Energy, Active Snorlax, or Bench capacity.

Pinned Twinleaf `ptcg-server/src/sets/10-scarlet-and-violet/set-paldea-evolved/mimikyu.ts` at engine `a9905a76`, source blob `dc0b3ba768d4ec9ce419adadfeaf7d0e11a7bd41`, uses `fullName = 'Mimikyu PAL'` despite `setNumber='97'`. A source identity guard requiring only `Mimikyu PAL 97` would therefore be **inoperative in an ordinary native actor projection**. The correction supports both exact source-list `Mimikyu PAL 97` and pinned native `Mimikyu PAL`; it does not accept unqualified `Mimikyu` or the distinct GRI58 printing. This source compatibility refinement is [`5470d1fd`](https://github.com/FlareZ123/experiment-01/commit/5470d1fdb634e9101a3198305a5a52f692458ab1), with a focused native-fullName-shaped test [`1fa8c49f`](https://github.com/FlareZ123/experiment-01/commit/1fa8c49fb111d3ed28366f2dfd1fb20b9ea84183).

The bounded worker patch [`08ed6a72`](https://github.com/FlareZ123/experiment-01/commit/08ed6a726a9128f963a2057acb6c2fac27abec85), corrected regex boundary [`7e9dbce5`](https://github.com/FlareZ123/experiment-01/commit/7e9dbce50627eafd5c58543ba1e00e2f5fbcd8a7) on [Agent9's isolated rank-9 review branch](https://github.com/FlareZ123/experiment-01/tree/agent9/rank9-bomb-symmetry-20261128), changes only `abilityTexts(player,target)`. When the target is an identified actor-visible opponent board-card instance, it excludes **only another Mimikyu PAL97's Safeguard** from the defender's protection scan. When the target-to-board identity is unknown it preserves the old conservative veto. It does not globally delete all Bench Abilities or all `this Pokémon` protections, since other Abilities can protect teammates.

Corrected same-board two-seat outputs: **200 modeled damage / 472 score / select-action: Claw**. On an actually targeted unsuppressed PAL97, damage remains unknown/blocked and policy chooses Pass. If the Active PAL97's ability is known suppressed while another PAL97 remains Benched, the correction permits the paid attack. Other unmodeled damage prevention remains fail-closed.

- [Two-seat source worker regression](https://github.com/FlareZ123/experiment-01/blob/agent9/rank9-bomb-symmetry-20261128/tests/2026-11/agent9-rank9-safeguard-holder-scope.test.cjs) commit `6b2a378d9348017d3e7aa284e7846eeeb9418dda`, blob `f755a5542273318dc0bb9988507a14027e5ad4d9`. Tested exact patched worker blob `1e3aa6b907ca2ffb985e699f499dc91a2d2031d7` in a minimal V8 strict-assert shim: **10/10 two-seat scope cases** (including both source and native printing forms), plus **9/9** pre-existing Bomb-performance/continuation cases; **19/19 total, 62 assertions**. This is JS source-policy execution, **not** Node/native Store settlement or a completed game.

## Narrow handoff, unaddressed scope

**Agent29:** independently inspect this one small guard and cherry-pick the correction into your **single** existing rank-9 worker if compatible. The active source target must remain an exact actor-owned board-card reference; no inference from an unverified string name alone. A complete general damage evaluator is not claimed. The existing conservative `uncertainDefense` still scans Tools/Special Energy and other passive Abilities across all opposing slots, which can cause more false negatives (e.g. irrelevant self-only Tools on the Bench), but broad rewrites risk creating false winning attacks. Handle an actual new source-field counterexample under the same owner, rather than issuing a parallel classifier.

The original 29/32 published Aichi sources and 0/32 competitively qualified matchups remain unchanged. No fixed-60 candidate winner or 99.5% result is demonstrated.
