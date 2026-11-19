# Orbit Recall — Product Requirements

> **Working name:** Orbit Recall  
> **Product descriptor:** A flexible flashcard study app for any subject or language.  
> **Working tagline:** **Knowledge in orbit. Back when you need it.**  
> Repository to evolve: `https://github.com/LunaUy/flashcard-app.git`

---

## 1. Product vision

Orbit Recall is a free, general-purpose flashcard web app for studying **any subject, in any language, with any combination of media**.

It must work equally well for:

- English, French, Korean, Mandarin, Portuguese, etc.
- Mathematics, physics, biology, history.
- University courses such as hardware, engineering or computer science.
- Definitions, terminology, translations, diagrams, formulas, code, images, audio, video and mixed study material.

The product must not assume that a flashcard is only a short text question with a short text answer.

A card is a reusable study concept with two studyable sides. Each side can contain several ordered content blocks, and the same concept can be reviewed independently in both directions.

---

## 2. Core product principles

1. **Subject-agnostic** — never design the data model around language learning only.
2. **Language-agnostic** — front and back may use different languages or scripts.
3. **Multimedia-first** — either side may contain several content blocks at once.
4. **Bidirectional learning** — A → B and B → A are separate learning directions with separate scheduling states.
5. **Offline-first** — studying and manual card creation must continue without an internet connection.
6. **Local-first guest mode** — a user can begin without an account.
7. **Sync when authenticated** — signed-in users keep their library across devices.
8. **Human review before AI save** — AI-generated cards are drafts until explicitly accepted.
9. **No paid/cloud AI dependency** — AI is optional and connects to a model running locally for the user.
10. **Portable data** — users can import and export their information without lock-in.
11. **Accessible and responsive** — desktop, tablet and mobile are first-class.
12. **Clean engineering** — DRY where useful, KISS, clear responsibilities, reusable components, tests and readable professional code.

---

## 3. Proposed technical architecture

The existing HTML/CSS/JavaScript repository may be refactored or replaced where necessary. Preserve useful behavior and content, but do not preserve an architecture that prevents the product from scaling.

### Preferred stack

#### Frontend
- React
- TypeScript with strict mode
- Responsive SPA/PWA
- Service worker for offline support
- IndexedDB for durable local guest/offline data
- Internationalization framework from the beginning
- CSS design tokens / variables for themes and accents

#### Backend
- **Ruby on Rails 8**
- PostgreSQL
- Active Storage for user assets
- Active Job + Solid Queue for imports, exports, sync-related jobs and other background processing
- JSON API consumed by the frontend
- Secure email/password authentication

A different frontend architecture may be chosen if strongly justified, but the backend should remain Ruby on Rails unless a concrete blocker is found.

### Repository organization

A monorepo is preferred so the frontend, Rails backend, documentation and shared product configuration remain together.

Example:

```text
/
├── frontend/
├── backend/
├── docs/
├── PRODUCT_REQUIREMENTS.md
└── README.md
```

Do not rewrite the current repository blindly. First audit its current implementation and migrate reusable behavior deliberately.

---

## 4. Account modes

### 4.1 Guest mode

Users may use the app without an account.

Guest mode must support:

- Creating folders.
- Creating decks.
- Creating/editing/deleting cards.
- Studying.
- Scheduling reviews locally.
- Local settings.
- Local import/export.
- Local AI integration, when the user's browser can connect to the configured local model endpoint.

Guest data is stored locally on the device.

### 4.2 Account creation

Authentication is:

- Email
- Password

No OAuth is required initially.

Users can:

- Create an account.
- Sign in.
- Sign out.
- Delete their account.
- Change password.
- Export their data before deletion.

### 4.3 Guest → account migration

When a guest creates or signs into an account while local data exists, show:

> **Move your local library to this account?**

The user can:

- Merge local data into the account.
- Keep account data only.
- Cancel and decide later.

Never silently discard guest data.

---

## 5. Sync and offline behavior

Signed-in users receive automatic sync across devices.

Expose a compact status:

- `Synced`
- `Syncing…`
- `Offline`
- `Conflict`

### Requirements

- Use stable UUIDs for syncable domain objects.
- Allow offline edits.
- Queue changes locally.
- Sync when connectivity returns.
- Avoid silently overwriting conflicting edits.
- Provide a conflict-resolution UI when automatic merging is unsafe.
- Do not sync local AI endpoint credentials or local model tokens.

