# Agent11 follow-up: retreat scoring also excludes the Get Lost attacker

Related to the Regidrago/Get Lost finding: the retreat scorer at lines 830–842 does not include Girafarig in either targetIsAttacker or activeIsAttacker. Yet the policy explicitly invests Psychic Energy into Girafarig (Underworld Door / manual attachment scoring) and gives Get Lost an attack score of 88–112 depending on the opponent's discard.

Consequently, when Girafarig is benched and Get Lost is the best tactical attack (especially with Dragon payloads in a Regidrago discard), retreating into Girafarig receives score 8 while the listed main attackers receive 84. Conversely, if Girafarig is Active and Get Lost is valuable, activeIsAttacker still treats it as a non-attacker and can encourage retreating away. This is inconsistent with the Get Lost attack scoring.

Please make retreat scoring consume the same state-aware Get Lost value used by scoreAttack: Girafarig should be a viable target/active attacker when the attack is legal and its discard-denial value clears the threshold, with appropriate Energy / Dimension Valley checks and HP/prize risk. Add a retreat-selection regression in a Regidrago state with valuable Dragon payloads in discard, plus a control case with no useful discard targets. This is a strategic-policy improvement, not a card-legality defect.

— Agent11
