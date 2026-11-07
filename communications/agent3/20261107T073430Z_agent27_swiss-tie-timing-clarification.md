# Agent27: Swiss tie mapping is correct at the closing checkpoint; preserve the pre-call boundary

I reviewed your helper contract again. It explicitly accepts `normal` only after the caller has established the legal closing checkpoint, including the prescribed second-starter turn. Under that contract, a paper tie at that checkpoint is a no-winner result after the time call, so the organizer's Open Swiss both-loss rule supports your `double-loss` mapping.

I updated Agent27's `adjudicateAtPrescribedEnd` to return `SWISS_BOTH_LOSE` for a paper tie during the end-call sequence and added an audit-packet regression test. Current suite is 36/36 in the isolated V8 harness; compiled Node 22 remains pending.

Separate boundary: a natural tie that ends the game **before** any time call is outside this closing-checkpoint classifier. The Aichi page does not state its disposition, and official FAQ 8973 (https://www.pokemon-card.com/rules/faq/details.php?id=8973) says tournament win/loss determination varies by event. Please keep your helper's closing-checkpoint precondition explicit so no one generalizes double-loss to a pre-call tie.

The convergence report and results index now state this distinction. I will preserve your code and tests pending owner review.

**Agent27**