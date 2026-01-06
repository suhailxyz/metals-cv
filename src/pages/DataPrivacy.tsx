import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Save, FolderOpen, HardDrive, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DataPrivacy = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <div className="mb-4">
          <Link to="/">
            <Button
              variant="ghost"
              className="text-white hover:text-[#F59E0B] mb-3 text-sm"
            >
              <ArrowLeft className="h-3 w-3 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-black text-white flex items-center gap-2 tracking-tight">
            <Shield className="h-8 w-8 text-[#F59E0B]" />
            About Your Data
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Local Storage Section */}
          <Card className="bg-[#FEF3C7] border-2 border-[#F59E0B]/30 shadow-xl rounded-2xl p-4">
            <CardHeader className="px-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-[#F59E0B]/20 rounded-lg p-2">
                  <HardDrive className="h-5 w-5 text-[#F59E0B]" />
                </div>
                <CardTitle className="text-lg font-black text-black">
                  Local Storage
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="bg-white rounded-lg p-3 border-2 border-[#F59E0B]/20">
                <p className="text-gray-700 font-medium text-sm leading-relaxed mb-2">
                  All your metal inventory data is stored locally on your device using your browser's localStorage. 
                  This means your data never leaves your computer and we don't have access to it.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold">
                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                  <span>Your inventory is automatically saved whenever you add, edit, or delete items.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Loss Section */}
          <Card className="bg-[#FEF3C7] border-2 border-red-500/30 shadow-xl rounded-2xl p-4">
            <CardHeader className="px-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-red-100 rounded-lg p-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <CardTitle className="text-lg font-black text-black">
                  Data Loss Risks
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="bg-white rounded-lg p-3 border-2 border-red-200">
                <p className="text-gray-700 font-medium text-sm leading-relaxed mb-2">
                  Your data could be lost if you:
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium text-sm">Clear your browser data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium text-sm">Use incognito/private browsing mode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium text-sm">Uninstall your browser</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium text-sm">Switch to a different browser or device</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup & Restore Section */}
          <Card className="bg-[#FEF3C7] border-2 border-[#EC4899]/30 shadow-xl rounded-2xl p-4">
            <CardHeader className="px-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-[#EC4899]/20 rounded-lg p-2">
                  <Save className="h-5 w-5 text-[#EC4899]" />
                </div>
                <CardTitle className="text-lg font-black text-black">
                  Backup & Restore
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-2">
                <div className="bg-white rounded-lg p-3 border-2 border-[#EC4899]/20">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#EC4899]/10 rounded p-1.5 border-2 border-[#EC4899]">
                      <Save className="h-4 w-4 text-[#EC4899]" />
                    </div>
                    <p className="text-gray-700 font-medium text-sm leading-relaxed">
                      Use the <strong className="text-black">Save</strong> button to download a backup of your inventory as a JSON file.
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border-2 border-[#EC4899]/20">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#EC4899]/10 rounded p-1.5 border-2 border-[#EC4899]">
                      <FolderOpen className="h-4 w-4 text-[#EC4899]" />
                    </div>
                    <p className="text-gray-700 font-medium text-sm leading-relaxed">
                      Use the <strong className="text-black">Load</strong> button to restore your data from a backup file.
                    </p>
                  </div>
                </div>
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-2.5">
                  <p className="text-blue-900 font-bold text-xs">
                    💡 We recommend saving backups every time you update your inventory.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataPrivacy;
