import api from "./api";

export const rubricasService = {
  list: (params?: { tipo?: string; categoria?: string }) => 
    api.get("/v1/rubricas", { params }),
  
  get: (id: number) => api.get(`/v1/rubricas/${id}`),
  
  create: (data: { codigo: string; nome: string; tipo: string; categoria?: string }) =>
    api.post("/v1/rubricas", data),
  
  update: (id: number, data: unknown) => api.put(`/v1/rubricas/${id}`, data),
  
  delete: (id: number) => api.delete(`/v1/rubricas/${id}`),
  
  createVersao: (data: {
    rubrica_id: number;
    afecta_ferias: boolean;
    metodo_calculo: string;
    formula_calculo?: string;
    data_inicio_vigencia: string;
  }) => api.post("/v1/rubricas/versoes", data),
};