# Grocery Store Service
This is a test service to handle a grocery network and its employees and managers.

## Prerequisites / Setting up for first time
What you need to install before running this app:
- Make sure you have git, nvm, npm, [Node.js](https://nodejs.org/en/download) installed,
- Install [MongoDB](https://docs.mongodb.com/manual/installation) and [Redis](https://redis.io/download) in your system and set necessary configurations,
- Do not forget to check your environment settings in `.env`

## Get the project and install npms
- Clone the project `git clone https://github.com/amin4193/grocery-store-service.git`
- Go to the project folder and run: `npm i`

## Run Application
First you need to install [typescript](https://www.npmjs.com/package/typescript) globally and compile typescript codes into javascript by:

```
npm i -g typescript

npm run build
```

This will create a `dist` folder and put all compiled .js files in there. You can change and set your own configurations by modifying `tsconfig.json` file.

Finally, you can start the project by:

```
node dist/server.js
```

or

```
npm start
```

You can also install [nodemon](https://www.npmjs.com/package/nodemon) globally in your system and simply use code below:

```
npm i -g nodemon

nodemon
```

### Note1:
For security reasons, you should put "sslCert" folder into `.gitignore` file in production mode.

### Note2:
If you want to directly run `server.ts` file, you can do this change in `package.json`:

```
...
"main": "./src/server.ts",
...
...
"scripts": {
  ...
  "start": "nodemon --watch '*.ts' --exec 'ts-node' src/server.ts",
  ...
}
```

and then run: `nodemon`

## Test Application
For test we used [Jest](https://jestjs.io/docs/getting-started) for functional testing and unit testing. you can write your own tests in `__test__` folder by creating new `your_entity.test.js` and then just run:

```
npm run test
```

You should run each entity separately to avoid conflict between entities relations:
```
npm run test -- __tests__/node.test.js
```

### Note3:
After development and test, you should put the following script in `.gitignore` file to prevent pushing tests files in production mode repositories:

```
# test folder
__tests__
```

## Docker and Deployment
There is a folder `.docker` to handle containerizaton prerequisits such as `.dockerfile`, `docker-compose`, and `.env` file for it. You can simply go to `.docker` folder and set your own configs in `docker-compose.yml` file and run:

```
sudo docker-compose up --build
```
