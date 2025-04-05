import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/page-header';
import FileExplorer from '@/components/files/FileExplorer';

export default function FilesPage() {
  return (
    <>
      <Helmet>
        <title>Archivos | Efectivio</title>
      </Helmet>
      
      <PageHeader
        title="Sistema de Archivos"
        description="Organiza tus documentos en carpetas estructuradas"
      />

      <div className="px-4 py-6 mb-8 bg-white rounded-lg shadow-sm">
        <FileExplorer />
      </div>
    </>
  );
}