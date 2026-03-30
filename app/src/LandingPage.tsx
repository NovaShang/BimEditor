import { useTranslation } from 'react-i18next';
import { FilePlus, FolderOpen, FileBox } from 'lucide-react';

interface LandingPageProps {
  onNewProject: () => void;
  onOpenFolder: () => void;
  onOpenSample?: () => void;
}

export default function LandingPage({ onNewProject, onOpenFolder, onOpenSample }: LandingPageProps) {
  const { t } = useTranslation();
  const hasFs = 'showDirectoryPicker' in window;

  return (
    <div className="flex items-center justify-center h-full w-full bg-[var(--background)]">
      <div className="flex flex-col items-center gap-8 max-w-md w-full px-6">
        <div className="text-center">
          <h1 className="text-[20px] font-semibold text-[var(--text-primary)] mb-1">BimDown Editor</h1>
          <p className="text-[12px] text-[var(--text-secondary)]">
            {t('landing.subtitle', 'Open-source 2D/3D building model editor')}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onNewProject}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-border bg-[var(--card)] hover:bg-[var(--bg-hover)] transition-colors text-left"
          >
            <FilePlus size={20} className="text-[var(--color-accent)] shrink-0" />
            <div>
              <div className="text-[13px] font-medium text-[var(--text-primary)]">
                {t('landing.new', 'New Project')}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                {t('landing.newDesc', 'Start with an empty building model')}
              </div>
            </div>
          </button>

          {hasFs && (
            <button
              onClick={onOpenFolder}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-border bg-[var(--card)] hover:bg-[var(--bg-hover)] transition-colors text-left"
            >
              <FolderOpen size={20} className="text-[var(--color-accent)] shrink-0" />
              <div>
                <div className="text-[13px] font-medium text-[var(--text-primary)]">
                  {t('landing.open', 'Open Folder')}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  {t('landing.openDesc', 'Open a BimDown project directory')}
                </div>
              </div>
            </button>
          )}

          {onOpenSample && (
            <button
              onClick={onOpenSample}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-border bg-[var(--card)] hover:bg-[var(--bg-hover)] transition-colors text-left"
            >
              <FileBox size={20} className="text-[var(--color-accent)] shrink-0" />
              <div>
                <div className="text-[13px] font-medium text-[var(--text-primary)]">
                  {t('landing.sample', 'Open Sample')}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  {t('landing.sampleDesc', 'Load the bundled sample model')}
                </div>
              </div>
            </button>
          )}
        </div>

        {!hasFs && (
          <p className="text-[11px] text-[var(--text-muted)] text-center">
            {t('landing.noFs', 'Tip: Use Chrome or Edge for direct folder access. In this browser, you can download your project as a ZIP file.')}
          </p>
        )}
      </div>
    </div>
  );
}
