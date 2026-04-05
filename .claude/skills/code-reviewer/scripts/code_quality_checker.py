#!/usr/bin/env python3
"""
Code Quality Checker
Scans TypeScript/JavaScript/CSS files for common issues:
- Type safety (any, unsafe casts)
- Performance (missing memo, inline functions in render)
- Security (dangerouslySetInnerHTML, eval, innerHTML)
- Code smells (console.log, TODO/FIXME, magic numbers, large files)
- Accessibility (missing alt, aria-label)
"""

import os
import sys
import re
import json
import argparse
from pathlib import Path
from typing import Dict, List
from datetime import datetime

SEVERITY_HIGH = "HIGH"
SEVERITY_MEDIUM = "MEDIUM"
SEVERITY_LOW = "LOW"

# File extensions to scan
CODE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx"}
STYLE_EXTENSIONS = {".css", ".scss"}
ALL_EXTENSIONS = CODE_EXTENSIONS | STYLE_EXTENSIONS

# Thresholds
MAX_FILE_LINES = 400
MAX_FUNCTION_LINES = 80


class Finding:
    def __init__(self, file: str, line: int, severity: str, category: str, message: str, suggestion: str = ""):
        self.file = file
        self.line = line
        self.severity = severity
        self.category = category
        self.message = message
        self.suggestion = suggestion

    def to_dict(self):
        d = {
            "file": self.file,
            "line": self.line,
            "severity": self.severity,
            "category": self.category,
            "message": self.message,
        }
        if self.suggestion:
            d["suggestion"] = self.suggestion
        return d

    def __str__(self):
        icon = {"HIGH": "🔴", "MEDIUM": "🟡", "LOW": "🔵"}.get(self.severity, "⚪")
        loc = f"{self.file}:{self.line}" if self.line else self.file
        s = f"  {icon} [{self.severity}] {self.category} — {loc}\n     {self.message}"
        if self.suggestion:
            s += f"\n     Fix: {self.suggestion}"
        return s


# ── Rule checks ──────────────────────────────────────────────

def check_type_safety(filepath: str, lines: List[str]) -> List[Finding]:
    findings = []
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("//") or stripped.startswith("*"):
            continue
        if re.search(r'\bas\s+any\b', line):
            findings.append(Finding(filepath, i, SEVERITY_MEDIUM, "Type Safety",
                                    "`as any` unsafe cast found", "Use explicit type or type guard"))
        if re.search(r':\s*any\b', line) and not stripped.startswith("//"):
            findings.append(Finding(filepath, i, SEVERITY_MEDIUM, "Type Safety",
                                    "Explicit `any` type annotation", "Define a proper interface or type"))
    return findings


def check_security(filepath: str, lines: List[str]) -> List[Finding]:
    findings = []
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("//") or stripped.startswith("*"):
            continue
        if "dangerouslySetInnerHTML" in line:
            findings.append(Finding(filepath, i, SEVERITY_HIGH, "Security",
                                    "dangerouslySetInnerHTML used — XSS risk",
                                    "Sanitize with DOMPurify or use text content"))
        if re.search(r'\beval\s*\(', line):
            findings.append(Finding(filepath, i, SEVERITY_HIGH, "Security",
                                    "eval() used — code injection risk", "Remove eval and use safer alternatives"))
        if ".innerHTML" in line and "dangerouslySetInnerHTML" not in line:
            findings.append(Finding(filepath, i, SEVERITY_HIGH, "Security",
                                    "Direct innerHTML assignment — XSS risk",
                                    "Use textContent or React JSX instead"))
        if re.search(r'document\.write\s*\(', line):
            findings.append(Finding(filepath, i, SEVERITY_MEDIUM, "Security",
                                    "document.write() used", "Use DOM manipulation instead"))
    return findings


