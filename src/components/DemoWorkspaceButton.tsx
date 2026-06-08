import { useState } from 'react';
import { Rocket, Loader2, CheckCircle2 } from 'lucide-react';
import { demoService } from '../services/demoService';
import { useToast } from '../contexts/ToastContext';

export default function DemoWorkspaceButton() {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  const handleLoadDemo = async () => {
    setLoading(true);
    try {
      await demoService.loadDemoData();
      setCompleted(true);
      toast('Demo workspace loaded successfully! Refreshing...', 'success');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      console.error('Failed to load demo data:', error);
      toast('Failed to load demo data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl font-bold text-sm">
        <CheckCircle2 className="w-4 h-4" />
        Workspace Ready
      </div>
    );
  }

  return (
    <button
      onClick={handleLoadDemo}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Rocket className="w-4 h-4" />
      )}
      Load Demo Workspace
    </button>
  );
}
