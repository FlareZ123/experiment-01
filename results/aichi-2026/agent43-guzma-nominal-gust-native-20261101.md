# Conditional owner-visible Guzma gust: native prompt and decision tests

**Agent 43 | 1 November 2026 | pinned Store developmental policy, not a competitive deck result**

## New policy boundary

The existing both-seat `agent43-guzma-prompt-continuation.cjs` physically restores the owner's planned incoming Benched attacker after an accepted Guzma Supporter, but previously delegated the opponent's preceding gust choice to the generic bot.

The new **default-off** `nominalGust:true` variant chooses a different, authentically native-valid opposing Bench target only if all these conditions hold:

- The accepted Guzma root has an owner-visible plan for a specific incoming Benched attacker with `anticipatedMissing:0`.
- That incoming Pokémon has an already payable attack with fixed positive printed base damage, empty attack-effect text, and no variable-damage expression, non-GX attack flag, and only recognized attached Basic Energy.
- The native first opposing Bench option would **survive that printed base damage**, while another native-valid offered Bench option would have remaining HP at or below it.
- The actor-only frozen public board can identify both targets. An unknown or uninspectable target HP, other prompt kind, unsupported Energy, ambiguous attack, or no alternate nominal KO causes an ordinary fallback.

The selector uses the owner's public Bench and attached Energy, the opponent's **face-up public Bench**, and the native validator's already-eligible menu. It never reads opposing hand/deck/Prize identities. The public catalog is based on static printed cards. A selected `ResolvePromptAction` must satisfy the native pending `ChoosePokemonPrompt.validate`. After native Store dispatch, a physical-card identity receipt verifies that the selected opposing target genuinely became Active. The owner-target continuation remains a separate second prompt, preserving the previous native physical-identity receipts.

This is a **nominal** KO opportunity: attack prevention, other damage modifications, Strength of legal follow-up choices, remaining attachments, opponent response, and tournament-clock time can negate it. The policy does not assert its chosen line is optimal or even stronger than the generic bot's actual choice; the comparison is explicitly against the first native legal menu option.

## Reproducible implementation

- [Pure decision boundary](../../simulation/twinleaf/agent43-guzma-nominal-gust-frontier.cjs) with selected and abstention predicates.
- [Existing native Guzma bridge](../../simulation/twinleaf/agent43-guzma-prompt-continuation.cjs), extended with default-off `deps.nominalGust===true`, validated opponent physical acceptance and owner continuation, and nonqualified audits.
- [Pure choice tests](../../tests/agent43-guzma-nominal-gust-frontier.test.cjs) exercise changed nominal target, first-target preservation, resource abstentions, invalid target, and opponent-hand noninterference.
- [Two-seat bridge tests](../../tests/agent43-guzma-prompt-continuation.test.cjs) use controlled Store prompts.
- [Real native Store regression](../../tests/agent43-guzma-prompt-native.test.cjs) stages actual pinned printed Pokémon and a native Guzma BUS. For both seats, an injectable proposed second opposing Bench target passes the genuine Store's first target prompt and is physically promoted; the original second own-target prompt still promotes the expected Oranguru V ASR. The injected target decision in this test isolates the **native bridge**; it does **not** assert that the pure nominal scoring function would select that actual opponent card.
- [Existing manual native CI](../../.github/workflows/agent43-guzma-recipient-native.yml) compiles the pinned Twinleaf Store and executes these tests. No new workflow or upstream mutation was added.

The existing `eligibleDamagingAttack` predicate in `agent2-held-guzma-mobility-frontier.cjs` is now exported for direct reuse. Its implementation and existing callers were not otherwise changed.

## Executed validation and failure provenance

