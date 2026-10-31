"""Fail-closed static validation of GitHub Actions workflow declarations.

Requires PyYAML >= 6; makes no network calls and starts no jobs.
"""
import argparse
import re
from pathlib import Path

import yaml


EXPRESSIONS = re.compile(r"\$\{\{(.*?)\}\}", re.DOTALL)
INPUTS = re.compile(r"(?<![\w.])(?:github\.event\.)?inputs(?:\.([A-Za-z_][\w-]*)|\[\s*['\"]([^'\"]+)['\"]\s*\])")


class StrictLoader(yaml.BaseLoader):
    """Preserves literal YAML key on and rejects duplicate mappings."""

    def construct_mapping(self, node, deep=False):
        mapping = {}
        for key_node, value_node in node.value:
            key = self.construct_object(key_node, deep=deep)
            if key in mapping:
                raise yaml.constructor.ConstructorError(
                    "while reading mapping", node.start_mark,
                    f"duplicate key {key!r}", key_node.start_mark
                )
            mapping[key] = self.construct_object(value_node, deep=deep)
        return mapping


def strings(tree):
    if isinstance(tree, str):
        yield tree
    elif isinstance(tree, dict):
        for child in tree.values():
            yield from strings(child)
    elif isinstance(tree, list):
        for child in tree:
            yield from strings(child)


def implicit_if_expressions(tree):
    """GitHub Actions allows unwrapped expressions specifically under if keys."""
    if isinstance(tree, dict):
        for key, value in tree.items():
            if key == "if" and isinstance(value, str):
                yield value
            yield from implicit_if_expressions(value)
    elif isinstance(tree, list):
        for child in tree:
            yield from implicit_if_expressions(child)


def validate_workflow(source):
    try:
        doc = yaml.load(source, Loader=StrictLoader)
    except yaml.YAMLError as error:
        return [f"invalid YAML: {error}"]
    if not isinstance(doc, dict):
        return ["workflow root must be a mapping"]
    triggers = doc.get("on")
    if isinstance(triggers, dict):
        events = set(triggers)
    elif isinstance(triggers, list):
        events = set(triggers)
    elif isinstance(triggers, str):
        events = {triggers}
    else:
        return ["missing or invalid on declaration"]

    errors = []
    if "push" in events:
        errors.append("push trigger forbidden: use workflow_dispatch")

    declared = set()
    for event in ("workflow_dispatch", "workflow_call"):
        if event not in events or not isinstance(triggers, dict):
            continue
        config = triggers[event] or {}
        if not isinstance(config, dict):
            errors.append(f"{event} configuration must be a mapping")
            continue
        inputs = config.get("inputs") or {}
        if not isinstance(inputs, dict):
            errors.append(f"{event}.inputs must be a mapping")
            continue
        if event == "workflow_dispatch" and len(inputs) > 25:
            errors.append(f"workflow_dispatch has {len(inputs)} inputs; limit is 25")
        declared.update(inputs)

    referenced = set()
    expressions = list(implicit_if_expressions(doc))
    for value in strings(doc):
        expressions.extend(EXPRESSIONS.findall(value))
    for expression in expressions:
        for match in INPUTS.finditer(expression):
            referenced.add(match.group(1) or match.group(2))
    for name in sorted(referenced - declared):
        errors.append(f"undeclared expression input: {name}")
    return errors


def scan(directory):
    paths = sorted(directory.glob("*.yml")) + sorted(directory.glob("*.yaml"))
    if not paths:
        return {str(directory): ["no workflow YAML files found"]}
    failures = {}
    for path in paths:
        errors = validate_workflow(path.read_text(encoding="utf-8"))
        if errors:
            failures[str(path)] = errors
    return failures


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", nargs="?", default=".github/workflows")
    errors = scan(Path(parser.parse_args().directory))
    if errors:
        for path, messages in errors.items():
            for message in messages:
                print(f"FAIL {path}: {message}")
        return 1
    print("PASS: repository workflow syntax, input counts, references, and triggers")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
