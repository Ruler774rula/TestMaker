import React from 'react';
import { ExternalLink } from 'lucide-react';

export const ManageSubjects: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Contenido</h1>
        <p className="text-lg text-gray-600">
          La gestión de asignaturas y tests se realiza ahora a través del panel de administración seguro.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">¿Cómo editar?</h2>
          <p className="text-blue-800 mb-6">
            Para añadir, editar o borrar asignaturas y tests, accede al CMS (Content Management System).
            Allí podrás iniciar sesión con tu cuenta y los cambios se guardarán directamente en el repositorio.
          </p>
          
          <a 
            href="/admin/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
          >
            Ir al Panel de Administración (CMS)
            <ExternalLink size={20} />
          </a>
        </div>

        <div className="text-sm text-gray-500 text-left bg-gray-50 p-4 rounded border">
          <p className="font-semibold mb-1">Nota sobre los cambios:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Al guardar cambios en el CMS, se creará un nuevo "commit" en GitHub.</li>
            <li>Netlify detectará el cambio y reconstruirá la web automáticamente.</li>
            <li>El proceso puede tardar 1-2 minutos en reflejarse en la web pública.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

