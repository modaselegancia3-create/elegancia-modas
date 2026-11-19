import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { buscarConfig, CONFIG_PADRAO, type Config } from '../lib/config'

type Ctx = { config: Config; carregada: boolean; recarregar: () => Promise<void> }
const ConfigCtx = createContext<Ctx>({ config: CONFIG_PADRAO, carregada: false, recarregar: async () => {} })

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config>(CONFIG_PADRAO)
  const [carregada, setCarregada] = useState(false)
  async function recarregar() {
    setConfig(await buscarConfig())
    setCarregada(true)
  }
  useEffect(() => {
    recarregar()
  }, [])
  return <ConfigCtx.Provider value={{ config, carregada, recarregar }}>{children}</ConfigCtx.Provider>
}

export const useConfig = () => useContext(ConfigCtx)
