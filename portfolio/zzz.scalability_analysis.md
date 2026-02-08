# Scalability & Maintainability Analysis

## 1. Monolithic Store (Severe Risk for Maintainability)
**Issue**: [useBoardStore.ts](file:///home/resgef/works/notion-clone/src/store/useBoardStore.ts) is becoming a "God Object".
- It handles Tasks, Columns, Users, Time Entries, Subtasks.
- It contains **Optimization Logic** (optimistic updates).
- It contains **Business Logic** (duplicate checks, conflict logic).
- It contains **State Management** (Zustand sets).

**Impact**:
- **Cognitive Load**: Hard to find relevant logic (600+ lines and growing).
- **Merge Conflicts**: Everyone touches this file.
- **Performance**: While selectors help, the underlying state object is massive. Updating one task creates a new [tasks](file:///home/resgef/works/notion-clone/src/store/useBoardStore.ts#558-565) object ref, potentially triggering broad re-evaluations.

**Recommendation**: **Store Slicing**.
Split `useBoardStore` into:
- `createTaskSlice`
- `createTimeSlice` (already partial separation exists in hooks, but logic is in main store)
- `createBoardSlice` (columns/structure)

## 2. Manual Optimistic Updates (High Error Risk)
**Issue**: Every action implements its own "try/catch/rollback" logic.
```typescript
// boilerplate repeated everywhere
const prev = state.tasks[id];
set({ ...optimistic... });
try {
  await api.call();
} catch {
  set({ ...rollback... });
}
```
**Impact**:
- Verbose code.
- Easy to forget rollback or implement it incorrectly (e.g., partial rollbacks).
- Inconsistent state handling.

**Recommendation**: **Optimistic Middleware** or Helper.
Create a `withOptimistic(action, optimisticState, rollbackState)` utility.

## 3. "Fetch-and-Hydrate" Strategy (Scaling Bottleneck)
**Issue**: The store relies on [hydrate(data: BoardDTO)](file:///home/resgef/works/notion-clone/src/store/useBoardStore.ts#33-36).
- It implies we fetch *everything* (columns, tasks, users) at once.
- [TimeEntries](file:///home/resgef/works/notion-clone/src/lib/taskAdapter.ts#58-60) are indexed by [taskId](file:///home/resgef/works/notion-clone/src/store/useBoardStore.ts#534-548) in the DTO?

**Impact**:
- **Massive Initial Load**: 10,000 tasks = ~5MB JSON? Slow TTI.
- **Memory Pressure**: Browser consumes excessive RAM holding stale data.

**Recommendation**:
- **Pagination/Virtualization**: Should be baked into the API and Store.
- **Query Caching**: Consider moving data fetching to **TanStack Query** (React Query).
    - React Query handles caching, hydration, pagination, and *optimistic mutations* much better than raw Zustand.
    - **Zustand** should only hold *UI State* (modals, active filters, selection) + *Client-only* ephemeral data.
    - **Server State** (Tasks) belongs in React Query.

## 4. Generic "update" vs Specific Actions
**Issue**: `TaskAdapter.update` takes [TaskUpdatePayload](file:///home/resgef/works/notion-clone/src/types/taskView.ts#143-148).
- `BoardService.moveTask` calls `adapter.update`.
- `BoardService.patchTask` calls `adapter.update`.
- `BoardService.assignUser` calls... [assignTaskAssignee](file:///home/resgef/works/notion-clone/src/services/boardService.ts#16-18) (specific).

**Impact**:
- Hard to trace "Move" events in the system if they are just generic "Updates".
- Difficult to attach specific "Move" side effects (e.g. notifications) if it's just a generic patch.

**Recommendation**: Explicit Methods.
- `adapter.moveTask(...)`
- `adapter.renameTask(...)`
- Keep [update](file:///home/resgef/works/notion-clone/src/components/TaskPane/TaskPane.tsx#118-119) for generic field property edits, but elevate semantic actions.

## 5. Summary of Actions
1.  **Strictly separate Server State (Data) from Client State (UI)**.
    - *Long term*: Migrate data fetching/mutation to React Query.
    - *Mid term*: Slice the Zustand store.
2.  **Standardize Optimistic Logic**.
3.  **Finish Layer Unification** (move remaining actions to Payload-first).

