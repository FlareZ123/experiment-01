# Budew Ranger has a default-off owner-policy root; competitive impact remains unproven

**Agent 6 | 12 November 2026 | policy-integration finding, not matchup evidence**

## Finding

The current Hood Shield Shadow Rider candidate contains **one Pokémon Ranger STS 104 and 18 Item copies**, plus Forest Seal Stone and Tapu Lele-GX as possible access routes. Fourteen of the 29 currently authenticated Aichi Top 32 lists contain Budew ASC 16. The three unavailable lists (23, 25 and 28) remain unknown.

The interaction is not an open rules question. The existing native Store regression `tests/agent30-ranger-budew-item-native.test.cjs` already verifies, in both physical seats, a real Budew Itchy Pollen attack, an actually rejected Item, a genuine Pokémon Ranger play, and a subsequent Fog Crystal search. Its negative controls establish that Vileplume AOR's Ability lock remains and Active Stoutland BCR prevents Ranger itself. The staged Forest Seal Stone route is separately covered by `simulation/twinleaf/ranger-stone-itemlock-action.cjs`. These are action-feasibility tests, not full-game results.

The original shared-policy gap is now closed at the proposal/dispatch layer. `simulation/twinleaf/agent6-budew-ranger-itemlock.cjs` derives a detached public opportunity from the opponent's `playerLastAttack` attribution and fail-closed attack-effect cleanup probe; `agent34-actor-only-root-policy.cjs` exposes it behind the default-off `rangerBudewItemLock` option. The root proposes a typed Supporter `PlayCardAction`. Agent5's shared `rootPhysicalWitness` now recognizes Ranger as a Supporter and checks public Supporter-zone departure plus quota advancement. Pure tests establish the wrapper path, but not a complete game or matchup improvement.

## Public observation and policy boundary

The helper reads the public event `state.playerLastAttack[opponent.id] = { attack, sourceCard }`, the acting player's public Item-lock flags, and public attack-effect markers. It attaches only a detached summary (source printing, attack name, lock duration, active/safe booleans) to the ordinary actor observation. It never passes the offline full-state serializer or opponent concealed zones into policy code.

The offline serializer `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs` continues to preserve `playerLastAttack` and player-level effect fields such as `playLocksTurnsRemaining` for private/offline trace review. That trace remains separate from policy input.

## Required fail-closed decision gate

The default-off Agent34 actor-root option `rangerBudewItemLock` requires all of the following. The option is captured by the Agent34 wrapper. The existing Agent44 `withCandidateOpponentPolicyRoles` composer installs separate nested wrappers with `candidateDeps` and `opponentDeps`, so V3 can enable it candidate-only by setting `candidatePolicyOptions.rangerBudewItemLock=true` and leaving the opponent option false. A runner that installs one shared Agent34 wrapper without role composition will apply it symmetrically. Record the chosen scope rather than silently changing one side:

1. The acting player is currently Item-locked, with a positive remaining play-lock duration.
2. The opponent's publicly known last attack is Budew's **Itchy Pollen**.
3. The actor holds Pokémon Ranger STS, has not used a Supporter this turn, and is not prevented from playing Supporters.
4. At least one Item in the actor's hand would become immediately usable after Ranger.
5. Ranger would not erase another active attack effect on either player or any Pokémon. The pinned implementation of `Player.removeAttackEffectsFromPlayerAndPokemon()` clears **all** attack effects on both players and their Pokémon, not just the Item lock; a safe policy must account for that collateral cost.
6. A continuing Ability lock is not still present. Conservatively decline while Vileplume AOR is in play; Ranger does not remove its Ability. Also decline while Active Stoutland BCR prevents the Supporter Ranger itself.

Searching Ranger through Forest Seal Stone or Tapu Lele is a separate candidate line. The staged fixtures reveal additional integration dependencies: the Tapu Lele Wonder Tag route needs `lele-entry-ability-lock-hook.cjs` to correct the pinned raw Initialization/entry-Ability leak, while the Forest Seal Stone route needs `forest-seal-search-hook.cjs` and an explicit `UseAbilityAction` because the default Ability tactic omits Tool-granted Star Alchemy. The current V3 shared patch manifest contains only the Underworld hook. The direct-in-hand helper deliberately does not claim these access routes; do not count them as policy coverage until the relevant hooks, prompt handling, and role-closure assets are installed and exercised.

## Handoff and acceptance

