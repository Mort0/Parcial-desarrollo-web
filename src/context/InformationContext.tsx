import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import type { Information } from '../interfaces';
import { informationRepository } from '../respositories/information.repository';

interface InformationContextType {
  registros: Information[];
  empresa: Information | null;
  loading: boolean;
  reload: () => Promise<void>;
}

const InformationContext = createContext<InformationContextType>(
  {} as InformationContextType,
);

export const useInformation = () => useContext(InformationContext);

function normalize(info: Information): Information {
  return {
    ...info,
    mision: info.mision ?? '',
    vision: info.vision ?? '',
  };
}

export function InformationProvider({ children }: { children: ReactNode }) {
  const [registros, setRegistros] = useState<Information[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const data = await informationRepository.getAll();
      setRegistros(data.map(normalize));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const empresa = registros[0] ?? null;

  return (
    <InformationContext.Provider
      value={{ registros, empresa, loading, reload }}
    >
      {children}
    </InformationContext.Provider>
  );
}
