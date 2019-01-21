from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from Game import game

import uuid

app = Flask(__name__, static_folder="../static/dist", template_folder="../static")
# app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
lizardwarp = game.Game(socketio)

@app.route("/")
def index():
    return render_template("index.html")

# @socketio.on('connect', namespace='/')
# def send_uuid():
#     emit('uuid', {'uuid': str(uuid.uuid1())})
#
# @socketio.on('disconnect', namespace='/')
# def test_disconnect():
#     print('Client disconnected')
#
# @socketio.on('username', namespace='/')
# def set_username(json):
#     print(json)

if __name__ == "__main__":
    socketio.run(app)
