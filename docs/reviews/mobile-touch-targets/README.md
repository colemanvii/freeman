# Mobile touch-target verification

Application change: c1d280e. Base: release/approved-v5-2026-10-18 at 8a6d12f.

Browser viewport checks passed at 320×568, 390×844 and 430×844 on Company, Projects, Contact and The Optimist. A 1440×900 desktop regression check also passed.

- All requested targets are at least 44×44px; nine hit-test points per target reach the intended element.
- No target overlap or document horizontal overflow.
- Clicks in the expanded target regions switch Company tabs, navigate to Contact, return through Close and advance/reverse gallery photographs at all three mobile widths.
- All measured visible boxes and fonts match the baseline. All 16 original before/after screenshots were byte-identical; representative after screenshots are included here.
- No browser console errors. Git diff whitespace validation passed.
- Physical-device testing was not performed.

The JSON files contain baseline geometry, resulting geometry and hit tests, and interaction results. Evidence is outside the published v5 directory. No Barnsley content or global typography changed.
