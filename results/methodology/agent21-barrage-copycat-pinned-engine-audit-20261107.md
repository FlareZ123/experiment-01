# Ω Barrage and Mimikyu Copycat history in pinned Twinleaf

**Author:** Agent21  
**Date:** 7 November 2026  
**Pinned engine:** `vendor/twinleafgg` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Status:** source audit and research-owned exact-pair adapter committed; actor integration and manual CI pending

## Question

Does the pinned Twinleaf revision expose a reliable way to distinguish an Ω Barrage second-attack prompt from ordinary attack-copy prompts, and what history should be exposed to Mimikyu Copycat?

## Pinned-source findings

### 1. Barrage is represented by an explicit card-power marker

The pinned Bunnelby PRC definition in:

`ptcg-server/src/sets/07-x-and-y/set-primal-clash/bunnelby.ts`

declares a power with:
- `name: 'Barrage'`;
- `powerType: PowerType.ANCIENT_TRAIT`;
- `barrage: true`;
- text stating that the Pokémon may attack twice in a turn.

The card's own `reduceEffect` handles Burrow and Rototiller. The generic extra-attack handling is in the game effect reducer.

### 2. The generic Barrage path has a clear sequence

In the pinned:

`ptcg-server/src/game/store/effect-reducers/game-effect.ts`

the attack resolver reads the active Pokémon card and calculates:

```ts
hasBarragePower = attackingPokemonCard.powers.some(
  power => power.barrage
);
```

After the first attack resolves, when either the attack or an active power has Barrage and the nested effect has not already used Barrage, the engine:
1. resolves state checks;
2. asks the player with `ConfirmPrompt(..., GameMessage.WANT_TO_USE_ABILITY)`;
3. if accepted and the active card has a Barrage power, creates a `ChooseAttackPrompt` using `GameMessage.CHOOSE_ATTACK_TO_COPY`;
4. supplies the same active Pokémon card (and potentially its first Tool) in the prompt's attackable-card list;
5. resolves the selected second attack with `_barrageUsed = true`, preventing a third Barrage recursion.

The actual Bunnelby confirmation message is `WANT_TO_USE_ABILITY`. The separate `WANT_TO_USE_BARRAGE` enum is not used in this pinned execution path.

### 3. CHOOSE_ATTACK_TO_COPY is generic, not a Barrage-specific marker

The pinned:

`ptcg-server/src/game/store/prefabs/copy-attack-prefabs.ts`

uses `GameMessage.CHOOSE_ATTACK_TO_COPY` in the generic copy-attack helper. Other copy-attack cards also call this helper, including cards that choose attacks from an opponent's Active Pokémon, a Bench Pokémon, or a supplied Pokémon list.

Therefore, the prompt message alone cannot identify an Ω Barrage follow-up. The combination of:
- active source card included in the prompt's card list; and
- `sourceCard.powers.some(power => power.barrage === true)`

is a much stronger marker. A robust tracker should also pair the follow-up with the immediately preceding declared attack from the same player, source Pokémon, and turn.

## Implications for the research-owned history adapter

The tracker now identifies the follow-up only when all of the following hold:
- the prompt is `ChooseAttackPrompt` with `CHOOSE_ATTACK_TO_COPY`;
- the active source card is present in the prompt's offered cards;
- the active source card has `powers.some(power => power.barrage === true)`;
- the immediately preceding recorded attack belongs to the same player, source card, and turn.

It tags the preceding attack and follow-up with an internal pair ID and ordered first/second roles. `getCopycatChoices(playerId)` returns the verified pair, filtering GX attacks and the opponent's own Mimikyu Copycat attack individually. Other copied-attack effects remain eligible when they are non-GX. When no pair exists, it returns only the opponent's actual last attack if eligible; it does not fall back to an earlier attack when the actual last attack is GX or Mimikyu's Copycat. Full ordered history remains available separately for diagnostics.

The detached public receipt maps internal pair IDs to a sanitized `barragePairIndex` and role, validates exactly two ordered rows from the same source printing and turn, and does not expose the internal identifier. The native Bunnelby fixture now asserts the exact pair and uses the selected pair member for Copycat. A separate fake-Store test checks that a generic non-Barrage `CHOOSE_ATTACK_TO_COPY` prompt does not create a pair, and that uncopyable last attacks do not fall back.

The manual workflow `.github/workflows/mimikyu-copycat-regression.yml` now runs the native fixture, pair-set tests, and public-receipt tests. This manual workflow has **not** yet been dispatched. The local fake-Store state-machine reproduction passed, but the pinned-engine integration tests remain pending CI.

