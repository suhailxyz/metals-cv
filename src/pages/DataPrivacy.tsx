import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Save, FolderOpen, HardDrive, AlertTriangle, CheckCircle, XCircle, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DataPrivacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Link to="/">
            <Button
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            About Your Data
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Local Storage Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 rounded-lg p-2">
                  <HardDrive className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Local Storage</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                All your metal inventory data is stored locally on your device using your browser's localStorage. 
                This means your data never leaves your computer and we don't have access to it.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">Your inventory is automatically saved whenever you add, edit, or delete items.</span>
              </div>
            </CardContent>
          </Card>

          {/* Data Loss Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-destructive/10 rounded-lg p-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <CardTitle>Data Loss Risks</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Your data could be lost if you:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <span className="text-sm">Clear your browser data</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <span className="text-sm">Use incognito/private browsing mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <span className="text-sm">Uninstall your browser</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <span className="text-sm">Switch to a different browser or device</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup & Restore Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Save className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Backup & Restore</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="bg-background rounded p-1.5 border">
                    <Save className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm leading-relaxed">
                    Use the <strong>Save</strong> button to download a backup of your inventory as a JSON file.
                  </p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="bg-background rounded p-1.5 border">
                    <FolderOpen className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm leading-relaxed">
                    Use the <strong>Load</strong> button to restore your data from a backup file.
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-blue-900 dark:text-blue-100 text-sm font-medium">
                    💡 I recommend saving backups every time you update your inventory.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* GitHub Link */}
        <div className="mt-8 pt-6 border-t border-border flex justify-center">
          <a
            href="https://github.com/suhailxyz/metals-cv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DataPrivacy;
