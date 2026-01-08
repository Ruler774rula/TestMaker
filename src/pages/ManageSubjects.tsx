import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/apiService';
import { Asignatura, Test } from '../types';
import { Plus, Trash2, Edit2, ChevronRight, ChevronDown, Save, X } from 'lucide-react';

export const ManageSubjects: React.FC = () => {
  const { asignaturas, setAsignaturas } = useApp();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Local state for editing to avoid immediate global updates before save
  const [localSubjects, setLocalSubjects] = useState<Asignatura[]>([]);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');

  useEffect(() => {
    setLocalSubjects(asignaturas);
  }, [asignaturas]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'git init') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  const handleSaveAll = async () => {
    const success = await ApiService.saveSubjects(localSubjects);
    if (success) {
      setAsignaturas(localSubjects);
      alert('Cambios guardados correctamente');
    } else {
      alert('Error al guardar cambios');
    }
  };

  const handleAddSubject = () => {
    const name = prompt('Nombre de la nueva asignatura:');
    if (!name) return;
    
    const newSubject: Asignatura = {
      id: `sub-${Date.now()}`,
      nombre: name,
      tests: []
    };
    
    setLocalSubjects([...localSubjects, newSubject]);
  };

  const handleDeleteSubject = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta asignatura?')) {
      setLocalSubjects(localSubjects.filter(s => s.id !== id));
    }
  };

  const startEditSubject = (subject: Asignatura) => {
    setEditingSubjectId(subject.id);
    setEditSubjectName(subject.nombre);
  };

  const saveEditSubject = () => {
    setLocalSubjects(localSubjects.map(s => 
      s.id === editingSubjectId ? { ...s, nombre: editSubjectName } : s
    ));
    setEditingSubjectId(null);
  };

  const handleAddTest = (subjectId: string) => {
    const title = prompt('Título del nuevo test:');
    if (!title) return;

    const newTest: Test = {
      id: `test-${Date.now()}`,
      titulo: title,
      descripcion: 'Nuevo test',
      preguntas: []
    };

    setLocalSubjects(localSubjects.map(s => {
      if (s.id === subjectId) {
        return { ...s, tests: [...s.tests, newTest] };
      }
      return s;
    }));
  };

  const handleDeleteTest = (subjectId: string, testId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este test?')) {
      setLocalSubjects(localSubjects.map(s => {
        if (s.id === subjectId) {
          return { ...s, tests: s.tests.filter(t => t.id !== testId) };
        }
        return s;
      }));
    }
  };

  const handleEditTestQuestions = (subjectId: string, testId: string) => {
    // We need to save first to ensure the editor gets the latest data?
    // Or we just navigate and let the editor fetch?
    // Since we are editing local state, we should probably save first or warn.
    // For simplicity, let's auto-save before navigating or require save.
    // Let's auto-save for better UX.
    ApiService.saveSubjects(localSubjects).then(success => {
      if (success) {
        setAsignaturas(localSubjects);
        navigate(`/editor/${subjectId}/${testId}`);
      } else {
        alert('Error al guardar antes de editar preguntas');
      }
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Acceso Restringido</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Introduce la contraseña"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Acceder
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestionar Asignaturas</h1>
        <div className="flex gap-4">
          <button
            onClick={handleAddSubject}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={20} /> Nueva Asignatura
          </button>
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save size={20} /> Guardar Cambios
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {localSubjects.map(subject => (
          <div key={subject.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-4 flex-1">
                <button 
                  onClick={() => setExpandedSubject(expandedSubject === subject.id ? null : subject.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {expandedSubject === subject.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                
                {editingSubjectId === subject.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editSubjectName}
                      onChange={(e) => setEditSubjectName(e.target.value)}
                      className="px-2 py-1 border rounded"
                    />
                    <button onClick={saveEditSubject} className="text-green-600 hover:text-green-700"><CheckIcon /></button>
                    <button onClick={() => setEditingSubjectId(null)} className="text-red-600 hover:text-red-700"><XIcon /></button>
                  </div>
                ) : (
                  <h3 className="text-lg font-semibold">{subject.nombre}</h3>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => startEditSubject(subject)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Editar nombre"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteSubject(subject.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Eliminar asignatura"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {expandedSubject === subject.id && (
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-700">Tests disponibles</h4>
                  <button
                    onClick={() => handleAddTest(subject.id)}
                    className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <Plus size={16} /> Añadir Test
                  </button>
                </div>

                {subject.tests.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No hay tests en esta asignatura.</p>
                ) : (
                  <div className="space-y-2">
                    {subject.tests.map(test => (
                      <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                          <p className="font-medium">{test.titulo}</p>
                          <p className="text-sm text-gray-500">{test.preguntas.length} preguntas</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTestQuestions(subject.id, test.id)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Editar Preguntas
                          </button>
                          <button
                            onClick={() => handleDeleteTest(subject.id, test.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
