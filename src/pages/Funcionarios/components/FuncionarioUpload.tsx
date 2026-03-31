import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { uploadService } from "../../../services/upload";
import Button from "../../../components/ui/button/Button";
import { PhotoIcon, DocumentIcon, TrashIcon } from "@heroicons/react/24/outline";

interface FuncionarioUploadProps {
  funcionarioId: number;
}

const FuncionarioUpload: React.FC<FuncionarioUploadProps> = ({ funcionarioId }) => {
  const queryClient = useQueryClient();
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);
  const [documentoTipo, setDocumentoTipo] = useState("OUTRO");

  const { data: documentos, isLoading } = useQuery({
    queryKey: ["funcionario-documentos", funcionarioId],
    queryFn: () => uploadService.getDocumentos(funcionarioId),
    enabled: !!funcionarioId,
  });

  const fotoMutation = useMutation({
    mutationFn: (file: File) => uploadService.uploadFoto(funcionarioId, file),
    onSuccess: () => {
      toast.success("Foto atualizada!");
      queryClient.invalidateQueries({ queryKey: ["funcionario", funcionarioId] });
      setFotoFile(null);
    },
    onError: () => toast.error("Erro ao enviar foto"),
  });

  const documentoMutation = useMutation({
    mutationFn: ({ file, tipo }: { file: File; tipo: string }) =>
      uploadService.uploadDocumento(funcionarioId, file, tipo),
    onSuccess: () => {
      toast.success("Documento enviado!");
      queryClient.invalidateQueries({ queryKey: ["funcionario-documentos", funcionarioId] });
      setDocumentoFile(null);
    },
    onError: () => toast.error("Erro ao enviar documento"),
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: number) => uploadService.deleteDocumento(funcionarioId, docId),
    onSuccess: () => {
      toast.success("Documento removido!");
      queryClient.invalidateQueries({ queryKey: ["funcionario-documentos", funcionarioId] });
    },
    onError: () => toast.error("Erro ao remover documento"),
  });

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFotoFile(e.target.files[0]);
    }
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentoFile(e.target.files[0]);
    }
  };

  const handleUploadFoto = () => {
    if (fotoFile) fotoMutation.mutate(fotoFile);
  };

  const handleUploadDocumento = () => {
    if (documentoFile) documentoMutation.mutate({ file: documentoFile, tipo: documentoTipo });
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">Foto do Funcionário</h3>
        <div className="flex items-center gap-4">
          <input type="file" accept="image/*" onChange={handleFotoChange} />
          <Button onClick={handleUploadFoto} disabled={!fotoFile || fotoMutation.isPending} size="sm">
            {fotoMutation.isPending ? "Enviando..." : "Upload Foto"}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">Documentos</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          <select value={documentoTipo} onChange={(e) => setDocumentoTipo(e.target.value)} className="border rounded p-2">
            <option value="BI">Bilhete de Identidade</option>
            <option value="NIF">NIF</option>
            <option value="CONTRATO">Contrato</option>
            <option value="CERTIFICADO">Certificado</option>
            <option value="OUTRO">Outro</option>
          </select>
          <input type="file" onChange={handleDocumentoChange} />
          <Button onClick={handleUploadDocumento} disabled={!documentoFile || documentoMutation.isPending} size="sm">
            {documentoMutation.isPending ? "Enviando..." : "Upload Documento"}
          </Button>
        </div>

        {isLoading ? (
          <p>Carregando documentos...</p>
        ) : (
          <ul className="space-y-2">
            {documentos?.data?.data?.map((doc: any) => (
              <li key={doc.id} className="flex items-center justify-between border-b py-2">
                <div className="flex items-center gap-2">
                  <DocumentIcon className="size-5 text-gray-500" />
                  <span>{doc.tipo}</span>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm">Ver</a>
                </div>
                <button onClick={() => deleteMutation.mutate(doc.id)} className="text-error">
                  <TrashIcon className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FuncionarioUpload;