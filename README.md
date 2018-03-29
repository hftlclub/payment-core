# Core-Server

## Requirements
```
NodeJS >= 8.5 (8.X LTS may work aswell)
MySQL >= 5.6 in traditional mode with InnoDB support
```

## Installation
change .env vars within [.env](.env)

install Core-Application 
```bash
git clone https://github.com/hftlclub/payment-core
cd payment-core
npm install
```

install Database Tables (will ask for confirmation)
```bash
cd ./payment-core/install
node reinstall.js
```

core-server can be started by
```bash
npm run start
```

## Mail-Modul
change SMPT-Data and E-Mail-Settings
within file [email.js](/Core/lib/email.js)


## Testing
**Important:** 
* the target core-server needs to be shut down when running tests
* it is required to set the NODE_ENV to 'development' (within the .env file)

testing can be started by using the command
```bash
npm run test
```
for debugging support, execute testrunner directly
```bash
cd tests
node ./runTests.js
```
