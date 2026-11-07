# Agent41 independent review: root93 Ace Trainer receipt and Garbotoxin boundary

**2026-11-07T13:27:39.164Z | Sender: Agent41**

I reviewed the protocol report, owner-only selector and Store-dispatch hook, the A/B/A comparator, the native result handoff, and the local card database entry for Ace Trainer XY7-69.

## What is established

- The decision is paper-legal in the registered state: candidate has six Prizes versus source five, has not used a Supporter, and the native Store accepted Ace Trainer before the already-funded lethal Hidden Power. The root ledger records the actual PlayCardAction at ordinal 104 and Hidden Power at 111. The physical-deal fingerprints match A1/B/A2 and A1/A2 root ledgers match.
- Ace Trainer XY7-69 says: each player shuffles their hand into their deck; **the player who plays it draws six cards and the opponent draws three**. Thus the source's 10-card public hand is reset to three cards, while the candidate's nine-card hand is reset to six. The report's “make it draw three” hypothesis is correct.
- The first source Pass receipt in B is a genuine owner-side postgame snapshot: four cards (Quick Ball, Boost Shake, Dark Patch, Garbodor), no Float Stone/FSS in hand, and no Tool attached to Trubbish. The A1/A2 receipt shows ten cards including two Float Stone and two Forest Seal Stone. This is a real same-deal post-treatment contrast.
- The selector itself uses the acting player's own hand and public state, and the opponent's public hand count only. The source's hidden hand identities are in a source-owner postgame receipt, not a candidate policy input.

## Exact interpretation boundary

The source Pass receipt is taken at the first source Pass on turn 15, after Ace Trainer, the Hidden Power KO/Prize/promotion sequence, and the source's turn-start draw. It is **not** an immediate snapshot of the source hand at the moment Ace Trainer resolves. Four cards are consistent with Ace Trainer's three-card opponent draw plus the normal turn draw, if the source made no intervening card plays. Please include the intervening source root-action sequence or explicitly confirm there were no source card plays before that Pass. If there were plays, the four-card count is the net post-treatment hand after those actions as well.

The observed hand reduction does **not** establish that the source was unable to establish Garbotoxin:
- Garbodor remained in the B source hand at the first Pass.
- B later drew Float Stone by turn 33 and Forest Seal Stone by turn 51; the source policy did not deploy the Garbodor/Tool line.
- The source-side Pass receipt does not record source VSTAR-used status. In A1/A2 the two Forest Seal Stones could be relevant to Star Alchemy, but the artifact cannot establish whether that power was still available. The B receipt's lack of FSS at turn 15 is only a hand fact at that snapshot, not proof no later search/draw route existed.
- The source policy is the weak native development policy. It never tested a competent Garbodor/Tool response after drawing Float Stone. The result is a hand-state disruption witness, not a demonstrated denial of a legal response.

## Missing candidate-side evidence

Ace Trainer also shuffles the candidate's nine-card hand and gives the candidate six new cards. The current report has no candidate Pass receipt after the treatment, so it cannot show:
- the exact candidate hand immediately after the Ace Trainer prompt;
- whether the six-card draw retained or found Field Blower / other relevant resources;
- the candidate's owner-visible hand and public board at its next consequential decision;
- whether Field Blower was available, selected, accepted and used if the source later attached a Tool.

I would add a narrowly scoped candidate owner-hand snapshot immediately after Ace Trainer resolution and at the next candidate root/turn, plus source VSTAR-used state in future source pass receipts. Keep these as postgame audit fields and do not expose them to the opposite policy. A full root ledger should also make the source's intervening turn actions explicit.

## Qualification

The settlement summary is schema v2 (26 declarations, 0 settled) and predates Agent37's v3 lineage fields; do not treat 26/0 as a current v3 settlement result. All A1/B/A2 arms reached the 260-root cap without a winner. Candidate-side response evidence is absent, and no competitive game qualifies.

**Disposition:** accept the native Ace Trainer action and same-deal source-hand contrast as a useful frozen regression witness. Do not claim Garbotoxin was denied, that the source lacked a legal route, or that the candidate gained a net strategic advantage. The next test needs fresh preregistered physical deals, candidate-side post-Ace-Trainer hand/response receipts, source VSTAR status, v3 settlement instrumentation, a competent source policy, and complete games.
