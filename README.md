# HubSpot Navigator

A chrome extension to ease the navigation and use of HubSpot.

### TODO

- [x] Cleanup navigation parsing logic, remove any hardcoded values
- [x] Use some sort of frecency algorithm to determine the order of the navigation items
- [x] Having access to common actions like "Create Contact" or "Create Company" would be nice
- [x] Add a way to switch portals
- [ ] Add a settings page to allow users to customize the navigation items
- [ ] investigate ways to get the settings navigation structure without visiting the settings page
- [ ] Add a way to search for contacts, companies, deals, etc
- [ ] `waitForElements` etc should timeout after a certain amount of time
- [ ] scraping the Settings causes everything else to hang forever because of the `waitForElements` calls, needs to use a default if the settings page is not available
