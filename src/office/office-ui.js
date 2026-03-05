/**
 * Office UI — Name tags, speech bubbles, camera controls
 * Ported from pixel_office nameTagRenderer.ts
 */

/* eslint-disable no-unused-vars */

var OFFICE_UI_BASE_Y = -66;

function drawOfficeNameTag(ctx, agent, yOffset) {
  var baseX = Math.round(agent.x);
  var footY = Math.round(agent.y);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  var statusColor = STATE_COLORS[agent.agentState] || STATE_COLORS[agent.metadata.status] || '#94a3b8';

  // Role label
  ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Malgun Gothic", sans-serif';
  var roleStr = agent.role || agent.metadata.name || 'Agent';
  if (roleStr.length > 20) roleStr = roleStr.slice(0, 19) + '...';

  var tw = ctx.measureText(roleStr).width;
  var roleBoxW = tw + 16;
  var roleBoxH = 16;
  var roleBoxX = baseX - roleBoxW / 2;
  var roleBoxY = footY + OFFICE_UI_BASE_Y - roleBoxH + (yOffset || 0);

  // Role background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
  ctx.strokeStyle = statusColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(roleBoxX, roleBoxY, roleBoxW, roleBoxH, 4);
  ctx.fill();
  ctx.stroke();

  // Role text
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(roleStr, baseX, footY + OFFICE_UI_BASE_Y - 3 + (yOffset || 0));

  // Status badge
  var state = agent.agentState || 'idle';
  var displayState = state === 'done' ? 'DONE' : state === 'idle' ? 'RESTING' : state.toUpperCase();

  ctx.font = 'bold 9.5px sans-serif';
  var stateTw = ctx.measureText(displayState).width;

  ctx.globalAlpha = 0.75;
  ctx.fillStyle = statusColor;
  var paddingX = 10;
  var sBoxW = stateTw + paddingX * 2;
  var sBoxH = 15;
  var sBoxX = baseX - sBoxW / 2;
  var sBoxY = roleBoxY - sBoxH - 5 + (yOffset || 0);

  ctx.beginPath();
  ctx.roundRect(sBoxX, sBoxY, sBoxW, sBoxH, sBoxH / 2);
  ctx.fill();

  ctx.globalAlpha = 1.0;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(displayState, baseX, sBoxY + sBoxH - 3);

  ctx.restore();
}

function drawOfficeBubble(ctx, agent, yOffset) {
  var now = Date.now();
  var baseX = Math.round(agent.x);
  var bubbleY = Math.round(agent.y) + OFFICE_UI_BASE_Y - 45;

  ctx.save();

  if (agent.bubble && agent.bubble.expiresAt > now) {
    var icon = agent.bubble.icon ? agent.bubble.icon + ' ' : '';
    var text = icon + agent.bubble.text;

    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
    var tw = ctx.measureText(text).width;
    var paddingH = 10;
    var paddingV = 8;
    var boxW = tw + paddingH * 2;
    var boxH = 16 + paddingV * 2;
    var boxX = baseX - boxW / 2;
    var boxY = bubbleY - boxH + (yOffset || 0);

    // Bubble background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 8);
    ctx.fill();

    // Border
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.5)';
    ctx.stroke();

    // Tail
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.moveTo(baseX - 6, boxY + boxH);
    ctx.lineTo(baseX + 6, boxY + boxH);
    ctx.lineTo(baseX, boxY + boxH + 8);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.5)';
    ctx.stroke();

    // Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(text, baseX, boxY + boxH / 2);
  }

  ctx.restore();
}
