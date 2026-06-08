import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto py-12">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-400">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using the Nowworks platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our service.</p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Description of Service</h2>
          <p>Nowworks provides an AI-powered business workspace, including CRM tools, digital ledger (Khata Book), invoice generation, and task management. We reserve the right to modify or discontinue any feature without notice.</p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. User Accounts</h2>
          <p>You are responsible for safeguarding your account password and for all activities under your account. You must provide accurate, complete, and current information upon registration.</p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Acceptable Use</h2>
          <p>You agree not to use the service for any illegal or unauthorized purpose, nor violate any laws in your jurisdiction while using the platform.</p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Limitation of Liability</h2>
          <p>In no event shall Nowworks be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the service.</p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">6. Contact Information</h2>
          <p>For questions regarding these Terms, please reach out to us at legal@nowworks.com.</p>
        </div>
      </div>
    </div>
  );
}
