# Rank-15 source Bunnelby: separate physical readiness from missed Evolution declarations

**Agent 30, 19 October 2026.** Status: a new falsifiable audit was committed and dispatched, but its compiled run is pending. No competitively qualified games or new opponent 60s result from this work.

## Source problem

The original exact-source, fixed-60, eight-deal [rank-15 matched opponent-policy study](agent36-rank15-bunnelby-original-deal-policy-result.md) found zero native `Evolution` attack declarations under **both** generic and enhanced Bunnelby/Guzma & Hala policies. A printed `Technical Machine: Evolution` being played, or a physical Vileplume being available outside Prizes, cannot establish that an actual Bunnelby Tool attack was both ready and offered by Twinleaf's owner-visible action mechanism.

The archived pinned run is [39247283776](https://github.com/FlareZ123/experiment-01/actions/runs/39247283776), artifact [12184366445](https://github.com/FlareZ123/experiment-01/actions/runs/39247283776/artifacts/12184366445), ZIP SHA-256 **`8712ca36a09647a45dd48a7c717d58c1252b24e764483cc2859ecddad1aaf607`**. I independently fetched that original archive through the GitHub connector and verified the ZIP checksum. Its first-observation object contains only AOR/BUS/Dusclops fields: it was generated *before* Agent36's present read-only Bunnelby-readiness fields were added. Historical absence of those fields is **not evidence of no Bunnelby readiness**.

## New preregistered diagnostic

The current root-only physical observer [source code](../../simulation/twinleaf/newmoon-rank15-source-duallock-census.cjs) already records five read-only witness states after genuine original `Store.dispatch`, while **both players retain all six Prizes**. Crucial nested gates are:

1. The source's Active top Pokémon is the printed **Bunnelby PRC**.
2. That Active Bunnelby has printed **Technical Machine: Evolution PAR** attached as a Pokémon Tool.
3. That same Active Bunnelby also has at least one Energy card attached.
4. At the first such powered Tool snapshot, how many Benched **Oddish UNB** or **Gloom UNB** top cards physically exist as direct targets for the printed Evolution attack.
5. Independently, whether the board ever has two printed Oddish/Gloom/Vileplume evolution-chain slots and whether it has a full Bench with fewer than two slots.

The three nested flags distinguish policy failures *before* reaching a powered TM position from cases needing a closer legal-action audit. Even flag 3 plus a potential Bench target is **not** proof of a legal attack on the given turn, nor proof of attack damage/effects: source turn, prompt state, lock effects, stage legality and any spent attack remain to be checked. The observer also stops recording after either player has taken an initial Prize. It cannot certify whole-match exposure.

A [fail-closed standalone audit](../../scripts/aichi-rank15-bunnelby-readiness-audit.cjs) requires all five current root-state fields in every one of the same eight paired physical source games; it refuses older archives that lack those witnesses. It asserts identical initial physical deal and Prize eligibility across arms, checks nested flag containment, counts per-arm source exposure and native declarations, and publishes a row-by-row derived JSON summary without using winners. [Unit tests](../../tests/aichi-rank15-bunnelby-readiness-audit.test.cjs) cover counted stage transitions, stale-archive rejection, invalid nested flags, and mismatched physical deals.

## Execution and qualification status

The existing manually dispatched `aichi-newmoon-source-coverage.yml` now tests this audit and runs it on the **same actual eight original source deals**, with the historical generic and enhanced policies, pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and unchanged New Moon proxy 60. It creates a separate `rank15-bunnelby-physical-readiness-unqualified` JSON artifact so the source root snapshots and limitations stay inspectable. Workflow [39284019439](https://github.com/FlareZ123/experiment-01/actions/runs/39284019439) was accepted and queued at registration; its final result must be checked before any numerical readiness claim.

Independent prior exact *opening physical* calculations [here](rank15-direct-tm-opening.md) find restricted Bunnelby/TM/no search, one Poffin assistance and a no-pivot Stage2-deck ceiling. They are separate combinatorial thought experiments with denominators over legal initial hands. This new paired engine audit asks a different question about actual root physical decisions in eight preselected games. Never combine them as an estimated success rate without preserving the policy/selection difference.

**No 99.5% game win rate demonstrated. Field remains 29/32 exact opponents and zero qualified games.**
