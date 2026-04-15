import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const txtPath = path.resolve(__dirname, '../preguntasATS.txt');
const subjectsPath = path.resolve(__dirname, '../src/data/subjects.json');

const content = fs.readFileSync(txtPath, 'utf8').replace(/\r\n/g, '\n');

// The file format has blocks starting with 🔹 and questions starting with "1. "
// Options are "A) ", "B) ", "C) ", "D) "
// Answers are at the end of each block under "✅ PLANTILLA DE RESPUESTAS" or "✅ RESPUESTAS"

const blocks = content.split(/✅.*?\n/);
let globalQId = 1;
const preguntas = [];

for (let i = 0; i < blocks.length; i++) {
  const block = blocks[i].trim();
  if (!block) continue;
  
  // If there's an answer key right after
  if (i + 1 < blocks.length) {
    // The next block might be answers followed by the next set of questions
    const nextBlockLines = blocks[i+1].trim().split('\n');
    const answers = [];
    let restOfNextBlock = [];
    
    let inAnswers = true;
    for (const line of nextBlockLines) {
      if (inAnswers && /^[A-D]$/i.test(line.trim())) {
        answers.push(line.trim().toLowerCase());
      } else if (line.trim()) {
        inAnswers = false;
        restOfNextBlock.push(line);
      } else if (!line.trim() && !inAnswers) {
        restOfNextBlock.push(line);
      }
    }
    
    // Now extract questions from `block`
    const qPattern = /(\d+\.\s+.*?)\n(A\)\s+.*?)\n(B\)\s+.*?)\n(C\)\s+.*?)\n(D\)\s+.*?)(?=\n\n|\n*$)/gs;
    const questions = [...block.matchAll(qPattern)];
    
    if (questions.length !== answers.length) {
      console.warn(`Mismatch in block ${i}: ${questions.length} questions, ${answers.length} answers`);
    }
    
    questions.forEach((qMatch, idx) => {
      const enunciado = qMatch[1].replace(/^\d+\.\s*/, '').trim();
      const optsText = [qMatch[2], qMatch[3], qMatch[4], qMatch[5]];
      
      const opciones = optsText.map(o => {
        const id = o[0].toLowerCase();
        const texto = o.substring(3).trim();
        return { id, texto };
      });
      
      const correctAnswer = idx < answers.length ? [answers[idx]] : ['a'];
      
      preguntas.push({
        id: `q-ats-${globalQId++}`,
        enunciado,
        tipo: 'unica',
        opciones,
        respuestaCorrecta: correctAnswer
      });
    });
    
    blocks[i+1] = restOfNextBlock.join('\n');
  }
}

const newSubject = {
  id: "sub-ats",
  nombre: "ATS",
  tests: [
    {
      "id": "test-ats-1",
      "titulo": "Primer Parcial ATS",
      "descripcion": "Preguntas del primer parcial de ATS",
      "preguntas": preguntas
    }
  ]
};

const subjectsData = JSON.parse(fs.readFileSync(subjectsPath, 'utf8'));

// Check if ATS already exists
const existingIdx = subjectsData.findIndex(s => s.id === 'sub-ats');
if (existingIdx >= 0) {
  subjectsData[existingIdx] = newSubject;
} else {
  subjectsData.push(newSubject);
}

fs.writeFileSync(subjectsPath, JSON.stringify(subjectsData, null, 2));
console.log(`Successfully added ATS subject with ${preguntas.length} questions.`);