## Existing native fixture

`simulation/twinleaf/agent8-mimikyu-burrow-native.cjs` exercises the actual pinned Store sequence for Bunnelby:
- first AttackAction;
- ConfirmPrompt with `WANT_TO_USE_ABILITY`;
- ChooseAttackPrompt with `CHOOSE_ATTACK_TO_COPY` and Bunnelby among the offered cards;
- second attack;
- opponent turn transition.

The fixture verifies both source attack orders and shows that the pinned Store's `playerLastAttack` retains the original AttackAction attack, while the research-owned tracker retains both attack records. This validates the adapter's observation path for the Bunnelby fixture; it does not yet show that the common actor policy consumes the exact pair.

## Limitations

- This is a source audit of one pinned engine revision, not an upstream compatibility claim.
- The official paper ruling still governs the permitted Copycat choice; Twinleaf implementation is evidence about the prompt sequence, not authority for paper legality.
- The actor-observation integration remains pending; the tracker and detached receipt now expose the exact-pair fields for that consumer.
- No full-game or competitive win-rate result follows.

## Relevant repository artifacts

- Tracker: `simulation/twinleaf/copycat-multiattack-history.cjs`
- Public receipt: `simulation/twinleaf/agent8-public-event-receipt.cjs`
- Native fixture: `simulation/twinleaf/agent8-mimikyu-burrow-native.cjs`
- Test: `tests/agent8-mimikyu-burrow-native.test.cjs`
- Manual workflow: `.github/workflows/mimikyu-copycat-regression.yml`
- Previous-turn availability result: `results/methodology/agent21-copycat-history-availability-20261107.md`

## 7 November correction: copied-attack metadata is not Mimikyu Copycat eligibility

A review of the official Pokémon Card Game FAQ found that the previous implementation's blanket `copycatAttack === true` exclusion was too broad. The official FAQ page [here](https://www.pokemon-card.com/rules/faq/search.php?page=621&regulation=all&sc_group_id=728%2F1000) establishes three distinct cases:

- Mimikyu may copy Zoroark BREAK's Foul Play, even though Foul Play itself selects and uses another Pokémon's attack.
- After an Ω Barrage Pokémon uses two different attacks during one turn, Mimikyu's owner may choose either attack.
- Mimikyu may not copy an attack that was itself used through an opponent Mimikyu's Copycat.

Therefore the paper eligibility predicate is now **non-GX and not an opponent Mimikyu's own Copycat attack**. Twinleaf's generic `copycatAttack` metadata cannot substitute for this rule: Regidrago VSTAR's Apex Dragon is non-GX and must remain eligible despite that metadata flag. The correction is research-owned and does not modify the pinned submodule.

Committed changes:
- Tracker correction `c58453208aa3970f4800e1313eef709a200b9f4c`, documentation follow-up `db1dafc6b7fd2966cc72b14c7dc1f581968fac6a`, and strict non-GX check `bbd2c6be1753f3dad5e3f0ae91722c50221ec007`; source-card name is retained on each attack record and the exported predicates are `isMimikyuCopycatAttack` / `isMimikyuCopycatEligibleAttack`.
- Test expansion `4426897c6ae8b0ded5ac81b5ea7bfec263e0fb43`, assertion repair `ceb8338da139c0657336cbb072917b1b662bb7a9`, and Foul Play fixture alignment `853cfd8ae3d20be9b5c8d85547388a3f96cffc50`: Apex Dragon remains eligible despite its `copycatAttack` metadata; Zoroark BREAK's Foul Play remains eligible under the official ruling; GX and Mimikyu's own Copycat are rejected; temporary history dispatch restores the original record.
- Receipt marker `mimikyuCopycatCompatible` added by `0d92ddd8d4abacde6d71af81263bab944913119b` with tri-state semantics: `null` when the previous-turn snapshot or tracker choice API is unavailable; otherwise `true` only when the actor's Active Pokémon has a printed Copycat attack and the tracker-certified choice set is non-empty; `false` when history is known but either condition is absent. This is a history-compatibility marker only, not a full attack-legality or native-settlement claim. Tests are in `tests/agent7-copycat-history-root.test.cjs` (initial marker test commit `b345a69f389e7c8570fee906f435915a3c7e90f8`, Apex-positive fixture `3490e0dcfd5426994433d9719401ee0a3d26e8e9`).

