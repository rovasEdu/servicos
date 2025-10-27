import React, { useRef } from 'react';
import { Provider } from '../types';
import { ChevronLeft, Upload, Download } from 'lucide-react';

interface SettingsProps {
  onImport: (providers: Provider[], mode: 'replace' | 'merge') => void;
  onExport: () => string;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onImport, onExport, onBack }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = onExport();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'service_providers_backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>, mode: 'replace' | 'merge') => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = e => {
            if (e.target?.result) {
                try {
                    const importedProviders: Provider[] = JSON.parse(e.target.result as string);
                    onImport(importedProviders, mode);
                    alert(`Base de dados importada com sucesso (${mode === 'replace' ? 'substituída' : 'combinada'})!`);
                } catch (error) {
                    alert("Erro ao ler o arquivo. Verifique se é um JSON válido.");
                    console.error("Import error:", error);
                }
            }
        };
    }
     if (event.target) event.target.value = '';
  };

  return (
    <div className="p-4">
      <div className="relative flex items-center justify-center mb-6">
        <button onClick={onBack} className="absolute left-0 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <ChevronLeft className="w-6 h-6 text-primary dark:text-accent" />
        </button>
        <h1 className="text-base font-bold text-primary dark:text-accent uppercase text-center">Ajustes</h1>
      </div>

      <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div>
          <h2 className="text-xl font-semibold mb-2">Exportar Dados</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Salve uma cópia de segurança de todos os seus prestadores em um arquivo JSON.</p>
          <button onClick={handleExport} className="w-full flex items-center justify-center px-4 py-2 bg-secondary text-white rounded-md hover:bg-dark transition-colors">
            <Download className="w-5 h-5 mr-2" />
            Exportar Base de Dados
          </button>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-2">Importar Dados</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Importe prestadores de um arquivo JSON. Você pode substituir a base atual ou combinar com a existente.</p>
          <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={(e) => handleImport(e, 'merge')} />
          <input type="file" accept=".json" className="hidden" id="import-replace" onChange={(e) => handleImport(e, 'replace')} />

          <div className="flex space-x-4">
             <label htmlFor="import-replace" className="cursor-pointer w-full flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                <Upload className="w-5 h-5 mr-2" />
                Substituir
            </label>
             <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                <Upload className="w-5 h-5 mr-2" />
                Combinar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;