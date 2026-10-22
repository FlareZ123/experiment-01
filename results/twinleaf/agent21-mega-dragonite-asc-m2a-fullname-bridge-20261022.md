# Pinned Mega Dragonite engine class exists, with an M2a/ASC fullName mismatch

**Agent 21 | 22 October 2026 UTC | static code + source-card cross-check.** This closes a narrow code-identification ambiguity, **not** full native gameplay support. There are zero competitively qualified match results.

## Cross-source reproduction

At **pinned upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, the [actual card class](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/11-mega-evolution/set-ascended-heroes/mega-dragonite-ex.ts) explicitly has:

```ts
public set: string = 'ASC';
public setNumber: string = '152';
public name: string = 'Mega Dragonite ex';
public fullName: string = 'Mega Dragonite ex M2a';
```

Its attack `Ryuno Glide` is **330 damage**, `[W,L,L]` printed energy cost, **mandatory discard 2 Energy**, invoked via `DISCARD_X_ENERGY_FROM_THIS_POKEMON(store,state,effect,2)`. The exact class is imported and instantiated by the pinned [Ascended Heroes set index](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/11-mega-evolution/set-ascended-heroes/index.ts), and pinned [start.js](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/start.js) explicitly defines `sets.setAscendedHeroes`. There is therefore real **source-level implementation** of the attack in the pinned commit.

However, pinned [CardManager](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/cards/card-manager.ts) keys `getCardByName(string)` exclusively by `fullName` or optional `legacyFullName`; the Dragonite class declares **no legacy alias**. A lookup with canonical English `Mega Dragonite ex ASC` will therefore fail even though the manager can hold an ASC card of that name. The literal **`Mega Dragonite ex M2a`** is the class's index key. Distinguish **missing canonical lookup alias** from **unimplemented card**. This is a *source-code inference*, not a compiled getCardByName result in this report.

The project already has an actual native [Apex Ryuno Glide source-board test](../../simulation/twinleaf/apex-mega-dragonite-energy-discard.cjs) which searches by `card.name`, `card.set`, and `setNumber` directly. Another staged source log from [CI 39692001898](https://github.com/FlareZ123/experiment-01/actions/runs/39692001898) marked an arm `missingEngineCard: Missing pinned engine card Mega Dragonite ex ASC`; its report should **not** be taken as conclusive proof of a genuinely unimplemented class. Trace exactly **which manager or source lookup failed**, the given string key, and whether any earlier card-manager filtering occurred.

## Why this matters to the authenticated physical source

A newly independently read original [38-cell Natsumegu deck photo](../aichi-2026/agent21-natsumegu-dragon04-rank21-59overlap-audit-20261021.md) has the flashy Japanese Mega Dragonite **M2a `232/193`**, artwork by DOM. Its exact corresponding English printing is **`me2pt5-271`, ASC 271** in the supplied English card-list ZIP, while the pinned active main card class is **ASC 152** (distinct artwork, **same printed attacks and effects**). [Official Japanese M2a 232 card](https://www.pokemon-card.com/card-search/details.php/card/49992) and [English equivalence](https://limitlesstcg.com/cards/en/ASC/271). Preserve **separate physical print identity** from **mechanical proxy class** in source and simulation manifests.

### Testable follow-up

A focused real compiled Store test should check:
1. `manager.getAllCards().find(c => c.name==='Mega Dragonite ex' && c.set==='ASC' && c.setNumber==='152')` exists after normal `initializeCards()`;
2. the exact canonical key `Mega Dragonite ex ASC` versus the actual `Mega Dragonite ex M2a` manager key;
3. permitted one-Double-Dragon Energy discard when `Apex Dragon` copies `Ryuno Glide`, with Store-issued prompt and post-attack Energy count;
4. whether `ASC 271` alter-print is separately exposed, and whether the deck translator can map the authenticated original `M2a 232` to a same-mechanics engine card without pretending the artwork matches.

If the source lookup alias is the only obstacle, solve it through the **research-owned name/printing mapper**, avoiding any direct vendor edits. A successful staged source-board attack verifies only that interaction, not ranked win strength. Preserve existing runner and coordinate changes with its owner.

## Resolution: the *exact matching English artwork* already has a pinned manager key

After the first source-code audit, inspected the same pinned [Ascended Heroes `other-prints.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/11-mega-evolution/set-ascended-heroes/other-prints.ts). It declares:

```ts
export class MegaDragoniteex2ASC extends MegaDragoniteexASC152 {
  public setNumber = '271';
  public fullName: string = 'Mega Dragonite ex2 ASC';
  public set = 'ASC';
}
```

The Ascended Heroes index registers `new MegaDragoniteex2ASC()`, so the pinned card manager should also index **`Mega Dragonite ex2 ASC`** for the exact English `ASC 271` art equivalent of the original **Japanese M2a #232/193** photo. This eliminates the need to mechanically proxy ASC152 when testing the authenticated physical singleton. The prefix `ex2` is an idiosyncratic but **intentional upstream printing suffix**, which differs from the often guessed canonical key `Mega Dragonite ex ASC`. Do not rename the source's photo-card English equivalent or write directly into the submodule. **For a live Store deck, use this exact pinned key** and verify a full-game seed/prompt receipt. The original no-alias finding for bare `Mega Dragonite ex ASC` remains valid.

Revised recommendation: prioritize trying the **existing registered `Mega Dragonite ex2 ASC`** first. A new research alias layer is unnecessary for this printing if the actual CardManager recognizes the already registered class. The existing source-board runner searches ASC152 and therefore does not by itself prove ASC271's exact object was used. No gameplay verification is claimed from this static inspection.
