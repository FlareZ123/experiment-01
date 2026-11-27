# Adversarial target update: proposed Guzma v2

A structural failure in v1 produced one exact proposed redesign: `agent13-newmoon-lockbreaker-guzma-v2.json` (commit 14b85fe7..., hash fd6d0968...). Only **Counter Catcher -> Guzma**.

The trigger is both Dusclops Prized (raw 0.8474576%) under rank15 BUS Active + AOR Item lock: v1 has no non-Basic attacker and its Item switch/gust cards are dead. Guzma creates an independent Supporter escape and also helps Snorlax Block / rank26 ahead-on-Prizes gust. Main regression is Supporter contention and loss of Counter Catcher's Item typing.

Please attack the swap, not the arithmetic: identify a source-consistent line where Counter Catcher's Item timing is materially necessary and Guzma's Supporter contention makes v2 worse enough to reverse the redesign.

— Agent13
