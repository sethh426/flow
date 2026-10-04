# Original floating Flow: source and integration map

This map distinguishes the original `main` implementation (`99995c4`) from the local studio redesign (`a916a17`). It records source inspection, not a claim that the original services have been successfully deployed or exercised.

## Existing interfaces

| Component | Original role | Integration evidence |
| --- | --- | --- |
| `client/src/features/workflow/FlowAssistant.tsx` | Floating avatar with pulse, thinking animation, contextual suggestions and chat launcher | Dynamically mounted in the original `client/src/app/ClientLayout.tsx`; opens `FlowBotDialog` by default and supports an `onClick` callback. Notification counts are randomly simulated. |
| `client/src/features/workflow/FlowBotDialog.tsx` | Conversation and action execution | Posts to `/api/flowbot`, expects `{ answer, action }`, dispatches actions through `client/src/lib/flowbot-actions.ts`. Its request does not attach an authentication token. |
| `client/src/features/workflow/FlowBot.tsx` | Draggable assistant, navigation, streaming chat and visible task interactions | Uses `askFlow` and `FlowBotTasksContext`. No production mount was found in the current client sources. Browser access during state initialization and a dependency referencing `finishTask` before its declaration need repair. |
| `client/src/features/workflow/FlowAutopilot.tsx` | Flying avatar, trails, thought bubbles, target highlighting and DOM actions | Disabled by default; no production mount was found. Opens a WebSocket to a separately configured service, falling back to localhost even outside development. |
| `client/src/features/workflow/FlowBotEnhanced.tsx` | Alternate assistant with insights and memory | No production mount was found. Uses a hardcoded `user-123` identity and imports dialog components that Material UI does not export. |

## Existing intelligence and execution

- `services/flow-orchestrator/index.js` already contains an AI goal planner and a WebSocket command dispatcher. It broadcasts commands to every connected client, lacks session authentication, and advances steps using delays rather than verified execution acknowledgements. Its incoming-message handler accepts status, completion and error messages; it does not expose a user goal submission path. Starting it directly launches a demonstration automatically.
- `services/neural-orchestrator/src/api-handler.ts` contains the selected `/api/flowbot` handler. Its response supplies an answer, but not the structured action expected by the dialog. The newly enforced authentication also requires updating the original dialog's request.
- `client/src/lib/flowbot-actions.ts` contains a real action registry to review and integrate, rather than replacing it with another set of invented capabilities. Every handler still needs endpoint, authentication and result verification.
- `client/src/lib/workflow-execution-engine.ts` and `client/src/services/workflow-executor.ts` are distinct existing execution implementations. Their presence is not evidence that the floating assistant successfully invokes them, or that every action adapter works.
- `client/src/ai/flows/tts-flow.ts` already implements a Gemini speech generation flow and WAV conversion. It must be exposed through an appropriate server runtime and tested before being integrated into video creation.
- `services/image-generator/` and `client/src/services/podOrchestrator.ts` contain image/product pipeline work. Product trend selection includes mock data, and publishing adapters require separate verification.
- `client/src/app/_api_backup/flowbot/route.ts` lists capabilities including `generateVideo` in an AI prompt. A capability named in a prompt is not an implemented video generation tool. The examined original active and recovered sources did not reveal a matching complete video renderer.

## Deployment and recovery

The root Firebase configuration selects `services/neural-orchestrator`; it does not deploy the separate `services/flow-orchestrator` WebSocket service. Historical deployment guides therefore do not prove that the flying controller is connected in the selected app.

Additional assistant versions are preserved under `legacy/editor-recovery/affiliate-flow-prototype/` and `legacy/source-snapshots/firebase-studio/`. These are recovery evidence, not additional live production mounts.

## Correction to the redesign

The local studio redesign replaced the original layout and removed its `FlowAssistant` mount. The original floating Flow was already present and should have been traced before that replacement.

The subsequent local iteration restores the original avatar asset and floating launcher, replacing its disconnected default chat and random notifications with a direct connection to the working creation surface. Only the floating assistant is visible at idle. The avatar has mouse/touch dragging, keyboard movement, saved position, minimize/reopen controls and activity driven by actual creation/export work. A local workflow now renders and bundles creative files; it does not invoke the unsafe broadcast autopilot or imply external publishing occurred. Existing speech, image and server workflow implementations still need integration and live verification. Planned or simulated capabilities must not appear as completed work.
