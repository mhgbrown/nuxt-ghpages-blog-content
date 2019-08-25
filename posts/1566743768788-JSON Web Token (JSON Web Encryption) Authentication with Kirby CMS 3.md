---
title: JSON Web Token (JSON Web Encryption) Authentication with Kirby CMS 3
date: 1566743768788
---

In yet another recent project, I'm building a book proposal submission platform with a Vuejs frontend and a [Kirby CMS](getkirby.com) backend. Kirby supports the use of [HTTP Basic Autentication](https://getkirby.com/docs/guide/api/authentication#http-basic-auth) to make interacting with it via a custom web client (e.g. Vuejs) nice and easy. In my case, I need to interact with Kirby _securely_ to tell it to create a new page (a new "Book") without requiring a user to create an account or login.

A way to approach this is:
1. Create an API user
2. Grant the API user only the permissions it must have
3. Perform actions via our Kirby API by providing an `Authorization` header
4. Validate the `Authorization`
5. Return the result

This approach works, but is, well, problematic. The `Authorization` header is constucted in the following way:

```javascript
'Authorization: Basic ' + base64_encode($email + ':' + $password)
```

As a consquence of providing this information to a frontend client, we're exposing login credentials to our backend in cleartext! Bad! You can disable panel access for specific users using the [Kirby user permissions settings](https://getkirby.com/docs/guide/users/permissions), but _panel access is required to do anything with the backend!_ We don't want strangers getting into our backend (🙃) so we need to hide these credentials.

A [JSON Web Token (JWT)](https://jwt.io/) is a stateless mechanism to securely exchange claims (data, payload) between two parties. It's basically a string divided into three base64 encoded parts, one of which contains the claims we want to exchange. There are two "implementations" of a JWT, JSON Web Signature (JWS) and JSON Web Encryption (JWE). The most common implemenation is the JWS, which provides a mechanism to ensure that claim data hasn't been tampered with, but _in which claim data is ultimately public_, meaning anyone can know the data you're exchanging. A JWE takes this a step further by encrypting the payload, hiding the claims you intend to exchange.

How can a JWE help us interact securely with Kirby?
1. It's stateless. We don't need any additional session storage mechanisms.
2. It's encrypted. We can hide our API user credentials.
3. It's server driven. Our frontend application doesn't need to know how to authenticate.

Our new approach looks like this:
1. Create an API user
2. Grant the API user only the permissions it must have
3. Set an HTTP-only cookie when the site is loaded, whose value is a JWE with its payload set to the `Authorization` header value.
4. Perform actions via our Kirby API; the cookie is automatically sent with each request.
5. Validate the JWE
6. Validate the Authorization
7. Return the result

We're not going to generate the JWE ourselves, because there are many good packages out there to do it for us. I've chosen [kelvinmo/simplejwt](https://github.com/kelvinmo/simplejwt) because it works with the default PHP environment provided by my hosting. There might be better/faster/stronger libraries out there — this one works for me because I can't change anything about the PHP installation (😭).

In your Kirby project, do the following to install the JWE package
```bash
$ composer install kelvinmo/simplejwt
```

First, we set up our keyset and our API. The keyset is used to encrypt and decrypt JWE tokens. Our API is programmed as a layer on top of Kirby's API, one which performs the JWE validation, retrieves the authorization payload, pushes the authorized request to Kirby, and returns the result. The API will be mounted at `/rest` (e.g. `/rest/pages/books`).

```php
site/config/config.php

<?php
use SimpleJWT\Keys\KeySet;
use SimpleJWT\Keys\SymmetricKey;
use SimpleJWT\JWE;

// create the keyset, which will be used to encrypt and decrypt the JWE
$set = new KeySet();
$set->add(new SymmetricKey([
  "kty" => "oct",
  "k" => "<SOME-SECRET-KEY>"
], 'php'));

return [
  // add our keyset to application data so we can use it later
  'jwt' => [
    'keySet' => $set
  ],
  // enable authentication via Authorization header
  'api' => [
    'basicAuth' => true
  ],
  // our api request handler
  'routes' => [
    [
      'pattern' => '/rest/(:all)',
      'method'  => 'GET|POST|DELETE|PATCH',
      'env'     => 'api',
      'action'  => function ($path = null) {
        $kirby = kirby();

        // decrypt and verify JWE token
        $keySet = $kirby->option('jwt.keySet');
        $token = cookie::get('jwt');
        $jwe = JWE::decrypt($token, $keySet, 'PBES2-HS256+A128KW');
        $payload = json_decode($jwe->getPlaintext(), true);

        // set jwt in headers for Kirby to pick up for render()
        // set both plain and redirect as $request->headers() can produce an array
        // with an Authorization value of REDIRECT_HTTP_AUTHORIZATION if it's set
        $_SERVER['HTTP_AUTHORIZATION'] = $payload['authorization'];
        $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] = $payload['authorization'];
        // Run the request through the Kirby instance and capture the
        // response
        $request = $kirby->request();
        $render = $kirby->api()->render($path, $this->method(), [
          'body'    => $request->body()->toArray(),
          'headers' => $request->headers(),
          'query'   => $request->query()->toArray(),
        ]);
        return $render;
      }
    ]
  ]
];
```

Our API and validation are set up, now let's distrubute the cookie and JWE to the client so it can interact with our API and ultimately, Kirby. In my setup, a Vuejs application is served on initial load. The `site.php` controller sets the cookie at this point.


```php
site/controllers/site.php

<?php

use SimpleJWT\JWE;

return function ($page, $site, $kirby) {
  // create the authorization header value
  $authorization = 'Basic ' . base64_encode('<API-USER-EMAIL>' . ':' . '<API-USER_PASSWORD>');
  // payload must be a string
  $payload = json_encode([
    // optional: "identify" a user by their IP address
    'uid' => $_SERVER['REMOTE_ADDR'],
    'authorization' => $authorization
  ]);

  // set headers according to desired encryption type
  $headers = ['alg' => 'PBES2-HS256+A128KW', 'enc' => 'A128CBC-HS256'];
  $jwe = new JWE($headers, $payload);
  // produce the final token as a string
  $token = $jwe->encrypt($kirby->option('jwt.keySet'));

  // httpOnly to ensure that it's not programmatically accessible in the browser environment
  cookie::set('jwt', $token, ['httpOnly' => true]);

  return [];
};
```

If you inspect your application in the browser, you should see a cookie called "jwt" with a value that looks something like this:
```bash
01f5590ea2540ba76b6bab6846f10e72ab24ceb5%2BeyJhbGciOiJQQkVTMi1IUzI1NitBMTI4S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwicDJzIjoiQjlTaW1xemhQeEUiLCJwMmMiOjQwOTZ9.9_faQkyI0FdE5lCSdbg5iNNzpTWwL2xRPte8Zq8_cgksCJPWd2fEAw.PrQFpg9HOuStzBWYlUlk4w.NfLBCpAVSgG05QzybfW0_IEFADlzArd0bueC56NANHa0vVYbD3hOR1WaOXIZKpv24h3LK2F3S-n5TWhp0kZJfob1W2xt1Y5gh3knZxUoMf9FKX3KIWvRqN32-HkGiACLL2VH7b8rQXz1jkUyFt5VdQ.ZfOn8aqn6Z4CPwgn5WoGkw
```

Every request we make to our API will include this cookie (because that's the way cookies work 🌈) and therefore the credentials needed to do things in Kirby world. Our credentials are hidden and our frontend application needs to know nothing about how to authenticate. Cool!
