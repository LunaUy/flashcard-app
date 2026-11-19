# OpenDesign implementation prompt — Orbit Recall

You are modifying an existing repository:

`https://github.com/LunaUy/flashcard-app.git`

The product specification is in `PRODUCT_REQUIREMENTS.md`. Treat that document as the source of truth.

## Objective

Transform the current prototype into **Orbit Recall**, a production-quality, free, offline-capable flashcard study web app for any subject and any language.

Working tagline:

> **Knowledge in orbit. Back when you need it.**

This is not a cosmetic redesign. It is a product and architecture migration. The existing repository is a simple vanilla HTML/CSS/JavaScript prototype. You may replace its architecture where necessary.

## First action: audit before changing

Before writing new implementation code:

1. Read the entire current repository.
2. Identify current navigation, flashcard behavior, styling, JSON data, quiz work, component/template-loader work and any reusable UX/content.
3. Read `PRODUCT_REQUIREMENTS.md` completely.
4. Produce a concise migration plan.
5. Preserve Git history.
6. Do not delete useful behavior simply because the architecture changes.

OpenDesign supports importing an existing codebase; use the repository as the starting point rather than generating an unrelated greenfield mockup.

## Required architecture

Use:

- **Ruby on Rails 8** backend.
- PostgreSQL.
- Active Storage for user assets.
- Active Job + Solid Queue for appropriate background work.
- React + TypeScript frontend unless you identify and document a materially better frontend architecture.
- Strict TypeScript.
- PWA/offline-first behavior.
- IndexedDB or an equivalent durable browser-side database for guest/offline data.
- i18n from the start.
- Design tokens/CSS variables for theme and accent state.

A monorepo is preferred.

The end result must be a **functional application**, not a Figma-like mockup and not a set of disconnected static screens.

## Product model

Implement nested:

`Folders → subfolders → decks → cards`

plus:

- Tags.
- Favorites.
- Archive.
- Trash.
- Search.
- Multi-select.
- Bulk operations.

A card must support multiple ordered blocks on both front and back.

Block types must include at least:

- Text/rich text.
- Markdown.
- Image.
- SVG.
- Audio.
- Video.
- Code.
- LaTeX/KaTeX.
- Lists.
- Asset/source references.

Support arbitrary Unicode, multilingual front/back combinations and RTL-ready layout foundations.

## Card types

Implement initially:

- Basic.
- Reverse.
- Bidirectional.
- Cloze deletion.
- Image occlusion.
- Typed answer.

For bidirectional cards, **front→back and back→front are independent StudyDirections**. They share card content but have separate FSRS/review state, review history and due dates.

Do not model bidirectional learning by duplicating the entire card.

## Shared Study Sources

Implement reusable **Study Sources / Source Sets**.

A source set may contain files such as a PDF, image, audio or video and may be referenced by many cards.

A card may also contain card-specific supplementary blocks/assets.

Provide a split source-preview/card-editor workflow so the learner can inspect source material while creating multiple cards without repeatedly uploading or switching pages.

## Study engine

Use **FSRS**.

Study actions:

- Again.
- Hard.
- Good.
- Easy.

Support sessions from:

- Due cards.
- Folder.
- Multiple folders.
- Deck.
- Multiple decks.
- Tags.
- Favorites.
- Selected cards.
- Failed cards.
- New cards.
- Custom combinations.

Custom session controls:

- Card limit.
- Time limit.
- Shuffle.
- Direction.
- New/review mix.
- Temporary custom review without corrupting normal FSRS state.

## Quiz mode

Keep Quiz/Test mode distinct from ordinary FSRS study.

Support:

- Typed answers.
- Multiple choice where appropriate.
- Reveal + self-grade.
- Random/reverse direction.
- Cloze.
- Image occlusion.
- Score.

Do not modify FSRS scheduling from quiz results unless the user explicitly enables that behavior.

## Guest mode and authentication

Guest mode must work locally without an account.

Authentication is:

- Email.
- Password.

No OAuth is required.

A guest can later create/sign into an account and receive:

> Move your local library to this account?

