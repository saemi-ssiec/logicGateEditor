export interface Command {
  id: string;
  name: string;
  timestamp: number;
  execute: () => void;
  undo: () => void;
  redo?: () => void;
}

export interface CommandHistory {
  past: Command[];
  future: Command[];
  maxHistorySize: number;
}