# Frozen rank6 first source Volt Cyclone reply: seven owner-held Lillie's Determination passes without native Supporter root

**Agent30 | 2 November 2026 | archival owner-decision observation, not game-strength qualification.** Source: first selected immutable compiled native [rank6 CI 41463121456](https://github.com/FlareZ123/experiment-01/actions/runs/41463121456), [artifact 13150042319](https://github.com/FlareZ123/experiment-01/actions/runs/41463121456/artifacts/13150042319), fixed profile `simulation/evaluation/agent20-frozen-rank6-canary-v1.json`, original opponent printed rank6 Iron Thorns, candidate Champion reference and New Moon, candidate actual **physical seat A** in both arms. This is a **postgame native owner-hand decision audit**, separate from own-policy root authorization.

## Raw seven decision opportunities

The `candidateRepliesAfterSourceAttacks[]` records contain these **seven** original-source-postattack candidate Pass roots while the own-hand post-decision evidence includes **`Lillie's Determination M1L`**:

| Registered candidate trial | Candidate global turns | Card in the owner hand at each Pass | Candidate's earlier turn root count |
| --- | --- | --- | --- |
| `6:0:A:champion-reference` | **4,6,8,10** | original Lillie's Determination MEG119, four observations | Each selected turn's only non-prompt candidate root was `PassTurnAction` |
| `6:0:A:new-moon-lockbreaker-v1` | **4,8,10** | original Lillie's Determination MEG119, three observations | Each selected turn's only non-prompt candidate root was `PassTurnAction` |

At global turn4, the Champion candidate's hand is **Battle Compressor PHF, Dimension Valley PHF, Unfair Stamp TWM, Lillie's Determination M1L, Shadow Rider Calyrex VMAX CRE, VS Seeker PHF**. Its Active **Trevenant & Dusknoir-GX** has **zero attached Energy**; the bounded detached native post-choice `Night Watch` and `Pale Moon-GX` attack probes both reject.

At global turn4, the New Moon candidate's hand is **Canceling Cologne ASR, Powerglass SFA, Path to the Peak CRE, Lillie's Determination M1L, Battle VIP Pass FST, Counter Catcher PAR**. Its Active **Galarian Articuno V** has **zero attached Energy**; the detached native `Psyray` attack probe rejects. Both were active opposite original-source **Iron Thorns ex** immediately after a settled source Volt Cyclone Prize gain; candidate had **six Prize cards remaining**. Neither candidate had performed any other non-prompt native root earlier in their turn4 before the Pass.

## Printed Supporter opportunity versus simulated policy choice

The original source roster `full-decklists.json` includes two physical **Lillie's Determination MEG119** in rank1 Champion, and the New Moon candidate's held native `Lillie's Determination M1L` is likewise the pinned MEG implementation. Actual pinned upstream `ptcg-server/src/sets/11-mega-evolution/set-mega-evolution/lillies-determination.ts` explicitly says:

> Shuffle your hand into your deck. Then, draw 6 cards. If you have exactly 6 Prize cards remaining, draw 8 cards instead.

Its `canPlay()` returns true if `player.supporterTurn<=0` and its effect shuffles hand excluding itself, then draws. The general paper game rule permits one Supporter per turn. Original rank6 source board has only **Iron Thorns ex** as Pokémon, and this is an Ability lock rather than a Supporter lock; the source's Thunder Mountain Stadium also has no relevant Supporter prohibition. For the **two turn4 candidate root Pass states** a strong **conditional paper-playable Supporter opportunity** exists: if original candidate `supporterTurn=0` in the live state (as suggested by there being no earlier candidate Supporter root this turn), Lillie's Determination could have shuffled and drawn **eight**, possibly finding Energy and further plays.

**The live archive does not include the candidate's actual internal `supporterTurn` counter or a detached clone PlayCardAction test against Lillie's.** Therefore do not mark this as proved native-accepted missed Supporter or as a demonstrated superior winning line. A direct **source-state, same-root native legal PlayCardAction probe**, with full before/after owner-hand/deck/Supporter counter and attack follow-up, is the minimal falsifiable next test. Testing `canPlay` statically alone cannot prove actual Store acceptance under all other effects. Even if legal, playing Lillie's may be strategically dominated in a specific hand because it discards access to key held resources; take the opportunity seriously without presuming every Pass is an error.

## Why this matters

The selected development canary reports `OPPONENT_CONTINUATION_WITNESSED=false` and `candidateReplyCompetenceVerified=false` despite genuine candidate Pass actions. The **seven repeated owner-held Supporter opportunities** are a concrete candidate-policy quality question that the current native printed-attack clone cannot resolve: the active is unpowered, but the candidate may have a legal draw/search Supporter instead of ending turn. An engine terminal in such a game cannot qualify as a competitive win against a competent policy until this exact decision option is audited or justified.

This is an exact original-source, known owner-hand, bounded decision audit. Zero competitive-qualified games, no 99.5% extrapolation. The source rank6 positive Guzma & Hala payment selection and source attack lineage are separately preserved in [Agent30's native cost report](agent30-frozen-rank6-native-source-paid-selection-attack-20261102.md).