Support safe local→account merge.

Signed-in users get automatic sync across devices with visible states:

- Synced.
- Syncing.
- Offline.
- Conflict.

Never silently discard conflicting user data.

## Practice-day counter

Do **not** implement streaks.

Implement:

> Days studied: N

where N is the total number of unique accepted study days.

Online events use trusted server timestamps.

For offline events synced later, accept a claimed study date only when:

`last_trusted_online_date <= claimed_practice_date <= trusted_today`

using trusted server time and the relevant user timezone.

Do not allow synced offline activity to create future practice days or practice days before the last trusted online date.

Store unique practice days idempotently.

## Statistics

Stats is a dedicated section.

Mobile bottom navigation should follow approximately:

`Library | Study | + | Stats | Profile`

The center `+` opens creation/import actions.

Stats should include:

- Days studied.
- Reviews.
- Time studied.
- Accuracy/recall.
- Cards learned.
- Due/new cards.
- History.
- Difficulty.
- Per deck/folder/tag views.

Do not clutter Home with the complete statistics dashboard.

## Local AI only

The app must remain free and must not depend on a paid hosted AI API.

Implement **Settings → Local AI**.

Use an adapter architecture for a locally running model endpoint, preferably supporting an OpenAI-compatible local API.

Settings should allow:

- Endpoint/base URL.
- Model.
- Optional local token.
- Capability information.
- Test connection.

Important:

- A remote Rails server cannot reach the user's localhost.
- Local AI requests must originate from the user environment toward the local inference endpoint.
- Never silently fall back to a paid/cloud AI provider.
- Do not sync local endpoint secrets or tokens.
- Handle CORS/local endpoint limitations clearly.
- Detect/represent model capabilities such as text, vision and audio where feasible.

## AI draft generation

Supported inputs:

`.md`, `.pdf`, `.png`, `.jpeg`, `.jpg`, `.webp`, `.svg`, `.csv`, `.json`, `.txt`, `.doc`, `.docx`, `.mp3`, `.mp4`, `.webm`

Create an appropriate normalization/extraction layer instead of pretending every file is the same.

Mandatory flow:

`upload → preview → configure → generate draft → human review → save selected`

AI-generated cards must **never be saved directly** to the permanent library.

Draft review must include:

- Edit.
- Remove.
- Select/deselect.
- Regenerate individual card.
- Select all.
- Deselect all.
- Remove selection.
- Save selection.
- Add manual card.
- Add supplementary blocks.
- Request more cards / regenerate.

The user can specify the topic/focus before generation.

## Import

Import is required now, including:

- CSV.
- TSV.
- JSON.
- TXT.
- Markdown.
- Orbit Recall ZIP.
- **Anki `.apkg`**.

Provide preview and clear mapping behavior.

Preserve deck structure/media where feasible.

Do not falsely claim incompatible Anki scheduler state maps exactly to FSRS when it does not.

## Export

Support exporting:

- Entire account/library.
- Folder.
- Deck.
- Multiple selections.
- Selected cards.
- Assets.

Formats:

- TXT.
- CSV.
- JSON.
- PDF.
- ZIP with structured metadata and assets.

## Optional sharing

If it does not materially delay core work, support simple read-only sharing:

`share link → preview → Import to my library`

Do not build real-time collaboration, comments or complicated permission systems in this phase.

## Internationalization

Initial UI locales:

- English.
- Spanish.

Requirements:

- i18n architecture from day one.
- No scattered hardcoded UI copy.
- Locale-aware dates/numbers.
- RTL-ready foundation.
- User UI language is independent from flashcard languages.

## Visual design

Combine:

### Editorial vintage layout
with
### subtle lunar identity

The interface should feel:

- Academic.
- Calm.
- Professional.
- Elegant.
- Distinctive.
- Highly readable.

Do **not** make it a childish space theme.

Use:

- Editorial hierarchy.
- Generous whitespace.
- Warm paper-like light surfaces.
- Deep neutral dark surfaces.
- Fine borders.
- Restrained shadows.
- Elegant readable serif typography.
- Clean sans-serif UI typography where useful.
- Subtle orbital/circular motifs.
- Abstract lunar forms where appropriate.

