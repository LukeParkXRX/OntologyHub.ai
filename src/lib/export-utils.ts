// Data export utilities for converting graph data to various formats

import { GraphData, ExportFormat } from './domain-types';

/**
 * Convert graph data to JSON format
 */
export function exportToJSON(graphData: GraphData, pretty: boolean = true): string {
  return JSON.stringify(graphData, null, pretty ? 2 : 0);
}

/**
 * Convert graph data to CSV format
 * Creates two CSV sections: one for nodes and one for edges
 */
export function exportToCSV(graphData: GraphData): string {
  const lines: string[] = [];
  
  // Nodes section
  lines.push('# NODES');
  lines.push('id,label,type,depth,role,expanded');
  
  graphData.elements.nodes.forEach(node => {
    const { id, label, type, depth, role, expanded } = node.data;
    lines.push(`"${id}","${label}","${type}","${depth || ''}","${role || ''}","${expanded || ''}"`);
  });
  
  lines.push('');
  
  // Edges section
  lines.push('# EDGES');
  lines.push('source,target,label,explanation,depth');
  
  graphData.elements.edges.forEach(edge => {
    const { source, target, label, explanation, depth } = edge.data;
    const escapedExplanation = (explanation || '').replace(/"/g, '""');
    lines.push(`"${source}","${target}","${label}","${escapedExplanation}","${depth || ''}"`);
  });
  
  return lines.join('\n');
}

/**
 * Convert graph data to GraphML format (XML-based graph format)
 * Compatible with tools like Gephi, yEd, Cytoscape desktop
 */
export function exportToGraphML(graphData: GraphData): string {
  const lines: string[] = [];
  
  // GraphML header
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<graphml xmlns="http://graphml.graphdrawing.org/xmlns"');
  lines.push('         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
  lines.push('         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns');
  lines.push('         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">');
  
  // Define attributes
  lines.push('  <key id="label" for="node" attr.name="label" attr.type="string"/>');
  lines.push('  <key id="type" for="node" attr.name="type" attr.type="string"/>');
  lines.push('  <key id="depth" for="node" attr.name="depth" attr.type="int"/>');
  lines.push('  <key id="role" for="node" attr.name="role" attr.type="string"/>');
  lines.push('  <key id="edge_label" for="edge" attr.name="label" attr.type="string"/>');
  lines.push('  <key id="explanation" for="edge" attr.name="explanation" attr.type="string"/>');
  
  // Graph element
  lines.push('  <graph id="G" edgedefault="directed">');
  
  // Nodes
  graphData.elements.nodes.forEach(node => {
    const { id, label, type, depth, role } = node.data;
    lines.push(`    <node id="${escapeXML(id)}">`);
    lines.push(`      <data key="label">${escapeXML(label)}</data>`);
    lines.push(`      <data key="type">${escapeXML(type)}</data>`);
    if (depth !== undefined) {
      lines.push(`      <data key="depth">${depth}</data>`);
    }
    if (role) {
      lines.push(`      <data key="role">${escapeXML(role)}</data>`);
    }
    lines.push('    </node>');
  });
  
  // Edges
  graphData.elements.edges.forEach((edge, index) => {
    const { source, target, label, explanation } = edge.data;
    lines.push(`    <edge id="e${index}" source="${escapeXML(source)}" target="${escapeXML(target)}">`);
    lines.push(`      <data key="edge_label">${escapeXML(label)}</data>`);
    if (explanation) {
      lines.push(`      <data key="explanation">${escapeXML(explanation)}</data>`);
    }
    lines.push('    </edge>');
  });
  
  // Close graph and graphml
  lines.push('  </graph>');
  lines.push('</graphml>');
  
  return lines.join('\n');
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Create a downloadable file blob
 */
export function createDownloadBlob(content: string, format: ExportFormat): Blob {
  const mimeTypes = {
    [ExportFormat.JSON]: 'application/json',
    [ExportFormat.CSV]: 'text/csv',
    [ExportFormat.GRAPHML]: 'application/xml',
  };
  
  return new Blob([content], { type: mimeTypes[format] });
}

/**
 * Generate filename for export
 */
export function generateExportFilename(domainName: string, format: ExportFormat): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const safeName = domainName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${safeName}_${timestamp}.${format}`;
}

/**
 * Trigger browser download
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Main export function - handles all formats
 */
export function exportGraphData(
  graphData: GraphData,
  domainName: string,
  format: ExportFormat
): void {
  let content: string;
  
  switch (format) {
    case ExportFormat.JSON:
      content = exportToJSON(graphData);
      break;
    case ExportFormat.CSV:
      content = exportToCSV(graphData);
      break;
    case ExportFormat.GRAPHML:
      content = exportToGraphML(graphData);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
  
  const blob = createDownloadBlob(content, format);
  const filename = generateExportFilename(domainName, format);
  downloadFile(blob, filename);
}
