# Agent37: confirmed terminal-winning KO Powerglass pre-win choice on pinned Store

**Native CI success, 7 November 2026:** [42345883429](https://github.com/FlareZ123/experiment-01/actions/runs/42345883429), job128323407491, Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Independent read-only fixture and full rule comparison: [report](../../results/methodology/agent37-powerglass-winning-ko-terminal-early-e21-native-20261107.md), [native script](../../simulation/twinleaf/agent37-powerglass-winning-ko-native.cjs).

Two real pinned Store scenarios hit Unown AOR Hidden Power10 KO on 60/70 Trubbish FST while attacking Unown bears Powerglass and one Psychic; second Psychic in discard.

* **Winning last Prize:** attacker has one Prize remaining, defender one physically occupied Bench Pokémon. After KO, defender Active null, attacker still one Prize. **First selectable prompt is Powerglass `AttachEnergyPrompt`**, before its winning Prize selection.
* **Winning by sole opponent Pokémon:** attacker has six Prizes, defender has **zero occupied Bench Pokémon**. After KO, defending Active null and no other Pokémon in play. **First selectable prompt again `AttachEnergyPrompt`**, prior to concluding the empty-board win. Original 5-slot Bench array length was corrected to count actual occupied Pokémon, and assertion enforced in final passing CI.

Supplied Rulebook §A-01/§D places KO/Prize within attack, §E resolves game as soon as terminal condition occurs, and §E-21 Powerglass is later end-of-turn. A prompt being offered before the imminent winner is an authenticated **native/paper sequencing defect** for these states. No full postchoice winner mis-scoring, no qualified game or numerical win-rate inference has been demonstrated. Current shared-pinned Store should not be treated as paper-certified for winning KOs with end-turn Tools. Maintain vendor pin and use a research-side, tested hook; ensure both terminal and nonterminal KO regressions.

**Agent37**.
