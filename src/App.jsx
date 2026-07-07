import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Bookmark, Check, Filter, X, ChevronDown, ChevronRight,
  Flame, Target, TrendingUp, Building2, Briefcase, Sparkles, RotateCcw,
  Eye, EyeOff, BookOpen, Award, Cpu, Database, Layers, Boxes, Shield,
  Code2, Zap, Hash, Terminal, GraduationCap, ListChecks, Star, ArrowRight,
  ArrowLeft, Lightbulb, Activity, Coffee, Brain, Sun, Moon, Shuffle, CircleDot,
  Play, Copy, Loader2, AlertTriangle, Calendar, ChevronLeft, Map, Leaf, Globe, Network, Server, Volume2, VolumeX, Mic
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
  { id: "jpa", name: "Spring Data JPA", icon: "Database", blurb: "Repositories, queries, transactions, fetching." },
  { id: "hibernate", name: "Hibernate", icon: "Layers", blurb: "ORM, sessions, caching, locking, N+1." },
  { id: "spring", name: "Spring & Spring Boot", icon: "Leaf", blurb: "IoC, DI, beans, annotations, auto-config." },
  { id: "spring-web", name: "Spring Web & REST", icon: "Globe", blurb: "Controllers, validation, caching, security." },
  { id: "database", name: "Database & SQL", icon: "Server", blurb: "Joins, ACID, indexing, partitioning, queries." },
  { id: "microservices", name: "Microservices", icon: "Network", blurb: "Communication, Saga, CQRS, resilience, tracing." },
  { id: "experience", name: "My Experience (Barclays)", icon: "Building2", blurb: "Resume, migrations, Service Mesh, incidents - how to answer." },
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

  // --- merged from Stream API Workbench ---
  { id: "swb-q1", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Given a list of integers, return a list containing only the even numbers.", keyPoints: ["filter() keeps elements matching the predicate; collect() gathers them into a new list."], code: "List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6);\n\nList<Integer> even = nums.stream()\n    .filter(n -> n % 2 == 0)\n    .collect(Collectors.toList());" },
  { id: "swb-q2", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Find the maximum value in a list of integers.", keyPoints: ["max() takes a comparator and returns an Optional; .get() unwraps it (orElse is safer if empty)."], code: "List<Integer> nums = Arrays.asList(10, 15, 8, 49, 25, 98, 32);\n\nint max = nums.stream()\n    .max(Integer::compare)\n    .get();" },
  { id: "swb-q3", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Find the minimum value in a list of integers.", keyPoints: ["min() mirrors max() — returns the smallest element wrapped in an Optional."], code: "List<Integer> nums = Arrays.asList(10, 15, 8, 49, 25, 98, 32);\n\nint min = nums.stream()\n    .min(Integer::compare)\n    .get();" },
  { id: "swb-q4", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Calculate the sum of all elements in a list of integers.", keyPoints: ["mapToInt() produces an IntStream which exposes sum() directly. reduce(0, Integer::sum) also works."], code: "List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5);\n\nint sum = nums.stream()\n    .mapToInt(Integer::intValue)\n    .sum();" },
  { id: "swb-q5", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Convert every string in a list to uppercase.", keyPoints: ["map() transforms each element by applying the method reference String::toUpperCase."], code: "List<String> names = Arrays.asList(\"alice\", \"bob\", \"charlie\");\n\nList<String> upper = names.stream()\n    .map(String::toUpperCase)\n    .collect(Collectors.toList());" },
  { id: "swb-q6", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Sort a list of integers in ascending (natural) order.", keyPoints: ["sorted() with no argument sorts by natural ordering."], code: "List<Integer> nums = Arrays.asList(10, 15, 8, 49, 25, 98, 32);\n\nList<Integer> sorted = nums.stream()\n    .sorted()\n    .collect(Collectors.toList());" },
  { id: "swb-q7", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Sort a list of integers in descending order.", keyPoints: ["Pass a reversed comparator. Comparator.reverseOrder() or Collections.reverseOrder() both work."], code: "List<Integer> nums = Arrays.asList(10, 15, 8, 49, 25, 98, 32);\n\nList<Integer> desc = nums.stream()\n    .sorted(Comparator.reverseOrder())\n    .collect(Collectors.toList());" },
  { id: "swb-q8", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Count how many numbers in a list are greater than 5.", keyPoints: ["filter() narrows the stream; count() returns the number of remaining elements as a long."], code: "List<Integer> nums = Arrays.asList(1, 4, 6, 8, 3, 9, 5);\n\nlong count = nums.stream()\n    .filter(n -> n > 5)\n    .count();" },
  { id: "swb-q9", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Return only the distinct (unique) elements from a list.", keyPoints: ["distinct() removes duplicates using equals()."], code: "List<Integer> nums = Arrays.asList(1, 1, 2, 3, 3, 4, 5, 5);\n\nList<Integer> distinct = nums.stream()\n    .distinct()\n    .collect(Collectors.toList());" },
  { id: "swb-q10", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Reduce a list of integers to a single sum value using reduce().", keyPoints: ["reduce() takes an identity (0) and an accumulator (Integer::sum) to fold the stream into one value."], code: "List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5);\n\nint total = nums.stream()\n    .reduce(0, Integer::sum);" },
  { id: "swb-q11", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Find the first element of a list using streams.", keyPoints: ["findFirst() returns the first element as an Optional; ifPresent() runs only if a value exists."], code: "List<Integer> nums = Arrays.asList(10, 15, 8, 49);\n\nnums.stream()\n    .findFirst()\n    .ifPresent(System.out::println);" },
  { id: "swb-q12", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Return any element from a list (useful with parallel streams).", keyPoints: ["findAny() may return any element — faster than findFirst() on parallel streams."], code: "List<Integer> nums = Arrays.asList(10, 15, 8, 49);\n\nOptional<Integer> any = nums.stream()\n    .findAny();" },
  { id: "swb-q13", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Extract only the first name from a list of full names.", keyPoints: ["map() splits each name on space and selects index 0."], code: "List<String> full = Arrays.asList(\"Alice Johnson\", \"Bob Harris\", \"Charlie Lou\");\n\nList<String> firstNames = full.stream()\n    .map(name -> name.split(\" \")[0])\n    .collect(Collectors.toList());" },
  { id: "swb-q14", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Check whether all numbers in a list are positive.", keyPoints: ["allMatch() returns true only if every element satisfies the predicate."], code: "List<Integer> nums = Arrays.asList(3, 7, 1, 9, 4);\n\nboolean allPos = nums.stream()\n    .allMatch(n -> n > 0);" },
  { id: "swb-q15", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Check that a list contains no negative numbers.", keyPoints: ["noneMatch() returns true if zero elements match the predicate."], code: "List<Integer> nums = Arrays.asList(3, 7, 1, 9, 4);\n\nboolean noneNeg = nums.stream()\n    .noneMatch(n -> n < 0);" },
  { id: "swb-q16", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Check whether at least one even number exists in the list.", keyPoints: ["anyMatch() short-circuits and returns true as soon as one element matches."], code: "List<Integer> nums = Arrays.asList(1, 3, 5, 8, 9);\n\nboolean hasEven = nums.stream()\n    .anyMatch(n -> n % 2 == 0);" },
  { id: "swb-q18", topic: "streams", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Group a list of users by their age into a Map<Integer, List<User>>.", keyPoints: ["groupingBy() builds a map keyed by the classifier; each value is the list of items sharing that key."], code: "List<User> users = ...; // each User has getAge()\n\nMap<Integer, List<User>> byAge = users.stream()\n    .collect(Collectors.groupingBy(User::getAge));" },
  { id: "swb-q19", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Return only the first 3 elements of a list.", keyPoints: ["limit(n) truncates the stream to at most n elements."], code: "List<Integer> nums = Arrays.asList(5, 6, 7, 8, 9, 10);\n\nList<Integer> first3 = nums.stream()\n    .limit(3)\n    .collect(Collectors.toList());" },
  { id: "swb-q20", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Skip the first 2 elements and return the rest.", keyPoints: ["skip(n) discards the first n elements."], code: "List<Integer> nums = Arrays.asList(5, 6, 7, 8, 9, 10);\n\nList<Integer> rest = nums.stream()\n    .skip(2)\n    .collect(Collectors.toList());" },
  { id: "swb-q21", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Convert a list of integers into a Set to drop duplicates.", keyPoints: ["Collecting into a Set removes duplicates automatically."], code: "List<Integer> nums = Arrays.asList(1, 2, 2, 3, 3, 3);\n\nSet<Integer> set = nums.stream()\n    .collect(Collectors.toSet());" },
  { id: "swb-q22", topic: "streams", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Get count, sum, min, max and average for a list of integers in one pass.", keyPoints: ["summaryStatistics() computes all aggregate values in a single traversal."], code: "List<Integer> nums = Arrays.asList(4, 8, 15, 16, 23, 42);\n\nIntSummaryStatistics stats = nums.stream()\n    .mapToInt(Integer::intValue)\n    .summaryStatistics();\n// stats.getMax(), getMin(), getAverage(), getSum(), getCount()" },
  { id: "swb-q23", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Find the average of all elements in a list.", keyPoints: ["average() on an IntStream returns an OptionalDouble; orElse handles the empty case."], code: "List<Integer> nums = Arrays.asList(10, 20, 30, 40, 50);\n\ndouble avg = nums.stream()\n    .mapToInt(Integer::intValue)\n    .average()\n    .orElse(0.0);" },
  { id: "swb-q24", topic: "streams", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Find all numbers whose decimal representation starts with the digit 1.", keyPoints: ["Convert each number to a String and test startsWith(\"1\")."], code: "List<Integer> nums = Arrays.asList(10, 15, 8, 49, 25, 98, 32);\n\nList<Integer> startsWith1 = nums.stream()\n    .filter(n -> String.valueOf(n).startsWith(\"1\"))\n    .collect(Collectors.toList());" },
  { id: "swb-q27", topic: "streams", difficulty: "hard", freq: "Occasional", companies: ["BANK","PRODUCT"], q: "Find the first character in a string that repeats (case-insensitive).", keyPoints: ["As you stream chars, the first one that Set.add() rejects is the first repeat."], code: "String input = \"Java Articles are Awesome\";\n\nSet<Character> seen = new HashSet<>();\nCharacter result = input.toLowerCase().chars()\n    .mapToObj(c -> (char) c)\n    .filter(c -> !seen.add(c))\n    .findFirst()\n    .orElse(null);" },
  { id: "swb-q28", topic: "streams", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Return true if any value appears at least twice in an array, false if all are distinct.", keyPoints: ["anyMatch short-circuits the moment Set.add() fails on a repeated value."], code: "int[] nums = {1, 2, 3, 1};  // -> true\n\nSet<Integer> seen = new HashSet<>();\nboolean hasDup = Arrays.stream(nums)\n    .anyMatch(n -> !seen.add(n));" },
  { id: "swb-q29", topic: "streams", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Concatenate two lists into a single stream and print the joined result.", keyPoints: ["Stream.concat() merges two streams; joining() with a delimiter builds the output string."], code: "List<String> a = Arrays.asList(\"Java\", \"8\");\nList<String> b = Arrays.asList(\"is\", \"fun\");\n\nStream<String> joined = Stream.concat(a.stream(), b.stream());\nString result = joined.collect(Collectors.joining(\" \"));" },
  { id: "swb-q30", topic: "streams", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Cube each element of a list, then keep only the results greater than 50.", keyPoints: ["map() transforms (cube), then filter() narrows — order of operations matters."], code: "List<Integer> nums = Arrays.asList(4, 5, 6, 7, 1, 2, 3);\n\nList<Integer> result = nums.stream()\n    .map(i -> i * i * i)\n    .filter(i -> i > 50)\n    .collect(Collectors.toList());" },
  { id: "swb-q32", topic: "streams", difficulty: "hard", freq: "Occasional", companies: ["BANK","PRODUCT"], q: "From a list of strings, return only the elements that appear more than once, with their counts.", keyPoints: ["Build the frequency map first, then stream its entries and keep counts > 1. Result: {AA=2}."], code: "List<String> names = Arrays.asList(\"AA\", \"BB\", \"AA\", \"CC\");\n\nMap<String, Long> dups = names.stream()\n    .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))\n    .entrySet().stream()\n    .filter(e -> e.getValue() > 1)\n    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));" },
  { id: "swb-q33", topic: "streams", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Count the frequency of each character in a string (lowercased).", keyPoints: ["split(\"\") gives single-char strings; LinkedHashMap keeps first-seen order."], code: "String s = \"stream data\";\n\nMap<String, Long> charCount = Arrays.stream(s.split(\"\"))\n    .map(String::toLowerCase)\n    .collect(Collectors.groupingBy(\n        Function.identity(),\n        LinkedHashMap::new,\n        Collectors.counting()));" },
  { id: "swb-q34", topic: "streams", difficulty: "hard", freq: "Occasional", companies: ["BANK","PRODUCT"], q: "Convert a list of objects into a Map, keeping the first value on key collisions and preserving order.", keyPoints: ["The merge function (oldV, newV) -> oldV resolves duplicate keys; LinkedHashMap preserves order."], code: "List<Notes> notes = ...; // getTagName(), getTagId()\n\nMap<String, Long> map = notes.stream()\n    .sorted(Comparator.comparingLong(Notes::getTagId).reversed())\n    .collect(Collectors.toMap(\n        Notes::getTagName,\n        Notes::getTagId,\n        (oldV, newV) -> oldV,        // keep first on duplicate key\n        LinkedHashMap::new));" },
  { id: "swb-q39", topic: "streams", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Print the current date, time, and date-time using the Java 8 Date/Time API.", keyPoints: ["LocalDate, LocalTime and LocalDateTime are the immutable Java 8 replacements for the old Date class."], code: "System.out.println(LocalDate.now());\nSystem.out.println(LocalTime.now());\nSystem.out.println(LocalDateTime.now());" },

  // --- Spring Data JPA & Hibernate ---
  { id: "jpa-1", topic: "jpa", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is Spring Data JPA?", a: "Spring Data JPA is part of the Spring Data project. It sits on top of JPA/Hibernate and removes boilerplate DAO code: you declare repository interfaces and Spring generates the implementation, so you focus on business logic instead of persistence plumbing.", keyPoints: ["Abstraction over JPA/Hibernate","Declare interfaces, implementation is generated","Removes boilerplate DAO/JDBC code"] },
  { id: "jpa-2", topic: "jpa", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What are the key features of Spring Data JPA?", a: "Automatic repository implementations, derived query methods from method names, @Query for custom JPQL/native queries, out-of-the-box CRUD, pagination and sorting, auditing, and tight Spring Boot integration.", keyPoints: ["Derived queries + @Query","Built-in CRUD, paging, sorting","Auditing + Boot auto-configuration"] },
  { id: "jpa-3", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you create a custom repository in Spring Data JPA?", a: "Define an interface extending JpaRepository<T, ID> and add derived or @Query methods. For behaviour Spring cannot derive, add a custom fragment interface plus an Impl class that Spring wires in.", keyPoints: ["extends JpaRepository<T,ID>","Add derived / @Query methods","Custom logic via fragment interface + Impl"] },
  { id: "jpa-4", topic: "jpa", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Difference between CrudRepository and JpaRepository?", a: "CrudRepository gives basic CRUD. JpaRepository extends it (through PagingAndSortingRepository) and adds JPA-specific operations like flush(), saveAndFlush, batch delete, and returns List instead of Iterable.", keyPoints: ["JpaRepository extends CrudRepository","Adds flush, batch delete, paging/sorting","Returns List, not Iterable"] },
  { id: "jpa-5", topic: "jpa", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you write a custom query in Spring Data JPA?", a: "Use @Query with JPQL, or nativeQuery=true for raw SQL. Bind parameters with named :params + @Param or positional ?1. Use @Modifying for update/delete queries.", keyPoints: ["@Query with JPQL or native SQL","Bind via :name + @Param","@Modifying for write queries"], code: "@Query(\"SELECT u FROM User u WHERE u.firstName = :name\")\nList<User> findByFirstName(@Param(\"name\") String name);\n\n@Query(value = \"SELECT * FROM users WHERE first_name = ?1\", nativeQuery = true)\nList<User> byFirstName(String name);" },
  { id: "jpa-6", topic: "jpa", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What does the save() method do?", a: "save() inserts a new entity or updates an existing one in a single call. Spring decides insert vs update based on whether the entity is 'new' (unset id/version), and returns the managed instance.", keyPoints: ["Insert or update in one call","Decides by entity is-new check","Returns the managed instance"] },
  { id: "jpa-7", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is the @Modifying annotation used for?", a: "@Modifying marks a @Query as a write (executeUpdate) so update/delete queries actually run. It is usually paired with @Transactional, and clearAutomatically=true keeps the persistence context in sync.", keyPoints: ["Flags @Query as update/delete","Requires @Transactional","clearAutomatically syncs the context"] },
  { id: "jpa-8", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Difference between findById() and getReferenceById()/getOne()?", a: "findById returns an Optional and hits the DB immediately. getReferenceById (old getOne) returns a lazy proxy and only queries when a field is accessed, throwing EntityNotFoundException if the row never existed.", keyPoints: ["findById: eager, returns Optional","getReferenceById: lazy proxy","Proxy access can throw EntityNotFound"] },
  { id: "jpa-9", topic: "jpa", difficulty: "easy", freq: "Occasional", companies: ["SERVICE","BANK","PRODUCT"], q: "What is the @Temporal annotation?", a: "@Temporal tells JPA how to map a legacy java.util.Date/Calendar field: as DATE, TIME, or TIMESTAMP. It is not needed for java.time types like LocalDate/LocalDateTime.", keyPoints: ["Maps Date/Calendar to DATE/TIME/TIMESTAMP","Only for legacy date types","java.time needs no @Temporal"] },
  { id: "jpa-10", topic: "jpa", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you sort results in a query method?", a: "Add OrderBy in the method name (e.g. findByOrderByLastNameAsc), or pass a Sort/Pageable argument for dynamic sorting without a fixed method name.", keyPoints: ["...OrderBy<Field>Asc/Desc in the name","Or pass a Sort / Pageable arg","Sort.by(...) for dynamic sorting"], code: "List<User> findByOrderByLastNameAsc();\n\n// dynamic:\nrepo.findAll(Sort.by(\"lastName\").descending());" },
  { id: "jpa-11", topic: "jpa", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Explain the @Transactional annotation.", a: "@Transactional runs a method inside a transaction so multiple DB operations commit together or roll back as one atomic unit. It rolls back on unchecked exceptions by default and lets you tune propagation, isolation, readOnly, and rollbackFor.", keyPoints: ["Atomic unit: commit or rollback","Rolls back on unchecked exceptions by default","Tune propagation / isolation / readOnly"] },
  { id: "jpa-12", topic: "jpa", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "FetchType.EAGER vs FetchType.LAZY?", a: "EAGER loads the association immediately with the parent (risking over-fetching and N+1). LAZY loads it on first access via a proxy and is the default for collections. Prefer LAZY plus JOIN FETCH / entity graphs where you actually need the data.", keyPoints: ["EAGER: loaded with the parent","LAZY: on-demand proxy (default for collections)","Prefer LAZY + JOIN FETCH"] },
  { id: "jpa-13", topic: "jpa", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is the @Id annotation?", a: "@Id marks the field that is the entity's primary key. Combine it with @GeneratedValue to control how keys are generated (IDENTITY, SEQUENCE, AUTO).", keyPoints: ["Marks the primary key field","Pair with @GeneratedValue","Generation strategy: IDENTITY/SEQUENCE/AUTO"] },
  { id: "jpa-14", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you create a composite primary key?", a: "Model the key as a separate class annotated @Embeddable (with equals/hashCode) and reference it with @EmbeddedId; alternatively use @IdClass with multiple @Id fields on the entity.", keyPoints: ["@Embeddable key class + @EmbeddedId","Or @IdClass with multiple @Id","Key class needs equals/hashCode + Serializable"], code: "@Embeddable\nclass OrderLineId implements Serializable {\n  Long orderId;\n  Long productId;\n  // equals() + hashCode()\n}\n\n@Entity\nclass OrderLine {\n  @EmbeddedId OrderLineId id;\n}" },
  { id: "jpa-15", topic: "jpa", difficulty: "easy", freq: "Occasional", companies: ["SERVICE","BANK","PRODUCT"], q: "What does @EnableJpaRepositories do?", a: "It turns on repository scanning and configures the beans Spring Data needs. Spring Boot enables it automatically; you use it explicitly to customise base packages, the entity manager, or the transaction manager.", keyPoints: ["Enables repository scanning","Boot auto-enables it","Use to customise packages/EM/TM"] },
  { id: "jpa-16", topic: "jpa", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What are the rules for declaring derived query methods?", a: "Method names follow a convention: a prefix (findBy, readBy, countBy, existsBy, deleteBy) plus property expressions joined by And/Or, with keywords like OrderBy, Between, LessThan, Like, IgnoreCase.", keyPoints: ["Prefix: findBy/countBy/deleteBy/existsBy","Combine properties with And/Or","Keywords: Between, Like, OrderBy, IgnoreCase"] },
  { id: "jpa-17", topic: "jpa", difficulty: "medium", freq: "Occasional", companies: ["SERVICE","BANK","PRODUCT"], q: "What is Query By Example (QBE)?", a: "QBE builds a query from a probe entity plus an ExampleMatcher: non-null fields of the probe become the search criteria. It is handy for simple dynamic filters, but not for ranges or joins.", keyPoints: ["Probe entity -> criteria from non-null fields","ExampleMatcher tunes matching","Simple dynamic filters only"] },
  { id: "jpa-18", topic: "jpa", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is pagination and how do you implement it?", a: "Pagination splits a large result set into pages. Add a Pageable parameter and return Page<T> (or Slice<T>); Spring adds LIMIT/OFFSET and a count query. Build it with PageRequest.of(page, size, sort).", keyPoints: ["Pageable param -> Page/Slice result","PageRequest.of(page, size, sort)","Page runs a count query; Slice does not"] },
  { id: "jpa-19", topic: "jpa", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Name some common CrudRepository methods.", a: "save/saveAll, findById, existsById, findAll, count, deleteById, and delete cover the standard CRUD surface.", keyPoints: ["save / saveAll / findById / findAll","count / existsById","deleteById / delete"] },
  { id: "jpa-20", topic: "jpa", difficulty: "medium", freq: "Occasional", companies: ["SERVICE","BANK","PRODUCT"], q: "Difference between delete() and deleteAllInBatch()?", a: "delete removes one entity at a time (select then delete, firing lifecycle callbacks and cascades). deleteAllInBatch issues a single bulk DELETE that is much faster but skips callbacks, cascades, and the persistence context.", keyPoints: ["delete: per-entity, callbacks + cascades fire","deleteAllInBatch: one bulk SQL","Batch skips cascades/callbacks/context"] },
  { id: "jpa-21", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you run a complex multi-table query?", a: "Use @Query with JPQL for joins across entities, or nativeQuery=true for vendor SQL. For very dynamic conditions use the Criteria API or Specifications, and DTO projections to shape the result.", keyPoints: ["@Query JPQL/native for joins","Criteria/Specifications for dynamic conditions","DTO projections for shaped results"] },
  { id: "jpa-22", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you optimize inserting thousands of records?", a: "Enable JDBC batching with hibernate.jdbc.batch_size, keep order_inserts/order_updates on, use saveAll, and flush()+clear() every N rows to bound the persistence context. Avoid an IDENTITY key strategy, which disables insert batching.", keyPoints: ["Set hibernate.jdbc.batch_size","order_inserts/order_updates = true","flush()+clear() every N rows"] },
  { id: "jpa-23", topic: "jpa", difficulty: "hard", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you manage bidirectional relationships and avoid infinite recursion?", a: "Map both sides with mappedBy on the inverse side. For JSON serialization, break the cycle with @JsonManagedReference/@JsonBackReference or @JsonIgnore. The cleaner fix is to serialize DTOs instead of entities.", keyPoints: ["mappedBy on the inverse side","@JsonManagedReference / @JsonBackReference","Best: expose DTOs, not entities"] },
  { id: "jpa-24", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you handle schema migrations?", a: "Use Flyway or Liquibase for versioned migration scripts applied at startup, and keep ddl-auto=validate (never update/create in production) so the schema is controlled by migrations, not by Hibernate.", keyPoints: ["Flyway / Liquibase versioned scripts","ddl-auto=validate in production","Migrations run on deploy"] },
  { id: "jpa-25", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you add caching to improve performance?", a: "Use the Spring Cache abstraction (@Cacheable/@CacheEvict) with a provider like Redis, Caffeine, or EhCache for query results, and/or Hibernate's second-level cache for entities. Plan cache invalidation to avoid stale data.", keyPoints: ["@Cacheable + provider (Redis/Caffeine)","Or Hibernate second-level cache","Mind invalidation / staleness"] },
  { id: "hib-1", topic: "hibernate", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is Hibernate?", a: "Hibernate is an open-source ORM that maps Java classes to database tables and Java types to SQL types, handling CRUD, caching, and transactions so you write far less JDBC. It is the most common JPA implementation.", keyPoints: ["ORM: objects <-> tables","Implements the JPA spec","Removes boilerplate JDBC"] },
  { id: "hib-2", topic: "hibernate", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What are the core components of Hibernate?", a: "SessionFactory, Session, Transaction, Query, ConnectionProvider, and TransactionFactory, with Configuration used to bootstrap everything.", keyPoints: ["SessionFactory, Session, Transaction","Query, ConnectionProvider","Configuration bootstraps it"] },
  { id: "hib-3", topic: "hibernate", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is the role of the SessionFactory?", a: "SessionFactory is a heavyweight, thread-safe object created once per database. It produces short-lived Session objects and holds the mappings and the second-level cache.", keyPoints: ["One per datasource, thread-safe, heavy","Creates Session objects","Holds mappings + L2 cache"] },
  { id: "hib-4", topic: "hibernate", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is a Session in Hibernate?", a: "A Session is a short-lived, single-threaded unit of work between the app and the database. It is the first-level cache and the gateway for loading and persisting entities.", keyPoints: ["Short-lived, not thread-safe","Acts as the first-level cache","A unit of work with the DB"] },
  { id: "hib-5", topic: "hibernate", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How does Hibernate manage transactions?", a: "Through its Transaction interface layered over JDBC or JTA: you begin, then commit or rollback. In Spring, @Transactional drives this declaratively.", keyPoints: ["Transaction API over JDBC/JTA","commit or rollback","Spring @Transactional wraps it"] },
  { id: "hib-6", topic: "hibernate", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is HQL?", a: "HQL (Hibernate Query Language) is an object-oriented, database-independent query language. You query entities and their fields rather than tables/columns, with support for inheritance, polymorphism, and associations.", keyPoints: ["Object-oriented, DB-independent","Queries entities, not tables","Supports inheritance / associations"] },
  { id: "hib-7", topic: "hibernate", difficulty: "medium", freq: "Occasional", companies: ["SERVICE","BANK","PRODUCT"], q: "What is the Criteria API?", a: "The Criteria API builds queries programmatically and type-safely (JPA CriteriaBuilder). It shines for dynamic queries assembled at runtime from optional conditions.", keyPoints: ["Programmatic, type-safe queries","Great for dynamic criteria","JPA CriteriaBuilder"] },
  { id: "hib-8", topic: "hibernate", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Explain the entity object states in Hibernate.", a: "Transient (new, not tied to a session), Persistent (attached to a session and dirty-checked/tracked), and Detached (was persistent but the session closed). merge() reattaches a detached object.", keyPoints: ["Transient / Persistent / Detached","Persistent objects are dirty-checked","merge() reattaches detached objects"] },
  { id: "hib-9", topic: "hibernate", difficulty: "easy", freq: "Occasional", companies: ["SERVICE","BANK","PRODUCT"], q: "What is the Configuration class?", a: "The Configuration object bootstraps Hibernate from hibernate.cfg.xml/properties and mapping metadata, then builds the SessionFactory.", keyPoints: ["Bootstraps from config + mappings","Builds the SessionFactory","Legacy XML or programmatic setup"] },
  { id: "hib-10", topic: "hibernate", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Describe the second-level cache.", a: "The second-level cache is a shared, cross-session cache at the SessionFactory level (EhCache, Infinispan, etc.) that caches entities/collections to cut DB hits. The first-level cache, by contrast, is per-Session and always on.", keyPoints: ["Shared across sessions (SessionFactory)","Caches entities/collections","L1 cache is per-session, always on"] },
  { id: "hib-11", topic: "hibernate", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Difference between get() and load()?", a: "get() returns the entity or null and hits the DB immediately. load() returns a proxy and defers the query, throwing ObjectNotFoundException on first access if the row does not exist.", keyPoints: ["get: eager, returns null if absent","load: lazy proxy","Proxy access throws if missing"] },
  { id: "hib-12", topic: "hibernate", difficulty: "medium", freq: "Occasional", companies: ["SERVICE","BANK","PRODUCT"], q: "How does Hibernate ensure data integrity?", a: "Through ACID transactions, isolation levels, optimistic/pessimistic locking, and by honouring DB constraints. On failure it rolls back so no partial writes are committed.", keyPoints: ["Transactions + isolation levels","Optimistic / pessimistic locking","Rollback prevents partial writes"] },
  { id: "hib-13", topic: "hibernate", difficulty: "hard", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is the N+1 SELECT problem and how do you prevent it?", a: "N+1 happens when one query loads N parents and then a separate query runs per parent to load its association (N more queries). Prevent it with JOIN FETCH, @EntityGraph, batch fetching (@BatchSize), or subselect fetching.", keyPoints: ["1 parent query + N child queries","Fix: JOIN FETCH / @EntityGraph","Or @BatchSize / subselect fetching"], code: "// N+1 fixes:\n@Query(\"select o from Order o join fetch o.items\")\nList<Order> withItems();\n\n@EntityGraph(attributePaths = \"items\")\nList<Order> findAll();" },
  { id: "hib-14", topic: "hibernate", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is the @Entity annotation?", a: "@Entity marks a class as a persistent entity mapped to a table. It requires an @Id and a no-arg constructor; @Table can override the table name.", keyPoints: ["Marks a persistent entity","Requires @Id + no-arg constructor","Maps to a table (@Table optional)"] },
  { id: "hib-15", topic: "hibernate", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is cascading in Hibernate?", a: "Cascading propagates operations (PERSIST, MERGE, REMOVE, ALL, etc.) from a parent entity to its associated children, so you manage the object graph with one save or delete. orphanRemoval deletes children detached from the parent.", keyPoints: ["Propagates ops parent -> children","CascadeType.PERSIST/MERGE/REMOVE/ALL","orphanRemoval for detached children"] },
  { id: "hib-16", topic: "hibernate", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is a composite key in Hibernate?", a: "A composite key spans multiple columns. Model it with an @Embeddable class + @EmbeddedId, or with @IdClass. The key class must implement equals/hashCode and be Serializable.", keyPoints: ["Multi-column primary key","@EmbeddedId (@Embeddable) or @IdClass","Key class: equals/hashCode + Serializable"] },
  { id: "hib-17", topic: "hibernate", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How does Hibernate protect against SQL injection?", a: "It uses parameterised prepared statements, and HQL/Criteria bind parameters rather than concatenating them, which prevents injection. The risk returns only if you build native SQL by string concatenation.", keyPoints: ["Prepared statements + bound params","HQL/Criteria are parameterised","Do not concatenate native SQL"] },
  { id: "hib-18", topic: "hibernate", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is lazy loading in Hibernate?", a: "Lazy loading defers loading an association until it is first accessed, via a proxy, improving performance. Accessing it after the session has closed throws LazyInitializationException.", keyPoints: ["Load association on first access","Default for collections","After session close -> LazyInitializationException"] },
  { id: "hib-19", topic: "hibernate", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you achieve concurrency control in Hibernate?", a: "Through versioning (optimistic locking) and database locks (pessimistic locking), so concurrent updates do not silently overwrite each other. Choose based on how much contention you expect.", keyPoints: ["Optimistic (version) vs pessimistic (locks)","Prevents lost updates","Pick by contention level"] },
  { id: "hib-20", topic: "hibernate", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is optimistic locking?", a: "Optimistic locking adds a @Version column. On update Hibernate checks the version still matches; if another transaction changed the row first, it throws OptimisticLockException instead of overwriting.", keyPoints: ["@Version column","Update verifies version matches","Conflict -> OptimisticLockException"] },
  { id: "hib-21", topic: "hibernate", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you speed up a slow app with many relationships?", a: "Use lazy loading by default, then add JOIN FETCH / @EntityGraph only for the associations you need, enable batch fetching (@BatchSize), tune fetch sizes, and add the second-level/query cache.", keyPoints: ["Lazy by default + fetch joins where needed","@BatchSize batch fetching","Second-level / query cache"] },
  { id: "hib-22", topic: "hibernate", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you manage a Hibernate session in a web app without leaks?", a: "Scope one session per request and always close it. In Spring, the transaction manager opens/closes the session around the service layer, so sessions are cleaned up automatically. Open-Session-In-View is convenient but can hide N+1.", keyPoints: ["Session per request, always closed","Spring TX manager handles lifecycle","OSIV convenient but can mask N+1"] },
  { id: "hib-23", topic: "hibernate", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "An error occurs mid-transaction after several writes. How is integrity preserved?", a: "The transaction rolls back: Hibernate (via JDBC or JTA) reverts every operation to the pre-transaction state, so no partial changes are committed. This atomicity keeps the data consistent.", keyPoints: ["Error -> full rollback","All-or-nothing atomicity","Via JDBC / JTA transaction"] },
  { id: "hib-24", topic: "hibernate", difficulty: "medium", freq: "Occasional", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you add auditing to track entity changes?", a: "Use Hibernate Envers: annotate entities with @Audited and it records revisions in separate audit tables that you can query to see historical state and who/when changes happened.", keyPoints: ["Hibernate Envers @Audited","Auto revision/audit tables","Query historical entity state"] },
  { id: "hib-25", topic: "hibernate", difficulty: "medium", freq: "Occasional", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you map a legacy DB that ignores your naming conventions?", a: "Map explicitly with @Table(name=...) and @Column(name=...) to match the legacy table/column names, so no schema change is needed. A custom physical naming strategy can automate this across many entities.", keyPoints: ["@Table / @Column with explicit names","No DB schema change required","Custom naming strategy for scale"] },

  // --- Spring, Web/REST, Database, Microservices (topic-wise guide) ---
  { id: "sp-1", topic: "spring", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is IoC and DI in Spring? What DI types exist?", a: "Inversion of Control means the container, not your code, creates and wires objects. Dependency Injection is how Spring supplies those dependencies - via constructor, setter, or field injection. Benefits: loose coupling, testability, centralised configuration.", keyPoints: ["IoC: container owns object creation/wiring","DI types: constructor / setter / field","Prefer constructor injection (immutable, testable)"] },
  { id: "sp-2", topic: "spring", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Is a Spring singleton bean thread-safe? How does it differ from a Java singleton?", a: "A Spring singleton means one instance per container, not one per JVM like the GoF singleton. It is NOT automatically thread-safe - if it holds mutable shared state you must synchronise or keep the bean stateless.", keyPoints: ["Spring singleton = one per container","Different from GoF/JVM singleton","Not thread-safe if it holds mutable state"] },
  { id: "sp-3", topic: "spring", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Explain the lifecycle of a Spring bean.", a: "Instantiate -> inject dependencies -> Aware callbacks -> BeanPostProcessor before-init -> @PostConstruct / afterPropertiesSet -> post-init -> bean ready -> @PreDestroy / destroy on shutdown.", keyPoints: ["Create -> inject -> init -> ready -> destroy","@PostConstruct / @PreDestroy hooks","BeanPostProcessors wrap initialisation"] },
  { id: "sp-4", topic: "spring", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "How does autowiring resolve two beans of the same type?", a: "Autowiring injects a matching bean by type. When two match, disambiguate with @Primary (marks a default) or @Qualifier naming the specific bean; Spring can also fall back to matching by the bean/field name.", keyPoints: ["Inject by type automatically","Two matches -> @Primary or @Qualifier","@Qualifier targets a specific bean name"] },
  { id: "sp-5", topic: "spring", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What are @Configuration and @Bean?", a: "@Configuration marks a class that defines beans; each @Bean method returns an object Spring manages. Spring CGLIB-proxies the class so calling one @Bean method from another still returns the shared singleton.", keyPoints: ["@Configuration class holds @Bean methods","@Bean = programmatic bean definition","Proxy keeps singletons on internal calls"] },
  { id: "sp-6", topic: "spring", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "@Autowired vs @Inject?", a: "Both do type-based injection. @Autowired is Spring-specific and has a required flag; @Inject is the JSR-330 standard and portable across DI frameworks. Behaviour is otherwise equivalent.", keyPoints: ["@Autowired: Spring, has required flag","@Inject: JSR-330 standard, portable","Same type-based resolution"] },
  { id: "sp-7", topic: "spring", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "What does @SpringBootApplication comprise?", a: "It combines @Configuration (bean definitions), @EnableAutoConfiguration (auto-configure from the classpath), and @ComponentScan (scan this package and below). One annotation bootstraps the app.", keyPoints: ["= @Configuration + @EnableAutoConfiguration + @ComponentScan","Bootstraps the application","Scans from its own package downward"] },
  { id: "sp-8", topic: "spring", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How does @ComponentScan behave with no package specified?", a: "With no base package it scans the package of the annotated class and all sub-packages - which is why the main class should sit in a root package above your components.", keyPoints: ["Scans annotated class's package + below","Keep main class in a root package","basePackages to widen/narrow"] },
  { id: "sp-9", topic: "spring", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How does @EnableAutoConfiguration provide plug-and-play behaviour?", a: "Auto-configuration inspects the classpath, existing beans, and properties, then conditionally configures sensible defaults using @Conditional. Add a starter and Boot wires it up; define your own bean to override.", keyPoints: ["Configures beans via classpath + @Conditional","Starters trigger auto-config","Your beans override the defaults"] },
  { id: "sp-10", topic: "spring", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "@Controller vs @RestController - why is @ResponseBody not needed?", a: "@RestController = @Controller + @ResponseBody, so every method return value is serialised straight to the response body (JSON) instead of resolving a view. Use @Controller for MVC views, @RestController for APIs.", keyPoints: ["@RestController = @Controller + @ResponseBody","Return value -> response body (JSON)","@Controller resolves views"] },
  { id: "sp-11", topic: "spring", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "@ResponseBody vs ResponseEntity?", a: "@ResponseBody writes the return value to the body with a default 200 status. ResponseEntity wraps body + status + headers, so you set the HTTP status and headers explicitly (201 Created, 404, etc.).", keyPoints: ["@ResponseBody: body only, default 200","ResponseEntity: body + status + headers","Use ResponseEntity to control status/headers"] },
  { id: "sp-12", topic: "spring", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What are Spring bean scopes?", a: "singleton (default, one per container), prototype (a new instance per injection/lookup), and web scopes request/session/application. Use prototype/request for stateful beans.", keyPoints: ["singleton (default) / prototype","Web: request / session / application","Prototype = new instance each time"] },
  { id: "sp-13", topic: "spring", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do Spring profiles and externalized config work?", a: "@Profile and spring.profiles.active swap beans/config per environment. Config lives outside code in application-{profile}.yml, environment variables, or a config server, following 12-factor practice.", keyPoints: ["@Profile + active profile per env","application-{profile}.yml","Externalise via env / config server"] },
  { id: "sp-14", topic: "spring", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is 'convention over configuration' in Spring Boot?", a: "Boot favours sensible defaults over explicit setup: starters, auto-configuration, and naming conventions mean you configure only what differs from the defaults - far less boilerplate.", keyPoints: ["Sensible defaults; configure only deviations","Starters + auto-configuration","Less boilerplate config"] },
  { id: "sw-1", topic: "spring-web", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "@RequestParam vs @PathVariable vs @RequestBody?", a: "@PathVariable binds a URI template segment (/users/{id}); @RequestParam binds a query/form parameter (?page=2); @RequestBody deserialises the JSON body into an object. Path for identity, param for filters, body for payloads.", keyPoints: ["@PathVariable: URI segment","@RequestParam: query/form param","@RequestBody: JSON body -> object"], code: "@GetMapping(\"/users/{id}\")            // @PathVariable\nUser get(@PathVariable Long id) { ... }\n\n@GetMapping(\"/users\")                 // @RequestParam\nList<User> list(@RequestParam int page) { ... }\n\n@PostMapping(\"/users\")                // @RequestBody\nUser create(@RequestBody @Valid UserDto dto) { ... }" },
  { id: "sw-2", topic: "spring-web", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Which HTTP methods are idempotent and safe?", a: "GET, PUT, DELETE, HEAD, OPTIONS are idempotent (repeating the call gives the same result). POST and PATCH are generally not idempotent. GET is also 'safe' - it has no side effects.", keyPoints: ["Idempotent: GET, PUT, DELETE, HEAD, OPTIONS","POST/PATCH: not idempotent","GET is also safe (no side effects)"] },
  { id: "sw-3", topic: "spring-web", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Best practices for REST endpoint / URL design.", a: "Use plural nouns not verbs, express relations by hierarchy (/orders/1/items), map actions to proper HTTP methods and status codes, version the API (/v1), and keep error responses consistent.", keyPoints: ["Plural nouns, no verbs in paths","Correct method + status code","Version APIs; consistent error shape"] },
  { id: "sw-4", topic: "spring-web", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Explain the lifecycle of a REST request in Spring (DispatcherServlet).", a: "Request -> DispatcherServlet (front controller) -> HandlerMapping selects the controller -> HandlerAdapter invokes it (interceptors around) -> HttpMessageConverter serialises the return value to JSON -> response.", keyPoints: ["DispatcherServlet = front controller","HandlerMapping -> controller -> HandlerAdapter","MessageConverter serialises the result"] },
  { id: "sw-5", topic: "spring-web", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is the DispatcherServlet and the HandlerInterceptor order?", a: "The DispatcherServlet routes every request. Interceptors run preHandle -> controller -> postHandle -> afterCompletion, wrapping the handler for cross-cutting concerns like auth and logging.", keyPoints: ["Central front controller","preHandle -> handler -> postHandle -> afterCompletion","Cross-cutting concerns via interceptors"] },
  { id: "sw-6", topic: "spring-web", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "@Valid vs @Validated?", a: "@Valid (JSR-380) triggers bean validation on a body or nested object. @Validated is Spring's variant that also supports validation groups and enables method-level validation on a class.", keyPoints: ["@Valid: standard bean validation","@Validated: adds groups + method-level","Use @Valid on @RequestBody"] },
  { id: "sw-7", topic: "spring-web", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you handle validation errors (MethodArgumentNotValidException)?", a: "When @Valid fails on a request body, Spring throws MethodArgumentNotValidException. Handle it in a @RestControllerAdvice and return a 400 with structured field-level error messages.", keyPoints: ["@Valid failure -> MethodArgumentNotValidException","Catch in @RestControllerAdvice","Return 400 + field errors"] },
  { id: "sw-8", topic: "spring-web", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you create a custom validation annotation?", a: "Define an annotation meta-annotated with @Constraint pointing to a ConstraintValidator implementation; put the rule in isValid(). It is then declarative and reusable across fields.", keyPoints: ["@Constraint + ConstraintValidator","Rule lives in isValid()","Declarative and reusable"] },
  { id: "sw-9", topic: "spring-web", difficulty: "hard", freq: "Occasional", companies: ["BANK","PRODUCT"], q: "How do you implement cross-field validation (password vs confirm)?", a: "A single-field constraint cannot compare two fields, so use a class-level custom constraint whose validator receives the whole object, or validation groups - then compare the two fields inside isValid().", keyPoints: ["Class-level custom constraint","Validator sees the whole object","Compare both fields in isValid()"] },
  { id: "sw-10", topic: "spring-web", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "@ExceptionHandler, @ControllerAdvice vs @RestControllerAdvice?", a: "@ExceptionHandler handles exceptions within a controller. @ControllerAdvice centralises handlers across all controllers; @RestControllerAdvice = @ControllerAdvice + @ResponseBody so responses are JSON - the standard for REST APIs.", keyPoints: ["@ExceptionHandler: per-controller","@ControllerAdvice: global handlers","@RestControllerAdvice adds @ResponseBody"], code: "@RestControllerAdvice\nclass ApiExceptionHandler {\n  @ExceptionHandler(EntityNotFoundException.class)\n  ResponseEntity<ApiError> handle(EntityNotFoundException e) {\n    return ResponseEntity.status(404).body(new ApiError(e.getMessage()));\n  }\n}" },
  { id: "sw-11", topic: "spring-web", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is ResponseEntityExceptionHandler?", a: "Extend ResponseEntityExceptionHandler in your @ControllerAdvice to reuse and override Spring's built-in handling for common MVC exceptions (validation, unreadable body, 404) in one consistent place.", keyPoints: ["Base class for centralized MVC exceptions","Override the handle* methods","Consistent error responses"] },
  { id: "sw-12", topic: "spring-web", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you propagate exceptions from service to controller?", a: "Throw domain (usually unchecked) exceptions in the service layer and let them bubble up; a @RestControllerAdvice maps them to HTTP responses. Translate at the boundary rather than swallowing them.", keyPoints: ["Throw domain (unchecked) exceptions in services","Bubble up to @RestControllerAdvice","Translate to HTTP at the boundary"] },
  { id: "sw-13", topic: "spring-web", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you configure CORS in Spring Boot?", a: "Enable cross-origin access with @CrossOrigin on a controller/method, or globally through a WebMvcConfigurer addCorsMappings or a CorsFilter, specifying allowed origins, methods, and headers.", keyPoints: ["@CrossOrigin per controller/method","Global via WebMvcConfigurer / CorsFilter","Set allowed origins/methods/headers"] },
  { id: "sw-14", topic: "spring-web", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How does Spring Boot auto-configure Jackson for JSON?", a: "Boot auto-configures a Jackson ObjectMapper and HttpMessageConverters that (de)serialise @RequestBody/@ResponseBody. Customise with annotations (@JsonProperty, @JsonIgnore, @JsonFormat) or a custom ObjectMapper bean.", keyPoints: ["Auto-configured ObjectMapper + converters","@JsonProperty / @JsonIgnore / @JsonFormat","Customise via ObjectMapper bean"] },
  { id: "sw-15", topic: "spring-web", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "@Cacheable vs @CachePut vs @CacheEvict (with @EnableCaching)?", a: "@EnableCaching turns caching on. @Cacheable returns the cached result and skips the method on a hit; @CachePut always runs and updates the cache; @CacheEvict removes entries. Back it with a provider like Caffeine or Redis.", keyPoints: ["@EnableCaching enables it","@Cacheable (read) / @CachePut (write) / @CacheEvict (remove)","Provider: Caffeine / Redis"], code: "@Cacheable(value = \"products\", key = \"#id\", unless = \"#result == null\")\nProduct find(Long id) { ... }\n\n@CachePut(value = \"products\", key = \"#p.id\")\nProduct update(Product p) { ... }\n\n@CacheEvict(value = \"products\", key = \"#id\")\nvoid delete(Long id) { ... }" },
  { id: "sw-16", topic: "spring-web", difficulty: "medium", freq: "Occasional", companies: ["SERVICE","BANK","PRODUCT"], q: "How do the unless and condition attributes of @Cacheable work?", a: "condition is evaluated before the method to decide whether to apply caching; unless is evaluated after to decide whether to store the result (e.g. skip caching nulls). Both use SpEL.", keyPoints: ["condition: apply cache before the call","unless: skip storing after the call","Both are SpEL expressions"] },
  { id: "sw-17", topic: "spring-web", difficulty: "hard", freq: "Occasional", companies: ["BANK","PRODUCT"], q: "How do you prevent cache stampede or cache avalanche?", a: "Coalesce concurrent rebuilds with a single-flight lock, stagger/jitter TTLs so keys do not all expire at once, and pre-warm or serve stale-while-revalidate to smooth load spikes.", keyPoints: ["Single-flight lock (avoid dogpile)","Jittered TTLs (avoid mass expiry)","Pre-warm / stale-while-revalidate"] },
  { id: "sw-18", topic: "spring-web", difficulty: "hard", freq: "Very common", companies: ["BANK","PRODUCT"], q: "How do you secure REST APIs with Spring Security + JWT?", a: "Authenticate to get a signed JWT (header.payload.signature), then send it as a Bearer token; a filter validates the signature and expiry and populates the security context. It is stateless - no server-side session.", keyPoints: ["Login -> signed JWT (header.payload.signature)","Bearer token; filter validates each request","Stateless auth, no server session"] },
  { id: "sw-19", topic: "spring-web", difficulty: "medium", freq: "Occasional", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you implement rate limiting / throttling?", a: "Limit requests per client per window using a token-bucket or leaky-bucket algorithm (e.g. Bucket4j), an API gateway, or Redis counters, and return HTTP 429 when the limit is exceeded.", keyPoints: ["Token-bucket / leaky-bucket","Bucket4j / gateway / Redis counters","Return 429 when exceeded"] },
  { id: "sw-20", topic: "spring-web", difficulty: "medium", freq: "Occasional", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you implement file upload and download in Spring REST?", a: "Upload with a MultipartFile parameter and consumes=multipart/form-data; download by returning a ResponseEntity<Resource> (or streaming) with the right Content-Type and Content-Disposition headers.", keyPoints: ["Upload: MultipartFile, multipart/form-data","Download: ResponseEntity<Resource> + headers","Set Content-Type / Content-Disposition"] },
  { id: "db-1", topic: "database", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "DDL vs DML; DELETE vs TRUNCATE; WHERE vs HAVING?", a: "DDL defines schema (CREATE/ALTER/DROP); DML manipulates data (SELECT/INSERT/UPDATE/DELETE). DELETE is filtered, logged, and rollbackable; TRUNCATE removes all rows fast, resets identity, and is minimally logged. WHERE filters rows before grouping; HAVING filters groups after aggregation.", keyPoints: ["DDL = schema; DML = data","DELETE: filtered/logged; TRUNCATE: all rows, fast, resets id","WHERE (rows) vs HAVING (groups)"] },
  { id: "db-2", topic: "database", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "INNER JOIN vs LEFT JOIN?", a: "INNER JOIN returns only rows matching in both tables. LEFT JOIN returns all rows from the left table plus matched right rows, with NULLs where there is no match.", keyPoints: ["INNER: only matching rows","LEFT: all left rows + matched right (NULLs otherwise)","RIGHT/FULL for other directions"] },
  { id: "db-3", topic: "database", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "What are the ACID properties?", a: "Atomicity (all-or-nothing), Consistency (valid state to valid state), Isolation (concurrent transactions do not interfere), Durability (committed data survives crashes). The core transactional guarantees.", keyPoints: ["Atomicity, Consistency, Isolation, Durability","Isolation tuned by isolation levels","Durability via write-ahead log"] },
  { id: "db-4", topic: "database", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is indexing - when to use it and the trade-offs?", a: "An index speeds up reads/lookups like a book index, at the cost of extra storage and slower writes (each insert/update maintains it). Index high-selectivity columns used in WHERE/JOIN/ORDER BY; avoid over-indexing.", keyPoints: ["Faster reads; slower writes + more storage","Index WHERE/JOIN/ORDER BY columns","B-tree default; mind selectivity"] },
  { id: "db-5", topic: "database", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you implement pagination in SQL?", a: "Use LIMIT ... OFFSET ... (or FETCH FIRST n ROWS ONLY). For large offsets prefer keyset (seek) pagination - WHERE id > :lastId ORDER BY id LIMIT n - which stays fast.", keyPoints: ["LIMIT/OFFSET or FETCH FIRST","Large offsets get slow","Keyset/seek pagination scales"] },
  { id: "db-6", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Views vs materialized views?", a: "A view is a stored query - virtual, always current, no storage. A materialized view stores the result physically for fast reads but must be refreshed and can be stale. Views also simplify and secure access.", keyPoints: ["View: virtual, always fresh","Materialized: stored, fast, needs refresh","Views simplify + restrict access"] },
  { id: "db-7", topic: "database", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is the logical execution order of a SQL query?", a: "FROM -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT/OFFSET. Because SELECT runs late, you cannot use a SELECT alias in WHERE.", keyPoints: ["FROM/JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT","SELECT is evaluated late","Aliases unavailable in WHERE"] },
  { id: "db-8", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is a self join and why use it?", a: "A self join joins a table to itself using aliases, used for related rows within one table - for example matching each employee to their manager stored in the same table.", keyPoints: ["Table joined to itself via aliases","Hierarchies (employee -> manager)","Compare rows within one table"] },
  { id: "db-9", topic: "database", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Find the Nth highest salary.", a: "Use DENSE_RANK() OVER (ORDER BY salary DESC) and filter rank = N, or a correlated subquery counting distinct higher salaries. Window functions are the clean modern answer.", keyPoints: ["DENSE_RANK() OVER (ORDER BY salary DESC)","Filter rank = N","Or correlated subquery with COUNT(DISTINCT)"], code: "SELECT DISTINCT salary FROM (\n  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk\n  FROM employee\n) t WHERE rnk = :n;" },
  { id: "db-10", topic: "database", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Find the top 3 highest-paid employees per department.", a: "Partition with a window function: ROW_NUMBER() or DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC), then keep rank <= 3.", keyPoints: ["PARTITION BY dept ORDER BY salary DESC","ROW_NUMBER / DENSE_RANK","Filter rank <= N"], code: "SELECT * FROM (\n  SELECT e.*, DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk\n  FROM employee e\n) t WHERE rnk <= 3;" },
  { id: "db-11", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Find employees earning more than their department average.", a: "Use a correlated subquery: WHERE salary > (SELECT AVG(salary) FROM emp e2 WHERE e2.dept = e1.dept), or compare against AVG(salary) OVER (PARTITION BY dept).", keyPoints: ["Correlated subquery on dept AVG","Or AVG() OVER (PARTITION BY dept)","Compare row salary to group average"] },
  { id: "db-12", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Explain primary, candidate, composite and surrogate keys.", a: "Candidate keys can each uniquely identify a row; one is chosen as the primary key. A composite key spans multiple columns; a surrogate key is an artificial id with no business meaning. A table can lack a PK, but then rows are not uniquely identifiable and integrity/performance suffer.", keyPoints: ["Candidate -> chosen primary key","Composite (multi-col) vs surrogate (auto id)","No PK -> weak identity/integrity"] },
  { id: "db-13", topic: "database", difficulty: "hard", freq: "Occasional", companies: ["BANK","PRODUCT"], q: "What are the types of table partitioning?", a: "Partitioning splits a large table into physical pieces: RANGE (value ranges, e.g. dates), LIST (discrete values), and HASH (even spread). It improves query pruning and maintenance on huge tables.", keyPoints: ["RANGE / LIST / HASH partitioning","Query pruning + easier maintenance","For very large tables"] },
  { id: "db-14", topic: "database", difficulty: "hard", freq: "Occasional", companies: ["BANK","PRODUCT"], q: "Horizontal vs vertical partitioning?", a: "Horizontal partitioning splits rows across partitions/shards (same columns, fewer rows each). Vertical partitioning splits columns into separate tables (e.g. hot vs large/cold columns). Sharding is horizontal partitioning across servers.", keyPoints: ["Horizontal: split rows (sharding)","Vertical: split columns","Shrink table size / isolate hot data"] },
  { id: "db-15", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Difference between an index and a unique constraint?", a: "A plain index speeds lookups and may allow duplicates; a UNIQUE constraint enforces uniqueness and is backed by a unique index. Use unique for integrity, a plain index for performance.", keyPoints: ["Index: speed (dups allowed)","Unique: integrity (unique index)","Different intent, both aid lookups"] },
  { id: "db-16", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is normalization vs denormalization?", a: "Normalization organises tables to remove redundancy and update anomalies (1NF/2NF/3NF). Denormalization deliberately adds redundancy to speed reads. It is a trade-off: write integrity vs read performance.", keyPoints: ["Normalize: remove redundancy (1NF/2NF/3NF)","Denormalize: redundancy for read speed","Trade integrity vs performance"] },
  { id: "db-17", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Optimistic vs pessimistic locking at the DB level?", a: "Pessimistic locking locks rows (SELECT ... FOR UPDATE) so others block - safe under high contention but limits concurrency. Optimistic locking checks a version at commit and retries on conflict - better under low contention.", keyPoints: ["Pessimistic: SELECT FOR UPDATE, blocks","Optimistic: version check + retry","Pick by contention level"] },
  { id: "db-18", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What are the SQL isolation levels?", a: "READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, and SERIALIZABLE - each prevents more anomalies (dirty reads, non-repeatable reads, phantom reads) at the cost of concurrency.", keyPoints: ["RU / RC / RR / Serializable","Prevent dirty/non-repeatable/phantom reads","Higher isolation -> less concurrency"] },
  { id: "ms-1", topic: "microservices", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "What are microservices and how do they differ from a monolith?", a: "Microservices split an app into small, independently deployable services that each own their data. Benefits: independent scaling and deploys, tech diversity, fault isolation. Downsides: distributed-system complexity, network latency, data consistency, and operational overhead.", keyPoints: ["Small, independently deployable, own data","Pros: independent scale/deploy, fault isolation","Cons: distributed complexity, consistency, ops"] },
  { id: "ms-2", topic: "microservices", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do microservices communicate (sync vs async)?", a: "Synchronous: REST/HTTP or gRPC (request-response, tighter coupling). Asynchronous: messaging over Kafka/RabbitMQ (events, loose coupling, resilience). Use async to decouple and absorb spikes, sync when you need an immediate reply.", keyPoints: ["Sync: REST/gRPC request-response","Async: Kafka/RabbitMQ events","Async decouples; sync is immediate"] },
  { id: "ms-3", topic: "microservices", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is Event-Driven Architecture?", a: "Services communicate by publishing and consuming events through a broker instead of calling each other directly. It decouples producers from consumers, improves scalability and resilience, and enables eventual consistency.", keyPoints: ["Publish/subscribe events via a broker","Decouples producers from consumers","Enables scalability + eventual consistency"] },
  { id: "ms-4", topic: "microservices", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Event vs command vs query in EDA?", a: "An event states something happened (OrderPlaced, past tense, fans out to many). A command requests an action (PlaceOrder, one handler). A query asks for data without changing state.", keyPoints: ["Event: fact, past tense, fan-out","Command: request an action, single handler","Query: read-only ask"] },
  { id: "ms-5", topic: "microservices", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is the role of a message broker / event bus?", a: "The broker (Kafka/RabbitMQ) decouples services by buffering and routing messages, giving durability, retries, ordering within a partition, and consumer groups so producers and consumers scale independently.", keyPoints: ["Decouples + buffers + routes messages","Durability, retries, ordering","Consumer groups for scaling"] },
  { id: "ms-6", topic: "microservices", difficulty: "hard", freq: "Occasional", companies: ["BANK","PRODUCT"], q: "Event sourcing vs traditional CRUD?", a: "Event sourcing stores the sequence of state-changing events as the source of truth and rebuilds state by replaying them, instead of storing only current state (CRUD). It gives a full audit log and time-travel, at the cost of extra complexity.", keyPoints: ["Store events, not just current state","Rebuild state by replaying events","Full history/audit; more complexity"] },
  { id: "ms-7", topic: "microservices", difficulty: "hard", freq: "Very common", companies: ["BANK","PRODUCT"], q: "How do you handle distributed transactions - the Saga pattern?", a: "You avoid two-phase commit across services. A Saga is a sequence of local transactions, each publishing an event that triggers the next step; if a step fails, compensating transactions undo the previous ones, giving eventual consistency.", keyPoints: ["No 2PC; local txns + events","Failure -> compensating transactions","Achieves eventual consistency"] },
  { id: "ms-8", topic: "microservices", difficulty: "hard", freq: "Common", companies: ["BANK","PRODUCT"], q: "Saga: choreography vs orchestration?", a: "Choreography: services react to each other's events with no central coordinator - simple but harder to trace. Orchestration: a central orchestrator directs each step and handles failures - clearer control but a component to own.", keyPoints: ["Choreography: event-driven, no coordinator","Orchestration: central coordinator drives steps","Simplicity vs central control"] },
  { id: "ms-9", topic: "microservices", difficulty: "hard", freq: "Common", companies: ["BANK","PRODUCT"], q: "How do you handle idempotency and retries in a Saga?", a: "Because messages may be delivered more than once, each step must be idempotent (dedupe by a business/event id) so retries are safe; combine with backoff, timeouts, and dead-letter queues for poison messages.", keyPoints: ["Dedupe by event/business id","Retry with backoff","DLQ for poison messages"] },
  { id: "ms-10", topic: "microservices", difficulty: "hard", freq: "Common", companies: ["BANK","PRODUCT"], q: "What is CQRS?", a: "Command Query Responsibility Segregation separates the write model (commands) from the read model (queries), often with different stores. Reads scale independently and are query-optimised; the read model is kept in sync via events (eventually consistent).", keyPoints: ["Split write model vs read model","Reads scale + are query-optimised","Sync via events -> eventual consistency"] },
  { id: "ms-11", topic: "microservices", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you use a Feign client and handle fallbacks?", a: "Feign is a declarative REST client: annotate an interface with @FeignClient and Spring generates the HTTP calls. Manage URLs via service discovery or config, and add fallbacks with Resilience4j or a fallback factory for graceful degradation.", keyPoints: ["@FeignClient declarative REST interface","URLs via discovery/config","Fallbacks via Resilience4j"] },
  { id: "ms-12", topic: "microservices", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Difference between fault tolerance and resilience?", a: "Fault tolerance is continuing to work despite a fault; resilience is the broader ability to absorb failures and recover/adapt using patterns like circuit breakers, retries, bulkheads, and graceful degradation.", keyPoints: ["Fault tolerance: keep working despite faults","Resilience: absorb + recover/adapt","Patterns: breaker, retry, bulkhead"] },
  { id: "ms-13", topic: "microservices", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What resilience patterns do you use (circuit breaker, bulkhead)?", a: "Circuit breaker stops calling a failing service and fails fast; bulkhead isolates resource pools so one slow dependency cannot sink the whole app; plus retry, timeout, rate limiter, and fallback.", keyPoints: ["Circuit breaker: fail fast on downstream failure","Bulkhead: isolate resource pools","+ retry, timeout, rate limiter, fallback"] },
  { id: "ms-14", topic: "microservices", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Explain circuit breaker states (Resilience4j).", a: "Closed (calls pass, failures counted) -> Open (calls fail fast once the failure threshold is hit) -> Half-open (a few trial calls; success closes it, failure reopens). It prevents cascading failures.", keyPoints: ["Closed -> Open -> Half-open","Open = fail fast; half-open = trial calls","Prevents cascading failures"] },
  { id: "ms-15", topic: "microservices", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do retry, backoff, timeout and rate limiting help?", a: "Retry recovers from transient failures, with exponential backoff plus jitter to avoid thundering herds; timeouts bound slow calls; rate limiting protects downstreams. Only retry idempotent operations.", keyPoints: ["Exponential backoff + jitter","Timeouts bound slow calls","Retry only idempotent operations"] },
  { id: "ms-16", topic: "microservices", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Client-side vs server-side load balancing (L4 vs L7)?", a: "Server-side: a load balancer (ALB/Nginx) in front distributes requests. Client-side: the caller picks an instance from the registry (Spring Cloud LoadBalancer). L4 balances by TCP, L7 by HTTP content.", keyPoints: ["Server-side: LB in front","Client-side: caller picks from registry","L4 (TCP) vs L7 (HTTP-aware)"] },
  { id: "ms-17", topic: "microservices", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Scalability: horizontal vs vertical - are microservices more scalable?", a: "Vertical scaling means a bigger machine (limited, single point); horizontal scaling means more instances behind a balancer (elastic, fault-tolerant). Stateless microservices scale horizontally well, which is a key advantage over a monolith.", keyPoints: ["Vertical: bigger box; Horizontal: more instances","Horizontal is elastic + fault-tolerant","Stateless services scale out easily"] },
  { id: "ms-18", topic: "microservices", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is service discovery and why is it needed?", a: "A registry (Eureka/Consul) where services register themselves and look each other up by name, so instances can come and go without hardcoded URLs. In Boot you add a discovery client and call by service id.", keyPoints: ["Registry: services register + look up","Call by service name, not host:port","Handles dynamic instances"] },
  { id: "ms-19", topic: "microservices", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is distributed tracing (traceId / spanId)?", a: "Tracing follows a request across services using a shared traceId and per-hop spanIds propagated in headers, so you can see the full path and latency. Tools: Micrometer Tracing/Sleuth with Zipkin or Jaeger.", keyPoints: ["traceId across request; spanId per hop","Propagated via headers","Micrometer Tracing/Sleuth + Zipkin/Jaeger"] },
  { id: "ms-20", topic: "microservices", difficulty: "hard", freq: "Occasional", companies: ["BANK","PRODUCT"], q: "Explain the CAP theorem and 12-factor apps.", a: "CAP: during a network partition a distributed system can guarantee only two of Consistency, Availability, and Partition-tolerance - so you trade C vs A. The 12-factor methodology codifies cloud-native practices (config in env, stateless processes, logs as streams).", keyPoints: ["CAP: pick 2 under partition (usually C vs A)","Partition tolerance is a must in distributed systems","12-factor: config, stateless, disposable"] },
  { id: "jpa-26", topic: "jpa", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Difference between JPA, Hibernate and Spring Data JPA?", a: "JPA is the specification (interfaces/annotations). Hibernate is an implementation (provider) of JPA. Spring Data JPA is a higher abstraction on top that auto-generates repositories. So: spec -> provider -> repository abstraction.", keyPoints: ["JPA = spec; Hibernate = implementation","Spring Data JPA = repository layer on top","spec -> provider -> abstraction"] },
  { id: "jpa-27", topic: "jpa", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Java transient keyword vs JPA @Transient?", a: "The Java transient keyword excludes a field from Java serialization; JPA's @Transient excludes a field from persistence so it is not mapped to a column. Different mechanisms, both meaning 'do not store this field'.", keyPoints: ["Java transient: skip in serialization","@Transient: skip in persistence","Different mechanisms, same intent"] },
  { id: "jpa-28", topic: "jpa", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "@GeneratedValue strategies: AUTO, IDENTITY, SEQUENCE, TABLE?", a: "IDENTITY uses an auto-increment column (a round-trip per insert, no insert batching). SEQUENCE uses a DB sequence and can pre-allocate ids (allocationSize) so inserts batch well. TABLE emulates a sequence via a table (portable, slower). AUTO lets the provider choose by dialect.", keyPoints: ["IDENTITY: auto-increment, no insert batching","SEQUENCE: DB sequence, batch-friendly (allocationSize)","TABLE: emulated/portable; AUTO: provider picks"], code: "@Id\n@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = \"emp_seq\")\n@SequenceGenerator(name = \"emp_seq\", sequenceName = \"employee_seq\", allocationSize = 50)\nprivate Long id;" },
  { id: "jpa-29", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "When would you prefer SEQUENCE over IDENTITY?", a: "SEQUENCE lets Hibernate pre-allocate ids and batch inserts, while IDENTITY forces a round-trip per insert and disables JDBC insert batching. On Postgres/Oracle, prefer SEQUENCE for bulk inserts.", keyPoints: ["SEQUENCE pre-allocates -> batch inserts","IDENTITY: per-insert round-trip, no batching","Prefer SEQUENCE for bulk work"] },
  { id: "jpa-30", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is the role of EntityManager?", a: "EntityManager is the core JPA API that manages the persistence context: persist, merge, remove, find, and JPQL queries. Spring Data repositories delegate to it; use it directly for custom or dynamic logic.", keyPoints: ["Manages the persistence context","persist/merge/remove/find + JPQL","Repositories delegate to it"] },
  { id: "jpa-31", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "When do you use @OneToOne, @OneToMany, @ManyToOne, @ManyToMany?", a: "Choose by cardinality: @ManyToOne/@OneToMany for parent-children (the many side owns the FK), @OneToOne for 1:1, @ManyToMany with a join table. Prefer bidirectional mappings with mappedBy and LAZY fetching.", keyPoints: ["Choose by cardinality","@ManyToOne (many side) owns the FK","@ManyToMany -> join table; keep LAZY"] },
  { id: "jpa-32", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you implement auditing (@CreatedDate, @LastModifiedDate)?", a: "Enable @EnableJpaAuditing, add @EntityListeners(AuditingEntityListener.class) to the entity, and annotate fields with @CreatedDate/@LastModifiedDate (and @CreatedBy/@LastModifiedBy with an AuditorAware). Spring fills them on save/update.", keyPoints: ["@EnableJpaAuditing + AuditingEntityListener","@CreatedDate/@LastModifiedDate auto-filled","@CreatedBy needs an AuditorAware"] },
  { id: "jpa-33", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you handle optimistic and pessimistic locking (@Version, @Lock)?", a: "Optimistic: a @Version field is checked on update and throws OptimisticLockException on a conflict - good for low contention. Pessimistic: @Lock(PESSIMISTIC_WRITE) issues SELECT ... FOR UPDATE to block others - for high contention.", keyPoints: ["@Version -> optimistic (conflict = exception)","@Lock(PESSIMISTIC_WRITE) -> SELECT FOR UPDATE","Low vs high contention"] },
  { id: "jpa-34", topic: "jpa", difficulty: "hard", freq: "Occasional", companies: ["BANK","PRODUCT"], q: "How do you integrate multiple data sources with Spring Data JPA?", a: "Define separate DataSource, EntityManagerFactory, and TransactionManager beans per database, each with its own @EnableJpaRepositories(basePackages, entityManagerFactoryRef, transactionManagerRef), and mark one set @Primary.", keyPoints: ["Separate DataSource/EMF/TM per DB","@EnableJpaRepositories per package","Mark one @Primary"] },
  { id: "jpa-35", topic: "jpa", difficulty: "hard", freq: "Occasional", companies: ["BANK","PRODUCT"], q: "How do you implement multi-tenancy with Spring Data JPA?", a: "Isolate tenants with database-per-tenant, schema-per-tenant, or a shared schema with a tenant discriminator column. Hibernate supports DATABASE/SCHEMA multi-tenancy via a TenantIdentifierResolver plus a connection provider that resolves the tenant per request.", keyPoints: ["DB-per-tenant / schema-per-tenant / discriminator","Hibernate multi-tenancy support","Resolve tenant per request"] },
  { id: "jpa-36", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What are Entity Graphs and when do you use them?", a: "@EntityGraph (or @NamedEntityGraph) specifies which associations to fetch eagerly for a specific query, fixing N+1 without changing the entity's global fetch type - a per-query fetch plan.", keyPoints: ["@EntityGraph = per-query fetch plan","Fixes N+1 without global EAGER","attributePaths lists what to fetch"] },
  { id: "jpa-37", topic: "jpa", difficulty: "medium", freq: "Occasional", companies: ["SERVICE","BANK","PRODUCT"], q: "@NamedQuery vs @NamedNativeQuery, and precedence with @Query?", a: "@NamedQuery defines a reusable JPQL query on the entity (validated at startup); @NamedNativeQuery does the same with raw SQL. If a named query and a repository @Query share a name, the @Query annotation takes precedence.", keyPoints: ["@NamedQuery (JPQL) vs @NamedNativeQuery (SQL)","Validated at startup, reusable","@Query overrides a same-named NamedQuery"] },
  { id: "jpa-38", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do native queries and projections work in Spring Data JPA?", a: "Use nativeQuery=true for vendor SQL, and map results to entities, DTOs (constructor expressions), or interface-based projections (getter interfaces) to fetch only the columns you need.", keyPoints: ["nativeQuery=true for raw SQL","Interface or DTO projections","Fetch only needed columns"] },
  { id: "jpa-39", topic: "jpa", difficulty: "medium", freq: "Occasional", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you define an index in JPA, and does it index foreign keys?", a: "Declare indexes with @Table(indexes = @Index(columnList = ...)); this only affects schema generation. JPA does NOT auto-create indexes on foreign keys, so add them explicitly for join performance.", keyPoints: ["@Table(indexes=@Index(...)) at schema-gen","No automatic FK indexes","Index FK/join columns manually"] },

  // --- Market-research: high-yield JPA & SQL (4-7 yr) ---
  { id: "jpa-40", topic: "jpa", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "persist() vs merge() - when do you use each?", a: "persist() makes a new (transient) entity managed and must not already exist. merge() copies the state of a detached entity onto a managed instance and returns that managed copy - the argument itself stays detached. Use persist for inserts, merge to reattach/update detached objects. Spring Data's save() picks between them based on whether the entity is new.", keyPoints: ["persist: transient -> managed (insert)","merge: copies detached state -> managed copy (returned)","The merge argument stays detached"] },
  { id: "jpa-41", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "save() vs saveAndFlush() in Spring Data JPA?", a: "Both persist the entity, but save() only registers the change in the persistence context and flushes at transaction commit (or when Hibernate decides). saveAndFlush() forces an immediate flush, so the SQL runs now - useful when you need the generated id or want constraint violations to surface before commit.", keyPoints: ["save: flush deferred to commit","saveAndFlush: flush to DB immediately","Use saveAndFlush to force SQL / surface errors now"] },
  { id: "jpa-42", topic: "jpa", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "What causes LazyInitializationException and how do you fix it properly?", a: "It happens when you access a LAZY association after the persistence context/session has closed - typically in the serialization or view layer. Fix it by fetching what you need inside the transaction with a JOIN FETCH or @EntityGraph, or by mapping to a DTO. Do NOT fix it by making everything EAGER or relying on Open-Session-In-View, which cause N+1.", keyPoints: ["Access LAZY field after session closed","Fix: JOIN FETCH / @EntityGraph / DTO in the transaction","Avoid EAGER-everything and OSIV crutches"] },
  { id: "jpa-43", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is the persistence context and dirty checking?", a: "The persistence context (first-level cache) tracks managed entities within a transaction. At flush/commit Hibernate compares each managed entity to its loaded snapshot and auto-generates UPDATE statements for changed fields - dirty checking - so you often don't call save() at all for an already-managed entity.", keyPoints: ["L1 cache tracks managed entities per transaction","Dirty checking auto-updates changed entities on flush","No explicit save() needed for managed entities"] },
  { id: "jpa-44", topic: "jpa", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "What are the default fetch types for each relationship?", a: "@ManyToOne and @OneToOne default to EAGER; @OneToMany and @ManyToMany default to LAZY. The eager to-one defaults are a common cause of accidental over-fetching and N+1, so many teams set to-one associations to LAZY explicitly.", keyPoints: ["to-one (@ManyToOne/@OneToOne): EAGER by default","to-many (@OneToMany/@ManyToMany): LAZY by default","Set to-one LAZY to avoid over-fetch / N+1"] },
  { id: "jpa-45", topic: "jpa", difficulty: "hard", freq: "Very common", companies: ["BANK","PRODUCT"], q: "Explain the JPA inheritance mapping strategies.", a: "SINGLE_TABLE: one table for the whole hierarchy with a discriminator column - fastest reads but nullable columns. JOINED: a table per class joined by primary key - normalised, no wasted nulls, but joins on read. TABLE_PER_CLASS: a full table per concrete class - no joins but duplicated columns and poor polymorphic queries. SINGLE_TABLE is the usual default.", keyPoints: ["SINGLE_TABLE: one table + discriminator (fast, nullable cols)","JOINED: table per class joined by PK (normalised)","TABLE_PER_CLASS: table per concrete class (dup columns)"], code: "@Entity\n@Inheritance(strategy = InheritanceType.SINGLE_TABLE)\n@DiscriminatorColumn(name = \"type\")\nabstract class Payment { ... }\n\n@Entity @DiscriminatorValue(\"CARD\")\nclass CardPayment extends Payment { ... }" },
  { id: "jpa-46", topic: "jpa", difficulty: "hard", freq: "Very common", companies: ["BANK","PRODUCT"], q: "Why might @Transactional not work when a method is called from the same class?", a: "@Transactional works through a Spring proxy that wraps the bean. If a method calls another @Transactional method on the SAME instance (this.method()), the call bypasses the proxy, so the transaction is never started. Fix: move the method to another bean, self-inject the proxy, or use AspectJ weaving.", keyPoints: ["Proxy-based: only external calls are intercepted","Self-invocation (this.method()) bypasses the proxy","Fix: separate bean / self-inject / AspectJ"] },
  { id: "jpa-47", topic: "jpa", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "@Enumerated STRING vs ORDINAL - which and why?", a: "@Enumerated(EnumType.ORDINAL) stores the enum's position (0,1,2) - compact but fragile: reordering or inserting enum values silently corrupts existing rows. @Enumerated(EnumType.STRING) stores the name - safe and readable. Always prefer STRING.", keyPoints: ["ORDINAL: stores index (0,1,2) - fragile on reorder","STRING: stores the name - safe, readable","Always prefer STRING"] },
  { id: "jpa-48", topic: "jpa", difficulty: "hard", freq: "Common", companies: ["BANK","PRODUCT"], q: "How should you implement equals() and hashCode() for a JPA entity?", a: "Don't use a DB-generated id in hashCode - it's null before persist, so the entity's hash changes after save and breaks Set/Map membership. Best practice: use a stable business key, or return a constant hashCode and compare by id in equals (handling null), so identity is stable across the whole entity lifecycle.", keyPoints: ["Generated id is null pre-persist -> unstable hashCode","Use a business key, or constant hashCode + id-based equals","Broken equals/hashCode corrupts Set/Map"] },
  { id: "jpa-49", topic: "jpa", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What do the spring.jpa.hibernate.ddl-auto values do?", a: "none (do nothing), validate (verify the schema matches the entities - safest for prod), update (add missing tables/columns - convenient but risky and can't drop/alter), create (drop and create on startup), create-drop (also drop on shutdown, for tests). Use validate in production alongside Flyway/Liquibase.", keyPoints: ["none / validate / update / create / create-drop","Prod: validate + Flyway/Liquibase","Never update/create in production"] },
  { id: "jpa-50", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is Open Session In View and why disable it?", a: "OSIV (spring.jpa.open-in-view, on by default) keeps the persistence context open until the view/response renders, so LAZY fields can load outside the service layer. It hides LazyInitializationException but causes N+1 and holds DB connections longer. Best practice: disable it and fetch what you need explicitly.", keyPoints: ["Keeps session open through view rendering","Hides LazyInit but causes N+1 + long-held connections","Disable it; fetch via JOIN FETCH / DTO"] },
  { id: "jpa-51", topic: "jpa", difficulty: "medium", freq: "Occasional", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you implement soft delete in JPA/Hibernate?", a: "Instead of physically deleting, mark rows (e.g. is_deleted = true). Use @SQLDelete to rewrite the delete as an UPDATE, and @Where with clause is_deleted = false so queries skip deleted rows. Watch out: the second-level cache, cascades, and native JOIN queries may still see soft-deleted rows.", keyPoints: ["@SQLDelete rewrites DELETE as an UPDATE flag","@Where filters out soft-deleted rows","Mind cache, cascades, native JOINs"], code: "@Entity\n@SQLDelete(sql = \"UPDATE product SET is_deleted = true WHERE id = ?\")\n@Where(clause = \"is_deleted = false\")\nclass Product { ... }" },
  { id: "jpa-52", topic: "jpa", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "In a bidirectional relationship, what is the owning side and mappedBy?", a: "The OWNING side holds the foreign key and is where JPA reads/writes the association (usually the @ManyToOne side with @JoinColumn); the inverse side uses mappedBy to point at it. You must set the owning side to persist the link - updating only the inverse collection is a common bug.", keyPoints: ["Owning side holds the FK (@JoinColumn)","Inverse side uses mappedBy","Set the owning side to persist the relationship"] },
  { id: "jpa-53", topic: "jpa", difficulty: "medium", freq: "Occasional", companies: ["SERVICE","BANK","PRODUCT"], q: "orphanRemoval vs CascadeType.REMOVE?", a: "CascadeType.REMOVE deletes children when the parent is deleted. orphanRemoval=true additionally deletes a child when it is removed from the parent's collection (disassociated), not only when the parent is deleted. Use orphanRemoval for true parent-owned child lifecycles.", keyPoints: ["CascadeType.REMOVE: delete children with the parent","orphanRemoval: delete child when removed from collection","orphanRemoval for parent-owned lifecycles"] },
  { id: "hib-26", topic: "hibernate", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Difference between merge() and update() in Hibernate?", a: "update() reattaches a detached object to the session and throws if another instance with the same id is already managed - it only works on detached entities. merge() copies state onto a managed instance and returns it, working whether the entity is transient, detached, or already managed. merge is JPA-standard and safer; update is Hibernate-specific.", keyPoints: ["update: reattach detached (fails if id already managed)","merge: copy state -> managed copy (returned)","merge is JPA-standard and safer"] },
  { id: "db-19", topic: "database", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "ROW_NUMBER vs RANK vs DENSE_RANK?", a: "All number rows within an ordered window. ROW_NUMBER gives a unique sequential number even for ties. RANK gives ties the same number but then skips values (1,1,3). DENSE_RANK gives ties the same number with no gaps (1,1,2). Use ROW_NUMBER to pick one row per group, DENSE_RANK for top-N distinct values.", keyPoints: ["ROW_NUMBER: unique, breaks ties","RANK: ties equal, gaps after (1,1,3)","DENSE_RANK: ties equal, no gaps (1,1,2)"], code: "SELECT name, salary,\n  ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn,\n  RANK()       OVER (ORDER BY salary DESC) AS rnk,\n  DENSE_RANK() OVER (ORDER BY salary DESC) AS drnk\nFROM employee;" },
  { id: "db-20", topic: "database", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is a window function, and why can't you filter it in WHERE?", a: "A window function computes across a set of related rows (the OVER window) without collapsing rows like GROUP BY. Because it is evaluated after WHERE/GROUP BY (at SELECT time), you cannot reference it in WHERE - wrap it in a CTE or subquery and filter on the alias. Writing WHERE RANK() OVER(...) is a classic interview trap.", keyPoints: ["OVER(PARTITION BY ... ORDER BY ...), keeps all rows","Runs at SELECT time -> not allowed in WHERE","Wrap in a CTE/subquery, filter the alias"] },
  { id: "db-21", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is a CTE and a recursive CTE?", a: "A CTE (WITH clause) is a named temporary result set for a single statement that makes complex queries readable and enables recursion. A recursive CTE has an anchor query plus a recursive member that references the CTE, used for hierarchies (employee-to-manager chains) or generating sequences.", keyPoints: ["WITH name AS (...): readable, single-statement scope","Recursive CTE: anchor + recursive member","For hierarchies / generated sequences"], code: "WITH RECURSIVE org AS (\n  SELECT id, name, manager_id, 1 AS lvl\n  FROM employee WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.id, e.name, e.manager_id, o.lvl + 1\n  FROM employee e JOIN org o ON e.manager_id = o.id\n)\nSELECT * FROM org;" },
  { id: "db-22", topic: "database", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Find employees who earn more than their manager.", a: "The classic self-join: join the employee table to itself, matching each employee row to their manager row via manager_id, then compare salaries. It tests whether you can join a table to itself with aliases.", keyPoints: ["Self-join emp to emp on e.manager_id = m.id","Compare e.salary > m.salary","The #1 self-join interview query"], code: "SELECT e.name\nFROM employee e\nJOIN employee m ON e.manager_id = m.id\nWHERE e.salary > m.salary;" },
  { id: "db-23", topic: "database", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you find duplicate rows in a table?", a: "Group by the columns that define a duplicate and keep groups with COUNT(*) > 1. To also identify which rows, use ROW_NUMBER() OVER (PARTITION BY those_columns) and keep rows where the number > 1.", keyPoints: ["GROUP BY cols HAVING COUNT(*) > 1","Or ROW_NUMBER() PARTITION BY the cols","rn > 1 marks duplicates"], code: "SELECT email, COUNT(*)\nFROM users\nGROUP BY email\nHAVING COUNT(*) > 1;" },
  { id: "db-24", topic: "database", difficulty: "hard", freq: "Common", companies: ["BANK","PRODUCT"], q: "How do you delete duplicate rows keeping one?", a: "Number the duplicates with ROW_NUMBER() OVER (PARTITION BY the_duplicate_columns ORDER BY id) inside a CTE, then delete the rows where the number > 1 - this keeps exactly one row per group.", keyPoints: ["ROW_NUMBER() PARTITION BY dup cols in a CTE","DELETE the rows where rn > 1","Keeps one row per group"], code: "WITH d AS (\n  SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn\n  FROM users\n)\nDELETE FROM users\nWHERE id IN (SELECT id FROM d WHERE rn > 1);" },
  { id: "db-25", topic: "database", difficulty: "easy", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "UNION vs UNION ALL?", a: "UNION combines two result sets and removes duplicates (an extra sort/dedup pass, slower). UNION ALL keeps all rows including duplicates and is faster. Prefer UNION ALL unless you specifically need distinct results.", keyPoints: ["UNION: removes duplicates (slower)","UNION ALL: keeps everything (faster)","Prefer UNION ALL unless dedup needed"] },
  { id: "db-26", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "EXISTS vs IN vs JOIN - and the NOT IN NULL trap?", a: "IN checks membership against a value list/subquery; EXISTS checks whether a correlated subquery returns any row (often faster and short-circuits at the first match). Key trap: NOT IN with a subquery that returns any NULL yields no rows - use NOT EXISTS or filter out NULLs.", keyPoints: ["IN: value membership; EXISTS: correlated row-exists","EXISTS short-circuits; good for large subqueries","NOT IN + NULL -> empty result; use NOT EXISTS"] },
  { id: "db-27", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Find customers who never placed an order (anti-join).", a: "Find rows in one table with no match in another using a LEFT JOIN ... WHERE right.id IS NULL, or NOT EXISTS. NOT EXISTS is usually clearest and is NULL-safe compared with NOT IN.", keyPoints: ["LEFT JOIN ... WHERE other.id IS NULL","Or NOT EXISTS (correlated)","Avoid NOT IN on nullable columns"], code: "SELECT c.*\nFROM customer c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL;" },
  { id: "db-28", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you handle NULLs in SQL (COALESCE, NULLIF, IS NULL)?", a: "NULL means unknown, so NULL = NULL is not true - test with IS NULL / IS NOT NULL. COALESCE returns the first non-null argument (defaults); NULLIF returns NULL when two values are equal (e.g. to avoid divide-by-zero). Aggregates like COUNT(col) skip NULLs, while COUNT(*) does not.", keyPoints: ["Test with IS NULL, not = NULL","COALESCE for defaults; NULLIF to null-out","COUNT(col) ignores NULLs; COUNT(*) doesn't"] },
  { id: "db-29", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you compute a running/cumulative total?", a: "Use SUM(x) OVER (ORDER BY d ROWS UNBOUNDED PRECEDING) for a running total, or add PARTITION BY group for per-group totals. The frame clause (ROWS vs RANGE) controls exactly which rows are summed.", keyPoints: ["SUM(x) OVER (ORDER BY ...) = running total","PARTITION BY for per-group running totals","ROWS vs RANGE controls the frame"], code: "SELECT day, amount,\n  SUM(amount) OVER (ORDER BY day ROWS UNBOUNDED PRECEDING) AS running_total\nFROM sales;" },
  { id: "db-30", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Clustered vs non-clustered index?", a: "A clustered index defines the physical order of the table's rows - one per table (often the primary key), so range scans are fast. A non-clustered index is a separate structure of key values plus row pointers - many are allowed, but a lookup may need an extra step to fetch the row unless it's a covering index.", keyPoints: ["Clustered: physical row order, one per table","Non-clustered: separate structure + pointers, many","Covering index avoids the extra row lookup"] },
  { id: "db-31", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How does a composite index and the leftmost-prefix rule work?", a: "A composite index covers multiple columns and the column ORDER matters: the DB can use it for queries filtering on a leftmost prefix (col1, or col1+col2) but not for col2 alone. Put the most selective / most-filtered column first, matching your WHERE and ORDER BY.", keyPoints: ["Index (a,b,c): column order matters","Usable for a, a+b, a+b+c (leftmost prefix)","Not usable for b alone; selective column first"] },
  { id: "db-32", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you debug and optimize a slow SQL query?", a: "Read the EXPLAIN plan to spot full scans, missing indexes, and bad join orders. Add indexes on WHERE/JOIN/ORDER BY columns, avoid SELECT *, keep predicates SARGable (don't wrap an indexed column in a function - WHERE YEAR(d)=2025 blocks the index), and filter rows early.", keyPoints: ["EXPLAIN to find scans / missing indexes","Index WHERE/JOIN/ORDER BY; avoid SELECT *","Keep predicates SARGable (no function on indexed col)"] },
  { id: "db-33", topic: "database", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Correlated vs non-correlated subquery?", a: "A non-correlated subquery runs once, independently, and its result feeds the outer query. A correlated subquery references the outer row and runs once per outer row (often slower) - it can frequently be rewritten as a JOIN or window function for better performance.", keyPoints: ["Non-correlated: runs once, independent","Correlated: references outer row, runs per row","Often rewrite correlated as JOIN / window"] },

  // --- My Experience: Barclays project + Service Mesh (resume-based) ---
  { id: "exp-1", topic: "experience", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Walk me through your current project at Barclays - what is it and what is your role?", a: "HOW TO ANSWER: Give a 60-second structured overview. (1) What the system does: the backend of the corporate banking platform handling payment processing. (2) Your role: core backend developer who owns migrations and production releases. (3) Scale/criticality: payment services with 99.9% uptime. (4) Two or three headline contributions: Java 8->21 migration, Spring->Spring Boot upgrade, Service Mesh migration. Structure it: what it does -> your role -> biggest impact, then pause and let them dig in.", keyPoints: ["System: corporate banking backend, payment processing","Your role + criticality (99.9% uptime)","Headline wins: Java 21 migration, Spring Boot, Service Mesh"] },
  { id: "exp-2", topic: "experience", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "You migrated Java 8 to Java 21. How did you approach it and what were the challenges?", a: "HOW TO ANSWER: Frame it as a phased, low-risk migration. Approach: audit dependencies for Java 21 compatibility, upgrade the build, fix removed/deprecated APIs, run the full regression suite, migrate module by module. Challenges: removed/changed APIs across versions, library/dependency upgrades, and heavy regression testing given payment criticality. Close with the payoff: modern language features, performance, and security. If pushed on features, mention records, sealed classes, pattern matching, var, and virtual-thread awareness.", keyPoints: ["Phased: audit -> upgrade -> fix APIs -> test -> module by module","Challenges: removed APIs, dependency upgrades, regression risk","Payoff: modern features, performance, security"] },
  { id: "exp-3", topic: "experience", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Which Java 17/21 features did you adopt, and why?", a: "HOW TO ANSWER: Talk about what genuinely helped - records for immutable DTOs/value objects, sealed classes for closed domain hierarchies, pattern matching and switch expressions for cleaner branching, var for readability, text blocks for embedded JSON/SQL. Be honest about adopted vs evaluated: interviewers respect 'we adopted records and sealed types, and we are evaluating virtual threads for our I/O-bound endpoints.'", keyPoints: ["records (DTOs), sealed (closed domains), pattern matching/switch","var, text blocks for readability","Be honest: adopted vs evaluating (e.g. virtual threads)"] },
  { id: "exp-4", topic: "experience", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "You upgraded Spring to Spring Boot. What changed and what was hard?", a: "HOW TO ANSWER: Explain the value first - auto-configuration, starters, embedded server, externalized config, and actuator mean far less boilerplate XML. What was hard: reconciling existing Spring Security, caching, and logging configuration with Boot's auto-config, overriding defaults where needed, and careful regression testing. Tie it to the outcome you delivered: improved performance and maintainability.", keyPoints: ["Boot value: auto-config, starters, embedded server, actuator","Hard parts: migrating Security/caching/logging, overriding defaults","Outcome: less boilerplate, better maintainability"] },
  { id: "exp-5", topic: "experience", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Explain the Service Mesh migration (ApaaS v3 to v4). What problem did it solve?", a: "HOW TO ANSWER: Set the context - you moved service-to-service communication onto a service mesh during the platform's v3 to v4 transition. The mesh handles cross-cutting concerns (traffic routing, load balancing, retries, mutual TLS, observability) outside application code via sidecar proxies. Explain how you ensured zero downtime: rolling/canary deployment, backward-compatible APIs, and health checks. Benefit: consistent, secure, observable inter-service communication managed centrally.", keyPoints: ["Moved inter-service comms onto a mesh (sidecars)","Mesh handles routing, retries, mTLS, observability outside app code","Zero downtime via rolling/canary + backward-compatible APIs"] },
  { id: "exp-6", topic: "experience", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "What is a service mesh and why would you use one?", a: "HOW TO ANSWER: A service mesh is an infrastructure layer that manages service-to-service communication using sidecar proxies (e.g. Envoy) deployed alongside each service. It provides traffic management (routing, retries, timeouts, circuit breaking), security (mutual TLS, authz), and observability (metrics, tracing) without changing application code. Use it when you have many services and want consistent, secure, observable communication centrally instead of reimplementing it in every service.", keyPoints: ["Sidecar proxies handle inter-service traffic","Traffic mgmt + mTLS + observability, no app-code changes","Use at scale for consistent, secure comms"] },
  { id: "exp-7", topic: "experience", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How did you ensure zero-downtime deployment?", a: "HOW TO ANSWER: Cover the standard techniques - rolling deployments that update instances gradually behind a load balancer, readiness/health probes so traffic only reaches ready instances, backward-compatible API changes so nothing breaks mid-deploy, backward-compatible DB migrations (expand then contract), and canary/blue-green where needed. Add that you monitor during rollout and can roll back quickly.", keyPoints: ["Rolling/canary/blue-green behind a load balancer","Readiness/health checks; backward-compatible APIs + DB changes","Monitor during rollout; fast rollback"] },
  { id: "exp-8", topic: "experience", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "You integrated REST Client/WebClient with SOAP services. How, and why WebClient?", a: "HOW TO ANSWER: You built RESTful APIs in Spring Boot and called external services - some REST, some legacy SOAP - using REST Client/WebClient. WebClient is the modern non-blocking, reactive HTTP client (versus the older blocking RestTemplate), which is better for concurrent external calls. For SOAP you marshalled XML payloads (JAXB) and handled the envelope. Mention resilience on those external calls: timeouts, retries, and error handling.", keyPoints: ["Spring Boot APIs calling REST + legacy SOAP","WebClient: modern non-blocking client (vs RestTemplate)","SOAP: XML/JAXB; add timeouts/retries"] },
  { id: "exp-9", topic: "experience", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "You reduced vulnerabilities by 30% using SonarQube. How did you do it?", a: "HOW TO ANSWER: Describe the process - SonarQube scanning in the CI pipeline flagged vulnerable dependencies, code smells, and security hotspots. You removed vulnerable/outdated JARs and legacy OBI code, upgraded dependencies, fixed flagged issues, and enforced quality gates so new issues block the build. The 30% is the measured drop in reported vulnerabilities. Emphasize you made it continuous, not a one-off cleanup.", keyPoints: ["SonarQube in CI flags vulnerable deps + hotspots","Removed vulnerable/legacy JARs, upgraded deps, fixed issues","Quality gates block new issues - continuous"] },
  { id: "exp-10", topic: "experience", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you maintain 99.9% uptime and handle production incidents?", a: "HOW TO ANSWER: Walk through your incident approach - monitoring and alerting (Kibana, logs) to detect fast, triage and mitigate first (rollback or hotfix), then root-cause analysis to prevent recurrence. Mention rapid turnaround, careful release management, and capturing post-incident learnings. 99.9% uptime comes from good testing, gradual rollouts, observability, and quick response. Have one concrete incident story ready in STAR form.", keyPoints: ["Detect fast (monitoring) -> mitigate -> RCA","Careful releases + observability + quick rollback","Prepare one concrete incident story (STAR)"] },
  { id: "exp-11", topic: "experience", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "Your testing strategy reached 90% coverage - is coverage enough?", a: "HOW TO ANSWER: Explain the strategy - JUnit + Mockito for unit tests with mocked dependencies, plus integration tests for critical payment flows. Then show maturity: coverage is a proxy, not the goal. 90% with meaningful assertions on business-critical paths beats 100% of trivial getters. Mention edge cases, negative tests, and that you test behaviour, not just lines executed.", keyPoints: ["JUnit + Mockito units + integration for critical flows","Coverage is a proxy - assert behaviour, not lines","Prioritise critical paths, edge/negative cases"] },
  { id: "exp-12", topic: "experience", difficulty: "medium", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Tell me about a challenging production issue you solved.", a: "HOW TO ANSWER: Use STAR. Situation: a specific payment-processing issue in production. Task: restore service and find the cause. Action: how you triaged, mitigated, and did RCA (logs/Kibana, isolating the recent change, applying the fix). Result: restored uptime, prevented recurrence, and the quantified impact. Pick one real, specific example and keep it to two minutes. This is where nerves show most - rehearse it out loud until it is automatic.", keyPoints: ["STAR: Situation -> Task -> Action -> Result","One specific real incident; quantify the result","Rehearse out loud until automatic"] },
  { id: "exp-13", topic: "experience", difficulty: "easy", freq: "Very common", companies: ["SERVICE","BANK","PRODUCT"], q: "Why are you looking to switch?", a: "HOW TO ANSWER: Keep it positive and forward-looking. Good framing: you have grown a lot at Barclays - migrations, production ownership, mentoring - and you want bigger technical challenges, broader ownership, and exposure to newer tech (cloud, microservices at scale) that the next role offers. Never bad-mouth your current employer. Tie your reason to what this specific role offers.", keyPoints: ["Positive, forward-looking (growth, bigger challenges)","Never bad-mouth your current employer","Tie it to what the new role offers"] },
  { id: "exp-14", topic: "experience", difficulty: "medium", freq: "Common", companies: ["SERVICE","BANK","PRODUCT"], q: "How do you mentor juniors and approach code reviews?", a: "HOW TO ANSWER: Show leadership without arrogance. Mentoring: pair programming, knowledge-sharing sessions, and reviewing with explanations (the why, not just the what). Code reviews: you look for correctness, readability, tests, security, and adherence to standards, and you give constructive, kind feedback. Mention that mentoring also sharpens your own understanding. A concrete example of helping a junior grow lands well.", keyPoints: ["Pairing, knowledge-sharing, review with the 'why'","Reviews: correctness, tests, security, readability, standards","Constructive/kind feedback; one concrete example"] },
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

// ---- Project Roadmap: build-from-scratch microservices project to crack interviews ----
const ROADMAP_INTRO = {
  project: "ShopFlow — an e-commerce order backend",
  tagline:
    "Build ONE project deeply instead of five shallow ones. Each phase introduces one hard concept, you make it fail on purpose and then fix it, and you walk away with a story you can defend. Phases 1–4 alone give you ~70% of the talking points — you can start interviewing after Phase 4 and finish Docker/AWS in parallel. Tick every build step AND every topic so you know you're ready in both practice and theory.",
};

const ROADMAP = [
  {
    id: "p1", num: 1, star: false,
    title: "Product Service — one service, done right",
    goal: "Build a standalone product-catalog service with clean REST design and solid JPA. This is your foundation — and where you close your database gap. Don't rush it.",
    topics: ["Spring Boot", "REST", "Spring Data JPA", "PostgreSQL", "Testing"],
    tasks: [
      { id: "p1t1", text: "Generate a Spring Boot project (Initializr: Web, JPA, PostgreSQL, Validation, Lombok). Run a hello endpoint." },
      { id: "p1t2", text: "Model a Product entity + ProductRepository; connect to a local Postgres (run it in Docker)." },
      { id: "p1t3", text: "Build full CRUD with layering: controller -> service -> repository, using DTOs (never expose entities)." },
      { id: "p1t4", text: "Add Bean Validation and a global @ControllerAdvice returning clean, consistent error responses." },
      { id: "p1t5", text: "Add a Category related to Product. Trigger the N+1 problem, see it in SQL logs, fix with JOIN FETCH / @EntityGraph." },
      { id: "p1t6", text: "Add pagination + sorting, one custom JPQL query, and one native query." },
      { id: "p1t7", text: "Add Flyway migrations and a DB index on a frequently-searched column." },
      { id: "p1t8", text: "Write unit tests (JUnit + Mockito) and one integration test using Testcontainers (a real Postgres)." },
    ],
    coverage: [
      { t: "REST API design: resources, verbs, status codes", kind: "build" },
      { t: "Exception handling in Spring Boot (@ControllerAdvice, @ExceptionHandler)", kind: "build" },
      { t: "Bean validation (@Valid, custom validators)", kind: "build" },
      { t: "Spring Data JPA, repositories, derived queries", kind: "build" },
      { t: "Entity relationships; lazy vs eager fetching", kind: "build" },
      { t: "N+1 problem and how to fix it", kind: "build" },
      { t: "Flyway migrations & DB indexing", kind: "build" },
      { t: "Testing: JUnit, Mockito, Testcontainers", kind: "build" },
      { t: "@Transactional: propagation & isolation levels", kind: "theory" },
      { t: "ACID & DB isolation (dirty / non-repeatable / phantom reads)", kind: "theory" },
      { t: "Optimistic vs pessimistic locking", kind: "theory" },
      { t: "Connection pooling (HikariCP), query optimization", kind: "theory" },
      { t: "REST maturity: idempotency, statelessness, versioning", kind: "theory" },
    ],
    interview: [
      "Explain layered architecture and why you map entities to DTOs.",
      "The N+1 problem — what causes it and how you fixed it.",
      "Lazy vs eager loading; @Transactional propagation & isolation.",
      "ACID, isolation levels, and optimistic vs pessimistic locking.",
    ],
  },
  {
    id: "p2", num: 2, star: false,
    title: "Second service + synchronous calls + resilience",
    goal: "Create an Order service that calls the Product service over HTTP — then make that call survive failure. Your first taste of real microservice pain.",
    topics: ["Microservices", "OpenFeign", "Resilience4j"],
    tasks: [
      { id: "p2t1", text: "Scaffold a second Spring Boot service (Order) with its own database." },
      { id: "p2t2", text: "Place-order endpoint that calls the Product service (check stock/price) using OpenFeign / RestClient." },
      { id: "p2t3", text: "Define request/response DTOs as the explicit contract between services." },
      { id: "p2t4", text: "Stop the Product service and watch the Order call fail — observe the cascade." },
      { id: "p2t5", text: "Add Resilience4j: circuit breaker + retry + timeout + a fallback method." },
      { id: "p2t6", text: "Verify: kill Product, see the circuit open and your fallback respond instead of hanging." },
    ],
    coverage: [
      { t: "Synchronous inter-service calls (Feign / RestClient)", kind: "build" },
      { t: "Service contracts (request/response DTOs)", kind: "build" },
      { t: "Circuit breaker pattern + states", kind: "build" },
      { t: "Retry, timeout, fallback", kind: "build" },
      { t: "Microservices vs monolith — trade-offs", kind: "theory" },
      { t: "Service decomposition & bounded context", kind: "theory" },
      { t: "Sync vs async communication — when to use which", kind: "theory" },
      { t: "Bulkhead, rate limiting, API versioning", kind: "theory" },
    ],
    interview: [
      "How services communicate synchronously and the cascading-failure risk.",
      "Circuit breaker states: closed -> open -> half-open.",
      "Retry vs timeout vs fallback; bulkhead isolation.",
      "Microservices vs monolith and how you'd split a domain.",
    ],
  },
  {
    id: "p3", num: 3, star: false,
    title: "Service discovery, API gateway & central config",
    goal: "Stop hardcoding service URLs and put a single front door on your system — the standard microservices plumbing interviewers expect.",
    topics: ["Eureka", "Spring Cloud Gateway", "Config"],
    tasks: [
      { id: "p3t1", text: "Add a Eureka server; register Product + Order; call services by name, not host:port." },
      { id: "p3t2", text: "Add Spring Cloud Gateway as the entry point; route /products/** and /orders/**." },
      { id: "p3t3", text: "Add one gateway filter (request logging or a correlation-id header)." },
      { id: "p3t4", text: "Externalize configuration (Spring Cloud Config or profiles) read centrally." },
    ],
    coverage: [
      { t: "Service discovery (Eureka) & registration", kind: "build" },
      { t: "API gateway: routing & cross-cutting concerns", kind: "build" },
      { t: "Gateway filters (auth, logging, correlation id)", kind: "build" },
      { t: "Centralized configuration", kind: "build" },
      { t: "Client-side vs server-side load balancing", kind: "theory" },
      { t: "Managing secrets & config per environment", kind: "theory" },
    ],
    interview: [
      "Why service discovery instead of hardcoded URLs.",
      "What an API gateway does and where cross-cutting concerns live.",
      "Client-side vs server-side load balancing.",
      "How config & secrets are managed across environments.",
    ],
  },
  {
    id: "p4", num: 4, star: true,
    title: "Async messaging + the distributed-transaction story",
    goal: "Decouple services with events and learn to keep data consistent WITHOUT a distributed transaction. The single biggest mid -> senior differentiator — invest the most time here.",
    topics: ["Kafka / RabbitMQ", "Saga", "Eventual consistency"],
    tasks: [
      { id: "p4t1", text: "Add a message broker (Kafka or RabbitMQ) via Docker." },
      { id: "p4t2", text: "On order placed, PUBLISH an OrderPlaced event instead of calling downstream synchronously." },
      { id: "p4t3", text: "Add a Notification service that consumes OrderPlaced and 'sends' a confirmation (log it)." },
      { id: "p4t4", text: "Have the Product service consume the event and reserve/decrement stock." },
      { id: "p4t5", text: "Make the consumer idempotent — handle duplicate deliveries (dedupe by event id)." },
      { id: "p4t6", text: "Implement a basic Saga (choreography): on stock failure, publish a compensating cancel event." },
      { id: "p4t7", text: "Stretch: add the outbox pattern so the DB write and event publish can't drift." },
    ],
    coverage: [
      { t: "Event-driven architecture & messaging basics", kind: "build" },
      { t: "Kafka/RabbitMQ: topics, partitions, consumer groups", kind: "build" },
      { t: "Saga pattern (choreography)", kind: "build" },
      { t: "Idempotent consumers (duplicate handling)", kind: "build" },
      { t: "Outbox pattern", kind: "build" },
      { t: "Distributed transactions: why 2PC is avoided", kind: "theory" },
      { t: "Eventual consistency & CAP theorem", kind: "theory" },
      { t: "Delivery semantics: at-least-once vs exactly-once", kind: "theory" },
      { t: "Dead-letter queues, retries, message ordering", kind: "theory" },
      { t: "Choreography vs orchestration", kind: "theory" },
    ],
    interview: [
      "\"How do you handle a transaction across services?\" -> Saga, not 2PC.",
      "Eventual consistency, CAP, and the trade-off vs strong consistency.",
      "Idempotent consumers and at-least-once delivery.",
      "Outbox pattern; choreography vs orchestration.",
    ],
  },
  {
    id: "p5", num: 5, star: false,
    title: "Security — stateless auth across services",
    goal: "Secure the system with JWT so the gateway and services trust requests without server-side sessions.",
    topics: ["Spring Security", "JWT"],
    tasks: [
      { id: "p5t1", text: "Add an auth endpoint that issues a JWT on login." },
      { id: "p5t2", text: "Validate the JWT at the gateway (or per service); reject unauthenticated requests." },
      { id: "p5t3", text: "Add role-based access (e.g. only ADMIN can create products)." },
      { id: "p5t4", text: "Propagate the authenticated user's identity to downstream services." },
    ],
    coverage: [
      { t: "JWT structure & verification", kind: "build" },
      { t: "Role-based access control", kind: "build" },
      { t: "Securing inter-service calls / identity propagation", kind: "build" },
      { t: "Spring Security filter chain", kind: "theory" },
      { t: "Stateless (token) vs session auth", kind: "theory" },
      { t: "Authentication vs authorization", kind: "theory" },
      { t: "OAuth2 / OpenID Connect & refresh tokens (overview)", kind: "theory" },
    ],
    interview: [
      "Why stateless token auth fits microservices.",
      "Where you validate tokens (gateway vs service) and trade-offs.",
      "JWT structure and how it's verified; authn vs authz.",
      "OAuth2 / OIDC at a high level.",
    ],
  },
  {
    id: "p6", num: 6, star: false,
    title: "Dockerize the whole stack",
    goal: "Package every service as a container and bring the entire system up with ONE command. This is where Docker finally clicks — by doing it, not reading about it.",
    topics: ["Docker", "docker-compose"],
    tasks: [
      { id: "p6t1", text: "Write a multi-stage Dockerfile for each service (build stage + slim JRE runtime)." },
      { id: "p6t2", text: "Build and run a single service as a container; inspect its image layers." },
      { id: "p6t3", text: "Write a docker-compose.yml that starts all services + Postgres + broker + Eureka." },
      { id: "p6t4", text: "Wire networking (by service name), env vars, a DB volume, and healthchecks." },
      { id: "p6t5", text: "Bring the whole stack up with a single `docker compose up`." },
    ],
    coverage: [
      { t: "Dockerfile & multi-stage builds", kind: "build" },
      { t: "Layer caching", kind: "build" },
      { t: "docker-compose orchestration", kind: "build" },
      { t: "Container networking, volumes, env vars", kind: "build" },
      { t: "Healthchecks", kind: "build" },
      { t: "Image vs container; Docker vs VM", kind: "theory" },
      { t: "Image size & security best practices", kind: "theory" },
    ],
    interview: [
      "Image vs container; what multi-stage builds buy you.",
      "Layer caching and how it speeds rebuilds.",
      "How docker-compose wires a multi-service stack & networking.",
      "Container vs VM.",
    ],
  },
  {
    id: "p7", num: 7, star: false,
    title: "Deploy to AWS — literacy, not DevOps depth",
    goal: "Get ONE real cloud deployment working end-to-end, enough to speak to it confidently. For a backend role they want cloud literacy, not a DevOps career. Use the free tier, then stop.",
    topics: ["AWS", "ECS / ECR", "RDS"],
    tasks: [
      { id: "p7t1", text: "Push your service images to ECR." },
      { id: "p7t2", text: "Provision a Postgres on RDS and point a service at it." },
      { id: "p7t3", text: "Deploy containers to ECS Fargate (or run docker-compose on one EC2 box to start)." },
      { id: "p7t4", text: "Put an Application Load Balancer in front; open the right security-group ports." },
      { id: "p7t5", text: "Understand IAM roles & a VPC at a basic level; store one asset in S3." },
      { id: "p7t6", text: "Get one deploy working — then stop and return to interview prep." },
    ],
    coverage: [
      { t: "Core services: EC2, ECS, ECR, RDS, S3", kind: "build" },
      { t: "Load balancer (ALB) + target groups", kind: "build" },
      { t: "VPC, subnets, security groups", kind: "theory" },
      { t: "IAM roles & least privilege", kind: "theory" },
      { t: "Managed (RDS) vs self-hosted DB", kind: "theory" },
      { t: "Scaling & high availability (overview)", kind: "theory" },
    ],
    interview: [
      "\"Deployed to AWS using ECR / ECS / RDS behind an ALB.\"",
      "Basic networking: VPC, subnets, security groups.",
      "IAM roles and least privilege.",
      "Managed DB vs self-hosted and scaling basics.",
    ],
  },
  {
    id: "p8", num: 8, star: false,
    title: "Package it into offers",
    goal: "Convert the build into stories and a defensible architecture. This phase is what actually turns the project into interview wins.",
    topics: ["Storytelling", "Observability"],
    tasks: [
      { id: "p8t1", text: "Draw the full architecture diagram from memory; explain every single arrow." },
      { id: "p8t2", text: "For each phase write 3 lines: what you built, the hardest problem, the trade-off." },
      { id: "p8t3", text: "Add observability: centralized logging + /actuator health & metrics. Stretch: tracing (Micrometer + Zipkin)." },
      { id: "p8t4", text: "Prepare your \"tell me about a challenging project\" answer around a real failure you fixed." },
      { id: "p8t5", text: "Push to GitHub with a clear README + architecture diagram." },
    ],
    coverage: [
      { t: "Architecture diagramming & explaining trade-offs", kind: "build" },
      { t: "Observability: logging, metrics, health", kind: "build" },
      { t: "Distributed tracing (correlation id, Zipkin)", kind: "build" },
      { t: "Debugging a production issue (your approach)", kind: "theory" },
      { t: "STAR-style behavioral storytelling", kind: "theory" },
    ],
    interview: [
      "The behavioral / architecture round and the \"challenging project\" story.",
      "Whiteboarding the whole system and justifying each decision.",
      "How you'd observe and debug a production issue.",
    ],
  },
];


// ============================================================
//  Core Java Prep — single-file dashboard
// ============================================================

const ICONS = { Boxes, Hash, Layers, Cpu, Shield, Zap, Sparkles, Code2, Database, Terminal, Leaf, Globe, Network, Server, Building2 };
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
/* project roadmap */
.rmap{max-width:820px;margin:0 auto}
.rm-intro{background:linear-gradient(150deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin-top:4px}
.rm-intro h2{font-size:15px;font-weight:700;letter-spacing:-.2px}
.rm-intro p{font-size:13px;color:var(--dim);line-height:1.65;margin-top:7px}
.rm-prog{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px 18px;margin:14px 0 22px;display:flex;align-items:center;gap:18px}
.rm-prog .rring{position:relative;width:64px;height:64px;flex:none}
.rm-prog .rinfo{flex:1;min-width:0}
.rm-prog .rtitle{font-weight:700;font-size:14.5px}
.rm-prog .rsub{font-size:12.3px;color:var(--dim);margin-top:2px}
.rm-prog .rbar{height:7px;border-radius:5px;background:var(--line);margin-top:10px;overflow:hidden}
.rm-prog .rbar i{display:block;height:100%;background:linear-gradient(90deg,var(--amber),var(--amber2));border-radius:5px;transition:width .5s}
.timeline{position:relative;display:flex;flex-direction:column}
.phase{position:relative;display:flex;gap:15px}
.phase .node{flex:none;display:flex;flex-direction:column;align-items:center;width:38px}
.phase .node .num{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:14px;background:var(--panel2);border:2px solid var(--line);color:var(--dim);z-index:1;transition:.2s}
.phase.done .node .num{background:var(--emerald);border-color:var(--emerald);color:#06281d}
.phase .node .line{flex:1;width:2px;background:var(--line);margin:3px 0;min-height:14px}
.phase:last-child .node .line{display:none}
.phase .pcard{flex:1;min-width:0;background:var(--panel);border:1px solid var(--line-soft);border-radius:14px;margin-bottom:14px;transition:.16s;overflow:hidden}
.phase .pcard:hover{border-color:var(--line)}
.phase.done .pcard{border-color:rgba(47,211,160,.3)}
.phead{padding:15px 17px;cursor:pointer;display:flex;gap:13px;align-items:flex-start}
.phead .pmain{flex:1;min-width:0}
.phead .ptitle{font-weight:700;font-size:14.5px;letter-spacing:-.2px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.phead .pgoal{font-size:12.6px;color:var(--dim);line-height:1.55;margin-top:6px}
.phead .ptopics{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.tchip{font-size:10px;font-weight:600;padding:3px 8px;border-radius:6px;background:var(--indigo-bg);color:var(--indigo)}
.pmeta{flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:7px;min-width:74px}
.pmeta .pfrac{font-family:var(--mono);font-size:11px;color:var(--dim)}
.pmeta .pbar{width:74px;height:5px;border-radius:4px;background:var(--line);overflow:hidden}
.pmeta .pbar i{display:block;height:100%;background:linear-gradient(90deg,var(--amber),var(--amber2));transition:width .4s}
.star-badge{font-size:9px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--amber2);background:var(--amber-bg);border:1px solid rgba(242,169,59,.4);padding:2px 7px;border-radius:5px;display:inline-flex;align-items:center;gap:4px}
.pbody{padding:0 17px 16px 17px;animation:slide .25s}
.steph{font-family:var(--mono);font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--faint);margin:4px 0 8px;display:flex;align-items:center;gap:6px}
.task{display:flex;gap:11px;padding:9px 10px;border-radius:9px;cursor:pointer;transition:.13s;align-items:flex-start}
.task:hover{background:var(--bg2)}
.task .box{width:20px;height:20px;border-radius:6px;border:2px solid var(--line);flex:none;display:grid;place-items:center;margin-top:1px;transition:.14s;background:var(--bg2);color:#06281d}
.task.done .box{background:var(--emerald);border-color:var(--emerald)}
.task .ttext{font-size:12.9px;line-height:1.55;color:var(--ink)}
.task.done .ttext{color:var(--faint);text-decoration:line-through}
.payoff{margin-top:14px;background:var(--bg2);border:1px solid var(--line-soft);border-radius:10px;padding:12px 14px}
.payoff .ph2{font-family:var(--mono);font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--amber);margin-bottom:8px;display:flex;align-items:center;gap:6px}
.payoff ul{list-style:none;display:flex;flex-direction:column;gap:6px}
.payoff li{font-size:12.4px;color:var(--dim);line-height:1.5;display:flex;gap:8px}
.payoff li::before{content:"▹";color:var(--amber);flex:none}

.kindb{font-size:8.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:2px 6px;border-radius:5px;margin-left:8px;white-space:nowrap}
.kindb.build{color:var(--emerald);background:var(--emerald-bg)}
.kindb.theory{color:var(--indigo);background:var(--indigo-bg)}
/* workbench (write-from-memory practice) */
.wb-top{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:14px;margin:6px 0 10px}
.wb-stats{display:flex;gap:20px}
.wb-stat{text-align:right}
.wb-stat .n{font-family:var(--mono);font-size:19px;font-weight:800;line-height:1}
.wb-stat .l{font-size:10px;color:var(--faint);text-transform:uppercase;letter-spacing:.6px;margin-top:3px}
.wb-stat.solved .n{color:var(--emerald)}
.wb-stat.review .n{color:var(--rose)}
.wb-bar{height:6px;border-radius:99px;background:var(--line);overflow:hidden;margin-bottom:16px}
.wb-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--amber),var(--amber2));transition:width .35s}
.wb-grid{display:grid;grid-template-columns:300px 1fr;gap:16px;align-items:start}
@media(max-width:880px){.wb-grid{grid-template-columns:1fr}}
.wb-list{background:var(--panel);border:1px solid var(--line);border-radius:13px;overflow:hidden;max-height:72vh;overflow-y:auto}
@media(max-width:880px){.wb-list{max-height:340px}}
.wb-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--line-soft);cursor:pointer;transition:.12s}
.wb-row:last-child{border-bottom:none}
.wb-row:hover{background:var(--panel2)}
.wb-row.active{background:var(--panel2);box-shadow:inset 3px 0 0 var(--amber)}
.wb-num{font-family:var(--mono);font-size:11px;color:var(--faint);width:22px;flex:none}
.wb-name{font-size:12.5px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wb-dot{width:8px;height:8px;border-radius:99px;flex:none;background:var(--line)}
.wb-dot.progress{background:var(--amber)}
.wb-dot.solved{background:var(--emerald)}
.wb-dot.review{background:var(--rose)}
.wb-work{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:20px;min-height:72vh}
.wb-wtop{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
.wb-meta{display:flex;gap:7px;align-items:center;flex-wrap:wrap}
.wb-timer{display:flex;align-items:center;gap:8px;flex:none}
.wb-clock{font-family:var(--mono);font-size:15px;font-weight:700;min-width:52px}
.wb-clock.run{color:var(--amber)}
.tbtn{font-size:11.5px;font-weight:600;padding:5px 11px;border-radius:8px;border:1px solid var(--line);color:var(--dim);background:var(--bg2);transition:.15s}
.tbtn:hover{color:var(--ink);border-color:var(--dim)}
.wb-title{font-size:16px;font-weight:700;letter-spacing:-.2px;margin:13px 0 4px;line-height:1.45}
.wb-lbl{font-family:var(--mono);font-size:10px;letter-spacing:.8px;text-transform:uppercase;color:var(--faint);margin:16px 0 6px;display:flex;align-items:center;justify-content:space-between}
.saved-tag{font-size:11px;color:var(--emerald);opacity:0;transition:opacity .3s;text-transform:none;letter-spacing:0;font-family:var(--sans)}
.saved-tag.show{opacity:1}
.wb-editor{width:100%;min-height:210px;resize:vertical;font-family:var(--mono);font-size:13px;line-height:1.65;background:#06090E;color:#dbe0ee;border:1px solid var(--line);border-radius:10px;padding:14px;outline:none;tab-size:2;white-space:pre;overflow:auto;transition:border-color .15s}
.cjp.light .wb-editor{background:#0E1117}
.wb-editor:focus{border-color:var(--amber)}
.wb-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.wb-btn{font-size:12.5px;font-weight:600;padding:8px 15px;border-radius:9px;border:1px solid var(--line);background:var(--bg2);color:var(--dim);transition:.15s;display:inline-flex;align-items:center;gap:7px}
.wb-btn:hover{color:var(--ink);border-color:var(--dim)}
.wb-btn.primary{background:linear-gradient(140deg,var(--amber),#D98A24);color:#1a1205;border-color:transparent}
.wb-btn.primary:hover{filter:brightness(1.05)}
.wb-btn.sv.on{background:var(--emerald-bg);color:var(--emerald);border-color:rgba(47,211,160,.4)}
.wb-btn.rv.on{background:var(--rose-bg);color:var(--rose);border-color:rgba(255,107,138,.4)}
.wb-sol{margin-top:18px;border-top:1px dashed var(--line);padding-top:14px}
.wb-soltoggle{font-size:12.5px;font-weight:600;color:var(--dim);cursor:pointer;display:inline-flex;align-items:center;gap:8px;user-select:none}
.wb-soltoggle:hover{color:var(--ink)}
.wb-notes{width:100%;margin-top:16px;min-height:58px;resize:vertical;font-family:var(--sans);font-size:13px;background:var(--bg2);color:var(--ink);border:1px solid var(--line-soft);border-radius:9px;padding:10px 12px;outline:none;transition:.15s}
.wb-notes:focus{border-color:var(--amber)}
/* mock interview */
.mi{max-width:820px;margin:0 auto}
.mi-hero{background:linear-gradient(150deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:16px;padding:22px 24px}
.mi-hero h1{font-size:22px;font-weight:800;letter-spacing:-.5px}
.mi-hero p{color:var(--dim);font-size:13.5px;margin-top:8px;line-height:1.6}
.mi-tips{margin-top:14px;display:flex;flex-direction:column;gap:8px}
.mi-tip{display:flex;gap:9px;font-size:12.8px;color:var(--dim);line-height:1.5}
.mi-tip svg{flex:none;margin-top:2px;color:var(--amber)}
.mi-sec{font-family:var(--mono);font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:var(--faint);margin:22px 0 10px}
.mi-areas{display:flex;flex-wrap:wrap;gap:8px}
.mi-area{padding:8px 13px;border-radius:9px;font-size:12.5px;font-weight:600;border:1px solid var(--line-soft);background:var(--panel);color:var(--dim);transition:.14s;display:inline-flex;align-items:center;gap:7px}
.mi-area:hover{border-color:var(--line);color:var(--ink)}
.mi-area.on{background:var(--amber-bg);border-color:rgba(242,169,59,.4);color:var(--amber2)}
.mi-area .ct{font-family:var(--mono);font-size:10px;opacity:.7}
.mi-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:8px}
.mi-toggle{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;color:var(--dim);cursor:pointer;user-select:none}
.mi-start{margin-top:22px;width:100%;padding:15px;border-radius:13px;font-weight:800;font-size:15px;background:linear-gradient(140deg,var(--amber),#D98A24);color:#1a1205;display:flex;align-items:center;justify-content:center;gap:10px;transition:.15s;box-shadow:0 8px 22px -10px rgba(242,169,59,.6)}
.mi-start:hover{filter:brightness(1.05)}
.mi-start:disabled{opacity:.5;box-shadow:none;cursor:default}
.mi-bar{height:6px;border-radius:99px;background:var(--line);overflow:hidden;margin:2px 0 16px}
.mi-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--amber),var(--amber2));transition:width .4s}
.mi-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.mi-qn{font-family:var(--mono);font-size:11.5px;color:var(--faint)}
.mi-clock{font-family:var(--mono);font-size:12px;color:var(--dim)}
.mi-card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:26px;box-shadow:0 24px 60px -34px rgba(0,0,0,.6)}
.mi-who{display:flex;align-items:center;gap:11px;margin-bottom:16px}
.mi-av{width:40px;height:40px;border-radius:11px;background:var(--indigo-bg);color:var(--indigo);display:grid;place-items:center;flex:none}
.mi-who b{font-size:13px;display:block}
.mi-who span{font-size:11.5px;color:var(--faint)}
.mi-badges{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px}
.mi-q{font-size:19px;font-weight:700;letter-spacing:-.3px;line-height:1.45}
.mi-prompt{margin-top:18px;background:var(--bg2);border:1px dashed var(--line);border-radius:11px;padding:13px 15px;font-size:12.6px;color:var(--faint);display:flex;gap:10px;align-items:flex-start;line-height:1.5}
.mi-prompt svg{flex:none;margin-top:1px;color:var(--amber)}
.mi-revealbtn{margin-top:18px;width:100%;padding:13px;border-radius:12px;background:var(--indigo-bg);border:1px solid rgba(136,150,255,.4);color:var(--indigo);font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;gap:9px;transition:.15s}
.mi-revealbtn:hover{background:rgba(136,150,255,.2)}
.mi-ans{margin-top:16px;animation:slide .3s}
.mi-ans .al{font-family:var(--mono);font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--emerald);margin-bottom:8px;display:flex;align-items:center;gap:6px}
.mi-ans .atext{font-size:13.6px;line-height:1.7;color:var(--ink);opacity:.94}
.mi-rate{margin-top:22px}
.mi-rate .rl{font-size:12.5px;color:var(--dim);text-align:center;margin-bottom:11px}
.mi-rbtns{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.mi-rbtn{padding:13px 10px;border-radius:12px;font-weight:700;font-size:13px;border:1px solid;display:flex;flex-direction:column;align-items:center;gap:5px;transition:.15s;cursor:pointer}
.mi-rbtn small{font-weight:500;font-size:10px;opacity:.85}
.mi-rbtn.bad{background:var(--rose-bg);border-color:rgba(255,107,138,.4);color:var(--rose)}
.mi-rbtn.mid{background:var(--amber-bg);border-color:rgba(242,169,59,.4);color:var(--amber2)}
.mi-rbtn.good{background:var(--emerald-bg);border-color:rgba(47,211,160,.4);color:var(--emerald)}
.mi-rbtn:hover{filter:brightness(1.08)}
.mi-quit{margin-top:16px;text-align:center}
.mi-quit button{font-size:12px;color:var(--faint);cursor:pointer}
.mi-quit button:hover{color:var(--dim)}
.mi-score{text-align:center;padding:10px 0 4px}
.mi-score .big{font-size:52px;font-weight:800;letter-spacing:-2px;line-height:1}
.mi-score .lbl{font-size:13px;color:var(--dim);margin-top:6px}
.mi-msg{text-align:center;color:var(--dim);font-size:14px;line-height:1.6;max-width:540px;margin:10px auto 0}
.mi-stats3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0 6px}
.mi-st{background:var(--panel);border:1px solid var(--line-soft);border-radius:12px;padding:14px;text-align:center}
.mi-st .v{font-size:20px;font-weight:800}
.mi-st .l{font-size:11px;color:var(--dim);margin-top:2px}
.mi-break{display:flex;flex-direction:column;gap:9px}
.mi-brow{display:flex;align-items:center;gap:12px}
.mi-brow .bn{font-size:12.6px;width:150px;flex:none;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mi-brow .bb{flex:1;height:8px;border-radius:5px;background:var(--line);overflow:hidden}
.mi-brow .bb i{display:block;height:100%;border-radius:5px}
.mi-brow .bp{font-family:var(--mono);font-size:11px;color:var(--faint);width:44px;text-align:right;flex:none}
.mi-actions{display:flex;gap:10px;margin-top:22px;flex-wrap:wrap}
.mi-actions button{flex:1;min-width:150px;padding:13px;border-radius:12px;font-weight:700;font-size:13.5px;display:flex;align-items:center;justify-content:center;gap:8px;transition:.15s;cursor:pointer}
.mi-again{background:linear-gradient(140deg,var(--amber),#D98A24);color:#1a1205;border:none}
.mi-again:hover{filter:brightness(1.05)}
.mi-review{background:var(--panel);border:1px solid var(--line);color:var(--dim)}
.mi-review:hover{color:var(--ink);border-color:var(--dim)}
.mi-revq{margin-top:8px;border:1px solid var(--line-soft);border-radius:11px;overflow:hidden}
.mi-revq details{border-bottom:1px solid var(--line-soft)}
.mi-revq details:last-child{border-bottom:none}
.mi-revq summary{padding:12px 14px;cursor:pointer;font-size:12.8px;font-weight:600;list-style:none;display:flex;gap:8px;align-items:flex-start}
.mi-revq summary::-webkit-details-marker{display:none}
.mi-revq .rc{padding:0 14px 14px 14px;font-size:12.8px;color:var(--dim);line-height:1.65}
.mi-hist{display:flex;flex-direction:column;gap:7px}
.mi-hrow{display:flex;align-items:center;gap:12px;background:var(--panel);border:1px solid var(--line-soft);border-radius:10px;padding:9px 13px}
.mi-hrow .hd{font-size:12px;color:var(--dim);flex:1}
.mi-hrow .hbar{width:90px;height:6px;border-radius:5px;background:var(--line);overflow:hidden}
.mi-hrow .hbar i{display:block;height:100%;border-radius:5px}
.mi-hrow .hs{font-family:var(--mono);font-size:13px;font-weight:700;width:40px;text-align:right}
.mi-voicebar{display:flex;gap:10px;align-items:center;margin-top:16px;flex-wrap:wrap}
.mi-vbtn{font-size:12px;font-weight:600;padding:6px 12px;border-radius:8px;border:1px solid var(--line);color:var(--dim);background:var(--bg2);display:inline-flex;align-items:center;gap:7px;transition:.15s;cursor:pointer}
.mi-vbtn:hover{color:var(--ink);border-color:var(--dim)}
.mi-mic{margin-top:14px;width:100%;padding:15px;border-radius:12px;border:1px solid rgba(242,169,59,.45);background:var(--amber-bg);color:var(--amber2);font-weight:700;font-size:14.5px;display:flex;align-items:center;justify-content:center;gap:10px;transition:.15s;cursor:pointer}
.mi-mic:hover{background:rgba(242,169,59,.2)}
.mi-mic.live{background:var(--rose-bg);border-color:rgba(255,107,138,.5);color:var(--rose);animation:mipulse 1.3s ease-in-out infinite}
@keyframes mipulse{0%,100%{box-shadow:0 0 0 0 rgba(255,107,138,.4)}50%{box-shadow:0 0 0 9px rgba(255,107,138,0)}}
.mi-transcript{width:100%;margin-top:12px;min-height:92px;resize:vertical;font-family:var(--sans);font-size:13.5px;line-height:1.6;background:var(--bg2);color:var(--ink);border:1px solid var(--line-soft);border-radius:11px;padding:12px 14px;outline:none;transition:.15s}
.mi-transcript:focus{border-color:var(--amber)}
.mi-your{margin-top:2px;margin-bottom:16px;background:var(--indigo-bg);border:1px solid rgba(136,150,255,.25);border-radius:11px;padding:13px 15px}
.mi-your .al{font-family:var(--mono);font-size:10px;letter-spacing:1px;text-transform:uppercase;margin-bottom:7px;display:flex;align-items:center;gap:6px}
.mi-your .atext{font-size:13.4px;line-height:1.65}
.mi-micnote{margin-top:12px;font-size:11.5px;color:var(--faint);line-height:1.5}
.mi-micerr{margin-top:10px;font-size:12px;color:var(--rose);display:flex;gap:7px;align-items:flex-start;line-height:1.5}
.mi-micerr svg{flex:none;margin-top:1px}
.mi-eval{margin:14px 0 4px;background:var(--bg2);border:1px solid var(--line-soft);border-radius:11px;padding:12px 15px;display:flex;align-items:center;gap:13px}
.mi-evpct{font-family:var(--mono);font-size:22px;font-weight:800;flex:none}
.mi-evtxt{font-size:12.8px;color:var(--dim);line-height:1.4}
.mi-kplist{margin-top:12px;background:var(--bg2);border:1px solid var(--line-soft);border-radius:10px;padding:12px 14px}
.mi-kplist .kh{font-family:var(--mono);font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--amber);margin-bottom:9px;display:flex;align-items:center;gap:6px}
.mi-kplist ul{list-style:none;display:flex;flex-direction:column;gap:8px}
.mi-kplist li{font-size:12.6px;line-height:1.5;display:flex;gap:9px;align-items:flex-start}
.mi-kplist li svg{flex:none;margin-top:2px}
.mi-kplist li.miss{color:var(--faint)}
.mi-kplist li.hit{color:var(--ink)}
.mi-aibtn{margin-top:14px;width:100%;padding:11px;border-radius:10px;border:1px dashed rgba(136,150,255,.5);background:var(--indigo-bg);color:var(--indigo);font-weight:600;font-size:12.8px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:.15s}
.mi-aibtn:hover{background:rgba(136,150,255,.2)}
.mi-aibtn:disabled{opacity:.6;cursor:default}
.mi-aibox{margin-top:12px;background:var(--panel2);border:1px solid var(--line);border-radius:11px;padding:13px 15px}
.mi-aibox .as{font-weight:800;font-size:15px}
.mi-aibox .af{font-size:12.8px;color:var(--dim);line-height:1.65;margin-top:6px}
.mi-rbtn.sugg{outline:2px solid currentColor;outline-offset:2px}
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

function Roadmap({ done, setDone }) {
  const [open, setOpen] = useState({ p1: true });
  const toggleTask = (id) =>
    setDone((d) => { const n = { ...d }; if (n[id]) delete n[id]; else n[id] = true; return n; });
  const toggleOpen = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  const covId = (p, i) => `${p.id}-c${i}`;
  const itemsOf = (p) => p.tasks.length + (p.coverage ? p.coverage.length : 0);
  const doneOf = (p) =>
    p.tasks.filter((t) => done[t.id]).length +
    (p.coverage ? p.coverage.filter((c, i) => done[covId(p, i)]).length : 0);

  const totalItems = ROADMAP.reduce((s, p) => s + itemsOf(p), 0);
  const doneItems = ROADMAP.reduce((s, p) => s + doneOf(p), 0);
  const overall = totalItems ? doneItems / totalItems : 0;
  const phasesDone = ROADMAP.filter((p) => itemsOf(p) > 0 && doneOf(p) === itemsOf(p)).length;

  return (
    <div className="rmap">
      <div className="page-h">
        <h1>Project roadmap</h1>
        <p>{ROADMAP_INTRO.project} — build it from scratch, and each phase becomes an interview answer.</p>
      </div>

      <div className="rm-intro">
        <h2>Why one project, built deeply</h2>
        <p>{ROADMAP_INTRO.tagline}</p>
      </div>

      <div className="rm-prog">
        <div className="rring">
          <Ring pct={overall} size={64} stroke={7} />
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14 }}>
            {Math.round(overall * 100)}%
          </div>
        </div>
        <div className="rinfo">
          <div className="rtitle">{phasesDone} / {ROADMAP.length} phases complete</div>
          <div className="rsub">{doneItems} of {totalItems} build steps & topics checked — tick each as you cover it in practice or theory.</div>
          <div className="rbar"><i style={{ width: `${overall * 100}%` }} /></div>
        </div>
      </div>

      <div className="timeline">
        {ROADMAP.map((p) => {
          const total = itemsOf(p);
          const dc = doneOf(p);
          const isDone = dc === total;
          const pct = total ? dc / total : 0;
          const isOpen = !!open[p.id];
          return (
            <div className={`phase ${isDone ? "done" : ""}`} key={p.id}>
              <div className="node">
                <div className="num">{isDone ? <Check size={16} strokeWidth={3} /> : p.num}</div>
                <div className="line" />
              </div>
              <div className="pcard">
                <div className="phead" onClick={() => toggleOpen(p.id)}>
                  <div className="pmain">
                    <div className="ptitle">
                      {p.title}
                      {p.star && <span className="star-badge"><Star size={10} /> Senior differentiator</span>}
                    </div>
                    <div className="pgoal">{p.goal}</div>
                    <div className="ptopics">
                      {p.topics.map((t) => <span className="tchip" key={t}>{t}</span>)}
                    </div>
                  </div>
                  <div className="pmeta">
                    <ChevronRight size={17} style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s", color: "var(--faint)" }} />
                    <div className="pfrac">{dc}/{total}</div>
                    <div className="pbar"><i style={{ width: `${pct * 100}%` }} /></div>
                  </div>
                </div>
                {isOpen && (
                  <div className="pbody">
                    <div className="steph"><ListChecks size={12} /> Build steps (hands-on)</div>
                    {p.tasks.map((t) => (
                      <div className={`task ${done[t.id] ? "done" : ""}`} key={t.id} onClick={() => toggleTask(t.id)}>
                        <span className="box">{done[t.id] && <Check size={12} strokeWidth={3} />}</span>
                        <span className="ttext">{t.text}</span>
                      </div>
                    ))}

                    {p.coverage && (
                      <>
                        <div className="steph" style={{ marginTop: 16 }}><BookOpen size={12} /> Topics to be ready on — theory + practical</div>
                        {p.coverage.map((c, i) => {
                          const cid = covId(p, i);
                          return (
                            <div className={`task ${done[cid] ? "done" : ""}`} key={cid} onClick={() => toggleTask(cid)}>
                              <span className="box">{done[cid] && <Check size={12} strokeWidth={3} />}</span>
                              <span className="ttext">{c.t}<span className={`kindb ${c.kind}`}>{c.kind === "build" ? "Build" : "Theory"}</span></span>
                            </div>
                          );
                        })}
                      </>
                    )}

                    <div className="payoff">
                      <div className="ph2"><Target size={12} /> Interview payoff</div>
                      <ul>{p.interview.map((x, i) => <li key={i}>{x}</li>)}</ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const WB_TOPICS = { streams: "Streams", "string-coding": "Strings", "array-coding": "Arrays" };

function Workbench({ wb, setWb }) {
  const POOL = useMemo(
    () => QUESTIONS.filter((q) => WB_TOPICS[q.topic] && q.code),
    []
  );
  const [topicF, setTopicF] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [activeId, setActiveId] = useState(POOL[0] ? POOL[0].id : null);
  const [showSol, setShowSol] = useState(false);
  const [sec, setSec] = useState(0);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);

  const get = (id) => wb[id] || { code: "", status: "none", notes: "" };

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const counts = POOL.reduce((a, q) => {
    const st = get(q.id).status;
    if (st === "solved") a.solved++; else if (st === "review") a.review++;
    a.total++; return a;
  }, { solved: 0, review: 0, total: 0 });
  const pct = counts.total ? Math.round((counts.solved / counts.total) * 100) : 0;

  const visible = POOL.filter((q) => {
    if (topicF !== "all" && q.topic !== topicF) return false;
    const st = get(q.id).status || "none";
    if (statusF !== "all" && st !== statusF) return false;
    return true;
  });
  const active = POOL.find((q) => q.id === activeId) || visible[0] || POOL[0];
  const e = active ? get(active.id) : { code: "", status: "none", notes: "" };

  const selectQ = (id) => { setActiveId(id); setShowSol(false); setRunning(false); setSec(0); };
  const update = (patch) => setWb((w) => ({ ...w, [active.id]: { ...get(active.id), ...patch } }));
  const setCode = (code) => {
    const cur = get(active.id);
    update({ code, status: cur.status === "none" && code.trim() ? "progress" : cur.status });
  };
  const setStatus = (status) => update({ status: get(active.id).status === status ? "progress" : status });
  const setNotes = (notes) => update({ notes });
  const onSave = () => { setSaved(true); setTimeout(() => setSaved(false), 1400); };

  const onKeyDown = (ev) => {
    if (ev.key === "Tab") {
      ev.preventDefault();
      const ta = ev.target, st = ta.selectionStart, en = ta.selectionEnd;
      setCode(e.code.substring(0, st) + "  " + e.code.substring(en));
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = st + 2; });
    }
  };
  const fmt = (n) => { const m = Math.floor(n / 60), s = n % 60; return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s; };

  const statusChips = [["all", "All"], ["none", "Not started"], ["progress", "In progress"], ["solved", "Solved"], ["review", "Review"]];

  return (
    <div>
      <div className="page-h">
        <h1>Workbench</h1>
        <p>Write each solution from memory, time yourself, then reveal and compare. Status and notes save automatically.</p>
      </div>

      <div className="wb-top">
        <div className="chiprow" style={{ overflow: "visible" }}>
          <button className={`chip ${topicF === "all" ? "on" : ""}`} onClick={() => setTopicF("all")}>All coding <span className="cc">{POOL.length}</span></button>
          {Object.keys(WB_TOPICS).map((t) => (
            <button key={t} className={`chip ${topicF === t ? "on" : ""}`} onClick={() => setTopicF(t)}>
              {WB_TOPICS[t]} <span className="cc">{POOL.filter((q) => q.topic === t).length}</span>
            </button>
          ))}
        </div>
        <div className="wb-stats">
          <div className="wb-stat"><div className="n">{counts.total}</div><div className="l">Questions</div></div>
          <div className="wb-stat solved"><div className="n">{counts.solved}</div><div className="l">Solved</div></div>
          <div className="wb-stat review"><div className="n">{counts.review}</div><div className="l">Review</div></div>
        </div>
      </div>
      <div className="wb-bar"><i style={{ width: pct + "%" }} /></div>

      <div className="wb-grid">
        <div>
          <div className="fgroup" style={{ marginBottom: 10 }}>
            {statusChips.map(([v, l]) => (
              <button key={v} className={`chip sm ${statusF === v ? "on" : ""}`} onClick={() => setStatusF(v)}>{l}</button>
            ))}
          </div>
          <div className="wb-list">
            {visible.length === 0 && <div style={{ padding: 18, color: "var(--faint)", fontSize: 13 }}>No questions match this filter.</div>}
            {visible.map((q, i) => {
              const st = get(q.id).status;
              return (
                <div key={q.id} className={`wb-row ${active && q.id === active.id ? "active" : ""}`} onClick={() => selectQ(q.id)}>
                  <span className="wb-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="wb-name">{q.q}</span>
                  <span className={`wb-dot ${st}`} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="wb-work">
          {active && (
            <>
              <div className="wb-wtop">
                <div className="wb-meta">
                  <span className={`badge ${active.difficulty}`}>{active.difficulty}</span>
                  <span className="badge co">{WB_TOPICS[active.topic]}</span>
                  <span className="badge freq">{active.freq}</span>
                </div>
                <div className="wb-timer">
                  <span className={`wb-clock ${running ? "run" : ""}`}>{fmt(sec)}</span>
                  <button className="tbtn" onClick={() => setRunning((r) => !r)}>{running ? "Pause" : "Start"}</button>
                  <button className="tbtn" onClick={() => { setRunning(false); setSec(0); }}>Reset</button>
                </div>
              </div>

              <div className="wb-title">{active.q}</div>

              <div className="wb-lbl">
                <span>Your solution</span>
                <span className={`saved-tag ${saved ? "show" : ""}`}>Saved</span>
              </div>
              <textarea className="wb-editor" spellCheck={false} value={e.code} onChange={(ev) => setCode(ev.target.value)} onKeyDown={onKeyDown}
                placeholder="// write your solution here — it saves as you type" />

              <div className="wb-actions">
                <button className="wb-btn primary" onClick={onSave}>Save</button>
                <button className={`wb-btn sv ${e.status === "solved" ? "on" : ""}`} onClick={() => setStatus("solved")}>
                  <Check size={14} strokeWidth={3} />{e.status === "solved" ? "Solved" : "Mark solved"}
                </button>
                <button className={`wb-btn rv ${e.status === "review" ? "on" : ""}`} onClick={() => setStatus("review")}>
                  <Star size={14} />{e.status === "review" ? "For review" : "Mark for review"}
                </button>
              </div>

              <div className="wb-sol">
                <span className="wb-soltoggle" onClick={() => setShowSol((v) => !v)}>
                  {showSol ? <EyeOff size={15} /> : <Eye size={15} />}{showSol ? "Hide model solution" : "Reveal model solution"}
                </span>
                {showSol && (
                  <>
                    <div className="code" style={{ marginTop: 12 }}><pre>{active.code}</pre></div>
                    {active.keyPoints && (
                      <div className="kp" style={{ marginTop: 10 }}>
                        <div className="kh"><Target size={12} /> Why it works</div>
                        <ul>{active.keyPoints.map((k, i) => <li key={i}>{k}</li>)}</ul>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="wb-lbl" style={{ marginTop: 4 }}><span>Notes</span></div>
              <textarea className="wb-notes" value={e.notes} onChange={(ev) => setNotes(ev.target.value)}
                placeholder="Gotchas, alternative approaches, things you forgot…" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const MI_AREAS = [
  { id: "core", label: "Java Core", topics: ["oop", "strings", "exceptions", "java8", "modern", "jvm", "generics", "serialization", "coding"] },
  { id: "collections", label: "Collections", topics: ["collections"] },
  { id: "concurrency", label: "Concurrency", topics: ["concurrency"] },
  { id: "springboot", label: "Spring Boot", topics: ["spring"] },
  { id: "rest", label: "REST", topics: ["spring-web"] },
  { id: "jpa", label: "JPA", topics: ["jpa", "hibernate"] },
  { id: "database", label: "Database / SQL", topics: ["database"] },
  { id: "microservices", label: "Microservices", topics: ["microservices"] },
  { id: "experience", label: "My Experience", topics: ["experience"] },
];
const MI_DEFAULT = ["core", "collections", "springboot", "rest", "jpa", "experience"];
const MI_PTS = { confident: 2, partial: 1, struggled: 0 };
function miShuffle(a) { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }
const miScoreColor = (p) => p >= 75 ? "var(--emerald)" : p >= 50 ? "var(--amber)" : "var(--rose)";

function miSpeak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US"; u.rate = 1;
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find((x) => /en[-_]US/i.test(x.lang)) || voices.find((x) => /^en/i.test(x.lang));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}
function miStopSpeak() { if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel(); }

const MI_STOP = new Set("the a an and or of to in on for with is are be as by it its that this you your we our they their them then than into onto from at can will would should could may might not no yes use used using via more most less only just also which what when where how why who via about across against per each any all such".split(" "));
function miTokens(str) { return (String(str || "").toLowerCase().match(/[a-z0-9+#]+/g) || []).filter((w) => w.length >= 3 && !MI_STOP.has(w)); }
function miEvaluate(transcript, keyPoints) {
  const said = new Set(miTokens(transcript));
  const kps = (keyPoints || []).map((kp) => {
    const toks = [...new Set(miTokens(kp))];
    const hit = toks.filter((t) => said.has(t)).length;
    return { text: kp, covered: toks.length ? hit / toks.length >= 0.34 : false };
  });
  const total = kps.length, cov = kps.filter((k) => k.covered).length;
  const pct = total ? Math.round((cov / total) * 100) : 0;
  const suggested = pct >= 67 ? "confident" : pct >= 34 ? "partial" : "struggled";
  return { kps, cov, total, pct, suggested };
}
async function miGradeAI({ question, answer, keyPoints }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6", max_tokens: 400,
      messages: [{ role: "user", content:
        "You are a senior Java interviewer scoring a candidate's spoken answer.\n\nQUESTION:\n" + question +
        "\n\nCANDIDATE ANSWER:\n" + (answer || "(no answer given)") +
        "\n\nKEY POINTS EXPECTED:\n- " + (keyPoints || []).join("\n- ") +
        "\n\nReturn ONLY JSON, no markdown: {\"score\": <integer 0-10>, \"feedback\": \"2-3 specific, encouraging sentences on what was good and what to improve\"}" }]
    })
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

function MockInterview({ mock, setMock }) {
  const [phase, setPhase] = useState("setup");
  const [selected, setSelected] = useState(MI_DEFAULT);
  const [count, setCount] = useState(8);
  const [weakMode, setWeakMode] = useState(false);
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ratings, setRatings] = useState({});
  const [result, setResult] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const startRef = React.useRef(0);

  const [voiceOn, setVoiceOn] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [micSupported, setMicSupported] = useState(false);
  const [micError, setMicError] = useState("");
  const [ai, setAi] = useState({ loading: false, res: null, err: "" });
  const recRef = React.useRef(null);
  const wantRef = React.useRef(false);

  useEffect(() => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { setMicSupported(false); return; }
    setMicSupported(true);
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
    rec.onresult = (e) => {
      let fin = "", inter = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const seg = e.results[i][0].transcript;
        if (e.results[i].isFinal) fin += seg + " "; else inter += seg;
      }
      if (fin) setTranscript((p) => p + fin);
      setInterim(inter);
    };
    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      wantRef.current = false; setListening(false);
      const map = { "not-allowed": "Microphone blocked. Allow mic access in your browser. (Note: the mic does not work in the embedded preview - run the app locally in Chrome/Edge.)", "service-not-allowed": "Microphone blocked by the browser/OS. Allow mic access and use Chrome or Edge.", "audio-capture": "No microphone found. Check your mic is connected." };
      setMicError(map[e.error] || ("Speech error: " + e.error));
    };
    rec.onend = () => { if (wantRef.current) { try { rec.start(); } catch (x) { setListening(false); } } else setListening(false); };
    recRef.current = rec;
    return () => { wantRef.current = false; try { rec.abort(); } catch (x) {} };
  }, []);

  const startListen = () => { if (!recRef.current) return; setMicError(""); setInterim(""); wantRef.current = true; try { recRef.current.start(); setListening(true); } catch (x) {} };
  const stopListen = () => { wantRef.current = false; if (recRef.current) { try { recRef.current.stop(); } catch (x) {} } setListening(false); setInterim(""); };

  const history = (mock && mock.history) || [];
  const seen = (mock && mock.seen) || {};
  const savedRatings = (mock && mock.ratings) || {};

  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => setElapsed(Math.round((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "running") { miStopSpeak(); return; }
    const q = deck[idx];
    if (q && voiceOn) { const id = setTimeout(() => miSpeak("Question " + (idx + 1) + ". " + q.q), 250); return () => { clearTimeout(id); miStopSpeak(); }; }
    return () => miStopSpeak();
    // eslint-disable-next-line
  }, [idx, phase]);

  const areasSel = MI_AREAS.filter((a) => selected.includes(a.id));
  const poolCount = areasSel.reduce((s, a) => s + QUESTIONS.filter((q) => a.topics.includes(q.topic) && (q.a || (q.keyPoints && q.keyPoints.length))).length, 0);
  const unseenCount = areasSel.reduce((s, a) => s + QUESTIONS.filter((q) => a.topics.includes(q.topic) && (q.a || (q.keyPoints && q.keyPoints.length)) && !seen[q.id]).length, 0);
  const toggleArea = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const buildDeck = () => {
    const perArea = areasSel.map((a) => {
      let qs = QUESTIONS.filter((q) => a.topics.includes(q.topic) && (q.a || (q.keyPoints && q.keyPoints.length)));
      if (weakMode) qs = qs.filter((q) => savedRatings[q.id] && savedRatings[q.id] !== "confident");
      return miShuffle(qs.filter((q) => !seen[q.id])).concat(miShuffle(qs.filter((q) => seen[q.id])));
    });
    const out = []; let progress = true;
    while (out.length < count && progress) { progress = false; for (const pool of perArea) { if (pool.length) { out.push(pool.shift()); progress = true; if (out.length >= count) break; } } }
    return miShuffle(out);
  };

  const resetTurn = () => { setTranscript(""); setInterim(""); setAi({ loading: false, res: null, err: "" }); };
  const start = () => { const d = buildDeck(); if (!d.length) return; setDeck(d); setIdx(0); setRevealed(false); setRatings({}); setResult(null); resetTurn(); startRef.current = Date.now(); setElapsed(0); setPhase("running"); };
  const quit = () => { stopListen(); miStopSpeak(); setPhase("setup"); };

  const finish = (finalRatings, finalDeck) => {
    stopListen(); miStopSpeak();
    const earned = finalDeck.reduce((s, q) => s + (MI_PTS[finalRatings[q.id]] || 0), 0);
    const max = finalDeck.length * 2, score = max ? Math.round((earned / max) * 100) : 0;
    const bd = {};
    finalDeck.forEach((q) => { const a = MI_AREAS.find((x) => x.topics.includes(q.topic)); if (!a) return; bd[a.label] = bd[a.label] || { e: 0, m: 0 }; bd[a.label].e += MI_PTS[finalRatings[q.id]] || 0; bd[a.label].m += 2; });
    const durationSec = Math.round((Date.now() - startRef.current) / 1000);
    const struggled = finalDeck.filter((q) => finalRatings[q.id] !== "confident");
    setResult({ score, earned, max, bd, struggled, durationSec, deck: finalDeck });
    const session = { d: dateKey(new Date()), score, count: finalDeck.length, durationSec };
    setMock((m) => ({ history: [session, ...(((m && m.history) || []))].slice(0, 60), seen: { ...(((m && m.seen) || {})), ...Object.fromEntries(finalDeck.map((q) => [q.id, true])) }, ratings: { ...(((m && m.ratings) || {})), ...finalRatings } }));
    setPhase("result");
  };

  const rate = (rt) => { const cur = deck[idx]; const next = { ...ratings, [cur.id]: rt }; setRatings(next); stopListen(); miStopSpeak(); resetTurn(); if (idx + 1 < deck.length) { setIdx(idx + 1); setRevealed(false); } else finish(next, deck); };

  const runAi = async () => {
    const q = deck[idx]; setAi({ loading: true, res: null, err: "" });
    try { const out = await miGradeAI({ question: q.q, answer: transcript.trim(), keyPoints: q.keyPoints }); setAi({ loading: false, res: out, err: "" }); }
    catch (e) { setAi({ loading: false, res: null, err: "Detailed AI feedback needs the online Claude app - it can't run on a local/Netlify build. Your key-point coverage above is your offline score." }); }
  };

  const fmt = (n) => { const m = Math.floor(n / 60), s = n % 60; return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s; };
  const best = history.length ? Math.max(...history.map((h) => h.score)) : 0;

  if (phase === "setup") {
    return (
      <div className="mi">
        <div className="mi-hero">
          <h1>Mock Interview</h1>
          <p>A real spoken interview. The interviewer <b>reads each question aloud</b>, you <b>answer by speaking</b>, and it <b>auto-checks your answer</b> against the key points, suggests a score, and tracks your progress over time.</p>
          <div className="mi-tips">
            <div className="mi-tip"><Volume2 size={14} />The interviewer speaks each question - answer out loud, tap the mic to capture your reply.</div>
            <div className="mi-tip"><Target size={14} />After you answer it auto-checks coverage of the key points and suggests your score - you confirm or adjust.</div>
            <div className="mi-tip"><Shuffle size={14} />Every round pulls fresh questions you haven't seen - so each day is different.</div>
            <div className="mi-tip"><Building2 size={14} />Your Barclays & Service Mesh questions include a "how to answer" script - rehearse those most.</div>
          </div>
        </div>
        <div className="mi-sec">// pick your topics</div>
        <div className="mi-areas">
          {MI_AREAS.map((a) => { const n = QUESTIONS.filter((q) => a.topics.includes(q.topic) && (q.a || (q.keyPoints && q.keyPoints.length))).length; return <button key={a.id} className={`mi-area ${selected.includes(a.id) ? "on" : ""}`} onClick={() => toggleArea(a.id)}>{a.label} <span className="ct">{n}</span></button>; })}
        </div>
        <div className="mi-sec">// round length</div>
        <div className="mi-row">
          {[5, 8, 10, 15].map((c) => <button key={c} className={`chip sm ${count === c ? "on" : ""}`} onClick={() => setCount(c)}>{c} questions</button>)}
          <button className={`chip sm ${weakMode ? "on" : ""}`} style={{ marginLeft: 8 }} onClick={() => setWeakMode((v) => !v)}><RotateCcw size={12} /> Focus on weak</button>
          <button className={`chip sm ${voiceOn ? "on" : ""}`} onClick={() => { setVoiceOn((v) => { if (v) miStopSpeak(); return !v; }); }}>{voiceOn ? <Volume2 size={12} /> : <VolumeX size={12} />} Interviewer voice</button>
        </div>
        <div className="mi-micnote">{micSupported ? "Mic ready. Speaking works best in Chrome/Edge on your local build (allow the microphone when asked). It won't work in the embedded chat preview." : "Speech-to-text needs Chrome or Edge. The interviewer voice still works everywhere; you can type your answers."} · <b>{unseenCount}</b> fresh questions available.</div>
        <button className="mi-start" onClick={start} disabled={!selected.length || poolCount === 0}><GraduationCap size={18} /> Start mock interview</button>
        {history.length > 0 && (
          <>
            <div className="mi-stats3" style={{ marginTop: 26 }}>
              <div className="mi-st"><div className="v">{history.length}</div><div className="l">Sessions</div></div>
              <div className="mi-st"><div className="v" style={{ color: miScoreColor(best) }}>{best}%</div><div className="l">Best score</div></div>
              <div className="mi-st"><div className="v">{Math.round(history.reduce((s, h) => s + h.score, 0) / history.length)}%</div><div className="l">Average</div></div>
            </div>
            <div className="mi-sec">// recent rounds</div>
            <div className="mi-hist">{history.slice(0, 8).map((h, i) => <div className="mi-hrow" key={i}><span className="hd">{h.d} · {h.count} Qs · {fmt(h.durationSec || 0)}</span><span className="hbar"><i style={{ width: h.score + "%", background: miScoreColor(h.score) }} /></span><span className="hs" style={{ color: miScoreColor(h.score) }}>{h.score}%</span></div>)}</div>
          </>
        )}
      </div>
    );
  }

  if (phase === "running") {
    const q = deck[idx];
    const topic = topicById[q.topic];
    const isExp = q.topic === "experience";
    const ev = revealed && transcript.trim() && q.keyPoints ? miEvaluate(transcript, q.keyPoints) : null;
    const sugLabel = ev ? (ev.suggested === "confident" ? "Confident" : ev.suggested === "partial" ? "Partial" : "Struggled") : "";
    return (
      <div className="mi">
        <div className="mi-top"><span className="mi-qn">Question {idx + 1} of {deck.length}</span><span className="mi-clock">{fmt(elapsed)}</span></div>
        <div className="mi-bar"><i style={{ width: (idx / deck.length) * 100 + "%" }} /></div>
        <div className="mi-card">
          <div className="mi-who"><div className="mi-av"><Brain size={20} /></div><div><b>Interviewer</b><span>{isExp ? "Let's talk about your experience." : "Let's dig into some fundamentals."}</span></div></div>
          <div className="mi-badges"><span className="badge freq">{topic.name.split(" ")[0]}</span><span className={`badge ${q.difficulty}`}>{q.difficulty}</span><span className="badge freq">{q.freq}</span></div>
          <div className="mi-q">{q.q}</div>
          <div className="mi-voicebar">
            <button className="mi-vbtn" onClick={() => miSpeak(q.q)}><Volume2 size={13} /> Repeat question</button>
            <button className={`chip sm ${voiceOn ? "on" : ""}`} onClick={() => { setVoiceOn((v) => { if (v) miStopSpeak(); return !v; }); }}>{voiceOn ? <Volume2 size={12} /> : <VolumeX size={12} />} Voice</button>
          </div>
          {!revealed ? (
            <>
              {micSupported ? (
                <>
                  <button className={`mi-mic ${listening ? "live" : ""}`} onClick={listening ? stopListen : startListen}><Mic size={18} /> {listening ? "Listening… tap to stop" : "Speak your answer"}</button>
                  <textarea className="mi-transcript" value={transcript + (interim ? " " + interim : "")} onChange={(e) => { setTranscript(e.target.value); setInterim(""); }} placeholder="Your spoken answer appears here as you talk… (you can also type/edit)" />
                  {micError && <div className="mi-micerr"><AlertTriangle size={13} />{micError}</div>}
                </>
              ) : (
                <>
                  <div className="mi-prompt"><Lightbulb size={14} />Answer out loud as if I'm across from you. (Live speech capture needs Chrome/Edge; here you can type your answer.)</div>
                  <textarea className="mi-transcript" value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Type your answer…" />
                </>
              )}
              <button className="mi-revealbtn" onClick={() => { stopListen(); miStopSpeak(); setRevealed(true); }}><Eye size={17} /> Reveal & check my answer</button>
            </>
          ) : (
            <>
              {transcript.trim() && (<div className="mi-your"><div className="al" style={{ color: "var(--indigo)" }}><Mic size={12} /> Your answer</div><div className="atext">{transcript.trim()}</div></div>)}
              {ev && (<div className="mi-eval"><span className="mi-evpct" style={{ color: miScoreColor(ev.pct) }}>{ev.pct}%</span><span className="mi-evtxt">Auto-check · you hit <b>{ev.cov}</b> of <b>{ev.total}</b> key points{ev.cov < ev.total ? " — see what to add below" : " — great coverage!"}</span></div>)}
              <div className="mi-ans">
                <div className="al"><Check size={12} strokeWidth={3} /> {isExp ? "How to answer" : "Model answer"}</div>
                {q.a && <div className="atext">{q.a}</div>}
                {q.keyPoints && (
                  <div className="mi-kplist">
                    <div className="kh"><Target size={12} /> {ev ? "Key points — what you covered" : "Key points to hit"}</div>
                    <ul>{q.keyPoints.map((k, i) => { const hit = ev ? ev.kps[i].covered : null; return <li key={i} className={hit === false ? "miss" : "hit"}>{ev ? (hit ? <Check size={13} strokeWidth={3} color="var(--emerald)" /> : <CircleDot size={13} color="var(--faint)" />) : <Target size={12} color="var(--amber)" />} {k}</li>; })}</ul>
                  </div>
                )}
                {q.code && <div className="code" style={{ marginTop: 12 }}><pre>{q.code}</pre></div>}
              </div>
              {transcript.trim() && (
                <>
                  <button className="mi-aibtn" onClick={runAi} disabled={ai.loading}>{ai.loading ? <><Loader2 size={14} className="spin" /> Grading…</> : <><Sparkles size={14} /> Get detailed AI feedback (online)</>}</button>
                  {ai.res && <div className="mi-aibox"><div className="as" style={{ color: miScoreColor(ai.res.score * 10) }}>AI score: {ai.res.score}/10</div><div className="af">{ai.res.feedback}</div></div>}
                  {ai.err && <div className="mi-aibox"><div className="af">{ai.err}</div></div>}
                </>
              )}
              <div className="mi-rate">
                <div className="rl">{ev ? <>Auto-suggested: <b style={{ color: miScoreColor(ev.pct) }}>{sugLabel}</b>. Confirm or adjust:</> : "How did your answer compare?"}</div>
                <div className="mi-rbtns">
                  <button className={`mi-rbtn bad ${ev && ev.suggested === "struggled" ? "sugg" : ""}`} onClick={() => rate("struggled")}><X size={16} />Struggled<small>couldn't answer</small></button>
                  <button className={`mi-rbtn mid ${ev && ev.suggested === "partial" ? "sugg" : ""}`} onClick={() => rate("partial")}><CircleDot size={15} />Partial<small>missed some</small></button>
                  <button className={`mi-rbtn good ${ev && ev.suggested === "confident" ? "sugg" : ""}`} onClick={() => rate("confident")}><Check size={16} strokeWidth={3} />Confident<small>nailed it</small></button>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="mi-quit"><button onClick={quit}>End interview</button></div>
      </div>
    );
  }

  const r = result;
  const msg = r.score >= 80 ? "Strong round — you're interview-ready on these. Keep the streak going." : r.score >= 60 ? "Solid work. Tighten the ones you marked partial and run it again tomorrow." : "Good on you for practising — this is exactly how the nerves fade. Review the tough ones and go again. Round by round, this gets easy.";
  return (
    <div className="mi">
      <div className="mi-score"><div className="big" style={{ color: miScoreColor(r.score) }}>{r.score}%</div><div className="lbl">{r.earned} / {r.max} points · {r.deck.length} questions · {fmt(r.durationSec)}</div></div>
      <div className="mi-msg">{msg}</div>
      <div className="mi-sec" style={{ marginTop: 24 }}>// how you did by topic</div>
      <div className="mi-break">{Object.entries(r.bd).map(([label, v]) => { const p = v.m ? Math.round((v.e / v.m) * 100) : 0; return <div className="mi-brow" key={label}><span className="bn">{label}</span><span className="bb"><i style={{ width: p + "%", background: miScoreColor(p) }} /></span><span className="bp">{p}%</span></div>; })}</div>
      {r.struggled.length > 0 && (<><div className="mi-sec" style={{ marginTop: 22 }}>// review these ({r.struggled.length})</div><div className="mi-revq">{r.struggled.map((q) => <details key={q.id}><summary><ChevronRight size={14} style={{ marginTop: 2, flex: "none" }} />{q.q}</summary><div className="rc">{q.a || (q.keyPoints || []).join(" · ")}</div></details>)}</div></>)}
      <div className="mi-actions"><button className="mi-again" onClick={start}><RotateCcw size={16} /> New round</button><button className="mi-review" onClick={() => setPhase("setup")}><ArrowLeft size={16} /> Back to setup</button></div>
    </div>
  );
}

export default function App() {
  const [progress, setProgress] = useProgress();
  const [attendance, setAttendance] = usePersisted("coreJavaPrep_attendance_v1", {});
  const [roadmapDone, setRoadmapDone] = usePersisted("coreJavaPrep_roadmap_v1", {});
  const [workbench, setWorkbench] = usePersisted("coreJavaPrep_workbench_v1", {});
  const [mockData, setMockData] = usePersisted("coreJavaPrep_mock_v1", { history: [], seen: {}, ratings: {} });
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
    { id: "mock", label: "Mock Interview", icon: <GraduationCap size={17} /> },
    { id: "workbench", label: "Workbench", icon: <Code2 size={17} /> },
    { id: "console", label: "Java console", icon: <Terminal size={17} /> },
    { id: "tracker", label: "Daily tracker", icon: <Calendar size={17} /> },
    { id: "roadmap", label: "Project roadmap", icon: <Map size={17} /> },
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
          {view === "workbench" && (
            <Workbench wb={workbench} setWb={setWorkbench} />
          )}
          {view === "mock" && (
            <MockInterview mock={mockData} setMock={setMockData} />
          )}
          {view === "console" && <Console />}
          {view === "tracker" && (
            <Tracker attendance={attendance} setAttendance={setAttendance} streaks={streaks} />
          )}
          {view === "roadmap" && (
            <Roadmap done={roadmapDone} setDone={setRoadmapDone} />
          )}
        </main>
      </div>
    </div>
  );
}
