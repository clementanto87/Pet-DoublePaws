import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { sitterService } from '../services/sitter.service';

// Determines whether the signed-in user already has a sitter profile.
//
// The backend does not flip user.role to 'sitter' when a profile is
// created, so role is unreliable — the source of truth is whether
// GET /sitters/me returns a profile (404 = not a sitter). Shares the
// ['sitterProfile'] query key with the sitter dashboard so the result
// is cached across the app.
export const useIsSitter = () => {
    const { isAuthenticated } = useAuth();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['sitterProfile'],
        queryFn: sitterService.getMyProfile,
        enabled: isAuthenticated,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    return {
        // Only true once we've confirmed a profile exists.
        isSitter: isAuthenticated && !!data && !isError,
        // While unknown, callers can avoid flashing sitter-only UI.
        isLoading: isAuthenticated && isLoading,
    };
};