| Manual CI run | Outcome | Meaning |
| --- | --- | --- |
| [41343442157](https://github.com/FlareZ123/experiment-01/actions/runs/41343442157) | **30 passed, 7 failed / 37** | First attempt identified missing `eligibleDamagingAttack` export, causing a `TypeError` in all new positive-branch tests. Existing baseline tests passed. This was a real implementation error, not a gameplay failure. |
| [41343670936](https://github.com/FlareZ123/experiment-01/actions/runs/41343670936) | **37 passed / 37** | After the shared predicate's export was corrected, the same compiled pinned-engine suite passed with both pure and mock-prompt tests. |
| [41343903441](https://github.com/FlareZ123/experiment-01/actions/runs/41343903441) | **38 passed / 38** | Adds a genuinely native pinned Store both-seat first opposing Guzma physical-target test with native continuation of the own Bench switch. `sourcefirst_development` was false; this run includes **no full simulated games**. |

Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The 38-test CI run is the positive native plumbing witness. Source printed Aichi opponent sixties and candidate lists are unchanged by these commits.

## Consequence and remaining gate

One more previously delegated, strategically important target choice now has a concrete owner-only **experimental** decision path and physically validated native prompt acceptance. This guards against treating a raw `Guzma -> arbitrary first opposing Bench` connector as a strategically complete tactical line.

**The tactical proposal is explicitly forwarded by the shared canonical and bilateral runners, but remains default-off.** The canonical flag is `guzmaNominalGust:true` alongside `guzmaOwnerPromptContinuation:true`; the bilateral runner takes `actorGuzmaNominalGust:true` alongside `actorGuzmaPromptContinuation:true` and `actorOnlyComposition:true`. The environment opt-in is `AGENT43_GUZMA_NOMINAL_GUST_DEV=true` with its associated existing bridge flag. A preregistered full-game comparison has been queued separately; no performance inference is drawn from native staged tests. No win probability, repeatable candidate advantage, or improvement toward 99.5% follows from the 38 tests. Any future ranking experiment must explicitly wire the opt-in into a common two-seat policy, freeze identical opposing source and candidate 60s, precommit unscreened independent seeds, preserve both physical starting seats, and report genuine selected gust opportunities along with caps, failures, and opponent replies. False-positive nominal-KO selections under damage modifiers must be treated as evidence against broadening the heuristic.

**Project qualification remains: 29/32 authenticated original source 60s, zero competitively qualified games, no demonstrated fixed-list 99.5% result.**

## 1 November follow-up: canonical route and full native tactical payoff

The [39/39 native regression CI 41344328564](https://github.com/FlareZ123/experiment-01/actions/runs/41344328564) proved explicit forwarding via `simulation/evaluation/agent7-canonical-actor-composition.cjs` and `simulation/evaluation/agent41-bilateral-v2-development.cjs`, preserving default-off behavior and refusing a gust opt-in when the own-Guzma bridge is absent.

The next staged test used **actual pinned-native Pokémon** and no injected opponent target selector. An incoming `Lunatone OBF` with three physical `Psychic Energy MEE` in its own Bench, a first opposing Bench `Oranguru V ASR` at 210 HP, and a second opposing Bench `Lunatone OBF` at 90 HP produced a real native-valid `Guzma BUS` action. The actual printed 100-damage, blank-text `Moon Press` was payable, and the complete heuristic chose the second opponent Bench in **both physical source seats**. The native Store physically accepted that target and promoted the correct own Lunatone. [CI 41344713686](https://github.com/FlareZ123/experiment-01/actions/runs/41344713686) passed **40/40**.

A stronger follow-through test in the same staged cases dispatched actual `AttackAction('Moon Press')`, resolved native `ChoosePrizePrompt` using an occupied Prize slot, and checked the opponent's 90-HP Pokémon physically entered the discard and the attacking player took **exactly one native Prize**. The first version of the Prize-continuation test failed at the genuine `ChoosePrizePrompt`: [CI 41344980451](https://github.com/FlareZ123/experiment-01/actions/runs/41344980451), **39/40**. It was corrected by implementing the genuine pinned prompt's physical `CardList[]` selection, with no face-up Prize inspection. [CI 41345229967](https://github.com/FlareZ123/experiment-01/actions/runs/41345229967) then passed **40/40**, including this genuine first gust, second switch, attack, Knock Out and Prize settlement for both seats.

The exact source pool currently contains literal `Guzma` in **25 of 29** authenticated original Top-32 60s, as counted from `full-decklists.json`; the counts are **printed card presence**, with no evidence of real-game prevalence of the specific funded-Bench/available-nominal-KO condition.

To measure exposure rather than infer value, [eight newly drawn secure seeds and 16 fixed printed rank-11 registered arms](registrations/agent43-rank11-fresh-guzma-gust-20261101.json) were committed **before any of their native games**, with both candidate 60s and both seats. The manual [32-arm paired runner](../../simulation/evaluation/agent43-guzma-nominal-fresh-rank11-pair.cjs) compares baseline versus exactly one opt-in flag, retains errors and caps, and demands original-60 source-deal matching. Execution is tracked by the [manual native workflow](../../.github/workflows/agent43-fresh-rank11-guzma-gust.yml). Its result must be analyzed separately; **do not treat a queued job or selected staged positive tests as a completed competitive campaign.**

The staged native 100 damage applies in this unprotected example. Defense Tools, Weakness, attack-prevention effects, Stadiums, and tactical alternative uses may materially change the actual payoff of the nominal selector. A genuine isolated staged Prize result has no positive match win-rate denominator.
