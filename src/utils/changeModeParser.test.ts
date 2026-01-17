import { describe, it, expect } from 'vitest';
import { parseChangeModeOutput, validateChangeModeEdits, ChangeModeEdit } from './changeModeParser.js';

describe('parseChangeModeOutput', () => {
  it('should parse markdown format edits', () => {
    const geminiResponse = `
**FILE: src/utils/test.ts:10**
\`\`\`
OLD:
const x = 1;
NEW:
const x = 2;
\`\`\`
`;
    const edits = parseChangeModeOutput(geminiResponse);

    expect(edits).toHaveLength(1);
    expect(edits[0].filename).toBe('src/utils/test.ts');
    expect(edits[0].oldStartLine).toBe(10);
    expect(edits[0].oldCode).toBe('const x = 1;');
    expect(edits[0].newCode).toBe('const x = 2;');
  });

  it('should parse multiple edits', () => {
    const geminiResponse = `
**FILE: src/a.ts:5**
\`\`\`
OLD:
line1
NEW:
line1-modified
\`\`\`

**FILE: src/b.ts:20**
\`\`\`
OLD:
line2
NEW:
line2-modified
\`\`\`
`;
    const edits = parseChangeModeOutput(geminiResponse);

    expect(edits).toHaveLength(2);
    expect(edits[0].filename).toBe('src/a.ts');
    expect(edits[1].filename).toBe('src/b.ts');
  });

  it('should handle empty response', () => {
    const edits = parseChangeModeOutput('');
    expect(edits).toHaveLength(0);
  });

  it('should handle response with no valid edits', () => {
    const edits = parseChangeModeOutput('Just some text without any edit blocks');
    expect(edits).toHaveLength(0);
  });

  it('should calculate correct line ranges', () => {
    const geminiResponse = `
**FILE: test.ts:100**
\`\`\`
OLD:
line1
line2
line3
NEW:
newline1
newline2
\`\`\`
`;
    const edits = parseChangeModeOutput(geminiResponse);

    expect(edits[0].oldStartLine).toBe(100);
    expect(edits[0].oldEndLine).toBe(102); // 3 lines: 100, 101, 102
    expect(edits[0].newStartLine).toBe(100);
    expect(edits[0].newEndLine).toBe(101); // 2 lines: 100, 101
  });

  it('should handle empty OLD section (insertion)', () => {
    const geminiResponse = `
**FILE: test.ts:50**
\`\`\`
OLD:

NEW:
inserted line
\`\`\`
`;
    const edits = parseChangeModeOutput(geminiResponse);

    expect(edits[0].oldCode).toBe('');
    expect(edits[0].newCode).toBe('inserted line');
  });
});

describe('validateChangeModeEdits', () => {
  it('should validate valid edits', () => {
    const edits: ChangeModeEdit[] = [{
      filename: 'test.ts',
      oldStartLine: 1,
      oldEndLine: 5,
      oldCode: 'old code',
      newStartLine: 1,
      newEndLine: 3,
      newCode: 'new code',
    }];

    const result = validateChangeModeEdits(edits);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing filename', () => {
    const edits: ChangeModeEdit[] = [{
      filename: '',
      oldStartLine: 1,
      oldEndLine: 5,
      oldCode: 'old',
      newStartLine: 1,
      newEndLine: 3,
      newCode: 'new',
    }];

    const result = validateChangeModeEdits(edits);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Edit missing filename');
  });

  it('should detect invalid line range', () => {
    const edits: ChangeModeEdit[] = [{
      filename: 'test.ts',
      oldStartLine: 10,
      oldEndLine: 5, // Invalid: end < start
      oldCode: 'old',
      newStartLine: 1,
      newEndLine: 3,
      newCode: 'new',
    }];

    const result = validateChangeModeEdits(edits);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Invalid line range'))).toBe(true);
  });

  it('should detect empty edit', () => {
    const edits: ChangeModeEdit[] = [{
      filename: 'test.ts',
      oldStartLine: 1,
      oldEndLine: 1,
      oldCode: '',
      newStartLine: 1,
      newEndLine: 1,
      newCode: '',
    }];

    const result = validateChangeModeEdits(edits);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Empty edit'))).toBe(true);
  });
});
