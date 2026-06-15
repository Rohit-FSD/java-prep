import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Bookmark, Check, Filter, X, ChevronDown, ChevronRight,
  Flame, Target, TrendingUp, Building2, Briefcase, Sparkles, RotateCcw,
  Eye, EyeOff, BookOpen, Award, Cpu, Database, Layers, Boxes, Shield,
  Code2, Zap, Hash, Terminal, GraduationCap, ListChecks, Star, ArrowRight,
  ArrowLeft, Lightbulb, Activity, Coffee, Brain, Sun, Moon, Shuffle, CircleDot,
  Play, Copy, Loader2, AlertTriangle, Calendar, ChevronLeft
} from "lucide-react";


// --- persistence: window.storage inside Claude artifacts, else localStorage when run locally ---
const __store = (function () {
  if (typeof window !== "undefined" && window.storage) return window.storage;
  if (typeof window !== "undefined" && window.localStorage) {
    return {
      get: async (k) => { const v = window.localStorage.getItem(k); return v == null ? null : { value: v }; },
      set: async (k, v) => { window.localStorage.setItem(k, String(v)); return { value: v }; },
    };
  }
  return null;
})();

// Core Java interview question bank — curated for 3–6 yr backend engineers switching roles.
// Company tags: SERVICE (TCS/Infosys/Wipro/Cognizant/Accenture/Capgemini),
// BANK (Barclays/JPMC/Morgan Stanley/Goldman/Citi/Deutsche/UBS),
// PRODUCT (PayPal/Walmart/Visa/Mastercard/Atlassian/Oracle/mid-scale product cos.)

const TOPICS = [
  { id: "oop", name: "OOP & Design Principles", icon: "Boxes", blurb: "Encapsulation, polymorphism, SOLID, composition." },
  { id: "strings", name: "Strings", icon: "Hash", blurb: "Immutability, pool, StringBuilder, intern()." },
  { id: "collections", name: "Collections Framework", icon: "Layers", blurb: "HashMap internals, fail-fast, concurrent collections." },
  { id: "concurrency", name: "Multithreading & Concurrency", icon: "Cpu", blurb: "JMM, locks, executors, CAS, virtual threads." },
  { id: "exceptions", name: "Exception Handling", icon: "Shield", blurb: "Checked vs unchecked, try-with-resources, chaining." },
  { id: "java8", name: "Java 8 & Functional", icon: "Zap", blurb: "Streams, lambdas, Optional, functional interfaces." },
  { id: "streams", name: "Streams Coding", icon: "Code2", blurb: "Hands-on stream pipeline problems to write yourself." },
  { id: "modern", name: "Modern Java (11–21)", icon: "Sparkles", blurb: "Records, sealed, pattern matching, virtual threads." },
  { id: "jvm", name: "JVM, Memory & GC", icon: "Cpu", blurb: "Class loading, heap/stack, GC, memory leaks." },
  { id: "generics", name: "Generics", icon: "Code2", blurb: "Type erasure, bounded wildcards, PECS." },
  { id: "serialization", name: "Serialization & I/O", icon: "Database", blurb: "Serializable, transient, NIO, externalizable." },
  { id: "coding", name: "Coding & Output", icon: "Terminal", blurb: "Tricky output, snippets, write-on-the-spot." },
  { id: "string-coding", name: "String Problems", icon: "Hash", blurb: "Classic string coding interview problems." },
  { id: "array-coding", name: "Array Problems", icon: "Boxes", blurb: "Classic array & matrix coding problems." },
];

const DIFF = { easy: "Easy", medium: "Medium", hard: "Hard" };

