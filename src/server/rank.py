import gspread
from oauth2client.service_account import ServiceAccountCredentials
import numpy as np

beta = 0.05
alpha = 0.1

def rank_2(p1,p2):
    d1 = np.min((beta, alpha*np.exp(p2-p1)))
    d2 = -d1
    return [d1,d2]

def rank(arr):
    if (len(arr) == 2):
        return rank_2(arr[0],arr[1])
    else:
        d = rank(arr[0:-1])
        d.append(0)
        for i in range(0,len(d)-1):
            d[i] = d[i] + rank_2(arr[i],arr[-1])[0]
            d[-1] = d[-1] - rank_2(arr[i],arr[-1])[0]
        return d


# use creds to create a client to interact with the Google Drive API
scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_name('src/server/secret.json', scope)
client = gspread.authorize(creds)

sheet = client.open("lizard-warp").sheet1

# Extract and print all of the values
list_of_hashes = sheet.get_all_records()
list_of_keys = sorted(list(list_of_hashes[0].keys()));
games = []
players = []
scores = dict()

for hash in list_of_hashes:
    game = []
    for key in list_of_keys:
        if not hash[key] == '':
            game.append(hash[key])
            if not hash[key] in players:
                players.append(hash[key])
    games.append(game)

for player in players:
    scores[player] = 0

for game in games:
    p = []
    for player in game:
        p.append(scores[player])
    d = rank(p)
    for player, score in zip(game,d):
        scores[player] += score

sheet = client.open("lizard-warp").get_worksheet(1)

# Select a range (row by row)
cell_list = sheet.range("A1:A1000")
cell_list.extend(sheet.range("B1:B1000"))

# Set the value
for cell in cell_list:
    cell.value = ''

# Update in batch
sheet.update_cells(cell_list)

list1 = [scores[player] for player in players]
list2 = players

list1, list2 = (list(t) for t in zip(*sorted(zip(list1, list2))))

for player in list2:
    sheet.insert_row([player,int(scores[player]*1000 + 3000)])
