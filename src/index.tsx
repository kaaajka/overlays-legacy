import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { PageChannel } from "./components/PageChannel";
import { PageChannelSubs } from "./components/PageChannelSubs";
import { PageChannelFollowers } from "./components/PageChannelFollowers";
import { PageChannelQueue } from "./components/PageChannelQueue";

const routePrefix = process.env.PUBLIC_URL;
const channelIdRegex = ':id([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})';

ReactDOM.render(
    <React.StrictMode>
        <Router>
            <Switch>
                <Route exact={true} path={`${routePrefix}/channel/${channelIdRegex}`} component={PageChannel} />
                <Route exact={true} path={`${routePrefix}/channel/${channelIdRegex}/subs`} component={PageChannelSubs} />
                <Route exact={true} path={`${routePrefix}/channel/${channelIdRegex}/followers`} component={PageChannelFollowers} />
                <Route exact={true} path={`${routePrefix}/channel/${channelIdRegex}/queue`} component={PageChannelQueue} />
            </Switch>
        </Router>
    </React.StrictMode>,
    document.getElementById("root")
);
