
import { promises as fs } from 'fs';
import path from 'path';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  FolderTree,
  Lightbulb,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { analyzeStructure } from '@/ai/flows/structure-analysis-flow';
import { Separator } from '@/components/ui/separator';

const IGNORE_LIST = [
  'node_modules',
  '.next',
  '.git',
  '.vscode',
  'public/sw.js',
  'public/workbox-*.js',
  'package-lock.json',
];

async function getFileTree(dir: string, prefix = ''): Promise<string> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    // This can happen for directories with restricted permissions
    return `${prefix}└── [Error reading directory]\n`;
  }

  const filteredEntries = entries.filter(
    (entry) => !IGNORE_LIST.some((ignored) => entry.name.startsWith(ignored))
  );
  let tree = '';

  for (let i = 0; i < filteredEntries.length; i++) {
    const entry = filteredEntries[i];
    const isLast = i === filteredEntries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    tree += `${prefix}${connector}${entry.name}\n`;

    if (entry.isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      tree += await getFileTree(path.join(dir, entry.name), newPrefix);
    }
  }
  return tree;
}

export default async function StructurePage() {
  const rootDir = process.cwd();
  const fileTree = await getFileTree(rootDir);

  let analysisResult;
  let analysisError;

  try {
    analysisResult = await analyzeStructure({ fileTree });
  } catch (e) {
    console.error('Structure analysis failed:', e);
    analysisError =
      (e as Error).message || 'An unknown error occurred during analysis.';
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl text-primary flex items-center gap-2">
        <FolderTree className="h-8 w-8" />
        Project Structure Analysis
      </h1>
      <p className="text-muted-foreground">
        This tool provides an AI-powered analysis of your project's file
        structure. The analysis is performed on page load. Note: This page does
        not automatically refresh. Running background tasks requires additional
        server configuration (like a cron job), but this tool can be used to
        manually trigger a check at any time.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Current File Tree</CardTitle>
            <CardDescription>
              A representation of your project's directory structure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[600px] border">
              <code>{fileTree}</code>
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Assessment</CardTitle>
            <CardDescription>Feedback from the AI architect.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {analysisError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Analysis Failed</AlertTitle>
                <AlertDescription>{analysisError}</AlertDescription>
              </Alert>
            )}
            {analysisResult && (
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold text-lg">
                    Overall Assessment
                  </h3>
                  <p className="text-foreground/80 mt-2">
                    {analysisResult.overallAssessment}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle className="text-green-500" /> Positive Points
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-foreground/80 mt-2">
                    {analysisResult.positivePoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Lightbulb className="text-amber-400" /> Suggestions
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-foreground/80 mt-2">
                    {analysisResult.suggestions.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
