import { ListNavEntry } from '@src/types';

export async function getActions(): Promise<ListNavEntry[]> {
  return [
    {
      id: 'create-contact-action',
      href: '/contacts/%PORTALID%/contacts/list/view/all?createNewObject=CONTACT',
      label: 'Create Contact',
      type: 'action',
      description: 'Create a new Contact',
      metadata: {},
    },
    {
      id: 'create-company-action',
      href: '/contacts/%PORTALID%/companies/list/view/all?createNewObject=COMPANY',
      label: 'Create Company',
      type: 'action',
      description: 'Create a new Company',
      metadata: {},
    },
    {
      id: 'create-deal-action',
      href: '/contacts/%PORTALID%/objects/0-3/views/all/list?createNewObject=DEAL',
      label: 'Create Deal',
      type: 'action',
      description: 'Create a new Deal',
      metadata: {},
    },
    {
      id: 'create-ticket-action',
      href: '/contacts/%PORTALID%/objects/0-5/views/all/list?createNewObject=TICKET',
      label: 'Create Ticket',
      type: 'action',
      description: 'Create a new Ticket',
      metadata: {},
    },
    {
      id: 'import-data-action',
      href: '/import/%PORTALID%',
      label: 'Import Data',
      type: 'action',
      description: 'Import or sync your data to HubSpot',
      metadata: {},
    },
    {
      id: 'edit-portal-object-properties',
      href: '/property-settings/%PORTALID%/properties?type=0-2&eschref=%2Fcontacts%2F21431171%2Fobjects%2F0-2%2Frestore',
      label: 'Edit Object Properties',
      type: 'action',
      description: 'Edit the properties of your objects',
      metadata: {},
    },
    {
      id: 'create-goal',
      href: '/goals/%PORTALID%/create/2',
      label: 'Create Goal',
      type: 'action',
      description: 'Create a new Goal',
      metadata: {},
    },
  ];
}
