export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actionRequest?: { name: string; params: any; description: string };
  actionResult?: { success: boolean; message: string };
}

export interface DbMemory {
  id: number;
  category: string;
  content: string;
  importance: number;
  created_at: string;
}

export interface DbTask {
  id: string;
  title: string;
  completed: number;
  due_date: string;
  priority: string;
  created_at: string;
}

export interface DbGoal {
  id: string;
  title: string;
  progress: number;
  completed: number;
  created_at: string;
}

export interface DbProject {
  id: string;
  title: string;
  progress: number;
  active: number;
  completed: number;
  created_at: string;
}

export interface DbLearnTopic {
  id: string;
  title: string;
  progress: number;
  notes: string;
  created_at: string;
}

export interface AutopilotSuggestion {
  id: string;
  type: string;
  title: string;
  reason: string;
  action: string;
  priority: string;
  status: 'pending' | 'accepted' | 'dismissed';
  created_at: string;
}

export interface Automation {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: number;
  lastRun?: string;
  nextRun?: string;
  created_at: string;
}

export interface AutomationLog {
  id: string;
  automation_id?: string;
  message: string;
  created_at: string;
}

