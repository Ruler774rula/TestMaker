import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SubjectCard } from '../components/SubjectCard';
import { useNavigate } from 'react-router-dom';
import { TestService } from '../services/TestService';
import { Settings } from 'lucide-react';

export const Home: React.FC = () => {
  const { asignaturas, setAsignaturas, selectSubject } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
        const data = await TestService.getInitialData();
        setAsignaturas(data);
    };
    loadData();
  }, [setAsignaturas]);

  const handleSubjectClick = (id: string) => {
    selectSubject(id);
    navigate(`/subject/${id}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Selecciona una Asignatura</h1>
            <p className="text-gray-500">Elige una materia para ver los tests disponibles</p>
        </div>
        <button 
            onClick={() => navigate('/manage-subjects')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
            <Settings size={20} />
            Gestionar Asignaturas
        </button>
      </div>

      {asignaturas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">No hay asignaturas disponibles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {asignaturas.map(subject => (
            <SubjectCard 
              key={subject.id} 
              subject={subject} 
              onClick={() => handleSubjectClick(subject.id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
