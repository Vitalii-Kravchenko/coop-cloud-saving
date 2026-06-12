import { contextBridge, ipcRenderer } from 'electron'
import type { AuthState, DeviceCodePrompt } from '../shared/auth'

// The only bridge between UI and the system side.
// Every main-process capability the UI needs gets an explicit method here.
const api = {
  auth: {
    getState: (): Promise<AuthState> => ipcRenderer.invoke('auth:get-state'),
    startLogin: (): Promise<DeviceCodePrompt> => ipcRenderer.invoke('auth:start-login'),
    logout: (): Promise<void> => ipcRenderer.invoke('auth:logout'),
    onChanged: (callback: (state: AuthState) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, state: AuthState): void =>
        callback(state)
      ipcRenderer.on('auth:changed', listener)
      return () => ipcRenderer.removeListener('auth:changed', listener)
    }
  }
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
