import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Settings, Play, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';

export const TestConfig: React.FC = () => {
  const { currentTest, testConfig, updateTestConfig, startTest } = useApp();
  const navigate = useNavigate();
  const { testId } = useParams();

  useEffect(() => {
    if (!currentTest && testId) {
       navigate('/');
    }
  }, [currentTest, testId, navigate]);

  if (!currentTest) return null;

  const handleStart = () => {
    // Validate if block mode and no blocks selected
    if (testConfig.modoBloques && testConfig.bloquesSeleccionados.length === 0) {
        alert("Por favor selecciona al menos un bloque.");
        return;
    }
    startTest();
    navigate('/runner');
  };

  const maxQuestions = currentTest.preguntas.length;
  
  // Calculate blocks
  // Check if questions have 'bloque' property
  const hasNamedBlocks = currentTest.preguntas.some(q => q.bloque);
  
  let availableBlocks: { id: number, name: string }[] = [];
  
  if (hasNamedBlocks) {
      // Extract unique block names in order of appearance
      const uniqueNames = Array.from(new Set(currentTest.preguntas.map(q => q.bloque).filter(Boolean))) as string[];
      availableBlocks = uniqueNames.map((name, index) => ({
          id: index + 1,
          name: name
      }));
  } else {
      // Fallback to 10 questions per block
      const totalBlocks = Math.ceil(maxQuestions / 10);
      availableBlocks = Array.from({ length: totalBlocks }, (_, i) => ({
          id: i + 1,
          name: `Bloque ${i + 1} (10 preguntas)`
      }));
  }

  const toggleBlock = (blockId: number) => {
    const current = testConfig.bloquesSeleccionados;
    if (current.includes(blockId)) {
        updateTestConfig({ bloquesSeleccionados: current.filter(b => b !== blockId) });
    } else {
        updateTestConfig({ bloquesSeleccionados: [...current, blockId] });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentTest.titulo}</h1>
          <p className="text-gray-500">{currentTest.descripcion || 'Configura tu test antes de empezar.'}</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Mode Selection */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center text-gray-800">
              <Settings className="w-5 h-5 mr-2 text-gray-400" />
              Configuración
            </h3>
            
            {/* Mode Switcher */}
            <div className="flex p-1 bg-gray-100 rounded-lg">
                <button
                    onClick={() => updateTestConfig({ modoBloques: false, modoInfinito: false })}
                    className={clsx(
                        "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                        !testConfig.modoBloques ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    Por Preguntas
                </button>
                <button
                    onClick={() => updateTestConfig({ modoBloques: true })}
                    className={clsx(
                        "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                        testConfig.modoBloques ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    Por Bloques
                </button>
            </div>

            <div className="space-y-4">
              
              {!testConfig.modoBloques ? (
                  /* Question Mode Options */
                  <>
                    <label className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <span className="font-medium text-gray-700">Modo Infinito (Preguntas aleatorias sin fin)</span>
                        <input 
                        type="checkbox"
                        checked={testConfig.modoInfinito}
                        onChange={(e) => updateTestConfig({ modoInfinito: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                    </label>

                    <div className={clsx("space-y-2 transition-opacity", testConfig.modoInfinito && "opacity-50 pointer-events-none")}>
                        <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Número de preguntas</span>
                        <span className="text-blue-600 font-bold">{testConfig.numPreguntas}</span>
                        </div>
                        <input 
                        type="range" 
                        min="5" 
                        max={maxQuestions} 
                        step="5"
                        value={testConfig.numPreguntas}
                        onChange={(e) => updateTestConfig({ numPreguntas: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                        <span>5</span>
                        <span>{maxQuestions}</span>
                        </div>
                    </div>
                  </>
              ) : (
                  /* Block Mode Options */
                  <div className="space-y-3">
                      <p className="font-medium text-gray-700">
                          {hasNamedBlocks ? "Selecciona los temas:" : "Selecciona los bloques (10 preguntas cada uno):"}
                      </p>
                      <div className={clsx("grid gap-3", hasNamedBlocks ? "grid-cols-1" : "grid-cols-2")}>
                          {availableBlocks.map(block => (
                              <button
                                key={block.id}
                                onClick={() => toggleBlock(block.id)}
                                className={clsx(
                                    "p-3 rounded-lg border text-left transition-all",
                                    testConfig.bloquesSeleccionados.includes(block.id)
                                        ? "bg-blue-50 border-blue-500 text-blue-700 font-medium"
                                        : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600"
                                )}
                              >
                                  {block.name}
                              </button>
                          ))}
                      </div>
                  </div>
              )}

              <label className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors mt-6">
                <span className="font-medium text-gray-700">Mostrar resultados inmediatos</span>
                <input 
                  type="checkbox"
                  checked={testConfig.mostrarResultadosInmediatos}
                  onChange={(e) => updateTestConfig({ mostrarResultadosInmediatos: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.02] flex items-center justify-center"
          >
            <Play className="w-6 h-6 mr-2" />
            Comenzar Test
          </button>
        </div>
      </div>
    </div>
  );
};
