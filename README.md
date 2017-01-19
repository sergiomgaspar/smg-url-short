# URL Shortener Microservice

This api was created for the FreeCodeCamp exercice "URL Shortener Microservice"

* [FreeCodeCamp] - Link to the exercice
* [Heroku] - Online deployed version

### API description

The URL Shortener API must store, retrive and redirect the URL's defined by the user.
No authentication is necessary and the URL is stored for later use by any user.

  - **Use-case 1:** User can pass a URL as a parameter and will receive a shortened URL in the JSON response.
  - **Use-case 2:** If uers passes an invalid URL that doesn't follow the valid *http://www.example.com* format, the JSON response will contain an error with that indication.
  - **Use-case 3:** When the user visits a shortened URL, he/she will be redirected me to the original link.

   
## Example (get short URL)
Use the URL below to get the URL shortened
```sh
https://smg-url-short.herokuapp.com/new/https://www.google.com
```

### JSON Response
```sh
{
  "original_url": "http://www.google.com",
  "short_url": "https://smg-url-short.herokuapp.com/120"
}
```

## Example (use short URL)
To be redirected to the original URL follow the URL:
```sh
https://smg-url-short.herokuapp.com/120
```

## Local Installation

You'll need to have the latest verison of node.js installed. Either use your OS's package manager or follow the installation instructions on the [official website](http://nodejs.org).

Next, [install git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) if it is not already installed. To clone this repository to your local machine, open a command line interface and navigate to your projects directory. Then type

`$ git clone https://github.com/sergiomgaspar/smg-url-short.git`

Move to the `smg-url-short` subdirectory and type `npm install`. This installs all of the API dependencies.

Finally, type `npm start` to start the application. If all goes well, it will be available at `http://localhost:3000`.

### IMPORTANT
This node app uses MongoDB (free mongoLab instance). The user/password are not correct and you will not be able to logon. Create your instance in mongoLab and **allways define the user and password and environment variables** *(never leave them inside code commited in gitHub!!!)*.

## Technologies used
This is a very small example of an API created in NodeJS using the Express Framework and MongoDB.

## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

To the extent possible under law, the author has waived all copyright and related or neighboring rights to this work.

[FreeCodeCamp]: <https://www.freecodecamp.com/challenges/url-shortener-microservice>
[Heroku]: <https://smg-url-short.herokuapp.com/>
