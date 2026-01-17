import { describe, it, expect } from 'vitest';
import { chunkChangeModeEdits, summarizeChunking } from './changeModeChunker.js';
import { ChangeModeEdit } from './changeModeParser.js';

function createEdit(filename: string, codeSize: number): ChangeModeEdit {
  return {
    filename,
    oldStartLine: 1,
    oldEndLine: 10,
    oldCode: 'x'.repeat(codeSize),
    newStartLine: 1,
    newEndLine: 10,
    newCode: 'y'.repeat(codeSize),
  };
}

describe('chunkChangeModeEdits', () => {
  it('should return single chunk for empty edits', () => {
    const chunks = chunkChangeModeEdits([]);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].edits).toHaveLength(0);
    expect(chunks[0].chunkIndex).toBe(1);
    expect(chunks[0].totalChunks).toBe(1);
    expect(chunks[0].hasMore).toBe(false);
  });

  it('should return single chunk for small edits', () => {
    const edits = [
      createEdit('file1.ts', 100),
      createEdit('file2.ts', 100),
    ];

    const chunks = chunkChangeModeEdits(edits, 50000);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].edits).toHaveLength(2);
    expect(chunks[0].hasMore).toBe(false);
  });

  it('should split into multiple chunks when exceeding limit', () => {
    const edits = [
      createEdit('file1.ts', 5000),
      createEdit('file2.ts', 5000),
      createEdit('file3.ts', 5000),
    ];

    // Use small chunk size to force splitting
    const chunks = chunkChangeModeEdits(edits, 6000);

    expect(chunks.length).toBeGreaterThan(1);

    // Verify chunk metadata
    for (let i = 0; i < chunks.length; i++) {
      expect(chunks[i].chunkIndex).toBe(i + 1);
      expect(chunks[i].totalChunks).toBe(chunks.length);
      expect(chunks[i].hasMore).toBe(i < chunks.length - 1);
    }
  });

  it('should group edits by file', () => {
    const edits = [
      createEdit('file1.ts', 100),
      createEdit('file1.ts', 100),
      createEdit('file2.ts', 100),
    ];

    const chunks = chunkChangeModeEdits(edits, 50000);

    expect(chunks).toHaveLength(1);
    // Same file edits should be grouped together
    const file1Edits = chunks[0].edits.filter(e => e.filename === 'file1.ts');
    expect(file1Edits).toHaveLength(2);
  });

  it('should handle oversized single edits', () => {
    // Create an edit larger than the chunk limit
    const edits = [createEdit('large.ts', 30000)];

    // Chunk limit smaller than edit size
    const chunks = chunkChangeModeEdits(edits, 1000);

    // Should still include the edit (in an oversized chunk)
    expect(chunks).toHaveLength(1);
    expect(chunks[0].edits).toHaveLength(1);
  });

  it('should track estimated chars correctly', () => {
    const edits = [createEdit('test.ts', 500)];

    const chunks = chunkChangeModeEdits(edits);

    expect(chunks[0].estimatedChars).toBeGreaterThan(500);
    // Should include JSON overhead
    expect(chunks[0].estimatedChars).toBeLessThan(2000);
  });
});

describe('summarizeChunking', () => {
  it('should produce readable summary', () => {
    const edits = [
      createEdit('file1.ts', 100),
      createEdit('file2.ts', 200),
    ];

    const chunks = chunkChangeModeEdits(edits);
    const summary = summarizeChunking(chunks);

    expect(summary).toContain('# edits: 2');
    expect(summary).toContain('# chunks: 1');
    expect(summary).toContain('Chunk 1:');
  });
});
