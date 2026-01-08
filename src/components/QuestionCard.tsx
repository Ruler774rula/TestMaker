import React from 'react';
import { Pregunta } from '../types';
import { Check, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface QuestionCardProps {
  question: Pregunta;
  selectedAnswers: string[];
  onAnswerChange: (answerIds: string[]) => void;
  showFeedback?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswers,
  onAnswerChange,
  showFeedback = false,
}) => {
  const isMultiple = question.tipo === 'multiple';

  const handleOptionClick = (optionId: string) => {
    if (showFeedback) return; // Prevent changing answer if feedback is shown

    if (isMultiple) {
      if (selectedAnswers.includes(optionId)) {
        onAnswerChange(selectedAnswers.filter(id => id !== optionId));
      } else {
        onAnswerChange([...selectedAnswers, optionId]);
      }
    } else {
      onAnswerChange([optionId]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        {question.enunciado}
      </h3>

      {question.imagenUrl && (
        <div className="mb-4">
          <img 
            src={question.imagenUrl} 
            alt="Imagen de la pregunta" 
            className="max-w-full h-auto rounded-lg shadow-sm mx-auto"
          />
        </div>
      )}

      <div className="space-y-3">
        {question.opciones.map((option) => {
          const isSelected = selectedAnswers.includes(option.id);
          const isCorrect = question.respuestaCorrecta.includes(option.id);
          
          let optionClass = "w-full p-4 text-left border rounded-lg transition-all flex items-center justify-between group hover:shadow-sm";
          
          if (showFeedback) {
            if (isCorrect) {
              optionClass = twMerge(optionClass, "bg-green-50 border-green-500 text-green-900");
            } else if (isSelected && !isCorrect) {
              optionClass = twMerge(optionClass, "bg-red-50 border-red-500 text-red-900");
            } else {
              optionClass = twMerge(optionClass, "bg-gray-50 border-gray-200 text-gray-500");
            }
          } else {
            if (isSelected) {
              optionClass = twMerge(optionClass, "bg-blue-50 border-blue-500 text-blue-900 shadow-sm");
            } else {
              optionClass = twMerge(optionClass, "hover:bg-gray-50 border-gray-200");
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              disabled={showFeedback}
              className={optionClass}
            >
              <div className="flex items-center">
                <div className={clsx(
                  "flex items-center justify-center w-6 h-6 mr-3 border rounded-full transition-colors",
                  isMultiple ? "rounded" : "rounded-full",
                  isSelected 
                    ? (showFeedback 
                        ? (isCorrect ? "bg-green-500 border-green-500" : "bg-red-500 border-red-500")
                        : "bg-blue-500 border-blue-500")
                    : "border-gray-300"
                )}>
                  {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                </div>
                <span className="text-lg">{option.texto}</span>
              </div>
              
              {showFeedback && (
                <div>
                  {isCorrect && <Check className="w-5 h-5 text-green-600" />}
                  {isSelected && !isCorrect && <X className="w-5 h-5 text-red-600" />}
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {showFeedback && question.explicacion && (
        <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-md">
          <p className="font-semibold">Explicación:</p>
          <p>{question.explicacion}</p>
        </div>
      )}
    </div>
  );
};
