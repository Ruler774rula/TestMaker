import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Home, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Pregunta } from '../types';

export const Results: React.FC = () => {
  const { resultados, currentTest, currentSubject, resetTest } = useApp();
  const navigate = useNavigate();

  // Get latest result
  const latestResult = resultados[0];

  useEffect(() => {
    if (!latestResult) {
      navigate('/');
    }
  }, [latestResult, navigate]);

  if (!latestResult || !currentTest) return null;

  const percentage = Math.round((latestResult.aciertos / latestResult.totalPreguntas) * 100);
  const isPass = percentage >= 50;

  const handleRetry = () => {
    resetTest();
    navigate('/runner'); // Or config? Runner re-uses current config.
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Resultados del Test</h1>
        <p className="text-xl text-gray-600">{latestResult.testTitulo}</p>
        {latestResult.totalPreguntas > 100 && (
             <p className="text-sm text-yellow-600">Modo Infinito (Mostrando resumen)</p>
        )}
      </div>

      {/* Score Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col items-center justify-center space-y-6">
        <div className={clsx(
          "w-40 h-40 rounded-full flex items-center justify-center border-8 text-5xl font-bold",
          isPass ? "border-green-100 text-green-600 bg-green-50" : "border-red-100 text-red-600 bg-red-50"
        )}>
          {percentage}%
        </div>
        
        <div className="grid grid-cols-3 gap-8 w-full max-w-lg text-center">
          <div>
            <p className="text-gray-500 text-sm uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-gray-900">{latestResult.totalPreguntas}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm uppercase tracking-wide">Aciertos</p>
            <p className="text-2xl font-bold text-green-600">{latestResult.aciertos}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm uppercase tracking-wide">Fallos</p>
            <p className="text-2xl font-bold text-red-600">{latestResult.totalPreguntas - latestResult.aciertos}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleHome}
          className="flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
        >
          <Home className="w-5 h-5 mr-2" />
          Volver al Inicio
        </button>
        <button
          onClick={handleRetry}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md font-bold transition-transform hover:scale-105"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Repetir Test
        </button>
      </div>

      {/* Incorrect Answers Review */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Revisión de Respuestas</h2>
        
        {(latestResult.preguntasIds || [])
          .map(id => currentTest.preguntas.find(q => q.id === id))
          .filter((q): q is Pregunta => !!q)
          .map((q, idx) => {
           const userAns = latestResult.respuestasUsuario[q.id] || [];
           const isCorrect = userAns.length === q.respuestaCorrecta.length && userAns.every(id => q.respuestaCorrecta.includes(id));
           
           return (
             <div key={q.id} className={clsx(
               "bg-white p-6 rounded-xl border transition-all",
               isCorrect ? "border-green-200 shadow-sm" : "border-red-200 shadow-md"
             )}>
               <div className="flex items-start space-x-3 mb-4">
                 <div className={clsx(
                   "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold",
                   isCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                 )}>
                   {idx + 1}
                 </div>
                 <h3 className="text-lg font-medium text-gray-800">{q.enunciado}</h3>
               </div>

               <div className="space-y-2 ml-11">
                 {q.opciones.map(opt => {
                   const isSelected = userAns.includes(opt.id);
                   const isRight = q.respuestaCorrecta.includes(opt.id);
                   
                   let itemClass = "p-3 rounded-lg border text-sm flex justify-between items-center ";
                   
                   if (isRight) {
                     itemClass += "bg-green-50 border-green-200 text-green-800 font-medium";
                   } else if (isSelected && !isRight) {
                     itemClass += "bg-red-50 border-red-200 text-red-800";
                   } else {
                     itemClass += "bg-gray-50 border-gray-100 text-gray-500";
                   }

                   return (
                     <div key={opt.id} className={itemClass}>
                       <span>{opt.texto}</span>
                       <div className="flex items-center space-x-2">
                         {isSelected && <span className="text-xs uppercase font-bold tracking-wider">Tu respuesta</span>}
                         {isRight && <CheckCircle className="w-4 h-4 text-green-600" />}
                         {isSelected && !isRight && <AlertCircle className="w-4 h-4 text-red-600" />}
                       </div>
                     </div>
                   );
                 })}
               </div>
               
               {!isCorrect && q.explicacion && (
                 <div className="mt-4 ml-11 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
                   <span className="font-bold">Explicación:</span> {q.explicacion}
                 </div>
               )}
             </div>
           );
        })}
      </div>
    </div>
  );
};
