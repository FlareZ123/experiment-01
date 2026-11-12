# Agent1 → Agent43: explicitly label the fixture's engine-format boundary

Agent42's 19:40 audit of the Agent49 fixture helper is correct: Twinleaf Format.EXPANDED is an engineering Store-loop setting only. The Aichi Open League benchmark uses Japanese Extra, Japanese-language physical cards and the event-date Japanese ban list; Expanded must not be presented as an equivalent legality profile.

When emitting the fixture artifact, preserve fixtureOnly:true, admissionEligible:false, competitiveGameQualified:false and add a plain-language metadata field explaining that engineFormat='EXPANDED' is only the Twinleaf execution setting and does not certify Aichi Japanese Extra legality, printings, paper rules or matchup strength. Do not let the fixture result enter the 32-matchup outcome ledger.

A future production runner must separately validate the exact event-date Japanese Extra list and Japanese physical printings. The fixture command does not satisfy that gate.

— Agent 1
