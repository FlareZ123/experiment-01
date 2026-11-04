# Agent 2: Owner-visible conservative Filch opponent reply in a frozen original rank-3 Bunnelby deck-out

**4 November 2026 | Native original 60-versus-original 60 development A/B/A. Zero competitive-qualified games.**

## Why this test matters

The [historical original rank-3 source game at seed290134](agent2-original-rank3-bunnelby-native-burrow-terminal-20261104.md) had original rank3 Snorlax Stall Bunnelby using twelve real Burrow attacks to empty original rank1 Shadow Rider Calyrex's deck. The rank1 bot repeatedly chose Mimikyu's **Filch**, which draws two cards and reduces its own remaining deck. The independent [second rank3 original source win at seed290138](agent2-original-rank3-independent-second-source-terminal-20261104.md) instead saw an opponent that never attacked, even as Burrow advanced toward deck-out.

The registered opponent policy sensitivity is deliberately minimal: **Would the same original rank1 opponent deck-out sooner or later if it stopped voluntarily drawing two Filch cards once its own public deck had 24 or fewer cards?** This is not a fully rational opponent decision policy. It tests one observable competing resource constraint, without changing the 60-card deck inventories or allowing the opponent to see anything hidden.

## Exact physical setup, code and artifacts

- Two original authenticated paper Expanded full sixties, **rank3 Snorlax Stall** physical seat0 versus **rank1 Shadow Rider Calyrex** physical seat1; frozen seed **290134**, 520-action cap in all three arms, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Same original full physical opening deal in all arms and prior historical source game, exact SHA-256 `e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb`; source opening SHA-256 `ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a`. The root action ledger SHA-256 in both control and repeated control was identically `827d9989e5a03c35886e0cc654a81c8147bf35ce7131140181f60f8f7b7e20e0`.
- Original source 60 converted printing SHA-256 `72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f`, opponent converted SHA-256 `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`.
- [Source experiment script](../../simulation/evaluation/agent2-rank3-original-anti-filch-aba.cjs), registered in commit `479afb2bf719983c0296f2d220764b73ef9077c0`. A reversible `SimpleTacticsAi.prototype.decodeNextAction` adapter considers only the existing opponent owner's *proposed* `AttackAction Filch`, public current player, own active printed Mimikyu, own remaining deck **count** and no pending native prompt. If own deck has 24 cards or fewer, it instead selects the native typed **PassTurnAction**; otherwise the original existing bot decision is preserved. No concealed opponent hand, Prize or deck identities are read. Both control variants use the unmodified common actor/root/Supporter/Energy policy. This is source/seat-specific and **default-off**, not a selected shared release.
- [Compiled GitHub Actions run **41935083102**](https://github.com/FlareZ123/experiment-01/actions/runs/41935083102), **SUCCESS**, existing manual workflow, [artifact **13374335812**](https://github.com/FlareZ123/experiment-01/actions/runs/41935083102/artifacts/13374335812); ZIP SHA-256 `cddb2307c4e6bedd2fc1d7f453e18ba21879e374a30fcfbe3e154bdd9df9116d`, uncompressed `agent2-rank3-original-anti-filch-aba.json` SHA-256 `6cf3784ce0bf20c91091d6037c7e26744046285bfc5c7b97aad739d3f7495072`, 27,816 bytes. An earlier [run 41934624161](https://github.com/FlareZ123/experiment-01/actions/runs/41934624161) failed before gameplay on a wrongly guessed `PassTurnAction` module path; corrected import uses actual pinned engine module `game/store/actions/game-actions`, commit `419afd4c6a776f21cbf61c5cec2702375cb7e88c`. Do not count failed pregame run as matches.

## Hard A/B/A real-native result

| Dimension | Control A | Threshold-24 conservative reply B | Control-repeat A |
| --- | ---: | ---: | ---: |
| Original exact physical opening deal matched | Yes | Yes | Yes |
| Native terminal | Yes | Yes | Yes |
| Winner | Source rank3 | Source rank3 | Source rank3 |
| Rank1 actual Filch attacks | **11** | **5** | **11** |
| Rank1 Filch proposals redirected to ordinary Pass | 0 | **12** | 0 |
| Rank3 real Burrow attacks | **12** | **18** | **12** |
| Ending global turn | **25** | **37** | **25** |
| Total native actions | **133** | **179** | **133** |
| Native winner's remaining deck | 35 | 29 | 35 |
| All six Prize cards untouched each player | Yes | Yes | Yes |
| Competitively qualified games | 0 | 0 | 0 |

All **12 actual substituted Pass decisions** were native-selected source-opponent turns **13,15,...,35**, with rank1's own remaining deck **24,22,19,17,15,13,11,9,7,5,3,1** respectively. No opponent concealed zone or card identity was required. It accepted five early Filch proposals (before threshold), then declined the subsequent 12 by invoking the ordinary native Pass action. The opposing original rank3 Bunnelby continued repeatedly selecting and executing Burrow; the native deck emptied at its eighteenth attack, ending on opponent turn37. The later six extra Burrows and delayed compulsory draws arose naturally from the intervened future history.

**Exact control repeat:** Same full physical deal, same source deal, same 133 native actions, same rank3 winner and identical SHA-256 of complete native root-action ledger. Treatment's full physical deal matched before the first change, but its later game sequence diverged, as required by a real counterfactual. This is one previously identified historical physical source win, **not three independent wins or an estimate of matchup strength**.

## Interpretation

The native outcome's temporal sensitivity to the opponent's voluntary Filch draws is genuine. Holding back those draws delayed the same deck-out terminal by **twelve global turns**. It did **not** reverse the result because the conservative strategy did not attempt to develop an attacker, gust, remove Bunnelby, use recovery, or execute a tactical race. The rank1 opponent remained a weak controlled bot and the source had an uninterrupted, single-energy Bunnelby mill every turn.

A credible opponent can respond in many different ways. Any report of candidate superiority against rank3 Snorlax Stall or general 99.5% field strength must check the opponent's actual affordable alternative actions and respond to public deck count, board geometry, printed attack cost, capture of optional Ω Barrage, and real-paper time. This A/B/A is a clean **owner-information-safe response sensitivity diagnostic**; it is not qualified evidence that the actual rank1 deck is weaker than rank3 in competitive play.

**Overall benchmark remains:** 29/32 authenticated original Aichi Top32 sixties (ranks23/25/28 missing), zero qualified games, no selected fixed60, no demonstrated 99.5% win rate.
