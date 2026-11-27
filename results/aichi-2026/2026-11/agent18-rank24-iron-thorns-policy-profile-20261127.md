# Rank 24 Iron Thorns exact-source opponent policy profile

**Agent:** 18  
**Date:** 2026-11-27  
**Branch:** `agent18/rank24-iron-thorns-policy-20261127`  
**Branch head at synthesis:** `undefined`  
**Current policy blob:** `50b1d1a2415d49eba48771479548c12a4fb646b9`  
**Status:** development policy; not merged, registered, natively gamed, or admitted

## Result

The exact Aichi 2026 rank-24 Ryoya Fujii Iron Thorns list now has one
source-specific actor policy under the existing Agent39 Iron Thorns family
interface:

`simulation/evaluation/2026-11/agent18-rank24-iron-thorns-opponent-policy.cjs`

The module embeds all 60 source cards and keeps the shared worker contract:
opponent role, physical seat 0/1, exact policy version, empty config, actor-seat
binding, standard action/prompt responses, no hidden-zone access, and explicit
abstention outside supported lines.

This is no longer only a terminal-mill seed. It implements the main turn
skeleton needed for rank24 to make coherent actor-visible decisions.

## Exact-source coverage

| Source card / family | Policy behavior |
|---|---|
| Iron Thorns ex ×4 | Bench a second copy when needed; Volt Cyclone attack; funded-bench retreat pivot; Volt Cyclone Energy transfer |
| Plumeria ×4 | Use only with visible Energy and two safe discard costs; choose target and Energy |
| Lusamine ×2 | Recover state-relevant Supporters/Stadiums |
| Guzma & Hala ×2 | Stadium-only or discard-two expansion; safe discard selection; Thunder/DCE/Jammer search |
| Guzma ×2 | Only gust when a bench Thorns remains attack-ready; prefer public KO target; choose funded own switch |
| Sidney ×2 | Conservative large-hand trigger; choose up to two revealed eligible cards, Special Energy first |
| Eri ×2 | Conservative large-hand trigger; choose up to two revealed Items, prioritizing access |
| Team Flare Grunt ×2 | Use against energized Active; prefer Special Energy |
| Cynthia & Caitlin ×1 | Recover useful Supporter; take draw-three option only with a disposable card |
| Bellelba & Brycen-Man ×1 | Certified terminal deck-out at opponent deck 1–3; decline optional three-card payment |
| Team Skull Grunt ×1 | Conservative large-hand trigger; choose revealed Special before Basic Energy |
| Faba ×1 | Prefer Special Energy, then Tool, then Stadium |
| N ×1 | Certified terminal deck-out boundary plus nonterminal public hand-reset heuristic |
| Lillie's Determination ×1 | Low-hand deterministic refill |
| Gladion ×1 | Starts only after K1 identifies an important prized card; selects highest-value revealed Prize |
| Xerosic's Machinations ×1 | Deterministic public-hand trigger above three cards; opponent-owned discard prompt is not forged |
| Trainers' Mail ×4 | Use before ordinary attack; choose best revealed Trainer by state |
| VS Seeker ×3 | Terminal Bellelba recovery plus generalized best-Supporter recovery while Supporter slot is live |
| Nest Ball ×2 | Deterministic second-Thorns setup |
| Tag Call ×2 | G&H plus Cynthia & Caitlin access |
| Enhanced Hammer ×2 | Visible Special-Energy denial with target/card continuation |
| Palace Book ×2 | Protected as a late low-hand draw line when no Volt Cyclone is available |
| Heavy Ball ×1 | Deterministic Thorns search |
| Megaton Blower ×1 | High-priority visible Tool/Special-Energy sweep, but below a certified immediate game win |
| Handheld Fan ×2 | Attach when reactive displacement is useful; on trigger move high-value Energy, DCE first |
| Tool Jammer ×1 | Attach only against a visible opponent Active Tool |
| Player's Ceremony ×2 | Protect in low-hand no-attack states; play/use as late draw-two end-turn engine when offered |
| Thunder Mountain ♢ ×1 | Attack-enable logic; DCE correctly counts as two Colorless units |
| Wondrous Labyrinth ♢ ×1 | Conditional denial when it does not strand the actor's own immediate attack |
| Speed Lightning Energy ×4 | Primary funding |
| Double Colorless Energy ×3 | Two-unit funding; preserved in Volt Cyclone transfer where possible |
| Capture Energy ×1 | Funding plus deterministic second-Thorns setup |

No rank-6-only Crushing Hammer, Team Rocket's Handiwork, Tropical Beach, or
Palace Belt behavior is imported.

## Terminal layers

Terminal decisions are handled above ordinary resource scores.

1. **Deck already empty:** pass only when public end-turn safety is certified.
2. **Bellelba:** at opponent deck 1–3, choose direct Bellelba or VS Seeker →
   Bellelba when the Supporter slot is live and end-turn safety is certified.
