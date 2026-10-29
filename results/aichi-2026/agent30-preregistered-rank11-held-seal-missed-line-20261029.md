# First independently registered rank-11 held-Seal opening missed by both native opponent policies

**29 October 2026 | Agent 30 | concrete source-deal counterexample, not a game-win demonstration.**

## Source and physical attestation

The original preregistered 32-arm cohort is preserved as [GitHub Actions run 40918541683](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683), downloadable artifact **12917901362**, file `agent41-prospective-canonical-32.json`. In source-rank-11 seed **2307728896**, physical **source seat B** started second in the real Store. This one source physical deal was paired with both `champion-reference` and `new-moon-lockbreaker-v1`, with matching source-deal SHA and complete native root ledgers.

Using the pinned `a9905a76` setup, [exact source-60 printing order](full-decklists.json), and the runner's seeded xorshift32, we independently reconstructed the first coin and both Fisher-Yates shuffles. This reproduces the **source first-seven SHA256 receipt in every one of the eight independent registered rank-11 deals**, matching all 16 corresponding candidate arms. The two native engine-name aliases required for fidelity are `Mega Absol ex M1L` and `Professors Letter BKT`. The original source opening receipt here is `3fdd3da86ad13250027d49ee30b49b01b6f752fa787af34c78af3a0eebae993a`.

The ranked source's seven were, in observed physical order:

`Dark Patch ASR; Float Stone BKT; Battle VIP Pass FST; Oranguru V ASR; Escape Rope BST; Carmine TWM; Mega Absol ex M1L`.

The actual setup choice was **Active Oranguru V, Benched Mega Absol ex**, confirmed independently by native `ChooseCardsPrompt` and the source post-Pass public board. The six source Prizes were **two Darkness Energy, Mega Absol ex, Battle VIP Pass, Latias ex and Muscle Band**. The original source's first natural draw was **Forest Seal Stone SIT**. The native root prefix shows one coin, one first-choice confirmation, one shuffle per seat and a single starting-Pokémon choice per seat; it contains no setup mulligans or compensation. Neither candidate's first turn affected the source deck/hand. The predicted source hand at its global turn-2 first decision is therefore exactly:

`Dark Patch; Float Stone; Battle VIP Pass; Escape Rope; Carmine; Forest Seal Stone`.

Both original copies of **Trubbish, Garbodor and Boost Shake** remain accessible outside this opening hand and six Prizes. The source board has space for Trubbish. No opponent Item or Tool lock was established before its first decision: champion played one Psychic Energy and passed; New Moon played Fog Crystal, Benched Duskull and passed. In **both** native games, the source immediately issued `PassTurnAction` on turn 2, with `sourceAudit.opportunityTurn=null` and no Boost Shake sequence.

## A specific, paper-legal first-own-turn alternative

The source can use its held **Battle VIP Pass** to place Trubbish from deck onto an available Bench slot; attach **Float Stone** from hand to Trubbish; attach **Forest Seal Stone** to its Active **Oranguru V**; use that V Pokémon's **Star Alchemy** once-per-game VSTAR Power to search the unprized **Boost Shake**; then play Boost Shake to find the unprized **Garbodor BKP** and evolve the already-Tooled Trubbish immediately. Boost Shake ends the turn. This produces a Tooled Garbodor with Garbotoxin eligible to function, subject to other live lock interactions.

This line relies on the actual printed effects and rules: Battle VIP Pass is usable during the owner's first turn, held Forest Seal Stone grants a V a VSTAR Power, a Pokémon may use an Ability in the Active Spot, and Boost Shake explicitly permits evolution on the first turn / on a just-played Pokémon. It needs no Supporter, manual Energy attachment, or hand discard. The source first turn is global turn 2, so Battle VIP Pass is still eligible. The pinned native [Forest Seal Stone](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/forest-seal-stone.ts), [VIP Pass](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/battle-vip-pass.ts), and [Boost Shake](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-evolving-skies/boost-shake.ts) code independently corroborates the available target structure. This is a reconstructed alternative, **not a successfully executed native Store counterfactual**; prompt acceptance, the exact resulting Garbotoxin board and continuation still require a focused live test.

## Why this changes the research priority

The currently frozen rank-11 direct source wrapper requires **held Boost Shake** and omits the held-Forest-Seal-Stone route. This seed is a **definite missed held-Seal structural opportunity on two prospectively frozen opponents**. It directly improves on a generic claim that 0/12 source-first arms is evidence of weak behavior: the six independent source-first deals alone did not supply a decisive opportunity-condition check. The actionable counterexample is specifically this **source-second** deal whose raw cards and actual pre-turn opponent actions are authenticated.

The [source-locked CJS replay](../../simulation/evaluation/agent30-rank11-source-setup-replay.cjs) and [Node regression fixtures](../../tests/agent30-rank11-source-setup-replay.test.cjs) preserve all eight authentic opening SHA receipts and this selected deal's reconstructed zones. **Do not feed this omniscient replay into the acting bot's decisions.** Implement a general owner-visible Forest Seal Stone line, select actual search targets only through live authorized prompts, verify real acceptance and the two opposing continuation policies, and test a genuinely new preregistered prospective cohort. The reported counterexample is useful for a focused development regression and **must not be treated as an additional independent competitive game**, much less a win.

**Competitive qualified games: zero. Overall 99.5% target unverified.**

## Existing held-Seal policy already covers this owner-visible state

The repository already contains [`rank11-held-seal-policy.cjs`](../../simulation/twinleaf/rank11-held-seal-policy.cjs), with [an owner-hand predicate](../../simulation/twinleaf/rank11-held-seal-opportunity.cjs). Manual pinned [CI 39189260924](https://github.com/FlareZ123/experiment-01/actions/runs/39189260924) previously completed five authentic source-B held-Seal lines in 128 deals, with Tool-equipped Garbodor persisting to the next opponent turn. None were competitively qualified.

The updated [seed regression](../../tests/agent30-rank11-source-setup-replay.test.cjs) now passes the reconstructed *acting hand and public board* to this existing predicate while forbidding reads of hidden deck/Prize contents. The expected opportunity is exactly `{route:'vip',tool:'Float Stone',vTarget:{slot:'active',index:0}}`. The useful next implementation is composition of the existing direct-Shake and held-Seal policies into the same frozen common source runner, followed by native Store validation and a new prospective cohort. An additional specialized held-Seal wrapper would duplicate previously tested work.
