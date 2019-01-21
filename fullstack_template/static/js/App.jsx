import React from "react";
import io from 'socket.io-client';

import Username from './Username';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uuid: false,
            endpoint: 'http://' + document.domain + ':' + location.port,
            socket: false,
        };
    }

    componentDidMount() {
        const { endpoint } = this.state;
        const socket = io.connect(endpoint);
        this.setState({ socket });
        socket.on("uuid", data => this.setState({ uuid: data.uuid }));
    }

    sendUsername(username) {
        this.state.socket.emit('username',JSON.stringify({
            uuid: this.state.uuid,
            username: username
        }));
    }

    render () {
        return (
            <div>
                <div className="canvas">{this.state.uuid ? this.state.uuid : 'uuid'}</div>
                <Username sendUsername={this.sendUsername.bind(this)}/>
            </div>
        );
    }
}
