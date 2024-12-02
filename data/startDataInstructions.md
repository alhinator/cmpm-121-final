## Instructions for creating a 'start data' file

Line 0: Board width
- Accepts 0x2 through 0x20 as parameter.

Line 1: Board height
- Accepts 0x2 through 0x20 as parameter.

Line 2: Sun "range"
- Accepts 0x1 through 0xA as parameter.

Line 3: Rate at which water hydrates surrounding tiles.
- Accepts 0.1 through 0.9 as parameter.

Line 4: Number of **seeds of each plant** needed to attain victory.
- Accepts 0x1 through 0xFF as parameter.

Line 5...n: 
key:value pair of [plant id, number of seeds to start with] separated by comma.
- Decimal numbers accepted as parameters.
example:
0, 4
means plant with ID 0 starts with 4 seeds.

Copy/paste the contents of the file into 'save.ts' as the const START_DATA. Make sure backticks are used as quotes to preserve newlines.

Example/Default filestring:
0xF
0xF
0x4
0.1
0xA
0, 3
1, 3
2, 3