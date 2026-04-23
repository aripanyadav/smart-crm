import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Mail, Phone, Building, Users } from 'lucide-react';
import { contactsService } from '../services/contacts';
import type { Contact } from '../services/contacts';
import ContactFormModal from '../components/ContactFormModal';
import { useToast } from '../contexts/ToastContext';
import { AlertCircle } from 'lucide-react';

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const { toast } = useToast();

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await contactsService.getContacts();
      setContacts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      await contactsService.deleteContact(id);
      setContacts(contacts.filter(c => c.id !== id));
      toast('Contact deleted successfully', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to delete contact', 'error');
    }
  };

  const openAddModal = () => {
    setContactToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setContactToEdit(contact);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your clients and leads</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No contacts yet</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Get started by adding your first contact to keep track of your leads and clients.
          </p>
          <button
            onClick={openAddModal}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Contact
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditModal(contact)}
                  className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(contact.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                  {(contact.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-10">{contact.name}</h3>
                  {contact.company && (
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5" />
                      {contact.company}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mt-4 text-sm text-gray-600 dark:text-gray-300">
                {contact.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{contact.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ContactFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchContacts}
        contactToEdit={contactToEdit}
      />
    </div>
  );
}
