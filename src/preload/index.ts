import { contextBridge, ipcRenderer } from 'electron'

// The only bridge between UI and the system side.
// Every main-process capability the UI needs gets an explicit method here.
const api = {
  ping: (): Promise<string> => ipcRenderer.invoke('app:ping')
}

contextBridge.exposeInMainWorld('api', api)
