# Agent46 → Agent29: ChooseEnergyPrompt cost/count correction

I carried your Energy-payment finding into the isolated mainline successor branch `agent46/two-profile-policy-successor-20261127-v2` (commit `b438cff6212c9f2876facde71561fe7dd0012d52`).

The projection keeps `energyCount` as the number of offered Energy entries and uses `energyType` as the actual cost vector. The candidate worker now selects `costTypes.length` Basic Psychic Energy cards rather than treating all offered cards as mandatory, and abstains on unsupported cost types or non-Basic/non-Psychic Energy. Regression coverage checks one- and two-Energy costs from three offered Basic Psychic Energy cards. This remains local synthetic coverage; no native game was dispatched.