The app should remain useful during connection loss.

---

## 6. Information hierarchy

The library supports unlimited nesting.

```text
Folder
└── Folder
    └── Folder
        └── Deck
            └── Cards
```

Example:

```text
Languages
└── English
    └── C2
        ├── Nouns
        ├── Adjectives
        └── Verbs
            └── Phrasal Verbs
                └── Phrasal Verbs with Take
```

Another example:

```text
Languages
└── Korean
    └── Greetings
        ├── Polite Greetings
        └── Informal Greetings
```

### Organization features

- Unlimited nested folders.
- Decks/stacks.
- Tags independent of folder hierarchy.
- Favorites.
- Archive.
- Trash with recovery.
- Global search.
- Filters.
- Sorting.
- Multi-select.
- Bulk move.
- Bulk delete.
- Bulk tag.
- Drag-and-drop organization where appropriate.

Full CRUD is required for folders, decks, cards, tags and reusable source groups.

---

## 7. Flashcard data model

A flashcard must not be stored merely as:

```json
{
  "question": "...",
  "answer": "..."
}
```

A card is a concept with two sides made of ordered blocks.

### 7.1 Card side blocks

Either side may contain any number and combination of:

- Plain text.
- Rich text / Markdown.
- Short question.
- Definition.
- Translation.
- Paragraph.
- Image.
- SVG.
- Audio.
- Video.
- Code block with syntax highlighting.
- Mathematical notation via LaTeX/KaTeX.
- Lists.
- Optional pronunciation/romanization information.
- Other reusable asset references supported by the app.

Example:

```text
FRONT
[image]
[text: こんにちは]
[audio]

BACK
[text: hello]
[text: konnichiwa]
[note: neutral/daytime greeting]
```

Block order is user-controlled.

### 7.2 Supported writing systems

Content must support arbitrary Unicode.

Prepare layout behavior for:

- Latin scripts.
- CJK scripts.
- Korean.
- Cyrillic.
- Greek.
- RTL languages such as Arabic and Hebrew.

UI language is independent of card language.

---

## 8. Card templates and study types

Required from the initial product:

### Basic
Front → Back.

### Reverse
Back → Front.

### Bidirectional
One underlying concept produces two independently scheduled study directions:

- Front → Back.
- Back → Front.

They share source content but **do not share review state**.

A user may remember:

```text
안녕 → informal greeting
```

while failing:

```text
informal greeting → 안녕
```

Those are different memory tasks and must have separate scheduling state, review history and next due date.

### Cloze deletion

Example:

```text
The capital of France is {{Paris}}.
```

Support one or multiple clozes.

### Image occlusion

Allow the user to hide one or more labeled/selected regions of an image and study them.

Useful for:

- Anatomy.
- Maps.
- Hardware diagrams.
- Circuits.
- Charts.
- Scientific figures.

### Typed-answer cards

Allow the learner to type an answer before revealing the correct answer.

Answer comparison may support configurable normalization such as:

- Case-insensitive comparison.
- Whitespace normalization.
- Optional punctuation tolerance.

For complex answers, allow self-grading after reveal instead of requiring exact string equality.

---

## 9. Reusable study sources

A user should not have to attach the same PDF, image, audio or video independently to every card.

Create a first-class concept called **Study Sources** (or Source Set).

Example:

```text
Study Sources: Hardware Lecture 03
├── lecture-03.pdf
├── motherboard-diagram.png
└── lecture-recording.mp4
```

Many cards can reference that same source set.

Individual cards can still add extra blocks or assets that apply only to that card.

Example:

```text
Card A
Shared sources:
- lecture-03.pdf
- motherboard-diagram.png

Card-specific:
- cropped image
- personal note

Card B
Shared sources:
- lecture-03.pdf
- motherboard-diagram.png

Card-specific:
- formula
```

### UX requirement

When manually creating cards from shared sources, support a split workspace:

```text
┌──────────────────────────┬──────────────────────────┐
│ Source preview           │ Flashcard editor         │
│ PDF / image / transcript │ Front / Back / Extras    │
│                          │                          │
└──────────────────────────┴──────────────────────────┘
```

The user should not need to continually leave the editor to inspect source material.

---

## 10. Card editor

Required capabilities:

- Add, remove and reorder blocks.
- Drag-and-drop assets.
- Paste images from clipboard.
- Swap front/back.
- Enable/disable reverse direction.
- Preview card.
- Duplicate card.
- Autosave drafts.
- Undo/redo.
- Keyboard shortcuts.
- Add tags.
- Move deck.
- Add shared Study Sources.
- Add card-specific supplementary blocks.
- Accessible keyboard navigation.

Avoid repetitive workflows.

---

## 11. Study engine

Use **FSRS** as the spaced-repetition algorithm.

Each study direction maintains its own scheduler state.

### Review controls

Use:

- Again
- Hard
- Good
- Easy

Optionally show the estimated next interval.

### Study sources

Users can start a study session from:

- All due cards.
- A single deck.
- A folder.
- Multiple folders.
- Multiple decks.
- Selected cards.
- Tags.
- Favorites.
- Failed cards.
- New cards.
- Custom selection.

### Custom sessions

Allow:

- Maximum card count.
- Maximum duration.
- Shuffle on/off.
- Direction selection.
- New/review card mix.
- Custom temporary review session without destroying the normal FSRS schedule.

---

## 12. Quiz / test mode

Quiz mode is distinct from normal FSRS study.

Allow the learner to generate a test from a selected scope:

- Folder.
- Deck.
- Multiple folders/decks.
- Tags.
- Selected cards.

Question modes may include:

- Typed answer.
- Multiple choice where appropriate.
- Reveal + self-grade.
- Reverse direction.
- Random direction.
- Cloze.
- Image occlusion.

Track quiz score independently from FSRS scheduling unless the user explicitly chooses to apply quiz results to study history.

---

## 13. Study statistics

Statistics belong in a dedicated application section, not permanently on the home screen.

### Mobile navigation example

```text
Library | Study | + | Stats | Profile
```

The `+` action can open:

- New card.
- New deck.
- New folder.
- Import.
- Generate with local AI.

### Core statistics

- Total distinct days studied.
- Reviews today.
- Total reviews.
- Time studied.
- Accuracy / recall.
- Cards learned.
- Cards due.
- New cards.
- Review history.
- Difficulty distribution.
- Per-deck stats.
- Per-folder stats.
- Per-tag stats.

### No streaks

Do **not** show a consecutive-day streak.

Use:

> **Days studied: 284**

The count is the total number of unique legitimate calendar days on which the user studied.

---

## 14. Trusted practice-day logic

The practice-day counter should resist trivial device-clock manipulation without requiring an expensive anti-cheat system.

### Server truth

The server stores:

- Trusted UTC timestamps.
- User timezone.
- Last trusted online date.

The UI converts timestamps into the user's timezone for display.

### Online study

For online reviews:

- Server timestamp is authoritative.
- The corresponding local calendar day is derived from the user's timezone.
- That distinct date may be counted once.

### Offline study

The client may store an offline timestamp and timezone.

On sync:

1. Determine today's date from trusted server time converted to the relevant user timezone.
2. Read the user's `last_trusted_online_date`.
3. Accept an offline practice date only when:

```text
last_trusted_online_date <= claimed_practice_date <= trusted_today
```

4. Reject impossible future dates.
5. Do not allow an offline sync to retroactively create practice dates before the last trusted online date.
6. Update the trusted online boundary when the device connects and syncs successfully.
7. Store unique practice dates idempotently so repeated reviews on one day count as one study day.

This intentionally minimizes easy clock cheating without implementing a complex fraud-detection system.

---

## 15. Local AI integration only

Orbit Recall must not require the project owner to pay for AI usage.

There is no mandatory hosted/cloud AI integration.

### Settings

Create a section:

```text
Settings
└── Local AI
```

The user can configure a local model service.

Prefer a provider-adapter architecture centered on an **OpenAI-compatible local endpoint**, with room for adapters for common local inference tools.

Configuration may include:

- Base URL / endpoint.
- Model name.
- Optional local token.
- Capabilities.
- Test connection button.
- Connection status.

Do not sync local endpoint secrets/tokens to the server.

### Important network architecture

A cloud Rails server cannot access the user's `localhost`.

Therefore local AI requests should occur from the user environment toward the locally configured endpoint, not from the remote Rails backend.

The implementation must handle:

- CORS/local endpoint restrictions.
- Connection failures.
- Unsupported model capabilities.
- Clear setup guidance.
- No silent cloud fallback.

### Capability detection

A local model may support:

- Text only.
- Text + images.
- Audio.
- Multimodal content.

