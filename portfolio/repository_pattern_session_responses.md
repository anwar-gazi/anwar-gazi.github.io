# Session Transcript: TypeScript & DDD

## 1. Query: typescript interface vs type

In TypeScript, `interface` and `type` are very similar but have key distinct use cases.

**Similarities:**
Both can describe the shape of an object or a function signature.

**Key Differences:**

1.  **Declaration Merging (Interface only):**
    *   `interface` supports merging. If you define an interface with the same name multiple times, TypeScript merges them into one. This is crucial for extending third-party libraries.
    *   `type` aliases are unique and cannot be re-declared.

2.  **Extensibility:**
    *   `interface` uses `extends` to inherit from other interfaces.
    *   `type` uses intersection (`&`) to combine types.
    *   *Note: Interfaces can extend types, and types can intersect with interfaces.*

3.  **Flexibility (Type only):**
    *   `type` can represent **primitive aliases** (e.g., `type ID = string`), **unions** (e.g., `type Status = 'open' | 'closed'`), and **tuples**.
    *   `interface` can only represent object shapes.

**Recommendation:**
*   Use **`interface`** by default for defining object shapes and public APIs (especially in libraries) to allow for declaration merging.
*   Use **`type`** when you need unions, primitives, complex mapped types, or tuples.

---

## 2. Query: in repository pattern in a ts project, the domain entities can be type object or interface?

In the context of the Repository Pattern and Domain-Driven Design (DDD) in TypeScript, here is the breakdown of how to choose:

### 1. **Best Practice: Use `class`**
For **Domain Entities**, classes are usually the best choice because entities typically possess **identity** and **behavior** (business logic/methods), not just data.

```typescript
// Domain Entity
class User {
  constructor(
    public id: string,
    public email: string,
    private _passwordHash: string
  ) {}

  // Behavior
  changePassword(newPassword: string): void {
    if (newPassword.length < 8) throw new Error("Too short");
    // logic...
  }
}
```

### 2. **If using Data-Only (Anemic) Models: Use `interface`**
If your architectural style separates data from logic (e.g., functional programming style) and your entities are just data structures, prefer **`interface`**.

*   **Performance:** Interfaces historically have slightly better performance checks in the TS compiler.
*   **Error Messages:** Interfaces often provide cleaner error messages.
*   **Extensibility:** Easier to extend or implement if you switch to classes later.

```typescript
// Pure Data Entity
interface User {
  id: string;
  email: string;
}
```

### Summary Recommendation
*   **Rich Domain Model:** Use `class`.
*   **Data Shape / DTO:** Use `interface`.
*   **Avoid:** Using `type` for entities unless you specifically need Union types (e.g., `type User = Admin | Customer`).

---

## 3. Query: using class for domain entities can cause problem in serialization? or, does class have serialize method that is auto invoked when it is serialized?

Yes, using classes can introduce specific behavior during serialization.

### 1. The `toJSON` Method
Classes in JavaScript/TypeScript have a built-in hook. If you define a method named `toJSON()`, `JSON.stringify()` will automatically call it. This is useful for hiding private fields or formatting data.

```typescript
class User {
  constructor(
    public id: string,
    private passwordHash: string
  ) {}

  // Automatically called by JSON.stringify(user)
  toJSON() {
    return {
      id: this.id,
      // passwordHash is excluded
    };
  }
}
```

### 2. The Problems

*   **Loss of Methods:** When you serialize (`JSON.stringify`), all methods are lost. You only get the data.
*   **Rehydration (Deserialization):** When you parse (`JSON.parse`), you get a **plain object**, not an instance of the class.
    *   *Result:* You cannot call methods like `user.changePassword()` on the parsed object.
    *   *Fix:* You must manually re-instantiate the class (e.g., `new User(...)`) using the raw data.

### 3. Repository Pattern Solution: Mappers
In a clean Repository pattern, you generally **should not** serialize Domain Entities directly to the API response or database.

Instead, use a **Mapper**:
1.  **Entity:** Rich logic (`class`).
2.  **DTO (Data Transfer Object):** Plain data (`interface`).
3.  **Mapper:** Converts `Entity -> DTO` (for saving/sending) and `DTO -> Entity` (for loading).

