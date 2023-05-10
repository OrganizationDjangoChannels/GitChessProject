import psycopg2
from decouple import Config, RepositoryEnv
from secrets import token_urlsafe
from time import time

DOTENV_FILE = "..\\..\\HelloChessChannels\\.env"
env_config = Config(RepositoryEnv(DOTENV_FILE))

connection = psycopg2.connect(
    database="postgres",
    user=env_config.get('USER'),
    password=env_config.get('PASSWORD'),
)

print('PostgreSQL connection is opened')

cur = connection.cursor()

path_to_puzzles = "..\\..\\static\\ChessChannelsApp\\puzzles\\"

DEFAULT_PUZZLE_RATING = 1000
DEFAULT_USERS = ""

filenames = [
    'checkmate_in_1.txt',
    'checkmate_in_2.txt',
    'checkmate_in_3.txt',
    'checkmate_in_4.txt',
    'hard_puzzles.txt',
]
# the order of filenames defines the order of puzzles in the database


def main():
    field_id = 1
    for filename in filenames:

        with open(path_to_puzzles + filename, "r") as file:

            for line in file.readlines():
                stripped_line = line.strip("\n")

                puzzle_token = token_urlsafe(16)
                fen, moves, board_orientation = stripped_line.split(' & ')

                values = (field_id, puzzle_token, fen, moves, DEFAULT_PUZZLE_RATING, board_orientation, DEFAULT_USERS)
                insert_query = 'INSERT INTO public."ChessChannelsApp_puzzle"\
                (id, token, fens, moves, puzzle_rating, board_orientation, users)\
                 VALUES (%s, %s, %s, %s, %s, %s, %s);'

                cur.execute(insert_query, values)
                connection.commit()

                field_id += 1

    cur.close()
    connection.close()
    print('PostgreSQL connection is closed')


if __name__ == '__main__':
    start_time = time()
    main()
    end_time = time()

    print(f'Loading took {end_time - start_time} seconds.')
