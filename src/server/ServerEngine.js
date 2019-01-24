// ServerEngine.js

module.exports = class ServerEngine {
  constructor() {
    this.clients = [];
  }

  add_client(client) {
    this.register_events(client);
    this.clients.push({
      client: client,
      username: '',
    });
  }

  remove_client(client) {
    this.clients = this.clients.filter(c => {
      return c.client.id !== client.id;
    });
  }

  register_events(client) {
    client.on('username', (username) => {
      this.register_username(client,username)
    });
  }

  register_username(client, username) {
    this.clients.forEach(c => {
      if (c.client.id === client.id) {
        c.username = username;
      }
    });
  }
}