// ---- Question bank ----
const QUESTIONS = [
  // ===================== OOP =====================
  {
    id: "oop-1", topic: "oop", difficulty: "easy", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "What are the four pillars of OOP, and how have you used them in real code?",
    a: "Encapsulation (bundling state + behaviour, exposing only intent via methods), Abstraction (hiding implementation behind interfaces/abstract types), Inheritance (reusing and specialising behaviour via an IS-A relationship), and Polymorphism (one reference, many runtime forms — overriding + dynamic dispatch). The senior signal is connecting each to a design decision: e.g. encapsulating a balance field behind validated mutators, or coding to an interface so a payment processor can be swapped at runtime.",
    keyPoints: [
      "Don't just define — tie each pillar to a design decision you made.",
      "Polymorphism = compile-time (overloading) + runtime (overriding/dynamic dispatch).",
      "Abstraction reduces coupling; encapsulation protects invariants.",
    ],
  },
  {
    id: "oop-2", topic: "oop", difficulty: "medium", freq: "Very common",
    companies: ["BANK", "PRODUCT"],
    q: "Composition vs inheritance — when do you favour one over the other?",
    a: "Inheritance creates a tight, compile-time IS-A coupling and exposes the parent's API to subclasses, which makes hierarchies fragile (the 'fragile base class' problem). Composition (HAS-A) delegates to contained objects, is more flexible, and lets you change behaviour at runtime. Modern guidance — 'favour composition over inheritance' (Effective Java Item 18) — because inheritance breaks encapsulation: a subclass depends on implementation details of the superclass.",
    keyPoints: [
      "Inheritance only for genuine IS-A + stable, designed-for-extension supertypes.",
      "Composition + interfaces gives runtime flexibility (Strategy pattern).",
      "Classic example: don't extend HashMap to add counting — wrap it.",
    ],
  },
  {
    id: "oop-3", topic: "oop", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Explain SOLID principles with a one-line example each.",
    a: "S — Single Responsibility: a class has one reason to change (a service doesn't also format reports). O — Open/Closed: extend behaviour without modifying existing code (add a new Strategy impl). L — Liskov Substitution: subtypes must be usable wherever the supertype is (a Square that breaks Rectangle's invariants violates it). I — Interface Segregation: many small role interfaces beat one fat one. D — Dependency Inversion: depend on abstractions, inject concretes (Spring's whole DI model).",
    keyPoints: [
      "Interviewers love a concrete violation + the fix.",
      "DIP is why we inject interfaces in Spring, not new up dependencies.",
      "LSP violations show up as instanceof checks and overridden methods that throw.",
    ],
  },
  {
    id: "oop-4", topic: "oop", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Abstract class vs interface — and what changed after Java 8?",
    a: "An abstract class can hold state (instance fields), constructors, and a mix of concrete/abstract methods; a class extends exactly one. An interface is a contract; a class implements many. Since Java 8 interfaces can have default and static methods (enabling API evolution without breaking implementors), and since Java 9 private methods. Use an abstract class for shared state/partial implementation in a true IS-A hierarchy; use an interface for capability/role contracts and multiple inheritance of type.",
    keyPoints: [
      "Default methods solved API evolution (e.g. Collection.stream()).",
      "Interface = no instance state (only constants); abstract class can.",
      "Diamond problem with default methods → compiler forces you to override.",
    ],
  },
  {
    id: "oop-5", topic: "oop", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Method overloading vs overriding — including the dispatch rules.",
    a: "Overloading = same name, different parameter list, resolved at COMPILE time by the static (declared) type of arguments. Overriding = same signature in a subclass, resolved at RUNTIME by the actual object type (dynamic dispatch). A classic gotcha: overloaded methods pick the most specific applicable at compile time, so passing null can be ambiguous; overridden methods always run the subclass version regardless of the reference type.",
    keyPoints: [
      "Overloading: static binding; overriding: dynamic binding.",
      "Covariant return types are allowed when overriding.",
      "You cannot override static, final, or private methods (static = hiding).",
    ],
  },
  {
    id: "oop-6", topic: "oop", difficulty: "hard", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Walk through the equals() and hashCode() contract. What breaks if you violate it?",
    a: "Contract: equal objects MUST have equal hash codes; unequal objects SHOULD ideally differ (not required). equals must be reflexive, symmetric, transitive, consistent, and x.equals(null)==false. If you override equals but not hashCode, equal objects can land in different buckets, so a HashMap/HashSet lookup fails to find a logically-equal key. If hashCode is inconsistent with equals, you get duplicate set entries or 'lost' map values.",
    keyPoints: [
      "Always override both together; use the same fields in both.",
      "Use Objects.equals()/Objects.hash() or generate via IDE/record.",
      "Mutable fields in a key → object can get 'lost' in the map after mutation.",
    ],
    code: "@Override public boolean equals(Object o){\n  if(this==o) return true;\n  if(!(o instanceof Account a)) return false;\n  return id == a.id && Objects.equals(iban, a.iban);\n}\n@Override public int hashCode(){ return Objects.hash(id, iban); }",
  },
  {
    id: "oop-7", topic: "oop", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "How do you design an immutable class, and why does it matter in concurrency?",
    a: "Make the class final, all fields private final, set only via constructor, provide no setters, and defensively copy any mutable inputs/outputs (collections, dates). Immutable objects are inherently thread-safe — no synchronization needed because state never changes after construction — which is why String, Integer, and value objects in trading systems are immutable. They also make great map keys.",
    keyPoints: [
      "final class + final fields + no setters + defensive copies.",
      "Thread-safe by construction; safely publishable.",
      "Records (Java 16+) give you shallow immutability for free.",
    ],
  },
  {
    id: "oop-8", topic: "oop", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "What is the 'diamond problem' and how does Java avoid it?",
    a: "The diamond problem is ambiguity when a type inherits the same member from two paths. Java avoids it for classes by allowing only single class inheritance. With Java 8 default methods, a class can inherit a method from two interfaces — the compiler forces you to resolve it by overriding and can call a specific one via InterfaceName.super.method().",
    keyPoints: [
      "Single class inheritance avoids state ambiguity.",
      "Default-method conflict → must override explicitly.",
      "Syntax: Parent.super.method() to disambiguate.",
    ],
  },
  {
    id: "oop-9", topic: "oop", difficulty: "easy", freq: "Common",
    companies: ["SERVICE"],
    q: "What is the difference between association, aggregation, and composition?",
    a: "Association is any relationship between two objects (a Doctor and a Patient). Aggregation is a 'whole–part' relationship where parts can exist independently (a Department HAS-A Professors, but professors outlive the department). Composition is a stronger whole–part where parts cannot exist without the whole (a House and its Rooms — destroy the house, the rooms go too).",
    keyPoints: [
      "Aggregation = weak HAS-A (independent lifecycle).",
      "Composition = strong HAS-A (owned lifecycle).",
      "Both are forms of association.",
    ],
  },
  {
    id: "oop-10", topic: "oop", difficulty: "hard", freq: "Occasional",
    companies: ["BANK", "PRODUCT"],
    q: "How would you make a Singleton thread-safe and resilient against reflection/serialization?",
    a: "The cleanest approach is an enum singleton — the JVM guarantees a single instance, and it's reflection- and serialization-safe by design. If you need lazy initialisation, use the Bill Pugh holder idiom (static inner class loaded on first access) or double-checked locking with a volatile instance field. Plain DCL without volatile is broken due to instruction reordering during object construction.",
    keyPoints: [
      "Enum singleton = best default (Effective Java).",
      "Holder idiom = lazy + thread-safe with no locking.",
      "DCL needs volatile; reflection can break non-enum singletons.",
    ],
    code: "enum Config { INSTANCE; private final Props p = load(); public Props get(){return p;} }\n// or holder idiom:\nstatic class Holder { static final Service I = new Service(); }\nstatic Service get(){ return Holder.I; }",
  },

  // ===================== STRINGS =====================
  {
    id: "str-1", topic: "strings", difficulty: "easy", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Why is String immutable in Java? Name the benefits.",
    a: "String is immutable so it can be safely shared and cached. Benefits: the String pool can intern and reuse literals (memory + speed); strings are safe as HashMap keys (hashCode is stable and cached); they're inherently thread-safe; and immutability is a security property (a file path or DB URL can't be mutated after a permission check). The String class is final and backed by a private final byte[] (char[] before Java 9).",
    keyPoints: [
      "Pooling, caching hashCode, thread safety, security.",
      "Backing array is private final; class is final.",
      "Every 'modification' creates a new object.",
    ],
  },
  {
    id: "str-2", topic: "strings", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Explain the String pool. How many objects does new String(\"hi\") create?",
    a: "The String pool is a special area (in the heap since Java 7) holding interned String literals so identical literals share one object. A literal \"hi\" goes in the pool. new String(\"hi\") creates a NEW object on the heap distinct from the pooled one — so the statement can create up to two objects: the pooled literal (if not already present) and the heap object. intern() returns the pooled reference.",
    keyPoints: [
      "Literals are pooled; new String() forces a heap object.",
      "== compares references; equals() compares content.",
      "intern() pushes/looks up a string in the pool.",
    ],
  },
  {
    id: "str-3", topic: "strings", difficulty: "easy", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "String vs StringBuilder vs StringBuffer — when to use which?",
    a: "String is immutable — every concat creates a new object, so loops of concatenation are O(n²) garbage. StringBuilder is mutable and NOT synchronized — fastest, use it for building strings in single-threaded code. StringBuffer is mutable and synchronized (thread-safe but slower) — only needed when one builder is shared across threads, which is rare. Default to StringBuilder.",
    keyPoints: [
      "String for constants; StringBuilder for building; StringBuffer only if shared across threads.",
      "Compiler may turn simple '+' into StringBuilder, but not inside loops.",
      "StringBuilder is the pragmatic default.",
    ],
  },
  {
    id: "str-4", topic: "strings", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "What does String.intern() do and when is it useful (or dangerous)?",
    a: "intern() returns the canonical pooled reference: if an equal string is already in the pool it returns that; otherwise it adds this string and returns it. It can save memory when you have many duplicate strings (e.g. parsing). The danger: aggressive interning of unique strings bloats the pool (and historically PermGen), and interning is a synchronized native call that can become a contention point.",
    keyPoints: [
      "Deduplicates equal strings to one pooled reference.",
      "Helpful for high-duplication data; harmful if you intern unique values.",
      "JVM also has automatic G1 String Deduplication (-XX:+UseStringDeduplication).",
    ],
  },
  {
    id: "str-5", topic: "strings", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Why are strings good keys for HashMap?",
    a: "Because they're immutable, a String's hashCode never changes after creation (and is cached in a field), so the bucket it maps to is stable — you can never 'lose' a value the way you can with a mutable key whose hashCode changes. Immutability also means no defensive copying and inherent thread safety.",
    keyPoints: [
      "Immutable → stable, cached hashCode.",
      "Mutable keys can drift to the wrong bucket after mutation.",
      "Cached hashCode makes repeated lookups fast.",
    ],
  },
  {
    id: "str-6", topic: "strings", difficulty: "hard", freq: "Occasional",
    companies: ["BANK", "PRODUCT"],
    q: "How was String stored before and after Java 9 (Compact Strings)?",
    a: "Before Java 9 a String wrapped a char[] (2 bytes per char, UTF-16). Java 9 introduced Compact Strings: the backing field is a byte[] plus a 'coder' flag. Strings that are pure Latin-1 use 1 byte per char, halving memory for the very common ASCII case; non-Latin1 strings still use UTF-16. This was a transparent footprint optimisation with no API change.",
    keyPoints: [
      "Pre-9: char[] (UTF-16, 2 bytes/char).",
      "9+: byte[] + coder; Latin-1 strings use 1 byte/char.",
      "Reduced heap footprint significantly for typical apps.",
    ],
  },
  {
    id: "str-7", topic: "strings", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "What's the output of comparing strings with == vs equals in common cases?",
    a: "For two identical literals, == is true (both point to the same pooled object). For a literal vs new String(...), == is false but equals is true. For two compile-time constant expressions like \"ab\"+\"c\" the compiler folds them to a pooled literal; but concatenation involving a variable produces a new heap object at runtime, so == is false. Always use equals() for content comparison.",
    keyPoints: [
      "== compares references; equals compares characters.",
      "Compile-time constant concatenation is pooled; runtime concatenation isn't.",
      "Use equals (or equalsIgnoreCase) for logic.",
    ],
  },

  // ===================== COLLECTIONS =====================
  {
    id: "col-1", topic: "collections", difficulty: "hard", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Explain the internal working of HashMap (put/get, buckets, resizing, treeify).",
    a: "A HashMap holds an array of buckets (Node[]), default capacity 16, load factor 0.75. On put, it computes hash = key.hashCode() spread by (h ^ (h>>>16)), maps to index (n-1)&hash, and stores a Node. Collisions form a linked list in that bucket; if a bucket exceeds 8 nodes AND table size ≥ 64 it 'treeifies' into a red-black tree for O(log n) worst case. When size exceeds capacity×loadFactor it resizes (doubles) and rehashes. get does the same hash → bucket → equals scan.",
    keyPoints: [
      "Default cap 16, load factor 0.75, treeify threshold 8 (with table ≥ 64).",
      "Index = (n-1) & hash; hash spread mixes high bits.",
      "Resize doubles capacity and redistributes entries.",
      "Poor hashCode → many collisions → degrades toward O(n)/O(log n).",
    ],
  },
  {
    id: "col-2", topic: "collections", difficulty: "hard", freq: "Very common",
    companies: ["BANK", "PRODUCT"],
    q: "How does ConcurrentHashMap achieve thread safety without locking the whole map?",
    a: "Pre-Java 8 it used segment-level locking (lock striping). Since Java 8 it dropped segments: reads are lock-free (volatile reads of bucket heads), and writes lock only the individual bucket head (synchronized on the first node) or use CAS to install the first node in an empty bucket. This gives high concurrency — different buckets can be written in parallel — while reads almost never block. It does NOT allow null keys/values (so absence vs null is unambiguous across threads).",
    keyPoints: [
      "Java 8+: per-bucket synchronized + CAS, no global lock.",
      "Reads are lock-free via volatile.",
      "No null keys/values; size() is an estimate under concurrency.",
      "Iterators are weakly consistent (no ConcurrentModificationException).",
    ],
  },
  {
    id: "col-3", topic: "collections", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Fail-fast vs fail-safe iterators — give examples.",
    a: "Fail-fast iterators (ArrayList, HashMap) operate on the live collection and track a modCount; if the structure is modified during iteration (except via the iterator's own remove), they throw ConcurrentModificationException — failing fast on a likely bug. Fail-safe iterators (CopyOnWriteArrayList, ConcurrentHashMap) work on a snapshot or are weakly consistent, so they don't throw but may not reflect the latest changes.",
    keyPoints: [
      "Fail-fast = modCount check → ConcurrentModificationException.",
      "Fail-safe = snapshot/weakly-consistent → no exception.",
      "Remove during iteration only via Iterator.remove() for fail-fast.",
    ],
  },
  {
    id: "col-4", topic: "collections", difficulty: "easy", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "ArrayList vs LinkedList — when does each win?",
    a: "ArrayList is backed by a dynamic array: O(1) random access by index, cache-friendly, but O(n) inserts/removes in the middle (shifting). LinkedList is a doubly-linked list: O(1) insert/remove at known nodes/ends but O(n) random access and poor cache locality with per-node overhead. In practice ArrayList wins for almost all workloads; LinkedList is mostly justified as a Deque/queue.",
    keyPoints: [
      "ArrayList: fast index access, contiguous memory.",
      "LinkedList: cheap ends, expensive indexing, more memory.",
      "Default to ArrayList; use ArrayDeque over LinkedList for queues.",
    ],
  },
  {
    id: "col-5", topic: "collections", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "HashMap vs Hashtable vs ConcurrentHashMap.",
    a: "HashMap: unsynchronized, allows one null key and null values, fastest single-threaded. Hashtable: legacy, fully synchronized on every method (coarse lock → poor concurrency), no nulls — effectively deprecated in favour of ConcurrentHashMap. ConcurrentHashMap: high-concurrency, fine-grained locking/CAS, no nulls, weakly-consistent iterators. For shared maps, always reach for ConcurrentHashMap.",
    keyPoints: [
      "HashMap: not thread-safe, allows nulls.",
      "Hashtable: legacy, whole-object lock, no nulls.",
      "ConcurrentHashMap: scalable, no nulls — modern choice.",
    ],
  },
  {
    id: "col-6", topic: "collections", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "How does HashSet work internally?",
    a: "HashSet is backed by a HashMap: each element is stored as a key with a shared dummy PRESENT object as the value. add() delegates to map.put(e, PRESENT), so uniqueness, hashing, and bucket behaviour are exactly HashMap's. That's why elements need proper equals/hashCode and ordering is unspecified.",
    keyPoints: [
      "HashSet wraps a HashMap (value is a constant PRESENT).",
      "Relies on element equals/hashCode for uniqueness.",
      "LinkedHashSet preserves insertion order; TreeSet sorts.",
    ],
  },
  {
    id: "col-7", topic: "collections", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Comparable vs Comparator — and a gotcha with sorting.",
    a: "Comparable defines the class's NATURAL ordering via compareTo() (one ordering, implemented by the class itself). Comparator is an external strategy via compare() — you can define many orderings without touching the class, and compose them with thenComparing/reversed. Gotcha: an inconsistent-with-equals comparator (e.g. comparing only one field) can cause TreeSet/TreeMap to drop 'equal-by-comparator' elements that are not equals-equal.",
    keyPoints: [
      "Comparable = natural order (compareTo); Comparator = external (compare).",
      "Comparator.comparing().thenComparing().reversed() for composition.",
      "TreeSet/TreeMap use the comparator for equality, not equals().",
    ],
  },
  {
    id: "col-8", topic: "collections", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "How does TreeMap order entries and what's its complexity?",
    a: "TreeMap is a red-black (self-balancing BST) tree, keeping keys sorted by natural order or a supplied Comparator. get/put/remove are O(log n). It supports navigation (floorKey, ceilingKey, headMap, subMap) which HashMap can't. Keys must be mutually comparable; null keys aren't allowed (a comparison would NPE).",
    keyPoints: [
      "Red-black tree, sorted keys, O(log n) ops.",
      "NavigableMap methods: floor/ceiling/higher/lower/sub/head/tail.",
      "No null keys; needs consistent ordering.",
    ],
  },
  {
    id: "col-9", topic: "collections", difficulty: "hard", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Why can multithreaded use of plain HashMap corrupt it (pre-Java 8 infinite loop)?",
    a: "HashMap isn't thread-safe. Concurrent puts during a resize could form a circular linked list in a bucket in Java 7, causing get() to spin in an infinite loop (100% CPU) — a notorious production incident pattern. Java 8 changed resize to preserve order and removed that specific loop, but concurrent modification still causes lost updates and data corruption. Use ConcurrentHashMap for shared access.",
    keyPoints: [
      "HashMap under concurrency → lost updates / corruption.",
      "Java 7 resize could create a cyclic bucket → CPU spin.",
      "Fix: ConcurrentHashMap (never synchronize a plain HashMap for scale).",
    ],
  },
  {
    id: "col-10", topic: "collections", difficulty: "easy", freq: "Common",
    companies: ["SERVICE"],
    q: "List vs Set vs Map — core differences.",
    a: "List is an ordered, index-accessible collection that allows duplicates (ArrayList, LinkedList). Set is an unordered (or specially-ordered) collection of unique elements (HashSet, TreeSet, LinkedHashSet). Map is a key→value association with unique keys (HashMap, TreeMap). Map is not part of the Collection hierarchy.",
    keyPoints: [
      "List: ordered, indexed, duplicates allowed.",
      "Set: uniqueness, no index.",
      "Map: key→value, keys unique; not a Collection.",
    ],
  },
  {
    id: "col-11", topic: "collections", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "What is CopyOnWriteArrayList and when would you use it?",
    a: "It's a thread-safe List where every mutation copies the entire underlying array. Reads are lock-free and never block; iterators see a stable snapshot and never throw ConcurrentModificationException. It's ideal for read-mostly, write-rarely scenarios — e.g. a list of event listeners/subscribers iterated frequently and modified seldom. Avoid it for write-heavy workloads (each write is O(n)).",
    keyPoints: [
      "Mutations copy the array → expensive writes, cheap reads.",
      "Snapshot iterators; no CME.",
      "Use for read-heavy, write-rare (listener lists, config).",
    ],
  },
  {
    id: "col-12", topic: "collections", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "ArrayDeque vs Stack vs LinkedList for a stack/queue.",
    a: "Prefer ArrayDeque for both stacks and queues: it's a resizable circular array, faster than LinkedList (cache-friendly, no node objects) and not synchronized. java.util.Stack is a legacy synchronized Vector subclass and is discouraged. LinkedList implements Deque too but has per-node overhead and poor locality. Effective Java explicitly recommends ArrayDeque over Stack.",
    keyPoints: [
      "ArrayDeque = preferred stack and queue.",
      "Stack/Vector are legacy + synchronized → avoid.",
      "ArrayDeque has no capacity-bound nulls allowed.",
    ],
  },
  {
    id: "col-13", topic: "collections", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "What is BlockingQueue and where is it used?",
    a: "A BlockingQueue is a thread-safe queue whose put() blocks when full and take() blocks when empty — the backbone of the producer–consumer pattern and thread pools. Implementations: ArrayBlockingQueue (bounded), LinkedBlockingQueue (optionally bounded), PriorityBlockingQueue, SynchronousQueue (hand-off, zero capacity), DelayQueue. ThreadPoolExecutor uses one to hold pending tasks.",
    keyPoints: [
      "Blocking put/take → built-in back-pressure.",
      "Foundation of producer-consumer and executors.",
      "Bounded queues prevent unbounded memory growth.",
    ],
  },
  {
    id: "col-14", topic: "collections", difficulty: "hard", freq: "Occasional",
    companies: ["PRODUCT", "BANK"],
    q: "How would you implement an LRU cache in Java?",
    a: "Use LinkedHashMap with accessOrder=true and override removeEldestEntry() to evict when size exceeds capacity — it maintains access order in O(1). For a thread-safe, high-throughput version, use a library (Caffeine/Guava) or combine a ConcurrentHashMap with a concurrent ordering structure. The interview answer is usually: LinkedHashMap(accessOrder) + removeEldestEntry.",
    keyPoints: [
      "LinkedHashMap with accessOrder=true tracks recency.",
      "Override removeEldestEntry for eviction.",
      "Production: Caffeine/Guava for concurrency + stats.",
    ],
    code: "new LinkedHashMap<K,V>(16, 0.75f, true){\n  protected boolean removeEldestEntry(Map.Entry<K,V> e){\n    return size() > CAPACITY;\n  }\n};",
  },
  {
    id: "col-15", topic: "collections", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "What is the load factor and why 0.75 by default?",
    a: "Load factor is the fullness threshold (size / capacity) at which a HashMap resizes. 0.75 is the default because it's a tuned trade-off: lower values waste space but reduce collisions; higher values save memory but increase collision chains and lookup cost. 0.75 gives good average O(1) behaviour while keeping memory reasonable.",
    keyPoints: [
      "Resize triggers at capacity × loadFactor.",
      "0.75 balances space vs collision probability.",
      "Sizing a map up front avoids repeated resizes.",
    ],
  },
  {
    id: "col-16", topic: "collections", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "How do you make a collection thread-safe or read-only?",
    a: "For read-only: Collections.unmodifiableList/Map/Set (a view that throws on mutation) or List.of()/Map.of() (truly immutable, Java 9+). For thread-safe legacy wrapping: Collections.synchronizedList/Map (coarse lock; you still must externally synchronize during iteration). For real concurrency prefer the java.util.concurrent types (ConcurrentHashMap, CopyOnWriteArrayList).",
    keyPoints: [
      "Immutable: List.of()/Map.of(); view: unmodifiableXxx.",
      "synchronizedXxx needs manual sync during iteration.",
      "Prefer java.util.concurrent for scalable thread safety.",
    ],
  },
  {
    id: "col-17", topic: "collections", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "What happens if two distinct keys have the same hashCode in a HashMap?",
    a: "They collide into the same bucket. The map then walks that bucket comparing with equals() — first hashCode narrows to a bucket, then equals() distinguishes keys within it. So both keys coexist; lookups just do a linear (or O(log n) tree) scan inside the bucket. A constant hashCode (e.g. returning 1) is legal but degrades the whole map to a single bucket — O(n) per operation. This is why hashCode should distribute well.",
    keyPoints: [
      "Same hash → same bucket; equals() separates keys within it.",
      "Both keys stored; only retrieval cost rises.",
      "Constant/poor hashCode → all collisions → O(n) lookups.",
      "Java 8 treeifies a bucket >8 nodes to O(log n).",
    ],
  },
  {
    id: "col-18", topic: "collections", difficulty: "hard", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Scenario: you iterate a List and call list.remove(x) inside the loop and get ConcurrentModificationException. Why, and how do you fix it?",
    a: "A for-each loop uses the list's Iterator, which checks modCount against expectedModCount on each next(); calling list.remove() bumps modCount behind the iterator's back, so it fails fast with ConcurrentModificationException. Fixes: (1) use Iterator explicitly and call iterator.remove(); (2) use removeIf(predicate) — the cleanest Java 8 way; (3) collect items to remove and removeAll afterward; or (4) iterate over a copy. Note CME can occur even single-threaded — it's about structural modification during iteration, not threads.",
    keyPoints: [
      "for-each = iterator + modCount check → CME on structural change.",
      "Fix: iterator.remove(), or removeIf(predicate) (preferred).",
      "CME is not thread-specific; it's modification-during-iteration.",
      "Iterating a copy or collecting-then-removeAll also works.",
    ],
    code: "// Cleanest:\nlist.removeIf(x -> x.isExpired());\n// Or explicit iterator:\nIterator<T> it = list.iterator();\nwhile (it.hasNext()) {\n  if (it.next().isExpired()) it.remove();\n}",
  },
  {
    id: "col-19", topic: "collections", difficulty: "hard", freq: "Very common",
    companies: ["BANK", "PRODUCT"],
    q: "Scenario: 'check-then-act' on ConcurrentHashMap (if (!map.containsKey(k)) map.put(k, v)) is racy. How do you fix it atomically?",
    a: "Even though ConcurrentHashMap is thread-safe per operation, a containsKey-then-put across two calls is NOT atomic — two threads can both see the key absent and both put. Use the atomic compound methods: putIfAbsent(k, v) (returns existing or null), computeIfAbsent(k, k -> expensiveCreate()) (atomically computes and stores only if absent — ideal for caches/memoization), or merge(k, v, remapping) for counters. These run the lambda under the bucket lock, so they're atomic and race-free.",
    keyPoints: [
      "Per-op thread-safety ≠ atomic compound (check-then-act) operations.",
      "Use putIfAbsent / computeIfAbsent / merge / compute.",
      "computeIfAbsent is the canonical thread-safe lazy-cache idiom.",
      "Don't do long/blocking work or recursive map updates inside the lambda.",
    ],
    code: "// Thread-safe lazy cache:\nValue v = map.computeIfAbsent(key, k -> load(k));\n// Thread-safe counter:\nmap.merge(word, 1L, Long::sum);",
  },
  {
    id: "col-20", topic: "collections", difficulty: "hard", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Scenario: you use a mutable object as a HashMap key and later mutate a field used in equals/hashCode. What goes wrong?",
    a: "The object was placed in a bucket based on its hashCode at insertion time. Mutating a field that feeds hashCode changes the computed bucket, but the entry physically stays in the old bucket. Now get(sameObject) computes the NEW bucket, finds nothing, and returns null — the value is 'lost' even though it's still in the map (and shows up in iteration). Lesson: keys must be immutable, or at least the fields used in equals/hashCode must never change while the object is a key. Prefer immutable keys (String, records, value objects).",
    keyPoints: [
      "Mutating key fields used in hashCode strands the entry in the old bucket.",
      "get() looks in the new bucket → returns null; entry still in iteration.",
      "Use immutable keys; records are ideal.",
      "Same risk applies to HashSet membership.",
    ],
  },
  {
    id: "col-21", topic: "collections", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "HashMap vs LinkedHashMap vs TreeMap — how do you choose?",
    a: "HashMap: no ordering guarantee, O(1) average get/put — the default. LinkedHashMap: maintains insertion order (or access order with accessOrder=true, enabling LRU caches) via a doubly-linked list across entries, still O(1), slight memory overhead. TreeMap: keeps keys sorted (natural order or Comparator), O(log n), and adds navigation (floor/ceiling/subMap). Choose HashMap unless you need predictable iteration order (LinkedHashMap) or sorting/range queries (TreeMap).",
    keyPoints: [
      "HashMap: fastest, no order.",
      "LinkedHashMap: insertion/access order; basis of LRU.",
      "TreeMap: sorted keys + navigation, O(log n).",
      "Pick by ordering/range needs, then performance.",
    ],
  },
  {
    id: "col-22", topic: "collections", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "How does the enhanced for-loop work, and what does Iterable/Iterator provide?",
    a: "The for-each loop is syntactic sugar: for (T x : coll) compiles to obtaining coll.iterator() and looping while hasNext()/next(). Any type implementing Iterable<T> (which returns an Iterator<T>) can be used. Iterator gives hasNext(), next(), and an optional remove(). Because it goes through the iterator, structural modification during a for-each triggers fail-fast CME; and you can't get the index or call remove() directly in a for-each.",
    keyPoints: [
      "for-each = sugar over iterator() + hasNext()/next().",
      "Implement Iterable to make a custom type for-each-able.",
      "No index access; remove only via Iterator.remove().",
    ],
  },
  {
    id: "col-23", topic: "collections", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "How does ArrayList grow internally, and what is its initial/grow capacity?",
    a: "ArrayList wraps an Object[]. A default (no-arg) list starts with an empty shared array and lazily allocates capacity 10 on the first add. When full, it grows by ~1.5x (newCap = oldCap + (oldCap >> 1)), copying the old array into a bigger one via Arrays.copyOf — an O(n) operation, but amortized O(1) per add. If you know the size, pass an initial capacity to avoid repeated resizes/copies. ensureCapacity() can pre-size before a bulk add.",
    keyPoints: [
      "Backed by Object[]; default capacity 10 (lazy).",
      "Grows ~1.5x with Arrays.copyOf (O(n) copy, amortized O(1) add).",
      "Pre-size with new ArrayList<>(n) or ensureCapacity for bulk inserts.",
    ],
  },
  {
    id: "col-24", topic: "collections", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Scenario: Collections.synchronizedList is 'thread-safe', yet iterating it throws CME. Why?",
    a: "synchronizedList wraps each method (add, get, remove) in a synchronized block, so individual operations are atomic. But iteration is a sequence of separate next() calls — another thread can modify the list between them, triggering fail-fast CME. The Javadoc explicitly says you MUST manually synchronize on the list while iterating. For real concurrent iteration without external locking, use CopyOnWriteArrayList (snapshot iterator) or a concurrent collection.",
    keyPoints: [
      "Per-method locking ≠ atomic iteration.",
      "Must synchronized(list){ for(...) } during iteration.",
      "CopyOnWriteArrayList / concurrent collections avoid the manual lock.",
    ],
    code: "List<T> sync = Collections.synchronizedList(new ArrayList<>());\nsynchronized (sync) {        // required during iteration\n  for (T t : sync) { ... }\n}",
  },
  {
    id: "col-25", topic: "collections", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Iterator vs ListIterator — what extra does ListIterator give?",
    a: "Iterator is forward-only with hasNext/next/remove and works on any Collection. ListIterator (Lists only) is bidirectional — hasPrevious/previous — exposes nextIndex/previousIndex, and can set(e) (replace the last returned element) and add(e) (insert at the cursor) in addition to remove(). Use ListIterator when you need to traverse backward or modify a list in place during traversal.",
    keyPoints: [
      "Iterator: forward-only, any collection.",
      "ListIterator: bidirectional, index-aware, set/add/remove.",
      "Only lists provide a ListIterator.",
    ],
  },
  {
    id: "col-26", topic: "collections", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "What is a PriorityQueue and how is it ordered?",
    a: "PriorityQueue is an unbounded queue backed by a binary min-heap; the head is always the least element by natural order or a supplied Comparator. offer/poll are O(log n), peek is O(1). It is NOT sorted overall — only the head is guaranteed; iteration order is arbitrary. It's used for scheduling, Dijkstra/A*, top-K problems (use a bounded max-heap of size k), and merging sorted streams. Not thread-safe — use PriorityBlockingQueue for concurrency.",
    keyPoints: [
      "Binary heap; head = smallest (or per Comparator).",
      "offer/poll O(log n), peek O(1); iteration order undefined.",
      "Top-K: keep a size-k heap; use PriorityBlockingQueue if concurrent.",
    ],
  },
  {
    id: "col-27", topic: "collections", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Difference between Collection and Collections.",
    a: "Collection (singular) is the root interface of the collection hierarchy (List/Set/Queue extend it) defining add/remove/size/iterator etc. Collections (plural) is a utility class of static helper methods — sort, reverse, shuffle, min/max, binarySearch, unmodifiableXxx, synchronizedXxx, emptyList, singletonList. Don't confuse them; a common phone-screen 'gotcha' question.",
    keyPoints: [
      "Collection = root interface.",
      "Collections = static utility methods class.",
      "Similar: Map (interface) vs no — Map isn't under Collection.",
    ],
  },
  {
    id: "col-28", topic: "collections", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Why don't Java collections store primitives, and what is autoboxing's cost?",
    a: "Generics work only with reference types (due to type erasure), so List<int> is illegal — you use List<Integer>. Java autoboxes int↔Integer automatically. The cost: each boxed Integer is a heap object (more memory + GC pressure), and unboxing a null Integer throws NPE. For performance-critical numeric work, prefer primitive arrays (int[]) or specialized streams (IntStream) or libraries like Eclipse Collections/fastutil with primitive collections.",
    keyPoints: [
      "Generics need reference types → use wrappers (Integer, Long).",
      "Autoboxing adds heap objects + GC; null unbox → NPE.",
      "Hot numeric paths: int[], IntStream, primitive-collection libs.",
    ],
  },
  {
    id: "col-29", topic: "collections", difficulty: "hard", freq: "Occasional",
    companies: ["BANK", "PRODUCT"],
    q: "Scenario: design a thread-safe, bounded, in-memory counter of events per key under high concurrency. What do you use?",
    a: "Use ConcurrentHashMap with a value of LongAdder (or AtomicLong) and merge/computeIfAbsent: map.computeIfAbsent(key, k -> new LongAdder()).increment(). LongAdder beats AtomicLong under high contention because it stripes the count across cells, reducing CAS retries (you trade exact-instant reads for throughput). Avoid map.merge(k,1L,Long::sum) at extreme contention since it locks the bucket; LongAdder lets concurrent increments on the same key scale. Bound memory by capping keys or evicting (Caffeine).",
    keyPoints: [
      "ConcurrentHashMap<K, LongAdder> + computeIfAbsent.",
      "LongAdder > AtomicLong under heavy write contention (striping).",
      "merge(...) is fine at low contention; LongAdder scales better.",
      "Cap/evict keys to keep it bounded (Caffeine/size limit).",
    ],
    code: "ConcurrentHashMap<String, LongAdder> counts = new ConcurrentHashMap<>();\ncounts.computeIfAbsent(key, k -> new LongAdder()).increment();\nlong total = counts.get(key).sum();",
  },
  {
    id: "col-30", topic: "collections", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "How do you remove duplicates from a List while preserving insertion order?",
    a: "Wrap it in a LinkedHashSet: new ArrayList<>(new LinkedHashSet<>(list)) — the set dedupes by equals/hashCode while LinkedHashSet keeps first-seen order. With streams: list.stream().distinct().collect(toList()) (distinct() also preserves encounter order for ordered streams). If you need to dedupe by a specific field rather than whole-object equals, use a stream with a 'seen' set filter or toMap keyed by that field.",
    keyPoints: [
      "LinkedHashSet preserves first-seen order while deduping.",
      "Streams: .distinct() (order-preserving for ordered streams).",
      "Dedupe by field: filter(seen::add) or toMap(field, ...).",
    ],
    code: "// Preserve order:\nList<T> unique = new ArrayList<>(new LinkedHashSet<>(list));\n// Dedupe by a field:\nlist.stream().filter(e -> seen.add(e.getId())).collect(toList());",
  },

  // ===================== CONCURRENCY =====================
  {
    id: "con-1", topic: "concurrency", difficulty: "easy", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Process vs thread, and the thread lifecycle states.",
    a: "A process is an independent program with its own memory space; a thread is a lightweight unit of execution within a process sharing that memory. Java thread states: NEW (created, not started), RUNNABLE (eligible/running), BLOCKED (waiting for a monitor lock), WAITING (indefinite wait via wait()/join()/park()), TIMED_WAITING (timed sleep/wait), and TERMINATED.",
    keyPoints: [
      "Threads share heap; each has its own stack.",
      "6 states: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED.",
      "BLOCKED = lock contention; WAITING = explicit coordination.",
    ],
  },
  {
    id: "con-2", topic: "concurrency", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Runnable vs Callable vs Thread — how do you create threads, and which do you prefer?",
    a: "Extending Thread couples your logic to a thread and burns your single inheritance — avoid it. Implementing Runnable (run, returns void) or Callable (call, returns a value and can throw checked exceptions) is preferred and is submitted to an ExecutorService. In modern code you almost never create raw Threads; you submit tasks to a pool and get a Future (or CompletableFuture) back.",
    keyPoints: [
      "Prefer Runnable/Callable + ExecutorService over raw Thread.",
      "Callable returns a value + throws checked; Runnable doesn't.",
      "Submitting returns a Future for the result.",
    ],
  },
  {
    id: "con-3", topic: "concurrency", difficulty: "hard", freq: "Very common",
    companies: ["BANK", "PRODUCT"],
    q: "Explain the Java Memory Model and the happens-before relationship.",
    a: "The JMM defines when a write by one thread becomes visible to a read by another. Without synchronization, threads may see stale values due to CPU caches and compiler/JIT reordering. 'Happens-before' is the ordering guarantee: if action A happens-before B, A's effects are visible to B. Key edges: unlock→lock on the same monitor, volatile write→subsequent read, Thread.start()→the thread's actions, a thread's actions→another's join(), and final-field initialisation visibility.",
    keyPoints: [
      "JMM governs visibility + ordering across threads.",
      "happens-before edges: lock/unlock, volatile, start/join, final.",
      "Reordering is legal until a happens-before edge forbids it.",
    ],
  },
  {
    id: "con-4", topic: "concurrency", difficulty: "medium", freq: "Very common",
    companies: ["BANK", "PRODUCT"],
    q: "volatile vs synchronized — what each guarantees.",
    a: "volatile guarantees VISIBILITY and ordering for a single variable (reads/writes go to main memory, no caching, no reordering across the access) but provides NO atomicity for compound actions (count++ is still racy). synchronized provides both MUTUAL EXCLUSION (atomicity for the block) and visibility (via the happens-before of unlock→lock). Use volatile for simple flags/publishing; synchronized (or locks/atomics) for compound state changes.",
    keyPoints: [
      "volatile: visibility + ordering, no atomicity.",
      "synchronized: atomicity + visibility, but blocking.",
      "count++ needs synchronized/AtomicInteger, not volatile.",
    ],
  },
  {
    id: "con-5", topic: "concurrency", difficulty: "hard", freq: "Very common",
    companies: ["BANK", "PRODUCT"],
    q: "What is a deadlock, and how do you prevent/detect it?",
    a: "Deadlock: two+ threads each hold a lock the other needs, so all block forever. It needs all four Coffman conditions: mutual exclusion, hold-and-wait, no preemption, and circular wait. Prevention: impose a global lock-ordering (always acquire A before B), use tryLock with timeouts to back off, reduce lock scope, or use lock-free structures. Detect via thread dumps (jstack shows 'Found one Java-level deadlock').",
    keyPoints: [
      "Break circular wait with a consistent lock ordering.",
      "tryLock(timeout) lets threads back off and retry.",
      "Diagnose with jstack / thread dump.",
    ],
  },
  {
    id: "con-6", topic: "concurrency", difficulty: "medium", freq: "Very common",
    companies: ["BANK", "PRODUCT"],
    q: "wait()/notify()/notifyAll() — rules and why they're on Object.",
    a: "They coordinate threads around a shared monitor and must be called while HOLDING that object's lock (inside synchronized), else IllegalMonitorStateException. wait() releases the lock and parks the thread until notify; notify() wakes one waiter, notifyAll() wakes all. They're on Object because every object can be a monitor. Always wait in a loop checking a condition (guard against spurious wakeups).",
    keyPoints: [
      "Call inside synchronized on the same monitor.",
      "wait() releases the lock; notify/notifyAll wake waiters.",
      "Always while(condition) wait(); — spurious wakeups.",
    ],
    code: "synchronized(lock){\n  while(!ready) lock.wait();   // guard against spurious wakeups\n  consume();\n}",
  },
  {
    id: "con-7", topic: "concurrency", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "ReentrantLock vs synchronized — when use the explicit Lock?",
    a: "synchronized is simpler, JVM-managed, auto-released on exit/exception. ReentrantLock adds capabilities: tryLock() (non-blocking / timed) to avoid deadlock, lockInterruptibly(), fairness policy, and multiple Condition objects for fine-grained signalling. The cost is you must unlock() in a finally. Use ReentrantLock when you need those features; otherwise prefer synchronized.",
    keyPoints: [
      "ReentrantLock: tryLock, timeout, interruptible, fairness, Conditions.",
      "Must unlock() in finally.",
      "Both are reentrant; synchronized is simpler/safer by default.",
    ],
  },
  {
    id: "con-8", topic: "concurrency", difficulty: "hard", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "How does AtomicInteger work? What is CAS?",
    a: "Atomic classes provide lock-free, thread-safe operations using CAS (Compare-And-Swap) — a CPU instruction that atomically sets a value only if it still equals an expected value, retrying in a loop on failure. This avoids lock overhead and is non-blocking. The catch is the ABA problem (value goes A→B→A undetected) — solved with AtomicStampedReference. Under very high contention CAS can spin; LongAdder reduces this with striping.",
    keyPoints: [
      "CAS = atomic compare-and-set, lock-free retry loop.",
      "Avoids locking; non-blocking; basis of java.util.concurrent.atomic.",
      "ABA problem → AtomicStampedReference; contention → LongAdder.",
    ],
  },
  {
    id: "con-9", topic: "concurrency", difficulty: "medium", freq: "Very common",
    companies: ["BANK", "PRODUCT"],
    q: "Why use a thread pool / ExecutorService instead of new Thread()?",
    a: "Creating a thread per task is expensive (each platform thread is ~1MB stack + OS scheduling) and unbounded thread creation can exhaust memory. A pool reuses a fixed set of worker threads, queues tasks, bounds resource usage, and gives you lifecycle control (shutdown), Futures, and back-pressure. Configure via ThreadPoolExecutor (core/max pool size, queue, rejection policy) rather than the convenience Executors factory in production.",
    keyPoints: [
      "Reuse threads → less creation cost, bounded resources.",
      "Returns Futures, supports graceful shutdown.",
      "Prefer explicit ThreadPoolExecutor config (queue + rejection policy).",
    ],
  },
  {
    id: "con-10", topic: "concurrency", difficulty: "hard", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Explain ThreadPoolExecutor parameters: core, max, queue, keepAlive, rejection.",
    a: "corePoolSize threads are kept alive; tasks beyond that queue in the workQueue; only when the queue is full are new threads created up to maximumPoolSize; idle non-core threads die after keepAliveTime. If both pool and queue are saturated, the RejectedExecutionHandler fires (Abort/CallerRuns/Discard/DiscardOldest). A subtle gotcha: an unbounded queue means max pool size is never reached — tasks just pile up in memory.",
    keyPoints: [
      "Order: core → queue → up to max → reject.",
      "Unbounded queue ⇒ maximumPoolSize ignored (memory risk).",
      "RejectedExecutionHandler: CallerRunsPolicy gives natural back-pressure.",
    ],
  },
  {
    id: "con-11", topic: "concurrency", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "How do you ensure thread T2 runs after T1, and T3 after T2?",
    a: "Use Thread.join(): start T1, call t1.join() (blocks until T1 finishes), then start T2 and t2.join(), then T3 — this sequences them. join() establishes a happens-before edge so T1's writes are visible afterward. (A classic investment-bank phone-screen question.) Alternatively use a CountDownLatch or CompletableFuture chaining for the same ordering with more flexibility.",
    keyPoints: [
      "join() blocks the caller until the target finishes.",
      "Establishes happens-before (visibility) too.",
      "Alternatives: CountDownLatch, CompletableFuture.thenRun.",
    ],
  },
  {
    id: "con-12", topic: "concurrency", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "CountDownLatch vs CyclicBarrier vs Semaphore.",
    a: "CountDownLatch: one-shot — threads await() until a count reaches zero (e.g. wait for N services to start). Not reusable. CyclicBarrier: N threads wait for each other at a barrier point, then all proceed; it resets and is reusable, and can run a barrier action. Semaphore: maintains a set of permits to limit concurrent access to a resource (e.g. throttle DB connections to 10).",
    keyPoints: [
      "Latch: one-time gate, count down to zero.",
      "Barrier: reusable rendezvous for a fixed party.",
      "Semaphore: permit-based throttling/resource limiting.",
    ],
  },
  {
    id: "con-13", topic: "concurrency", difficulty: "hard", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "What is the double-checked locking idiom and why is volatile mandatory?",
    a: "DCL lazily initialises a singleton: check instance==null without a lock, then synchronize, then check again before creating. Without volatile on the instance field, another thread can see a non-null but partially-constructed object because object construction and the reference assignment can be reordered. volatile forbids that reordering and guarantees visibility, making DCL correct.",
    keyPoints: [
      "Two null-checks: one lock-free, one inside synchronized.",
      "volatile prevents seeing a half-built object (reordering).",
      "Holder idiom is a simpler alternative.",
    ],
    code: "private static volatile Service inst;\nstatic Service get(){\n  if(inst==null){\n    synchronized(Service.class){\n      if(inst==null) inst = new Service();\n    }\n  }\n  return inst;\n}",
  },
  {
    id: "con-14", topic: "concurrency", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "What is a ThreadLocal and a common pitfall with thread pools?",
    a: "ThreadLocal gives each thread its own independent copy of a variable — useful for per-request context (user, transaction, SimpleDateFormat which isn't thread-safe). Pitfall: in a thread pool threads are reused, so a value left in a ThreadLocal leaks into the next task and can also cause a memory leak (the entry survives as long as the thread does). Always remove() in a finally.",
    keyPoints: [
      "Per-thread isolated value; great for non-thread-safe helpers.",
      "Pooled threads are reused → stale values + memory leaks.",
      "Always ThreadLocal.remove() after use.",
    ],
  },
  {
    id: "con-15", topic: "concurrency", difficulty: "hard", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Race condition vs deadlock vs livelock vs starvation.",
    a: "Race condition: outcome depends on unsynchronized interleaving (e.g. lost updates on count++). Deadlock: threads block forever waiting on each other's locks. Livelock: threads aren't blocked but keep reacting to each other and make no progress (two people stepping aside in a corridor). Starvation: a thread never gets CPU/lock because others (often higher priority or unfair locks) monopolise it.",
    keyPoints: [
      "Race: missing synchronization → wrong result.",
      "Deadlock: stuck; Livelock: busy but no progress.",
      "Starvation: perpetually denied resources (fairness fixes it).",
    ],
  },
  {
    id: "con-16", topic: "concurrency", difficulty: "hard", freq: "Very common",
    companies: ["BANK", "PRODUCT"],
    q: "What are virtual threads (Project Loom, Java 21) and when do they help?",
    a: "Virtual threads are lightweight threads managed by the JVM, not the OS — millions can run on a small pool of carrier (platform) threads. When a virtual thread blocks on I/O, the JVM unmounts it from its carrier so the carrier serves others, giving thread-per-request code the scalability of async without callbacks. They shine for I/O-bound, high-concurrency workloads (web/microservice request handling); they do NOT speed up CPU-bound work. Avoid pinning (e.g. long synchronized blocks holding the carrier).",
    keyPoints: [
      "JVM-managed, cheap, millions of them; unmounted on blocking I/O.",
      "Win for I/O-bound concurrency; no benefit for CPU-bound.",
      "Watch out for pinning inside synchronized/native frames.",
      "Use Executors.newVirtualThreadPerTaskExecutor().",
    ],
  },
  {
    id: "con-17", topic: "concurrency", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "What is CompletableFuture and why is it better than Future?",
    a: "Future only lets you block on get() — you can't compose or react. CompletableFuture is a non-blocking, composable promise: chain with thenApply/thenCompose, combine with thenCombine/allOf/anyOf, handle errors with exceptionally/handle, and run stages on a chosen Executor. It enables clean asynchronous pipelines (e.g. call two services in parallel and merge) without manual thread management.",
    keyPoints: [
      "Composable + non-blocking vs Future's blocking get().",
      "thenApply/thenCompose/thenCombine; allOf/anyOf; exceptionally/handle.",
      "Specify an Executor to control which pool runs stages.",
    ],
  },
  {
    id: "con-18", topic: "concurrency", difficulty: "hard", freq: "Occasional",
    companies: ["BANK", "PRODUCT"],
    q: "ReadWriteLock / StampedLock — what problem do they solve?",
    a: "ReentrantReadWriteLock allows many concurrent readers but exclusive writers — better throughput than a plain lock for read-heavy data. StampedLock (Java 8) adds an optimistic-read mode: you read without acquiring a lock, then validate the stamp; if a write occurred you fall back to a real read lock. StampedLock is faster but not reentrant and trickier to use correctly.",
    keyPoints: [
      "RWLock: concurrent reads, exclusive writes.",
      "StampedLock optimistic read = lock-free fast path + validation.",
      "StampedLock not reentrant; validate stamps carefully.",
    ],
  },
  {
    id: "con-19", topic: "concurrency", difficulty: "medium", freq: "Common",
    companies: ["BANK"],
    q: "Difference between wait() and sleep().",
    a: "wait() is on Object, must be called holding the monitor, and RELEASES the lock while waiting (woken by notify). sleep() is a static Thread method, pauses the current thread for a duration, and does NOT release any held locks. wait is for inter-thread coordination; sleep is just a timed pause.",
    keyPoints: [
      "wait(): Object, releases lock, needs notify.",
      "sleep(): Thread (static), keeps locks, timed.",
      "Both can throw InterruptedException.",
    ],
  },
  {
    id: "con-20", topic: "concurrency", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "How do you stop a thread gracefully? Why is Thread.stop() deprecated?",
    a: "Thread.stop() is unsafe — it kills the thread at an arbitrary point, releasing locks and leaving shared state corrupted. The correct pattern is cooperative cancellation: use interrupt(), and have the thread check Thread.interrupted()/handle InterruptedException and exit cleanly, or poll a volatile boolean flag. Blocking calls throw InterruptedException so you can unwind safely.",
    keyPoints: [
      "stop()/suspend() corrupt state → deprecated.",
      "Use interrupt() + check interrupt status / handle InterruptedException.",
      "Or a volatile 'running' flag the loop checks.",
    ],
  },
  {
    id: "con-21", topic: "concurrency", difficulty: "hard", freq: "Occasional",
    companies: ["PRODUCT", "BANK"],
    q: "Implement a thread-safe counter three different ways.",
    a: "1) synchronized method/block around count++ (simple, blocking). 2) AtomicInteger.incrementAndGet() (lock-free CAS, scales better under moderate contention). 3) LongAdder (striped cells summed on read — best under HIGH write contention, but reads are slightly costlier). The interviewer wants you to reason about contention: atomics/LongAdder beat locks for hot counters.",
    keyPoints: [
      "synchronized, AtomicInteger (CAS), or LongAdder.",
      "LongAdder wins under heavy contention.",
      "Pick based on read/write ratio and contention.",
    ],
  },
  {
    id: "con-22", topic: "concurrency", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "What does the synchronized keyword lock on — instance vs static methods?",
    a: "A synchronized instance method locks on 'this' (the instance monitor); a synchronized static method locks on the Class object (e.g. MyClass.class). So two threads can run an instance-synchronized method on different objects concurrently, and an instance lock and a static lock are independent monitors — a common subtle bug when you assume one guards the other.",
    keyPoints: [
      "Instance method → locks 'this'.",
      "Static method → locks the Class object.",
      "Different instances/locks ⇒ no mutual exclusion.",
    ],
  },

  // ===================== EXCEPTIONS =====================
  {
    id: "exc-1", topic: "exceptions", difficulty: "easy", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Checked vs unchecked exceptions — and your stance on each.",
    a: "Checked exceptions extend Exception (not RuntimeException) and must be declared or handled — meant for recoverable conditions (IOException). Unchecked extend RuntimeException — programming errors/illegal states (NullPointerException, IllegalArgumentException) you typically don't force callers to catch. Modern practice leans toward unchecked for most application errors (checked exceptions don't compose well with streams/lambdas), wrapping low-level checked ones into domain runtime exceptions.",
    keyPoints: [
      "Checked = compiler-enforced, recoverable; unchecked = bugs/illegal state.",
      "Errors (OutOfMemoryError) are not meant to be caught.",
      "Lambdas/streams can't throw checked exceptions cleanly.",
    ],
  },
  {
    id: "exc-2", topic: "exceptions", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Explain try-with-resources and how it differs from try-finally.",
    a: "try-with-resources auto-closes any resource implementing AutoCloseable at the end of the block, in reverse order of opening, even on exception — eliminating leak-prone finally blocks. Crucially it handles SUPPRESSED exceptions: if both the body and close() throw, the body's exception propagates and close()'s is attached via getSuppressed() (with plain try-finally, the finally's exception would mask the original).",
    keyPoints: [
      "Auto-closes AutoCloseable resources, reverse order.",
      "Preserves the primary exception; close() exceptions become 'suppressed'.",
      "Cleaner and safer than manual finally.",
    ],
  },
  {
    id: "exc-3", topic: "exceptions", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "What is exception chaining and why use it?",
    a: "Chaining wraps a low-level cause inside a higher-level exception (new ServiceException(\"...\", cause)) so you raise a meaningful abstraction without losing the original stack trace. The cause is retrievable via getCause(). This keeps layers decoupled (callers handle ServiceException, not SQLException) while preserving full diagnostics.",
    keyPoints: [
      "Wrap cause to abstract the layer but keep the trace.",
      "Retrieve with getCause(); printStackTrace shows 'Caused by'.",
      "Avoid swallowing exceptions (no empty catch).",
    ],
  },
  {
    id: "exc-4", topic: "exceptions", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "What happens if you return inside try and also have a finally with return?",
    a: "finally always runs (except System.exit/JVM crash). If finally has its own return, it OVERRIDES the try/catch return — and even swallows a thrown exception, which is a serious anti-pattern. A return value computed in try is captured before finally runs, so mutating a variable in finally won't change an already-evaluated return unless finally itself returns.",
    keyPoints: [
      "finally runs even after return/throw.",
      "return in finally overrides and can swallow exceptions — avoid.",
      "Don't put control-flow returns in finally.",
    ],
  },
  {
    id: "exc-5", topic: "exceptions", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Difference between throw and throws; final, finally, finalize.",
    a: "throw actually raises an exception instance; throws declares in a method signature which checked exceptions it may propagate. Unrelated trio: final makes a variable/method/class unchangeable; finally is the always-executed cleanup block; finalize() was a deprecated GC callback (removed/deprecated for removal — use try-with-resources/Cleaner instead).",
    keyPoints: [
      "throw = raise now; throws = declare possible.",
      "final/finally/finalize are unrelated despite the names.",
      "finalize() is dead — use AutoCloseable/Cleaner.",
    ],
  },
  {
    id: "exc-6", topic: "exceptions", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Multi-catch and the rules around catching multiple exceptions.",
    a: "Multi-catch (Java 7+) lets one block handle several types: catch(IOException | SQLException e). The caught variable is effectively final and you can't list types in a subclass/superclass relationship (that's redundant). Order matters in separate catches — more specific must come before more general, or you get an 'already caught' compile error.",
    keyPoints: [
      "catch(A | B e) — variable is implicitly final.",
      "Can't multi-catch parent+child together.",
      "Order catches specific → general.",
    ],
  },
  {
    id: "exc-7", topic: "exceptions", difficulty: "hard", freq: "Occasional",
    companies: ["BANK", "PRODUCT"],
    q: "Best practices for exception handling in a layered backend service.",
    a: "Throw exceptions for exceptional conditions only (not control flow); fail fast with validation; wrap and translate low-level exceptions into domain ones at boundaries; never swallow (log + rethrow or handle); preserve the cause; include context in the message (not sensitive data); use a centralized handler (e.g. @ControllerAdvice) to map exceptions to responses; and prefer specific exceptions over catching Exception/Throwable.",
    keyPoints: [
      "Translate at layer boundaries; preserve cause.",
      "Centralize mapping (@ControllerAdvice) → consistent API errors.",
      "Never log-and-rethrow the same exception twice (noise).",
    ],
  },
  {
    id: "exc-8", topic: "exceptions", difficulty: "easy", freq: "Common",
    companies: ["SERVICE"],
    q: "Can you catch an Error? Should you?",
    a: "Technically yes — Error is a Throwable — but you generally shouldn't. Errors (OutOfMemoryError, StackOverflowError) signal serious JVM-level problems your app can't sensibly recover from; catching them often masks fatal issues. The one defensible case is a top-level handler that logs and fails the request/shuts down cleanly.",
    keyPoints: [
      "Errors are catchable but usually unrecoverable.",
      "Don't catch to 'continue'; at most log and bail.",
      "Catch Exception, not Throwable, in normal code.",
    ],
  },

  // ===================== JAVA 8 / FUNCTIONAL =====================
  {
    id: "j8-1", topic: "java8", difficulty: "easy", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "What is a functional interface and what are the built-in ones?",
    a: "A functional interface has exactly one abstract method (SAM), so it can be a lambda/method-reference target; @FunctionalInterface enforces this. Core ones in java.util.function: Function<T,R> (apply), Predicate<T> (test), Consumer<T> (accept), Supplier<T> (get), and the binary/bi variants (BiFunction, BinaryOperator, etc.). Default and static methods don't count against the single-abstract-method rule.",
    keyPoints: [
      "Exactly one abstract method (SAM).",
      "Function/Predicate/Consumer/Supplier + Bi-/Unary-/Binary- variants.",
      "@FunctionalInterface is optional but enforces the contract.",
    ],
  },
  {
    id: "j8-2", topic: "java8", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Explain intermediate vs terminal stream operations and laziness.",
    a: "Intermediate operations (filter, map, sorted, distinct) return a new stream and are LAZY — they build a pipeline but do nothing until a terminal operation (collect, forEach, reduce, count, findFirst) triggers execution. Laziness enables fusion (elements flow one at a time through the chain) and short-circuiting (findFirst/limit stop early). A stream is single-use — reusing it throws IllegalStateException.",
    keyPoints: [
      "Intermediate = lazy, returns a stream; terminal = eager, triggers.",
      "Pipeline fuses operations; supports short-circuiting.",
      "Streams are one-shot.",
    ],
  },
  {
    id: "j8-3", topic: "java8", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "map vs flatMap — with an example.",
    a: "map applies a 1-to-1 transform (Stream<String> → Stream<Integer> of lengths). flatMap applies a 1-to-many transform and FLATTENS the resulting streams into one — e.g. List<List<Order>> → Stream<Order>, or splitting lines into words. Use flatMap whenever each element expands into multiple elements or an Optional/stream you need flattened.",
    keyPoints: [
      "map: T → R (one out per in).",
      "flatMap: T → Stream<R>, flattened into a single stream.",
      "Use flatMap to un-nest collections/optionals.",
    ],
    code: "List<Order> all = customers.stream()\n  .flatMap(c -> c.getOrders().stream())\n  .collect(Collectors.toList());",
  },
  {
    id: "j8-4", topic: "java8", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "What is Optional and how should you use it correctly?",
    a: "Optional is a container that may or may not hold a value, used to model 'no result' explicitly and avoid NPEs at API boundaries (especially return types). Use map/filter/flatMap to chain, and orElse/orElseGet/orElseThrow to extract. Anti-patterns: calling get() without checking, using Optional for fields or method parameters, or returning null from a method that returns Optional. Prefer orElseGet over orElse for expensive defaults.",
    keyPoints: [
      "Model absence on return types; not for fields/params.",
      "map/flatMap/filter to compose; orElseThrow/orElseGet to unwrap.",
      "Never .get() blindly; never return null Optional.",
    ],
  },
  {
    id: "j8-5", topic: "java8", difficulty: "hard", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "How does Collectors.groupingBy work, including downstream collectors?",
    a: "groupingBy partitions a stream into a Map keyed by a classifier function. A second 'downstream' collector aggregates each group — e.g. groupingBy(Order::getStatus, counting()), or groupingBy(Emp::getDept, summingDouble(Emp::getSalary)), or a mapping/filtering downstream. You can nest groupingBy for multi-level grouping and supply a map factory (e.g. TreeMap) for ordering.",
    keyPoints: [
      "Classifier → Map<K, List<T>> by default.",
      "Downstream collector aggregates per group (counting, mapping, summing).",
      "Nest groupingBy for multi-level grouping.",
    ],
    code: "Map<Dept, Long> headcount = emps.stream()\n  .collect(groupingBy(Emp::dept, counting()));",
  },
  {
    id: "j8-6", topic: "java8", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "reduce() — explain identity, accumulator, combiner.",
    a: "reduce folds a stream to a single value. The three-arg form takes an identity (initial/neutral value), an accumulator (combine partial result + element), and a combiner (merge partial results from parallel sub-streams). The combiner only matters for parallel streams; for sequential streams it's unused. The identity must be a true neutral element (e.g. 0 for sum) for correctness in parallel.",
    keyPoints: [
      "identity = neutral start; accumulator folds elements.",
      "combiner merges partials in parallel execution.",
      "Use specialized sum()/average() on IntStream when possible.",
    ],
  },
  {
    id: "j8-7", topic: "java8", difficulty: "hard", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "When do parallel streams help, and when do they hurt?",
    a: "Parallel streams split work across the common ForkJoinPool. They help for large datasets with CPU-bound, stateless, associative operations and cheap-to-split sources (arrays, ArrayList). They HURT for small data, I/O-bound work, ordered/stateful ops, or sources that split poorly (LinkedList) — and they share the common pool, so blocking tasks can starve the whole app. Measure before using; don't parallelize by default.",
    keyPoints: [
      "Good: big, CPU-bound, stateless, splittable, associative.",
      "Bad: small data, I/O, ordered/stateful, shared common pool.",
      "Blocking in parallel streams can starve the common ForkJoinPool.",
    ],
  },
  {
    id: "j8-8", topic: "java8", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Method references — the four kinds.",
    a: "Shorthand for lambdas: (1) static — ClassName::staticMethod, (2) instance method of a particular object — obj::method, (3) instance method of an arbitrary object of a type — String::toLowerCase (the receiver is the first param), and (4) constructor — ClassName::new. They make stream pipelines read like English.",
    keyPoints: [
      "Static, bound-instance, unbound-instance, constructor.",
      "String::length is an unbound instance ref.",
      "Use only when it's clearer than the lambda.",
    ],
  },
  {
    id: "j8-9", topic: "java8", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "What is the effectively-final rule for lambdas?",
    a: "A lambda (or anonymous class) can only capture local variables that are final or 'effectively final' (assigned once and never changed). This is because captured locals are copied, and allowing mutation would create confusing aliasing between the lambda's copy and the original. You can't reassign a captured variable; to accumulate, use an array/holder, an AtomicInteger, or — better — a stream collector.",
    keyPoints: [
      "Captured locals must be effectively final.",
      "Avoids ambiguous mutation across stack frames.",
      "Use atomics/collectors instead of mutating captured vars.",
    ],
  },
  {
    id: "j8-10", topic: "java8", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Difference between Iterator and Stream.",
    a: "An Iterator is an external, imperative, stateful cursor you pull elements from one at a time, and it can mutate the source (remove()). A Stream is a declarative, internal-iteration pipeline that's lazy, can be parallel, doesn't store elements, and is single-use and non-mutating of the source. Streams express WHAT, iterators express HOW.",
    keyPoints: [
      "Iterator = external iteration, mutable, reusable cursor.",
      "Stream = internal iteration, lazy, parallelizable, one-shot.",
      "Streams don't modify the source.",
    ],
  },
  {
    id: "j8-11", topic: "java8", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "What are default methods and why were they added?",
    a: "Default methods let an interface provide a method body, so new methods can be added to interfaces without breaking every existing implementor — this is how Collection.stream() and forEach were retrofitted in Java 8. They enable interface evolution and a form of multiple behaviour inheritance, with explicit rules to resolve conflicts.",
    keyPoints: [
      "Interface methods with a body → backward-compatible API evolution.",
      "Enabled stream()/forEach on existing collections.",
      "Conflicts must be resolved by overriding.",
    ],
  },
  {
    id: "j8-12", topic: "java8", difficulty: "hard", freq: "Occasional",
    companies: ["BANK", "PRODUCT"],
    q: "collect(toMap(...)) pitfalls — duplicate keys and null values.",
    a: "Collectors.toMap throws IllegalStateException on duplicate keys unless you supply a merge function (e.g. (a,b)->a or sum). It also rejects null values (HashMap allows them, but toMap's merge logic NPEs). For deterministic ordering or a specific map type, pass a map supplier as the fourth argument. Always anticipate duplicates in real data.",
    keyPoints: [
      "Duplicate key → IllegalStateException without a merge fn.",
      "Null value → NullPointerException.",
      "4-arg form lets you choose merge + map type.",
    ],
  },
  {
    id: "j8-13", topic: "java8", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "What does Stream.peek() do and why be careful?",
    a: "peek() is an intermediate op meant for debugging — it lets you observe elements as they flow (e.g. log them) while passing them through unchanged. Don't use it for side effects in production logic: it may not run if no terminal op consumes those elements (laziness), and the JIT can elide it (e.g. count() without dependence). Use forEach for intentional side effects.",
    keyPoints: [
      "peek = debugging/observation, returns the same stream.",
      "May be skipped due to laziness/optimization.",
      "Don't rely on it for business side effects.",
    ],
  },
  {
    id: "j8-14", topic: "java8", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "What problem does the java.time (Date/Time) API solve?",
    a: "The Java 8 java.time package replaces the broken legacy Date/Calendar: the new types (LocalDate, LocalDateTime, ZonedDateTime, Instant, Duration, Period) are IMMUTABLE and thread-safe, clearly separate date/time/zone concepts, use a sane domain model, and avoid the old 0-based months and mutable-shared-state bugs. Always prefer java.time over Date/SimpleDateFormat.",
    keyPoints: [
      "Immutable, thread-safe, clear domain types.",
      "LocalDate/LocalDateTime/ZonedDateTime/Instant/Duration/Period.",
      "Replaces error-prone Date/Calendar/SimpleDateFormat.",
    ],
  },

  // ===================== MODERN JAVA 11-21 =====================
  {
    id: "mod-1", topic: "modern", difficulty: "medium", freq: "Very common",
    companies: ["BANK", "PRODUCT"],
    q: "What are records (Java 16) and what do they generate? Any limits?",
    a: "A record is a transparent carrier for immutable data: record Point(int x, int y){} auto-generates a canonical constructor, private final fields, accessors (x(), y()), and equals/hashCode/toString based on the components. Records are implicitly final, can't extend a class (they extend Record), but can implement interfaces and add static members, compact constructors (for validation), and extra methods. They're shallowly immutable.",
    keyPoints: [
      "Auto: fields, canonical ctor, accessors, equals/hashCode/toString.",
      "Final, can't extend classes, can implement interfaces.",
      "Compact constructor for validation; shallow immutability.",
    ],
    code: "record Trade(String symbol, BigDecimal qty){\n  Trade { if(qty.signum()<0) throw new IllegalArgumentException(); }\n}",
  },
  {
    id: "mod-2", topic: "modern", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "What are sealed classes (Java 17) and why use them?",
    a: "A sealed class/interface restricts which types may extend/implement it via permits, so the hierarchy is closed and known. Permitted subtypes must be final, sealed, or non-sealed. This models closed domains (e.g. Shape permits Circle, Rectangle) and—combined with pattern-matching switch—lets the compiler verify exhaustiveness (no default branch needed), catching missing cases at compile time.",
    keyPoints: [
      "permits lists allowed subtypes; hierarchy is closed.",
      "Subtypes must be final / sealed / non-sealed.",
      "Enables exhaustive pattern-matching switches.",
    ],
  },
  {
    id: "mod-3", topic: "modern", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Pattern matching for instanceof and switch — what changed?",
    a: "Pattern matching for instanceof (Java 16) binds the cast in one step: if(o instanceof String s) lets you use s directly, no explicit cast. Pattern matching for switch (Java 21) lets you switch on types with guards: case Integer i when i>0 -> ...; combined with record deconstruction patterns (case Point(int x,int y)) and sealed types, you get exhaustive, null-aware, expressive branching that replaces verbose instanceof chains.",
    keyPoints: [
      "instanceof binds a variable (no cast).",
      "switch patterns + 'when' guards + record deconstruction.",
      "Exhaustive over sealed types; handles null explicitly.",
    ],
    code: "String fmt = switch(shape){\n  case Circle c -> \"r=\"+c.radius();\n  case Rectangle(var w, var h) -> w+\"x\"+h;\n};",
  },
  {
    id: "mod-4", topic: "modern", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "var (Java 10) — what it is and what it is NOT.",
    a: "var enables local-variable type inference: the compiler infers the static type from the initializer (var list = new ArrayList<String>()). It is NOT dynamic typing — the variable still has a fixed compile-time type. It only works for local variables with an initializer (not fields, params, or null/array-initializer). Use it when the type is obvious to keep code readable; avoid it when it hides an important type.",
    keyPoints: [
      "Compile-time inference, still statically typed.",
      "Locals with initializer only; no fields/params.",
      "Use for readability, not to obscure types.",
    ],
  },
  {
    id: "mod-5", topic: "modern", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "What are text blocks (Java 15)?",
    a: "Text blocks are multi-line string literals delimited by triple quotes \"\"\" that preserve formatting and remove the need for escaping/concatenation — ideal for embedded JSON, SQL, HTML. The compiler strips incidental leading whitespace based on the closing delimiter's indentation. They produce a normal String at compile time.",
    keyPoints: [
      "Triple-quote multi-line literals; no concat/escapes.",
      "Incidental indentation stripped automatically.",
      "Great for JSON/SQL/HTML snippets.",
    ],
  },
  {
    id: "mod-6", topic: "modern", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "What are sequenced collections (Java 21)?",
    a: "SequencedCollection/SequencedSet/SequencedMap are new interfaces giving a uniform API for collections with a defined encounter order: getFirst()/getLast(), addFirst()/addLast(), and reversed(). Now List, Deque, LinkedHashSet, LinkedHashMap, etc. share consistent first/last access — previously you needed type-specific calls (list.get(0) vs deque.getFirst()).",
    keyPoints: [
      "Uniform first/last access + reversed() view.",
      "Implemented by List, Deque, LinkedHashSet/Map, etc.",
      "Fixes the inconsistent ways to get the first/last element.",
    ],
  },
  {
    id: "mod-7", topic: "modern", difficulty: "hard", freq: "Occasional",
    companies: ["PRODUCT", "BANK"],
    q: "What is structured concurrency (preview) and what problem does it solve?",
    a: "Structured concurrency (StructuredTaskScope, preview in 21) treats a group of concurrent subtasks as a single unit of work with a clear scope: if one subtask fails, siblings are cancelled; the parent waits for all to finish before continuing. This eliminates thread leaks and the error-prone manual coordination of Futures, making concurrent code as readable and reliable as sequential code (error propagation + cancellation are built in).",
    keyPoints: [
      "Subtasks scoped to a parent → no leaks, clean cancellation.",
      "Fail-fast: one failure cancels siblings.",
      "Pairs with virtual threads for fan-out I/O.",
    ],
  },
  {
    id: "mod-8", topic: "modern", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Switch expressions (Java 14) vs old switch statements.",
    a: "Switch expressions return a value, use arrow labels (case A -> ...) with no fall-through, support multiple labels per case (case MON, TUE -> ...), and yield a value (via the expression or 'yield' in a block). They're exhaustive for enums/sealed types (compiler-checked), eliminating the classic forgotten-break bug.",
    keyPoints: [
      "Arrow form → no fall-through, returns a value.",
      "Multiple labels per case; 'yield' in blocks.",
      "Exhaustiveness checked for enums/sealed.",
    ],
  },
  {
    id: "mod-9", topic: "modern", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Name important changes between Java 8 and Java 17/21 you'd mention.",
    a: "Beyond LTS jumps: var (10), HTTP Client (11), switch expressions (14), text blocks (15), records (16), pattern matching for instanceof (16), sealed classes (17), pattern matching for switch + record patterns + virtual threads + sequenced collections (21), plus G1 becoming default and the new generational ZGC for low-pause GC. The framing interviewers want: you keep current and know why each feature exists.",
    keyPoints: [
      "var, HTTP client, switch expr, text blocks, records, sealed, patterns.",
      "21: virtual threads, sequenced collections, record patterns.",
      "GC: G1 default; ZGC/Shenandoah for low pause.",
    ],
  },
  {
    id: "mod-10", topic: "modern", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "PRODUCT"],
    q: "What is the JPMS / module system (Java 9)?",
    a: "The Java Platform Module System adds a higher unit than packages: a module declares (module-info.java) which packages it exports and which modules it requires, enabling strong encapsulation and reliable configuration. It split the JDK into modules (enabling jlink custom runtimes). In practice many app teams still use the classpath, but you should know exports/requires/opens and 'split package' issues.",
    keyPoints: [
      "module-info.java: requires/exports/opens.",
      "Strong encapsulation + reliable dependencies.",
      "Enables jlink minimal runtimes; many apps still use classpath.",
    ],
  },
  {
    id: "mod-11", topic: "modern", difficulty: "medium", freq: "Occasional",
    companies: ["BANK", "PRODUCT"],
    q: "How do virtual threads change how you size thread pools?",
    a: "With platform threads you size pools to your core count / I/O ratio to avoid OS thread exhaustion. With virtual threads you DON'T pool them — you create one per task (newVirtualThreadPerTaskExecutor) because they're cheap; pooling them is an anti-pattern. You still bound concurrency on downstream resources with semaphores. So the mental model shifts from 'pool of expensive threads' to 'cheap thread per task + limit the scarce resource'.",
    keyPoints: [
      "Don't pool virtual threads — one per task.",
      "Bound real bottlenecks (DB, downstream) with Semaphore.",
      "Carrier pool handles mounting; you don't size it manually.",
    ],
  },
  {
    id: "mod-12", topic: "modern", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Enum — why is it more than a list of constants?",
    a: "An enum is a full type: each constant is a singleton instance, can have fields, constructors, and methods, and can override behaviour per constant (constant-specific bodies). Enums are ideal for state machines and strategy tables, are inherently thread-safe singletons, work in switch, and provide values()/valueOf()/ordinal(). EnumMap/EnumSet are highly optimized for enum keys.",
    keyPoints: [
      "Constants are singletons; can hold state + behaviour.",
      "Constant-specific method bodies = strategy table.",
      "EnumMap/EnumSet are very efficient.",
    ],
  },

  // ===================== JVM / MEMORY / GC =====================
  {
    id: "jvm-1", topic: "jvm", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "JDK vs JRE vs JVM.",
    a: "JVM is the abstract runtime that loads, verifies, and executes bytecode (platform-specific implementations). JRE = JVM + core libraries needed to RUN Java apps. JDK = JRE + development tools (compiler javac, jar, debugger) needed to BUILD them. Write-once-run-anywhere comes from compiling to platform-neutral bytecode that each platform's JVM executes.",
    keyPoints: [
      "JVM runs bytecode; JRE runs apps; JDK builds them.",
      "JDK ⊃ JRE ⊃ JVM.",
      "Bytecode portability = platform independence.",
    ],
  },
  {
    id: "jvm-2", topic: "jvm", difficulty: "medium", freq: "Very common",
    companies: ["BANK", "PRODUCT"],
    q: "Stack vs heap — what lives where?",
    a: "The heap holds all objects and arrays, is shared across threads, and is GC-managed (divided into young/old generations). The stack is per-thread and holds frames with local variables, primitives, and object references (not the objects themselves). Stack memory is freed automatically on method return; deep recursion overflows it (StackOverflowError) while too many/large objects exhaust the heap (OutOfMemoryError).",
    keyPoints: [
      "Heap: objects, shared, GC-managed (gen young/old).",
      "Stack: per-thread frames, locals/refs, auto-freed.",
      "StackOverflowError vs OutOfMemoryError.",
    ],
  },
  {
    id: "jvm-3", topic: "jvm", difficulty: "hard", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Explain generational garbage collection (young/old, minor/major).",
    a: "Most objects die young, so the heap is split: the Young generation (Eden + two Survivor spaces) and the Old/Tenured generation. New objects go in Eden; a minor GC copies survivors between survivor spaces and ages them; objects surviving enough cycles are promoted to Old. Major/full GC collects the Old gen (more expensive). This 'weak generational hypothesis' lets minor GCs be fast and frequent.",
    keyPoints: [
      "Eden → Survivor → Old (promotion by age).",
      "Minor GC = young (frequent, cheap); major = old (costly).",
      "Based on 'most objects die young'.",
    ],
  },
  {
    id: "jvm-4", topic: "jvm", difficulty: "hard", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Compare GC algorithms: Serial, Parallel, G1, ZGC.",
    a: "Serial: single-threaded, small heaps/clients. Parallel (Throughput): multi-threaded young/old collection, maximizes throughput, longer pauses. G1 (default since 9): region-based, targets predictable pause times, good general default for large heaps. ZGC/Shenandoah: concurrent, low-pause (sub-millisecond) collectors for very large heaps where latency matters (trading, low-latency services). Choice is a throughput-vs-latency trade-off.",
    keyPoints: [
      "Serial/Parallel = throughput; G1 = balanced default.",
      "ZGC/Shenandoah = ultra-low pause for big heaps.",
      "Tune for throughput vs latency for your workload.",
    ],
  },
  {
    id: "jvm-5", topic: "jvm", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "How do memory leaks happen in Java despite GC?",
    a: "GC reclaims only UNREACHABLE objects, so a leak is unintended reachability: objects you forgot to release but are still referenced. Classic sources: growing static collections/caches, listeners/callbacks never deregistered, ThreadLocals in pooled threads, unclosed resources, and keys whose identity outlives their usefulness. Diagnose with heap dumps + a profiler (MAT, VisualVM) looking at dominator trees / GC roots.",
    keyPoints: [
      "Leak = unintended reachability (static maps, caches, listeners).",
      "ThreadLocals + thread pools are a frequent culprit.",
      "Diagnose with heap dump + MAT/VisualVM (GC roots).",
    ],
  },
  {
    id: "jvm-6", topic: "jvm", difficulty: "medium", freq: "Occasional",
    companies: ["BANK", "PRODUCT"],
    q: "Strong, soft, weak, and phantom references.",
    a: "Strong (normal references) prevent collection. SoftReference is cleared only under memory pressure — good for memory-sensitive caches. WeakReference is cleared at the next GC once no strong refs remain — used by WeakHashMap for canonicalizing maps/metadata that shouldn't keep keys alive. PhantomReference is enqueued after finalization for advanced cleanup (replacing finalize()), and its get() always returns null.",
    keyPoints: [
      "Strong > Soft (mem pressure) > Weak (next GC) > Phantom (post-mortem).",
      "Soft = caches; Weak = WeakHashMap/metadata.",
      "Phantom = managed cleanup via ReferenceQueue.",
    ],
  },
  {
    id: "jvm-7", topic: "jvm", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Explain the class loading process and the loader hierarchy.",
    a: "Loading → Linking (verify, prepare, resolve) → Initialization (run static initializers, lazily on first active use). Loaders follow delegation: Bootstrap (core JDK) → Platform/Extension → Application (classpath), each delegating UP to its parent first, so core classes can't be spoofed. Custom loaders enable plugins/hot reload. ClassNotFoundException (lookup at runtime) differs from NoClassDefFoundError (present at compile, missing at run).",
    keyPoints: [
      "Load → Link(verify/prepare/resolve) → Initialize (lazy).",
      "Parent-delegation: Bootstrap → Platform → Application.",
      "ClassNotFoundException vs NoClassDefFoundError.",
    ],
  },
  {
    id: "jvm-8", topic: "jvm", difficulty: "hard", freq: "Occasional",
    companies: ["BANK", "PRODUCT"],
    q: "What is JIT compilation and how does the JVM optimize hot code?",
    a: "The JVM starts by interpreting bytecode, then the JIT compiles frequently executed ('hot') methods to native code. HotSpot uses tiered compilation (C1 quick + C2 aggressive). It applies profile-guided optimizations: inlining, escape analysis (stack-allocate/scalar-replace non-escaping objects), loop unrolling, and dead-code elimination — and can deoptimize if assumptions break. This is why Java warms up and microbenchmarks need JMH.",
    keyPoints: [
      "Interpret → JIT compile hot paths (tiered C1/C2).",
      "Inlining, escape analysis, loop optimizations.",
      "Warmup matters; benchmark with JMH.",
    ],
  },
  {
    id: "jvm-9", topic: "jvm", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "What replaced PermGen and why?",
    a: "Before Java 8, class metadata lived in PermGen, a fixed-size region of the heap that frequently caused OutOfMemoryError: PermGen (e.g. with many classes/redeploys). Java 8 replaced it with Metaspace, which stores class metadata in NATIVE memory and grows dynamically by default — reducing those errors and removing the awkward -XX:MaxPermSize tuning. You can still cap it with -XX:MaxMetaspaceSize.",
    keyPoints: [
      "PermGen (heap, fixed) → Metaspace (native, auto-grow) in Java 8.",
      "Fewer 'PermGen space' OOMs.",
      "Cap with -XX:MaxMetaspaceSize if needed.",
    ],
  },
  {
    id: "jvm-10", topic: "jvm", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "How would you diagnose high CPU or a memory issue in production?",
    a: "For high CPU: take thread dumps (jstack) a few times, find threads in RUNNABLE consuming CPU (correlate with top -H thread IDs), look for hot loops/GC threads. For memory: monitor GC logs (-Xlog:gc), watch for rising old-gen after full GCs (leak), capture a heap dump (jmap/-XX:+HeapDumpOnOutOfMemoryError) and analyze in MAT. Tools: JFR/Mission Control, async-profiler, VisualVM.",
    keyPoints: [
      "High CPU: thread dumps + top -H correlation; check GC.",
      "Memory: GC logs, heap dump → MAT dominator tree.",
      "JFR/async-profiler for low-overhead production profiling.",
    ],
  },

  // ===================== GENERICS =====================
  {
    id: "gen-1", topic: "generics", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "What is type erasure and what are its consequences?",
    a: "Generics are a compile-time feature: the compiler checks types then ERASES them, replacing type parameters with their bounds (or Object) so the bytecode has no generic type info at runtime. Consequences: you can't do new T[], can't use instanceof List<String>, can't have two overloads differing only by generic type (same erasure), and generic exceptions aren't allowed. It exists for backward compatibility with pre-generics code.",
    keyPoints: [
      "Compile-time checks, runtime types erased to bounds/Object.",
      "No new T[], no instanceof List<String>, no overload-by-generic.",
      "Reason: backward compatibility.",
    ],
  },
  {
    id: "gen-2", topic: "generics", difficulty: "hard", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Explain bounded wildcards and the PECS principle.",
    a: "? extends T is an upper-bounded wildcard (a producer you read T from); ? super T is lower-bounded (a consumer you write T into). PECS = 'Producer Extends, Consumer Super': use extends when a structure produces values for you (read), super when it consumes values you supply (write). Example: copy(List<? super T> dest, List<? extends T> src). A plain List<?> is read-only (you can't safely add).",
    keyPoints: [
      "extends = producer (read); super = consumer (write).",
      "PECS: Producer Extends, Consumer Super.",
      "List<?> is effectively read-only.",
    ],
  },
  {
    id: "gen-3", topic: "generics", difficulty: "medium", freq: "Occasional",
    companies: ["BANK", "PRODUCT"],
    q: "List<Object> vs List<?> vs raw List.",
    a: "List<Object> is a list that holds any object (you can add anything) but List<String> is NOT a List<Object> (no covariance, for safety). List<?> is an unbounded wildcard — a list of unknown type you can read as Object but can't add to (except null). Raw List bypasses generics entirely, losing all type safety and producing unchecked warnings — avoid it (only exists for legacy interop).",
    keyPoints: [
      "List<String> is not a List<Object> (invariant generics).",
      "List<?> = read-only-ish unknown type.",
      "Raw types defeat type safety — don't use.",
    ],
  },
  {
    id: "gen-4", topic: "generics", difficulty: "easy", freq: "Occasional",
    companies: ["SERVICE", "BANK"],
    q: "Why can't you create a generic array (new T[])?",
    a: "Because of erasure, the runtime wouldn't know T's actual type, so the array's runtime type check (which arrays DO enforce — they're covariant and reified) couldn't work, breaking the type-safety arrays rely on. The workarounds are using a List<T> instead, or creating an Object[]/reflective Array.newInstance and casting (with an unchecked warning).",
    keyPoints: [
      "Arrays are reified; generics are erased → conflict.",
      "Prefer List<T> over generic arrays.",
      "Array.newInstance(...) + cast as last resort.",
    ],
  },
  {
    id: "gen-5", topic: "generics", difficulty: "medium", freq: "Occasional",
    companies: ["BANK", "PRODUCT"],
    q: "What is a bounded type parameter and a recursive bound?",
    a: "A bounded type parameter constrains T, e.g. <T extends Number> so T has Number's API. You can have multiple bounds with & (<T extends A & B>). A recursive/self bound — <T extends Comparable<T>> — says T must be comparable to itself, used in methods like max() to ensure elements are mutually comparable.",
    keyPoints: [
      "<T extends Number> gives access to the bound's methods.",
      "Multiple bounds via & (class first, then interfaces).",
      "<T extends Comparable<T>> = recursive/self type bound.",
    ],
  },

  // ===================== SERIALIZATION / I/O =====================
  {
    id: "ser-1", topic: "serialization", difficulty: "medium", freq: "Common",
    companies: ["BANK"],
    q: "What is serialization and the role of serialVersionUID?",
    a: "Serialization converts an object graph to a byte stream (Serializable marker interface) for persistence/transport; deserialization rebuilds it. serialVersionUID is a version stamp: if it doesn't match between writer and reader classes, deserialization throws InvalidClassException. Declaring it explicitly (private static final long serialVersionUID) protects you from incompatible auto-generated IDs when the class evolves.",
    keyPoints: [
      "Serializable = marker; serializes the object graph.",
      "serialVersionUID guards version compatibility.",
      "Always declare it explicitly for evolvable classes.",
    ],
  },
  {
    id: "ser-2", topic: "serialization", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "What does transient mean? What about static fields?",
    a: "transient fields are skipped during serialization (restored as defaults on deserialize) — use it for sensitive data (passwords) or non-serializable/derived fields (e.g. a cache or a Thread). static fields belong to the class, not the instance, so they're never part of an instance's serialized state either.",
    keyPoints: [
      "transient = excluded from serialization (defaults on read).",
      "Use for secrets, caches, non-serializable fields.",
      "static fields aren't serialized (class-level).",
    ],
  },
  {
    id: "ser-3", topic: "serialization", difficulty: "hard", freq: "Occasional",
    companies: ["BANK", "PRODUCT"],
    q: "Why is Java native serialization considered risky, and what are alternatives?",
    a: "Native serialization has a notorious security/maintenance record: deserializing untrusted data can trigger gadget-chain remote code execution, it's brittle across class changes, slow, and Java-only. Effective Java says avoid it for new systems. Alternatives: explicit, schema-based formats — JSON (Jackson/Gson), Protobuf, Avro, or Kryo — which are safer, cross-language, and faster.",
    keyPoints: [
      "Untrusted deserialization → RCE gadget chains.",
      "Brittle, slow, Java-only.",
      "Prefer JSON/Protobuf/Avro with explicit schemas.",
    ],
  },
  {
    id: "ser-4", topic: "serialization", difficulty: "medium", freq: "Occasional",
    companies: ["BANK"],
    q: "Serializable vs Externalizable.",
    a: "Serializable uses default reflection-based (de)serialization automatically (optionally customised with writeObject/readObject). Externalizable gives you full manual control — you implement writeExternal/readExternal and decide exactly what's written, which can be faster and more compact but requires a public no-arg constructor and more code. Most code uses Serializable; Externalizable is for performance-critical custom formats.",
    keyPoints: [
      "Serializable: automatic, optional hooks.",
      "Externalizable: full manual control + no-arg ctor.",
      "Externalizable can be faster/smaller but verbose.",
    ],
  },
  {
    id: "ser-5", topic: "serialization", difficulty: "easy", freq: "Occasional",
    companies: ["SERVICE"],
    q: "BIO vs NIO — what does NIO add?",
    a: "Classic java.io is stream/blocking-oriented (one thread per connection). NIO (java.nio) adds buffers, channels, and selectors enabling non-blocking, multiplexed I/O — one thread can manage many connections via a Selector, which is how high-throughput servers (Netty) scale. NIO.2 (Java 7) added the Path/Files API and async file I/O.",
    keyPoints: [
      "io: blocking streams, thread-per-connection.",
      "nio: buffers/channels/selectors → non-blocking multiplexing.",
      "NIO.2: Path/Files + async I/O.",
    ],
  },

  // ===================== CODING / OUTPUT =====================
  {
    id: "code-1", topic: "coding", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "What's the output? Integer caching: Integer a=127,b=127; a==b? And 128?",
    a: "a==b is true for 127 but false for 128. Autoboxing uses Integer.valueOf, which caches Integer objects from -128 to 127 (the IntegerCache). So 127 returns the same cached object (==true), while 128 creates new objects (==false). Lesson: always compare wrapper objects with equals(), never ==.",
    keyPoints: [
      "Integer cache: -128..127 are shared instances.",
      "== compares references; use equals() for wrappers.",
      "Cache upper bound is tunable (-XX:AutoBoxCacheMax).",
    ],
  },
  {
    id: "code-2", topic: "coding", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Write a program to reverse a string without StringBuilder.reverse().",
    a: "Convert to char array and swap from both ends toward the middle (O(n) time, O(1) extra beyond the array). This tests basic algorithmic comfort; mention that StringBuilder.reverse() is the production answer and that you'd handle surrogate pairs for full Unicode correctness.",
    keyPoints: [
      "Two-pointer swap on a char[].",
      "Mention surrogate pairs/emoji edge case.",
      "Production: new StringBuilder(s).reverse().toString().",
    ],
    code: "char[] c = s.toCharArray();\nfor(int i=0,j=c.length-1;i<j;i++,j--){\n  char t=c[i]; c[i]=c[j]; c[j]=t;\n}\nreturn new String(c);",
  },
  {
    id: "code-3", topic: "coding", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Find the first non-repeating character in a string.",
    a: "Use a LinkedHashMap<Character,Integer> to count occurrences while preserving insertion order, then return the first key with count 1. O(n) time. LinkedHashMap keeps order so you don't need a second ordered pass; mention an int[256]/int[128] frequency array as a faster ASCII-only variant.",
    keyPoints: [
      "Count with LinkedHashMap (preserves order).",
      "Single pass to count, one pass to find count==1.",
      "ASCII-only: int[128] frequency array is faster.",
    ],
  },
  {
    id: "code-4", topic: "coding", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Find duplicate / second-highest in an array using streams.",
    a: "Duplicates: stream the array, group by identity and keep entries with count>1, or use a HashSet add() returning false. Second-highest: ints.stream().distinct().sorted(reverseOrder()).skip(1).findFirst(), or a single pass tracking max and secondMax. The single-pass O(n) version is the better answer when asked for efficiency.",
    keyPoints: [
      "Duplicates: Set.add()==false, or groupingBy + counting.",
      "Second highest: distinct().sorted(reverse).skip(1).findFirst().",
      "Prefer single-pass O(n) for second-highest in interviews.",
    ],
  },
  {
    id: "code-5", topic: "coding", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Output: what does \"1\"+2+3 print vs 1+2+\"3\"?",
    a: "\"1\"+2+3 prints \"123\" (left-to-right: \"1\"+2 → \"12\", then +3 → \"123\"). 1+2+\"3\" prints \"33\" (1+2 evaluated as ints → 3, then +\"3\" → \"33\"). The + operator is left-associative; once a String appears, the rest is string concatenation. Classic associativity/precedence trap.",
    keyPoints: [
      "+ is left-associative; String triggers concatenation.",
      "Numeric addition happens before a String appears.",
      "Watch evaluation order in mixed expressions.",
    ],
  },
  {
    id: "code-6", topic: "coding", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Check if two strings are anagrams.",
    a: "Either sort both char arrays and compare (O(n log n)), or — better — count character frequencies in one pass and verify they match (O(n) with an int[26]/HashMap). Don't forget to compare lengths first and decide on case/whitespace handling. The frequency-count approach is the optimal answer.",
    keyPoints: [
      "Optimal: frequency count (int[26] or map), O(n).",
      "Quick check: lengths must match first.",
      "Clarify case/spacing/Unicode assumptions.",
    ],
  },
  {
    id: "code-7", topic: "coding", difficulty: "hard", freq: "Occasional",
    companies: ["BANK", "PRODUCT"],
    q: "Group a list of employees by department and sum salaries (streams).",
    a: "Use Collectors.groupingBy with a downstream summing collector: collect(groupingBy(Emp::getDept, summingDouble(Emp::getSalary))). For multiple aggregates, use a custom collector or groupingBy + a reducing/teeing collector (Java 12 teeing computes two results in one pass). This shows fluency with the Collectors toolkit, common in product/bank interviews.",
    keyPoints: [
      "groupingBy(classifier, summingDouble(...)).",
      "Multiple metrics: teeing (Java 12) or custom collector.",
      "One pass, declarative aggregation.",
    ],
    code: "Map<Dept,Double> totals = emps.stream()\n  .collect(groupingBy(Emp::dept, summingDouble(Emp::salary)));",
  },
  {
    id: "code-8", topic: "coding", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "What is the output of a loop modifying an Integer in a list with autoboxing? (boxing gotchas)",
    a: "Common trap forms: incrementing a Long with a literal int, ==-comparing boxed values, or NullPointerException when unboxing a null Integer (e.g. map.get(missing) returned as int). The key lessons: unboxing a null wrapper throws NPE, mixing wrapper/primitive in conditionals can auto-unbox unexpectedly, and == on wrappers compares references. Always be explicit about boxing in hot or null-prone code.",
    keyPoints: [
      "Unboxing null → NullPointerException.",
      "== on wrappers compares identity (cache range trap).",
      "Boxing in tight loops costs allocations/perf.",
    ],
  },

  // ===================== CONCURRENCY — DEEP DIVE (talking points only) =====================
  {
    id: "cdd-1", topic: "concurrency", difficulty: "hard", freq: "Very common", deep: true,
    companies: ["BANK", "PRODUCT"],
    q: "Implement the producer–consumer problem. Show it with BlockingQueue and with wait/notify.",
    keyPoints: [
      "Bounded shared buffer: producers block when full, consumers block when empty.",
      "Cleanest: BlockingQueue.put()/take() handle the blocking for you — no manual locks.",
      "Classic version: synchronized + wait() in a while-loop + notifyAll() (not notify).",
      "Two Conditions (notFull/notEmpty) signal exactly the right waiters.",
    ],
    code: "BlockingQueue<Task> q = new ArrayBlockingQueue<>(100);\n// producer: q.put(task);   // blocks if full\n// consumer: Task t = q.take(); // blocks if empty",
  },
  {
    id: "cdd-2", topic: "concurrency", difficulty: "hard", freq: "Common", deep: true,
    companies: ["BANK", "PRODUCT"],
    q: "How do you size a thread pool for CPU-bound vs I/O-bound work?",
    keyPoints: [
      "CPU-bound: ~ number of cores (Ncpu or Ncpu + 1).",
      "I/O-bound: Ncpu × targetUtilization × (1 + waitTime/computeTime) — more threads to cover blocking.",
      "Always bound the queue to avoid unbounded memory growth / hidden back-pressure loss.",
      "Virtual threads: don't pool — one per task; bound the real bottleneck with a Semaphore.",
    ],
  },
  {
    id: "cdd-3", topic: "concurrency", difficulty: "medium", freq: "Common", deep: true,
    companies: ["BANK", "PRODUCT"],
    q: "execute() vs submit() — and how does each surface a thrown exception?",
    keyPoints: [
      "execute(Runnable): exception bubbles to the thread's UncaughtExceptionHandler (logged/visible).",
      "submit(): exception is captured in the Future and only thrown (as ExecutionException) when you call get().",
      "Gotcha: submit() silently hides failures if you never inspect the returned Future.",
    ],
  },
  {
    id: "cdd-4", topic: "concurrency", difficulty: "medium", freq: "Common", deep: true,
    companies: ["BANK", "PRODUCT"],
    q: "shutdown() vs shutdownNow() vs awaitTermination() — graceful pool shutdown.",
    keyPoints: [
      "shutdown(): stop accepting new tasks, let queued ones finish (graceful).",
      "shutdownNow(): interrupt running tasks, drain & return the pending queue (forceful).",
      "awaitTermination(timeout): block until done or timeout.",
      "Standard pattern: shutdown() → awaitTermination() → shutdownNow() as fallback. Tasks must honour interruption.",
    ],
  },
  {
    id: "cdd-5", topic: "concurrency", difficulty: "hard", freq: "Common", deep: true,
    companies: ["BANK", "PRODUCT"],
    q: "What is thread-pool deadlock / starvation, and how do you avoid it?",
    keyPoints: [
      "Pooled tasks block waiting on results from OTHER tasks in the SAME bounded pool → all workers wait, queue never drains.",
      "Single-thread executor + a task that submits-and-waits on the same executor = instant deadlock.",
      "Fix: separate pools per dependent stage, right-size, or compose async (CompletableFuture) instead of blocking inside a worker.",
    ],
  },
  {
    id: "cdd-6", topic: "concurrency", difficulty: "medium", freq: "Common", deep: true,
    companies: ["BANK"],
    q: "What happens to an uncaught exception in a thread? How do you observe it?",
    keyPoints: [
      "It terminates only that thread, not the JVM.",
      "Thread.setUncaughtExceptionHandler / setDefaultUncaughtExceptionHandler to log/alert.",
      "In pools: install handlers via a custom ThreadFactory; with submit() the exception lives in the Future.",
    ],
  },
  {
    id: "cdd-7", topic: "concurrency", difficulty: "hard", freq: "Common", deep: true,
    companies: ["PRODUCT", "BANK"],
    q: "Explain ForkJoinPool and work-stealing.",
    keyPoints: [
      "Built for divide-and-conquer: RecursiveTask/RecursiveAction split → fork → join.",
      "Each worker has its own deque; idle workers steal from the tail of busy workers' deques → load balancing.",
      "Backs parallel streams and CompletableFuture async (the common pool).",
      "Never run blocking I/O on it — it starves the shared common pool.",
    ],
  },
  {
    id: "cdd-8", topic: "concurrency", difficulty: "hard", freq: "Common", deep: true,
    companies: ["PRODUCT", "BANK"],
    q: "thenApply vs thenApplyAsync — which thread runs the continuation?",
    keyPoints: [
      "thenApply: may run on the thread that completed the prior stage (or the caller) — not guaranteed off-thread.",
      "thenApplyAsync: runs on ForkJoinPool.commonPool() or a supplied Executor.",
      "In servers, always pass your OWN Executor — relying on the common pool risks starvation/blocking.",
    ],
  },
  {
    id: "cdd-9", topic: "concurrency", difficulty: "hard", freq: "Occasional", deep: true,
    companies: ["BANK"],
    q: "Condition (await/signal) vs wait/notify — why does Condition help?",
    keyPoints: [
      "Condition is bound to a Lock and gives MULTIPLE wait-sets per lock (e.g. notFull + notEmpty).",
      "Signal exactly the right group → avoids waking the wrong waiters that notifyAll causes.",
      "await/signal/signalAll mirror wait/notify; still await in a while-loop holding the lock.",
    ],
    code: "lock.lock();\ntry {\n  while (full) notFull.await();\n  enqueue(x);\n  notEmpty.signal();\n} finally { lock.unlock(); }",
  },
  {
    id: "cdd-10", topic: "concurrency", difficulty: "hard", freq: "Occasional", deep: true,
    companies: ["PRODUCT", "BANK"],
    q: "ConcurrentHashMap.computeIfAbsent — atomicity guarantee and the recursion gotcha.",
    keyPoints: [
      "Atomic per key — only one thread computes the value; ideal for lazy caches / memoization.",
      "The mapping function must NOT update the same map (recursive computeIfAbsent on the same/related key) → can deadlock or corrupt.",
      "Keep the compute function fast and side-effect-free — it runs under the bin lock.",
    ],
  },
  {
    id: "cdd-11", topic: "concurrency", difficulty: "hard", freq: "Occasional", deep: true,
    companies: ["BANK", "PRODUCT"],
    q: "What is safe publication, and how do you publish an object so other threads see it fully built?",
    keyPoints: [
      "Without it, a reference can be visible before construction finishes (reordering) → other threads see a half-built object.",
      "Publish via: static initializer, volatile / AtomicReference field, final fields, or a thread-safe collection.",
      "Never let 'this' escape during construction (e.g. registering a listener in the constructor).",
    ],
  },
  {
    id: "cdd-12", topic: "concurrency", difficulty: "hard", freq: "Occasional", deep: true,
    companies: ["PRODUCT", "BANK"],
    q: "Explain the ABA problem in lock-free code and how to defend against it.",
    keyPoints: [
      "Plain CAS checks only the value, so A→B→A looks unchanged though state moved — breaks lock-free stacks/pointers.",
      "AtomicStampedReference adds a version stamp; AtomicMarkableReference adds a boolean mark.",
      "CAS succeeds only if BOTH value and stamp/mark match.",
    ],
  },
  {
    id: "cdd-13", topic: "concurrency", difficulty: "hard", freq: "Common", deep: true,
    companies: ["BANK"],
    q: "How does synchronized work under the hood (monitor, bytecode, lock escalation)?",
    keyPoints: [
      "Compiles to monitorenter/monitorexit around the block; every object has a monitor.",
      "Lock state lives in the object header (mark word).",
      "JVM escalates: biased → lightweight (CAS spin) → heavyweight (OS mutex) under contention.",
      "Reentrant — a depth counter lets the same thread re-acquire.",
    ],
  },
  {
    id: "cdd-14", topic: "concurrency", difficulty: "hard", freq: "Occasional", deep: true,
    companies: ["PRODUCT", "BANK"],
    q: "What is false sharing and how do you eliminate it?",
    keyPoints: [
      "Independent variables on the same CPU cache line make cores invalidate each other's cache on writes → silent slowdown.",
      "Fix: pad fields to a cache line (~64 bytes) or @Contended; LongAdder uses striped cells for this reason.",
      "Surfaces in hot counters/queues on high core counts.",
    ],
  },
  {
    id: "cdd-15", topic: "concurrency", difficulty: "hard", freq: "Common", deep: true,
    companies: ["BANK", "PRODUCT"],
    q: "How does volatile map to memory barriers / fences?",
    keyPoints: [
      "A volatile write inserts store fences; a volatile read inserts load fences — preventing reordering across the access.",
      "Guarantees visibility + ordering, but NOT atomicity of compound operations.",
      "Underpins the happens-before of volatile and the correctness of double-checked locking.",
    ],
  },
  {
    id: "cdd-16", topic: "concurrency", difficulty: "medium", freq: "Common", deep: true,
    companies: ["PRODUCT", "BANK"],
    q: "Virtual thread pinning — when does it happen and how do you fix it?",
    keyPoints: [
      "A virtual thread is 'pinned' (can't unmount from its carrier) inside a synchronized block/method or a native frame while blocking → kills scalability.",
      "Fix: use ReentrantLock instead of synchronized around blocking I/O; keep blocking sections lock-free.",
      "Diagnose with -Djdk.tracePinnedThreads=full.",
    ],
  },

  // ===================== STREAMS CODING (problem + approach + reference solution) =====================
  {
    id: "sc-1", topic: "streams", difficulty: "easy", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Find the second-highest distinct number in a list.",
    keyPoints: [
      "distinct() to drop duplicates, sort descending, skip the first, take next.",
      "Mention the O(n) single-pass alternative (track max + secondMax).",
    ],
    code: "int second = nums.stream().distinct()\n    .sorted(Comparator.reverseOrder())\n    .skip(1).findFirst().orElseThrow();",
  },
  {
    id: "sc-2", topic: "streams", difficulty: "easy", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Count the frequency of each word in a list.",
    keyPoints: [
      "groupingBy(identity) with a counting() downstream collector.",
      "Result is Map<String, Long>.",
    ],
    code: "Map<String,Long> freq = words.stream()\n    .collect(Collectors.groupingBy(w -> w, Collectors.counting()));",
  },
  {
    id: "sc-3", topic: "streams", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Find the first non-repeating character in a string using streams.",
    keyPoints: [
      "Stream chars; group into a LinkedHashMap to preserve order; counting() downstream.",
      "Filter entries with count == 1, take the first key.",
    ],
    code: "Character c = s.chars().mapToObj(i -> (char) i)\n    .collect(Collectors.groupingBy(x -> x, LinkedHashMap::new, Collectors.counting()))\n    .entrySet().stream().filter(e -> e.getValue() == 1)\n    .map(Map.Entry::getKey).findFirst().orElse(null);",
  },
  {
    id: "sc-4", topic: "streams", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Sum the squares of only the even numbers.",
    keyPoints: [
      "Filter evens, map to square, reduce/sum.",
      "Use mapToInt for a primitive IntStream and .sum().",
    ],
    code: "int total = nums.stream().filter(n -> n % 2 == 0)\n    .mapToInt(n -> n * n).sum();",
  },
  {
    id: "sc-5", topic: "streams", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Partition numbers into evens and odds.",
    keyPoints: [
      "partitioningBy(predicate) returns Map<Boolean, List<T>> with both true and false keys always present.",
      "Cleaner than groupingBy for a boolean split.",
    ],
    code: "Map<Boolean,List<Integer>> parts = nums.stream()\n    .collect(Collectors.partitioningBy(n -> n % 2 == 0));",
  },
  {
    id: "sc-6", topic: "streams", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Join a list of names into a bracketed, comma-separated string.",
    keyPoints: [
      "Collectors.joining(delimiter, prefix, suffix).",
      "No manual StringBuilder needed.",
    ],
    code: "String out = names.stream()\n    .collect(Collectors.joining(\", \", \"[\", \"]\"));",
  },
  {
    id: "sc-7", topic: "streams", difficulty: "medium", freq: "Very common",
    companies: ["BANK", "PRODUCT"],
    q: "Find the employee with the highest salary.",
    keyPoints: [
      "max() with Comparator.comparing on the field; returns an Optional.",
      "Comparator.comparing(Emp::getSalary) reads cleanly.",
    ],
    code: "Optional<Emp> top = emps.stream()\n    .max(Comparator.comparing(Emp::getSalary));",
  },
  {
    id: "sc-8", topic: "streams", difficulty: "medium", freq: "Very common",
    companies: ["BANK", "PRODUCT"],
    q: "Build a Map of name → employee, handling duplicate names.",
    keyPoints: [
      "toMap(keyFn, valueFn, mergeFn) — the merge function resolves duplicate keys.",
      "Without a merge function, duplicates throw IllegalStateException.",
    ],
    code: "Map<String,Emp> byName = emps.stream()\n    .collect(Collectors.toMap(Emp::getName, e -> e, (a, b) -> a));",
  },
  {
    id: "sc-9", topic: "streams", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Flatten a list of lists and return distinct elements.",
    keyPoints: [
      "flatMap to un-nest, then distinct().",
      "flatMap(List::stream) turns Stream<List<T>> into Stream<T>.",
    ],
    code: "List<T> flat = listOfLists.stream()\n    .flatMap(List::stream).distinct()\n    .collect(Collectors.toList());",
  },
  {
    id: "sc-10", topic: "streams", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Sort employees by department ascending, then salary descending.",
    keyPoints: [
      "Comparator.comparing(...).thenComparing(...reversed()).",
      "Chain comparators rather than writing a manual compare.",
    ],
    code: "emps.stream().sorted(\n    Comparator.comparing(Emp::getDept)\n        .thenComparing(Comparator.comparing(Emp::getSalary).reversed()))\n    .collect(Collectors.toList());",
  },
  {
    id: "sc-11", topic: "streams", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Find duplicate elements in a list.",
    keyPoints: [
      "A Set.add() returning false flags a duplicate (stateful but concise).",
      "Alternative: groupingBy + counting, filter count > 1.",
    ],
    code: "Set<T> seen = new HashSet<>();\nList<T> dups = list.stream()\n    .filter(x -> !seen.add(x)).distinct()\n    .collect(Collectors.toList());",
  },
  {
    id: "sc-12", topic: "streams", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Compute the average salary per department.",
    keyPoints: [
      "groupingBy(dept) with averagingDouble downstream.",
      "Returns Map<Dept, Double>.",
    ],
    code: "Map<String,Double> avg = emps.stream()\n    .collect(Collectors.groupingBy(Emp::getDept,\n             Collectors.averagingDouble(Emp::getSalary)));",
  },
  {
    id: "sc-13", topic: "streams", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Build a Map of department → list of employee names.",
    keyPoints: [
      "groupingBy(dept) with a mapping(name, toList()) downstream collector.",
      "mapping transforms each element before collecting per group.",
    ],
    code: "Map<String,List<String>> byDept = emps.stream()\n    .collect(Collectors.groupingBy(Emp::getDept,\n             Collectors.mapping(Emp::getName, Collectors.toList())));",
  },
  {
    id: "sc-14", topic: "streams", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Get the top 3 highest-paid employees.",
    keyPoints: [
      "Sort by salary descending, then limit(3).",
      "limit short-circuits — the pipeline stops early.",
    ],
    code: "List<Emp> top3 = emps.stream()\n    .sorted(Comparator.comparing(Emp::getSalary).reversed())\n    .limit(3).collect(Collectors.toList());",
  },
  {
    id: "sc-15", topic: "streams", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Count the occurrences of each character in a string, sorted by character.",
    keyPoints: [
      "chars() → mapToObj to Character; groupingBy into a TreeMap for sorted keys; counting() downstream.",
      "TreeMap::new as the map factory keeps keys ordered.",
    ],
    code: "Map<Character,Long> freq = s.chars().mapToObj(c -> (char) c)\n    .collect(Collectors.groupingBy(c -> c, TreeMap::new, Collectors.counting()));",
  },
  {
    id: "sc-16", topic: "streams", difficulty: "hard", freq: "Very common",
    companies: ["BANK", "PRODUCT"],
    q: "Scenario: group employees by department, then within each department find the highest-paid employee.",
    keyPoints: [
      "groupingBy(dept) with maxBy(comparing salary) as the downstream collector.",
      "maxBy returns Optional<Emp>; use collectingAndThen + Optional::get to unwrap if every group is non-empty.",
    ],
    code: "Map<String, Emp> topPerDept = emps.stream()\n    .collect(Collectors.groupingBy(Emp::getDept,\n        Collectors.collectingAndThen(\n            Collectors.maxBy(Comparator.comparing(Emp::getSalary)),\n            Optional::get)));",
  },
  {
    id: "sc-17", topic: "streams", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Scenario: from a list of orders, compute total revenue per customer and sort the result by revenue descending.",
    keyPoints: [
      "groupingBy(customer) + summingDouble(amount) → Map<Customer, Double>.",
      "Stream the entrySet, sort by value reversed, collect to a LinkedHashMap to keep order.",
    ],
    code: "Map<String,Double> revenue = orders.stream()\n    .collect(Collectors.groupingBy(Order::getCustomer,\n             Collectors.summingDouble(Order::getAmount)));\nLinkedHashMap<String,Double> sorted = revenue.entrySet().stream()\n    .sorted(Map.Entry.<String,Double>comparingByValue().reversed())\n    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,\n             (a,b)->a, LinkedHashMap::new));",
  },
  {
    id: "sc-18", topic: "streams", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Find the maximum, minimum, sum, count and average of a list of integers in one pass.",
    keyPoints: [
      "mapToInt(...).summaryStatistics() returns an IntSummaryStatistics with all of them.",
      "One traversal — cleaner than five separate stream operations.",
    ],
    code: "IntSummaryStatistics stats = nums.stream()\n    .mapToInt(Integer::intValue).summaryStatistics();\n// stats.getMax(), getMin(), getSum(), getCount(), getAverage()",
  },
  {
    id: "sc-19", topic: "streams", difficulty: "hard", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Scenario: count how many employees fall in each salary band (e.g. <50k, 50k–100k, >100k).",
    keyPoints: [
      "groupingBy a classifier that returns a band label, with counting() downstream.",
      "The classifier function maps each salary to its bucket name.",
    ],
    code: "Map<String,Long> bands = emps.stream().collect(\n    Collectors.groupingBy(e -> {\n        double s = e.getSalary();\n        if (s < 50_000) return \"<50k\";\n        if (s <= 100_000) return \"50k-100k\";\n        return \">100k\";\n    }, Collectors.counting()));",
  },
  {
    id: "sc-20", topic: "streams", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Check whether all / any / none of the elements satisfy a condition.",
    keyPoints: [
      "allMatch / anyMatch / noneMatch are short-circuiting terminal ops returning boolean.",
      "On an empty stream allMatch and noneMatch return true; anyMatch returns false.",
    ],
    code: "boolean allActive = users.stream().allMatch(User::isActive);\nboolean anyAdmin  = users.stream().anyMatch(User::isAdmin);\nboolean noneBanned= users.stream().noneMatch(User::isBanned);",
  },
  {
    id: "sc-21", topic: "streams", difficulty: "hard", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Scenario: merge two Map<String,Integer> summing the values of common keys using streams.",
    keyPoints: [
      "Stream both entry sets through Collectors.toMap with a merge function (Integer::sum).",
      "Concat the two entry streams, then collect with a sum merge for duplicate keys.",
    ],
    code: "Map<String,Integer> merged = Stream.concat(\n        m1.entrySet().stream(), m2.entrySet().stream())\n    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,\n             Integer::sum));",
  },
  {
    id: "sc-22", topic: "streams", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Convert a List<Employee> to a comma-separated String of names, only for active employees.",
    keyPoints: [
      "filter → map(name) → collect(joining(\", \")).",
      "Composes filtering, projection and joining in one pipeline.",
    ],
    code: "String names = emps.stream()\n    .filter(Emp::isActive)\n    .map(Emp::getName)\n    .collect(Collectors.joining(\", \"));",
  },
  {
    id: "sc-23", topic: "streams", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Scenario: given a list of transactions, find the three most expensive ones from year 2023.",
    keyPoints: [
      "filter by year, sort by amount descending, limit(3), collect.",
      "Classic multi-step pipeline (filter → sort → limit) — a Java 8 textbook favourite.",
    ],
    code: "List<Txn> top = txns.stream()\n    .filter(t -> t.getYear() == 2023)\n    .sorted(Comparator.comparing(Txn::getAmount).reversed())\n    .limit(3)\n    .collect(Collectors.toList());",
  },
  {
    id: "sc-24", topic: "streams", difficulty: "hard", freq: "Occasional",
    companies: ["BANK", "PRODUCT"],
    q: "Scenario: find the longest word(s) in a list — handle ties.",
    keyPoints: [
      "Find the max length first, then filter words matching that length (handles ties).",
      "Single max() loses ties; computing max length then filtering keeps all of them.",
    ],
    code: "int maxLen = words.stream().mapToInt(String::length).max().orElse(0);\nList<String> longest = words.stream()\n    .filter(w -> w.length() == maxLen)\n    .collect(Collectors.toList());",
  },
  {
    id: "sc-25", topic: "streams", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Generate the first N Fibonacci numbers (or N squares) using Stream.iterate.",
    keyPoints: [
      "Stream.iterate(seed, next) with limit(N) for infinite-then-bounded generation.",
      "Java 9+ Stream.iterate(seed, hasNext, next) adds a built-in predicate to stop.",
    ],
    code: "Stream.iterate(new long[]{0,1}, f -> new long[]{f[1], f[0]+f[1]})\n    .limit(n).map(f -> f[0])\n    .forEach(System.out::println);",
  },
  {
    id: "sc-26", topic: "streams", difficulty: "hard", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Scenario: build a Map<Department, Long> of headcount but only include departments with more than 5 employees.",
    keyPoints: [
      "groupingBy(dept, counting()) first, then filter the resulting entries.",
      "Use Collectors.filtering only for per-group element filtering; here we filter whole groups afterward (or via collectingAndThen).",
    ],
    code: "Map<String,Long> big = emps.stream()\n    .collect(Collectors.groupingBy(Emp::getDept, Collectors.counting()))\n    .entrySet().stream()\n    .filter(e -> e.getValue() > 5)\n    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));",
  },

  // ===================== STRING PROBLEMS (approach + reference solution) =====================
  {
    id: "strc-1", topic: "string-coding", difficulty: "easy", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Reverse a string in place (without StringBuilder.reverse()).",
    keyPoints: [
      "Two pointers from both ends, swap inward — O(n) time, O(1) extra.",
      "Mention surrogate-pair/emoji edge case for full Unicode correctness.",
    ],
    code: `char[] c = s.toCharArray();
for (int i = 0, j = c.length - 1; i < j; i++, j--) {
    char t = c[i]; c[i] = c[j]; c[j] = t;
}
return new String(c);`,
  },
  {
    id: "strc-2", topic: "string-coding", difficulty: "easy", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Check if a string is a palindrome.",
    keyPoints: [
      "Two pointers; compare chars moving inward.",
      "Clarify case / non-alphanumeric handling up front.",
    ],
    code: `int i = 0, j = s.length() - 1;
while (i < j) if (s.charAt(i++) != s.charAt(j--)) return false;
return true;`,
  },
  {
    id: "strc-3", topic: "string-coding", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Check whether two strings are anagrams.",
    keyPoints: [
      "Lengths must match first.",
      "Optimal: a single int[26] frequency count, O(n) — beats sorting O(n log n).",
    ],
    code: `if (a.length() != b.length()) return false;
int[] f = new int[26];
for (char c : a.toCharArray()) f[c - 'a']++;
for (char c : b.toCharArray()) if (--f[c - 'a'] < 0) return false;
return true;`,
  },
  {
    id: "strc-4", topic: "string-coding", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Find the first non-repeating character.",
    keyPoints: [
      "Two passes: count frequencies, then return the first char with count 1.",
      "int[256] for ASCII; LinkedHashMap if you must preserve order with a map.",
    ],
    code: `int[] f = new int[256];
for (char c : s.toCharArray()) f[c]++;
for (char c : s.toCharArray()) if (f[c] == 1) return c;
return '_';`,
  },
  {
    id: "strc-5", topic: "string-coding", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Remove duplicate characters while preserving order.",
    keyPoints: [
      "A LinkedHashSet tracks seen chars and keeps insertion order.",
      "add() returns false for a duplicate — use that to filter.",
    ],
    code: `StringBuilder sb = new StringBuilder();
Set<Character> seen = new LinkedHashSet<>();
for (char c : s.toCharArray()) if (seen.add(c)) sb.append(c);
return sb.toString();`,
  },
  {
    id: "strc-6", topic: "string-coding", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Reverse the order of words in a sentence.",
    keyPoints: [
      "Trim, split on one-or-more spaces, reverse, re-join.",
      "Watch leading/trailing/multiple spaces — that's the trap they test.",
    ],
    code: `String[] w = s.trim().split(" +");
Collections.reverse(Arrays.asList(w));
return String.join(" ", w);`,
  },
  {
    id: "strc-7", topic: "string-coding", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Check if one string is a rotation of another.",
    keyPoints: [
      "Equal length is required.",
      "Trick: b is a rotation of a iff (a + a) contains b.",
    ],
    code: `return a.length() == b.length() && (a + a).contains(b);`,
  },
  {
    id: "strc-8", topic: "string-coding", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Count vowels and consonants in a string.",
    keyPoints: [
      "Lowercase, iterate; check membership in 'aeiou'.",
      "Only count letters — ignore digits/spaces/punctuation.",
    ],
    code: `int v = 0, c = 0;
for (char ch : s.toLowerCase().toCharArray()) {
    if (!Character.isLetter(ch)) continue;
    if ("aeiou".indexOf(ch) >= 0) v++; else c++;
}`,
  },
  {
    id: "strc-9", topic: "string-coding", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Run-length / string compression: \"aaabb\" → \"a3b2\".",
    keyPoints: [
      "Walk runs of equal chars, append char + run length.",
      "Return the original if compression didn't actually shorten it.",
    ],
    code: `StringBuilder sb = new StringBuilder();
for (int i = 0; i < s.length(); ) {
    char c = s.charAt(i); int j = i;
    while (j < s.length() && s.charAt(j) == c) j++;
    sb.append(c).append(j - i);
    i = j;
}
return sb.length() < s.length() ? sb.toString() : s;`,
  },
  {
    id: "strc-10", topic: "string-coding", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Check for balanced parentheses / brackets.",
    keyPoints: [
      "Stack: push openers, on a closer pop and match the pair.",
      "Valid only if every closer matches and the stack ends empty.",
    ],
    code: `Deque<Character> st = new ArrayDeque<>();
Map<Character,Character> pair = Map.of(')','(', ']','[', '}','{');
for (char c : s.toCharArray()) {
    if (c == '(' || c == '[' || c == '{') st.push(c);
    else if (pair.containsKey(c))
        if (st.isEmpty() || st.pop() != pair.get(c)) return false;
}
return st.isEmpty();`,
  },
  {
    id: "strc-11", topic: "string-coding", difficulty: "hard", freq: "Very common",
    companies: ["PRODUCT", "BANK"],
    q: "Longest substring without repeating characters.",
    keyPoints: [
      "Sliding window + last-seen index per char.",
      "When you see a repeat inside the window, jump start to lastSeen+1. O(n).",
    ],
    code: `int[] last = new int[256]; Arrays.fill(last, -1);
int start = 0, max = 0;
for (int i = 0; i < s.length(); i++) {
    char c = s.charAt(i);
    if (last[c] >= start) start = last[c] + 1;
    last[c] = i;
    max = Math.max(max, i - start + 1);
}
return max;`,
  },
  {
    id: "strc-12", topic: "string-coding", difficulty: "hard", freq: "Common",
    companies: ["PRODUCT", "BANK"],
    q: "Find the longest palindromic substring.",
    keyPoints: [
      "Expand-around-center: try every center (odd + even), track the longest.",
      "O(n²) time, O(1) space — the standard interview answer.",
    ],
    code: `int start = 0, len = 0;
for (int i = 0; i < s.length(); i++) {
    int a = expand(s, i, i), b = expand(s, i, i + 1);
    int m = Math.max(a, b);
    if (m > len) { len = m; start = i - (m - 1) / 2; }
}
return s.substring(start, start + len);
// expand(s,l,r): grow while s[l]==s[r], return r-l-1`,
  },
  {
    id: "strc-13", topic: "string-coding", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "PRODUCT"],
    q: "Find the longest common prefix of an array of strings.",
    keyPoints: [
      "Start with the first string as the prefix, shrink it against each next string.",
      "Bail out early if the prefix becomes empty.",
    ],
    code: `if (arr.length == 0) return "";
String p = arr[0];
for (String s : arr) {
    while (s.indexOf(p) != 0) p = p.substring(0, p.length() - 1);
    if (p.isEmpty()) return "";
}
return p;`,
  },
  {
    id: "strc-14", topic: "string-coding", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Implement atoi (string → int) with sign and trimming.",
    keyPoints: [
      "Trim, read optional +/-, accumulate digits until a non-digit.",
      "Discuss overflow handling (clamp to Integer.MIN/MAX) as the follow-up.",
    ],
    code: `s = s.trim(); int i = 0, sign = 1; long r = 0;
if (i < s.length() && (s.charAt(i) == '+' || s.charAt(i) == '-'))
    sign = s.charAt(i++) == '-' ? -1 : 1;
while (i < s.length() && Character.isDigit(s.charAt(i)))
    r = r * 10 + (s.charAt(i++) - '0');
return (int) (sign * r);`,
  },
  {
    id: "strc-15", topic: "string-coding", difficulty: "hard", freq: "Occasional",
    companies: ["PRODUCT", "BANK"],
    q: "Print all permutations of a string.",
    keyPoints: [
      "Backtracking: fix each char at position i, recurse on the rest, swap back.",
      "n! results — mention de-duping for repeated characters if asked.",
    ],
    code: `void permute(char[] a, int i, List<String> out) {
    if (i == a.length) { out.add(new String(a)); return; }
    for (int j = i; j < a.length; j++) {
        swap(a, i, j);
        permute(a, i + 1, out);
        swap(a, i, j);            // backtrack
    }
}`,
  },

  // ===================== ARRAY PROBLEMS (approach + reference solution) =====================
  {
    id: "arrc-1", topic: "array-coding", difficulty: "easy", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Find the maximum and minimum in an array in one pass.",
    keyPoints: [
      "Track max and min together, single scan — O(n).",
      "Handle empty array as an edge case.",
    ],
    code: `int max = a[0], min = a[0];
for (int x : a) { if (x > max) max = x; if (x < min) min = x; }`,
  },
  {
    id: "arrc-2", topic: "array-coding", difficulty: "easy", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Find the second-largest element in an array.",
    keyPoints: [
      "Track largest and second-largest in one pass.",
      "Guard against duplicates of the max (x < max condition).",
    ],
    code: `int max = Integer.MIN_VALUE, sec = Integer.MIN_VALUE;
for (int x : a) {
    if (x > max) { sec = max; max = x; }
    else if (x > sec && x < max) sec = x;
}
return sec;`,
  },
  {
    id: "arrc-3", topic: "array-coding", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Two Sum: return indices of two numbers adding to a target.",
    keyPoints: [
      "Hash map of value → index; for each x check if (target - x) was seen.",
      "O(n) single pass; beats the O(n²) brute force.",
    ],
    code: `Map<Integer,Integer> idx = new HashMap<>();
for (int i = 0; i < a.length; i++) {
    int need = target - a[i];
    if (idx.containsKey(need)) return new int[]{idx.get(need), i};
    idx.put(a[i], i);
}
return new int[]{-1, -1};`,
  },
  {
    id: "arrc-4", topic: "array-coding", difficulty: "hard", freq: "Very common",
    companies: ["PRODUCT", "BANK"],
    q: "Maximum subarray sum (Kadane's algorithm).",
    keyPoints: [
      "Track current running sum; restart it when it goes negative.",
      "Keep a global best. O(n), O(1) — the canonical answer.",
    ],
    code: `int best = a[0], cur = a[0];
for (int i = 1; i < a.length; i++) {
    cur = Math.max(a[i], cur + a[i]);
    best = Math.max(best, cur);
}
return best;`,
  },
  {
    id: "arrc-5", topic: "array-coding", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Find the missing number in 1..n.",
    keyPoints: [
      "Expected sum n(n+1)/2 minus actual sum = the missing value.",
      "XOR approach avoids overflow risk; mention both.",
    ],
    code: `int n = a.length + 1;
long sum = (long) n * (n + 1) / 2;
for (int x : a) sum -= x;
return (int) sum;`,
  },
  {
    id: "arrc-6", topic: "array-coding", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Find a duplicate element in an array.",
    keyPoints: [
      "General: a HashSet — first value whose add() returns false.",
      "If values are 1..n: O(1) space via Floyd's cycle or index marking.",
    ],
    code: `Set<Integer> seen = new HashSet<>();
for (int x : a) if (!seen.add(x)) return x;
return -1;`,
  },
  {
    id: "arrc-7", topic: "array-coding", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Move all zeros to the end, keeping order of non-zeros.",
    keyPoints: [
      "Stable partition: write index j for non-zeros, then fill the rest with zeros.",
      "In place, O(n), order preserved.",
    ],
    code: `int j = 0;
for (int i = 0; i < a.length; i++) if (a[i] != 0) a[j++] = a[i];
while (j < a.length) a[j++] = 0;`,
  },
  {
    id: "arrc-8", topic: "array-coding", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Rotate an array to the right by k positions.",
    keyPoints: [
      "Reversal trick: reverse all, reverse first k, reverse the rest — O(n), O(1).",
      "Normalise k with k %= n first.",
    ],
    code: `k %= a.length;
reverse(a, 0, a.length - 1);
reverse(a, 0, k - 1);
reverse(a, k, a.length - 1);
// reverse(a,l,r): swap inward between l and r`,
  },
  {
    id: "arrc-9", topic: "array-coding", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Merge two sorted arrays into one sorted array.",
    keyPoints: [
      "Two pointers, pick the smaller front each step.",
      "Drain whichever array still has elements left.",
    ],
    code: `int[] r = new int[a.length + b.length];
int i = 0, j = 0, k = 0;
while (i < a.length && j < b.length) r[k++] = a[i] <= b[j] ? a[i++] : b[j++];
while (i < a.length) r[k++] = a[i++];
while (j < b.length) r[k++] = b[j++];
return r;`,
  },
  {
    id: "arrc-10", topic: "array-coding", difficulty: "medium", freq: "Common",
    companies: ["PRODUCT", "BANK"],
    q: "Find the majority element (appears more than n/2 times).",
    keyPoints: [
      "Boyer–Moore voting: keep a candidate + count, ±1 each step.",
      "O(n) time, O(1) space; verify with a second pass if it's not guaranteed to exist.",
    ],
    code: `int count = 0, cand = 0;
for (int x : a) {
    if (count == 0) cand = x;
    count += (x == cand) ? 1 : -1;
}
return cand;`,
  },
  {
    id: "arrc-11", topic: "array-coding", difficulty: "easy", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Remove duplicates from a sorted array in place; return new length.",
    keyPoints: [
      "Slow/fast pointers: write a new element only when it differs from the last kept.",
      "O(n), O(1) — classic in-place pattern.",
    ],
    code: `if (a.length == 0) return 0;
int j = 0;
for (int i = 1; i < a.length; i++)
    if (a[i] != a[j]) a[++j] = a[i];
return j + 1;`,
  },
  {
    id: "arrc-12", topic: "array-coding", difficulty: "medium", freq: "Common",
    companies: ["PRODUCT", "BANK"],
    q: "Sort an array of 0s, 1s and 2s (Dutch National Flag).",
    keyPoints: [
      "Three pointers low/mid/high; swap 0s to front, 2s to back, leave 1s.",
      "Single pass, O(n), O(1).",
    ],
    code: `int low = 0, mid = 0, high = a.length - 1;
while (mid <= high) {
    if (a[mid] == 0) swap(a, low++, mid++);
    else if (a[mid] == 1) mid++;
    else swap(a, mid, high--);
}`,
  },
  {
    id: "arrc-13", topic: "array-coding", difficulty: "medium", freq: "Very common",
    companies: ["SERVICE", "BANK", "PRODUCT"],
    q: "Best time to buy and sell stock (max profit, one transaction).",
    keyPoints: [
      "Track the minimum price so far and the best profit at each step.",
      "O(n), O(1) — buy low, sell at the highest later peak.",
    ],
    code: `int min = Integer.MAX_VALUE, profit = 0;
for (int p : a) {
    min = Math.min(min, p);
    profit = Math.max(profit, p - min);
}
return profit;`,
  },
  {
    id: "arrc-14", topic: "array-coding", difficulty: "medium", freq: "Common",
    companies: ["SERVICE", "BANK"],
    q: "Find the intersection of two arrays.",
    keyPoints: [
      "Put one array in a HashSet, scan the other.",
      "Use a LinkedHashSet for distinct, order-preserving results.",
    ],
    code: `Set<Integer> s = new HashSet<>();
for (int x : a) s.add(x);
Set<Integer> res = new LinkedHashSet<>();
for (int x : b) if (s.contains(x)) res.add(x);
return res;`,
  },
  {
    id: "arrc-15", topic: "array-coding", difficulty: "medium", freq: "Common",
    companies: ["BANK", "PRODUCT"],
    q: "Find a contiguous subarray with a given sum (positive numbers).",
    keyPoints: [
      "Sliding window: grow the window while sum is small, shrink while too big.",
      "O(n) for non-negative numbers; prefix-sum + map handles negatives.",
    ],
    code: `int start = 0; long sum = 0;
for (int end = 0; end < a.length; end++) {
    sum += a[end];
    while (sum > target && start < end) sum -= a[start++];
    if (sum == target) return new int[]{start, end};
}
return new int[]{-1, -1};`,
  },
  {
    id: "arrc-16", topic: "array-coding", difficulty: "hard", freq: "Common",
    companies: ["PRODUCT", "BANK"],
    q: "Rotate an N×N matrix by 90° clockwise, in place.",
    keyPoints: [
      "Transpose the matrix, then reverse each row.",
      "In place, O(n²); for anticlockwise, reverse columns instead.",
    ],
    code: `int n = m.length;
for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++) {
        int t = m[i][j]; m[i][j] = m[j][i]; m[j][i] = t;   // transpose
    }
for (int[] row : m)
    for (int i = 0, j = n - 1; i < j; i++, j--) {
        int t = row[i]; row[i] = row[j]; row[j] = t;       // reverse row
    }`,
  },
];

