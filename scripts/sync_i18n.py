import json
import os
import sys
from typing import Any, Dict, Optional

BASE_FILE = "en.json"
LANGS = ["ja", "ko", "zh", "fr", "de", "es", "es-LA", "pt", "ru", "vi"]
META_KEYS = {"_comment", "label"}
MISSING_SUFFIX = ".missing.json"


def load_json(path: str) -> Dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path: str, data: Dict):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def is_missing_val(value: Any) -> bool:
    return value in ("", None) or value == {} or value == []


def diff_keys(base: Any, target: Any) -> Optional[Any]:
    """
    Recursively extract missing values from target using base as source.
    """
    if isinstance(base, dict):
        result = {}
        target = target or {}
        for k, v in base.items():
            if k in META_KEYS:
                continue
            sub = diff_keys(v, target.get(k))
            if sub is not None:
                result[k] = sub
        return result if result else None

    if isinstance(base, list):
        if not target:
            return base
        return None

    # primitive value
    if is_missing_val(target):
        return base

    return None


def merge_dicts(base: Any, overlay: Any) -> Any:
    """
    Recursively merge overlay onto base.
    Overlay wins only when value is non-empty.
    """
    if isinstance(base, dict):
        result = {}
        overlay = overlay or {}
        for k, v in base.items():
            if k in META_KEYS:
                result[k] = v
                continue
            result[k] = merge_dicts(v, overlay.get(k))
        return result

    if isinstance(base, list):
        if overlay and isinstance(overlay, list) and len(overlay) > 0:
            return overlay
        return base

    # primitive
    if not is_missing_val(overlay):
        return overlay
    return base


def validate_complete(node: Any, path="") -> bool:
    """
    Returns False if ANY translatable value is empty.
    """
    if isinstance(node, dict):
        for k, v in node.items():
            if k in META_KEYS:
                continue
            if not validate_complete(v, f"{path}.{k}" if path else k):
                return False
        return True

    if isinstance(node, list):
        return len(node) > 0

    return not is_missing_val(node)


def prepare_missing():
    print("🔍 Checking for missing keys...")
    base = load_json(BASE_FILE)
    found_any = False

    for lang in LANGS:
        lang_file = f"{lang}.json"
        if not os.path.exists(lang_file):
            print(f"⚠️ {lang_file} missing — skipped")
            continue

        target = load_json(lang_file)
        missing = diff_keys(base, target)

        if missing:
            out_file = f"{lang}{MISSING_SUFFIX}"
            save_json(out_file, missing)
            print(f"📄 {lang_file} → {out_file} ({len(missing.get('ui', {}))} UI keys missing)")
            found_any = True
        else:
            print(f"✅ {lang_file}: no missing keys")

    return found_any


def merge_and_finalize():
    print("📦 Merging translations...")
    base = load_json(BASE_FILE)
    failed = False

    for lang in LANGS:
        lang_file = f"{lang}.json"
        missing_file = f"{lang}{MISSING_SUFFIX}"

        if not os.path.exists(lang_file):
            continue

        # Start with base, merge existing lang, then merge missing (translated)
        current_lang = load_json(lang_file)
        merged = merge_dicts(base, current_lang)

        if os.path.exists(missing_file):
            print(f"🔄 {lang}: merging {missing_file}")
            missing_translations = load_json(missing_file)
            merged = merge_dicts(merged, missing_translations)

        # Save to primary file
        save_json(lang_file, merged)

        if not validate_complete(merged):
            print(f"🚨 {lang}: unresolved missing translations")
            failed = True
        else:
            print(f"✅ {lang}: update + validation OK")

    if failed:
        print("🚨 Build failed: some languages are still incomplete.")
        sys.exit(1)

    # Cleanup
    for lang in LANGS:
        mf = f"{lang}{MISSING_SUFFIX}"
        if os.path.exists(mf):
            os.remove(mf)
            print(f"🧹 Cleaned up {mf}")

    print("🎉 Sync complete!")


def main():
    if len(sys.argv) < 2:
        print("Usage: python sync_i18n.py [prepare|merge]")
        sys.exit(1)

    cmd = sys.argv[1].lower()
    if cmd == "prepare":
        prepare_missing()
    elif cmd == "merge":
        merge_and_finalize()
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)


if __name__ == "__main__":
    main()
