# Theahealth - An Platform for Healthcare

Thea Health is a eConsult platform that streamline care coordination between primary care practitioners and specialist. It include integration with smart FHIR, fetch patient details from there and send those details to other providers through secure messaging system.

## SMART Technical Documentation

This is the SMART technical documentation, hosted at
<http://docs.smarthealthit.org>

- See <http://smarthealthit.org> for high-level project info and news
- Need help? Ask a question at <http://groups.google.com/group/smart-on-fhir>
- Found an error in these docs? Fork them on Github and send us a pull
  request!

### Requirements

- Clone the repo: `https://github.com/harrycooke/theaShared.git`
- [Nodejs](https://nodejs.org/en/download/package-manager)
- [Postgres](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-16-04)
- [Postgres hstore extension](http://www.postgresqltutorial.com/postgresql-hstore/)
- Data Base setup
	- Create a Database name theahealth `CREATE DATABASE theahealth`
	- Download a script file name `theahealth.backup` from path `/public/db/`
	- Restore downloaded database to the newly created Data base in local system.

### Running documentation locally

- Clone the repo: `https://github.com/harrycooke/theaShared.git`
- Go to Terminal at project folder and run `cd theahealth`
- Run `npm install` to install Node.js dependencies.
- Open `http://localhost:3000/launch` in your browser.
- Select your Patient & Provider from App Launch Options.
- Click `Launch App!` for launch application with corresponding Provider and Patient

You should see something like

    Conencted successfully!
    Available on: http://localhost:3000

You can stop the server if needed using <kbd>Ctrl+C</kbd>