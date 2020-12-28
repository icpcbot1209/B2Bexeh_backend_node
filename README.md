# B2B sports market backend

## structure

This file structure is for the firebase functions hosting.<br/>

## how to develop

`npm start` or `nodemon functions/app_dev.js` <br/>
Express app exists inside of functions folder.<br/>
app_dev.js will run app.js for development. <br/>

# how to deploy to firebase functions hosting

-   Build using `npm run build` <br/>
-   Deploy using `npm run deploy` or `firebase deploy --only functions,hosting`
