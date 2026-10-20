# Native rank-11 owner Stadium follow-up: retrospective late14 policy counterexample

**Agent 6, 20 October 2026.** This report recovers and audits the already-dispatched, successful manual compiled CI [run 39351339592](https://github.com/FlareZ123/experiment-01/actions/runs/39351339592), head `0988f0b1017775f99db39b14fb9c131a622d9c1e`, artifact **12233448065** (`agent6-rank11-source-stadium-followup`, ZIP SHA256 `8bbfda105f32991e259dfd1a5ea2739032ace6aeda8459fbe5834598d426a8a4`). The run finished **successfully**. Its 14,461-byte machine-readable `agent6-source-stadium-followup.json` is produced by [the recorded runner](../../simulation/evaluation/agent6-rank11-turn22-quickball-fork.cjs) with `AGENT6_STADIUM_FOLLOWUP=true`.

## Frozen setting

- Source opponent: exact published **rank 11 Absol/Garbodor 60**, physical source seat 0, candidate actual first, historical seed `623585882`.
- Candidate: unchanged `new-moon-lockbreaker-v1` from the canonical historical four-arm runner.
- Original source deal SHA256 `9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5`. Previous legitimate source turn22 Quick Ball intervention consumed owner-held `Quick Ball FST` and discarded expired `Battle VIP Pass FST` through genuine native prompts. Its full root SHA256 `af3b4d65980e96edc96464f126255718a1e2f04a95c2303f0d3751f63ec8c06f` was rechecked unchanged.
- Treatment added **one** prioritized, owner-visible genuine turn24 Stadium action, using [the reversible prototype wrapper](../../simulation/twinleaf/agent6-rank11-source-turn24-stadium.cjs). It never stages a card or peeks at the opponent's concealed hand.

## Native accepted action and causal window

At rank-11 source **global turn24**, the actual own hand had `Crobat V DAA`, `Shopping Center EVS`, `Boost Shake EVS`, two `Battle VIP Pass FST`, `Temple of Sinnoh ASR`, and `Secret Box TWM`. The policy checked `Shopping Center EVS` first; the native bot's action validator returned `true`. The actual Store root ledger records source seat 0, root ordinal **168**, `PlayCardAction`, card **Shopping Center**, same global turn24. This verifies a real legal owner-owned Stadium action rather than an abstract opportunity.

The treatment preserved both 60-card deck hashes, same source physical deal and actual starter, all unaffected historical arms, and the **entire original Quick Ball branch Store root history through global turn23**. New treatment root SHA256: `7514d19096df9f228bc0d406958aa38390bae3f32051e83cbf13c61677f6d5a1`.

| Evidence | Quick Ball-only control | Quick Ball + source Stadium |
| --- | --- | --- |
| Earlier first candidate Poltergeist | turn21/root149, 6 Trainers, 300 printed base | Identical turn21/root149 |
| Next candidate Poltergeist | turn25/root174, 6 Trainers, 300 base | **turn41/root252**, 6 Trainers, 300 base |
| Native engine ending | 176 accepted Store actions, global turn25 | 254 accepted Store actions, global turn41 |
| Native engine winner and Prizes | Candidate seat 1, [6,0] | Candidate seat 1, [6,0] |

The **single additional legitimate Stadium play deferred the subsequent candidate Poltergeist knockout by 16 global turns and 78 recorded Store actions (including prompt resolutions)** under the same weak generic continuation policies. Source still took zero Prize cards. The new source-hand Trainer composition at second attack was Quick Ball, Carmine, Professor's Letter, Quick Ball, Boost Shake, Battle VIP Pass, again six. Both second attacks report a printed-base threshold against a fresh 280-HP Mega Absol ex with observed defender disappearance and -3 opponent Prize cards; damage modifiers and exclusive KO cause are outside this audit.

## Meaning and hard limits

This is a **large timing sensitivity** to a strategically mundane owner-hand action in an intentionally weak opponent bot. It makes the original 25-turn candidate engine outcome an especially poor proxy for a competitive win. A two-action, hindsight-selected sequence is *not* a trained, prospective, owner-information-safe shared policy. The source did not establish early Tool-Garbodor pressure in the original candidate-first arm. Neither 41 global turns nor untimed terminal status has an official match-clock calibration. **No competitive games qualify, and no candidate match win rate is demonstrated.**

For the integrated benchmark: preserve this as a **historical regression** for legal source resource use and timing instability; freeze a common owner-safe policy **before** newly registered both-start games. Do not continue optimizing this selected seed in isolation. Full exact opponent lists remain 29/32; missing ranks 23, 25, 28.
