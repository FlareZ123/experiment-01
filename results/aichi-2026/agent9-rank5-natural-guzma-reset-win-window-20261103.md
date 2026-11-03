# Rank-5 original Mew: naturally observed Guzma reset finisher opportunity

**Agent 9 | 3 November 2026 | unexecuted tactical alternative, 0 competitive-qualified games**

## Real original printed-60 native evidence

Original Aichi rank5 Mew Genesect source printed60 SHA256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`, Twinleaf pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Reused [native run 41424333037](https://github.com/FlareZ123/experiment-01/actions/runs/41424333037), artifact 13131282058, original exact source deal `fdad3fecfe0439e0fb73fc7703d64f47537e5b7c8ead36c8d63722f44bc7bd44`. The two archived mode labels share identical native root ledgers; OFF and candidate-only Quick Ball differ after policy selection but start from the same physical deal. These are developmental observations rather than independent game results.

In **OFF scope, source physical seat1 versus champion reference**, source Mew VMAX used Cross Fusion Strike to copy Genesect V's Techno Blast on global turn42/root179, selected in ChooseAttackPrompt root180. Source had **two Prizes remaining** after the attack. Opposing seat0 genuinely played Tapu Lele-GX GRI60 from hand into an empty Bench position at turn43/root186, verified by the accepted public board transition; then passed at root188. On original source turn44, its real owner-held hand census showed **two Guzma**. Its Active was a Mew VMAX with Double Colorless Energy; a second Mew VMAX and three Genesect V occupied Bench slots. The source passed root191.

The **candidate-only Quick Ball** branch shows corresponding source copied attack T40/root174, opponent newly Benched Tapu Lele T41/root181, and source pass T42/root188 with both Guzma still held. It is the same original initial physical deal, with different actual gameplay.

## Conditional paper route

Under the supplied Advanced Player's Rulebook A-03 and C-03, a funded Active Mew VMAX that copied Techno Blast can reset its next-turn attack restriction by switching to its Bench. In the observed source Pass position, held **Guzma BUS115** could gust the opponent's newly Benched **Tapu Lele-GX GRI60 (170 HP, two Prizes)** while moving funded Mew VMAX #1 to Bench and promoting spare Mew VMAX #2. The player can then **free Retreat** #2 to bring the original DCE-funded Mew #1 Active and copy Benched Genesect's 210-damage Techno Blast. The Bench being full does not veto a normal Retreat. If all native legality and damage effects permit these actions, the KO of Tapu Lele would yield the source's last two Prizes.

The same two-stage Guzma/free-Retreat/copy transaction has already been witnessed in **staged native both-seat tests** by [Agent41](agent41-mew-techno-guzma-retreat-reset-als-20261102.md). This report adds an actual shuffled original-source owner-hand, target, Prize and Pass opportunity, without asserting a native alternative win.

Printed card references: [official Mew VMAX/Genesect strategy](https://www.pokemon.com/uk/features/sword-shield-fusion-strike-deck-strategy-mew-vmax-and-genesect-v), [official Guzma](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/sm3/115), [Tapu Lele-GX GRI60](https://limitlesstcg.com/cards/gri/60).

## Additional persisted two-Prize target window, same one physical deal

A follow-up **public-state persistence audit** of every archived source Pass adds a second later turn per Quick Ball scope. In OFF, after native T46 source copied Techno Blast at root197 without taking Prizes, the recorded `sourceAttackSettlement.publicBoardAfter` shows two untooled, undamaged opposing **Tapu Lele-GX** on Bench. The opponent's T47 actions were only Pass and engine prompts. Source's next own turn T48 still had two Guzma, a DCE-equipped Active Mew VMAX, a spare Mew VMAX, a Genesect donor and **two remaining Prizes**; it passed native root205. The corresponding candidate-only QB branch is source copied attack **T44/root194**, opposing Pass **T45**, source Pass **T46/root202**. The original source eventually took the final two Prizes on T50 OFF or T48 candidate-only. A reset plus gust could conditionally have reached a bare 170HP two-Prize GX earlier in either branch, subject to native legality and opponent effects.

The revised detector has an independent `inspectPersistentTapuFinishers` module that requires a real previous `Cross Fusion Strike → Genesect Techno Blast` prompt, the public opposing Tapu snapshot, strict opponent pure Pass/no changing action between snapshot and owner turn, two source Prizes left, funded Active and spare Mew, and original owner-held Guzma. Across all **32 archived Store attempts**, this finds **two new distinct scope/turn opportunities**, repeated once in the historical duplicate mode. Together with the earlier newly Benched Tapu discovery, the corpus therefore contains **four scope/turn conditional finisher opportunities from a single original physical source deal**, eight occurrences across two identical-mode ledgers, and **zero executed alternate finishers**. These correlated turn windows must never become a win-rate denominator or independent matchup successes.

## Reproducibility and unverified phases

Read-only [natural Guzma detector](../../scripts/agent9-rank5-guzma-finisher-natural.cjs) inspects all 32 archived original native Store attempts, joining prior copied attack, native Prize array, actual opponent Bench entry, opponent Pass, and owner before-Pass held Guzma/board. It identifies two scope-by-trial opportunities duplicated by both identical historical modes. The companion [16 passing pure tests](../../tests/agent9-rank5-guzma-finisher-natural.test.cjs) include negative controls for owner, cooldown, supporter, donor, Prize, target and intervening attack; committed blobs match locally tested bytes.

**Missing:** live original-root Guzma legality, both accepted native prompts, cooldown/retreat flags at the natural turn, exact attack damage/effect settlement, target Prize transfer and an opponent response. The proposed line has **zero executed alternative wins**; all original native terminals remain competitively unqualified. Follow-up should fork this exact natural owner turn using Agent41's existing staged hook and the canonical bilateral runner, compare same physical deals and preserve every error/censor. Do not dispatch duplicate generic CI.

**Field state:** 29/32 original opponent printed60s authenticated; ranks23,25,28 missing; zero competitively qualified games and no selected final fixed 60.
