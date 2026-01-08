import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Mock types/functions since we can't import TS directly in JS easily without compilation
// Copying parser logic here to ensure it runs standalone

const parseQuestions = (fullText) => {
  const sections = fullText.split(/-{5,}/).map(s => s.trim()).filter(s => s.length > 0);
  const allQuestions = [];
  let globalIdCounter = 1;

  sections.forEach((section, sIdx) => {
    const lines = section.split('\n');
    let answerLineIndex = -1;
    
    for (let i = lines.length - 1; i >= 0; i--) {
      if (/\d+\s*-\s*[a-e]/i.test(lines[i])) {
        answerLineIndex = i;
        break;
      }
    }
    
    if (answerLineIndex === -1) {
        // Fallback for header search
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
      console.warn(`Section ${sIdx + 1}: No answer key found`);
      return;
    }

    const answerLine = lines[answerLineIndex];
    const answerMap = {};
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

    console.log(`Section ${sIdx + 1}: Found ${questionBlocks.length} blocks`);
    let validCount = 0;
    let pendingText = '';

    questionBlocks.forEach((block, index) => {
      const normalizedBlock = block.replace(/\s+/g, ' ');
      // Check if this block contains options
      // Allow start of string match for options too: (^|\s)[aA][\)\.]\s
      const hasOptions = /(^|\s)[aA][\)\.]\s/.test(normalizedBlock);

      if (hasOptions) {
        // This block has options. It might be the full question or the end of a question.
        // Combine with pending text.
        const fullBlock = (pendingText + '\n' + block).trim();
        pendingText = ''; // Reset buffer

        // Now parse fullBlock
        const normFull = fullBlock.replace(/\s+/g, ' ');
        const optionsStartIndex = normFull.search(/(^|\s)[aA][\)\.]\s/);
        
        // Adjust index if it matched start of string (index 0)
        // If match is at 0, optionsStartIndex is 0.
        // If match is at space (index N), optionsStartIndex is N.
        
        // But search returns index of match. If (^|\s) matched space, it includes space.
        // We want the start of "a)".
        // Regex `/(^|\s)[aA][\)\.]\s/` matches " a) ". Length 4.
        // If at start: "a) ". Length 3.
        
        // Let's use match to find exact split point.
        const match = normFull.match(/(^|\s)[aA][\)\.]\s/);
        let realStart = optionsStartIndex;
        if (match) {
             // If match[1] is space, we want to start after it? 
             // actually we want to split BEFORE "a)".
             // But the regex includes the space before.
             // If it starts with space, realStart is index of space.
             // Enunciado is substring(0, realStart). Correct.
             // OptionsText is substring(realStart). It will start with " a) ...".
             // My parser logic expects optionsText to have the keys.
        }

        if (optionsStartIndex === -1) {
             // Should not happen given hasOptions check, but safe guard
             pendingText = fullBlock; // Put it back? No, discard or warn.
             return;
        }

        const enunciado = normFull.substring(0, optionsStartIndex).trim();
        const optionsText = normFull.substring(optionsStartIndex);
        
        // ... (rest of parsing logic) ...
        // Need to increment validCount and push to allQuestions
        
        // Need to replicate the parsing logic here or wrap in function.
        // I'll inline it for now but carefully.
        
        const options = [];
        const keys = ['a', 'b', 'c', 'd', 'e'];
        
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const nextKey = keys[i + 1];
            // Regex needs to handle start of string for 'a' if optionsText starts with "a)"
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
            // Need qNum. But qNum depends on validCount now, not index of block.
            // Actually answerMap keys are 1..10.
            // So we need a counter for questions in this section.
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
        // No options, assume it's part of the next question's text (e.g. description)
        // Only append if it's not just noise?
        if (block.length > 5) {
            pendingText += (pendingText ? '\n' : '') + block;
        }
      }
    });
    console.log(`Section ${sIdx + 1}: Parsed ${validCount} valid questions`);
  });

  return allQuestions;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.resolve(__dirname, '../preguntasRS.txt');
const outputPath = path.resolve(__dirname, '../src/data/questions.json');

try {
  const content = fs.readFileSync(inputPath, 'utf-8');
  const questions = parseQuestions(content);
  
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
  console.log(`Successfully parsed ${questions.length} questions to ${outputPath}`);
} catch (error) {
  console.error('Error processing file:', error);
  process.exit(1);
}
