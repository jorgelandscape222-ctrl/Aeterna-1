/**
 * Crypto and hashing utilities for the AI Continuity Protocol Simulator
 * Implements tamper-evident audit logs, Merkle root simulations, and lineage proofs.
 *
 * NOTE ON CRYPTOGRAPHIC STRENGTH:
 * This module intentionally uses a synchronous, dependency-free hash (a 128-bit
 * FNV-1a variant run over 4 offset basins) rather than Web Crypto's SHA-256.
 * SubtleCrypto's digest() is async-only, and the app's state transitions call
 * these hashing functions synchronously inside React state updates and render
 * paths, so swapping in real SHA-256 would require threading Promises through
 * most of App.tsx. For a protocol *simulator* — where the goal is to demonstrate
 * deterministic hash-chaining, Merkle aggregation, and descent verification
 * logic rather than to provide production-grade tamper resistance — this
 * tradeoff is acceptable. If this app is ever adapted into a real continuity
 * system, replace sha256() with an async crypto.subtle.digest("SHA-256", ...)
 * call and update all call sites accordingly.
 */

/**
 * Deterministically stringifies a value with object keys sorted, so hashing the
 * same logical object always produces the same string regardless of key
 * insertion order (plain JSON.stringify does not guarantee this across engines
 * or after object spreads/rebuilds).
 */
export function stableStringify(value: unknown): string {
  const seen = new WeakSet();

  const sort = (input: unknown): unknown => {
    if (input === null || typeof input !== "object") return input;
    if (seen.has(input as object)) return "[circular]";
    seen.add(input as object);

    if (Array.isArray(input)) {
      return input.map(sort);
    }

    const sortedEntries = Object.keys(input as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sort((input as Record<string, unknown>)[key]);
        return acc;
      }, {});
    return sortedEntries;
  };

  return JSON.stringify(sort(value));
}

/**
 * A synchronous 128-bit hash built from four independent 32-bit FNV-1a passes
 * with different seeds/strides, then hex-encoded. Not cryptographically secure,
 * but has good avalanche behavior and near-zero collision rate for the small
 * amount of demo state this app hashes. Deterministic across runs and engines.
 */
export function sha256(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const seeds = [0x811c9dc5, 0x1000193, 0x9e3779b9, 0x85ebca6b];

  const basin = (seed: number, stride: number): number => {
    let h = seed >>> 0;
    for (let i = 0; i < bytes.length; i++) {
      h ^= bytes[i];
      h = Math.imul(h, 0x01000193 ^ stride);
      h = (h << 13) | (h >>> 19);
    }
    // Final mix (avalanche)
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h >>> 0;
  };

  return seeds
    .map((seed, i) => basin(seed, i + 1).toString(16).padStart(8, "0"))
    .join("");
}

/**
 * Generate a mock Merkle Root from an array of leaf strings (e.g., manifest
 * layer contents). Odd nodes at any level are carried forward unpaired, per
 * standard Merkle-tree convention.
 */
export function calculateMerkleRoot(leaves: string[]): string {
  if (leaves.length === 0) return sha256("empty");
  let currentLevel = leaves.map((l) => sha256(l));

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        nextLevel.push(sha256(currentLevel[i] + currentLevel[i + 1]));
      } else {
        nextLevel.push(currentLevel[i]);
      }
    }
    currentLevel = nextLevel;
  }
  return currentLevel[0];
}

/**
 * Computes Proven Descent based on whether all state deltas are correctly
 * chained back to the canonical initial memory hash. If any lineageHash in
 * the state deltas does not correctly chain, the descent is broken for that
 * link. Uses stableStringify so hash verification is not sensitive to key
 * ordering in the `changes` object.
 */
export function calculateProvenDescent(
  canonicalHash: string,
  deltas: { lineageHash: string; changes: unknown }[]
): number {
  if (deltas.length === 0) return 1.0; // Perfect descent (no deltas yet)

  let currentChainHash = canonicalHash;
  let validLinks = 0;

  for (const delta of deltas) {
    // Expected link is the hash of (previous chain state + stable-stringified change)
    const expectedHash = sha256(currentChainHash + stableStringify(delta.changes));
    if (delta.lineageHash === expectedHash) {
      validLinks++;
    }
    currentChainHash = delta.lineageHash;
  }

  return validLinks / deltas.length;
}

/**
 * Computes the lineageHash for a new state-delta record, given the current
 * chain head and the change payload. Exposed so callers construct deltas in a
 * way that calculateProvenDescent can always successfully verify.
 */
export function computeDeltaLineageHash(priorChainHash: string, changes: unknown): string {
  return sha256(priorChainHash + stableStringify(changes));
}

/**
 * Computes behavioral fidelity (0.0 to 1.0) based on modification count and
 * prompt similarity (Jaccard index over word sets).
 */
export function calculateFidelity(
  originalPrompt: string,
  currentPrompt: string,
  deltaCount: number
): number {
  if (originalPrompt === currentPrompt && deltaCount === 0) return 1.0;

  // Base degradation for any state delta
  const deltaPenalty = Math.min(0.2, deltaCount * 0.04);

  // Word similarity penalty
  const origWords = new Set(originalPrompt.toLowerCase().split(/\s+/).filter(Boolean));
  const currWords = new Set(currentPrompt.toLowerCase().split(/\s+/).filter(Boolean));

  if (origWords.size === 0) return Math.max(0.0, 1.0 - deltaPenalty);

  let intersection = 0;
  origWords.forEach((word) => {
    if (currWords.has(word)) intersection++;
  });

  const jaccard = intersection / Math.max(1, origWords.size + currWords.size - intersection);
  const promptScore = 0.4 + 0.6 * jaccard;

  return Math.max(0.1, promptScore - deltaPenalty);
}
