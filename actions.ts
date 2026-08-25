import { Type } from "@google/genai";
import { execQuery, runQuery, addMemory } from "./db";

export type PermissionLevel = 'SAFE' | 'CONFIRM' | 'RESTRICTED';

export interface ActionTool {
  name: string;
  description: string;
  permissionLevel: PermissionLevel;
  parameters: any;
  handler: (params: any) => Promise<any>;
}

export const ToolRegistry: Record<string, ActionTool> = {};

export function registerTool(tool: ActionTool) {
  ToolRegistry[tool.name] = tool;
}

// SAFE actions
registerTool({
  name: 'get_context',
  description: 'Gets current goals, active project, and incomplete tasks.',
  permissionLevel: 'SAFE',
  parameters: {
    type: Type.OBJECT,
    properties: {}
  },
  handler: async () => {
    const goals = runQuery("SELECT * FROM goals WHERE completed = 0");
    const activeProject = runQuery("SELECT * FROM projects WHERE active = 1");
    const tasks = runQuery("SELECT * FROM planner_tasks WHERE completed = 0");
    return { goals, activeProject, tasks };
  }
});

// CONFIRM actions
registerTool({
  name: 'create_goal',
  description: 'Creates a new user goal.',
  permissionLevel: 'CONFIRM',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the goal" }
    },
    required: ["title"]
  },
  handler: async (params) => {
    const id = Date.now().toString();
    execQuery("INSERT INTO goals (id, title) VALUES (?, ?)", [id, params.title]);
    return { success: true, message: `Goal '${params.title}' created.` };
  }
});

registerTool({
  name: 'create_task',
  description: 'Creates a new task in the planner.',
  permissionLevel: 'CONFIRM',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the task" }
    },
    required: ["title"]
  },
  handler: async (params) => {
    const id = Date.now().toString();
    execQuery("INSERT INTO planner_tasks (id, title) VALUES (?, ?)", [id, params.title]);
    return { success: true, message: `Task '${params.title}' created.` };
  }
});

registerTool({
  name: 'complete_task',
  description: 'Marks a task as complete.',
  permissionLevel: 'CONFIRM',
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "ID of the task to complete" }
    },
    required: ["id"]
  },
  handler: async (params) => {
    execQuery("UPDATE planner_tasks SET completed = 1 WHERE id = ?", [params.id]);
    return { success: true, message: `Task completed.` };
  }
});

registerTool({
  name: 'create_project',
  description: 'Creates a new project.',
  permissionLevel: 'CONFIRM',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the project" }
    },
    required: ["title"]
  },
  handler: async (params) => {
    const id = Date.now().toString();
    execQuery("INSERT INTO projects (id, title, active) VALUES (?, ?, 1)", [id, params.title]);
    return { success: true, message: `Project '${params.title}' created.` };
  }
});

registerTool({
  name: 'create_note',
  description: 'Creates a new note (stored as memory).',
  permissionLevel: 'CONFIRM',
  parameters: {
    type: Type.OBJECT,
    properties: {
      content: { type: Type.STRING, description: "Content of the note" }
    },
    required: ["content"]
  },
  handler: async (params) => {
    await addMemory("Notes", params.content, 2);
    return { success: true, message: `Note saved.` };
  }
});

registerTool({
  name: 'save_memory_after_confirmation',
  description: 'Saves important long-term memory after asking user.',
  permissionLevel: 'CONFIRM',
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING, description: "Category of memory" },
      content: { type: Type.STRING, description: "Content to remember" }
    },
    required: ["category", "content"]
  },
  handler: async (params) => {
    await addMemory(params.category, params.content, 3);
    return { success: true, message: `Memory saved.` };
  }
});

export async function executeAction(name: string, params: any) {
  const tool = ToolRegistry[name];
  if (!tool) throw new Error(`Tool ${name} not found`);
  
  const result = await tool.handler(params);
  
  // Log the activity
  try {
    execQuery("INSERT INTO automation_logs (id, message) VALUES (?, ?)", 
      [Date.now().toString(), `Executed action: ${name}`]);
  } catch (e) {
    // Ignore log errors
  }
  
  return {
    success: true,
    actionType: name,
    message: result.message || `Executed ${name}`,
    timestamp: new Date().toISOString(),
    data: result
  };
}

registerTool({
  name: 'complete_goal',
  description: 'Marks a goal as complete.',
  permissionLevel: 'CONFIRM',
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "ID of the goal" }
    },
    required: ["id"]
  },
  handler: async (params) => {
    execQuery("UPDATE goals SET completed = 1 WHERE id = ?", [params.id]);
    return { success: true, message: "Goal completed." };
  }
});

