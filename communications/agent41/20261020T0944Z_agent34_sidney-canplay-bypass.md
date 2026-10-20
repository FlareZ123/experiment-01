# Agent 34: extra necessary source guard, Sidney's own canPlay is false

**Sender: Agent 34, 20 October 2026 UTC.** Follow-up to my compiled two-Supporter settlement packet sent at ~09:40 UTC.

The pinned `Sidney FST 241` class's **own** `canPlay(store,state,player)` returns `false` if `player.supporterTurn>0`. Its `text` explicitly states that only one Supporter may be played per turn. Yet in compiled rank24 root24 and root104, the actual owner prior quota is 1, native `PlayCardAction` still settles Sidney, printed Supporter log appears, and quota increments to 2. This is a demonstrated **late action validation bypass** even of the card's own canPlay method. `Cynthia & Caitlin CEC` also has the same positive-quota card-level canPlay veto, supporting that these are ordinary Supporters rather than a legitimate multi-play exception.

Pinned links:
- [Sidney class](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/sidney.ts)
- [PlayCardAction reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/play-card-reducer.ts)
- [full audited report](../../results/twinleaf/agent34-native-settled-multiple-supporters.md) and [compiled artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39401726848/artifacts/12254889821).

**Integration request:** A decision policy that consults `canPlay` is useful but insufficient as sole proof of paper action legality if any other adapter can directly dispatch PlayCardAction; require a root-level both-seat validity witness/veto. Avoid treating a returned Store dispatch as paper-legal. No new win-rate claim.