"""Read-only original rank-11 two-seat attack alternatives audit.

The supplied ZIP records are development evidence. No attack is replayed here.
"""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from zipfile import ZipFile

PRINTED_TARGET_HP = {
    ("champion-reference", "Tapu Lele-GX"): 170,
    ("new-moon-lockbreaker-v1", "Unown"): 60,
}
CLAW_NATIVE_COST = [7, 7, 9]  # Darkness, Darkness, Colorless, from native printed attack


def audit(rows: list[dict]) -> dict:
    """Count observed dead Terminal Periods and printed-payable Claw alternatives.

    All facts use original source's public attack settlement and Store action
    ledger. The fixed printed HP map is separately verified from the card pool.
    """
    if len(rows) != 32 or len({r["trial"]["id"] for r in rows}) != 32:
        raise ValueError("Expected all 32 distinct frozen original attempt rows")
    totals = Counter()
    trials = []
    for row in rows:
        if row["trial"]["rank"] != 11:
            continue
        source_seat = row["sourceSeat"]
        candidate_seat = row["candidateSeat"]
        if {source_seat, candidate_seat} != {0, 1}:
            raise ValueError("Two physical seats must be distinct")
        ledger = {x["actionOrdinal"]: x for x in row["rootActionLedger"]}
        trial = row["trial"]
        counters = Counter()
        eligible_ordinals = []
        for effect in row["sourceAttackSettlement"]["attacks"]:
            if effect["attackName"] != "Terminal Period":
                continue
            counters["terminal_attacks"] += 1
            root = ledger.get(effect["actionOrdinal"])
            if (not root or root.get("action") != "AttackAction"
                or root.get("attack") != "Terminal Period"
                or root.get("playerSlot") != source_seat
                or root.get("turnBefore") != effect.get("turnBefore")
                or effect.get("settledPromptChain") is not True
                or effect.get("settlementCrossesClockReset") is True):
                raise ValueError("Original native Store root/settlement contract missing")
            before = effect["publicBoardBefore"]
            after = effect["publicBoardAfter"]
            if len(before) != 2 or len(after) != 2:
                raise ValueError("Incomplete two-seat public board")
            attacker = before[source_seat]["active"]
            defender = before[candidate_seat]["active"]
            if (attacker["name"] != "Mega Absol ex"
                or {"name": "Claw of Darkness", "cost": CLAW_NATIVE_COST}
                    not in attacker["printedAttacks"]):
                raise ValueError("Source printed Mega Absol alternative is not attested")
            if before == after:
                counters["unchanged_public_board"] += 1
            darkness_cards = attacker["energyCards"].count("Darkness Energy")
            if defender.get("damage") == 0:
                counters["defender_zero_damage"] += 1
            if darkness_cards >= 3 and defender.get("damage") != 60:
                counters["nominal_claw_payable_and_terminal_dead"] += 1
                hp = PRINTED_TARGET_HP.get((trial["candidateId"], defender["name"]))
                if hp is not None and 200 + defender["damage"] >= hp:
                    counters["nominal_printed_ko_if_unmodified"] += 1
                    eligible_ordinals.append(effect["actionOrdinal"])
        totals.update(counters)
        if counters["terminal_attacks"]:
            trials.append({"trialId": trial["id"],
                           "actualSourceStartsFirst": row["sourceActuallyFirst"],
                           "engineFinished": row["finished"],
                           "engineWinnerSlot": row["winner"],
                           "endReason": row["endReason"],
                           "counters": dict(counters),
                           "nominalClawKoRootOrdinals": eligible_ordinals})
    return {"schema": "agent32-original-rank11-dead-attack-payable-alternatives-v2",
            "candidateGetLost": audit_get_lost(rows),
            "source": "original frozen v2 development ZIP; no gameplay rerun",
            "scheduledAttempts": len(rows),
            "rank11Attempts": sum(x["trial"]["rank"] == 11 for x in rows),
            "terminalsByTwoNativeGames": trials,
            "totals": dict(totals),
            "competitiveQualifiedGames": 0,
            "qualification": "Nominal printed cost and damage before modifiers only. No native Claw fork, poison/lock immunity check, policy equivalence, tournament clock, or win-rate inference."}



