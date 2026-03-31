import api from "./api";

export interface UploadResponse {
  url: string;
  path: string;
}

const uploadService = {
  uploadFoto: (funcionarioId: number, file: File) => {
    const formData = new FormData();
    formData.append("foto", file);
    return api.post<{ data: UploadResponse }>(`v1/funcionarios/${funcionarioId}/foto`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadDocumento: (funcionarioId: number, file: File, tipo: string) => {
    const formData = new FormData();
    formData.append("documento", file);
    formData.append("tipo", tipo);
    return api.post<{ data: UploadResponse }>(`v1/funcionarios/${funcionarioId}/documentos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getDocumentos: (funcionarioId: number) => api.get<{ data: any[] }>(`v1/funcionarios/${funcionarioId}/documentos`),
  deleteDocumento: (funcionarioId: number, documentoId: number) =>
    api.delete(`/v1/funcionarios/${funcionarioId}/documentos/${documentoId}`),
};

export { uploadService };