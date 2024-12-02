## Instructions for creating a 'start data' file

Line 0: Board width

-    Accepts 0x2 through 0x20 as parameter.

Line 1: Board height

-    Accepts 0x2 through 0x20 as parameter.

Line 2: Sun "range"

-    Accepts 0x1 through 0xA as parameter.

Line 3: Rate at which water hydrates surrounding tiles.

-    Accepts 0.1 through 0.9 as parameter.

Line 4: Number of **seeds of each plant** needed to attain victory.

-    Accepts 0x1 through 0xFF as parameter.

SEEDS Section
Up to the number of seeds in PlantData.json, list the following:
key:value pair of [plant id, number of seeds to start with] separated by comma.

-    Decimal numbers accepted as parameters.
     example:
     0, 4
     means plant with ID 0 starts with 4 seeds.
CONDITIONS Section
Condition change + new value + "turn" + turn start + turn end
-    conditions can be:
-    "sun_range"
-    "water_rate"
Ensure condition changes for the same parameter are in numerical order.

Example filestring:
0xF
0xF
0x4
0.1
0xA
0, 3
1, 3
2, 3
sun_range 0x5 turn 6 8
sun_range 0x1 turn 10 11
water_rate 0.6 turn 30 35
