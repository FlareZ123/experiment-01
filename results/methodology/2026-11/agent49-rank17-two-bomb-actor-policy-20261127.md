# Rank 17 — source-bound two-Electrode Electro Rain continuation (development result)

**Agent 49; 27 November 2026.** Review branch `agent49/rank17-two-bomb-executable-20261127`, based on one-Bomb host/worker branch `agent49/rank17-one-bomb-rain-20261127` at `af4e227eba2b9f26492a1acaab4281f910d63b65`. This is **not merged**, **not a game**, **not a qualified opponent-policy admission**, and **not a win-rate estimate**.

## Decision changed

Before this patch the rank-17 policy's pure `planRainTurn` could discover a same-turn *two* Extra Energy Bomb terminal, but the actor worker admitted only a one-Bomb root and its continuations. The pure solver's theoretical path therefore could not be played by the actual policy. This patch closes one bounded executable path without changing the source 60, the shared V3 host/worker protocol, the pinned Twinleaf submodule, paper hooks, frozen fixtures, CI, or existing candidate policies.

## Exact constructed public window

- Own active: Alolan Raichu UNM 57, undamaged and no Energy. Own Bench: exactly two live Electrode-GX CES 48 as Bomb sources; other Bench slots empty. Own discard: four Reversal Energy PAL 192 and four Counter Energy CIN 100. Own six Prizes remaining. Both Electrode abilities appear as distinct legal action-frontier entries.
- Opponent: two Shadow Rider Calyrex VMAX CRE 75, one Active and one Benched, each 320 printed HP and 60 existing damage (270 remaining); both worth three Prizes. Opponent six Prizes remaining. No Stadium or Tools and no public damage/effect prevention/reduction. The state is *constructed*, not observed gameplay.
- Source text: `resources/` / supplied card database `cards/en/sm7.json`, Electrode-GX number 48, says attach five discard Energy to non-GX/non-EX Pokémon, then KO Electrode. There is no globally once-per-name clause in that printed text. Two self-KOs give the opponent four Prize cards: six → four → two, leaving the own player with more Prizes and activating the relevant Reversal/Counter Energy multiplier on evolved Raichu.
- Pure existing solver output at this window: **two** Bombs, all eight discard Energy attached (5 + 3), seven Energy cards discarded by Electro Rain (four Reversal + three Counter), **18 Lightning units**, 18 distinct 30-damage packets split 9/9, six opponent Prizes taken. A one-Bomb plan cannot take the final six Prizes in this public state. The worker must still verify *native attack legality* through its actual offered attack frontier.

## Actual bounded actor-policy route

1. On a supported root, `r17TwoBombRainWindow` requires the unique two live Benched Electrode sources, exact present Energy and public HP/Prize/card-printing data, a terminal two-Bomb pure plan, a safe opponent Prize margin greater than four, and an exact unblocked root action.
2. Select the first actual CES48 Ability; resolve its source- and destination-bound `AttachEnergyPrompt` through the already implemented shared `energy-transfers` host. It allocates exactly five distinct physical discard Energy occurrences to Active Raichu, never directly to Pokémon-GX/EX.
3. Electrode's self-KO occurs in the engine. On the subsequent *actual actor root*, require the opponent Prize count to be exactly two lower and the same Raichu to remain Active. **Re-run** the existing `r17OneBombRainWindow` against the current visible board with precisely one live remaining Electrode. Do not blindly execute the original two-Bomb forecast. Choose the second real Bomb only if that new one-Bomb plan independently wins.
4. Complete the second `AttachEnergyPrompt`, which now transfers the three remaining Energy cards in the concrete example, and re-evaluate the real next actor root to require an offered, funded Electro Rain attack.
5. Complete the existing physical Energy-discard `ChooseCardsPrompt` and repeated thirty-damage `PutDamagePrompt`. Packet ordinals must be unique and sum to the exact native damage declaration. The existing reversible Electro Rain paper hook aggregates repeated same-target packets before damage modifiers.

Negative controls: initial opponent four Prizes (self-KOs would lose) **never initiates two-Bomb execution**. If new public damage prevention appears between the first and proposed second Bomb, the second-Bomb continuation abstains rather than honoring a stale win forecast. A missing/changed source or mismatched prompt/sequence also fails closed.

Unsupported paths remain: two Bombs with a Benched Raichu needing promotion; Active Electrode plus a second Bomb; arbitrary mid-chain Trainer/Supporter sequencing; any target with Tools/Stadium or unknown damage modifiers; nonterminal partial Rain; mid-chain engine prompt families not represented by the existing CES/Rain host. Do not infer general rank-17 competence.

## Executed development receipt

- Exact review-branch worker `simulation/evaluation/2026-11/agent50-rank17-raichu-electrode-opponent-policy.cjs`, test `tests/2026-11/agent49-rank17-active-electrode-bomb-to-rain.test.cjs`, common `agent36-prompt-projection.cjs`, strict `agent49-policy-protocol.cjs`, existing `electro-rain-damage-hook.cjs`.
- On the patched review branch after commit `80684d81cb70902cd42ba763c499ce62e67e56d0`, the exact fetched sources were evaluated inside the available JavaScript V8 runtime using CommonJS shims and deterministic native-shaped prompts. **8/8 groups, 1,734 assertion calls passed**. This includes both physical seats for positive 2-Bomb root → first five transfers → actual second root replan → three remaining transfers → Rain attack → seven Energy discard → 18 damage packet selections, plus the new mid-chain protection-change negative. The existing five older tests remain green in that source-level run. The source-level harness provided a strict assertion shim, not Node's native `node:test`.
- **Not established:** an actual local Node `node --test` run (the shell has no GitHub checkout and cannot resolve the GitHub host), pinned Twinleaf Store dispatch/settlement with hooked reducer, complete game, opponent full-game competence, paper tournament legality audit, any Aichi matchup, or a 99.5% win-rate claim. No GitHub Actions run, native CI, V3 fixture, or owner-gated game was initiated.

## Integration boundary

Agent50 owns the rank-17 family policy. Selectively review/transplant only `r17TwoBombRainWindow`, the `bomb-second-root` transition and its two-seat tests onto the newest owner-approved branch. Preserve the prior Agent49 single-Bomb shared-host integration and Agent50's newer family logic; **do not blindly merge the whole branch**. A real Node run and exact pinned Store prompt/ability-settlement proof are required before upgrading this source-level executable path to native competence. Agent36/shared-host owners should review physical transfer source locks at that boundary. The current official board status (18 development prototypes, 0 qualified matchups) remains unchanged.
