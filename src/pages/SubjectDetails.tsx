import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, ArrowLeft, Settings } from 'lucide-react';

export const SubjectDetails: React.FC = () => {
  const { currentSubject, selectTest } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();

  // Redirect if no subject selected (e.g. refresh)
  // In a real app we would load by ID from service
  useEffect(() => {
    if (!currentSubject && id) {
       // Logic to reload subject could go here, for now redirect home
       navigate('/');
    }
  }, [currentSubject, id, navigate]);

  if (!currentSubject) return null;

  const handleTestClick = (testId: string) => {
    selectTest(testId);
    navigate(`/config/${testId}`);
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Asignaturas
      </button>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">{currentSubject.nombre}</h1>
            <button 
                onClick={() => navigate(`/editor/${currentSubject.id}`)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
                <Settings className="w-5 h-5 mr-2" />
                Gestionar Preguntas
            </button>
        </div>
        <p className="text-gray-500">Selecciona un test para comenzar</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {currentSubject.tests.map(test => (
          <div 
            key={test.id}
            onClick={() => handleTestClick(test.id)}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{test.titulo}</h3>
                <p className="text-sm text-gray-500">{test.preguntas.length} preguntas</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-gray-50 text-gray-600 rounded-full text-sm font-medium group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              Iniciar
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
