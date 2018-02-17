# Setting up & deploying the project

* run `npm install`
* Create a .private.json file in the following format:

```javascript
{
    "email": "<email>",
    "password": "<password>",
    "branch": "default",
    "ptr": false,
    "private_directory": "/cygdrive/c/path/to/local/screeps/server/"
    # don't miss the final backslash
}
```

## Deploying

* run `grunt screeps` to deploy the code in `./src` to the "default" branch on the main screeps server.
* run `grunt screeps --branch=dev` to deploy to the dev branch.