Detect or let the user declare capabilities.

If a requested operation is unsupported, explain that clearly instead of silently sending data elsewhere.

---

## 16. AI-assisted flashcard generation

The user may import one or multiple sources for AI-assisted generation.

Supported source formats include:

- `.md`
- `.pdf`
- `.png`
- `.jpeg`
- `.jpg`
- `.webp`
- `.svg`
- `.csv`
- `.json`
- `.txt`
- `.doc`
- `.docx`
- `.mp3`
- `.mp4`
- `.webm`

Normalize source content appropriately before generation.

Examples:

- TXT/Markdown → text extraction.
- PDF → text and relevant images.
- DOC/DOCX → structured text extraction/conversion.
- CSV/JSON → preserve structure.
- Image/SVG → visual/text processing.
- MP3 → transcription when the local model/toolchain supports it.
- MP4/WebM → audio transcription and/or visual processing when supported.

### Mandatory generation flow

```text
Upload sources
→ Preview sources
→ Configure generation
→ Generate draft cards
→ Review draft
→ Select/edit/remove/regenerate/add
→ Save selected cards
```

AI-generated cards **must never enter the user's permanent library automatically**.

### Draft review interface

For every generated card:

- Preview front.
- Preview back.
- Edit.
- Remove.
- Regenerate individually.
- Add supplementary blocks.
- Select/deselect.

Bulk actions:

- Select all.
- Deselect all.
- Remove selection.
- Save selection.
- Regenerate selection where supported.
- Add new manual card.
- Request more cards.
- Request fewer cards / regenerate with different density.

Allow the user to state the target topic so irrelevant information from a source is less likely to become a card.

If irrelevant cards are still generated, the user must be able to simply leave them unselected.

---

## 17. Import

Import is required, not a future feature.

Supported library/data import:

- CSV.
- TSV.
- JSON.
- TXT.
- Markdown.
- Orbit Recall ZIP export.
- **Anki `.apkg`**.

The Anki importer should preserve as much meaningful information as feasible:

- Deck structure.
- Note/card content.
- Media.
- Basic scheduling metadata where it can be mapped safely.

When exact scheduling semantics cannot be preserved, tell the user and migrate content without pretending the schedules are identical.

Provide an import preview before applying destructive or large changes.

---

## 18. Export and data portability

Allow export of:

- Entire account/library.
- Folder.
- Deck.
- Multiple folders/decks.
- Selected cards.
- Assets.

Formats:

- TXT.
- CSV.
- JSON.
- PDF.
- ZIP archive.

ZIP should preserve structured information and referenced assets.

Example:

```text
orbit-recall-export/
├── manifest.json
├── library.json
├── decks/
├── cards/
└── assets/
    ├── images/
    ├── audio/
    └── video/
```

Export must not require a paid account or external service.

---

## 19. Optional read-only sharing

This is secondary to core CRUD/sync/import/export.

If implementation remains reasonably simple, support:

```text
Owner
→ Create read-only share link
→ Recipient opens deck/selection preview
→ Recipient chooses "Import to my library"
```

Initial sharing should **not** require:

- Real-time collaboration.
- Comments.
- Complex permissions.
- Joint editing.

If implementing sharing would materially delay core product functionality, leave the data model extensible and defer the UI.

---

## 20. UI internationalization

UI language is independent from study content language.

Initial UI languages:

- English.
- Spanish.

Use i18n from the beginning so more languages can be added without rewriting components.

Requirements:

- No user-facing copy hardcoded throughout components.
- Locale-aware dates and numbers.
- RTL-ready layout foundations.
- Language preference stored for guests locally and synced for accounts.
- Fallback language behavior.

A user may have:

```text
UI: Spanish
Front: Korean
Back: French
Supplementary note: English
```

---

## 21. Visual direction

Combine:

1. **Editorial vintage layout**
2. **Subtle lunar identity**

The app should feel academic, calm, professional and distinctive, not childish and not like a generic space-themed app.

### Visual characteristics

- Strong editorial hierarchy.
- Generous spacing.
- Refined serif typography for headings and key content.
- Highly legible body/UI text.
- Warm paper-like light surfaces.
- Deep neutral dark surfaces.
- Fine borders.
- Restrained shadows.
- Subtle lunar/orbital motifs.
- Circular/orbital progress visuals where appropriate.
- Avoid excessive stars, galaxies or novelty space graphics.

