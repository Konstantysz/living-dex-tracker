# Coding standards

The reviewer reads this file. It holds judgement rules that no tool can check. ESLint, Prettier,
`tsc`, the tests and `wiki:lint` check the rest.

## Names follow the glossary

- Name a domain concept with its `GLOSSARY.md` term, or with the identifier in its "Code" column.
- Do not use a word from the "Avoid" column for that concept.
- A new domain concept gets a glossary row, with its code identifier, in the same change.

## Tests prove the rule they name

- A test that pins a rule (an ADR consequence, a layout invariant, a filter) must fail when you
  remove the code that enforces the rule. An assertion that passes without that code proves
  nothing.
- Put the setup and the assertion in the same test. Example: to show that the text export ignores
  collectibles, tick a collectible first, in the same test.

## Data has a source

- Pokémon data comes from the config and the cached CSVs. See `docs/research/sources.md`.
- Every hand-written list in a game config has a comment with its source URL and a date.

## Styles stay local

- Style a component with its CSS module, or with a class on the component's root element.
- Keep plain element selectors in `src/styles.css` (e.g. `dialog a`) for base styles that every
  instance needs.

## Text

- UI strings are in Polish. In-game names (places, shrines, Pokémon) stay in English.
- Docs, comments and commit messages follow ASD-STE100: short sentences, active voice, no
  semicolons.
