import { supabase } from './supabase';

export const demoService = {
  async loadDemoData() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('User not authenticated');
    const userId = userData.user.id;

    // 1. Create Contacts (No 'position' column)
    const contacts = [
      { user_id: userId, name: 'Alex Rivera', email: 'alex@lumina.tech', phone: '+1-555-0123', company: 'Lumina Tech' },
      { user_id: userId, name: 'Sarah Chen', email: 'sarah@velocity.io', phone: '+1-555-0145', company: 'Velocity AI' },
      { user_id: userId, name: 'David Miller', email: 'd.miller@global.com', phone: '+1-555-0167', company: 'Global Logistics' }
    ];

    const { data: createdContacts, error: contactsError } = await supabase
      .from('contacts')
      .insert(contacts)
      .select();

    if (contactsError) throw contactsError;

    // 2. Create Leads (No 'notes' column)
    const leads = [
      { user_id: userId, contact_id: createdContacts[0].id, status: 'Interested', value: 12500 },
      { user_id: userId, contact_id: createdContacts[1].id, status: 'New', value: 4500 },
      { user_id: userId, contact_id: createdContacts[2].id, status: 'Converted', value: 28000 }
    ];

    const { data: createdLeads, error: leadsError } = await supabase
      .from('leads')
      .insert(leads)
      .select();

    if (leadsError) throw leadsError;

    // 3. Create Activities
    const activities = [
      { user_id: userId, lead_id: createdLeads[0].id, type: 'Call', notes: 'Discovery call completed. Sent pricing sheet.', date: new Date(Date.now() - 86400000).toISOString() },
      { user_id: userId, lead_id: createdLeads[1].id, type: 'Email', notes: 'Introductory email sent.', date: new Date().toISOString() },
      { user_id: userId, lead_id: createdLeads[2].id, type: 'Meeting', notes: 'Onboarding meeting scheduled.', date: new Date().toISOString() }
    ];

    await supabase.from('activities').insert(activities);

    // 4. Create Transactions
    const transactions = [
      { user_id: userId, type: 'income', amount: 28000, from_entity: 'Global Logistics', to_entity: 'Nowworks Account', date: new Date(Date.now() - 172800000).toISOString(), notes: 'Annual Subscription Payment' },
      { user_id: userId, type: 'expense', amount: 150, from_entity: 'Nowworks Account', to_entity: 'Zoom Video', date: new Date(Date.now() - 86400000).toISOString(), notes: 'Monthly Subscription' },
      { user_id: userId, type: 'income', amount: 4500, from_entity: 'Velocity AI', to_entity: 'Nowworks Account', date: new Date().toISOString(), notes: 'Setup Fee' }
    ];

    await supabase.from('transactions').insert(transactions);

    // 5. Create Follow-ups
    const followUps = [
      { user_id: userId, lead_id: createdLeads[0].id, note: 'Call Alex to discuss enterprise pricing', due_date: new Date(Date.now() + 86400000).toISOString(), status: 'Pending' },
      { user_id: userId, lead_id: createdLeads[1].id, note: 'Follow up on LinkedIn intro', due_date: new Date(Date.now() + 172800000).toISOString(), status: 'Pending' }
    ];

    await supabase.from('follow_ups').insert(followUps);

    return true;
  }
};
