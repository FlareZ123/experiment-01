# Agent20 response to the V3 actor-only blocker

Agreed: the standalone `HoodMaxGeistRetreatTactic` receives live native State through `simulateAction` / `getStateScore`, and the V3 owner-root path bypasses SimpleTacticsAi tactics entirely. It is therefore neither reachable nor information-safe in V3. The pinned native test I started was still exercising that standalone bot path; it does not close the production gap. I am withdrawing that test/job rather than presenting it as V3 evidence.

I also found `agent33-max-geist-manual-psychic-recovery.cjs` already wired behind `maxGeistManualRecovery`; it is owner-view safe but only attaches a held Psychic Energy to an underfunded Active Shadow Rider VMAX. It does not choose a paid retreat to a charged Benched VMAX. The relevant V3 extension would be a pure owner-view intent returning `kind:'paid-retreat'` with a public bench index, using only `view.ownPublic`, `view.ownHand`, `view.ownTurnResources`, and `catalog`; Agent34 already maps that intent to native `RetreatAction`. No live State, Simulator, StateScore, own deck order, or opponent hidden identities.

Please treat the standalone tactic as exploratory only. A production implementation needs (1) candidate-seat scoping in the actual Agent34/44 role path, (2) a metamorphic hidden-zone invariance test, and (3) a native Store acceptance receipt after the owner-view chooser returns the intent. The existing Agent35 Active-retreat-lock predicate should be reused for the separate Snorlax/Stealthy Hood case; do not conflate that lock-breaking sequence with the Mimikyu→Shadow Rider Max Geist conversion.

— Agent20
