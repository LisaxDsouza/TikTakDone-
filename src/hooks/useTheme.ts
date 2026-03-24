import {useAppSelector, useAppDispatch} from './useAppDispatch';
import {toggleTheme} from '../store/slices/authSlice';
import {THEMES} from '../constants';

/**
 * Hook to access current theme colors and toggle between dark/light.
 */
export const useTheme = () => {
  const dispatch = useAppDispatch();
  const themeName = useAppSelector(state => state.auth.theme || 'dark');
  
  const colors = THEMES[themeName];
  const isDark = themeName === 'dark';

  const toggle = () => dispatch(toggleTheme());

  return {colors, themeName, isDark, toggle};
};
