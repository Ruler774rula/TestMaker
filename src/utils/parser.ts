import { Pregunta, Opcion } from '../types';

export const parseQuestions = (fullText: string): Pregunta[] => {
  const sections = fullText.split(/-{5,}/).map(s => s.trim()).filter(s => s.length > 0);
  const allQuestions: Pregunta[] = [];
  let globalIdCounter = 1;

  sections.forEach((section) => {
    const lines = section.split('\n');
    let answerLineIndex = -1;
    
    for (let i = lines.length - 1; i >= 0; i--) {
      if (/\d+\s*-\s*[a-e]/i.test(lines[i])) {
        answerLineIndex = i;
        break;
      }
    }
    
    if (answerLineIndex === -1) {
        const headerIdx = lines.findIndex(l => l.toLowerCase().includes('respostes') || l.toLowerCase().includes('respuestas'));
        if (headerIdx !== -1) {
            for (let j = headerIdx + 1; j < lines.length; j++) {
                if (lines[j].trim().length > 0) {
                    answerLineIndex = j;
                    break;
                }
            }
        }
    }

    if (answerLineIndex === -1) {
      console.warn('No answer key found for section');
      return;
    }

    const answerLine = lines[answerLineIndex];
    const answerMap: Record<number, string> = {};
    const answerMatches = answerLine.matchAll(/(\d+)-([a-e])/g);
    for (const match of answerMatches) {
      answerMap[parseInt(match[1])] = match[2];
    }

    let contentEndIndex = answerLineIndex;
    if (contentEndIndex > 0 && (lines[contentEndIndex - 1].toLowerCase().includes('respostes') || lines[contentEndIndex - 1].toLowerCase().includes('respuestas'))) {
        contentEndIndex--;
    }
    
    const questionsText = lines.slice(0, contentEndIndex).join('\n').trim();
    const rawBlocks = questionsText.split(/\n\s*\n/);
    const validBlocks = rawBlocks.filter(b => b.trim().length > 0);
    
    // Remove known headers that might be attached to blocks
    const cleanedBlocks = validBlocks.map(b => {
      const lines = b.split('\n');
      const filteredLines = lines.filter(l => !l.toLowerCase().trim().startsWith('examen de') && !l.toLowerCase().includes('aquí tienes el texto completo'));
      return filteredLines.join('\n').trim();
    });

    const questionBlocks = cleanedBlocks; // Don't filter by length yet

    let validCount = 0;
    let pendingText = '';

    questionBlocks.forEach((block) => {
      const normalizedBlock = block.replace(/\s+/g, ' ');
      // Check if this block contains options
      const hasOptions = /(^|\s)[aA][\)\.]\s/.test(normalizedBlock);

      if (hasOptions) {
        const fullBlock = (pendingText + '\n' + block).trim();
        pendingText = ''; // Reset buffer

        const normFull = fullBlock.replace(/\s+/g, ' ');
        const optionsStartIndex = normFull.search(/(^|\s)[aA][\)\.]\s/);
        
        if (optionsStartIndex === -1) {
             pendingText = fullBlock;
             return;
        }

        const enunciado = normFull.substring(0, optionsStartIndex).trim();
        const optionsText = normFull.substring(optionsStartIndex);
        
        const options: Opcion[] = [];
        const keys = ['a', 'b', 'c', 'd', 'e'];
        
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const nextKey = keys[i + 1];
            const keyRegex = new RegExp(`(^|\\s)${key}[\\)\\.]\\s`, 'i');
            const match = optionsText.match(keyRegex);
            
            if (match && match.index !== undefined) {
                const start = match.index + match[0].length;
                let end = optionsText.length;
                
                if (nextKey) {
                    const nextKeyRegex = new RegExp(`(^|\\s)${nextKey}[\\)\\.]\\s`, 'i');
                    const nextMatch = optionsText.slice(start).match(nextKeyRegex);
                    if (nextMatch && nextMatch.index !== undefined) {
                        end = start + nextMatch.index;
                    }
                }
                
                const optText = optionsText.substring(start, end).trim();
                options.push({
                    id: key.toLowerCase(),
                    texto: optText
                });
            }
        }

        if (options.length > 0) {
            const qNum = validCount + 1;
            const correctAnswer = answerMap[qNum];
            
            validCount++;
            allQuestions.push({
                id: `q-${globalIdCounter++}`,
                enunciado: enunciado,
                tipo: 'unica',
                opciones: options,
                respuestaCorrecta: correctAnswer ? [correctAnswer] : [],
            });
        }

      } else {
        if (block.length > 5) {
            pendingText += (pendingText ? '\n' : '') + block;
        }
      }
    });
  });

  return allQuestions;
};
