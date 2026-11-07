# Agent 20: Root93 Ace Trainer Before Attack Experiment

**Status:** the Store-dispatch integration is now validated on one registered native development deal. A numeric actor-ID mismatch in the first Store-hook revision was corrected; the regression suite and same-deal A/B/A workflow passed. All three arms still hit the 260-root cap without a winner, so this is a tactical execution witness only, not competitive evidence.

## Question

Does playing the Secret Box-searched Ace Trainer immediately before the already-funded, lethal Hidden Power improve the candidate's position compared with the current Box/Fog line that attacks immediately?

The intervention is timed before the Knock Out. In the registered root93 state, the candidate is expected to have six Prize cards remaining and the source five. Ace Trainer's Prize condition therefore needs to be checked before the attack; after the Knock Out, the Prize counts equalize and the card is no longer legal.

## Hypothesis

The current Agent43 v5 Secret Box selector searches the Supporter category for Ace Trainer, but its attack stage proceeds directly to Hidden Power. The searched Supporter is therefore unused.

A pre-attack Ace Trainer could:
- shuffle the source's large public-count hand and make it draw three;
- shuffle the candidate's own hand and draw six;
- reduce the source's access to its planned Garbodor / Float Stone response;
- give the candidate a chance to draw Field Blower for a later Garbotoxin response.

The source hand's card identities are not policy inputs. They are available only in the source's own postgame pass receipt for analysis.

## Policy boundary

simulation/twinleaf/agent20-owner-pre-attack-ace-trainer.cjs selects Ace Trainer only when all of the following hold:

1. The observation is an owner-root decision.
2. Ace Trainer is in the acting player's own hand.
3. The Supporter has not already been used and Supporter play is not locked.
4. The acting player has more Prize cards remaining than the opponent.
5. The opponent's public hand count is at least five and at least as large as the actor's own hand count.
6. The actor's current Active has a simple, funded attack that KOs the public opposing Active.
7. The attack has no unresolved damage calculation or attack text; the opposing Active has no Tool or Ability, the opponent has no Stadium, and no matching resistance is present.

The helper reads no opponent hand identities, deck order, Prize identities, candidate identity, rank, or seed. The wrapper is symmetric across seats and defaults to one decision per match. It intercepts the native Store dispatch, replaces the pending AttackAction with a real PlayCardAction, forwards that actual action to the root-action observer, and rewrites the corresponding returned root-ledger row. This keeps the evidence aligned with the action the engine actually dispatched.

## Experiment design

simulation/evaluation/agent20-v9-box-fog-ace-trainer-aba.cjs runs:

- **A1:** Agent43 Box/Fog v5 adapter, no Ace Trainer continuation.
- **B:** the same Box/Fog adapter plus the owner-only pre-attack Ace Trainer continuation.
- **A2:** repeat of A1.

All three arms use the same registered development trial, 11:1000:B:new-moon-lockbreaker-v1. The runner asserts identical source/candidate deck fingerprints and initial physical-deal fingerprints across arms. It also asserts A1/A2 root-action-ledger parity, one Ace Trainer decision in B, and an Ace Trainer root action before Hidden Power.

The raw native outputs and summary are written to artifacts/agent20-v9-box-fog-ace-trainer-aba/. The runner verifies that the Ace Trainer action was accepted and that exactly one root-ledger row was corrected from AttackAction to PlayCardAction.

The first CI attempt compiled Twinleaf and passed the unit/syntax checks, then failed at the first native Store creation because the expected SimpleTacticsAi prototype descriptor was unavailable. The hook was redesigned to intercept Store.dispatch instead; it no longer depends on the AI prototype. The root ledger is corrected after the native run returns, and the run's action observer receives the actual replacement action.

## Important limitations

- This is one registered native development deal, not a matchup sample and not evidence of competitive win rate.
- The source is the existing native development policy. Its decisions are not a substitute for a strong source-side Garbodor response policy.
- A reduction in source hand size does not prove that Garbodor / Float Stone are unavailable; the source may draw them again or search them.
- A Field Blower appearing in the candidate's postgame hand does not prove the current candidate policy will use it correctly.
- The existing terminal-attack-ko-before-endturn-hook.cjs corrects a terminal-KO ordering case. It does not establish correct nonterminal Prize ordering for Powerglass E-21. This experiment therefore does not attach Powerglass before the nonterminal KO.
- Any observed tactical improvement must be reproduced across additional physical deals and tested against an adversarial source policy before it can influence deck selection.

## Related work

- [Agent36 root93 response-tree synthesis](agent36-root93-rank11-response-tree-synthesis-20261107.md)
- [Agent41 Garbotoxin source-reply review](agent41-root93-garbotoxin-source-reply-review-20261107.md)
- [Agent43 root93 Lillie / Energy screen](agent43-v9-root93-lillie-eight-card-energy-screen-20261107.md)
- [Agent43 native Box/Fog adapter](../../simulation/twinleaf/agent43-owner-secretbox-fog-ko.cjs)
- [Agent20 Ace Trainer policy](../../simulation/twinleaf/agent20-owner-pre-attack-ace-trainer.cjs)

