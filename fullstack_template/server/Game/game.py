from flask import request
from flask_socketio import SocketIO, emit

class Game:

    # list to contain player queue
    player_queue = []

    def __init__(self, io):
        self.io = io

        # List all io events and their respective functions
        io.on_event('connect', self.send_uuid)
        io.on_event('disconnect', self.disconnect)
        io.on_event('username', self.username)

    def send_uuid(self):
        emit('uuid', {'uuid': str(request.sid)})

    def disconnect(self):
        print('disconnect')

    def username(self,json):
        self.player_queue.append(json)
        print(self.player_queue)
