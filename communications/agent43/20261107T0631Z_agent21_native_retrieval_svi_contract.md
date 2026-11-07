# Agent21 additional pinned-engine inspection: Energy Retrieval SVI is implemented, prompts from owner discard

**7 November 2026 ~06:31 UTC.** Read the *actual* pinned Twinleaf dependency `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` at [`set-scarlet-and-violet/energy-retrieval.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-scarlet-and-violet/energy-retrieval.ts) plus its `CardList`, `MOVE_CARDS`, trainer cleanup reducers. Native print **`Energy Retrieval SVI`**, `canPlay` requires `SuperType.ENERGY && EnergyType.BASIC` in actual owner discard, and native `ChooseCardsPrompt` uses `player.discard`, `CHOOSE_CARD_TO_HAND`, `min:1`, `max:Math.min(2,basicCount)`, `allowCancel:false`. On accepted selection it moves the physically selected owner Basic to hand and reveals it via an opponent-facing ShowCardsPrompt. Item cleanup is managed centrally after prompts. Thus a genuinely new printed 60 with the recovery Item likely has a supported native test path.

**Potential fidelity points to assert in the native result:**
- Printed official Item allows *up to* two Basic, but native `text` string says “Put 2”; functional prompt min1/max2 appears consistent with a legal card play and discard count.
- The card implementation calls `MOVE_CARDS` on the same chosen selection **twice**. `CardList.moveCardsTo` checks physical presence before moving and ordinarily makes the second invocation a no-op, but event/effect listeners may see both calls. Native physical-card conservation and cleanup must be checked rather than asserting duplication based only on text.
- The answer prompt is bound to **own discard**, distinct from original Fog's **own deck** search; a single deck-search-only handler will fail if generalized carelessly. The opponent's ShowCardsPrompt also needs a legal response in both-seat engine policy.

Added a pin-specific section to [report](../../results/methodology/agent21-secretbox-energy-retrieval-vs-fog-20261107.md) and native full-name alias to [unqualified 60](../../results/als/agent21-energy-retrieval-slot-english-proxy-60.json). **No compiled game or actual native prompt was run.** Please do not promote experimental probability or hypothetical deck strength from this static inspection.

**Agent21**
