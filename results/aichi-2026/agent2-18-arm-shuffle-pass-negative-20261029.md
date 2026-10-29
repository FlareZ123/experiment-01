# Eighteen genuine historical Aichi deals: conservative after-Pass Supporter selector is unreachable

**Agent 2, 29 October 2026.** Compiled [manual CI 40952619958](https://github.com/FlareZ123/experiment-01/actions/runs/40952619958) **PASSED** at source commit `f6f2e7599010ba120d132d3b3b1a7796713eed02`. Artifact [12932725864](https://github.com/FlareZ123/experiment-01/actions/runs/40952619958/artifacts/12932725864), ZIP SHA256 `da5ba0f380c1b2c88d5c483d497f5c1bf9746eaad04476cb99e6bef3d615bb53`. The archived JSON includes every source deal, both statuses, exact accepted-Store action hashes, printed initial hand reason labels, and owner-only pass witnesses. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Protocol

Run the **frozen exact original 60-card source/candidate lists** for rank6 repeat2/A (two fixed candidates) and every registered rank11 repeat/seat combination (sixteen fixed candidate games). Each of these 18 historical arms is executed once with no new policy and once with the default-off `AGENT2_SHUFFLE_SUPPORTER_DEV=true` after-Pass chooser. Both seats share the same code. The chooser uses only the acting player's hand, publicly visible opponent hand *count*, Prize counts, deck counts and Supporter quota, with a deliberately conservative own hand at most 3. The original genuine native Store accepts or rejects actions; chosen actions are not injected into the game outside the regular bot decoder.

## Recorded exact result

| Exhaustive audited Pass branch | Native accepted roots |
| --- | ---: |
| Actor-owned Pass roots across 18 registered historical games | **390** |
| Global first-turn Supporter exclusion | **18** |
| Owner held more than 3 physical hand cards | **369** |
| Owner hand at most 3, but no supported shuffle family held | **3** |
| Eligible conservative shuffle Supporter proposals | **0** |
| Attempted, Store-accepted and Store-rejected shuffle proposals | **0 / 0 / 0** |
| Actually settled Lillie's Determination prompt effects from this new branch | **0** |

The rank6 historical two-arm subset has 52 Pass roots. In the rank11 original-source 16-arm subset, 338 more Pass roots were observed. The reason labels cover every owner Pass exactly, with **nine unique physical source-deal seeds**, reused in candidate pairs, and many correlated turns within each game. The per-seat source and candidate labels are preserved separately. All 18 original source-deal fingerprints, root-ledger hashes, terminal statuses and action counts are unchanged between controls and after-Pass policy.

**Interpretation:** this default-off after-Pass fallback had **no opportunity to act under its explicitly chosen hand-size guard**. It therefore neither improves nor worsens those games. Held preliminary native-`canPlay(null)` positive Supporters from the separate [owner-opportunity audit](agent2-native-owner-supporter-opportunity-20261029.md) cannot be equated with a strategically reasonable conservative shuffle proposal. Raising the hand cutoff without modeling important retained singleton resources would simply weaken the DCI/UDP reasoning. A more appropriate target is an owner-visible **pre-attack Supporter decision**, after ordinary board-development actions but before ending the turn with an otherwise payable attack, with native printed settlement and opponent reply evidence.

That mechanism has a **separate default-off experimental path**, `AGENT2_SHUFFLE_PREATTACK_DEV`, which must be tested against the original frozen source deals independently. The after-Pass negative result **does not** establish that the pre-attack branch is useful or legal in every state, and neither branch establishes matchup win rates.

**Competitive-qualified games: 0. Original source coverage: 29/32. Claimed 99.5%: unsupported.**
