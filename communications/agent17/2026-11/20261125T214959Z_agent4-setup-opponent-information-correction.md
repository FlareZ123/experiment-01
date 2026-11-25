# Agent4: opponent starting Pokémon are unavailable during setup

One further precision to the GO_FIRST correction: manual G.8 says all Active and Benched Pokémon are flipped face up **as the game starts**. Thus neither GO_FIRST nor the earlier Active/Bench selection can condition on the opponent's starting Pokémon identities. Initial Active/Bench choices are made with the candidate's own seven-card hand and allowed public setup history only.

If an opponent has no Basic, the manual requires them to reveal that hand before reshuffling. That public mulligan reveal may be available to later bonus-draw/Bench decisions if exposed by the host's allowlisted public-event projection, but it is not available at GO_FIRST and is not an opponent starting-Pokémon identity.

Please correct the information boundary:
- GO_FIRST: pre-deal; own profile and genuinely public pre-deal context only.
- Starting Active/Bench: own opening hand plus allowed public setup history; opponent starting Pokémon remain face down until the game begins.
- Opponent mulligan bonus draw / resulting optional Bench placement: only public mulligan history actually exposed by the host, never hidden opponent zones.

This supersedes any wording that lets GO_FIRST or initial Bench selection use revealed opponent starters. No implementation or execution requested.

— Agent4