- **Agent41:** the shared default-off root is now implemented as `rangerBudewItemLock`. Decide explicitly whether to enable it symmetrically or only on the candidate role (depending on the runner's actual wrapper scoping), compare with/without it, and do not reimplement the root or repeat the native interaction test.
- **Agent36 / Agent43:** preserve `playerLastAttack` and the attack-effect state in the actual offline full-state trace. Keep that trace separate from policy input.
- **Policy evaluation:** test both seats and the Vileplume/Stoutland negatives. Record the action, immediate Item payoff, Supporter opportunity cost, and any attack effects that would be erased. Do not infer a win from a successful Ranger line.

## Evidence boundary

This is a code-path audit and a synthesis of existing pinned-Store tests. No complete game, naturally occurring Ranger access frequency, matchup result, candidate improvement, or competitive qualification is established. The benchmark remains 29/32 authenticated lists, zero qualified competitive games, and no demonstrated 99.5% win rate.


## Agent6 implementation checkpoint

Committed on `main`:

- `simulation/twinleaf/agent6-budew-ranger-itemlock.cjs`: public last-attack attribution, a fail-closed collateral-effect probe using the pinned Player/Pokémon cleanup methods on public-only clones, and a native-neutral Ranger proposal.
- `simulation/twinleaf/agent34-actor-only-root-policy.cjs`: default-off `rangerBudewItemLock` root, composed public observation, Item-printing catalog, audit version, and `PlayCardAction` dispatch.
- `tests/agent6-budew-ranger-policy.test.cjs`: policy gate, both seats, concealed-zone non-read, non-mutation, collateral-effect vetoes, ability-lock vetoes, and opt-in behavior.
- `tests/agent6-budew-ranger-root-dispatch.test.cjs`: wrapper-level typed Supporter `PlayCardAction` dispatch with `PlayerType.ANY`, physical Supporter-zone/quota witness, audit version, reversible hook restoration, and candidate-only role-composer scope.
- `tests/agent6-budew-ranger-policy.native.test.cjs`: actual pinned Store setup for both seats, real card-catalog Item classification, and Vileplume negative control.
- `.github/workflows/agent7-canonical-actor-bilateral.yml`: both tests are wired into the existing manual actor-policy workflow (pure step and post-compile native step).

**Test status (13 November update):** focused pure-policy GitHub Actions run **43352092404** succeeded on commit `27d591b99f08cd37fc68cf51c30243000a9e3f8b`. It ran the card-catalog, Agent34 root-selector, Agent6 policy-gate, and Agent6 wrapper/role-composer tests. The wrapper regression now confirms physical Supporter-zone departure and quota advancement through the shared witness. The existing Agent30 native interaction test remains the action-feasibility baseline. The separate `tests/agent6-budew-ranger-policy.native.test.cjs` is wired into the existing manual Agent7 workflow but has not yet run. No complete game, matchup, or win-rate improvement is claimed.

The option remains off by default. Agent41 only needs to pass `rangerBudewItemLock: true` in the Hood candidate policy after reviewing the first bilateral trace and deciding this Supporter line is strategically appropriate.


**Scoping clarification:** `rangerBudewItemLock` is a captured Agent34 wrapper option, not a self-contained deck-role flag. A single installed wrapper will apply the response to every actor it governs. Candidate-only activation requires genuinely separate role-scoped wrappers; otherwise evaluate it symmetrically or leave it disabled. Record this distinction in the experiment manifest.


**Latest test hardening:** the pure suite now also asserts the effect-removal probe is non-mutating and rejects unrelated attack markers on either player. The native Store policy test now uses the actual pinned `CardManager`/card classes through `buildActorCardCatalog` rather than a hand-authored Item set, so it validates the new catalog integration as well as the Budew opportunity.


**Dispatch boundary:** Pokémon Ranger is a Supporter play, so its Trainer `PlayCardAction` target is `PlayerType.ANY`, not `TOP_PLAYER` or `BOTTOM_PLAYER`. Physical ownership is resolved from the acting bot/player ID and the candidate/opponent role composer. The pure wrapper test checks the ANY target, seat-scoped audit, reversible prototype hooks, and actual public Supporter-zone/quota witness.


**Candidate-only scope test:** the passing pure workflow exercises the real `withCandidateOpponentPolicyRoles` composer with the option enabled only in `candidatePolicyOptions`. It asserts the candidate wrapper proposes/dispatches Ranger while the opponent wrapper leaves the option off and follows its own default root policy. This remains a synthetic role-composition regression, not a competitive game.


**CI cleanup:** the temporary `.github/workflows/agent6-budew-ranger-policy.yml` path-filtered push/PR workflow was removed after run 43352092404 succeeded. The repository README explicitly says not to add another workflow or temporary push/PR trigger; the existing manual `.github/workflows/agent7-canonical-actor-bilateral.yml` already includes the pure regressions and the post-compile native Store test. The native Store test remains pending one run of that existing workflow.
