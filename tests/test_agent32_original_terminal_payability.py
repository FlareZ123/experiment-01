"""Synthetic fail-closed tests for original-source Terminal Period audit."""
import unittest
from copy import deepcopy

from scripts.agent32_original_terminal_payability import audit


def event():
    active={"name":"Mega Absol ex","damage":0,
            "energyCards":["Darkness Energy"]*3,"toolCards":[],
            "printedAttacks":[{"name":"Terminal Period","cost":[7,9]},
                              {"name":"Claw of Darkness","cost":[7,7,9]}]}
    victim={"name":"Tapu Lele-GX","damage":0,"energyCards":[],
            "printedAttacks":[]}
    board=[{"active":active,"bench":[]},{"active":victim,"bench":[]}]
    return {"actionOrdinal":21,"turnBefore":4,"attackName":"Terminal Period",
            "settledPromptChain":True,"settlementCrossesClockReset":False,
            "publicBoardBefore":deepcopy(board),"publicBoardAfter":deepcopy(board)}


def rows():
    out=[]
    for n in range(32):
        source_rank=11 if n<16 else 6
        is_first=n==0
        candidate='champion-reference' if is_first else 'new-moon-lockbreaker-v1'
        out.append({"trial":{"id":f"{source_rank}:{n}:A:{candidate}",
                             "rank":source_rank,"candidateId":candidate},
                    "sourceSeat":0,"candidateSeat":1,
                    "sourceActuallyFirst":True,"finished":False,
                    "winner":None,"endReason":"action-limit",
                    "rootActionLedger":[],"sourceAttackSettlement":{"attacks":[]}})
    out[0]["rootActionLedger"].append({"actionOrdinal":21,"turnBefore":4,
           "playerSlot":0,"action":"AttackAction","attack":"Terminal Period"})
    out[0]["sourceAttackSettlement"]["attacks"].append(event())
    return out


class TerminalAuditTests(unittest.TestCase):
    def test_positive_original_source_root_and_printed_payability(self):
        output=audit(rows())
        self.assertEqual(output['scheduledAttempts'],32)
        self.assertEqual(output['rank11Attempts'],16)
        self.assertEqual(output['totals']['terminal_attacks'],1)
        self.assertEqual(output['totals']['nominal_printed_ko_if_unmodified'],1)
        self.assertEqual(output['terminalsByTwoNativeGames'][0]['nominalClawKoRootOrdinals'],[21])
        self.assertEqual(output['competitiveQualifiedGames'],0)

    def test_two_darkness_cannot_pay_three_energy_claw(self):
        r=rows()
        attacker=r[0]['sourceAttackSettlement']['attacks'][0]
        for board in [attacker['publicBoardBefore'],attacker['publicBoardAfter']]:
            board[0]['active']['energyCards']=['Darkness Energy']*2
        out=audit(r)
        self.assertEqual(out['totals'].get('nominal_claw_payable_and_terminal_dead',0),0)

    def test_defender_sixty_damage_preserves_terminal_condition(self):
        r=rows()
        for board in [r[0]['sourceAttackSettlement']['attacks'][0][k]
                      for k in ['publicBoardBefore','publicBoardAfter']]:
            board[1]['active']['damage']=60
        self.assertEqual(audit(r)['totals'].get('nominal_claw_payable_and_terminal_dead',0),0)

    def test_unknown_target_does_not_claim_nominal_ko(self):
        r=rows()
        r[0]['sourceAttackSettlement']['attacks'][0]['publicBoardBefore'][1]['active']['name']='Unknown'
        r[0]['sourceAttackSettlement']['attacks'][0]['publicBoardAfter'][1]['active']['name']='Unknown'
        self.assertEqual(audit(r)['totals'].get('nominal_printed_ko_if_unmodified',0),0)
        self.assertEqual(audit(r)['totals']['nominal_claw_payable_and_terminal_dead'],1)

    def test_store_root_mismatch_rejected(self):
        r=rows();r[0]['rootActionLedger'][0]['playerSlot']=1
        with self.assertRaises(ValueError):audit(r)

    def test_incomplete_or_duplicate_scheduled_arms_rejected(self):
        r=rows()
        with self.assertRaises(ValueError):audit(r[:-1])
        r[1]['trial']['id']=r[0]['trial']['id']
        with self.assertRaises(ValueError):audit(r)

    def test_missing_printed_attack_contract_rejected(self):
        r=rows()
        r[0]['sourceAttackSettlement']['attacks'][0]['publicBoardBefore'][0]['active']['printedAttacks']=[]
        with self.assertRaises(ValueError):audit(r)


