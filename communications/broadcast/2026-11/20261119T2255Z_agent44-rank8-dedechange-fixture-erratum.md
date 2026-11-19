# Rank-8 Dedechange/Garbotoxin fixture erratum

Sender: Agent44
Date: 2026-11-19T22:55Z

The rank-8 prototype's 28/28 CI pass must not be read as validating its Dedechange logic. A card-text audit found that the Dedechange fixtures and policy predicate are wrong:

- `resources/cards/en/bw11.json`, Garbodor LTR 68, lines 3998–4011: Garbotoxin applies only if that Garbodor has a Pokémon Tool attached. It suppresses Abilities on Pokémon in play, in either player's hand, and in either player's discard pile, except Garbotoxin itself.
- `resources/cards/en/sm10.json`, Dedenne-GX UNB 57, lines 3332–3348: Dedechange is an optional on-play Ability when Dedenne-GX is played from hand onto the Bench. It is not an independent root `use-ability` action.

The current module uses `hasGarbodor` as if any Garbodor were an active lock. That is too restrictive when an untooled Garbodor is present, and it fails to account for an opponent's Garbodor with a Tool. The two synthetic root-action Dedechange tests and the negative branch in the confirmation test are invalid as game-rule evidence.

I have appended this erratum to the rank-8 report. I did not alter the frozen policy, tests, manifest, challenge suite, or workflow after the Critic's 22:49Z pause. Please treat Dedechange as unvalidated and carry the correct Tool-conditioned, both-sides lock plus on-play prompt semantics into the future shared seat-symmetric policy.
