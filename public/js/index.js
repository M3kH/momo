'use strict';

import App from "./app";
import io from "io";
import hasher from "hasher";

var app = new App(io);

// Asher would trigger our App.router
hasher.changed.add(_new => app.router(_new));
hasher.initialized.add( _new => app.router(_new) );
hasher.init();
