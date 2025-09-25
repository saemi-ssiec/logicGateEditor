import { create } from 'zustand';
import { CommandManager } from '../commands/CommandManager';
import { Command } from '../commands/commandTypes';

interface CommandStore {
  commandManager: CommandManager;
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;

  // Actions
  executeCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Internal
  updateCommandState: () => void;
}

export const useCommandStore = create<CommandStore>((set, get) => {
  const commandManager = new CommandManager(100);

  return {
    commandManager,
    canUndo: false,
    canRedo: false,
    historyLength: 0,

    executeCommand: (command) => {
      const { commandManager } = get();
      commandManager.execute(command);
      get().updateCommandState();
    },

    undo: () => {
      const { commandManager } = get();
      if (commandManager.undo()) {
        get().updateCommandState();
      }
    },

    redo: () => {
      const { commandManager } = get();
      if (commandManager.redo()) {
        get().updateCommandState();
      }
    },

    clearHistory: () => {
      const { commandManager } = get();
      commandManager.clear();
      get().updateCommandState();
    },

    updateCommandState: () => {
      const { commandManager } = get();
      set({
        canUndo: commandManager.canUndo(),
        canRedo: commandManager.canRedo(),
        historyLength: commandManager.getHistory().length
      });
    }
  };
});