A lunar mark may use abstract phase/orbit ideas:

```text
○  ◔  ◑  ◕  ●
```

without turning the product into a literal astronomy theme.

### Typography

Prefer elegant but highly readable typography.

Georgia is an acceptable reference point. A similarly readable serif may be used for headings/content, with a clean sans-serif for controls and dense UI if that improves usability.

Times New Roman is considered near the lower acceptable readability/stylistic boundary and should not be the primary design choice.

---

## 22. Light/dark themes and accent system

Theme choices:

- Light.
- Dark.
- System.

Accent choices:

- Cream.
- Lilac.
- Sky blue.
- Rose.
- Orange.
- Aqua.
- Apple green.
- Red.
- Terracotta / brown-bordeaux.

All accents should be pastel/muted rather than neon.

Only **one accent** is active at a time.

The selected accent must work in both light and dark themes.

Implement with centralized design tokens, not duplicated stylesheets.

Example:

```css
--accent;
--accent-hover;
--accent-soft;
--accent-border;
--accent-contrast;
```

Each accent palette supplies appropriate light/dark values.

User theme/accent preference is stored locally for guests and synced for accounts.

---

## 23. Navigation

### Desktop

Use a clean editorial layout suitable for a large library and nested organization.

Navigation should make these areas obvious:

- Library.
- Study.
- Create/Import.
- Stats.
- Profile/Settings.

### Mobile

Use a bottom navigation bar similar to:

```text
Library | Study | + | Stats | Profile
```

Use the center `+` as a creation/action launcher.

Avoid cramming the desktop navigation into a tiny mobile header.

---

## 24. Sound and motion

Provide optional, subtle sound effects for:

- Card flip/reveal.
- Correct answer.
- Incorrect answer.
- Selected study interactions where useful.

Requirements:

- Bundle or self-host app sound assets so core sounds work offline.
- Global mute / sound toggle.
- Respect device/browser autoplay restrictions.
- Sounds must never be required to understand state.

Motion:

- Smooth card flips.
- Subtle transitions.
- Respect `prefers-reduced-motion`.
- Avoid animations that slow down rapid studying.

---

## 25. Accessibility

Target WCAG-conscious implementation.

Required:

- Semantic HTML.
- Visible keyboard focus.
- Full keyboard navigation for core study flows.
- ARIA only where semantic HTML is insufficient.
- Screen-reader labels.
- Sufficient contrast in every accent/theme combination.
- Reduced-motion support.
- Do not encode meaning by color alone.
- Responsive type sizing.
- Comfortable touch targets.
- Accessible forms and error messages.

---

## 26. Search

Global search should be able to find:

- Folder names.
- Deck names.
- Card text.
- Tags.
- Source names.
- Relevant metadata.

Filters may include:

- Due.
- New.
- Learned.
- Difficult.
- Favorite.
- Archived.
- Tag.
- Folder/deck.
- Content type.

---

## 27. Security and privacy

Required:

- Passwords securely hashed.
- Secure session/token handling.
- CSRF/CORS configured correctly for chosen architecture.
- Authorization enforced server-side.
- User data isolated by account.
- File type validation.
- File size limits.
- Safe file serving.
- Sanitize user-controlled rich content.
- Prevent XSS from Markdown/HTML-like input.
- Protect destructive operations with confirmation.
- Account deletion removes/schedules removal of user cloud data and assets.
- No local AI credentials in logs, analytics or synced preferences.
- No secret keys committed to Git.

---

## 28. CRUD behavior

Full CRUD for:

- User-owned folders.
- Decks.
- Cards.
- Tags.
- Study Sources.
- User preferences where applicable.

Deletion behavior:

- Soft-delete/recycle bin where practical.
- Restore from Trash.
- Permanent delete requires explicit confirmation.
- Bulk delete supported.

---

## 29. Engineering quality requirements

The codebase should be professional and understandable by another developer.

### Principles

- DRY where it actually improves maintainability.
- Do not over-abstract merely to remove tiny duplication.
- KISS.
- Separation of concerns.
- Single-responsibility modules/classes/components.
- Reusable components.
- Reusable domain services.
- Idiomatic Ruby/Rails.
- Strict TypeScript.
- Semantic naming.
- Small focused functions.
- No duplicated business rules.
- No magic constants.
- Centralized configuration.
- Schema/input validation at boundaries.
- Consistent error handling.
- Database constraints in addition to application validation.
- Accessible semantic HTML.
- Document **why**, not obvious **what**.

