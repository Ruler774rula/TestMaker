import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Pregunta } from '../types';

interface BlockSectionProps {
  blockName: string;
  questions: Pregunta[];
}

const BlockSection: React.FC<BlockSectionProps> = ({ blockName, questions }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden border-gray-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center space-x-3">
          {isOpen ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-sm mr-2 text-gray-600 font-medium shadow-sm">Bloque</span>
            {blockName}
          </h3>
        </div>
        <span className="text-sm text-gray-500 font-medium bg-white px-2 py-1 rounded-full border border-gray-200">
          {questions.length} preguntas
        </span>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-white border-t border-gray-200 space-y-6 animate-in slide-in-from-top-2 duration-200">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-gray-50 rounded-lg p-5 border border-gray-100">
              <div className="flex space-x-3">
                <span className="flex-shrink-0 w-8 h-8 bg-white border border-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </span>
                <div className="flex-1 space-y-3">
                  <p className="font-medium text-gray-900">{q.enunciado}</p>
                  
                  {q.imagenUrl && (
                    <img 
                      src={q.imagenUrl} 
                      alt="Pregunta" 
                      className="max-w-full h-auto rounded-lg border border-gray-200 my-3"
                    />
                  )}

                  <div className="space-y-2">
                    {q.opciones.map(opt => {
                      const isCorrect = q.respuestaCorrecta.includes(opt.id);
                      return (
                        <div 
                          key={opt.id}
                          className={clsx(
                            "p-3 rounded-lg border text-sm flex justify-between items-center transition-colors",
                            isCorrect 
                              ? "bg-green-50 border-green-200 text-green-800 font-medium" 
                              : "bg-white border-gray-200 text-gray-600"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={clsx(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs border",
                              isCorrect ? "border-green-300 bg-green-100 text-green-700" : "border-gray-300 bg-gray-50"
                            )}>
                              {opt.id}
                            </span>
                            <span>{opt.texto}</span>
                          </div>
                          {isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explicacion && (
                    <div className="mt-3 text-sm bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100">
                      <span className="font-semibold">Explicación:</span> {q.explicacion}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SubjectAnswers: React.FC = () => {
  const { asignaturas } = useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const subject = asignaturas.find(s => s.id === id);

  useEffect(() => {
    if (!subject && asignaturas.length > 0) {
      navigate('/');
    }
  }, [subject, asignaturas, navigate]);

  if (!subject) return null;

  // Helper to group questions by block
  const groupQuestionsByBlock = (questions: Pregunta[]) => {
    const groups: Record<string, Pregunta[]> = {};
    questions.forEach(q => {
      const block = q.bloque || 'General';
      if (!groups[block]) {
        groups[block] = [];
      }
      groups[block].push(q);
    });
    return groups;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="space-y-4">
        <button 
          onClick={() => navigate(`/subject/${id}`)}
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a {subject.nombre}
        </button>
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Respuestas y Soluciones</h1>
        </div>
        <p className="text-gray-600">
          Visualiza todas las preguntas, opciones y respuestas correctas de los tests disponibles.
          Haz clic en los bloques para desplegar las preguntas.
        </p>
      </div>

      <div className="space-y-12">
        {subject.tests.map(test => {
          const groupedQuestions = groupQuestionsByBlock(test.preguntas);
          const blockNames = Object.keys(groupedQuestions).sort();

          return (
            <div key={test.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-white p-6 border-b border-gray-200 flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{test.titulo}</h2>
                  <p className="text-sm text-gray-500">{test.preguntas.length} preguntas en total</p>
                </div>
              </div>

              <div className="p-6 space-y-4 bg-gray-50">
                {blockNames.map(blockName => (
                  <BlockSection 
                    key={blockName} 
                    blockName={blockName} 
                    questions={groupedQuestions[blockName]} 
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
