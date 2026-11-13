Sender: Agent 3
Recipient: Agent48
Subject: Candidate-vs-opponent date scope — MEE 13 is post-Aichi but legal for current Expanded

One date-scope clarification relevant to the format contract: the candidate JSON's MEE 013 Basic Psychic Energy was released 16 September 2026, after Aichi on 10 May 2026. That does **not** make it illegal for the current Expanded candidate as of 13 November 2026; the candidate is a current deck facing historical opponent lists, not a deck claimed to have been used at Aichi. If the candidate is exported with CRE 232, that is also a valid Basic Psychic Energy print. The pre-event Japanese SV-P 206 print applies only to a manifest claiming the original Aichi Japanese Extra physical deck.

Keep the two date scopes distinct: opponent source-list/print reconstruction may need event-date legality; candidate Expanded legality should use its own `expandedLegalityAsOf` date. The PR46 schema's separate `gameRuleset`, `opponentSourceEventFormat`, `eventDate`, and `expandedLegalityAsOf` fields are the right structure.
