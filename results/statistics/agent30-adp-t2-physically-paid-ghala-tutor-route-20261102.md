# ADP GX → Thorton → Wild Blaze via actual two-card Guzma & Hala payment

**Agent30 | 2 November 2026 | independent exact opening geometry, no native games or competitively qualified results.** Adds a second disjoint-within-test way to supply source discards and the first enhanced DDE, separate from the earlier [Battle Compressor direct route](agent30-adp-t2-gx-thorton-wildblaze-paid-route-20261102.md). The registered source list is still the same immutable [Agent5 ADP→Thorton→Regidrago v2](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json), deck hash `bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b`.

## Why this is a different, physically costed line

A theoretical “Guzma & Hala can obtain Double Dragon Energy” graph path ignores its **mandatory optional-enhancement payment**: to find Special Energy, the physical owner must discard **two other cards from hand**. This deck's defining attack also needs one specific Dragon **M Charizard-EX** and a **Regidrago V** in the discard before its second-turn Thorton→Regidrago VSTAR copied Wild Blaze.

Here the *same two cards* pay G&H's enhancement cost on the first personal turn going second. That potentially removes the need for Battle Compressor:

1. ADP is chosen Active from opening seven. In the first eight (opening seven and one normal first-own-turn draw), hold the singleton M Charizard-EX XY2 69, at least one Regidrago V SWSH12 135, and either **Guzma & Hala CEC193** or **Tag Call CEC206**.
2. If G&H is held, play it. Otherwise a held Tag Call (Item) searches for an *unprized* G&H from deck before playing it. Source G&H searches a Stadium, but restricted deck search can select zero; the model explicitly searches **no Stadium**, to avoid changing the following deck composition. Source optional Tool retrieval also selects none.
3. Pay *exactly* two G&H discarded hand cards: physical M Charizard-EX + physical Regidrago V. If **one DDE ROS97 survives in deck**, enhanced G&H searches and retrieves a DDE. Attach this DDE as T1 manual Energy to Active ADP and use enhanced Altered Creation-GX (Metal cost plus one extra Water provided by two units on the Dragon Pokémon).
4. On T2, obtain Thorton, VSTAR and one Basic Grass/Fire with the first eight cards plus at most **one** normal T2 draw, then play Thorton to swap the originally in-play ADP with a real Regidrago V from discard; inherited DDE and turns-in-play allow VSTAR evolution on T2, complementary Basic Energy manual attachment and Apex Dragon copy of M Charizard's physically discarded Wild Blaze attack.

This is a genuine card-text paper-cost *resource opportunity*, because both precisely specified discarded cards are initially physically in hand. It still does not prove that a player actually selects the line, that native Store correctly pays any prompt, that a source opponent allows the T1 GX or T2 continuity, or that a single copied attack wins a game. Wally/Guzma/Thorton Supporter competition is resolved only locally: G&H T1 and Thorton T2 occur on separate turns.

## Exact probabilities

Two **mutually exclusive branches** are counted: first preference for a G&H in first eight; otherwise a held Tag Call and *deck-surviving* G&H. Both require DDE surviving six Prizes **in deck**, regardless of any other DDE copies already held, because this restricted line specifically fetches its attached DDE using G&H. No alternate held-DDE route is inferred.

| Strict physical event | Unconditional deal | Conditional Basic-valid starting seven |
| --- | ---: | ---: |
| First-turn ADP Active, M Charizard+Regidrago in hand, G&H held and DDE survives Prizes in deck | 0.188934413% | 0.314429761% |
| Incremental branch: G&H absent, Tag Call held, both G&H and DDE survive in own deck | 0.190880561% | 0.317668593% |
| **Combined physically payable enhanced-G&H T1 resource source** | **0.379814974%** | **0.632098354%** |
| G&H held route plus all T2 Thorton/VSTAR/Basic Energy held in first eight | 0.002330228% | 0.003878029% |
| Tag Call route plus all T2 prerequisites held first eight | 0.002863088% | 0.004764829% |
| Held G&H route complete with one natural T2 draw | 0.005123506% | 0.008526678% |
| Tag Call route complete with one natural T2 draw | 0.006073775% | 0.010108141% |
| **Combined T2 resource-ready Wild Blaze copy (physically paid G&H route)** | **0.011197281%** | **0.018634818%** |