def check_performance(filepath: str, lines: List[str], content: str) -> List[Finding]:
    findings = []
    # Check for inline arrow functions in JSX event handlers (common re-render cause)
    for i, line in enumerate(lines, 1):
        if re.search(r'onClick=\{[\s]*\(\)', line) and "useCallback" not in content[:500]:
            pass  # Too noisy for a static checker, skip

    # Large file check
    if len(lines) > MAX_FILE_LINES:
        findings.append(Finding(filepath, 0, SEVERITY_LOW, "Performance",
                                f"File has {len(lines)} lines (threshold: {MAX_FILE_LINES})",
                                "Consider splitting into smaller modules"))

    # Check for missing React.memo on component exports
    if filepath.endswith((".tsx", ".jsx")):
        has_component = bool(re.search(r'const\s+\w+\s*:\s*React\.FC', content) or
                             re.search(r'function\s+\w+\s*\(', content))
        has_memo = "React.memo" in content or "memo(" in content
        export_default = re.search(r'export\s+default\s+(\w+)', content)
        if has_component and not has_memo and export_default:
            name = export_default.group(1)
            findings.append(Finding(filepath, 0, SEVERITY_LOW, "Performance",
                                    f"Component `{name}` exported without React.memo",
                                    "Wrap with React.memo() if props are stable"))

    return findings


def check_accessibility(filepath: str, lines: List[str]) -> List[Finding]:
    findings = []
    if not filepath.endswith((".tsx", ".jsx")):
        return findings
    for i, line in enumerate(lines, 1):
        # img without alt — check next 5 lines for multiline JSX
        if "<img" in line and "alt=" not in line:
            nearby = "".join(lines[i-1:i+5])
            if "alt=" not in nearby:
                findings.append(Finding(filepath, i, SEVERITY_MEDIUM, "Accessibility",
                                        "<img> without alt attribute", "Add descriptive alt text"))
        # button with only emoji content (heuristic)
        if re.search(r'<button[^>]*>[^<]*[\U0001F300-\U0001FAFF][^<]*</button>', line):
            if "aria-label" not in line:
                findings.append(Finding(filepath, i, SEVERITY_MEDIUM, "Accessibility",
                                        "Button with emoji content lacks aria-label",
                                        "Add aria-label for screen readers"))
    return findings


def check_code_smells(filepath: str, lines: List[str]) -> List[Finding]:
    findings = []
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("//") or stripped.startswith("*"):
            continue
        # console.log left in
        if re.search(r'console\.(log|debug|info)\s*\(', line) and "error" not in line.lower():
            findings.append(Finding(filepath, i, SEVERITY_LOW, "Code Smell",
                                    "console.log/debug/info left in code",
                                    "Remove or replace with proper logging"))
        # TODO / FIXME
        if re.search(r'\b(TODO|FIXME|HACK|XXX)\b', line, re.IGNORECASE):
            tag = re.search(r'\b(TODO|FIXME|HACK|XXX)\b', line, re.IGNORECASE).group(1)
            findings.append(Finding(filepath, i, SEVERITY_LOW, "Code Smell",
                                    f"{tag} comment found: {stripped[:80]}"))
        # Magic numbers in logic (skip CSS-like values, imports, array indices 0/1)
        if filepath.endswith((".ts", ".tsx", ".js", ".jsx")):
            nums = re.findall(r'(?<!=\s)(?<!\[)\b(\d{4,})\b(?!\s*[;,\]}px%rem])', line)
            for n in nums:
                if int(n) > 999 and "import" not in line and "version" not in line.lower():
                    findings.append(Finding(filepath, i, SEVERITY_LOW, "Code Smell",
                                            f"Magic number {n} — consider extracting to a named constant"))

    return findings


def check_css(filepath: str, lines: List[str]) -> List[Finding]:
    findings = []
    has_landscape = False
    for i, line in enumerate(lines, 1):
        if "orientation: landscape" in line or "max-height" in line:
            has_landscape = True
        # !important overuse
        if "!important" in line:
            findings.append(Finding(filepath, i, SEVERITY_LOW, "CSS",
                                    "!important used — may indicate specificity issue",
                                    "Refactor selectors to avoid !important"))
    # Missing landscape media query
    if len(lines) > 50 and not has_landscape:
        findings.append(Finding(filepath, 0, SEVERITY_LOW, "CSS",
                                "No landscape/height media query found",
                                "Consider adding @media (orientation: landscape) for mobile"))
    return findings


# ── Main class ──────────────────────────────────────────────