---

## 4. Query: pros and cons of domain entities to be anemic or class

Here is a comparison of the two approaches for defining Domain Entities.

### 1. Anemic Domain Model (Data-Only)
In this approach, entities are just data structures (using `interface` or classes with only public fields). All business logic resides in **Service** classes.

**Structure:** `User` (data) + `UserService` (logic).

#### Pros
*   **Simplicity:** Very easy to understand for beginners. It maps 1:1 with database tables and JSON APIs.
*   **Easy Serialization:** Since they are plain objects, `JSON.stringify` and `JSON.parse` work without effort.
*   **ORM Friendly:** Most ORMs (TypeORM, Prisma, Sequelize) default to this style. They read/write public properties easily.
*   **Functional Style:** Fits well with functional programming paradigms where data and functions are strictly separated.

#### Cons
*   **No Encapsulation:** Anyone can change any data at any time. A service could accidentally set `user.age = -5`.
*   **Inconsistency:** It is easy to create an "invalid" entity.
*   **Logic Fragmentation:** Business rules are often duplicated across multiple services or controllers (e.g., validation logic appearing in 3 different places).
*   **Bloated Services:** "God Services" tend to emerge, where a `UserService` contains thousands of lines of procedural code.

---

### 2. Rich Domain Model (Behavioral Classes)
In this approach, entities are `class` instances that contain both data and the methods that manipulate that data.

**Structure:** `User` (contains data + logic). Services are thin and only coordinate tasks.

#### Pros
*   **High Encapsulation:** You can make fields `private` or `readonly`. State changes only happen through controlled methods (e.g., `user.publishPost()`).
*   **Guaranteed Consistency (Invariants):** The class ensures it is never in an invalid state. You cannot create a `User` without an email if the constructor requires it.
*   **Cohesion:** Logic that belongs to a user stays inside the `User` file. Easier to find and maintain.
*   **Testability:** You can unit test the Entity logic without mocking complex database services.

#### Cons
*   **Serialization Complexity:** As discussed, you lose methods when sending data over the network. You need **Mappers** to convert `Entity <-> DTO`.
*   **Rehydration Complexity:** Loading from the database is harder. You cannot just cast a DB row to a class; you must instantiate the class and reconstruct its state.
*   **ORM Friction:** Some ORMs struggle with private fields or constructors that require arguments.

---

### Summary: When to choose which?

| Use **Anemic (Interfaces)** when... | Use **Rich (Classes)** when... |
| :--- | :--- |
| You are building a simple **CRUD** application. | You have **complex business rules** and state transitions. |
| The logic is mostly "read from DB, send to UI". | The logic involves complex calculations or validations. |
| You want to move fast and rules are simple. | You need long-term maintainability and safety. |
| You are using **Prisma** (heavily favors interfaces). | You are following strict **DDD** principles. |

---

## 5. Query: do you have a history (or can you remember) what we discussed so far in this session? (related to DDD, entity: interface, class; etc)

Yes, I have the context of our conversation within this current session. Here is a summary of what we have discussed so far:

1.  **TypeScript `interface` vs `type`**: We started by distinguishing between the two.
    *   **Recommendation**: Use `interface` for object shapes/APIs (supports merging) and `type` for unions, primitives, or tuples.
2.  **Entities in Repository Pattern**: You asked if domain entities should be objects or interfaces.
    *   **Recommendation**: Use `class` for **Rich Domain Models** (behavior + data) and `interface` for **Anemic Models** (data only).
3.  **Serialization Issues with Classes**: You asked about serializing classes.
    *   **Answer**: `JSON.stringify` calls `toJSON()` if it exists. However, serialization strips methods, and deserialization (`JSON.parse`) returns a plain object, not a class instance. This requires **Mappers** to rebuild the entity.
4.  **Anemic vs. Rich Models**: We compared the pros and cons.
    *   **Anemic (`interface`)**: Good for simple CRUD, easy to serialize, but lacks encapsulation.
    *   **Rich (`class`)**: Good for complex logic and data consistency (DDD), but requires extra work for mapping and rehydration from databases.
