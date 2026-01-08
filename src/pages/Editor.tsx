import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/apiService';
import { Pregunta, Opcion } from '../types';
import { Save, Plus, Trash2, Image as ImageIcon, ArrowLeft, Check, Edit2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const Editor: React.FC = () => {
  const { subjectId } = useParams();
  const [questions, setQuestions] = useState<Pregunta[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [newBlockName, setNewBlockName] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const data = await ApiService.getQuestions();
    
    // Assign blocks if missing (legacy data)
    // Assume 10 questions per block for initial assignment if no block property
    const processedData = data.map((q, idx) => {
        if (!q.bloque) {
            const blockNum = Math.floor(idx / 10) + 1;
            return { ...q, bloque: `Bloque ${blockNum}` };
        }
        return q;
    });
    
    setQuestions(processedData);
    
    // Extract unique blocks
    const uniqueBlocks = Array.from(new Set(processedData.map(q => q.bloque || 'General')));
    setBlocks(uniqueBlocks);
    if (uniqueBlocks.length > 0) setSelectedBlock(uniqueBlocks[0]);
  };

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = async () => {
    // Validate
    for (const q of questions) {
        if (!q.enunciado.trim()) {
            showNotification(`La pregunta ${q.id} no tiene enunciado`, 'error');
            return;
        }
        if (q.opciones.length < 2) {
            showNotification(`La pregunta ${q.id} debe tener al menos 2 opciones`, 'error');
            return;
        }
        if (q.respuestaCorrecta.length === 0) {
            showNotification(`La pregunta ${q.id} no tiene respuesta correcta`, 'error');
            return;
        }
    }

    const success = await ApiService.saveQuestions(questions);
    if (success) {
        setIsDirty(false);
        showNotification('Cambios guardados correctamente (Backup creado)', 'success');
    } else {
        showNotification('Error al guardar cambios', 'error');
    }
  };

  const handleAddQuestion = () => {
    if (!selectedBlock) return;
    
    const newId = `q-${Date.now()}`;
    const newQuestion: Pregunta = {
        id: newId,
        enunciado: 'Nueva pregunta',
        tipo: 'unica',
        opciones: [
            { id: 'a', texto: 'Opción A' },
            { id: 'b', texto: 'Opción B' }
        ],
        respuestaCorrecta: ['a'],
        bloque: selectedBlock
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestionId(newId);
    setIsDirty(true);
  };

  const handleAddBlock = () => {
    const name = prompt('Nombre del nuevo bloque:');
    if (name) {
        if (blocks.includes(name)) {
            showNotification('El nombre del bloque ya existe', 'error');
            return;
        }
        setBlocks([...blocks, name]);
        setSelectedBlock(name);
    }
  };

  const handleRenameBlock = (oldName: string) => {
    setEditingBlock(oldName);
    setNewBlockName(oldName);
  };

  const confirmRenameBlock = (oldName: string) => {
    if (!newBlockName.trim()) {
        showNotification('El nombre no puede estar vacío', 'error');
        return;
    }
    if (newBlockName !== oldName && blocks.includes(newBlockName)) {
        showNotification('Ya existe un bloque con ese nombre', 'error');
        return;
    }
    
    // Update blocks list
    setBlocks(blocks.map(b => b === oldName ? newBlockName : b));
    
    // Update questions in that block
    setQuestions(questions.map(q => q.bloque === oldName ? { ...q, bloque: newBlockName } : q));
    
    if (selectedBlock === oldName) setSelectedBlock(newBlockName);
    setEditingBlock(null);
    setIsDirty(true);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta pregunta?')) {
        setQuestions(questions.filter(q => q.id !== id));
        if (selectedQuestionId === id) setSelectedQuestionId(null);
        setIsDirty(true);
    }
  };

  const handleUpdateQuestion = (id: string, updates: Partial<Pregunta>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
    setIsDirty(true);
  };

  const handleImageUpload = async (file: File) => {
    if (!selectedQuestionId) return;
    const url = await ApiService.uploadImage(file);
    if (url) {
        handleUpdateQuestion(selectedQuestionId, { imagenUrl: url });
    } else {
        showNotification('Error al subir imagen', 'error');
    }
  };

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);
  const filteredQuestions = questions.filter(q => q.bloque === selectedBlock);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 border-b flex justify-between items-center">
        <div className="flex items-center space-x-4">
            <button onClick={() => navigate(`/subject/${subjectId}`)} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Gestor de Preguntas</h1>
            <span className="text-gray-500 text-sm">{questions.length} preguntas en total</span>
        </div>
        <div className="flex items-center space-x-3">
            <button 
                onClick={handleSave}
                disabled={!isDirty}
                className={`flex items-center px-6 py-2 rounded-lg font-bold text-white transition-colors ${
                    isDirty ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
            </button>
        </div>
      </div>

      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
            {notification.msg}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Blocks Sidebar */}
        <div className="w-64 border-r bg-gray-50 flex flex-col">
            <div className="p-4 border-b">
                <button 
                    onClick={handleAddBlock}
                    className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Bloque
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {blocks.map(block => (
                    <div 
                        key={block}
                        onClick={() => setSelectedBlock(block)}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-100 flex justify-between items-center ${
                            selectedBlock === block ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        }`}
                    >
                        {editingBlock === block ? (
                            <div className="flex items-center w-full space-x-2">
                                <input 
                                    autoFocus
                                    className="w-full p-1 text-sm border rounded"
                                    value={newBlockName}
                                    onChange={(e) => setNewBlockName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') confirmRenameBlock(block);
                                        if (e.key === 'Escape') setEditingBlock(null);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <button onClick={(e) => { e.stopPropagation(); confirmRenameBlock(block); }}>
                                    <Check className="w-4 h-4 text-green-600" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="font-medium text-gray-700 truncate">{block}</span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleRenameBlock(block); }}
                                    className="text-gray-400 hover:text-blue-600 p-1"
                                >
                                    <Edit2 className="w-3 h-3" />
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Questions List */}
        <div className="w-80 border-r bg-white flex flex-col">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">{selectedBlock}</h3>
                <button 
                    onClick={handleAddQuestion}
                    className="p-1 hover:bg-gray-200 rounded text-blue-600"
                    title="Añadir pregunta a este bloque"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredQuestions.length === 0 ? (
                    <p className="text-gray-400 text-center p-4">No hay preguntas en este bloque</p>
                ) : (
                    filteredQuestions.map((q, idx) => (
                        <div 
                            key={q.id}
                            onClick={() => setSelectedQuestionId(q.id)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                                selectedQuestionId === q.id ? 'bg-blue-50' : ''
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-gray-500 mr-2">#{idx + 1}</span>
                                <p className="text-sm text-gray-800 line-clamp-2 flex-1">{q.enunciado}</p>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
                                    className="text-gray-400 hover:text-red-600 ml-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
            {selectedQuestion ? (
                <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm p-8 space-y-6">
                    {/* Enunciado */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enunciado</label>
                        <textarea 
                            value={selectedQuestion.enunciado}
                            onChange={(e) => handleUpdateQuestion(selectedQuestion.id, { enunciado: e.target.value })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                        />
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
                        <div className="flex items-start space-x-4">
                            {selectedQuestion.imagenUrl && (
                                <img 
                                    src={selectedQuestion.imagenUrl} 
                                    alt="Preview" 
                                    className="h-32 w-auto object-contain border rounded-lg"
                                />
                            )}
                            <div className="flex-1">
                                <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <ImageIcon className="w-5 h-5 mr-2 text-gray-500" />
                                    <span>Subir Imagen</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                        if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                                    }} />
                                </label>
                                {selectedQuestion.imagenUrl && (
                                    <button 
                                        onClick={() => handleUpdateQuestion(selectedQuestion.id, { imagenUrl: undefined })}
                                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                                    >
                                        Eliminar imagen
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Opciones</label>
                            <button 
                                onClick={() => {
                                    const nextId = String.fromCharCode(97 + selectedQuestion.opciones.length); // a, b, c...
                                    const newOpt = { id: nextId, texto: '' };
                                    handleUpdateQuestion(selectedQuestion.id, { opciones: [...selectedQuestion.opciones, newOpt] });
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                + Añadir Opción
                            </button>
                        </div>
                        <div className="space-y-3">
                            {selectedQuestion.opciones.map((opt, idx) => (
                                <div key={idx} className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                                        selectedQuestion.respuestaCorrecta.includes(opt.id) 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {opt.id}
                                    </div>
                                    <input 
                                        type="text" 
                                        value={opt.texto}
                                        onChange={(e) => {
                                            const newOpts = [...selectedQuestion.opciones];
                                            newOpts[idx] = { ...opt, texto: e.target.value };
                                            handleUpdateQuestion(selectedQuestion.id, { opciones: newOpts });
                                        }}
                                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button 
                                        onClick={() => {
                                            const newCorrect = selectedQuestion.respuestaCorrecta.includes(opt.id)
                                                ? [] // Only one correct allowed in UI for now
                                                : [opt.id];
                                            handleUpdateQuestion(selectedQuestion.id, { respuestaCorrecta: newCorrect });
                                        }}
                                        className={`p-2 rounded-full ${
                                            selectedQuestion.respuestaCorrecta.includes(opt.id)
                                                ? 'text-green-600 bg-green-50'
                                                : 'text-gray-400 hover:bg-gray-100'
                                        }`}
                                        title="Marcar como correcta"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const newOpts = selectedQuestion.opciones.filter((_, i) => i !== idx);
                                            handleUpdateQuestion(selectedQuestion.id, { opciones: newOpts });
                                        }}
                                        className="text-gray-400 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <p className="text-xl">Selecciona una pregunta para editar</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
