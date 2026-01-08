import { describe, it, expect } from 'vitest';
import { parseQuestions } from './parser';

describe('Question Parser', () => {
  it('should parse a simple question block correctly', () => {
    const text = `
En el conflicte entre dues parts...
a) un acord b) una decisió. c) una solució creativa. d) un compromís. e) Cap de les anteriors.

RESPOSTES AL TEST
1-d
`;
    const result = parseQuestions(text);
    expect(result).toHaveLength(1);
    expect(result[0].enunciado).toContain('En el conflicte');
    expect(result[0].opciones).toHaveLength(5);
    expect(result[0].opciones[0].id).toBe('a');
    expect(result[0].opciones[0].texto).toBe('un acord');
    expect(result[0].respuestaCorrecta).toEqual(['d']);
  });

  it('should handle "d) b) i c)" correctly', () => {
    const text = `
Question text here
a) optA b) optB c) optC d) b) i c). e) None.

Respuestas
1-d
`;
    const result = parseQuestions(text);
    expect(result).toHaveLength(1);
    expect(result[0].opciones).toHaveLength(5);
    const optD = result[0].opciones.find(o => o.id === 'd');
    expect(optD?.texto).toContain('b) i c)');
    // Ensure option B didn't get cut or messed up
    const optB = result[0].opciones.find(o => o.id === 'b');
    expect(optB?.texto).toBe('optB');
  });

  it('should handle multiple sections with independent numbering', () => {
    const text = `
1. Question Block 1 - Q1
a) A1 b) B1

2. Question Block 1 - Q2
a) A2 b) B2

RESPOSTES AL TEST
1-a, 2-b

-----------------------------------------------

1. Question Block 2 - Q1
a) C1 b) D1

2. Question Block 2 - Q2
a) C2 b) D2

Respuestas
1-b, 2-a
`;
    const result = parseQuestions(text);
    
    // Should have 4 questions total
    expect(result).toHaveLength(4);
    
    // Check Block 1
    expect(result[0].enunciado).toContain('Block 1 - Q1');
    expect(result[0].respuestaCorrecta).toEqual(['a']);
    
    expect(result[1].enunciado).toContain('Block 1 - Q2');
    expect(result[1].respuestaCorrecta).toEqual(['b']);
    
    // Check Block 2
    expect(result[2].enunciado).toContain('Block 2 - Q1');
    expect(result[2].respuestaCorrecta).toEqual(['b']); // 1-b from second block
    
    expect(result[3].enunciado).toContain('Block 2 - Q2');
    expect(result[3].respuestaCorrecta).toEqual(['a']); // 2-a from second block
    
    // Check IDs are unique
    const ids = result.map(r => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(4);
  });
});
