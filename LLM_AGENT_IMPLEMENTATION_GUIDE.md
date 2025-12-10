# LLM Agent Guide: Implementing New Interactive Elements

> **For:** LLM Agents (Code mode) implementing new interactive types
> **Based on:** Dialogcards reference implementation

---

## Directive Summary

When implementing a new interactive type (e.g., flashcards, timeline, matching):

1. **Copy from dialogcards** - Always start by copying dialogcards files
2. **Modify minimally** - Only change: data structure, prompt, H5P library, field names
3. **Preserve patterns** - Keep all error handling, state management, and API patterns unchanged

---

## Three Core Answers

### 1. How users pick a reference document

**Answer:** Using `DocumentSearchPicker` component (already implemented in [`shared/components`](webapp/src/app/(main)/intelligence-artificielle/shared/components))

**Action Required:** None. Reuse as-is in your Generator component.

### 2. API routes for AI data generation

**Answer:** Create `/api/ai/{type}/route.ts` by copying [`/api/ai/dialogcards/route.ts`](webapp/src/app/api/ai/dialogcards/route.ts)

**What to change:**
- Prompt text (lines 28-43)
- JSON structure in prompt
- Output field name if not "cards"

**What to keep:**
- Prisma query pattern
- Error handling
- JSON extraction regex
- Response structure

### 3. How H5P gets generated

**Answer:** Two-step process:

**Step A:** Create `create{Type}.ts` by copying [`createDialogcards.ts`](webapp/src/app/api/export/h5p/creation-requests/createDialogcards.ts)

**What to change:**
- Data interface (lines 5-8)
- Data transformation to H5P format (lines 21-25)
- H5P library name (line 28)
- H5P params structure (lines 30-72)

**What to keep:**
- Document fetch pattern
- createH5P call
- Metadata structure

**Step B:** Update [`/api/export/h5p/route.ts`](webapp/src/app/api/export/h5p/route.ts)

**What to add:**
- Import statement
- Type guard function
- Handler in POST method

---

## File-by-File Instructions

### File 1: AI Generation Route
**Location:** `webapp/src/app/api/ai/{type}/route.ts`
**Source:** Copy [`webapp/src/app/api/ai/dialogcards/route.ts`](webapp/src/app/api/ai/dialogcards/route.ts)

**Modifications:**
```typescript
// Line 26: Adjust number of items if needed
const numItems = 6 + Math.floor(Math.random() * 4);

// Lines 28-43: Update prompt for your structure
const prompt = `<context>${context}</context>

Generate EXACTLY ${numItems} items in JSON format:

[
  {
    "yourField1": "description",
    "yourField2": "description"
  }
]

Rules:
- Your specific rules
- No text before or after JSON
`;

// Line 69: Update return field name if needed
return NextResponse.json({ items: yourItems });
```

### File 2: H5P Export Function
**Location:** `webapp/src/app/api/export/h5p/creation-requests/create{Type}.ts`
**Source:** Copy [`webapp/src/app/api/export/h5p/creation-requests/createDialogcards.ts`](webapp/src/app/api/export/h5p/creation-requests/createDialogcards.ts)

**Modifications:**
```typescript
// Lines 5-8: Update interface
export interface YourTypeData {
  items: YourItem[];
  documentId: string;
}

// Lines 21-25: Transform to H5P format
const h5pItems = input.items.map(item => ({
  field1: `<p>${item.yourField1}</p>`,
  field2: `<p>${item.yourField2}</p>`,
}));

// Line 28: Update H5P library
"library": "H5P.YourLibrary 1.0",

// Lines 30-72: Update H5P params structure
// Research the specific H5P library documentation
```

### File 3: H5P Route Handler
**Location:** `webapp/src/app/api/export/h5p/route.ts`
**Action:** Modify existing file

**Add these sections:**
```typescript
// At top with other imports
import createYourType from './creation-requests/createYourType';

// Around line 25 with other type guards
function isYourTypeRequest(body: ExportH5PRequestBody): body is ExportH5PRequestBody & { 
  type: 'your-type'; 
  data: { items: YourItem[]; documentId: string } 
} {
  return body.type === 'your-type';
}

// Around line 51 in POST function
else if (isYourTypeRequest(body)) {
  game = await createYourType(body.data, body.h5pContentId);
  type = "your-type";
}
```

### File 4: API Client
**Location:** `webapp/src/lib/api-client.ts`
**Action:** Modify existing file