// ---- Market insights from research (2025–2026 trend snapshot) ----
const INSIGHTS = [
  {
    title: "Concurrency is the senior filter",
    body: "Across investment banks (Barclays, JPMC, Morgan Stanley, Goldman, Citi) and product companies, multithreading and concurrency separate mid from senior. Expect JMM/happens-before, volatile vs synchronized, deadlock prevention, thread-safe singletons (DCL + volatile), ExecutorService tuning, and now virtual threads. For low-latency trading teams it's the dominant theme.",
    tag: "Banking · Product",
  },
  {
    title: "Modern Java (17–21) is now table stakes",
    body: "In 2026 interviews, records, sealed classes, pattern matching for switch, virtual threads and sequenced collections appear regularly. You won't always have used them in prod — interviewers test whether you've kept current and understand WHY each exists. 'My employer is on Java 8' is acceptable only with a clear, current explanation.",
    tag: "All companies",
  },
  {
    title: "Collections internals, not just usage",
    body: "HashMap internals (buckets, load factor 0.75, treeify at 8), ConcurrentHashMap's lock-free reads + per-bucket writes, fail-fast vs fail-safe, and LRU via LinkedHashMap are perennial. Banks especially probe what happens under concurrency and during resize.",
    tag: "All companies",
  },
  {
    title: "Service vs product vs bank — different weighting",
    body: "Service-based (TCS, Infosys, Wipro, Cognizant, Accenture, Capgemini) favour breadth: OOP, exceptions, strings, collections, Java 8 basics, plus 1–2 coding questions. Product/mid-scale push depth + modern Java + practical debugging. Banks grill concurrency, collections, serialization, and OOP design — often with a 'debug this' or 'make this thread-safe' twist.",
    tag: "Strategy",
  },
  {
    title: "Practical over puzzle at enterprise shops",
    body: "Many enterprise/bank loops skip LeetCode-style puzzles for practical Java: debug a Spring Boot endpoint, optimize a JPA query, review a concurrency bug. Be ready to reason out loud about a real snippet, not just recite definitions.",
    tag: "Banking · Enterprise",
  },
  {
    title: "Memory & JVM diagnosis earns senior points",
    body: "Being able to explain GC generations, choose G1 vs ZGC by latency need, and walk through diagnosing a memory leak or high CPU (heap dump → MAT, thread dumps, GC logs, JFR) signals production maturity that distinguishes a 5-year engineer.",
    tag: "Banking · Product",
  },
];

