import { useQuery } from '@tanstack/react-query';
import { funcionariosService } from '../services/funcionarios';

export const useEmployees = (filters: any) => {
  return useQuery({
    queryKey: ['funcionarios', filters],
    queryFn: () => funcionariosService.list(filters),
    select: (res) => res.data.data,
    staleTime: 1000 * 60 * 5,
  });
};