3. **N:** if public `deckCount + handCount <= prizeCount` and the sum is
   nonzero, N leaves the opponent's post-N deck empty.
4. **Final-Prize Volt Cyclone:** inspect actually offered Volt Cyclone actions
   before Megaton/funding. Override only when the frontier explicitly certifies
   positive `prizeLiability`, `hasPrevention === false`,
   `hasUnmodeledModifier === false`, sufficient damage, and the public actor
   Prize count reaches zero. Legacy Energy is an explicit negative.

The final-Prize layer was added after Agent17 produced a held-out showing that
the earlier raw score (Megaton 300 vs KO Volt 290) could delay an immediate win.
The repair is structural rather than “raise Volt to 301”.

## End-turn safety

The actor observation does not encode every persistent attack effect, so the
policy uses the versioned public event receipt for the opponent's last-turn
attack history.

- Missing receipt fails closed for certified end-turn lines.
- Poison/Burn fail closed because Checkup modifiers are not fully normalized.
- Pale Moon-GX blocks the line only when the pending Active KO itself ends the
  game before the opponent's forced draw (no backup, or opponent can take the
  remaining Prizes).
- Non-damaging Special Conditions alone do not invalidate a certified
  deck-out.

## Discard realism

Player's Ceremony and Palace Book were initially treated as cheap discard
fodder. That was corrected: both end the turn after drawing, so in a low-hand,
no-attack state they are protected rather than burned to G&H/Plumeria.
Expendable Handheld Fan / duplicate Trainers' Mail are preferred payment
examples. This is the concrete DCI/AMR behavior that the general strategy notes
warn simplistic discard scoring can miss.

## Decision evidence

Current branch direct decision suite:

- **83 passed, 0 failed** across seven rank24 test files.
- The suite covers terminal mill/N/attack, both seats where relevant, funding,
  DCE+Thunder math, setup search, control denial, prompt continuation contracts,
  hand disruption, recursion, prize recovery, gust, retreat, reactive
  Handheld Fan, and end-turn draw engines.
- The suite was executed against the exact current branch policy source in a
  fresh JavaScript module harness; it is decision-unit evidence, not a native
  Twinleaf game.

The current policy has also been repeatedly run through the exact shared
`aichi-actor-observation-v4-ability-lock-order` /
`aichi-owner-prompt-projection-v3` validators. Those checks found and fixed
real contract defects before this synthesis, including:

- `ChoosePokemonPrompt` must return `select-choices`, even for one target;
- one-card `ChooseCardsPrompt` also uses `select-choices`;
- `AttachEnergyPrompt` is single-select;
- min-zero multi-select prompts require the explicit empty-selection token;
- Volt Cyclone prompt metadata must use allowed v3 keys;
- a missing N matcher was caught by executing the policy through the protocol.

Representative current/proximate protocol-valid decisions include terminal
Volt over Megaton with certified liability, funded retreat, generalized VS
Seeker, Gladion Prize selection, Lusamine recovery, C&C option choice, Guzma
targeting, Handheld Fan transfer, Eri/Sidney/Team Skull, Trainers' Mail,
Tag Call/G&H, Nest Ball, control denial, and Volt Cyclone transfer.

## Native blocker: Player's Ceremony

Pinned Twinleaf revision:
`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Its recursive tree contains the rank24 `Palace Book` implementation but no
file matching Player's Ceremony / Ceremony. The exact source card is the
Japanese S-P 127 Stadium whose translated effect is: once during each player's
turn, that player may draw 2 cards; if they do, their turn ends.

Therefore the policy is ready to act on Player's Ceremony if the shared adapter
exposes it, but **the exact 60 cannot honestly be called natively runnable under
the pinned unhooked Twinleaf tree yet**. Per family-owner instructions, this run
did not add a new engine hook, native fixture, CI workflow, game, registration,
or merge unilaterally.

## Evidence boundary and next gate

This result is policy-development evidence only. It does **not** establish
rank24 competence, matchup strength, a win rate, or progress to the 99.5%
objective by itself.

The next gate should be narrow:

1. family-owner review of this exact-source policy;
2. shared adapter decision on the missing Player's Ceremony implementation;
3. then one authorized native rank24 game/protocol slice before any panel
   admission or broad matchup sampling.

The relevant tests are:

- `tests/2026-11/agent18-rank24-iron-thorns-opponent-policy.test.cjs`
- `tests/2026-11/agent18-rank24-iron-thorns-funding-search.test.cjs`
- `tests/2026-11/agent18-rank24-iron-thorns-setup-search.test.cjs`
- `tests/2026-11/agent18-rank24-iron-thorns-control-denial.test.cjs`
- `tests/2026-11/agent18-rank24-iron-thorns-volt-cyclone.test.cjs`
- `tests/2026-11/agent18-rank24-iron-thorns-hand-disruption.test.cjs`
- `tests/2026-11/agent18-rank24-iron-thorns-recursion-gust.test.cjs`
