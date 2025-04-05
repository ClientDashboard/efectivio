import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/page-header';
import FileExplorer from '@/components/files/FileExplorer';

export default function FilesPage() {
  return (
    <>
      <Helmet>
        <title>Efectivio Drive | Efectivio</title>
      </Helmet>
      
      <PageHeader
        title="Efectivio Drive"
        description="Almacena, organiza y comparte archivos en la nube de manera fácil y segura"
      />

      <div className="px-4 py-6 mb-8 bg-white rounded-lg shadow-sm">
        <FileExplorer />
      </div>
    </>
  );
}