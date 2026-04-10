import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const txtPath = path.resolve(__dirname, '../preguntasMQGT.txt');
const subjectsPath = path.resolve(__dirname, '../src/data/subjects.json');

const content = fs.readFileSync(txtPath, 'utf8');

// Find answers
const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
const respostesIndex = lines.findIndex(l => l.toLowerCase().startsWith('respostes'));
if (respostesIndex === -1) {
  console.error("No answers found");
  process.exit(1);
}

let answersStr = '';
for (let i = respostesIndex + 1; i < lines.length; i++) {
  answersStr += lines[i].replace(/\s+/g, '');
}

const questionsText = lines.slice(0, respostesIndex).join('\n');

// Split into questions using regex that matches the start of a question
// Format: "1-Què" or "11. Quina"
// We can split by lines that start with a number followed by - or .
const rawBlocks = [];
let currentBlock = '';
lines.slice(0, respostesIndex).forEach(line => {
  if (/^\d+[-\.]/.test(line)) {
    if (currentBlock) rawBlocks.push(currentBlock);
    currentBlock = line;
  } else {
    currentBlock += '\n' + line;
  }
});
if (currentBlock) rawBlocks.push(currentBlock);

console.log(`Found ${rawBlocks.length} raw blocks, and ${answersStr.length} answers.`);

const parsedQuestions = [];

rawBlocks.forEach((block, idx) => {
  const normBlock = block.replace(/\n/g, ' ');
  
  // Find options starting with " A. " or " A " or " a) "
  // It looks like options are uppercase " A. ", " B. ", " C. ", " D. ", " E. ", " F. "
  // or " A ", " B ", " C "
  
  const optionsStartIndex = normBlock.search(/\s[A-F]\./);
  
  if (optionsStartIndex === -1) {
    console.error(`Could not find options in block ${idx + 1}: ${normBlock}`);
    return;
  }
  
  // Remove the "1- " or "11. " prefix from enunciado
  let enunciado = normBlock.substring(0, optionsStartIndex).trim();
  enunciado = enunciado.replace(/^\d+[-\.]\s*/, '').trim();
  
  const optionsText = normBlock.substring(optionsStartIndex).trim();
  
  const options = [];
  const keys = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    
    const keyRegex = new RegExp(`(^|\\s)${key}\\.\\s`);
    const match = optionsText.match(keyRegex);
    
    if (match && match.index !== undefined) {
      const start = match.index + match[0].length;
      let end = optionsText.length;
      
      if (nextKey) {
        const nextKeyRegex = new RegExp(`(^|\\s)${nextKey}\\.\\s`);
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
  
  const correctAnswer = answersStr[idx];
  
  parsedQuestions.push({
    id: `q-mqgt-${idx + 1}`,
    enunciado: enunciado,
    tipo: 'unica',
    opciones: options,
    respuestaCorrecta: correctAnswer ? [correctAnswer.toLowerCase()] : [],
  });
});

console.log(`Parsed ${parsedQuestions.length} questions successfully.`);

// Load subjects.json and append the new subject
let subjectsData = [];
if (fs.existsSync(subjectsPath)) {
  const parsed = JSON.parse(fs.readFileSync(subjectsPath, 'utf8'));
  subjectsData = Array.isArray(parsed) ? parsed : (parsed.asignaturas || []);
}

const newSubject = {
  id: 'sub-mqgt',
  nombre: 'MQGT',
  tests: [
    {
      id: 'test-mqgt-1',
      titulo: 'Primer Parcial MQGT',
      descripcion: 'Test del primer parcial de MQGT',
      preguntas: parsedQuestions
    }
  ]
};

// Check if it already exists, replace it
const existingIndex = subjectsData.findIndex(s => s.id === 'sub-mqgt');
if (existingIndex !== -1) {
  subjectsData[existingIndex] = newSubject;
} else {
  subjectsData.push(newSubject);
}

// Since subjects.json might be an object or array, let's keep it an object with 'asignaturas' if it was originally, or array if it wasn't. Let's just save it as an array to match the API.
// Wait, the API returns the JSON directly. If it's an object, getSubjects() returns an object, which breaks the frontend. Let's force it to be an array.
fs.writeFileSync(subjectsPath, JSON.stringify(subjectsData, null, 2));
console.log('Saved to subjects.json');

