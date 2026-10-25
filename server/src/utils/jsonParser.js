/**
 * Resilient JSON parser for LLM outputs.
 * Repairs common invalid escape sequences and control characters inside JSON strings.
 */

function cleanJsonString(str) {
  if (!str || typeof str !== 'string') return '';

  const codeBlocks = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/gi);
  if (codeBlocks?.length) {
    const lastBlock = codeBlocks[codeBlocks.length - 1]
      .replace(/```(?:json)?/gi, '')
      .replace(/```/g, '')
      .trim();
    const start = lastBlock.indexOf('{');
    const end = lastBlock.lastIndexOf('}');
    if (start !== -1 && end > start) return lastBlock.slice(start, end + 1);
  }

  const startMarker = str.lastIndexOf('{\n  "title"');
  const start = startMarker !== -1 ? startMarker : str.indexOf('{');
  const end = str.lastIndexOf('}');
  if (start === -1 || end <= start) return '';
  return str.slice(start, end + 1);
}

function sanitizeStringLiterals(input) {
  let output = '';
  let inString = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (!inString) {
      output += ch;
      if (ch === '"') inString = true;
      continue;
    }

    if (ch === '"') {
      output += ch;
      inString = false;
      continue;
    }

    if (ch === '\\') {
      const next = input[i + 1];
      if (next === undefined) {
        output += '\\\\';
        continue;
      }

      // Keep valid JSON escapes; escape stray backslashes (e.g. Windows paths or regexes).
      if ('"\\/bfnrt'.includes(next)) {
        output += ch + next;
        i++;
        continue;
      }
      if (next === 'u' && /^[0-9a-fA-F]{4}$/.test(input.slice(i + 2, i + 6))) {
        output += input.slice(i, i + 6);
        i += 5;
        continue;
      }

      output += '\\\\';
      continue;
    }

    const code = ch.charCodeAt(0);
    if (ch === '\n') output += '\\n';
    else if (ch === '\r') output += '\\r';
    else if (ch === '\t') output += '\\t';
    else if (code < 32) continue;
    else output += ch;
  }

  return output;
}

function robustParseJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty or invalid text received from model.');
  }

  const cleaned = cleanJsonString(rawText);
  if (!cleaned) throw new Error('No valid JSON object found in model output.');

  try {
    return JSON.parse(cleaned);
  } catch (firstError) {
    try {
      return JSON.parse(sanitizeStringLiterals(cleaned));
    } catch {
      throw new Error(`Failed to parse model JSON: ${firstError.message}`);
    }
  }
}

module.exports = { cleanJsonString, robustParseJSON };
