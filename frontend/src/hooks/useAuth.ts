import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { login, register, logout, fetchProfile, clearError } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: (credentials: { email: string; password: string }) => dispatch(login(credentials)),
    register: (credentials: { username: string; email: string; password: string; display_name?: string }) => dispatch(register(credentials)),
    logout: () => dispatch(logout()),
    fetchProfile: () => dispatch(fetchProfile()),
    clearError: () => dispatch(clearError()),
  };
};