The existing manual .github/workflows/mimikyu-copycat-regression.yml was dispatched twice after the tracker/receipt changes. Run 42392432758 (head 88ea23718a3393daf2d57f8b2ff2249dab97bcdc) and the stricter follow-up 42392802431 (head bbaef6a324fc2cac98309d985edb85f76e437dc7) both completed failure with 31 tests, 23 passing and 8 failing. In both runs, tracker tests 1–5, actor-root tests 6–7 (including the Apex-positive marker), immediate native Burrow tests 14–15, and receipt tests 24–31 passed. All eight failures were Agent8's multiattack native Copycat cases 16–23, each BLOCKED_BY_EFFECT, on both physical seats and both attack orders.

A follow-up hypothesis that the copied Bunnelby attack was inheriting Ω Barrage was tested with a reversible source-power isolation hook. It did not observe a Mimikyu Copycat reducer, so it was not evidence for that hypothesis; the diagnostic hook and test were removed from the workflow and repository. The logs showed that the Agent8 fixture decoded the source-turn ChooseAttackPrompt result to an Attack object and validated that object, then dispatched the raw {index, attack} object. The Store rejected the raw payload with BLOCKED_BY_EFFECT. Agent21 corrected the fixture to dispatch the decoded Attack object in commit d74edf37a332c0672edcf7d820e2562de322c6e2. A second fixture defect measured source-turn deck/discard/hand deltas after the subsequent Copycat response, allowing a copied Rototiller to contaminate the source-turn metrics. The probe now snapshots those zones immediately after the source turn and before Copycat.

Manual workflow run 42395883784 succeeded on head 327686eabff3634364b139eb47c945d1150a0ae5 with the pinned Twinleaf revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05:
- Primary Copycat regression suite: 31/31 passed. This includes tracker eligibility, actor-root selection in both seats, public receipt, immediate Burrow, both Ω Barrage attack orders, and adapter selection of the second attack.
- Follow-on Copycat compatibility suite: 5/5 passed.
- Headless hook options: 1/1 passed.
- Counter-policy and Heavy Ball multiplicity suites: 11/11 passed.
- Spent-GX/spread composition: 2/2 passed.
- The staged champion Source Store contract selected Timeless-GX through copied Apex Dragon, then Power Beam on the bonus turn. The Store recorded usedGX=true and the final declared attack as Copycat. The two-stage policy test passed in both seats. The contract explicitly reports qualifiedForCompetitiveInference=false.

The run also preserved two important limits. The native baseline still retains only one attack record after Ω Barrage, while the research tracker plus temporary history dispatch exposes the verified pair and restores the native record afterward. The stale-attack probe shows the pinned PassTurn reducer can retain an older attack; its correction was tested with injected reducer states, not a legal turn-by-turn game. The staged Apex/Timeless/Power Beam contract uses a preconstructed Source Store state. It does not establish the natural-deal setup frequency, a full matchup result, a deck win rate, or anything near the 99.5% target.

## Relationship to Agent22's source-dealt rank1-vs-rank10 fork

The staged Apex/Timeless/Power Beam contract above should be read alongside [Agent22's source-dealt rank10 Copycat fork](../aichi-2026/agent22-rank10-live-copycat-fork.md), which is stronger natural-game evidence but still limited. That report reconstructs one source-dealt rank1 Shadow Rider vs rank10 Regidrago game. On the counterfactual turn 27, Mimikyu began benched with one Psychic Energy, Dialga-GX was in hand, and three Psychic Energy were in discard. The proposed sequence used Mysterious Treasure to discard Dialga-GX, Night Stretcher to recover Psychic Energy, attached the second Psychic, retreated Latias ex, then used Copycat to select Apex Dragon and Dialga-GX's Timeless-GX. A real Store ChooseAttackPrompt selected Timeless-GX, and the next turn showed usedGX=true.

That one-seed counterfactual still lost: the Regidrago side later used Koraidon ex's Kaiser Tackle, and the champion side finished with four Prizes remaining. The report also marks full action replay mechanics as unverified (`parametersCaptured=false`). It does not establish a win, a robust policy, or a matchup rate. In particular, it does not demonstrate that the natural game reached the second Copycat -> Apex Dragon -> Radiant Eternatus Power Beam attack; that second-stage sequence is currently covered only by the separate preconstructed Source Store contract above.

The combined evidence therefore says the Mimikyu line is reachable in at least one source-dealt counterfactual and the nested GX/bonus-turn chain is executable in a staged Store contract. It also exposes a losing Regidrago response and a major gap in natural-deal frequency, policy robustness, and complete replay validation.
