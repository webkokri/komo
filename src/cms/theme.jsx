import { createContext, useContext } from 'react';

/** 'floral' (default: blooms, leaves, soft fades) or 'corporate' (sharp lines, grids, slide-and-wipe motion). Set per page in the admin. */
export const ThemeContext = createContext('floral');
export const useTheme = () => useContext(ThemeContext);
