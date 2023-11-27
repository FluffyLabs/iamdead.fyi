import { PropsWithChildren } from 'react';
import { ThemeProvider, defaultTheme, mergeTheme } from 'evergreen-ui';

export const colors = {
  pane: '#fff',
  background: '#e5eee7',
  primary: '#317372',
  secondary: '#649693',
  tertiary: '#4a8482',
  extra: '#7ea7a4',
};

const fontSizes = ['12px', '14px', '16px', '20px', '24px', '29px', '35px', '40px'] as any;
fontSizes.body = '16px';
fontSizes.heading = '20px';
fontSizes.caption = '12px';

const theme = mergeTheme(defaultTheme, {
  fontFamilies: {
    display:
      '"Raleway", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    ui: '"Raleway", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    mono: '"SF Mono", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace',
  },
  fontSizes,
  lineHeights: ['18px', '20px', '24px', '28px', '32px', '40px', '48px'],
  colors: {
    border: {
      default: colors.background,
    },
  },
  components: {
    Switch: {},
    Button: {
      appearances: {
        primary: {
          backgroundColor: colors.primary,
          color: colors.pane,
          selectors: {
            _disabled: {
              backgroundColor: '#c8c8c8',
            },
          },
        },
      },
    },
  },
});

type Props = PropsWithChildren<{}>;

export const EvergreenTheme = ({ children }: Props) => <ThemeProvider value={theme}>{children}</ThemeProvider>;
