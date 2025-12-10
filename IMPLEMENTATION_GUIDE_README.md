# Implementation Guide for Adding New Interactive Elements

> Documentation for LLM agents implementing new interactive types in ScienceInfuse

---

## 📚 Documentation Files

This guide consists of two documents:

### 1. **LLM_AGENT_IMPLEMENTATION_GUIDE.md** ⭐ START HERE
**Purpose:** Step-by-step instructions for implementing new types

**Contains:**
- Quick answers to the 3 core questions (document selection, AI generation, H5P export)
- File-by-file copy/modify instructions
- Critical patterns to preserve
- Best practices and common mistakes
- Implementation checklist

**Use this when:** You need to implement a new interactive type

### 2. **INTERACTIVE_ELEMENT_ARCHITECTURE.md**
**Purpose:** Visual reference for understanding system architecture

**Contains:**
- Mermaid diagrams (system overview, data flow, component hierarchy)
- API contracts and request/response formats
- Database schema
- Security and performance notes
- Testing strategies

**Use this when:** You need to understand how components interact

---

## 🚀 Quick Start for Agents

### When user asks: "Add a new interactive type called X"

**Step 1:** Ask clarifying questions:
```
- What is the name of the interactive type?
- What H5P library should be used?
- What fields should each item have?
```

**Step 2:** Follow the instructions in [`LLM_AGENT_IMPLEMENTATION_GUIDE.md`](LLM_AGENT_IMPLEMENTATION_GUIDE.md)

**Step 3:** Create 7 files by copying from dialogcards reference:
1. AI generation route
2. H5P export function
3. Modify H5P route handler
4. Update API client
5. Page component
6. Generator component
7. Editor component

**Step 4:** Validate and report completion

---

## 📖 The Three Core Questions

Every implementation answers these:

### 1. How does the user pick a reference document?

**Answer:** Using the existing `DocumentSearchPicker` component

**What to do:** Integrate it in your Generator component (already implemented, just reuse)

---

### 2. What API route(s) generate the AI data?

**Answer:** Create `POST /api/ai/{type}/route.ts`

**What to copy:** [`webapp/src/app/api/ai/dialogcards/route.ts`](webapp/src/app/api/ai/dialogcards/route.ts)

**What to change:** 
- Prompt text
- JSON structure
- Output field name

---

### 3. How does the H5P get generated?

**Answer:** Two-step process:

**Step A:** Create `create{Type}.ts` transformation function

**What to copy:** [`webapp/src/app/api/export/h5p/creation-requests/createDialogcards.ts`](webapp/src/app/api/export/h5p/creation-requests/createDialogcards.ts)

**What to change:**
- Data interface
- H5P library name
- H5P params structure

**Step B:** Update [`webapp/src/app/api/export/h5p/route.ts`](webapp/src/app/api/export/h5p/route.ts)

**What to add:**
- Import statement
- Type guard function
- Handler in POST method

---

## 🗺️ Implementation Pattern

```
Copy dialogcards files → Modify data structure → Keep all patterns
```

**Files to create:** 7 total
- 4 backend files (AI route, H5P function, route handler update, API client update)
- 3 frontend files (page, generator, editor)

**Time estimate:** 1-2 hours for an agent

---

## ✅ Critical Rules

### Always COPY from dialogcards:
- Error handling patterns
- State management (useState, useCallback, useEffect)
- Prisma queries
- Modal patterns
- H5P integration
- Component structure

### Only MODIFY:
- Data structure (your fields)
- LLM prompt (your generation logic)
- H5P library name and params
- UI input fields
- Text strings (titles, labels)

### Never CHANGE:
- DocumentSearchPicker integration
- JSON extraction regex
- H5PRenderer integration
- Save/download flow
- Database query patterns
- Portal patterns

---

## 📁 Reference Files (Copy These)

All files are in the dialogcards implementation:

| Component | File to Copy |
|-----------|-------------|
| AI Generation | [`webapp/src/app/api/ai/dialogcards/route.ts`](webapp/src/app/api/ai/dialogcards/route.ts) |
| H5P Transform | [`webapp/src/app/api/export/h5p/creation-requests/createDialogcards.ts`](webapp/src/app/api/export/h5p/creation-requests/createDialogcards.ts) |
| Page | [`webapp/src/app/(main)/intelligence-artificielle/dialogcards/page.tsx`](webapp/src/app/(main)/intelligence-artificielle/dialogcards/page.tsx) |
| Generator | [`webapp/src/app/(main)/intelligence-artificielle/dialogcards/DialogcardGenerator.tsx`](webapp/src/app/(main)/intelligence-artificielle/dialogcards/DialogcardGenerator.tsx) |
| Editor | [`webapp/src/app/(main)/intelligence-artificielle/dialogcards/DialogcardEditor.tsx`](webapp/src/app/(main)/intelligence-artificielle/dialogcards/DialogcardEditor.tsx) |

Files to modify (don't copy):
- [`webapp/src/app/api/export/h5p/route.ts`](webapp/src/app/api/export/h5p/route.ts) - Add type handler
- [`webapp/src/lib/api-client.ts`](webapp/src/lib/api-client.ts) - Add methods

---

## 🎯 Success Criteria

Your implementation is complete when:

✅ AI generation route returns structured JSON  
✅ H5P export function uses correct library  
✅ Type guard and handler added to route.ts  
✅ API client has generation method  
✅ Page component renders without errors  
✅ Generator shows document picker  
✅ Editor can add/edit/delete items  
✅ H5P preview displays correctly  
✅ Download buttons work  
✅ No TypeScript errors  

---

## 📊 Architecture Reference

For understanding system flow and component interaction, see:
- **[INTERACTIVE_ELEMENT_ARCHITECTURE.md](INTERACTIVE_ELEMENT_ARCHITECTURE.md)**
  - System architecture diagram
  - Data flow sequence
  - Component hierarchy
  - API contracts

---

## 🔧 Troubleshooting

**Problem:** Not sure what to change  
**Solution:** Read the specific file section in LLM_AGENT_IMPLEMENTATION_GUIDE.md

**Problem:** TypeScript errors  
**Solution:** Check you updated all type references (item names, field names)

**Problem:** Preview not working  
**Solution:** Verify H5P library name is correct and type string matches

**Problem:** Save fails  
**Solution:** Check type guard function and handler are added to route.ts

---

## 📝 Example Implementation

**User request:** "Add flashcards interactive"

**Your response:**
1. Ask: "What fields should each flashcard have? (e.g., front/back, question/answer)"
2. User: "front and back"
3. Implement:
   - Copy AI route, change prompt to generate `{front, back}` objects
   - Copy H5P function, use `H5P.Flashcards` library
   - Update route handler with flashcards type
   - Add `generateFlashcards()` to api-client
   - Copy page/generator/editor, update to handle `{front, back}` fields
4. Validate: Read created files, check for errors
5. Report: "Created flashcards interactive with 7 files"

---

## 💡 Key Insight

The beauty of this pattern is:

**90% of code is identical across all interactive types**

Only these differ:
- Data structure (what fields)
- LLM prompt (how to generate)
- H5P library (which interactive)
- Editor UI (how to edit fields)

Everything else (document selection, AI flow, H5P export, state management, error handling) is the same!

---

**Ready to implement?** → Open [`LLM_AGENT_IMPLEMENTATION_GUIDE.md`](LLM_AGENT_IMPLEMENTATION_GUIDE.md)