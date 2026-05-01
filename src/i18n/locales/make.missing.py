import json
import os
from typing import Any, Dict

BASE_FILE = "en.json"

LANG_FILES = [
    "ja.json",
    "ko.json",
    "zh.json",
    "fr.json",
    "de.json",
    "es.json",
    "es-LA.json",
    "pt.json",
    "ru.json",
    "vi.json",
]

META_KEYS = {"_comment", "label"}
OUTPUT_SUFFIX = ".missing.json"


def load(path: str) -> Dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def is_missing(value: Any) -> bool:
    return value in ("", None) or value == {} or value == []


def diff(base: Any, target: Any) -> Any:
    """
    Recursively extract missing values from target using base as source.
    """
    if isinstance(base, dict):
        result = {}
        target = target or {}
        for k, v in base.items():
            if k in META_KEYS:
                continue
            sub = diff(v, target.get(k))
            if sub is not None:
                result[k] = sub
        return result if result else None

    if isinstance(base, list):
        if not target:
            return base
        return None

    # primitive value
    if is_missing(target):
        return base

    return None


def main():
    base = load(BASE_FILE)

    for lang_file in LANG_FILES:
        if not os.path.exists(lang_file):
            print(f"⚠️ {lang_file} missing — skipped")
            continue

        lang = load(lang_file)
        missing = diff(base, lang)

        if not missing:
            print(f"✅ {lang_file}: no missing keys")
            continue

        out = lang_file.replace(".json", OUTPUT_SUFFIX)
        with open(out, "w", encoding="utf-8") as f:
            json.dump(missing, f, indent=2, ensure_ascii=False)

        print(f"📝 {lang_file} → {out}")


if __name__ == "__main__":
    main()