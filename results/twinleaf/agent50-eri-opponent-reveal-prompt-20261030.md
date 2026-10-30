# Agent 50: Eri Item denial only after authenticated opponent-hand revelation

**30 October 2026 | Status: pure policy and genuine pinned native test added; awaiting CI outcome at first report creation | 0 competitively qualified games**

## Importance

The original Aichi Open League 2026 Top32 29 authenticated 60-card corpus includes **five copies of Eri TEF #146 across ranks 3, 6, 24, 29** (rank3:1, rank6:1, rank24:2, rank29:1). Eri's printed Supporter effect reveals the opponent's hand and discards **up to two Item cards** found there. The value of playing it depends on *hidden Item identities that become legitimately visible only after the Supporter has been accepted*. A decision policy that reads the opponent's physical hand to decide whether to play Eri before its revealing effect has cheated, even though the same identities are legally known during the ensuing selection prompt.

This is a new owner-knowledge **phase transition** missing from ordinary `actorObservation`, which correctly hides opponent-hand identities and exposes only `opponentPublic.handCount`. It matters for lockdown/supporter-control opponents and opponent response quality. It does not prove Eri is better than an immediate attack in any given game.

## Boundary and implemented capability

`simulation/twinleaf/agent50-eri-revealed-item-prompt.cjs` implements:

- `offerEriBeforeAttack(view,first)`: **an uncertain alternative** before an already payable attack only when held Eri, publicly known opponent hand of at least five, unused Supporter quota, no public Supporter lock, owner at least four Prizes remaining, and the game past the first turn. Returns only `kind:'play-eri-reveal'` with exact **owner** hand index; does not look at the opponent's hand or infer Item content. It is not wired into the integrated policy.
- `observeEriRevealedItems(state,seat,prompt,SuperType,TrainerType)`: refuses access unless a genuine unresolved `ChooseCardsPrompt` belongs to the acting owner, its source card list **is identical by reference to the opponent's hand**, its card filter restricts to Items, min0/max2 and noncancelable, the prompt message is the discard message, and the exact Eri TEF printing is in the acting player's in-resolution Supporter zone. Only at this point does it return matching **revealed Item printings and indices**. No opponent secret identities enter earlier root decisions, and only legally revealed eligible Items enter the selector.
- `resolveEriRevealedItemPrompt(...)`: chooses the first two of the valid revealed Items, maps back to the **same physical card objects**, validates with the native prompt, and constructs a native `ResolvePromptAction`. This is a *validity baseline*. A tactical scorer must compare competing revealed Items and should be independent of opponent private zones outside this effect.

The printed Eri effect and pinned engine implementation are the primary game evidence. The engine's actual `ChooseCardsPrompt` state, physical movement and both-seat behavior must be confirmed by compiled CI, not inferred from the upstream TypeScript alone. Supporter quota and direct attack follow-through receive dedicated assertions.

## Tests and integration plan

- Pure `tests/agent50-eri-revealed-item-prompt.test.cjs`: two-Item selection from opponent reveal, zero-Item empty prompt, rejecting wrong owner/source/Supporter/phase/options, and invariance under changing other hidden zones. Included in preexisting manual canonical workflow pure step, no new workflow.
- Pinned native `tests/agent50-eri-revealed-item-prompt.native.test.cjs`: genuine Eri PlayCardAction for both seats with and without Item targets, exact physical removal of two opponent Items (or no items), unchanged non-Item physical cards, Eri moving to discard and prompt closure. Additional staged physical scenario: original printed Iron Thorns ex under Thunder with Speed + DCE has payable Volt Cyclone; authentic Eri should resolve before subsequent owner attack and not consume attack. Both seats, actual Store attack damage and turn closure checked. The staged board is **not a naturally dealt full match**.
- Existing `.github/workflows/agent7-canonical-actor-bilateral.yml` now has one new named Eri native step after conditional Special Energy. The first run was [CI 41145567076](https://github.com/FlareZ123/experiment-01/actions/runs/41145567076), initially queued at creation. Its source head predates appended after-Eri attack tests, requiring a subsequent head-inclusive run to validate those.

## Benchmark implications

The root proposal and post-reveal prompt selector are **unwired** to the canonical bilateral bot. They cannot produce natural-game Eri decisions as shipped. Hidden-information safety is substantiated for the pure boundary only once the genuine prompt origin is proved. A full competitively evaluated policy still needs native-decision integration, end-to-end repeated trials against every original opponent and fair opponent reply. The global benchmark remains 29/32 exact source 60s, 0 competitively qualified games, and no demonstrated 99.5% fixed-deck result.
