import { getContacts } from "@/actions/contact";
import ContactsSection from "@/components/admin/ContactsSection";

const ContactUsReqsPage = async () => {
  const res = await getContacts();

  if (!res.success) {
    return <div className="mt-4 text-red-600">Failed to load contacts</div>;
  }

  const contacts = res.data?.contacts ?? [];

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Us Requests</h1>
          <p className="text-gray-600">View all contact requests</p>
        </div>
      </div>
      {contacts.length === 0 ? (
        <div className="mt-4 text-gray-600">No contact requests found</div>
      ) : (
        <ContactsSection contacts={contacts ?? []} />
      )}
    </div>
  );
};

export default ContactUsReqsPage;
