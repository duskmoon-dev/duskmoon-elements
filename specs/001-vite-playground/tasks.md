# Tasks: Vite Playground Package

**Input**: Design documents from `/specs/001-vite-playground/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in specification - manual browser testing specified.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to repository root. Package location: `packages/playground/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create package directory structure at packages/playground/
- [x] T002 Create package.json with workspace dependencies in packages/playground/package.json
- [x] T003 [P] Create tsconfig.json for TypeScript compilation in packages/playground/tsconfig.json
- [x] T004 [P] Create vite.config.ts with MPA configuration in packages/playground/vite.config.ts
- [x] T005 [P] Create shared CSS styles in packages/playground/src/styles/playground.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create index.html landing page with navigation in packages/playground/src/pages/index.html
- [x] T007 Verify Vite dev server starts and serves index.html correctly

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Element Demo Page (Priority: P1) 🎯 MVP

**Goal**: Create dedicated demo pages for each custom element showing interactive examples

**Independent Test**: Open browser to any element demo page, verify element renders with multiple examples showing different properties

### Implementation for User Story 1

- [x] T008 [P] [US1] Create button.html demo page in packages/playground/src/pages/button.html
- [x] T009 [P] [US1] Create button.ts entry script in packages/playground/src/scripts/button.ts
- [x] T010 [P] [US1] Create card.html demo page in packages/playground/src/pages/card.html
- [x] T011 [P] [US1] Create card.ts entry script in packages/playground/src/scripts/card.ts
- [x] T012 [P] [US1] Create input.html demo page in packages/playground/src/pages/input.html
- [x] T013 [P] [US1] Create input.ts entry script in packages/playground/src/scripts/input.ts
- [x] T014 [P] [US1] Create markdown.html demo page in packages/playground/src/pages/markdown.html
- [x] T015 [P] [US1] Create markdown.ts entry script in packages/playground/src/scripts/markdown.ts
- [x] T016 [US1] Add button examples showing variants (primary, secondary, outline) and sizes to packages/playground/src/pages/button.html
- [x] T017 [US1] Add card examples showing header, content, and footer slots to packages/playground/src/pages/card.html
- [x] T018 [US1] Add input examples showing types, labels, and validation states to packages/playground/src/pages/input.html
- [x] T019 [US1] Add markdown examples showing various markdown content to packages/playground/src/pages/markdown.html

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Navigate Between Element Pages (Priority: P2)

**Goal**: Add consistent navigation to all pages allowing easy movement between demos

**Independent Test**: Navigate from any demo page to any other using the navigation menu

### Implementation for User Story 2

- [x] T020 [US2] Add navigation HTML structure to packages/playground/src/styles/playground.css
- [x] T021 [US2] Add navigation to index.html in packages/playground/src/pages/index.html
- [x] T022 [P] [US2] Add navigation to button.html in packages/playground/src/pages/button.html
- [x] T023 [P] [US2] Add navigation to card.html in packages/playground/src/pages/card.html
- [x] T024 [P] [US2] Add navigation to input.html in packages/playground/src/pages/input.html
- [x] T025 [P] [US2] Add navigation to markdown.html in packages/playground/src/pages/markdown.html
- [x] T026 [US2] Style active page indicator in navigation in packages/playground/src/styles/playground.css

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Start Development Server (Priority: P3)

**Goal**: Enable development workflow with hot reload for element development

**Independent Test**: Run dev command, verify server starts and HMR works for CSS/JS changes

### Implementation for User Story 3

- [x] T027 [US3] Add dev script to package.json in packages/playground/package.json
- [x] T028 [US3] Add build script to package.json in packages/playground/package.json
- [x] T029 [US3] Add preview script to package.json in packages/playground/package.json
- [x] T030 [US3] Update root package.json with playground filter commands in package.json
- [x] T031 [US3] Verify HMR works for playground file changes

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T032 [P] Create README.md for playground package in packages/playground/README.md
- [x] T033 [P] Add error handling for element registration failures in all demo pages
- [x] T034 Run quickstart.md validation to verify setup instructions work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Adds navigation to US1 pages but pages work without nav
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Dev server works once pages exist

### Within Each User Story

- HTML pages before entry scripts
- Basic page structure before examples
- Core implementation before polish

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004, T005)
- All demo page HTML files can be created in parallel (T008, T010, T012, T014)
- All entry scripts can be created in parallel (T009, T011, T013, T015)
- All navigation additions can be done in parallel (T022, T023, T024, T025)

---

## Parallel Example: User Story 1

```bash
# Launch all demo page HTML files together:
Task: "Create button.html demo page in packages/playground/src/pages/button.html"
Task: "Create card.html demo page in packages/playground/src/pages/card.html"
Task: "Create input.html demo page in packages/playground/src/pages/input.html"
Task: "Create markdown.html demo page in packages/playground/src/pages/markdown.html"

# Launch all entry scripts together:
Task: "Create button.ts entry script in packages/playground/src/scripts/button.ts"
Task: "Create card.ts entry script in packages/playground/src/scripts/card.ts"
Task: "Create input.ts entry script in packages/playground/src/scripts/input.ts"
Task: "Create markdown.ts entry script in packages/playground/src/scripts/markdown.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Open each demo page in browser, verify elements render
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (navigation added)
4. Add User Story 3 → Test independently → Deploy/Demo (dev workflow complete)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (demo pages)
   - Developer B: User Story 2 (navigation - waits for pages to exist)
   - Developer C: User Story 3 (dev scripts - can start in parallel)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