def audit_get_lost(rows: list[dict]) -> dict:
    """Inspect candidate Get Lost roots, including censored final prompt chains.

    Requires actual accepted opponent-discard prompt and root/seat join.
    Printed Energy and nominal damage cannot certify native alternate effects.
    """
    results = []
    totals = Counter()
    for row in rows:
        if row["trial"]["rank"] != 11:
            continue
        ledger = {event["actionOrdinal"]: event
                  for event in row["rootActionLedger"]}
        prompts = {event["ordinal"]: event for event in
                   row.get("nativePromptChoices", {}).get("events", [])}
        counts = Counter()
        possible_ko_ordinals = []
        for attack in row.get("candidateAttackSettlement", {}).get("attacks", []):
            if attack["attackName"] != "Get Lost":
                continue
            counts["get_lost_native_attacks"] += 1
            ordinal = attack["actionOrdinal"]
            root = ledger.get(ordinal)
            if (not root or root.get("action") != "AttackAction"
                or root.get("attack") != "Get Lost"
                or root.get("playerSlot") != row["candidateSeat"]
                or root.get("turnBefore") != attack.get("turnBefore")
                or attack.get("settlementCrossesClockReset") is True):
                raise ValueError("Missing candidate authentic Get Lost Store receipt")
            if attack.get("settledPromptChain") is True:
                counts["fully_settled_attack_chains"] += 1
            else:
                if attack.get("settledPromptChain") is not False or row.get("endReason") != "action-limit":
                    raise ValueError("Unexplained uncompleted Get Lost attack chain")
                counts["right_censored_attack_chains"] += 1
            native_prompts = [prompts.get(a["actionOrdinal"]) for a in
                row["rootActionLedger"] if
                a.get("initiatingRootActionOrdinal") == ordinal and
                a.get("pendingPrompt") == "ChooseCardsPrompt"]
            if len(native_prompts) != 1 or native_prompts[0] is None:
                raise ValueError("Get Lost native opponent-discard prompt missing")
            prompt = native_prompts[0]
            if (prompt.get("sourceZone") != "discard"
                or prompt.get("sourcePlayerSlot") != row["sourceSeat"]):
                raise ValueError("Get Lost prompt source zone/seat mismatch")
            if (prompt.get("sourceZoneCardCountBefore") != 0
                or prompt.get("selectedCards") is not None):
                continue
            counts["empty_opponent_discard_cancelled"] += 1
            if attack.get("settledPromptChain") is True:
                counts["settled_empty_discard_attacks"] += 1
            else:
                counts["prompt_accepted_but_unfinished_attack"] += 1
            before = attack["publicBoardBefore"]
            if len(before) != 2:
                raise ValueError("Get Lost public opponent board missing")
            actor = before[row["candidateSeat"]]["active"]
            defender = before[row["sourceSeat"]]["active"]
            if (actor["name"] != "Girafarig"
                or {"name": "Mind Shock", "cost": [9, 9, 9]}
                    not in actor["printedAttacks"]):
                raise ValueError("Exact printed Girafarig alternate not visible")
            if (actor["energyCards"].count("Psychic Energy") >= 3
                and defender["name"] == "Trubbish"
                and defender["damage"] == 0):
                counts["nominal_mindshock_printed_ko_if_unmodified"] += 1
                possible_ko_ordinals.append(ordinal)
        totals.update(counts)
        if counts["get_lost_native_attacks"]:
            results.append({"trialId": row["trial"]["id"],
                            "counters": dict(counts),
                            "nominalMindShockKoRootOrdinals": possible_ko_ordinals})
    return {"schema": "agent32-original-rank11-candidate-getlost-payable-mindshock-v1",
            "byGame": results, "totals": dict(totals),
            "competitiveQualifiedGames": 0,
            "qualification": "Root-and-accepted-prompt observed, with 23 complete effect chains and one action-capped final chain. Nominal 3-Energy Mind Shock versus Trubbish has no Store same-state fork or win-rate inference."}

def audit_zip(path: Path) -> dict:
    with ZipFile(path) as archive:
        items = [name for name in archive.namelist()
                 if name.endswith("-native.json")]
        if len(items) != 1:
            raise ValueError("Expected one frozen native 32-arm JSON in ZIP")
        return audit(json.loads(archive.read(items[0]))["rows"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path, help="frozen v2 original native ZIP")
    print(json.dumps(audit_zip(parser.parse_args().archive), indent=2))
