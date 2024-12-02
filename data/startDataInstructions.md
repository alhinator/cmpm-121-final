## Instructions for creating a 'start data' file

Line 1, character 0: Board width
- Accepts 0x2 through 0xF as parameter.

Line 1, character 1: Board height
- Accepts 0x2 through 0xF as parameter.

Line 1, character 3: Sun "range"
- Accepts 0x1 through 0xF as parameter.

Line 1, character 4: Rate at which water hydrates surrounding tiles.
- Accepts 1 through 9 as parameter.

Line 1, character 5: Number of **seeds of each plant** needed to attain victory.
- Accepts 0x1 through 0xF as parameter.

Line 2...n: 
key:value pair of [plant id, number of seeds to start with] separated by comma.
- Decimal numbers accepted as parameters.
example:
0, 4
means plant with ID 0 starts with 4 seeds.

