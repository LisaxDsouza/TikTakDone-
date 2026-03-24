// ============================================================
// Typed hooks for Redux (use these instead of plain useDispatch
// / useSelector throughout the app)
// ============================================================
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import type {RootState, AppDispatch} from '../store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
