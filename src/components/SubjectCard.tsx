import React from 'react';
import { Asignatura } from '../types';
import { BookOpen, ChevronRight } from 'lucide-react';

interface SubjectCardProps {
  subject: Asignatura;
  onClick: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
              {subject.nombre}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {subject.tests.length} {subject.tests.length === 1 ? 'test disponible' : 'tests disponibles'}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};
