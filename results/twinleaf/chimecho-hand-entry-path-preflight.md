# Chimecho CIN Bell of Silence hand-entry boundary under Path to the Peak

**Agent 5, 17 October 2026. Evidence class: official Japanese Q&A, card-text audit, pinned-revision source inspection, and pending actual-Store regression. No competitive games qualified.**

## Rules anchor

The supplied English card database lists `Chimecho CIN 43`'s **Bell of Silence** as a Psychic-cost 10-damage attack imposing a prohibition against playing Pokémon with Abilities from the opponent's **hand** during their next turn. The [official Pokémon Card Japanese Q&A results for チリーン](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%81%E3%83%AA%E3%83%BC%E3%83%B3&regulation_faq_main_item1=all) explicitly refuse using Eelektross's own Ability to enter from the hand after the attack, while allowing the distinct discard-origin Giratina and Darkrai-GX Ability routes in otherwise described cases. The restriction checks the zone and the card's printed Ability, not only whether the Ability can successfully resolve once in play.

A [contemporaneous Aichi Regidrago Top16 pilot's first-person ruling correction](https://note.com/hpionkaeka/n/na17f92eb559a) dated May 16 claims that Path to the Peak cannot defeat Bell of Silence's hand-entry prohibition: Path suppresses Abilities on Pokémon **in play**, and a hand card has not yet been placed. The specific Chimecho-Path combination was not found as a separately published official question; treat the hand-vs-in-play conclusion as card-text-based interpretation corroborated by the pilot's reported consultation.

The detailed rulebook supplied for this project distinguishes persistent player-targeted attack-origin restrictions from Pokémon-targeted attack effects (C-19). Even if an Ability would be suppressed after entry, a legal-entry check needs to occur first.

The immutable [Aichi full-list registry](../aichi-2026/full-decklists.json) identifies exactly **one Chimecho CIN 43** in final rank **31, Yuhi Yokoyama / Dusknoir Chimecho**. That source printing makes this a real opponent-policy coverage issue for the fixed-deck benchmark rather than a hypothetical card outside the evaluated field.

## Pinned Twinleaf implementation audit

Pinned upstream Git revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` at `vendor/twinleaf`. **Read-only inspection; no upstream modification.**

- `ptcg-server/src/sets/08-sun-and-moon/set-crimson-invasion/chimecho.ts` routes its attack `WAS_ATTACK_USED(effect, 0, this)` through `OPPONENT_CANNOT_PLAY_POKEMON_WITH_ABILITIES`.
- `ptcg-server/src/game/store/prefabs/effect-of-attack-prefabs.ts` builds `{pokemonWithAbilities:true}` and applies a player-level lock via `PlayLockEffect`.
- `ptcg-server/src/game/store/effect-reducers/play-pokemon-effect.ts` explicitly refuses `PlayPokemonEffect` when `effect.player.cannotPlayPokemonWithAbilities` is active and `effect.pokemonCard.powers.some(power => power.powerType === PowerType.ABILITY)`. It checks the **card's stored printed powers**, not the Stadium's current suppression outcome.
- `ptcg-server/src/game/store/effect-reducers/game-effect.ts` separately repeats the check for `EvolveEffect`.

**Static prediction:** the pinned source appears to prevent an Ability-bearing Basic from hand while Bell of Silence is active, whether Path is in play or not, and to permit a Basic without a printed Ability. Source inspection alone cannot certify the behavior of a real Store dispatch, attack resolution, prompts, duration or special entry effect.

## Proposed actual-Store falsification

New research-only `simulation/twinleaf/chimecho-hand-entry-path-action.cjs` constructs a playable staged midgame Store with exact printed Chimecho CIN, active Shadow Rider Calyrex V and an empty defender Bench. It applies the attack's real reducer directly (as a prior-turn lasting lock) and then dispatches an actual `PlayCardAction` to the Bench in the defender turn. Eight combinations cross:

| Attack-origin lock | Path to the Peak | Card played from hand | Expected |
| --- | --- | --- | --- |
| No | No / Yes | Tapu Lele-GX GRI (has Ability) | Bench entry allowed |
| Yes | No / Yes | Tapu Lele-GX GRI (has Ability) | Bench entry refused |
| No | No / Yes | Shadow Rider Calyrex V CRE (no printed Ability) | Bench entry allowed |
| Yes | No / Yes | Shadow Rider Calyrex V CRE (no printed Ability) | Bench entry allowed |

The test asserts both acceptance and zone retention/entry. It tests the hand-entry restriction through **one actual action** per staged case; it intentionally **does not** simulate the full preceding attack, endturn expiry or indirect Ability-based discard-origin entry. The unlocked Tapu Lele branch may generate an optional Wonder Tag prompt, but the entry-versus-rejection assertion does not claim correct entry-Ability handling; separate hooks/tests already cover that known simulator issue.

The source fixture was added to the existing **manual-only** `.github/workflows/aichi-lock-board-tests.yml` after its Vileplume Item-lock Store test. **CI status: unverified**, as manual dispatch in this invocation was blocked by a tooling safety check. Treat code and predictions as a pending regression until an actual compiled run passes.

## Important qualification boundaries

Passing the pending Store matrix would close the narrow printed Ability hand-entry question for this staged card pair. It would leave Chimecho's attack announcement, duration, stadium provenance, full competitive behavior, other cards' effects, source-rank31 opponent-policy competence, replay authenticity and exact 32-opponent coverage open. There is no basis for a rank31 matchup probability or a field win-rate claim.

## 17 October 2026 follow-up: full Store turn boundary and Stage 1

The earlier eight-case Basic hand-entry matrix subsequently passed the existing manual-only lock workflow at [CI 39070820038](https://github.com/FlareZ123/experiment-01/actions/runs/39070820038). This supersedes the original *unverified* status for that specific staged matrix only.

Agent 5 added a four-case printed-Ability Stage 1 evolution matrix (Trubbish BKP to Garbodor BKP, with and without Path, with and without Bell), and a `PassTurnAction` after each rejected entry to check that the player-targeted lock expires after the affected turn. The first two expanded CI runs, [39078117087](https://github.com/FlareZ123/experiment-01/actions/runs/39078117087) and [39078286938](https://github.com/FlareZ123/experiment-01/actions/runs/39078286938), **failed** an immediate post-pass assertion. Source inspection revealed the pinned Store replaces its state with a deep-cloned backup when a PlayCardAction throws; the test retained the detached original defender object, so those failures did not establish a real lock-duration defect. The corrected fixture [commit b2a7b3f](https://github.com/FlareZ123/experiment-01/commit/b2a7b3fbff2f9a747f0fd1b2771bb5e42f5e7bf8) reads the current Store player after a rejected action, before checking return-zone and expiry. The new compiled run [39078497176](https://github.com/FlareZ123/experiment-01/actions/runs/39078497176) must pass before these 12 cases are classified as validated. Preserve the failed runs as fixture-fidelity diagnostics.

All cases are artificial midgame positions, including a legally aged Trubbish. They cannot establish real attack initiation, a full rank-31 game, opponent policy competence, paper-fidelity for other actions or a field win-rate estimate. Competitive games qualified: **zero**.

**Targeted compiled verification:** The pinned-engine job in manual [CI 39078497176](https://github.com/FlareZ123/experiment-01/actions/runs/39078497176), source head `b2a7b3fbff2f9a747f0fd1b2771bb5e42f5e7bf8`, reports `Run node simulation/twinleaf/chimecho-hand-entry-path-action.cjs` **completed: success**. The preceding Vileplume action step also succeeded. Consequently the source's eight Basic combinations, four Stage 1 evolution combinations, and blocked-hand-entry turn-expiry assertions passed the actual compiled Store test. The rest of the larger manual workflow contains unrelated diagnostics and is accounted for separately. The earlier two failures remain a reproducible warning about reference aliasing after rejected action rollback.
