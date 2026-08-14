import test from 'node:test';
import assert from 'node:assert/strict';
import { CodexAppServerProtocol } from './codexWorkspace.ts';

test('starts an interactive high-reasoning Pencil workspace after the App Server handshake', async () => {
  const sent: Array<Record<string, unknown>> = [];
  const protocol = new CodexAppServerProtocol((message) => sent.push(message));

  const initialization = protocol.initialize();
  const initializeRequest = sent[0] as { id: number };
  protocol.receive({ id: initializeRequest.id, result: { platformFamily: 'windows' } });
  await initialization;

  const threadRequest = protocol.startThread({
    cwd: 'C:\\project\\designs\\generated',
    model: 'gpt-test-codex',
  });
  const startMessage = sent.at(-1) as { id: number; method: string; params: Record<string, unknown> };
  assert.equal(startMessage.method, 'thread/start');
  assert.equal(startMessage.params.approvalsReviewer, 'user');
  assert.equal(startMessage.params.approvalPolicy, 'on-request');
  assert.deepEqual(startMessage.params.config, {
    mcp_servers: {
      pencil: {
        default_tools_approval_mode: 'prompt',
        tools: { execute: { approval_mode: 'prompt' } },
      },
    },
  });
  protocol.receive({ id: startMessage.id, result: { thread: { id: 'thr-layout-1' } } });
  assert.equal(await threadRequest, 'thr-layout-1');

  const turnRequest = protocol.startTurn({
    threadId: 'thr-layout-1',
    cwd: 'C:\\project\\designs\\generated',
    prompt: 'Update the KPI hierarchy.',
  });
  const turnMessage = sent.at(-1) as { id: number; method: string; params: Record<string, unknown> };
  assert.equal(turnMessage.method, 'turn/start');
  assert.equal(turnMessage.params.effort, 'high');
  assert.equal(turnMessage.params.approvalsReviewer, 'user');
  assert.deepEqual(turnMessage.params.sandboxPolicy, {
    type: 'workspaceWrite',
    writableRoots: ['C:\\project\\designs\\generated'],
    networkAccess: false,
    excludeTmpdirEnvVar: false,
    excludeSlashTmp: false,
  });
  protocol.receive({ id: turnMessage.id, result: { turn: { id: 'turn-layout-1' } } });
  assert.equal(await turnRequest, 'turn-layout-1');
});

test('keeps an App Server approval pending until the user accepts it for the session', () => {
  const sent: Array<Record<string, unknown>> = [];
  const received: Array<Record<string, unknown>> = [];
  const protocol = new CodexAppServerProtocol(
    (message) => sent.push(message),
    (message) => received.push(message),
  );

  const approvalRequest = {
    id: 91,
    method: 'item/fileChange/requestApproval',
    params: {
      threadId: 'thr-layout-1',
      turnId: 'turn-layout-1',
      itemId: 'pencil-execute-1',
      reason: 'Pencil needs to update the report canvas.',
    },
  };
  protocol.receive(approvalRequest);

  assert.deepEqual(received, [approvalRequest]);
  assert.equal(sent.length, 0);

  protocol.resolveApproval(approvalRequest, 'acceptForSession');
  assert.deepEqual(sent, [{ id: 91, result: { decision: 'acceptForSession' } }]);
});

test('answers an MCP tool approval question with the matching visible option', () => {
  const sent: Array<Record<string, unknown>> = [];
  const protocol = new CodexAppServerProtocol((message) => sent.push(message));
  const request = {
    id: 'mcp-12',
    method: 'item/tool/requestUserInput',
    params: {
      threadId: 'thr-layout-1',
      turnId: 'turn-layout-1',
      itemId: 'pencil-execute-2',
      isBlocking: true,
      questions: [{
        id: 'approval',
        header: 'Pencil execute',
        question: 'Allow Pencil to update the canvas?',
        isOther: false,
        isSecret: false,
        options: [
          { label: 'Allow once', description: 'Allow this write.' },
          { label: 'Allow for session', description: 'Allow later writes in this session.' },
          { label: 'Decline', description: 'Do not write.' },
        ],
      }],
    },
  };

  protocol.resolveApproval(request, 'acceptForSession');

  assert.deepEqual(sent, [{
    id: 'mcp-12',
    result: { answers: { approval: { answers: ['Allow for session'] } } },
  }]);
});
