# Turkish Morphological Analyzer (HFST) — Evidence Report

**Audited:** 2026-07-31

## Sources reviewed

- Local workspace: `C:\Develop\Projects\turkish-morphology-fst`
- Repository remote: `https://github.com/TurkishKEBAB/turkish-morphology-fst`
- `README.md`
- `fst/lexicon/README.md`, `fst/rules/README.md`
- `docs/diagrams/*.md` and the accompanying PNG diagrams

## Observed architecture

- The documentation describes a finite-state pipeline across lexicon,
  morphotactics, phonology, derivation, and a compiled analyzer target.
- Lexicon examples cover roots and inflection transitions; rule examples cover
  vowel harmony and consonant changes.
- The diagram set documents noun/verb inflection, derivation, phonology, pipeline
  composition, and a request/analysis sequence.
- The audited workspace contains documentation and marker README files in the FST
  folders, but no compiled HFST artifact or executable analyzer test suite.

## Decision boundary

This is published as a research/specification record, not as a shipped runtime.
Coverage, latency, analyzer accuracy, and compiled-artifact claims remain out of
scope until the implementation and reproducible build are present. The existing
repository diagrams are not copied into the portfolio gallery without an approved
visual publication decision.