The complete conditional two-turn probability is approximately **one in 5,366 Basic-valid opening hands** under this strict G&H route. The [strict Battle Compressor route](agent30-adp-t2-gx-thorton-wildblaze-paid-route-20261102.md) instead gives **0.224604425% conditional Basic-valid** for a *different* direct path: source M Charizard and Regidrago in deck for Compressor rather than in hand for G&H; no T1 G&H Supporter required. The BC route is approximately **12.05 times as frequent** in these very narrow models. **Do not add the percentages as a full deck probability:** some physical deals may support both lines, there are other discards/searches, and the actual selected actions can overlap.

This is a quantitative manifestation of physical DCI and connector domination: **theoretical Supporter-to-Energy access does not necessarily support the desired two-card discard cost simultaneously**. Other ways to get a G&H/Compressor/Ultra Ball and card draw can greatly increase real playability beyond these first-eight-only paths.

## Exact reproducibility

[Standalone CommonJS exact SFT](../../tests/agent30-adp-t2-paid-ghala-route.test.cjs) reads the unchanged v2 60 and verifies all relevant source card-ID quantities:

`[ADP2,DDE4,G&H3,Tag Call4,M Charizard1,Regidrago V3,VSTAR3,Thorton4,Basic Grass+Fire7,other29]`.

Enumerate first-eight category combinations `prod(C(n_i,x_i))/C(60,8)`, with positional ADP Active factor `7/8` if just one ADP in eight, otherwise `1`. In the held-G&H route, pay two physically held Dragon cards, require DDE survives six Prizes in the own deck and remove one DDE from the deck after search, leaving **45** cards before T2 natural draw. In Tag Call route, remove one G&H and one DDE, leaving **44**. If exactly one of Thorton/VSTAR/Basic Energy is missing among eight, condition on that physical target being outside Prizes and multiply its **one-card draw** chance by joint remaining-deck survival of mandatory search target(s). In the Tag Call route, the joint G&H+DDE survival uses exact two-class inclusion-exclusion, including when both would be Prized.

The fresh V8 test executed against the actual source manifest and passed all six exact branch assertions with tolerance `1e-12`. Independent Python exact combinatorics reproduced all six probabilities. Independently simulated **1,000,000** literal shuffled decks with seven opener, six Prizes, T1 draw and actual source discard/search/shuffle followed by T2 random draw: observed **1,839 held-G&H T1**, **1,946 Tag Call T1**, **43 held-G&H T2 completed** and **65 Tag Call T2 completed**. Observed combined T2 **0.01080% unconditional**, compatible with exact **0.011197281%** within Monte Carlo uncertainty. This evidence is source-card arithmetic only: **no compiled Twinleaf gameplay or competitive wins**.

## Falsification against original Aichi source ranks

The original rank6 Iron Thorns can suppress candidate Tapu Lele/Crobat Basic Abilities, but this route does not use them. Actual **Plumeria / Team Flare Grunt / Enhanced Hammer** during the opponent turn after ADP's GX can strip the only attached DDE. The physical G&H cost puts both primary Dragon targets into discard before the GX, but does nothing to protect ADP Active, source's Item/Supporter controls, or T2 Energy and Thorton access.

Under ranks8/11/16/22 Absol/Garbodor, a **Temple of Sinnoh** already active or played between personal turns can make this fetched DDE insufficient for both the enhanced GX and the subsequent VSTAR attack. A hypothetical Field Blower response is a different Item access route that competes with setup and source Item lock. These counterexamples must be tested with actual selected opponent roots rather than presumed from card copies.

The narrow G&H line is a useful negative consistency and payment example. It is **not** evidence to discard Agent5's full 60; support/draw/Ultra Ball/Compressor can create many alternative legal lines. The single fixed candidate and all four older controls remain unranked; Aichi original source coverage remains 29/32 with zero competitively qualified paper games.
