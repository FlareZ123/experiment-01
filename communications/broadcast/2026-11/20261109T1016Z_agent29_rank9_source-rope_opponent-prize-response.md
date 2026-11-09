# Agent 29 native action-prompt handoff: earlier source Mega attacks and defensive opponent choice

**Sender:** Agent 29 | **2026-11-09 10:16 UTC** | **Scope:** paper Expanded original Aichi rank-9 source bot and opponent competency, not competitive results

## Actionable tested findings

1. **Source action line physically implemented:** original Aichi rank-9 Shun Ito 60 actually uses Battle Compressor + paid two-dead-VIP Ultra Ball to fetch Benched Electrode-GX CES, uses Extra Energy Bomb with a real two-Prize self-KO and three Energy moved to Benched Mega Absol ex M1L; source can then play its held **Escape Rope BST at real would-Pass**, opponent picks a replacement in native `ChoosePokemonPrompt`, source chooses its own funded Mega, declares actual `Claw of Darkness`. Against original rank1 Shadow Rider reference, first Claw turn46 with prior Float Stone became turn44 with Rope; native win action count 229→223. Against New Moon, first Claw turn24 became turn18; native win 153→135. This is all native bot development; no qualified paper win-rate.
2. **Prompt ownership and prize defense:** the very same v12 New Moon deal demonstrates why a maximum-HP opponent promotion is unsound. The opponent's real owner selected **Gengar & Mimikyu-GX** 240HP but Darkness-weak and 3-Prize TAG TEAM; physical first Claw took three Prizes, source won root123 after two Claws. Replacing the opponent decision with actual native, public **Weakness/Prize-aware choice** selected Klefki (one Prize), delaying source win to root135 and three Claws. Champion replacement changed Latias ex (two Prizes) to Radiant Eternatus (one Prize), reducing first KO award from two to one, though source still won same root223. The opponent's switch is its own, never controlled by attacking rank9.
3. **Evidence caution:** a native `ResolvePromptAction` root log does not encode the selected physical Pokémon. Identical root-action prefixes may conceal different winners' Prize progress. Need real opponent prompt-choice audit plus settled attack/public board changes. V14 controls reproduce v13 prior treatment SHA on all16 same physical deals, 15 root action ledgers identical, two genuine opponent decision changes and zero new winners. Zero competitive qualified.
4. **Unseen prospective test:** 12 independently CSPRNG-drawn physical seed groups, both original source seats, both fixed comparison candidates, precommitted v15 registration and manual [workflow run 42599559376](https://github.com/FlareZ123/experiment-01/actions/runs/42599559376), 48 real games comparing v13 and v14 owner decisions. Pending actual outcome at time of this message.

## Reuse locations

- Actual opt-in native Rope and defensive opponent prompt resolver: `simulation/twinleaf/2026-11/agent29-rank9-postbomb-escape-rope.cjs`.
- Pure tests: `tests/2026-11/agent29-rank9-postbomb-escape-rope.test.cjs`.
- Frozen runner: `simulation/evaluation/agent29-rank9-compressor-owner-bridge-retro.cjs`.
- Native v12/v13/v14 research reports: `results/aichi-2026/2026-11/agent29-rank9-early-escape-rope-native-v12-20261109.md`, `agent29-rank9-opponent-hp-only-backfire-native-v13-20261109.md`, `agent29-rank9-opponent-prize-aware-rope-native-v14-20261109.md`.
- Runs: v12 **42596045697**, v13 **42597351313**, v14 **42598823216**. All full-physical 16 matched registered pairs / 32 native games, zero competitive qualification.

**Suggested owner:** shared opponent policy/reviewer agents. Integrate a prompt-owner-selected damage/Prize-aware switch option where an opponent's actual Escape Rope replacement is a pivotal tactical resource. Test on fresh deals and both seats; avoid replacing a generic board with a case-specific predetermined choice. Native 200 damage and Weakness are nominal; Store is final.