**Add these sections:**
```typescript
// At top with other interfaces
export interface YourItem {
  field1: string;
  field2: string;
}

export interface YourItemSet {
  items: YourItem[];
}

// In ApiClient class (around line 326)
async generateYourType(documentId: string): Promise<YourItemSet> {
  const response = await this.axiosInstance.post<YourItemSet>(
    '/ai/your-type', 
    { documentId }
  );
  return response.data;
}
```

### File 5: Page Component
**Location:** `webapp/src/app/(main)/intelligence-artificielle/{type}/page.tsx`
**Source:** Copy [`webapp/src/app/(main)/intelligence-artificielle/dialogcards/page.tsx`](webapp/src/app/(main)/intelligence-artificielle/dialogcards/page.tsx) exactly

**Modifications:**
```typescript
// Line 5: Update import
const YourTypeGenerator = dynamic(() => import('./YourTypeGenerator'), {

// Line 14: Update portal ID
<div id="your-type-back-portal"></div>

// Line 16: Update component
<YourTypeGenerator />
```

### File 6: Generator Component
**Location:** `webapp/src/app/(main)/intelligence-artificielle/{type}/{Type}Generator.tsx`
**Source:** Copy [`webapp/src/app/(main)/intelligence-artificielle/dialogcards/DialogcardGenerator.tsx`](webapp/src/app/(main)/intelligence-artificielle/dialogcards/DialogcardGenerator.tsx)

**Modifications:**
```typescript
// Line 9: Update import
import YourTypeEditor from './YourTypeEditor';

// Line 31: Update enum name
export enum YourTypeImportType {

// Lines 37-52: Update loading messages if needed
const loadingMessages: LoadingMessagesConfig = {
  [YourTypeImportType.RECHERCHE]: [
    "Your loading messages...",
  ],
};

// Line 83: Update title
<h1>Je crée des YourType</h1>

// Lines 127-129: Update config
onInsertedLabel: "Générer des items",

// Line 146: Update component ref
<YourTypeEditor

// Line 14 portal reference
```

### File 7: Editor Component
**Location:** `webapp/src/app/(main)/intelligence-artificielle/{type}/{Type}Editor.tsx`
**Source:** Copy [`webapp/src/app/(main)/intelligence-artificielle/dialogcards/DialogcardEditor.tsx`](webapp/src/app/(main)/intelligence-artificielle/dialogcards/DialogcardEditor.tsx)

**Modifications:**
```typescript
// Line 20: Update modal ID
id: "modal-quit-your-type-without-saving",

// Lines 28-35: Update interfaces
export interface YourItem {
  field1: string;
  field2: string;
}

// Lines 41-49: Update API function
export const generateYourTypeData = async (params: { documentId: string }): Promise<[Error | null, YourItemSet | null]> => {
  const response = await apiClient.generateYourType(params.documentId);

// Line 65: Rename component
const YourItemEditor: React.FC<YourItemEditorProps> = ({

// Lines 235-272: Update Input fields for your data structure
<Input
  label="Your Field 1"
  value={item.field1}
  onChange={(e) => handleFieldChange(index, 'field1', e.target.value)}
/>

// Line 294: Rename manager
export default function YourTypeManager(props: {

// Line 318: Update type in exportH5p
type: 'your-type',

// Update all text references from "dialogcards" to your type
// Update portal ID references
```

---

## Critical Patterns to Preserve

### Pattern 1: Document Chunk Fetching
```typescript
const chunks: Pick<DocumentChunk, "text">[] = await prisma.documentChunk.findMany({
  where: { documentId },
  select: { text: true },
});
const context = chunks.map((chunk) => chunk.text).join("\n\n");
```
**DO NOT MODIFY** - This is the standard way to get document content

### Pattern 2: JSON Extraction
```typescript
const jsonMatch = output.match(/\[[\s\S]*?\]/);
if (!jsonMatch) {
  throw new Error("Invalid format from LLM");
}
const items = JSON.parse(jsonMatch[0]);
```
**DO NOT MODIFY** - This handles LLM response parsing reliably

### Pattern 3: H5P Export Call
```typescript
const data: ExportH5pResponse = await apiClient.exportH5p({
  h5pContentId: h5pContentId,
  type: 'your-type',
  data: { items, documentId },
  documentIds: documentId ? [documentId] : [],
});
```
**DO NOT MODIFY** structure - Only change type string

### Pattern 4: State Management
```typescript
const updateItems = useCallback(async (documentId: string, items: YourItem[]) => {
  setIsSaving(true);
  try {
    const data = await apiClient.exportH5p({...});
    if (data) {
      setPreviewUrl(data.embedUrl);
      setDownloadH5pUrl(data.downloadH5p);
      setDownloadHTMLUrl(data.downloadHTML);
      setH5pContentId(data.h5pContentId);
      setRefreshKey(prev => prev + 1);
    }
  } finally {
    setIsSaving(false);
  }
}, [h5pContentId]);
```
**DO NOT MODIFY** - This is the standard save pattern

