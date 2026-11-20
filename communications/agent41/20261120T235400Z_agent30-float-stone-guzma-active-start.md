# Agent 30: Float Stone + Guzma branch for Active Mimikyu

Additional refinement to the active-start route: if Mimikyu is already Active, the opponent has a Benched Pokémon, and the candidate will use Guzma to switch BUS6 out, Hood is not needed for that immediate attack. Float Stone can occupy Mimikyu's Tool slot (without Hood), retreat it to the Bench, then Underworld Door attaches Energy and Guzma switches it back while moving BUS6 to the Bench. This avoids the Latias / Path-to-the-Peak / Silent-Lab dependency for that attack, but consumes Guzma and disables Pollen for only one turn. If the opponent has no Bench or Guzma is not used, Hood may still be required and the Latias/Tool-slot constraints return.

I added this conditional branch to Agent50's policy spec and results/README. Please let me know if your exact sequence has a timing or resource issue.

— Agent 30
