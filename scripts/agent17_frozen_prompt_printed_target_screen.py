"""Narrow, fail-closed printed-category screen for native deck-search selections.

Usage: python scripts/agent17_frozen_prompt_printed_target_screen.py FROZEN.zip CARDLIST.zip
Outputs only aggregate counts. It does not certify card-effect costs, search sequencing,
individual card uniqueness, opponent hidden information, or full paper legality.
"""
from collections import Counter
from pathlib import Path
from zipfile import ZipFile
import hashlib
import json
import sys

PARENT_CATEGORIES = {
    "Fog Crystal CRE": "fog",
    "Capture Energy RCL": "capture",
    "Tag Call CEC": "tag",
    "Guzma & Hala CEC": "guzma_hala",
}
PROTOCOL = "agent17-printed-search-target-screen-v1"


def build_printing_index(card_zip):
    sets = json.loads(card_zip.read("sets/en.json"))
    code_to_ids = {}
    for set_data in sets:
        if set_data.get("ptcgoCode"):
            code_to_ids.setdefault(set_data["ptcgoCode"], []).append(
                set_data["id"])
    return code_to_ids, {}


def resolve_printing(printing, card_zip, code_to_id, cache):
    """Resolve an exact set-coded print from the supplied card archive.

    Prism Star is a known displayed-name spelling alias for the diamond symbol.
    Unknown sets or ambiguous printing properties remain unresolved.
    """
    for code in sorted(code_to_id, key=len, reverse=True):
        suffix = " " + code
        if not printing.endswith(suffix):
            continue
        name = printing[:-len(suffix)]
        candidates = []
        for set_id in code_to_id[code]:
            if set_id not in cache:
                cache[set_id] = json.loads(card_zip.read(
                    "cards/en/" + set_id + ".json"))
            candidates.extend(card for card in cache[set_id]
                              if card["name"] == name)
        if not candidates and name.endswith(" Prism Star"):
            alias = name[:-len(" Prism Star")] + " ◇"
            for set_id in code_to_id[code]:
                candidates.extend(card for card in cache[set_id]
                                  if card["name"] == alias)
        if not candidates:
            return None, "unmatched-name"
        signatures = {
            (card["supertype"], tuple(card.get("subtypes", [])),
             tuple(card.get("types", [])), card["name"])
            for card in candidates
        }
        if len(signatures) != 1:
            return None, "ambiguous-printing"
        card = candidates[0]
        return {
            "name": card["name"],
            "supertype": card["supertype"],
            "subtypes": frozenset(card.get("subtypes", [])),
            "types": frozenset(card.get("types", [])),
        }, "resolved"
    return None, "unlisted-set"


def matches_printed_category(parent, card):
    family = PARENT_CATEGORIES[parent]
    if family == "fog":
        return (card["supertype"] == "Pokémon"
                and "Basic" in card["subtypes"]
                and "Psychic" in card["types"]) or (
                card["supertype"] == "Energy"
                and card["name"] == "Psychic Energy"
                and "Basic" in card["subtypes"])
    if family == "capture":
        return card["supertype"] == "Pokémon" and "Basic" in card["subtypes"]
    if family == "tag":
        return "TAG TEAM" in card["subtypes"]
    return (card["supertype"] == "Trainer" and (
                "Stadium" in card["subtypes"]
                or "Pokémon Tool" in card["subtypes"])
            or card["supertype"] == "Energy"
            and "Special" in card["subtypes"])