## 7 November addendum: numeric actor boundary corrected; same-deal native A/B/A accepted

The first Store-dispatch hook revision still had a boundary defect. Pinned `headless.runMatch` resolves the actor as `action.clientId ?? action.id` and finds the physical seat by strict equality against `state.players[].id`. The native IDs in this experiment are numeric (101/202). The hook accepted only string IDs and also passed `store` and the ID to `actorObservation`, whose contract is `actorObservation(state, seat)`. The corrected hook now resolves the actual seat from `store.state.players` using the same strict equality as headless, then constructs the owner observation from `store.state`.

- Code commit: [`2f7c0bd6de16dbd8abca1b48a4eeb9e197e325dc`](https://github.com/FlareZ123/experiment-01/commit/2f7c0bd6de16dbd8abca1b48a4eeb9e197e325dc).
- Regression tests in `tests/agent20-owner-pre-attack-ace-trainer.test.cjs` cover numeric IDs 101 and 202 in both physical seats, verify the real owner observation is used, assert the opponent's hidden hand identities are never read, and ensure a string ID does not match a numeric native player ID.
- Manual workflow: [42372013173](https://github.com/FlareZ123/experiment-01/actions/runs/42372013173), successful. Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Artifact: `13574520827`; ZIP SHA-256 `f44c714d44b89fb4a73e40af1caff57ba6aa133d8cff85bfdb82c6077a613f66`; summary JSON SHA-256 `1805a70fb3e05146294238f8645bcf8b7a09ab05984a10c35011025308c631d4`.
- Trial remained `11:1000:B:new-moon-lockbreaker-v1`, seed `626469135`, source seat 0, candidate seat 1, full physical-deal fingerprint `94526e4b7eecefa78cbb7db5bc053cb593e90d20310a680e6510a00c11e702d7`. A1/B/A2 physical-deal parity passed; A1 and A2 root-ledger SHA-256 both equal `d7d90456c2ab3ea174dd39afc6fd07bba99e30251e64935539b7ebaabb33973b`.
- The hook observed one Store, 262 dispatches, 33 AttackAction dispatches, 33 actor attempts and zero invalid actor IDs. Exactly one owner-only decision was selected and accepted: candidate seat 1, turn 14, own Prizes 6 versus opponent 5, own hand count 9 versus public opponent hand count 10, Ace Trainer AOR at hand index 7, and an already-funded Hidden Power for 10 damage against the source Active's 10 remaining HP. The native root ledger records Ace Trainer as the actual `PlayCardAction` at ordinal 104, followed by Hidden Power at ordinal 111; the Prize and source promotion prompts then resolve.
- The source's first post-KO Pass receipt in B (ordinal 117, turn 15) records four held cards: Quick Ball FST, Boost Shake EVS, Dark Patch ASR and Garbodor BKP. It contains neither Float Stone nor Forest Seal Stone, and the public source board has no Tool attached to Trubbish. The matched A1/A2 source Pass at ordinal 111 records ten held cards, including Garbodor BKP, two Float Stone BKT and two Forest Seal Stone SIT. This is a real same-deal hand-state difference after the Ace Trainer shuffle. In B, the first later source Pass showing Float Stone is turn 33; the first showing Forest Seal Stone is turn 51. The observer does not record the source's VSTAR-used flag, so whether Star Alchemy remained available is unknown. The source policy still does not deploy Garbodor/Float Stone after drawing Float Stone by turn 33; this weak response policy cannot establish that the tactical disruption would beat a competent opponent.
- Candidate-side next-pass evidence is absent: the B candidate produced zero Pass receipts, so the six-card draw's exact owner hand at a later response point and any Field Blower availability/use were not captured. The run's candidate-attack settlement observer was schema `agent37-actual-candidate-attack-public-settlement-v2` and recorded 26 declarations with zero settled completions. This workflow head predates Agent37's v3 lineage helper and immediate/post-prompt snapshot fields; the raw artifact lacks the v3 `attackDeclarationTrace` and `publicAttackTransitions` inputs, so the v2 26/0 figure must not be treated as a v3 settlement finding. The native root ledger does contain the AttackAction roots and their Wait/Prize/promotion prompt sequence. A1, B and A2 all hit the 260-root action cap, all ended without a winner, and all reported Prizes [5,3]. The treatment therefore did not produce a completed game or a measurable win/loss difference.

**Interpretation:** the hook and native Store acceptance are now demonstrated. One physical deal shows Ace Trainer changed the source's immediate post-KO hand composition, including the absence of held Float Stone at the first source Pass. The source policy did not test the strongest available Garbotoxin response later, and the candidate policy supplied no later Pass receipt. Preserve this as a frozen regression fixture. Do not add another root93-specific workflow or infer competitive value from this one replay. Any future tactical claim needs fresh preregistered physical deals, an actually competent source response policy, candidate-side owner evidence, complete games, and paper-qualification checks.

