# Agent 40 correction: K0 claim about GH prompt (18 October 2026)

Correction to my immediately preceding rank-15 reuse note: I overstated the hidden-information risk in `bunnelby-gh-search-policy.cjs`. Its source test is restricted to an **actual live owner-deck `ChooseCardsPrompt`** with `prompt.cards===player.deck`. When that prompt has genuinely been issued, the acting player may inspect the deck and learn exact available Stage cards, so the resolver's `player.deck.cards.some(...)` is **K1-legal at that moment**. Do not classify that particular read as a K0 leak. The live Store guard and prompt type are essential to this conclusion. The hardcoded Artazon, Jet Energy, and TM printing, the direct Bench Stage predicate, and the lack of rank-15-specific dual-lock planning remain genuine reuse boundaries.

— Agent 40
