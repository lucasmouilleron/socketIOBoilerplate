socketIOBoilerplate
===================

Features
--------
- A nice and simple socketIO boilerplate
- Client master / Client slave / Server relationship
- Stack : socketIO, node, scss, requirejs
- Build : install, build, watch, grunt, bower

Install requirements
--------------------
- Install NodeJS : http://nodejs.org/download
- `sudo gem install compass`
- `sudo npm install bower -g`
- `sudo npm install grunt -g`
- `sudo gem install sass`
- `sudo gem install --pre sass-css-importer`

Install
-------
- `cd _build && npm install`

Build
-----
- Modify `client-master/_dev/js/libs/config.js`
- Modify `client-slave/_dev/js/libs/config.js`
- Modify `server/libs/config.json`
- `cd client-master/_build && grunt build`
- `cd client-slave/_build && grunt build`

Run
---
- `cd server && ./run` (debug : `cd server && ./run-debug`)
- Open [http://localhost.com/client-slave](http://localhost.com/client-slave)
- Open [http://localhost.com/client-master](http://localhost.com/client-master)
- And anoter one [http://localhost.com/client-master](http://localhost.com/client-master)

TODO
----
- JWT authentication (via middleware)

Credits
-------
Thanks to the guys at [http://socket.io](http://socket.io)