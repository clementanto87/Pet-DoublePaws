/**
 * Toast Notification Usage Examples
 * 
 * The toast system is already set up in App.tsx with ToastProvider.
 * Just import and use the hook in any component!
 */

import { useToast } from './Toast';

// Example component showing how to use toasts
export const ToastExamples = () => {
    const { showToast } = useToast();

    return (
        <div className="p-8 space-y-4">
            <h2 className="text-2xl font-bold mb-4">Toast Examples</h2>
            
            <button
                onClick={() => showToast('Operation completed successfully!', 'success')}
                className="px-4 py-2 bg-green-500 text-white rounded"
            >
                Show Success Toast
            </button>

            <button
                onClick={() => showToast('Something went wrong!', 'error')}
                className="px-4 py-2 bg-red-500 text-white rounded"
            >
                Show Error Toast
            </button>

            <button
                onClick={() => showToast('Here is some helpful information', 'info')}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                Show Info Toast
            </button>

            <button
                onClick={() => showToast('Please be careful!', 'warning')}
                className="px-4 py-2 bg-amber-500 text-white rounded"
            >
                Show Warning Toast
            </button>

            <button
                onClick={() => showToast('This toast stays forever!', 'info', 0)}
                className="px-4 py-2 bg-purple-500 text-white rounded"
            >
                Show Persistent Toast (duration: 0)
            </button>
        </div>
    );
};

/**
 * Usage in your components:
 * 
 * 1. Import the hook:
 *    import { useToast } from '../components/ui/Toast';
 * 
 * 2. Use it in your component:
 *    const { showToast } = useToast();
 * 
 * 3. Show toasts:
 *    showToast('Message here', 'success');  // success, error, info, warning
 *    showToast('Message', 'info', 5000);     // with custom duration (ms)
 *    showToast('Message', 'error', 0);       // persistent (no auto-close)
 * 
 * Toast Types:
 * - 'success' - Green with checkmark icon 🎉
 * - 'error' - Red with alert icon 😢
 * - 'info' - Blue with info icon 💡
 * - 'warning' - Amber with warning icon ⚠️
 */