def add_getlost(r, *, settled=True, available_psychic=3):
    acting={"name":"Girafarig","damage":0,
            "energyCards":["Psychic Energy"]*available_psychic,
            "printedAttacks":[{"name":"Get Lost","cost":[9]},
                              {"name":"Mind Shock","cost":[9,9,9]}]}
    target={"name":"Trubbish","damage":0,"energyCards":[],
            "printedAttacks":[]}
    board=[{"active":target,"bench":[]},{"active":acting,"bench":[]}]
    event={"actionOrdinal":31,"turnBefore":6,"attackName":"Get Lost",
           "settledPromptChain":settled,"settlementCrossesClockReset":False,
           "publicBoardBefore":deepcopy(board),
           "publicBoardAfter":deepcopy(board) if settled else None}
    row=r[1]
    row["candidateAttackSettlement"]={"attacks":[event]}
    row["rootActionLedger"]=[
        {"actionOrdinal":31,"turnBefore":6,"playerSlot":1,
         "action":"AttackAction","attack":"Get Lost"},
        {"actionOrdinal":32,"turnBefore":6,"playerSlot":1,
         "action":"ResolvePromptAction","pendingPrompt":"ChooseCardsPrompt",
         "initiatingRootActionOrdinal":31}]
    row["nativePromptChoices"]={"events":[
        {"ordinal":32,"kind":"ChooseCardsPrompt","sourceZone":"discard",
         "sourcePlayerSlot":0,"sourceZoneCardCountBefore":0,
         "selectedCards":None}]}
    return r


class BilateralGetLostTests(unittest.TestCase):
    def test_source_opponent_empty_discard_and_payable_ko(self):
        report=audit(add_getlost(rows()))["candidateGetLost"]
        self.assertEqual(report["totals"]["nominal_mindshock_printed_ko_if_unmodified"],1)
        self.assertEqual(report["totals"]["fully_settled_attack_chains"],1)
        self.assertEqual(report["byGame"][0]["nominalMindShockKoRootOrdinals"],[31])

    def test_two_psychic_cannot_pay_mindshock(self):
        report=audit(add_getlost(rows(),available_psychic=2))["candidateGetLost"]
        self.assertEqual(report["totals"].get("nominal_mindshock_printed_ko_if_unmodified",0),0)

    def test_capped_end_attack_retains_prompt_and_unfinished_distinction(self):
        report=audit(add_getlost(rows(),settled=False))["candidateGetLost"]
        self.assertEqual(report["totals"]["prompt_accepted_but_unfinished_attack"],1)
        self.assertEqual(report["totals"]["right_censored_attack_chains"],1)
        self.assertEqual(report["totals"].get("fully_settled_attack_chains",0),0)
        self.assertEqual(report["totals"]["nominal_mindshock_printed_ko_if_unmodified"],1)

    def test_wrong_receipt_or_unexplained_censor_rejected(self):
        r=add_getlost(rows());r[1]["nativePromptChoices"]["events"][0]["sourcePlayerSlot"]=1
        with self.assertRaises(ValueError):audit(r)
        r=add_getlost(rows(),settled=False);r[1]["endReason"]="engine-terminal"
        with self.assertRaises(ValueError):audit(r)
        r=add_getlost(rows());r[1]["rootActionLedger"][1]["initiatingRootActionOrdinal"]=99
        with self.assertRaises(ValueError):audit(r)


if __name__=='__main__':unittest.main()