---

## Best Practices for Agents

### ✅ DO:
- Copy entire files from dialogcards reference
- Keep all error handling unchanged
- Preserve all state management patterns
- Use exact same imports
- Keep the modal patterns
- Maintain H5PRenderer integration
- Follow the same component hierarchy

### ❌ DON'T:
- Modify Prisma query patterns
- Change JSON extraction regex
- Alter DocumentSearchPicker integration
- Skip error handling blocks
- Remove useCallback/useMemo optimizations
- Change the H5P export flow structure
- Modify the portal pattern

---

## Implementation Checklist

When implementing, verify these items:

**Backend:**
- [ ] AI route copied from dialogcards with updated prompt
- [ ] H5P export function has correct library name
- [ ] Type guard added to export/h5p/route.ts
- [ ] Handler added to export/h5p/route.ts POST method
- [ ] API client methods added with correct types

**Frontend:**
- [ ] Page component created with correct portal ID
- [ ] Generator component references correct Editor
- [ ] Editor component has unique modal ID
- [ ] All "dialogcard" strings replaced with your type
- [ ] exportH5p call uses correct type string
- [ ] Input fields match your data structure

**Testing:**
- [ ] Read AI route to verify structure
- [ ] Check H5P function has correct library
- [ ] Verify route.ts changes compile
- [ ] Check api-client.ts for syntax
- [ ] Read page.tsx for correct imports
- [ ] Verify Generator component structure
- [ ] Read Editor for correct API calls

---

## Common Mistakes to Avoid

1. **Changing the document fetch query** - Always keep the Prisma pattern
2. **Modifying error handling** - Copy error handlers exactly
3. **Altering state patterns** - Keep useState/useCallback patterns
4. **Breaking the modal** - Keep createModal pattern unchanged
5. **Wrong H5P library name** - Research exact library name and version
6. **Missing type guard** - Always add the type guard function
7. **Incorrect type string** - Use lowercase-with-hyphens (e.g., 'flash-cards')

---

## Quick Reference: File Locations

| What | Where |
|------|-------|
| AI Generation | [`webapp/src/app/api/ai/dialogcards/route.ts`](webapp/src/app/api/ai/dialogcards/route.ts) |
| H5P Transform | [`webapp/src/app/api/export/h5p/creation-requests/createDialogcards.ts`](webapp/src/app/api/export/h5p/creation-requests/createDialogcards.ts) |
| H5P Route | [`webapp/src/app/api/export/h5p/route.ts`](webapp/src/app/api/export/h5p/route.ts) |
| API Client | [`webapp/src/lib/api-client.ts`](webapp/src/lib/api-client.ts) |
| Page | [`webapp/src/app/(main)/intelligence-artificielle/dialogcards/page.tsx`](webapp/src/app/(main)/intelligence-artificielle/dialogcards/page.tsx) |
| Generator | [`webapp/src/app/(main)/intelligence-artificielle/dialogcards/DialogcardGenerator.tsx`](webapp/src/app/(main)/intelligence-artificielle/dialogcards/DialogcardGenerator.tsx) |
| Editor | [`webapp/src/app/(main)/intelligence-artificielle/dialogcards/DialogcardEditor.tsx`](webapp/src/app/(main)/intelligence-artificielle/dialogcards/DialogcardEditor.tsx) |
| Shared Components | [`webapp/src/app/(main)/intelligence-artificielle/shared/components/`](webapp/src/app/(main)/intelligence-artificielle/shared/components/) |

---

## Workflow for Agent

1. **Get requirements from user:**
   - Interactive type name
   - H5P library to use  
   - Data structure (fields)

2. **Create backend (Steps 1-4):**
   - Copy and modify AI generation route
   - Copy and modify H5P export function
   - Update H5P route handler
   - Update API client

3. **Create frontend (Steps 5-7):**
   - Copy page component
   - Copy and modify generator
   - Copy and modify editor

4. **Validate:**
   - Read each created file
   - Check for TypeScript errors
   - Verify all references updated
   - Confirm no "dialogcard" strings remain

5. **Report:**
   - List all files created/modified
   - Note any deviations from pattern
   - Mention required manual testing

---

## Summary

**Copy from dialogcards → Change only data/UI/text → Keep all patterns**

This approach ensures consistency, reduces bugs, and maintains the established architecture while allowing customization for different interactive types.