Georgia is an acceptable visual reference for serif readability; do not default to Times New Roman.

### Theme

Support:

- Light.
- Dark.
- System.

### Pastel accent choices

- Cream.
- Lilac.
- Sky blue.
- Rose.
- Orange.
- Aqua.
- Apple green.
- Red.
- Terracotta / brown-bordeaux.

Only one accent is selected at a time and it must map correctly to both light and dark modes.

Use centralized design tokens such as:

- `--accent`
- `--accent-hover`
- `--accent-soft`
- `--accent-border`
- `--accent-contrast`

Do not create separate duplicated stylesheets per accent/theme.

## Mobile experience

Mobile is first-class.

Use a bottom navigation pattern approximately:

`Library | Study | + | Stats | Profile`

The `+` action can launch:

- New card.
- New deck.
- New folder.
- Import.
- Generate with local AI.

Use touch-friendly controls and do not simply compress desktop navigation into a hamburger-only experience.

## Accessibility

Implement:

- Semantic HTML.
- Visible keyboard focus.
- Keyboard-operable core flows.
- Screen-reader labels.
- Accessible forms/errors.
- Good contrast in every theme/accent combination.
- `prefers-reduced-motion`.
- Meaning not conveyed by color alone.
- Large enough touch targets.

## Sound and motion

Provide optional subtle local/bundled sounds for:

- Card flip/reveal.
- Correct.
- Incorrect.

Include a global mute/sound preference.

Respect autoplay restrictions and reduced-motion preferences.

Animations must not slow down rapid study.

## Code quality

This is a strict requirement.

Apply:

- DRY where it improves maintainability.
- KISS.
- Single responsibility.
- Separation of concerns.
- Reusable components.
- Reusable domain services.
- Idiomatic Ruby/Rails.
- Strict TypeScript.
- Clear semantic naming.
- Small focused functions.
- Centralized configuration.
- No magic constants.
- No duplicated business rules.
- Validation at system boundaries.
- Database constraints in addition to model validation.
- Consistent errors.
- Accessible semantic HTML.

Do **not** over-abstract just to satisfy DRY.

Comment/document **why**, not obvious **what**.

Set up linting/formatting/tests and cover critical behavior, especially:

- Authentication/authorization.
- Guest→account migration.
- Sync.
- FSRS.
- Independent bidirectional scheduling.
- Practice-day validation.
- CRUD/destructive actions.
- Import/export.
- AI draft-save boundaries.

## Security

Implement appropriate protections for:

- Password hashing.
- Authorization.
- CSRF/CORS.
- File validation and size limits.
- Rich-text/Markdown sanitization.
- XSS prevention.
- User data isolation.
- Secure asset access.
- Account deletion.
- Secret handling.

Never commit secrets.

## Migration approach

Work incrementally.

1. Audit existing code.
2. Establish new architecture and automated checks.
3. Migrate/recreate existing prototype behavior.
4. Build the domain model.
5. Build local/guest data layer.
6. Build authentication.
7. Build folders/decks/cards/sources CRUD.
8. Build sync.
9. Build study engine.
10. Build quiz/stats.
11. Build import/export.
12. Build local AI connector and AI draft flow.
13. Finish responsive/accessibility work.
14. Harden tests/security.
15. Update README and developer setup.

Prefer a runnable app at meaningful milestones rather than one huge untestable rewrite.

## Deliverables

Produce:

1. Working implementation.
2. Database schema/migrations.
3. Seed/demo data.
4. Automated tests.
5. Updated README.
6. `.env.example` without secrets where needed.
7. Local development instructions.
8. Local AI connection instructions.
9. Architecture notes explaining important decisions.
10. Migration notes from the old prototype.
11. A clear list of anything from `PRODUCT_REQUIREMENTS.md` that remains incomplete, rather than silently omitting it.

Before considering the task complete, compare the implementation against every requirement in `PRODUCT_REQUIREMENTS.md`.
