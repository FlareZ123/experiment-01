# Agent35: exact v9 Lillie-after-Pass native-pair audit

**7 November 2026 | Agent 35 | Independent archival audit | Developmental Store evidence, zero paper-qualified games.**

## Question

Does converting the first repeated candidate Pass into an actor-owned, held Lillie's Determination Supporter actually recover an attacking continuation? Agent7 had already built and run the appropriate both-seat, owner-only Lillie opt-in on the original Aichi rank11 versus the fixed New Moon Lockbreaker v1. I independently downloaded both completed CI archives and analyzed the matched physical deal and all actual accepted Store actions rather than creating a duplicate policy.

**Source archives and integrity:**

- **A baseline:** [CI 42332015390](https://github.com/FlareZ123/experiment-01/actions/runs/42332015390), artifact 13558301530, ZIP SHA256 b0780756f1b4a7e2c0be1e73349416b18f2cb15d4e3c81fad093a08291168474, extracted JSON SHA256 ad78b652d48015329109ac333f4401b1e44458b8b8f66d79a6d24d9c839c676f.
- **B native Lillie:** [CI 42333343834](https://github.com/FlareZ123/experiment-01/actions/runs/42333343834), artifact 13558074462, ZIP SHA256 cb92cf1cc592ad2e4b2324de35469308c974c5653da5bd56b8fa68f460ddea5a, extracted JSON SHA256 7c9c95e37cf9c466d87e053f8ed481844d7acdbc54a619415e8a9d8ab8e5d659.
- Both use source rank11 seat0, candidate New Moon seat1, the same original 60 and candidate 60, actual source-first turn, exact source physical-deal SHA256 a6e4ba442cc784498de9d2938b47e8e42b6e9591fc07558e505ac2cd9094b317 and same full two-player deal SHA256 94526e4b7eecefa78cbb7db5bc053cb593e90d20310a680e6510a00c11e702d7. The pinned Twinleaf engine is a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. These are source-exposed retrospective policy revisions, and the research code versions differ.

## Exact real-native first difference

The first **93 actual accepted Store-root objects, ordinals 0 through 92, match exactly**, including actor seat, action, turn and prompt identities. At ordinal **93**, candidate seat1, global turn14, A selects Pass while B selects a real Store-accepted Lillie's Determination. B then settles the actual ShuffleDeckPrompt at root95. Its live root audit reports one accepted Lillie, zero rejected, acting owner turn14, hand index4, after its existing policy would have passed. The intervention was configured for both physical seats and was selected from the acting owner's own hand.

The owner had hand10, deck35, and six Prizes before root93. By the next candidate Pass at root98, after also Benching Squawkabilly ex, hand7 and deck36 were reported. That is consistent with the printed Lillie shuffle and eight-card draw, but the observed counts and settled prompt are **not** a complete independent per-object draw/shuffle certificate.

| Genuine native receipt measurement | A, unchanged | B, Lillie |
| --- | ---: | ---: |
| Accepted roots, global turns | 209, 40 | 186, 35 |
| Native outcome | Source rank11 wins | Source rank11 wins |
| Final remaining Prizes, source/candidate | 0 / 5 | 0 / 6 |
| Candidate AttackAction roots, total | 7 | 6 |
| Candidate attacks after ordinal93 | 1 | **0** |
| Candidate accepted PassTurnAction roots | 13 | 11 |
| Candidate accepted Energy card plays | 3 | 4 |
| Candidate genuine Pass episodes with zero attached Energy on entire own board | 13 of 13 | 6 of 11 |

**The additional Trainer action did not restore an attack in this selected physical deal.** B physically played Basic Psychic Energy on turn26 and Telepathic Psychic Energy on turn28, yet the candidate never announced another attack after root93. Pass-view boards at turns26, 28 and 30 show 1 or 2 attached Energy spread across the entire owner board while Active Mewtwo & Mew-GX held at most one. At turn32 Active Lunatone OBF held only one Energy, insufficient for its printed three-Energy Moon Press. The after-Lillie problem therefore includes Energy recipient, attack funding and follow-through. The observed Lillie usage is a native decision-execution success with no demonstrated payoff success.

**Two concrete subsequent decision anchors:**

- At B **root98**, turn14, candidate Pass happened with Escape Rope BST physically in its seven-card owner hand and **zero** attached Energy throughout Active and five Bench Pokémon. An Item lock is not demonstrated by the Active Trubbish FST alone, but legality of an actual Rope play, opposing promotion choice and resulting tactical value require a live Store/payment-and-response check.
- At B **root174**, turn32, the candidate's owner hand included Secret Box TWM, one post-first-turn dead Battle VIP Pass, Escape Rope, Canceling Cologne, Field Blower and other physical cards. It still passed with one Energy on Active Lunatone. The necessary three-other-card Secret Box payment looks possible as a hand-count screen, yet exact disposable resources, legal searches, item locks, opportunity costs and meaningful attack sequence are **unverified**.

## Interpretation and recommended next experiment

This is a **single retrospective developmental counterexample to treating extra Trainer plays or hand refreshes as effective policy improvement**. The final Prize difference cannot estimate the treatment's real win-rate impact: Lillie alters the subsequent physical shuffle, the chosen seed was previously exposed, opponent decision quality is inadequate, and full paper legality, time limits and event adjudication have not been independently certified. Neither 209-root nor 186-root native terminal is a qualified competitive game. A treatment A-prime Lillie control, fresh deal, or distributional A/B efficacy estimate is absent.

The next useful general-policy test is owner-only, printed-cost-aware root98 Escape Rope and root174 Secret Box decisions, each coupled to accepted physical action, target and payment, a funded attack or control payoff, and an independently competent opponent reply. Validate exact root-wrapper activation and unchanged pre-intervention roots. A successful Item action alone should not be promoted. The Lillie alternative could itself be dominated by another resource line at root93, which remains unknown.

## Reproduction

The independent, read-only [paired audit](../../simulation/evaluation/agent35-v9-lillie-pair-audit.cjs) consumes the two extracted issue25-common-v9.json artifacts in A/B order. It fails closed on different source/candidate or physical deals, a changed 93-root prefix, an absent native accepted Lillie, a missing genuine shuffle prompt, or an inconsistent owner-Pass ledger. It emits a minimized Pass report using only the acting owner's hand counts and its public board Energy counts. The [single runnable regression](../../tests/agent35-v9-lillie-pair-audit.test.cjs) covers four cases. **Node 22 local test: 4/4 pass; complete native archive pair audit: pass.** No new Actions workflow, engine patch, deck change or simulated match was needed for this independent result.

**Collective qualification remains:** 29/32 authenticated original card-name/count inventories (ranks 23, 25 and 28 missing), zero competitive full games, no selected final fixed 60 and no evidence for 99.5% field wins.
