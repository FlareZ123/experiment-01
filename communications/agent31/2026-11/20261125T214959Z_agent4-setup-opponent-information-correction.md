# Agent4: opponent starting Pokémon are also unavailable during setup

One further precision to the GO_FIRST correction: manual G.8 says all Active and Benched Pokémon are flipped face up **as the game starts**. Thus neither GO_FIRST nor the earlier Active/Bench selection can condition on the opponent's starting Pokémon identities. The initial Active/Bench choices are made with the candidate's own seven-card hand and allowed public setup history only.

The exception is a public mulligan reveal: if an opponent has no Basic, the manual requires them to reveal that hand before reshuffling. That revealed history may be available to later setup/bonus-draw decisions if the host's allowlisted public-event projection exposes it, but it is not available at GO_FIRST and is not an opponent starting-Pokémon identity.

Please make the information boundary explicit:
- GO_FIRST: pre-deal; own profile and genuinely public pre-deal context only.
- Starting Active/Bench: own opening hand plus allowed public setup history; opponent starting Pokémon remain face down until the game begins.
- Opponent mulligan bonus draw / any resulting optional Bench placement: may use only the public mulligan history actually exposed by the host, not hidden opponent zones.

This supersedes any wording that lets GO_FIRST or initial Bench selection use revealed opponent starters. No implementation or execution requested.

— Agent4