// ---- Resume-tailored guidance (from the uploaded CV) ----
const PROFILE = {
  name: "Mahima",
  headline: "Java Developer · 4.5+ yrs · Barclays (Corporate Banking) · Pune",
  strengths: [
    "Java 8→21 migration experience — lean into language-evolution questions (records, sealed, pattern matching, virtual threads) as lived experience, not theory.",
    "Spring→Spring Boot upgrade, caching, security, logging — pairs naturally with JVM/memory and modern-Java topics.",
    "Production release ownership + RCA + 99.9% uptime — strong material for the 'debug a concurrency/memory issue' style questions banks love.",
    "Already in banking domain — you're the target profile for investment-bank concurrency rounds.",
  ],
  focus: [
    { topic: "concurrency", why: "Highest-yield for banking switches and your current domain. Go deep: JMM, locks vs atomics, thread pools, virtual threads." },
    { topic: "collections", why: "Internals (HashMap/ConcurrentHashMap) are asked in nearly every loop; bank rounds add the concurrency twist." },
    { topic: "modern", why: "You migrated Java 8→21 — convert that into confident answers on records, sealed, pattern matching, virtual threads." },
    { topic: "jvm", why: "Your release/RCA background makes GC + memory-leak diagnosis a credible senior differentiator." },
  ],
  gaps: [
    "Resume lists OpenShift/AWS/Docker as 'learned, not worked on' — keep core Java answers tight so the conversation stays on your strengths; we'll build a separate phase for cloud/containers.",
    "Add concrete metrics when you answer (you already quantify: 30% fewer vulnerabilities, 90%+ coverage) — bring that habit into verbal answers.",
  ],
};
// ============================================================
//  Core Java Prep — single-file dashboard
// ============================================================

