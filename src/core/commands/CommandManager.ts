import { Command } from './commandTypes';

export class CommandManager {
  private history: Command[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 100;
  private isExecuting: boolean = false;

  constructor(maxHistorySize: number = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  execute(command: Command): void {
    if (this.isExecuting) return;

    this.isExecuting = true;
    try {
      // Execute the command
      command.execute();

      // Remove any commands after current index (future commands)
      this.history = this.history.slice(0, this.currentIndex + 1);

      // Add new command to history
      this.history.push(command);
      this.currentIndex++;

      // Limit history size
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
        this.currentIndex--;
      }
    } finally {
      this.isExecuting = false;
    }
  }

  undo(): boolean {
    if (this.isExecuting || !this.canUndo()) return false;

    this.isExecuting = true;
    try {
      const command = this.history[this.currentIndex];
      command.undo();
      this.currentIndex--;
      return true;
    } finally {
      this.isExecuting = false;
    }
  }

  redo(): boolean {
    if (this.isExecuting || !this.canRedo()) return false;

    this.isExecuting = true;
    try {
      this.currentIndex++;
      const command = this.history[this.currentIndex];

      if (command.redo) {
        command.redo();
      } else {
        command.execute();
      }
      return true;
    } finally {
      this.isExecuting = false;
    }
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  getHistory(): Command[] {
    return [...this.history];
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }
}