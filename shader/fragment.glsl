varying vec2 vCoordinates;
varying vec3 vPos;
uniform sampler2D t1;
uniform sampler2D t2;
uniform sampler2D mask;
uniform float move;

void main() {
  vec4 maskTexture = texture2D(mask, gl_PointCoord);
  vec2 myUV = vec2(vCoordinates.x/512., vCoordinates.y/512.);
  vec4 image = texture2D(t2, myUV);

  // stuff for image shift 
  //vec4 image2 = texture2D(t2, myUV);
  //vec4 final = mix(image, image2, smoothstep(0.,1.,fract(move)));

  float alpha = 1. - clamp(0., 1.,abs(vPos.z/900.));

  //image shift final otherwise just image.
  //gl_FragColor = final;
  gl_FragColor = image;

  gl_FragColor.a *=maskTexture.r *alpha;
  //gl_FragColor = vec4(alpha);
}