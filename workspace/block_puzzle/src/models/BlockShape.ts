/* eslint-disable prettier/prettier */
export type BlockShape = number[][];

export class BlockShapeLibrary{
    private static readonly SHAPES: BlockShape[] = [
         //1x1
         [[1]],
         //2x1,
         [[1,]],
         //3x1 
         [[1,1,1]],
         //4x1
         [[1,1,1,1]],

         //1x2
         [[1],[1]],
         //1x3
         [[1],[1],[1]],
         //1x4
         [[1],[1],[1],[1]],

         // L2
         [[1,0],
          [1,1]],

         [[1,1],
          [0,1]],

         [[1,1],
          [1,0]],

         [[0,1],
          [1,1]],
         
         // L3 dọc
         [[1,0],
          [1,0],
          [1,1]],

         [[0,1],
          [0,1],
          [1,1]],

         [[1,1],
          [0,1],
          [0,1]],
     
         [[1,1],
          [1,0],
          [1,0]],
         
         // L3 ngang
         [[1,1,1],
          [1,0,0]],

         [[1,1,1],
          [0,0,1]],

         [[1,0,0],
          [1,1,1]],

         [[0,0,1],
          [1,1,1]],
         
         // T
         [[1,1,1],
          [0,1,0]],

         [[0,1,0],
          [1,1,1]],
         
         [[1,0],
          [1,1],
          [1,0]],

         [[0,1],
          [1,1],
          [0,1]],
         
         // Z
         [[1,1,0],
          [0,1,1]],
         
        [[0,1,1],
         [1,1,0]],

        [[0,1],
         [1,1],
         [1,0]],

        [[1,0],
         [1,1],
         [0,1]],
        
        // square
        [[1,1],
         [1,1]],
        
        [[1,1,1],
         [1,1,1],
         [1,1,1]]
    ]
    public static getAllShape(): BlockShape[]{
        return this.SHAPES;
    }

    public static getRamdomShape(): BlockShape{
        const index = Math.floor(Math.random()*this.SHAPES.length);
        return this.SHAPES[index];
    }
    public static getShape1(): BlockShape{
        return this.SHAPES[this.SHAPES.length-2];
    }
    public static getShape(index: number): BlockShape{
        return this.SHAPES[index];
    }
}
