# basic layout
all values are encoded in little-endian, first two bytes are the length of this argument, next byte after that is the type

# argument values
0x0zzz
0xfxyy
 | specifies that this value is special
x -> a 0-10 value (not sure if thats truly limited internally or not) that refers to the var map id used to map out the specified paramater (none if zero)
y -> the paramater that gets mapped to this argument
z -> a uint value

# instructions
| Name | Byte | Arguments | Extra |
| --- | --- | --- | --- |
| Information | `0x00` | opts, width, height | |
| Sprite | `0x01` | id, height (rows), width (bytes) | after the arguments is a list of bytes that make up the sprites bitmap |
| VarMap | `0x02` | id, stepCount | after the arguments is a list of integer pairs, making up the var map |
| CopyBits | `0x03` | opts, spriteID, srcX, srcY, srcWidth, srcHeight, resultX, resultY | |
| Pixel | `0x04` | opts, x, y | |
| Line | `0x05` | opts, startX, startY, endX, endY | |
| Rectangle | `0x06` | opts, x, y, width, height | |
| Circle | `0x07` | opts, x, y, radius | the x,y refers to the center of the circle |
| NumBox | `0x08` | opts, x, y, value | |