def screen_native(archive, card_zip, archive_sha="synthetic",
                  card_sha="synthetic"):
    data = json.loads(archive)
    code_to_id, cache = build_printing_index(card_zip)
    selected = Counter()
    status = Counter()
    examples = Counter()
    roots = Counter()
    seen_trials = set()
    for row in data["rows"]:
        trial = row["trial"]["id"]
        if trial in seen_trials:
            raise ValueError("duplicate trial")
        seen_trials.add(trial)
        ledger = row["rootActionLedger"]
        if len(ledger) != row["rootActionCount"] or len(ledger) != row["actionCount"]:
            raise ValueError("incomplete root ledger")
        played = {
            item["rootActionOrdinal"]: item.get("declared", {}).get(
                "ownerHandPrinting")
            for item in row["nativeAcceptedTargetSidecar"]["events"]
            if item.get("rootActionOrdinal") is not None
        }
        for choice in row["nativePromptChoices"]["events"]:
            if choice["kind"] != "ChooseCardsPrompt" or choice["sourceZone"] != "deck":
                continue
            ordinal = choice["ordinal"]
            root = ledger[ordinal]
            if root["actionOrdinal"] != ordinal or root["action"] != "ResolvePromptAction":
                raise ValueError("prompt root mismatch")
            parent_ordinal = root["initiatingRootActionOrdinal"]
            if parent_ordinal is None or not (0 <= parent_ordinal < ordinal):
                continue
            parent = played.get(parent_ordinal)
            if parent not in PARENT_CATEGORIES:
                continue
            if ledger[parent_ordinal]["action"] != "PlayCardAction":
                raise ValueError("linked printing without a played card")
            choices = choice["selectedCards"]
            if not isinstance(choices, list):
                raise ValueError("missing selected cards from live search")
            roots[parent] += 1
            for printing in choices:
                selected[parent] += 1
                resolved, why = resolve_printing(
                    printing, card_zip, code_to_id, cache)
                if resolved is None:
                    status[(parent, "print-unresolved")] += 1
                    examples[(parent, printing, why)] += 1
                elif matches_printed_category(parent, resolved):
                    status[(parent, "category-matches")] += 1
                else:
                    status[(parent, "category-mismatch")] += 1
                    examples[(parent, printing, "category-mismatch")] += 1
    if len(seen_trials) != data["attempted"]:
        raise ValueError("attempt denominator mismatch")
    return {
        "protocol": PROTOCOL,
        "archive_sha256": archive_sha,
        "card_archive_sha256": card_sha,
        "native_attempts": len(seen_trials),
        "source_rank_scope": [6, 11],
        "printed_category_scopes": [
            {
                "played_card": parent,
                "linked_deck_search_roots": roots[parent],
                "selected_card_instances": selected[parent],
                "exact_print_category_matches": status[(parent, "category-matches")],
                "exact_print_category_mismatches": status[(parent, "category-mismatch")],
                "printing_unresolved": status[(parent, "print-unresolved")],
            }
            for parent in PARENT_CATEGORIES
        ],
        "total_selected": sum(selected.values()),
        "total_exact_category_matches": sum(
            status[(p, "category-matches")] for p in PARENT_CATEGORIES),
        "total_exact_category_mismatches": sum(
            status[(p, "category-mismatch")] for p in PARENT_CATEGORIES),
        "total_printing_unresolved": sum(
            status[(p, "print-unresolved")] for p in PARENT_CATEGORIES),
        "unresolved_or_mismatch_printings": [
            {"played_parent": parent, "selected_printing": printing,
             "reason": why, "instances": count}
            for (parent, printing, why), count in sorted(examples.items())
        ],
        "scope_warning": (
            "This validates only selected card type/category for known exact prints "
            "from four observed deck-search parents. Neither search/card effect "
            "legality nor cost payment, owner zone validity, selection uniqueness, "
            "card count, source deck identity, printing legality, or Pokemon TCG "
            "engine semantics are certified."
        ),
        "paper_prompt_verdict": "PAPER_PROMPT_UNVERIFIED",
    }


def screen_files(native_zip_path, card_zip_path):
    native_bytes = Path(native_zip_path).read_bytes()
    card_bytes = Path(card_zip_path).read_bytes()
    with ZipFile(native_zip_path) as native_zip, ZipFile(card_zip_path) as card_zip:
        names = [name for name in native_zip.namelist()
                 if name.endswith("-native.json")]
        if len(names) != 1:
            raise ValueError("native archive must hold exactly one native JSON")
        return screen_native(
            native_zip.read(names[0]), card_zip,
            hashlib.sha256(native_bytes).hexdigest(),
            hashlib.sha256(card_bytes).hexdigest())


if __name__ == "__main__":
    print(json.dumps(screen_files(sys.argv[1], sys.argv[2]),
                     indent=2, sort_keys=True))
