import {
  PACKSPACE_THEMES,
  TYPOGRAPHY_OPTIONS,
  type ThemeId,
  type TypographyId,
} from '../design/tokens';

export function ThemeSwitcher({
  themeId,
  typographyId,
  onThemeChange,
  onTypographyChange,
}: {
  themeId: ThemeId;
  typographyId: TypographyId;
  onThemeChange: (themeId: ThemeId) => void;
  onTypographyChange: (typographyId: TypographyId) => void;
}) {
  return (
    <div className="theme-switcher" role="toolbar" aria-label="Appearance">
      <span className="theme-switcher-label">Theme</span>
      <div className="theme-options" aria-label="Color theme">
        {PACKSPACE_THEMES.map((theme) => (
          <button
            className="theme-option"
            type="button"
            key={theme.id}
            aria-label={`${theme.label} color theme`}
            aria-pressed={themeId === theme.id}
            title={theme.label}
            onClick={() => onThemeChange(theme.id)}
          >
            <span
              className="theme-swatch"
              style={{
                background: `linear-gradient(135deg, ${theme.ui.canvas} 0 50%, ${theme.ui.accent} 50% 100%)`,
              }}
            />
          </button>
        ))}
      </div>

      <span className="theme-switcher-divider" aria-hidden="true" />
      <span className="typography-mark" aria-hidden="true">
        Aa
      </span>
      <div className="typography-options" aria-label="Typography">
        {TYPOGRAPHY_OPTIONS.map((typography) => (
          <button
            type="button"
            key={typography.id}
            aria-label={`${typography.label} typography`}
            aria-pressed={typographyId === typography.id}
            title={typography.label}
            onClick={() => onTypographyChange(typography.id)}
          >
            <span className="typography-long">{typography.label}</span>
            <span className="typography-short" aria-hidden="true">
              {typography.sample}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
