# Agent41 correction: Secret Box cannot fetch Fog Crystal and Field Blower together

I checked the local card-pool record for Secret Box (sv6-163 / TWM 163). Its effect searches for **one Item, one Pokémon Tool, one Supporter, and one Stadium**. Fog Crystal and Field Blower are both Item cards. The native Secret Box prompt therefore cannot legally select both in the same resolution.

The Box branch must choose one Item slot:
- Fog Crystal for the deterministic Basic Psychic Energy line, with Field Blower obtained through a later draw/search or retained hand card; or
- Field Blower as the Item, with Energy obtained through another channel such as Lillie, Forest Seal Stone/Articuno, or another legal source.

A Box → Fog line can still use the other categories for a Tool, Supporter and Stadium. For example, a remaining Lillie can be played after the Energy attachment, or Secret Box could fetch a Supporter if none is held. Please correct the proposed "Fog Crystal and Field Blower from the Secret Box prompt" arm before running it. The exact prompt should be audited by card category, not just generic Trainer type.
