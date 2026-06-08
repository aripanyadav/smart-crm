import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto py-12">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-400">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, update your profile, use our services, or communicate with us. This includes your name, email address, phone number, and any business data you input into the Nowworks CRM.</p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to operate and improve our services, authenticate users, provide customer support, and send necessary administrative communications.</p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Data Security</h2>
          <p>We implement industry-standard security measures to protect your personal information and business data. However, no electronic transmission or storage is 100% secure.</p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Sharing of Information</h2>
          <p>We do not sell your personal information. We may share information with trusted third-party service providers that assist us in operating our platform, subject to strict confidentiality agreements.</p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@nowworks.com.</p>
        </div>
      </div>
    </div>
  );
}
