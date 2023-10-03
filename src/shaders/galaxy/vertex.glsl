uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main()
{
    /**
     * Position
     */
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
   // Randomness
    modelPosition.xyz += aRandomness;
    
    //Spin
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);//modelPosition.xy
    float distanceToCenterB = length(modelPosition.xy);//modelPosition.xy

    float angleOffset = (1.0 / distanceToCenter  / distanceToCenterB) * uTime *3.2;
    angle += angleOffset;
    modelPosition.x = cos(angle) * distanceToCenter *distanceToCenterB *0.5 ;
    modelPosition.z = sin(angle) * distanceToCenter *distanceToCenterB;

    // //Black hol
    // float angleB = atan(modelPosition.x, modelPosition.z);
    // float distanceToCenterBlack = length(modelPosition.xy);//modelPosition.xy

    // float angleOffsetB = (3.0 / distanceToCenterBlack) * uTime ;
    // angleB -= angleOffsetB ;
    // modelPosition.x = cos(angleB) * distanceToCenterBlack ;
    // modelPosition.z = sin(angleB) * distanceToCenterBlack;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;



    /**
    * Size
    */
    gl_PointSize = uSize* aScale;
    gl_PointSize *=(1.0 / - viewPosition.z);


    /**
     * Color
     */
    vColor = color;
}