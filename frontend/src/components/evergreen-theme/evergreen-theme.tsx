import { PropsWithChildren } from 'react';
import { ThemeProvider, defaultTheme, mergeTheme } from 'evergreen-ui';

const theme = mergeTheme(defaultTheme, {
  components: {
    Button: {
      appearances: {
        primary: {
          backgroundColor: '#317372',
          color: 'white',
        },
      },
    },
  },
});

type Props = PropsWithChildren<{}>;

export const EvergreenTheme = ({ children }: Props) => <ThemeProvider value={theme}>{children}</ThemeProvider>;