### Quality tooling

Set up:

- Ruby formatter/linter.
- TypeScript/JavaScript formatter/linter.
- Automated backend tests.
- Automated frontend/component tests.
- Core end-to-end tests.
- CI checks where practical.

Prioritize tests for:

- Authentication.
- Authorization.
- Sync-critical behavior.
- FSRS review state.
- Bidirectional scheduling.
- Practice-day validation.
- Import/export.
- Destructive CRUD.
- Guest → account migration.

---

## 30. Suggested domain model

This is guidance, not a requirement to use these exact table names.

```text
User
UserPreference
Folder
Deck
Card
CardSide
CardBlock
StudyDirection
ReviewState
ReviewEvent
Tag
CardTag
StudySourceSet
StudySourceAsset
CardSourceReference
PracticeDay
ImportJob
ExportJob
ShareLink (optional)
```

### Important distinction

`Card` represents the underlying concept/content.

`StudyDirection` represents a schedulable memory task.

For a bidirectional card:

```text
Card
├── Front
├── Back
├── StudyDirection: front_to_back
└── StudyDirection: back_to_front
```

This avoids duplicating all card content while keeping learning histories independent.

---

## 31. Home / library experience

The home experience should prioritize useful action rather than vanity stats.

Possible hierarchy:

1. Greeting/context.
2. Cards due today.
3. Continue studying.
4. Recent decks/folders.
5. Library navigation.
6. Creation/import shortcut.

Detailed statistics belong in Stats.

---

## 32. Product naming and discoverability

Working brand:

# Orbit Recall

Working tagline:

> **Knowledge in orbit. Back when you need it.**

Because the name does not immediately say “flashcards,” pair it with descriptive metadata and onboarding copy.

Examples:

- **Orbit Recall — Flashcard Study App**
- “Flexible flashcards for any subject or language.”
- App/website metadata should contain terms such as `flashcards`, `spaced repetition`, `study`, and `learning`.

The final brand name can still change before release without affecting the product model.

---

## 33. Current repository migration

Current repository:

`https://github.com/LunaUy/flashcard-app.git`

The existing repository currently contains the earlier vanilla implementation, including HTML pages, JavaScript, CSS, flashcard JSON data and component/template-loader work.

Migration requirements:

1. Inspect the repository first.
2. Identify reusable UX, content and behavior.
3. Preserve Git history.
4. Do not keep obsolete architecture merely for compatibility.
5. Replace prototype-only code with production-quality domain logic.
6. Keep the application runnable during migration when practical.
7. Update README with the new stack and setup steps.
8. Add environment examples without secrets.
9. Add database setup/migration instructions.
10. Document local AI connector setup.

---

## 34. Definition of done for the first complete version

The product is not considered complete merely because screens exist.

The first complete version should allow a user to:

1. Open the app as a guest.
2. Create nested folders.
3. Create decks.
4. Create multimedia/multi-block cards.
5. Create reverse/bidirectional cards.
6. Create cloze cards.
7. Create image-occlusion cards.
8. Attach shared Study Sources.
9. Study with FSRS.
10. Run a custom study session.
11. Use Quiz mode.
12. See dedicated Stats.
13. Use total distinct study days instead of streaks.
14. Switch Light/Dark/System theme.
15. Choose a pastel accent.
16. Switch UI between English and Spanish.
17. Work offline for core manual study flows.
18. Create an account with email/password.
19. Merge guest data into the account.
20. Sync across devices.
21. Import supported formats, including Anki `.apkg`.
22. Export selected or complete data in supported formats.
23. Configure and test a local AI connection.
24. Generate draft cards from supported sources with local AI.
25. Review/select/edit/remove AI drafts before save.
26. Delete account/data.
27. Use the app effectively on mobile and desktop.
28. Navigate core functions with keyboard and assistive technology.

---

## 35. Non-goals for the initial implementation

Unless they become trivial while implementing core architecture:

- Paid subscriptions.
- Hosted AI credits.
- Mandatory cloud AI.
- Social feed.
- Competitive leaderboards.
- Consecutive-day streak pressure.
- Real-time collaborative deck editing.
- Comments/chat.
- Complex public marketplace.
- Gamification that distracts from study.

Simple read-only share links with “Import to my library” may be included if they do not delay core functionality.
