#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const TEAMCAMP_BASE = "https://api.teamcamp.app/v1.0";

function apiKey(): string {
  const key = process.env.TEAMCAMP_API_KEY;
  if (!key) throw new Error("TEAMCAMP_API_KEY environment variable is required");
  return key;
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${TEAMCAMP_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", apiKey: apiKey(), ...(options.headers as Record<string, string>) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(`Teamcamp API error ${res.status}: ${body.error}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function textResponse(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

const server = new McpServer({ name: "teamcamp-mcp-server", version: "1.0.0" });

server.tool("verify_api_key", "Verify the validity of a Teamcamp API key", {}, async () => {
  return textResponse(await apiFetch("/verify"));
});

server.tool("get_users", "Get all users of a workspace", {}, async () => {
  return textResponse(await apiFetch("/company/users"));
});

server.tool("get_customers", "Get all customers of a workspace", {}, async () => {
  return textResponse(await apiFetch("/company/customers"));
});

server.tool("get_project_list", "Get all projects in the workspace", {}, async () => {
  return textResponse(await apiFetch("/project"));
});

server.tool("get_project", "Get project details by ID", {
  projectId: z.string().min(10).describe("The unique identifier of the project"),
}, async (args) => {
  return textResponse(await apiFetch(`/project/${args.projectId}`));
});

server.tool("create_project", "Create a new project in the workspace", {
  projectName: z.string().describe("The name of the project"),
  customerId: z.string().optional().describe("The ID of the customer"),
  startDate: z.string().optional().describe("Start date (yyyy-MM-dd)"),
  dueDate: z.string().optional().describe("Due date (yyyy-MM-dd)"),
  templateId: z.string().optional().describe("Template ID"),
}, async (args) => {
  return textResponse(await apiFetch("/project", { method: "POST", body: JSON.stringify(args) }));
});

server.tool("update_project", "Update details of a project", {
  projectId: z.string().describe("The unique identifier of the project"),
  projectName: z.string().optional().describe("The name of the project"),
  customerId: z.string().optional().describe("The ID of the customer"),
  startDate: z.string().optional().describe("Start date (yyyy-MM-dd)"),
  dueDate: z.string().optional().describe("Due date (yyyy-MM-dd)"),
  description: z.string().optional().describe("Description of the project"),
  priority: z.boolean().optional().describe("Enable task priority"),
  defaultPriority: z.enum(["No Priority", "Urgent", "High", "Medium", "Low"]).optional().describe("Default priority"),
  estimate: z.boolean().optional().describe("Enable time estimation"),
  milestone: z.boolean().optional().describe("Enable milestones"),
}, async (args) => {
  const { projectId, ...body } = args;
  return textResponse(await apiFetch(`/project/${projectId}`, { method: "PUT", body: JSON.stringify(body) }));
});

server.tool("delete_project", "Delete a single project by ID", {
  projectId: z.string().describe("ID of project to delete"),
}, async (args) => {
  await apiFetch(`/project/${args.projectId}`, { method: "DELETE" });
  return textResponse("Project deleted successfully");
});

server.tool("get_project_groups", "Get project groups by project ID", {
  projectId: z.string().min(10).describe("The unique identifier of the project"),
}, async (args) => {
  return textResponse(await apiFetch(`/project/${args.projectId}/group`));
});

server.tool("get_task_list", "Get all tasks from a project", {
  projectId: z.string().describe("The ID of the project"),
  complete: z.boolean().optional().describe("Filter by completion status"),
}, async (args) => {
  const params = new URLSearchParams({ projectId: args.projectId });
  if (args.complete !== undefined) params.set("complete", String(args.complete));
  return textResponse(await apiFetch(`/task?${params}`));
});

server.tool("get_task", "Get task details by ID", {
  taskId: z.string().min(10).describe("The unique identifier of the task"),
}, async (args) => {
  return textResponse(await apiFetch(`/task/${args.taskId}`));
});

server.tool("create_task", "Create a new task in a project", {
  projectId: z.string().describe("The ID of the project"),
  name: z.string().optional().describe("The name of the task"),
  description: z.string().optional().describe("Description of the task"),
  priority: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional().describe("Priority: 0=No Priority, 1=Urgent, 2=High, 3=Medium, 4=Low"),
  dueDate: z.string().optional().describe("Due date (yyyy-MM-dd)"),
  groupId: z.string().optional().describe("The ID of the task group"),
  taskUsers: z.array(z.string()).optional().describe("Array of user IDs (task assignees)"),
  estimateTime: z.number().int().optional().describe("Estimated time in hours"),
  milestoneId: z.number().int().optional().describe("The ID of the milestone"),
  statusId: z.string().optional().describe("The ID of the task status"),
}, async (args) => {
  return textResponse(await apiFetch("/task", { method: "POST", body: JSON.stringify(args) }));
});

server.tool("update_task", "Update an existing task", {
  taskId: z.string().min(10).describe("The unique identifier of the task"),
  projectId: z.string().optional().describe("The ID of the project"),
  name: z.string().optional().describe("The name of the task"),
  description: z.string().optional().describe("Description of the task"),
  priority: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional().describe("Priority: 0=No Priority, 1=Urgent, 2=High, 3=Medium, 4=Low"),
  dueDate: z.string().optional().describe("Due date (yyyy-MM-dd)"),
  groupId: z.string().optional().describe("The ID of the task group"),
  taskUsers: z.array(z.string()).optional().describe("Array of user IDs (task assignees)"),
  estimateTime: z.number().int().optional().describe("Estimated time in hours"),
  milestoneId: z.number().int().optional().describe("The ID of the milestone"),
  statusId: z.string().optional().describe("The ID of the task status"),
}, async (args) => {
  const { taskId, ...body } = args;
  return textResponse(await apiFetch(`/task/updateTask/${taskId}`, { method: "PUT", body: JSON.stringify(body) }));
});

server.tool("post_comment", "Post a new comment on a task", {
  taskId: z.string().describe("The unique identifier of the task"),
  content: z.string().describe("Comment content"),
}, async (args) => {
  return textResponse(await apiFetch(`/task/${args.taskId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content: args.content }),
  }));
});

async function main() {
  if (process.argv[2] !== "serve") {
    console.error("Usage: teamcamp-mcp-server serve");
    process.exit(1);
  }
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
