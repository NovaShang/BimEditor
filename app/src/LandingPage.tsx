import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FilePlus, FolderOpen, FileArchive, Globe, FileBox } from 'lucide-react';
import { setLanguage } from './i18n.ts';

interface LandingPageProps {
  onNewProject: () => void;
  onOpenFolder: () => void;
  onOpenZip: () => void;
  onOpenUrl: () => void;
  onOpenSample?: () => void;
}

export default function LandingPage({ onNewProject, onOpenFolder, onOpenZip, onOpenUrl, onOpenSample }: LandingPageProps) {
  const { t, i18n } = useTranslation();
  const hasFs = 'showDirectoryPicker' in window;

  const handleToggleLang = useCallback(() => {
    const next = i18n.language === 'zh' ? 'en' : 'zh';
    setLanguage(next);
  }, [i18n.language]);

  return (
    <div className="flex items-center justify-center h-full w-full bg-[var(--background)] relative">
      {/* Language toggle */}
      <button
        onClick={handleToggleLang}
        className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-[var(--card)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] text-[11px] font-medium transition-colors"
      >
        {i18n.language === 'zh' ? 'EN' : '中'}
      </button>

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
                {t('landing.new', 'Create New Model')}
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
                  {t('landing.openFolder', 'Open Local Folder')}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  {t('landing.openFolderDesc', 'Great for real-time collaboration with AI')}
                </div>
              </div>
            </button>
          )}

          <button
            onClick={onOpenZip}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-border bg-[var(--card)] hover:bg-[var(--bg-hover)] transition-colors text-left"
          >
            <FileArchive size={20} className="text-[var(--color-accent)] shrink-0" />
            <div>
              <div className="text-[13px] font-medium text-[var(--text-primary)]">
                {t('landing.openZip', 'Open Local ZIP')}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                {t('landing.openZipDesc', 'Load a .zip project from your computer')}
              </div>
            </div>
          </button>

          <button
            onClick={onOpenUrl}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-border bg-[var(--card)] hover:bg-[var(--bg-hover)] transition-colors text-left"
          >
            <Globe size={20} className="text-[var(--color-accent)] shrink-0" />
            <div>
              <div className="text-[13px] font-medium text-[var(--text-primary)]">
                {t('landing.openUrl', 'Open Online ZIP')}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                {t('landing.openUrlDesc', 'Load a .zip project from a URL')}
              </div>
            </div>
          </button>

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

        <p className="text-[11px] text-[var(--text-muted)] text-center">
          {t('landing.privacy', 'This editor runs entirely in your browser. No data is uploaded.')}
        </p>
      </div>
    </div>
  );
}