registerTool({
  name: 'update_project_progress',
  description: 'Updates progress percentage of a project.',
  permissionLevel: 'CONFIRM',
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "ID of the project" },
      progress: { type: Type.INTEGER, description: "Progress percentage (0-100)" }
    },
    required: ["id", "progress"]
  },
  handler: async (params) => {
    execQuery("UPDATE projects SET progress = ? WHERE id = ?", [params.progress, params.id]);
    return { success: true, message: `Project progress updated to ${params.progress}%` };
  }
});

registerTool({
  name: 'suggest_memory',
  description: 'Suggests a memory to be saved. If the user likes it, it will be saved.',
  permissionLevel: 'SAFE',
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING, description: "Category of memory" },
      content: { type: Type.STRING, description: "Content to remember" }
    },
    required: ["category", "content"]
  },
  handler: async (params) => {
    return { success: true, message: "Memory suggested, ask user to confirm." };
  }
});

registerTool({
  name: 'start_learning_session',
  description: 'Starts a new learning session for a topic.',
  permissionLevel: 'CONFIRM',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the learning topic" }
    },
    required: ["title"]
  },
  handler: async (params) => {
    const id = Date.now().toString();
    execQuery("INSERT INTO learn_topics (id, title) VALUES (?, ?)", [id, params.title]);
    return { success: true, message: `Started learning session: ${params.title}` };
  }
});

registerTool({
  name: 'update_learning_progress',
  description: 'Updates learning progress for a topic.',
  permissionLevel: 'CONFIRM',
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "ID of the learning topic" },
      progress: { type: Type.INTEGER, description: "Progress percentage" }
    },
    required: ["id", "progress"]
  },
  handler: async (params) => {
    execQuery("UPDATE learn_topics SET progress = ? WHERE id = ?", [params.progress, params.id]);
    return { success: true, message: `Learning progress updated.` };
  }
});

registerTool({
  name: 'create_automation',
  description: 'Creates a new automation rule.',
  permissionLevel: 'CONFIRM',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Name of the automation" },
      trigger: { type: Type.STRING, description: "Trigger (daily, weekly, etc.)" },
      condition: { type: Type.STRING, description: "Condition (optional)" },
      action: { type: Type.STRING, description: "Action to perform" }
    },
    required: ["name", "trigger", "action"]
  },
  handler: async (params) => {
    const id = Date.now().toString();
    execQuery("INSERT INTO automations (id, name, trigger, condition, action) VALUES (?, ?, ?, ?, ?)", 
      [id, params.name, params.trigger, params.condition || '', params.action]);
    return { success: true, message: `Automation '${params.name}' created.` };
  }
});

registerTool({
  name: 'pause_automation',
  description: 'Pauses an active automation.',
  permissionLevel: 'CONFIRM',
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "ID of the automation" }
    },
    required: ["id"]
  },
  handler: async (params) => {
    execQuery("UPDATE automations SET enabled = 0 WHERE id = ?", [params.id]);
    return { success: true, message: `Automation paused.` };
  }
});

registerTool({
  name: 'resume_automation',
  description: 'Resumes a paused automation.',
  permissionLevel: 'CONFIRM',
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "ID of the automation" }
    },
    required: ["id"]
  },
  handler: async (params) => {
    execQuery("UPDATE automations SET enabled = 1 WHERE id = ?", [params.id]);
    return { success: true, message: `Automation resumed.` };
  }
});

registerTool({
  name: 'recommend_action',
  description: 'Pushes a proactive action recommendation into Zara Brain.',
  permissionLevel: 'SAFE',
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, description: "Type of action (e.g. task, goal)" },
      title: { type: Type.STRING, description: "Title of the recommendation" },
      reason: { type: Type.STRING, description: "Reason for recommendation" },
      action: { type: Type.STRING, description: "Action to perform (e.g. create_task)" }
    },
    required: ["type", "title", "reason", "action"]
  },
  handler: async (params) => {
    const id = Date.now().toString();
    execQuery("INSERT INTO autopilot_suggestions (id, type, title, reason, action, priority, status) VALUES (?, ?, ?, ?, ?, 'medium', 'pending')", 
      [id, params.type, params.title, params.reason, params.action]);
    return { success: true, message: `Recommendation pushed to Zara Brain.` };
  }
});
