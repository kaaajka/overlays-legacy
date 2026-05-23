import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { PageChannel } from "./components/PageChannel";
import { PageChannelSubs } from "./components/PageChannelSubs";
import { PageChannelFollowers } from "./components/PageChannelFollowers";
import { PageChannelQueue } from "./components/PageChannelQueue";
import { NotFound } from "./components/NotFound";

const routePrefix = import.meta.env.BASE_URL.replace(/\/$/, "");
const channelIdRegex = ':id([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})';

ReactDOM.render(
    <React.StrictMode>
        <Router>
            <Switch>
                <Route exact={true} path={`${routePrefix}/channel/${channelIdRegex}`} component={PageChannel} />
                <Route exact={true} path={`${routePrefix}/channel/${channelIdRegex}/subs`} component={PageChannelSubs} />
                <Route exact={true} path={`${routePrefix}/channel/${channelIdRegex}/followers`} component={PageChannelFollowers} />
                <Route exact={true} path={`${routePrefix}/channel/${channelIdRegex}/queue`} component={PageChannelQueue} />
                <Route exact={true} path={`${routePrefix}/TIP_ALERT/${channelIdRegex}`} component={PageChannel} />
                <Route exact={true} path={`${routePrefix}/SUB_GOAL/${channelIdRegex}`} component={PageChannelSubs} />
                <Route exact={true} path={`${routePrefix}/FOLLOW_GOAL/${channelIdRegex}`} component={PageChannelFollowers} />
                <Route exact={true} path={`${routePrefix}/QUEUE/${channelIdRegex}`} component={PageChannelQueue} />
                <Route component={NotFound} />
            </Switch>
        </Router>
    </React.StrictMode>,
    document.getElementById("root")
);