const ICONS = { Boxes, Hash, Layers, Cpu, Shield, Zap, Sparkles, Code2, Database, Terminal };
const COMPANY_LABELS = { SERVICE: "Service-based", BANK: "Banking", PRODUCT: "Product" };
const COMPANY_SHORT = { SERVICE: "Service", BANK: "Bank", PRODUCT: "Product" };
const STORE_KEY = "coreJavaPrep_v1";

const topicById = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
const getState = (p, id) => p[id] || { status: "new", bookmarked: false, note: "" };

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

.cjp *{box-sizing:border-box;margin:0;padding:0}
.cjp{
  --bg:#0A0C10; --bg2:#0E1117; --panel:#12151D; --panel2:#161A23; --elev:#1B2030;
  --line:#232A38; --line-soft:#1A1F2B;
  --ink:#ECEEF3; --dim:#9AA2B2; --faint:#646C7E;
  --amber:#F2A93B; --amber2:#FFC56E; --amber-bg:rgba(242,169,59,.13);
  --indigo:#8896FF; --indigo-bg:rgba(136,150,255,.13);
  --emerald:#2FD3A0; --emerald-bg:rgba(47,211,160,.13);
  --rose:#FF6B8A; --rose-bg:rgba(255,107,138,.13);
  --mono:'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace;
  --sans:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
  font-family:var(--sans); color:var(--ink); background:var(--bg);
  min-height:100vh; -webkit-font-smoothing:antialiased; line-height:1.5;
}
.cjp.light{
  --bg:#F3F5F8; --bg2:#FFFFFF; --panel:#FFFFFF; --panel2:#FAFBFD; --elev:#FFFFFF;
  --line:#E5E9F0; --line-soft:#EDF0F5;
  --ink:#161B26; --dim:#5A6473; --faint:#929BAB;
  --amber-bg:rgba(242,169,59,.16); --indigo-bg:rgba(136,150,255,.16);
  --emerald-bg:rgba(47,211,160,.16); --rose-bg:rgba(255,107,138,.16);
}
.cjp button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
.cjp::selection,.cjp ::selection{background:var(--amber);color:#0A0C10}

/* shell */
.shell{display:grid;grid-template-columns:264px 1fr;min-height:100vh}
.rail{position:sticky;top:0;height:100vh;overflow-y:auto;background:var(--bg2);
  border-right:1px solid var(--line-soft);display:flex;flex-direction:column;padding:20px 14px}
.main{min-width:0;padding:30px 36px 80px}
@media(max-width:880px){
  .shell{grid-template-columns:1fr}
  .rail{position:static;height:auto;flex-direction:row;align-items:center;gap:10px;
    overflow-x:auto;border-right:none;border-bottom:1px solid var(--line-soft);padding:12px 14px}
  .rail .rail-topics,.rail .rail-foot{display:none}
  .main{padding:20px 16px 64px}
}

/* brand */
.brand{display:flex;align-items:center;gap:11px;padding:6px 8px 18px;white-space:nowrap}
.brand .mark{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;
  background:linear-gradient(140deg,var(--amber),#C9791A);color:#1a1205;flex:none;
  box-shadow:0 4px 16px rgba(242,169,59,.32)}
.brand .bt{font-weight:800;letter-spacing:-.3px;font-size:15px}
.brand .bs{font-family:var(--mono);font-size:10.5px;color:var(--faint);letter-spacing:.5px;text-transform:uppercase}
@media(max-width:880px){.brand{padding:0 4px 0 0}.brand .bs{display:none}}

/* nav */
.nav{display:flex;flex-direction:column;gap:3px}
@media(max-width:880px){.nav{flex-direction:row}}
.navi{display:flex;align-items:center;gap:11px;padding:9px 11px;border-radius:9px;
  color:var(--dim);font-weight:600;font-size:13.5px;transition:.16s;white-space:nowrap}
.navi:hover{background:var(--panel);color:var(--ink)}
.navi.on{background:var(--amber-bg);color:var(--amber2)}
.navi.on svg{color:var(--amber)}

.rail-lbl{font-family:var(--mono);font-size:10px;letter-spacing:1.4px;text-transform:uppercase;
  color:var(--faint);padding:18px 10px 8px}
.rail-topics{display:flex;flex-direction:column;gap:1px}
.tline{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;
  color:var(--dim);font-size:12.5px;font-weight:500;transition:.15s;position:relative}
.tline:hover{background:var(--panel)}
.tline.on{background:var(--panel);color:var(--ink)}
.tline .spine{width:3px;height:18px;border-radius:3px;background:var(--line);flex:none;overflow:hidden;position:relative}
.tline .spine i{position:absolute;bottom:0;left:0;width:100%;background:var(--amber);border-radius:3px;transition:height .5s}
.tline .tn{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tline .tc{font-family:var(--mono);font-size:10.5px;color:var(--faint)}

.rail-foot{margin-top:auto;padding-top:14px;display:flex;flex-direction:column;gap:6px}
.gbtn{display:flex;align-items:center;gap:9px;padding:8px 11px;border-radius:9px;color:var(--dim);
  font-size:12.5px;font-weight:600;transition:.15s;border:1px solid transparent}
.gbtn:hover{background:var(--panel);color:var(--ink);border-color:var(--line-soft)}

/* hero console */
.console{background:var(--panel);border:1px solid var(--line);border-radius:16px;overflow:hidden;
  box-shadow:0 24px 60px -30px rgba(0,0,0,.6)}
.console .chrome{display:flex;align-items:center;gap:7px;padding:12px 16px;border-bottom:1px solid var(--line-soft);
  background:var(--panel2)}
.console .dot{width:11px;height:11px;border-radius:50%}
.console .chrome .ct{margin-left:10px;font-family:var(--mono);font-size:11.5px;color:var(--faint)}
.console .body{padding:26px 28px;display:flex;justify-content:space-between;gap:28px;align-items:center;flex-wrap:wrap}
.cprompt{font-family:var(--mono);font-size:13px;line-height:2;min-width:280px;flex:1}
.cprompt .pfx{color:var(--emerald)}
.cprompt .path{color:var(--indigo)}
.cprompt .cmd{color:var(--ink)}
.cprompt .out{color:var(--dim);font-size:12.5px}
.cprompt .hl{color:var(--amber2)}
.curs{display:inline-block;width:8px;height:15px;background:var(--amber);vertical-align:-2px;margin-left:3px;animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.cgauge{display:flex;flex-direction:column;align-items:center;gap:6px}
.cgauge .pct{font-weight:800;font-size:26px;letter-spacing:-1px}
.cgauge .pl{font-family:var(--mono);font-size:10px;letter-spacing:1px;color:var(--faint);text-transform:uppercase}
.ring{transform:rotate(0)}
.ring-fill{transition:stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)}

/* stat cards */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:18px}
@media(max-width:880px){.stats{grid-template-columns:repeat(2,1fr)}}
.stat{background:var(--panel);border:1px solid var(--line-soft);border-radius:13px;padding:16px 17px}
.stat .si{width:32px;height:32px;border-radius:8px;display:grid;place-items:center;margin-bottom:11px}
.stat .sv{font-size:24px;font-weight:800;letter-spacing:-.6px}
.stat .sl{font-size:12px;color:var(--dim);margin-top:1px}

.sec-h{display:flex;align-items:center;gap:10px;margin:30px 0 14px}
.sec-h .eb{font-family:var(--mono);font-size:10.5px;letter-spacing:1.4px;text-transform:uppercase;color:var(--faint)}
.sec-h h2{font-size:17px;font-weight:700;letter-spacing:-.3px}
.sec-h .ln{flex:1;height:1px;background:var(--line-soft)}

/* topic progress grid */
.tpgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
@media(max-width:880px){.tpgrid{grid-template-columns:1fr}}
.tpc{background:var(--panel);border:1px solid var(--line-soft);border-radius:12px;padding:14px 15px;
  display:flex;align-items:center;gap:13px;transition:.16s;text-align:left;width:100%}
.tpc:hover{border-color:var(--line);transform:translateY(-1px)}
.tpc .ti{width:36px;height:36px;border-radius:9px;display:grid;place-items:center;flex:none;
  background:var(--amber-bg);color:var(--amber)}
.tpc .tmid{flex:1;min-width:0}
.tpc .tt{font-weight:600;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tpc .tb{font-size:11.5px;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tpc .bar{height:5px;border-radius:4px;background:var(--line);margin-top:8px;overflow:hidden}
.tpc .bar i{display:block;height:100%;background:linear-gradient(90deg,var(--amber),var(--amber2));border-radius:4px;transition:width .5s}
.tpc .tpn{font-family:var(--mono);font-size:11px;color:var(--dim);flex:none}

/* insights */
.icards{display:grid;grid-template-columns:repeat(2,1fr);gap:13px}
@media(max-width:880px){.icards{grid-template-columns:1fr}}
.icard{background:var(--panel);border:1px solid var(--line-soft);border-radius:13px;padding:17px 18px;position:relative;overflow:hidden}
.icard::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--indigo)}
.icard h3{font-size:14px;font-weight:700;margin-bottom:7px;letter-spacing:-.2px}
.icard p{font-size:12.8px;color:var(--dim);line-height:1.6}
.icard .it{display:inline-block;margin-top:11px;font-family:var(--mono);font-size:10px;letter-spacing:.6px;
  text-transform:uppercase;color:var(--indigo);background:var(--indigo-bg);padding:3px 8px;border-radius:5px}

/* profile */
.prof{background:linear-gradient(150deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:15px;padding:20px 22px}
.prof .ph{display:flex;align-items:center;gap:13px;margin-bottom:5px}
.prof .pav{width:42px;height:42px;border-radius:11px;background:var(--amber-bg);color:var(--amber);
  display:grid;place-items:center;font-weight:800;flex:none;border:1px solid rgba(242,169,59,.3)}
.prof .pn{font-weight:700;font-size:15px}
.prof .pj{font-size:12px;color:var(--dim);font-family:var(--mono)}
.plist{margin-top:14px;display:flex;flex-direction:column;gap:9px}
.pli{display:flex;gap:10px;font-size:12.8px;color:var(--dim);line-height:1.55}
.pli svg{flex:none;margin-top:2px}
.pfocus{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}
@media(max-width:880px){.pfocus{grid-template-columns:1fr}}
.pfc{background:var(--bg2);border:1px solid var(--line-soft);border-radius:11px;padding:12px 13px;text-align:left;transition:.15s}
.pfc:hover{border-color:var(--amber);background:var(--amber-bg)}
.pfc .pft{display:flex;align-items:center;gap:8px;font-weight:600;font-size:13px;margin-bottom:4px}
.pfc .pfw{font-size:11.6px;color:var(--faint);line-height:1.5}

/* filter bar */
.fbar{position:sticky;top:0;z-index:5;background:var(--bg);padding:6px 0 14px;margin:-6px 0 0}
.search{display:flex;align-items:center;gap:10px;background:var(--panel);border:1px solid var(--line);
  border-radius:11px;padding:11px 14px;transition:.15s}
.search:focus-within{border-color:var(--amber)}
.search input{flex:1;background:none;border:none;outline:none;color:var(--ink);font-size:14px}
.search input::placeholder{color:var(--faint)}
.search .rc{font-family:var(--mono);font-size:11px;color:var(--faint);white-space:nowrap}
.chiprow{display:flex;gap:7px;overflow-x:auto;padding:12px 0 2px;scrollbar-width:none}
.chiprow::-webkit-scrollbar{display:none}
.chip{padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;white-space:nowrap;
  background:var(--panel);border:1px solid var(--line-soft);color:var(--dim);transition:.14s;flex:none;
  display:inline-flex;align-items:center;gap:6px}
.chip:hover{color:var(--ink);border-color:var(--line)}
.chip.on{background:var(--amber-bg);border-color:rgba(242,169,59,.4);color:var(--amber2)}
.chip .cc{font-family:var(--mono);font-size:10px;opacity:.7}
.fgroup{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px;align-items:center}
.fglbl{font-family:var(--mono);font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--faint);margin-right:2px}
.chip.sm{padding:5px 10px;font-size:11.5px}

/* question card */
.qlist{display:flex;flex-direction:column;gap:10px;margin-top:6px}
.qc{background:var(--panel);border:1px solid var(--line-soft);border-radius:13px;transition:.16s;overflow:hidden}
.qc:hover{border-color:var(--line)}
.qc.open{border-color:var(--line)}
.qc.mastered{border-color:rgba(47,211,160,.35)}
.qhead{display:flex;gap:13px;padding:16px 17px;align-items:flex-start;cursor:pointer}
.qstatus{width:24px;height:24px;border-radius:50%;border:2px solid var(--line);flex:none;margin-top:1px;
  display:grid;place-items:center;transition:.15s;background:var(--bg2)}
.qstatus.learning{border-color:var(--amber);color:var(--amber)}
.qstatus.mastered{border-color:var(--emerald);background:var(--emerald);color:#06281d}
.qmain{flex:1;min-width:0}
.qmeta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:7px}
.qq{font-size:14.5px;font-weight:600;letter-spacing:-.2px;line-height:1.45}
.badge{font-family:var(--mono);font-size:9.5px;letter-spacing:.4px;text-transform:uppercase;
  padding:2.5px 7px;border-radius:5px;font-weight:600}
.badge.easy{color:var(--emerald);background:var(--emerald-bg)}
.badge.medium{color:var(--amber2);background:var(--amber-bg)}
.badge.hard{color:var(--rose);background:var(--rose-bg)}
.badge.co{color:var(--indigo);background:var(--indigo-bg)}
.badge.freq{color:var(--dim);background:var(--line-soft)}
.badge.deep{color:var(--amber2);background:var(--amber-bg);border:1px solid rgba(242,169,59,.4)}
.a.own,.fa.own{color:var(--faint);font-style:italic;font-size:13px}
.qicons{display:flex;align-items:center;gap:4px;flex:none}
.qib{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;color:var(--faint);transition:.14s}
.qib:hover{background:var(--bg2);color:var(--ink)}
.qib.bm{color:var(--amber)}
.qib .chev{transition:transform .2s}
.qc.open .chev{transform:rotate(90deg)}

.qbody{padding:0 17px 17px 54px;animation:slide .25s ease}
@keyframes slide{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
.qbody .a{font-size:13.6px;color:var(--ink);line-height:1.68;opacity:.92}
.kp{margin-top:13px;background:var(--bg2);border:1px solid var(--line-soft);border-radius:10px;padding:12px 14px}
.kp .kh{font-family:var(--mono);font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--amber);margin-bottom:8px;
  display:flex;align-items:center;gap:6px}
.kp ul{list-style:none;display:flex;flex-direction:column;gap:6px}
.kp li{font-size:12.6px;color:var(--dim);line-height:1.5;display:flex;gap:8px}
.kp li::before{content:"▹";color:var(--amber);flex:none}
.code{margin-top:12px;background:#070A0F;border:1px solid var(--line);border-radius:10px;padding:13px 15px;overflow-x:auto}
.cjp.light .code{background:#0E1117}
.code pre{font-family:var(--mono);font-size:12px;line-height:1.65;color:#d7dcea;white-space:pre}
.note{margin-top:12px}
.note .nh{font-family:var(--mono);font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--faint);margin-bottom:6px;
  display:flex;align-items:center;gap:6px}
.note textarea{width:100%;background:var(--bg2);border:1px solid var(--line-soft);border-radius:9px;
  padding:10px 12px;color:var(--ink);font-family:var(--sans);font-size:13px;resize:vertical;min-height:52px;outline:none;transition:.15s}
.note textarea:focus{border-color:var(--amber)}
.markbtns{display:flex;gap:8px;margin-top:13px;flex-wrap:wrap}
.mbtn{padding:8px 14px;border-radius:9px;font-size:12.5px;font-weight:600;border:1px solid var(--line);
  color:var(--dim);transition:.15s;display:inline-flex;align-items:center;gap:7px}
.mbtn:hover{color:var(--ink);border-color:var(--dim)}
.mbtn.learn.on{background:var(--amber-bg);border-color:rgba(242,169,59,.4);color:var(--amber2)}
.mbtn.master.on{background:var(--emerald-bg);border-color:rgba(47,211,160,.4);color:var(--emerald)}

.empty{text-align:center;padding:70px 20px;color:var(--faint)}
.empty svg{margin-bottom:14px;opacity:.5}
.empty .et{font-weight:600;color:var(--dim);font-size:15px}
.empty .es{font-size:13px;margin-top:5px}

/* practice */
.prac{max-width:720px;margin:0 auto}
.pbarw{height:6px;border-radius:4px;background:var(--line);overflow:hidden;margin:14px 0 4px}
.pbarw i{display:block;height:100%;background:linear-gradient(90deg,var(--amber),var(--amber2));transition:width .4s}
.pinfo{display:flex;justify-content:space-between;font-family:var(--mono);font-size:11px;color:var(--faint);margin-bottom:20px}
.flash{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:30px 30px 26px;min-height:280px;
  display:flex;flex-direction:column;box-shadow:0 24px 60px -34px rgba(0,0,0,.6)}
.flash .fmeta{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px}
.flash .fq{font-size:19px;font-weight:700;letter-spacing:-.4px;line-height:1.4}
.flash .reveal{margin-top:auto;padding-top:22px}
.flash .revealbtn{width:100%;padding:14px;border-radius:12px;background:var(--amber-bg);border:1px dashed rgba(242,169,59,.45);
  color:var(--amber2);font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;gap:9px;transition:.15s}
.flash .revealbtn:hover{background:rgba(242,169,59,.2)}
.flash .fa{margin-top:18px;font-size:14px;color:var(--ink);line-height:1.7;opacity:.92;animation:slide .3s}
.pgrade{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-top:18px}
.gbtn2{padding:15px;border-radius:13px;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;gap:9px;transition:.15s;border:1px solid}
.gbtn2.again{background:var(--amber-bg);border-color:rgba(242,169,59,.4);color:var(--amber2)}
.gbtn2.again:hover{background:rgba(242,169,59,.22)}
.gbtn2.good{background:var(--emerald-bg);border-color:rgba(47,211,160,.4);color:var(--emerald)}
.gbtn2.good:hover{background:rgba(47,211,160,.22)}
.pracdone{text-align:center;padding:50px 20px}
.pracdone .pdr{width:84px;height:84px;border-radius:50%;background:var(--emerald-bg);color:var(--emerald);
  display:grid;place-items:center;margin:0 auto 20px}
.pracdone h2{font-size:22px;font-weight:800;letter-spacing:-.5px}
.pracdone p{color:var(--dim);margin-top:8px;font-size:14px}
.pracctrl{display:flex;gap:10px;justify-content:center;margin-bottom:18px;flex-wrap:wrap}

.page-h{margin-bottom:4px}
.page-h h1{font-size:26px;font-weight:800;letter-spacing:-.7px}
.page-h p{color:var(--dim);font-size:13.5px;margin-top:4px}
/* console / playground */
.con-wrap{max-width:980px;margin:0 auto}
.con-tools{display:flex;align-items:center;gap:10px;margin:16px 0 12px;flex-wrap:wrap}
.con-tools select{padding:8px 12px;border-radius:9px;background:var(--panel);border:1px solid var(--line);
  color:var(--ink);font-family:var(--sans);font-size:12.5px;font-weight:600;outline:none}
.con-spacer{flex:1}
.runbtn{display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border-radius:10px;font-weight:700;font-size:13.5px;
  background:linear-gradient(140deg,var(--amber),#D98A24);color:#1a1205;transition:.15s;box-shadow:0 6px 18px -8px rgba(242,169,59,.6)}
.runbtn:hover{filter:brightness(1.06)}
.runbtn:disabled{opacity:.55;cursor:default;box-shadow:none}
.ghbtn{display:inline-flex;align-items:center;gap:7px;padding:9px 13px;border-radius:10px;border:1px solid var(--line);
  color:var(--dim);font-weight:600;font-size:12.5px;transition:.15s}
.ghbtn:hover{color:var(--ink);border-color:var(--dim)}
.editor-wrap{background:#06090E;border:1px solid var(--line);border-radius:13px;overflow:hidden}
.cjp.light .editor-wrap{background:#0E1117}
.editor-bar{display:flex;align-items:center;gap:7px;padding:9px 14px;border-bottom:1px solid var(--line);background:rgba(255,255,255,.025)}
.editor-bar .dot{width:10px;height:10px;border-radius:50%}
.editor-bar .ef{margin-left:8px;font-family:var(--mono);font-size:11px;color:var(--faint)}
.editor{width:100%;min-height:320px;background:transparent;border:none;outline:none;resize:vertical;
  color:#dbe0ee;font-family:var(--mono);font-size:13px;line-height:1.7;padding:16px 18px;tab-size:4;white-space:pre;overflow:auto;display:block}
.stdin-row{margin-top:10px;display:flex;flex-direction:column;gap:6px}
.stdin-row label{font-family:var(--mono);font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--faint)}
.stdin-row textarea{background:var(--panel);border:1px solid var(--line-soft);border-radius:9px;padding:9px 12px;
  color:var(--ink);font-family:var(--mono);font-size:12px;resize:vertical;min-height:38px;outline:none;transition:.15s}
.stdin-row textarea:focus{border-color:var(--amber)}
.cout{margin-top:14px;background:var(--panel);border:1px solid var(--line);border-radius:13px;overflow:hidden}
.cout .ch{display:flex;align-items:center;gap:9px;padding:11px 15px;border-bottom:1px solid var(--line-soft);
  font-family:var(--mono);font-size:11px;color:var(--faint);flex-wrap:wrap}
.cout .status{display:inline-flex;align-items:center;gap:6px;font-weight:700;padding:3px 9px;border-radius:6px;
  font-size:10px;letter-spacing:.5px;text-transform:uppercase}
.status.ok{color:var(--emerald);background:var(--emerald-bg)}
.status.compile,.status.runtime,.status.neterr{color:var(--rose);background:var(--rose-bg)}
.cout pre{padding:15px 17px;font-family:var(--mono);font-size:12.5px;line-height:1.65;color:#dbe0ee;
  white-space:pre-wrap;word-break:break-word;overflow-x:auto;max-height:380px;overflow-y:auto}
.cout pre.err{color:var(--rose)}
.cout .placeholder{padding:34px 17px;text-align:center;color:var(--faint);font-size:13px}
.spin{animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.con-note{margin-top:12px;font-size:11.5px;color:var(--faint);display:flex;align-items:flex-start;gap:7px;line-height:1.55}
.coding-banner{display:flex;align-items:center;gap:14px;background:linear-gradient(140deg,var(--panel2),var(--panel));
  border:1px solid var(--line);border-radius:13px;padding:14px 16px;margin-bottom:14px}
.coding-banner .cbi{width:40px;height:40px;border-radius:10px;background:var(--amber-bg);color:var(--amber);
  display:grid;place-items:center;flex:none}
.coding-banner .cbt{flex:1;min-width:0}
.coding-banner .cbt b{font-size:14px}
.coding-banner .cbt p{font-size:12px;color:var(--dim);margin-top:2px}
@media(max-width:880px){.coding-banner{flex-wrap:wrap}.coding-banner .cbt{flex-basis:100%}}

/* daily tracker */
.trk{max-width:760px;margin:0 auto}
.trk-streaks{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}
@media(max-width:880px){.trk-streaks{grid-template-columns:repeat(2,1fr)}}
.trk-stat{background:var(--panel);border:1px solid var(--line-soft);border-radius:13px;padding:15px 14px;text-align:center}
.trk-stat .v{font-size:25px;font-weight:800;letter-spacing:-.6px;display:flex;align-items:center;justify-content:center;gap:7px}
.trk-stat .l{font-size:11px;color:var(--dim);margin-top:3px}
.trk-stat.fire .v{color:var(--amber)}
.mark-today{width:100%;padding:13px;border-radius:12px;font-weight:700;font-size:14px;display:flex;align-items:center;
  justify-content:center;gap:9px;background:var(--amber-bg);border:1px dashed rgba(242,169,59,.45);color:var(--amber2);
  margin-bottom:16px;transition:.15s}
.mark-today:hover{background:rgba(242,169,59,.2)}
.mark-today.done{background:var(--emerald-bg);border-color:rgba(47,211,160,.45);color:var(--emerald);border-style:solid}
.cal{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px 20px 22px}
.cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:10px}
.cal-head .mo{font-size:16px;font-weight:700;letter-spacing:-.2px}
.cal-nav{display:flex;gap:6px;align-items:center}
.cal-nav button{height:32px;min-width:32px;padding:0 9px;border-radius:9px;border:1px solid var(--line);color:var(--dim);
  display:grid;place-items:center;transition:.15s;font-size:12px;font-weight:600}
.cal-nav button:hover{color:var(--ink);border-color:var(--dim)}
.cal-nav button:disabled{opacity:.35;pointer-events:none}
.dow{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin-bottom:8px}
.dow span{text-align:center;font-family:var(--mono);font-size:10px;letter-spacing:.5px;color:var(--faint);text-transform:uppercase}
.grid7{display:grid;grid-template-columns:repeat(7,1fr);gap:7px}
.day{aspect-ratio:1;border-radius:11px;border:1px solid var(--line-soft);background:var(--bg2);display:flex;
  align-items:center;justify-content:center;transition:.14s;position:relative;color:var(--dim);font-size:13px;font-weight:600}
.day:not(.empty):not(.future):hover{border-color:var(--amber);color:var(--ink)}
.day.empty{border:none;background:none;pointer-events:none}
.day.future{opacity:.32;pointer-events:none}
.day.today{border-color:var(--amber);box-shadow:inset 0 0 0 1px var(--amber)}
.day.done{background:linear-gradient(150deg,var(--amber),#D98A24);border-color:transparent;color:#1a1205}
.day .chk{position:absolute;top:5px;right:6px}
.trk-note{margin-top:14px;font-size:11.5px;color:var(--faint);text-align:center;line-height:1.5}

@media(prefers-reduced-motion:reduce){.cjp *{animation:none!important;transition:none!important}}
:focus-visible{outline:2px solid var(--amber);outline-offset:2px;border-radius:6px}
`;

function Ring({ pct, size = 118, stroke = 9, color = "var(--amber)" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, pct)));
  return (
    <svg width={size} height={size} className="ring">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--line)" strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} className="ring-fill" />
    </svg>
  );
}

function useProgress() {
  const [progress, setProgress] = useState({});
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (__store) {
          const r = await __store.get(STORE_KEY);
          if (active && r && r.value) setProgress(JSON.parse(r.value));
        }
      } catch (e) { /* fall back to memory */ }
      if (active) setLoaded(true);
    })();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      try {
        if (__store)
          await __store.set(STORE_KEY, JSON.stringify(progress));
      } catch (e) { /* ignore */ }
    }, 300);
    return () => clearTimeout(t);
  }, [progress, loaded]);
  return [progress, setProgress];
}

function usePersisted(key, initial) {
  const [val, setVal] = useState(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        if (__store) {
          const r = await __store.get(key);
          if (on && r && r.value) setVal(JSON.parse(r.value));
        }
      } catch (e) { /* memory fallback */ }
      if (on) setLoaded(true);
    })();
    return () => { on = false; };
  }, [key]);
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      try {
        if (__store)
          await __store.set(key, JSON.stringify(val));
      } catch (e) { /* ignore */ }
    }, 300);
    return () => clearTimeout(t);
  }, [val, loaded, key]);
  return [val, setVal];
}

// ---- date helpers (local, no UTC drift) ----
const pad2 = (n) => String(n).padStart(2, "0");
const dateKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseKey = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const isNextDay = (a, b) => dateKey(addDays(parseKey(a), 1)) === b;

function computeStreaks(att) {
  const marked = Object.keys(att).filter((k) => att[k]).sort();
  if (marked.length === 0) return { current: 0, longest: 0, total: 0 };
  let longest = 1, run = 1;
  for (let i = 1; i < marked.length; i++) {
    run = isNextDay(marked[i - 1], marked[i]) ? run + 1 : 1;
    if (run > longest) longest = run;
  }
  const today = dateKey(new Date());
  const yest = dateKey(addDays(new Date(), -1));
  let current = 0;
  const last = marked[marked.length - 1];
  if (last === today || last === yest) {
    current = 1;
    for (let i = marked.length - 2; i >= 0; i--) {
      if (isNextDay(marked[i], marked[i + 1])) current++; else break;
    }
  }
  return { current, longest, total: marked.length };
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function QuestionCard({ q, st, onStatus, onBookmark, onNote }) {
  const [open, setOpen] = useState(false);
  const topic = topicById[q.topic];
  return (
    <div className={`qc ${open ? "open" : ""} ${st.status === "mastered" ? "mastered" : ""}`}>
      <div className="qhead" onClick={() => setOpen((o) => !o)}>
        <button
          className={`qstatus ${st.status}`}
          title="Cycle status: new → learning → mastered"
          onClick={(e) => {
            e.stopPropagation();
            const next = st.status === "new" ? "learning" : st.status === "learning" ? "mastered" : "new";
            onStatus(q.id, next);
          }}
        >
          {st.status === "mastered" ? <Check size={13} strokeWidth={3} /> : st.status === "learning" ? <CircleDot size={11} /> : null}
        </button>
        <div className="qmain">
          <div className="qmeta">
            <span className="badge freq">{topic.name.split(" ")[0]}</span>
            <span className={`badge ${q.difficulty}`}>{q.difficulty}</span>
            {q.companies.map((c) => (
              <span key={c} className="badge co">{COMPANY_SHORT[c]}</span>
            ))}
            <span className="badge freq">{q.freq}</span>
            {q.deep && <span className="badge deep">Deep dive</span>}
          </div>
          <div className="qq">{q.q}</div>
        </div>
        <div className="qicons" onClick={(e) => e.stopPropagation()}>
          <button className={`qib ${st.bookmarked ? "bm" : ""}`} title="Bookmark" onClick={() => onBookmark(q.id)}>
            <Bookmark size={16} fill={st.bookmarked ? "currentColor" : "none"} />
          </button>
          <button className="qib" onClick={() => setOpen((o) => !o)} title={open ? "Collapse" : "Expand"}>
            <ChevronRight size={17} className="chev" />
          </button>
        </div>
      </div>
      {open && (
        <div className="qbody">
          {q.a
            ? <p className="a">{q.a}</p>
            : <p className="a own">Talking points below — recall it in your own words, then capture your answer in the notes.</p>}
          {q.keyPoints && (
            <div className="kp">
              <div className="kh"><Target size={12} /> Talking points</div>
              <ul>{q.keyPoints.map((k, i) => <li key={i}>{k}</li>)}</ul>
            </div>
          )}
          {q.code && (
            <div className="code"><pre>{q.code}</pre></div>
          )}
          <div className="note">
            <div className="nh"><BookOpen size={12} /> Your notes</div>
            <textarea
              placeholder="Add your own phrasing, a story from work, or a follow-up to drill…"
              value={st.note}
              onChange={(e) => onNote(q.id, e.target.value)}
            />
          </div>
          <div className="markbtns">
            <button className={`mbtn learn ${st.status === "learning" ? "on" : ""}`}
              onClick={() => onStatus(q.id, st.status === "learning" ? "new" : "learning")}>
              <CircleDot size={14} /> Still learning
            </button>
            <button className={`mbtn master ${st.status === "mastered" ? "on" : ""}`}
              onClick={() => onStatus(q.id, st.status === "mastered" ? "new" : "mastered")}>
              <Check size={14} strokeWidth={3} /> Mastered
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Dashboard({ progress, stats, topicStats, setView, setTopic, streak }) {
  return (
    <div>
      <div className="console">
        <div className="chrome">
          <span className="dot" style={{ background: "#FF5F57" }} />
          <span className="dot" style={{ background: "#FEBC2E" }} />
          <span className="dot" style={{ background: "#28C840" }} />
          <span className="ct">~/core-java-prep — phase 1</span>
        </div>
        <div className="body">
          <div className="cprompt">
            <div><span className="pfx">{PROFILE.name.toLowerCase()}@switch</span>:<span className="path">~/core-java</span>$ <span className="cmd">./prep --resume</span></div>
            <div className="out">→ loaded <span className="hl">{stats.total}</span> curated questions across <span className="hl">{TOPICS.length}</span> topics</div>
            <div className="out">→ target: <span className="hl">banking + product + service</span> switch · 3–6 yrs</div>
            <div className="out">→ mastered <span className="hl">{stats.mastered}</span> · learning <span className="hl">{stats.learning}</span> · bookmarked <span className="hl">{stats.bookmarked}</span></div>
            <div className="out">→ study streak: <span className="hl">{streak}</span> day{streak === 1 ? "" : "s"} — <span className="hl" style={{ cursor: "pointer" }} onClick={() => setView("tracker")}>open tracker</span><span className="curs" /></div>
          </div>
          <div className="cgauge">
            <div style={{ position: "relative", width: 118, height: 118 }}>
              <Ring pct={stats.total ? stats.mastered / stats.total : 0} />
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", flexDirection: "column" }}>
                <div style={{ textAlign: "center" }}>
                  <div className="pct">{stats.total ? Math.round((stats.mastered / stats.total) * 100) : 0}%</div>
                  <div className="pl">mastered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="stats">
        {[
          { ic: <ListChecks size={17} />, c: "var(--indigo)", bg: "var(--indigo-bg)", v: stats.total, l: "Total questions" },
          { ic: <Award size={17} />, c: "var(--emerald)", bg: "var(--emerald-bg)", v: stats.mastered, l: "Mastered" },
          { ic: <Flame size={17} />, c: "var(--amber)", bg: "var(--amber-bg)", v: stats.learning, l: "In progress" },
          { ic: <Bookmark size={17} />, c: "var(--rose)", bg: "var(--rose-bg)", v: stats.bookmarked, l: "Bookmarked" },
        ].map((s, i) => (
          <div className="stat" key={i}>
            <div className="si" style={{ background: s.bg, color: s.c }}>{s.ic}</div>
            <div className="sv">{s.v}</div>
            <div className="sl">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="sec-h">
        <span className="eb">// progress</span>
        <h2>Topics</h2>
        <span className="ln" />
      </div>
      <div className="tpgrid">
        {TOPICS.map((t) => {
          const ts = topicStats[t.id];
          const Icon = ICONS[t.icon] || Boxes;
          const pct = ts.total ? ts.mastered / ts.total : 0;
          return (
            <button className="tpc" key={t.id} onClick={() => { setTopic(t.id); setView("questions"); }}>
              <div className="ti"><Icon size={18} /></div>
              <div className="tmid">
                <div className="tt">{t.name}</div>
                <div className="tb">{t.blurb}</div>
                <div className="bar"><i style={{ width: `${pct * 100}%` }} /></div>
              </div>
              <div className="tpn">{ts.mastered}/{ts.total}</div>
            </button>
          );
        })}
      </div>

      <div className="sec-h">
        <span className="eb">// research</span>
        <h2>Market insights · 2025–26</h2>
        <span className="ln" />
      </div>
      <div className="icards">
        {INSIGHTS.map((ins, i) => (
          <div className="icard" key={i}>
            <h3>{ins.title}</h3>
            <p>{ins.body}</p>
            <span className="it">{ins.tag}</span>
          </div>
        ))}
      </div>

      <div className="sec-h">
        <span className="eb">// tailored to your CV</span>
        <h2>Your prep plan</h2>
        <span className="ln" />
      </div>
      <div className="prof">
        <div className="ph">
          <div className="pav">{PROFILE.name[0]}</div>
          <div>
            <div className="pn">{PROFILE.name}</div>
            <div className="pj">{PROFILE.headline}</div>
          </div>
        </div>
        <div className="plist">
          {PROFILE.strengths.map((s, i) => (
            <div className="pli" key={i}><TrendingUp size={14} color="var(--emerald)" />{s}</div>
          ))}
          {PROFILE.gaps.map((s, i) => (
            <div className="pli" key={`g${i}`}><Lightbulb size={14} color="var(--amber)" />{s}</div>
          ))}
        </div>
        <div className="pfocus">
          {PROFILE.focus.map((f, i) => {
            const t = topicById[f.topic];
            const Icon = ICONS[t.icon] || Boxes;
            return (
              <button className="pfc" key={i} onClick={() => { setTopic(f.topic); setView("questions"); }}>
                <div className="pft"><Icon size={15} color="var(--amber)" />{t.name}</div>
                <div className="pfw">{f.why}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Questions({ progress, setStatus, toggleBookmark, setNote, activeTopic, setTopic, topicStats, setView }) {
  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState("all");
  const [co, setCo] = useState("all");
  const [status, setStatus2] = useState("all");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return QUESTIONS.filter((q) => {
      if (activeTopic !== "all" && q.topic !== activeTopic) return false;
      if (diff !== "all" && q.difficulty !== diff) return false;
      if (co !== "all" && !q.companies.includes(co)) return false;
      const stt = getState(progress, q.id);
      if (status === "bookmarked" && !stt.bookmarked) return false;
      if (["new", "learning", "mastered"].includes(status) && stt.status !== status) return false;
      if (s) {
        const hay = (q.q + " " + q.a + " " + (q.keyPoints || []).join(" ") + " " + topicById[q.topic].name).toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [search, diff, co, status, activeTopic, progress]);

  return (
    <div>
      <div className="page-h">
        <h1>Question bank</h1>
        <p>Tap the circle to cycle new → learning → mastered. Expand for talking points, code, and notes.</p>
      </div>
      {activeTopic === "coding" && (
        <div className="coding-banner">
          <div className="cbi"><Terminal size={20} /></div>
          <div className="cbt">
            <b>Write &amp; run Java live</b>
            <p>Test these output-prediction gotchas yourself in the built-in console.</p>
          </div>
          <button className="runbtn" onClick={() => setView("console")}><Play size={15} /> Open console</button>
        </div>
      )}
      <div className="fbar">
        <div className="search">
          <Search size={17} color="var(--faint)" />
          <input placeholder="Search questions, answers, talking points…" value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button className="qib" onClick={() => setSearch("")}><X size={15} /></button>}
          <span className="rc">{filtered.length} / {QUESTIONS.length}</span>
        </div>
        <div className="chiprow">
          <button className={`chip ${activeTopic === "all" ? "on" : ""}`} onClick={() => setTopic("all")}>
            All <span className="cc">{QUESTIONS.length}</span>
          </button>
          {TOPICS.map((t) => (
            <button key={t.id} className={`chip ${activeTopic === t.id ? "on" : ""}`} onClick={() => setTopic(t.id)}>
              {t.name} <span className="cc">{topicStats[t.id].total}</span>
            </button>
          ))}
        </div>
        <div className="fgroup">
          <span className="fglbl">Level</span>
          {["all", "easy", "medium", "hard"].map((d) => (
            <button key={d} className={`chip sm ${diff === d ? "on" : ""}`} onClick={() => setDiff(d)}>{d === "all" ? "All" : d}</button>
          ))}
          <span className="fglbl" style={{ marginLeft: 8 }}>Company</span>
          {["all", "SERVICE", "BANK", "PRODUCT"].map((c) => (
            <button key={c} className={`chip sm ${co === c ? "on" : ""}`} onClick={() => setCo(c)}>{c === "all" ? "All" : COMPANY_SHORT[c]}</button>
          ))}
          <span className="fglbl" style={{ marginLeft: 8 }}>Status</span>
          {[["all", "All"], ["new", "New"], ["learning", "Learning"], ["mastered", "Mastered"], ["bookmarked", "Saved"]].map(([v, l]) => (
            <button key={v} className={`chip sm ${status === v ? "on" : ""}`} onClick={() => setStatus2(v)}>{l}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <Search size={40} />
          <div className="et">No questions match these filters</div>
          <div className="es">Try clearing the search or widening the filters.</div>
        </div>
      ) : (
        <div className="qlist">
          {filtered.map((q) => (
            <QuestionCard key={q.id} q={q} st={getState(progress, q.id)}
              onStatus={setStatus} onBookmark={toggleBookmark} onNote={setNote} />
          ))}
        </div>
      )}
    </div>
  );
}

function Practice({ progress, setStatus }) {
  const [scope, setScope] = useState("all");
  const [unmasteredOnly, setUnmastered] = useState(true);
  const [seed, setSeed] = useState(0);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const deck = useMemo(() => {
    let pool = QUESTIONS.filter((q) => scope === "all" || q.topic === scope);
    if (unmasteredOnly) pool = pool.filter((q) => getState(progress, q.id).status !== "mastered");
    // shuffle deterministically by seed
    const arr = [...pool];
    let s = seed + 1;
    for (let i = arr.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
    // eslint-disable-next-line
  }, [scope, unmasteredOnly, seed]);

  useEffect(() => { setIdx(0); setRevealed(false); }, [scope, unmasteredOnly, seed]);

  const card = deck[idx];
  const restart = () => { setSeed((s) => s + 1); setIdx(0); setRevealed(false); };
  const advance = () => { setRevealed(false); setIdx((i) => i + 1); };

  return (
    <div className="prac">
      <div className="page-h" style={{ textAlign: "center" }}>
        <h1>Practice mode</h1>
        <p>Self-test flashcards. Read the question, recall your answer out loud, then reveal and grade yourself.</p>
      </div>
      <div className="pracctrl">
        <select className="chip sm" value={scope} onChange={(e) => setScope(e.target.value)}
          style={{ padding: "7px 12px", background: "var(--panel)" }}>
          <option value="all">All topics</option>
          {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button className={`chip sm ${unmasteredOnly ? "on" : ""}`} onClick={() => setUnmastered((v) => !v)}>
          <Target size={13} /> Focus on not-yet-mastered
        </button>
        <button className="chip sm" onClick={restart}><Shuffle size={13} /> Shuffle</button>
      </div>

      {!card ? (
        <div className="pracdone">
          <div className="pdr"><Award size={40} /></div>
          <h2>Deck complete</h2>
          <p>{unmasteredOnly ? "Nothing left to review in this scope — strong work." : "You've been through every card here."}</p>
          <div className="pracctrl" style={{ marginTop: 22 }}>
            <button className="chip on" onClick={restart}><RotateCcw size={14} /> Run again</button>
          </div>
        </div>
      ) : (
        <>
          <div className="pbarw"><i style={{ width: `${(idx / deck.length) * 100}%` }} /></div>
          <div className="pinfo">
            <span>card {idx + 1} / {deck.length}</span>
            <span>{topicById[card.topic].name}</span>
          </div>
          <div className="flash">
            <div className="fmeta">
              <span className={`badge ${card.difficulty}`}>{card.difficulty}</span>
              {card.companies.map((c) => <span key={c} className="badge co">{COMPANY_SHORT[c]}</span>)}
              <span className="badge freq">{card.freq}</span>
            </div>
            <div className="fq">{card.q}</div>
            {!revealed ? (
              <div className="reveal">
                <button className="revealbtn" onClick={() => setRevealed(true)}><Eye size={18} /> Reveal answer</button>
              </div>
            ) : (
              <>
                {card.a
                  ? <div className="fa">{card.a}</div>
                  : <div className="fa own">Recall it in your own words — talking points below.</div>}
                {card.keyPoints && (
                  <div className="kp" style={{ marginTop: 14 }}>
                    <div className="kh"><Target size={12} /> Talking points</div>
                    <ul>{card.keyPoints.map((k, i) => <li key={i}>{k}</li>)}</ul>
                  </div>
                )}
                {card.code && (
                  <div className="code" style={{ marginTop: 12 }}><pre>{card.code}</pre></div>
                )}
                <div className="pgrade">
                  <button className="gbtn2 again" onClick={() => { setStatus(card.id, "learning"); advance(); }}>
                    <RotateCcw size={16} /> Still learning
                  </button>
                  <button className="gbtn2 good" onClick={() => { setStatus(card.id, "mastered"); advance(); }}>
                    <Check size={16} strokeWidth={3} /> Got it
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const DEFAULT_CODE = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");

        // Try editing me, then press Run (or Ctrl/Cmd + Enter)
        for (int i = 1; i <= 5; i++) {
            System.out.println("i = " + i + ", square = " + (i * i));
        }
    }
}`;

const EXAMPLES = [
  { name: "Hello, Java", code: DEFAULT_CODE },
  {
    name: "Integer cache (== trap)",
    code: `public class Main {
    public static void main(String[] args) {
        Integer a = 127, b = 127;   // cached (-128..127)
        Integer c = 128, d = 128;   // new objects
        System.out.println("127 == 127 : " + (a == b));   // true
        System.out.println("128 == 128 : " + (c == d));   // false
        System.out.println("equals     : " + c.equals(d)); // true
    }
}`,
  },
  {
    name: "String == vs equals & pool",
    code: `public class Main {
    public static void main(String[] args) {
        String a = "java";
        String b = "java";              // same pooled literal
        String c = new String("java");  // new heap object
        System.out.println(a == b);          // true
        System.out.println(a == c);          // false
        System.out.println(a == c.intern()); // true
        System.out.println(a.equals(c));     // true
    }
}`,
  },
  {
    name: "Concatenation order",
    code: `public class Main {
    public static void main(String[] args) {
        System.out.println("1" + 2 + 3); // 123
        System.out.println(1 + 2 + "3"); // 33
    }
}`,
  },
  {
    name: "finally overrides return",
    code: `public class Main {
    static int f() {
        try { return 1; }
        finally { return 2; } // overrides the try's return!
    }
    public static void main(String[] args) {
        System.out.println(f()); // 2
    }
}`,
  },
  {
    name: "Ternary numeric promotion",
    code: `public class Main {
    public static void main(String[] args) {
        // Mixed Integer/Double in a ternary promotes BOTH to double
        Object o = true ? Integer.valueOf(1) : Double.valueOf(2.0);
        System.out.println(o); // prints 1.0, not 1
    }
}`,
  },
  {
    name: "First non-repeating char",
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String s = "swiss";
        Map<Character, Integer> m = new LinkedHashMap<>();
        for (char ch : s.toCharArray()) m.merge(ch, 1, Integer::sum);

        char ans = '_';
        for (Map.Entry<Character, Integer> e : m.entrySet()) {
            if (e.getValue() == 1) { ans = e.getKey(); break; }
        }
        System.out.println("First non-repeating: " + ans); // w
    }
}`,
  },
  {
    name: "Group & sum with streams",
    code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        String[][] emps = {
            {"ENG","1200"}, {"ENG","1500"}, {"OPS","900"}, {"OPS","1100"}
        };
        Map<String, Double> totals = Arrays.stream(emps)
            .collect(Collectors.groupingBy(
                e -> e[0],
                Collectors.summingDouble(e -> Double.parseDouble(e[1]))));
        System.out.println(totals); // {ENG=2700.0, OPS=2000.0}
    }
}`,
  },
  {
    name: "Read input (stdin)",
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String name = sc.hasNextLine() ? sc.nextLine() : "world";
        System.out.println("Hello, " + name + "!");
    }
}`,
  },
];

const PISTON = "https://emkc.org/api/v2/piston";
let cachedJavaVersion = null;

function detectFileName(code) {
  let m = code.match(/public\s+(?:final\s+|abstract\s+)?class\s+([A-Za-z_$][\w$]*)/);
  if (!m) m = code.match(/\bclass\s+([A-Za-z_$][\w$]*)/);
  return (m ? m[1] : "Main") + ".java";
}

async function getJavaVersion() {
  if (cachedJavaVersion) return cachedJavaVersion;
  try {
    const r = await fetch(`${PISTON}/runtimes`);
    const list = await r.json();
    const java = Array.isArray(list) ? list.find((x) => x.language === "java") : null;
    cachedJavaVersion = java ? java.version : "15.0.2";
  } catch (e) {
    cachedJavaVersion = "15.0.2";
  }
  return cachedJavaVersion;
}

async function runJava(code, stdin) {
  const version = await getJavaVersion();
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(`${PISTON}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "java",
        version,
        files: [{ name: detectFileName(code), content: code }],
        stdin: stdin || "",
        args: [],
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } finally {
    clearTimeout(to);
  }
}

function Console() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [stdin, setStdin] = useState("");
  const [exIdx, setExIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setRunning(true);
    setResult(null);
    const t0 = (typeof performance !== "undefined" ? performance.now() : Date.now());
    try {
      const data = await runJava(code, stdin);
      const ms = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - t0);
      const compileErr = data.compile && data.compile.code !== 0 ? data.compile : null;
      const r = data.run || {};
      setResult({
        kind: compileErr ? "compile" : (r.code !== 0 || r.signal ? "runtime" : "ok"),
        stdout: r.stdout || "",
        stderr: (compileErr ? (compileErr.stderr || compileErr.output) : r.stderr) || "",
        code: r.code,
        version: data.version,
        ms,
      });
    } catch (e) {
      setResult({
        kind: "neterr",
        errorMsg: e && e.name === "AbortError"
          ? "Timed out after 20 seconds. Simplify the program and try again."
          : "Couldn't reach the code-execution service — it may be blocked in this preview window. Copy your code and run it in your IDE or an online compiler.",
      });
    } finally {
      setRunning(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.target;
      const s = ta.selectionStart, en = ta.selectionEnd;
      const next = code.substring(0, s) + "    " + code.substring(en);
      setCode(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 4; });
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!running) run();
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) { /* clipboard blocked */ }
  };

  const pickExample = (i) => {
    setExIdx(i);
    setCode(EXAMPLES[i].code);
    setResult(null);
  };

  return (
    <div className="con-wrap">
      <div className="page-h">
        <h1>Coding &amp; Output console</h1>
        <p>Write Java, hit Run, and see real compiler + runtime output. Great for nailing the output-prediction gotchas.</p>
      </div>

      <div className="con-tools">
        <select value={exIdx} onChange={(e) => pickExample(Number(e.target.value))}>
          {EXAMPLES.map((ex, i) => <option key={i} value={i}>{ex.name}</option>)}
        </select>
        <button className="ghbtn" onClick={copy}>
          {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
        </button>
        <span className="con-spacer" />
        <button className="runbtn" onClick={run} disabled={running}>
          {running ? <><Loader2 size={15} className="spin" /> Running…</> : <><Play size={15} /> Run</>}
        </button>
      </div>

      <div className="editor-wrap">
        <div className="editor-bar">
          <span className="dot" style={{ background: "#FF5F57" }} />
          <span className="dot" style={{ background: "#FEBC2E" }} />
          <span className="dot" style={{ background: "#28C840" }} />
          <span className="ef">{detectFileName(code)}</span>
        </div>
        <textarea
          className="editor"
          value={code}
          spellCheck={false}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="// write Java here"
        />
      </div>

      <div className="stdin-row">
        <label>Input · stdin (optional)</label>
        <textarea value={stdin} onChange={(e) => setStdin(e.target.value)}
          placeholder="Lines here are fed to Scanner / System.in" />
      </div>

      {result ? (
        <div className="cout">
          <div className="ch">
            <span className={`status ${result.kind}`}>
              {result.kind === "ok" && <><Check size={11} strokeWidth={3} /> success</>}
              {result.kind === "compile" && <><AlertTriangle size={11} /> compile error</>}
              {result.kind === "runtime" && <><AlertTriangle size={11} /> runtime error</>}
              {result.kind === "neterr" && <><AlertTriangle size={11} /> unavailable</>}
            </span>
            {result.version && <span>java {result.version}</span>}
            {typeof result.ms === "number" && <span>· {result.ms} ms</span>}
            {typeof result.code === "number" && result.kind !== "neterr" && <span>· exit {result.code}</span>}
          </div>
          {result.kind === "neterr" ? (
            <pre className="err">{result.errorMsg}</pre>
          ) : (
            <>
              {result.stdout && <pre>{result.stdout}</pre>}
              {result.stderr && <pre className="err">{result.stderr}</pre>}
              {!result.stdout && !result.stderr && <pre style={{ color: "var(--faint)" }}>(no output)</pre>}
            </>
          )}
        </div>
      ) : (
        <div className="cout">
          <div className="placeholder">Output appears here. Press <b>Run</b> or Ctrl/Cmd + Enter.</div>
        </div>
      )}

      <div className="con-note">
        <Terminal size={13} style={{ flex: "none", marginTop: 1 }} />
        <span>Runs on a sandboxed public Java runtime over the network — needs internet and isn't for secrets. Name your public class anything; the file auto-renames to match.</span>
      </div>
    </div>
  );
}

function Tracker({ attendance, setAttendance, streaks }) {
  const [viewMonth, setViewMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const today = new Date();
  const todayKey = dateKey(today);
  const y = viewMonth.getFullYear();
  const m = viewMonth.getMonth();

  const toggle = (k) => setAttendance((a) => {
    const n = { ...a };
    if (n[k]) delete n[k]; else n[k] = true;
    return n;
  });

  const startWeekday = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthPrefix = `${y}-${pad2(m + 1)}`;
  const monthCount = Object.keys(attendance).filter((k) => attendance[k] && k.startsWith(monthPrefix)).length;
  const isCurrentOrFutureMonth = y > today.getFullYear() || (y === today.getFullYear() && m >= today.getMonth());
  const doneToday = !!attendance[todayKey];
  const monthLabel = viewMonth.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="trk">
      <div className="page-h" style={{ textAlign: "center" }}>
        <h1>Daily tracker</h1>
        <p>Tick every day you put in the work. Small, consistent reps win the switch.</p>
      </div>

      <div className="trk-streaks">
        <div className="trk-stat fire">
          <div className="v"><Flame size={20} />{streaks.current}</div>
          <div className="l">Current streak</div>
        </div>
        <div className="trk-stat">
          <div className="v"><Award size={18} color="var(--emerald)" />{streaks.longest}</div>
          <div className="l">Longest streak</div>
        </div>
        <div className="trk-stat">
          <div className="v">{monthCount}</div>
          <div className="l">This month</div>
        </div>
        <div className="trk-stat">
          <div className="v">{streaks.total}</div>
          <div className="l">Total days</div>
        </div>
      </div>

      <button className={`mark-today ${doneToday ? "done" : ""}`} onClick={() => toggle(todayKey)}>
        {doneToday
          ? <><Check size={18} strokeWidth={3} /> Marked today — nice work</>
          : <><Flame size={18} /> Mark today as studied</>}
      </button>

      <div className="cal">
        <div className="cal-head">
          <div className="mo">{monthLabel}</div>
          <div className="cal-nav">
            <button onClick={() => setViewMonth(new Date(y, m - 1, 1))} title="Previous month"><ChevronLeft size={16} /></button>
            <button onClick={() => setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>Today</button>
            <button onClick={() => setViewMonth(new Date(y, m + 1, 1))} disabled={isCurrentOrFutureMonth} title="Next month"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="dow">{DOW.map((d) => <span key={d}>{d}</span>)}</div>
        <div className="grid7">
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} className="day empty" />;
            const k = `${y}-${pad2(m + 1)}-${pad2(d)}`;
            const done = !!attendance[k];
            const isToday = k === todayKey;
            const isFuture = parseKey(k) > today && !isToday;
            return (
              <button key={k}
                className={`day ${done ? "done" : ""} ${isToday ? "today" : ""} ${isFuture ? "future" : ""}`}
                onClick={() => !isFuture && toggle(k)}>
                {d}
                {done && <Check size={12} strokeWidth={3} className="chk" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="trk-note">Tap any past day to add or remove a mark. Your streaks and history are saved automatically.</div>
    </div>
  );
}

export default function App() {
  const [progress, setProgress] = useProgress();
  const [attendance, setAttendance] = usePersisted("coreJavaPrep_attendance_v1", {});
  const [view, setView] = useState("dashboard");
  const [activeTopic, setActiveTopic] = useState("all");
  const [theme, setTheme] = useState("dark");

  const setStatus = (id, status) => setProgress((p) => ({ ...p, [id]: { ...getState(p, id), status } }));
  const toggleBookmark = (id) => setProgress((p) => ({ ...p, [id]: { ...getState(p, id), bookmarked: !getState(p, id).bookmarked } }));
  const setNote = (id, note) => setProgress((p) => ({ ...p, [id]: { ...getState(p, id), note } }));

  const stats = useMemo(() => {
    let mastered = 0, learning = 0, bookmarked = 0;
    for (const q of QUESTIONS) {
      const s = getState(progress, q.id);
      if (s.status === "mastered") mastered++;
      else if (s.status === "learning") learning++;
      if (s.bookmarked) bookmarked++;
    }
    return { total: QUESTIONS.length, mastered, learning, bookmarked };
  }, [progress]);

  const topicStats = useMemo(() => {
    const m = {};
    for (const t of TOPICS) m[t.id] = { total: 0, mastered: 0 };
    for (const q of QUESTIONS) {
      m[q.topic].total++;
      if (getState(progress, q.id).status === "mastered") m[q.topic].mastered++;
    }
    return m;
  }, [progress]);

  const streaks = useMemo(() => computeStreaks(attendance), [attendance]);

  const resetAll = () => {
    if (typeof window !== "undefined" && window.confirm && !window.confirm("Reset all progress, bookmarks and notes? This can't be undone.")) return;
    setProgress({});
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <Activity size={17} /> },
    { id: "questions", label: "Question bank", icon: <ListChecks size={17} /> },
    { id: "practice", label: "Practice", icon: <Brain size={17} /> },
    { id: "console", label: "Java console", icon: <Terminal size={17} /> },
    { id: "tracker", label: "Daily tracker", icon: <Calendar size={17} /> },
  ];

  return (
    <div className={`cjp ${theme === "light" ? "light" : ""}`}>
      <style>{CSS}</style>
      <div className="shell">
        <aside className="rail">
          <div className="brand">
            <div className="mark"><Coffee size={19} strokeWidth={2.4} /></div>
            <div>
              <div className="bt">JavaSwitch</div>
              <div className="bs">core · phase 1</div>
            </div>
          </div>
          <nav className="nav">
            {navItems.map((n) => (
              <button key={n.id} className={`navi ${view === n.id ? "on" : ""}`}
                onClick={() => setView(n.id)}>{n.icon}{n.label}</button>
            ))}
          </nav>
          <div className="rail-topics">
            <div className="rail-lbl">Topics</div>
            <button className={`tline ${activeTopic === "all" && view === "questions" ? "on" : ""}`}
              onClick={() => { setActiveTopic("all"); setView("questions"); }}>
              <span className="spine"><i style={{ height: `${stats.total ? (stats.mastered / stats.total) * 100 : 0}%` }} /></span>
              <span className="tn">All questions</span>
              <span className="tc">{stats.total}</span>
            </button>
            {TOPICS.map((t) => {
              const ts = topicStats[t.id];
              const pct = ts.total ? (ts.mastered / ts.total) * 100 : 0;
              return (
                <button key={t.id} className={`tline ${activeTopic === t.id && view === "questions" ? "on" : ""}`}
                  onClick={() => { setActiveTopic(t.id); setView("questions"); }}>
                  <span className="spine"><i style={{ height: `${pct}%` }} /></span>
                  <span className="tn">{t.name}</span>
                  <span className="tc">{ts.mastered}/{ts.total}</span>
                </button>
              );
            })}
          </div>
          <div className="rail-foot">
            <button className="gbtn" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}{theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button className="gbtn" onClick={resetAll}><RotateCcw size={15} /> Reset progress</button>
          </div>
        </aside>

        <main className="main">
          {view === "dashboard" && (
            <Dashboard progress={progress} stats={stats} topicStats={topicStats}
              setView={setView} setTopic={setActiveTopic} streak={streaks.current} />
          )}
          {view === "questions" && (
            <Questions progress={progress} setStatus={setStatus} toggleBookmark={toggleBookmark}
              setNote={setNote} activeTopic={activeTopic} setTopic={setActiveTopic} topicStats={topicStats}
              setView={setView} />
          )}
          {view === "practice" && (
            <Practice progress={progress} setStatus={setStatus} />
          )}
          {view === "console" && <Console />}
          {view === "tracker" && (
            <Tracker attendance={attendance} setAttendance={setAttendance} streaks={streaks} />
          )}
        </main>
      </div>
    </div>
  );
}
