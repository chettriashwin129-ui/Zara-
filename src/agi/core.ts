import { runQuery, execQuery, addMemory, searchMemories } from '@/db';
import { ToolRegistry } from '@/actions';
import { GoogleGenAI, Type } from '@google/genai';

// 1. PERCEPTION LAYER
export class PerceptionEngine {
  processInput(input: any) {
    return {
      type: input.type || 'text',
      content: input.content,
      timestamp: Date.now(),
      metadata: input.metadata || {}
    };
  }
}

// 2. WORLD MODEL
export class WorldModel {
  async getCurrentState() {
    const projects = runQuery("SELECT * FROM projects WHERE active = 1");
    const goals = runQuery("SELECT * FROM goals WHERE completed = 0");
    const tasks = runQuery("SELECT * FROM planner_tasks WHERE completed = 0");
    const learning = runQuery("SELECT * FROM learn_topics");
    
    return {
      user: "Ashwin",
      time: new Date().toISOString(),
      activeProjects: projects,
      currentGoals: goals,
      pendingTasks: tasks,
      learningTopics: learning,
      environment: "Zara AI System"
    };
  }
}

// 3. MEMORY ARCHITECTURE
export class MemoryArchitecture {
  workingMemory: any[] = [];
  
  async getSemanticMemory(query: string) {
    return await searchMemories(query);
  }
  
  async getEpisodicMemory(query: string) {
    return await searchMemories(query);
  }
  
  async getProceduralMemory(taskType: string) {
    return [];
  }
  
  async getProjectMemory(projectId: string) {
    return [];
  }
  
  async store(category: string, content: string, importance: number = 1) {
    await addMemory(category, content, importance);
  }
}

// 4. REASONING ENGINE
export class ReasoningEngine {
  private ai: GoogleGenAI;
  
  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }
  
  async reason(context: any, goal: string) {
    const prompt = `
      Context: ${JSON.stringify(context)}
      Goal: ${goal}
      
      Analyze the situation. Compare alternatives, identify problems and dependencies, prioritize tasks.
      Return a concise reasoning summary and decision. Do not expose hidden chain-of-thought.
    `;
    const response = await this.ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt
    });
    return response.text;
  }
}

// 5. PLANNING ENGINE
export class PlanningEngine {
  private ai: GoogleGenAI;
  
  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }
  
  async createPlan(goal: string, context: any) {
    const prompt = `
      Goal: ${goal}
      Context: ${JSON.stringify(context)}
      
      Convert this high-level goal into a step-by-step plan. Return as a JSON array of strings representing steps.
    `;
    const response = await this.ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    if (response.text) {
        return JSON.parse(response.text);
    }
    return [];
  }
}

// 6. META-REASONING
export class MetaReasoning {
  evaluatePlan(plan: any[], context: any) {
    return {
      approved: true,
      missingInfo: [],
      risks: []
    };
  }
}

// 8. AUTONOMY
export enum AutonomyLevel {
  MANUAL = "MANUAL",
  ASSISTED = "ASSISTED",
  AUTOPILOT = "AUTOPILOT"
}

// 9. SELF-MONITORING
export class CapabilityMonitor {
  checkCapabilities() {
    return {
      chat: 'READY',
      voice: 'READY',
      memory: 'READY',
      tools: 'READY',
      autopilot: 'READY',
      projects: 'READY',
      learning: 'READY',
      github: 'NOT CONNECTED'
    };
  }
}

// 10. LEARNING LOOP
export class LearningLoop {
  async observeAndLearn(action: string, result: any, context: any) {
    // Store approved preferences
  }
}

// 14. REFLECTION
export class Reflection {
  async reflectOnTask(goal: string, outcome: any) {
    return {
      goalStatus: outcome.success ? 'completed' : 'failed',
      worked: outcome.worked || '',
      failed: outcome.failed || '',
      nextStep: outcome.nextStep || ''
    };
  }
}

// 16. CONFLICT DETECTION
export class ConflictDetector {
  detectConflicts(memories: any[], currentRequest: string) {
    return {
      hasConflict: false,
      details: null
    };
  }
}

// CORE AGI ARCHITECTURE
export class ZaraAGI {
  perception: PerceptionEngine;
  worldModel: WorldModel;
  memory: MemoryArchitecture;
  reasoning: ReasoningEngine;
  planning: PlanningEngine;
  metaReasoning: MetaReasoning;
  capabilities: CapabilityMonitor;
  learning: LearningLoop;
  reflection: Reflection;
  conflictDetector: ConflictDetector;
  autonomyLevel: AutonomyLevel = AutonomyLevel.ASSISTED;

  constructor(apiKey: string) {
    this.perception = new PerceptionEngine();
    this.worldModel = new WorldModel();
    this.memory = new MemoryArchitecture();
    this.reasoning = new ReasoningEngine(apiKey);
    this.planning = new PlanningEngine(apiKey);
    this.metaReasoning = new MetaReasoning();
    this.capabilities = new CapabilityMonitor();
    this.learning = new LearningLoop();
    this.reflection = new Reflection();
    this.conflictDetector = new ConflictDetector();
  }

  // CORE COGNITIVE LOOP
  async process(input: any) {
    // 1. PERCEIVE
    const perceived = this.perception.processInput(input);
    
    // 2. UNDERSTAND (World Model)
    const state = await this.worldModel.getCurrentState();
    
    // 3. REMEMBER
    const memories = await this.memory.getSemanticMemory(perceived.content);
    
    // 16. CONFLICT DETECTION
    const conflicts = this.conflictDetector.detectConflicts(memories, perceived.content);
    if (conflicts.hasConflict) {
      return { response: "I noticed a conflict between your request and my memory. Can you confirm?", reasoning: "Conflict detected", plan: null };
    }
    
    // 4. REASON & 5. PLAN
    if (perceived.content.toLowerCase().includes("plan") || perceived.content.toLowerCase().includes("goal")) {
       const plan = await this.planning.createPlan(perceived.content, state);
       
       // 6. META-REASONING
       const evaluation = this.metaReasoning.evaluatePlan(plan, state);
       if (!evaluation.approved) {
         return { response: "I need more information before I can execute this plan.", missingInfo: evaluation.missingInfo, reasoning: "Requires missing information", plan: null };
       }
       
       return { response: "Here is my plan.", plan, reasoning: "Plan created based on user request." };
    }
    
    // Default flow: Reasoning
    const reasoningSummary = await this.reasoning.reason({ state, memories, input: perceived }, perceived.content);
    
    return { response: reasoningSummary, reasoning: reasoningSummary, plan: null };
  }
}
