#!/bin/bash
sed -i 's/import { GoogleGenAI, Type } from "@google\/genai";/import { GoogleGenAI, Type, Modality } from "@google\/genai";\nimport { WebSocketServer, WebSocket } from "ws";/' server.ts