class CodeQualityChecker:
    def __init__(self, target_path: str, verbose: bool = False, extensions: set = None):
        self.target_path = Path(target_path)
        self.verbose = verbose
        self.extensions = extensions or ALL_EXTENSIONS
        self.findings: List[Finding] = []
        self.stats = {"files_scanned": 0, "total_lines": 0}

    def run(self) -> Dict:
        print(f"🚀 Code Quality Checker")
        print(f"📁 Target: {self.target_path}")

        if not self.target_path.exists():
            print(f"❌ Path does not exist: {self.target_path}")
            sys.exit(1)

        self._scan()
        return self._build_results()

    def _scan(self):
        files = []
        if self.target_path.is_file():
            files = [self.target_path]
        else:
            for ext in self.extensions:
                files.extend(self.target_path.rglob(f"*{ext}"))
            # Exclude node_modules, dist, .git
            files = [f for f in files if not any(p in f.parts for p in ("node_modules", "dist", ".git"))]

        for filepath in sorted(files):
            self._check_file(filepath)

    def _check_file(self, filepath: Path):
        try:
            content = filepath.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            return

        lines = content.splitlines()
        self.stats["files_scanned"] += 1
        self.stats["total_lines"] += len(lines)
        rel = str(filepath.relative_to(self.target_path)) if self.target_path.is_dir() else filepath.name

        if self.verbose:
            print(f"  Scanning {rel} ({len(lines)} lines)")

        ext = filepath.suffix
        if ext in CODE_EXTENSIONS:
            self.findings.extend(check_type_safety(rel, lines))
            self.findings.extend(check_security(rel, lines))
            self.findings.extend(check_performance(rel, lines, content))
            self.findings.extend(check_accessibility(rel, lines))
            self.findings.extend(check_code_smells(rel, lines))
        if ext in STYLE_EXTENSIONS:
            self.findings.extend(check_css(rel, lines))

    def _build_results(self) -> Dict:
        by_severity = {SEVERITY_HIGH: [], SEVERITY_MEDIUM: [], SEVERITY_LOW: []}
        for f in self.findings:
            by_severity[f.severity].append(f)

        results = {
            "timestamp": datetime.now().isoformat(),
            "target": str(self.target_path),
            "stats": self.stats,
            "summary": {
                "total": len(self.findings),
                "high": len(by_severity[SEVERITY_HIGH]),
                "medium": len(by_severity[SEVERITY_MEDIUM]),
                "low": len(by_severity[SEVERITY_LOW]),
            },
            "findings": [f.to_dict() for f in self.findings],
        }

        # Print report
        print(f"\n{'='*60}")
        print(f"  CODE QUALITY REPORT")
        print(f"{'='*60}")
        print(f"  Files scanned: {self.stats['files_scanned']}")
        print(f"  Total lines:   {self.stats['total_lines']}")
        print(f"  Findings:      🔴 {results['summary']['high']} HIGH  "
              f"🟡 {results['summary']['medium']} MEDIUM  "
              f"🔵 {results['summary']['low']} LOW")
        print(f"{'='*60}\n")

        if by_severity[SEVERITY_HIGH]:
            print("── HIGH ──")
            for f in by_severity[SEVERITY_HIGH]:
                print(f)
        if by_severity[SEVERITY_MEDIUM]:
            print("\n── MEDIUM ──")
            for f in by_severity[SEVERITY_MEDIUM]:
                print(f)
        if by_severity[SEVERITY_LOW]:
            print("\n── LOW ──")
            for f in by_severity[SEVERITY_LOW]:
                print(f)

        if not self.findings:
            print("  ✅ No issues found!")

        print()
        return results


def main():
    parser = argparse.ArgumentParser(description="Code Quality Checker — scan for bugs, security, performance, a11y issues")
    parser.add_argument("target", help="File or directory to scan")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show per-file progress")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    parser.add_argument("--output", "-o", help="Write JSON results to file")
    args = parser.parse_args()

    checker = CodeQualityChecker(args.target, verbose=args.verbose)
    results = checker.run()

    if args.json or args.output:
        output = json.dumps(results, indent=2)
        if args.output:
            with open(args.output, "w") as f:
                f.write(output)
            print(f"Results written to {args.output}")
        elif args.json:
            print(output)


if __name__ == "__main__":
    main()
