/**
 * Mission Control Dashboard Preload Script
 * Provides secure IPC bridge for Mission Control window
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose secure API to Mission Control window
contextBridge.exposeInMainWorld('missionControlAPI', {
  // Request initial agents
  getInitialAgents: () => {
    ipcRenderer.send('get-mission-control-agents');
    return new Promise(resolve => {
      const listener = (event, data) => {
        ipcRenderer.removeListener('mission-control-agents-response', listener);
        resolve(data);
      };
      ipcRenderer.on('mission-control-agents-response', listener);
    });
  },

  // Get auth token (legacy, not used anymore)
  getAuthToken: () => '',

  // Get source (legacy, not used anymore)
  getSource: () => 'pixel-agent-desk',

  // Listen for initial data
  onInitialData: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('mission-control-initial-data', listener);
    return () => ipcRenderer.removeListener('mission-control-initial-data', listener);
  },

  // Agent event listeners
  onAgentAdded: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('mission-agent-added', listener);
    return () => ipcRenderer.removeListener('mission-agent-added', listener);
  },

  onAgentUpdated: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('mission-agent-updated', listener);
    return () => ipcRenderer.removeListener('mission-agent-updated', listener);
  },

  onAgentRemoved: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('mission-agent-removed', listener);
    return () => ipcRenderer.removeListener('mission-agent-removed', listener);
  },

  // Send commands to Pixel Agent Desk
  focusAgent: (agentId) => {
    console.log('[MissionControlAPI] Focusing agent:', agentId);
    ipcRenderer.send('mission-focus-agent', agentId);
  },

  dismissAgent: (agentId) => {
    console.log('[MissionControlAPI] Dismissing agent:', agentId);
    ipcRenderer.send('mission-dismiss-agent', agentId);
  }
});

console.log('[MissionControlPreload] Initialized');
