// Lightweight stub for @codemirror/lang-php to avoid pulling @lezer/php (CJS)
// Returns a minimal LanguageSupport-like shape used by MDXEditor (expects `.extension`).

export function php() {
  return { extension: [] };
}

export default { php };
