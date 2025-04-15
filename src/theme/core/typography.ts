import type { TypographyOptions } from '@mui/material/styles/createTypography';

import { setFont, pxToRem, responsiveFontSizes } from '../styles/utils';

// ----------------------------------------------------------------------

declare module '@mui/material/styles' {
  interface TypographyVariants {
    fontSecondaryFamily: React.CSSProperties['fontFamily'];
    fontWeightSemiBold: React.CSSProperties['fontWeight'];
  }
  interface TypographyVariantsOptions {
    fontSecondaryFamily?: React.CSSProperties['fontFamily'];
    fontWeightSemiBold?: React.CSSProperties['fontWeight'];
  }
  interface ThemeVars {
    typography: Theme['typography'];
  }
}

// ----------------------------------------------------------------------

export const defaultFont = 'DM Sans Variable';

export const primaryFont = setFont(defaultFont);

export const secondaryFont = setFont('Barlow');

// ----------------------------------------------------------------------

export const typography: TypographyOptions = {
  fontFamily: primaryFont,
  fontSecondaryFamily: secondaryFont,
  fontWeightLight: '300',
  fontWeightRegular: '400',
  fontWeightMedium: '500',
  fontWeightSemiBold: '600',
  fontWeightBold: '700',
  h1: {
    fontWeight: 800,
    lineHeight: 80 / 64,
    fontSize: pxToRem(32),
    fontFamily: secondaryFont,
    ...responsiveFontSizes({ sm: 40, md: 52, lg: 64 }),
  },
  h2: {
    fontWeight: 800,
    lineHeight: 64 / 48,
    fontSize: pxToRem(28),
    fontFamily: secondaryFont,
    ...responsiveFontSizes({ sm: 32, md: 40, lg: 48 }),
  },
  h3: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(22),
    fontFamily: secondaryFont,
    ...responsiveFontSizes({ sm: 24, md: 26, lg: 32 }),
  },
  h4: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(18),
    ...responsiveFontSizes({ sm: 18, md: 20, lg: 24 }),
  },
  h5: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(16),
    ...responsiveFontSizes({ sm: 16, md: 18, lg: 20 }),
  },
  h6: {
    fontWeight: 600,
    lineHeight: 28 / 18,
    fontSize: pxToRem(15),
    ...responsiveFontSizes({ sm: 15, md: 16, lg: 18 }),
  },
  subtitle1: {
    fontWeight: 600,
    lineHeight: 1.5,
    fontSize: pxToRem(14),
    ...responsiveFontSizes({ sm: 14, md: 15, lg: 16 }),
  },
  subtitle2: {
    fontWeight: 600,
    lineHeight: 22 / 14,
    fontSize: pxToRem(13),
    ...responsiveFontSizes({ sm: 13, md: 13, lg: 14 }),
  },
  body1: {
    lineHeight: 1.5,
    fontSize: pxToRem(14),
    ...responsiveFontSizes({ sm: 14, md: 15, lg: 16 }),
  },
  body2: {
    lineHeight: 22 / 14,
    fontSize: pxToRem(13),
    ...responsiveFontSizes({ sm: 13, md: 13, lg: 14 }),
  },
  caption: {
    lineHeight: 1.5,
    fontSize: pxToRem(11),
    ...responsiveFontSizes({ sm: 11, md: 11, lg: 12 }),
  },
  overline: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(11),
    textTransform: 'uppercase',
    ...responsiveFontSizes({ sm: 11, md: 11, lg: 12 }),
  },
  button: {
    fontWeight: 700,
    lineHeight: 24 / 14,
    fontSize: pxToRem(13),
    textTransform: 'unset',
    ...responsiveFontSizes({ sm: 13, md: 13, lg: 14 }),
  },
};
