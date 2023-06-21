precision mediump float;

uniform vec4 u_diffuse;
uniform vec3 u_lightPos;
uniform vec3 carLightPosition;
uniform sampler2D u_texture;

uniform vec3 lights_position[10];
uniform vec3 u_carBackLightsPosition[6];

varying vec2 textcoord;
varying float constant;
varying vec3 Normal;
varying vec3 FragPos;
varying vec3 realPos;
varying vec3 vertPos;
uniform float u_onLamps;
uniform float u_onBackLights;
uniform float u_LightsPower;

uniform float brightness;
void main () {
    vec3 lightColor = brightness * vec3(0.2,0.2,0.2);
    vec3 objectColor = texture2D(u_texture, textcoord).rgb;
    float ambient = 0.1;


    // main_light
    vec3 N =  normalize(Normal);
    vec3 L = normalize(u_lightPos - vertPos);
    float lambertian = max(dot(N, L), 0.0);
    float specular = 0.0;
    if(lambertian > 0.0) {
      vec3 R = normalize(reflect(-L, N));      // Reflected light vector
      vec3 V = normalize(-vertPos); // Vector to viewer
      float specAngle = max(dot(R, V), 0.0);
      specular = pow(specAngle, 80.0);
    }

    gl_FragColor = vec4(1.0 * vec3(0, 0, 0.1) +
                      1.0 * lambertian * objectColor +
                      1.0 * 0.1 * lightColor, 1.0);



    vec3 spotlight_direction = vec3(0,-1,0);



   if (u_onBackLights == 1.0) {
        for(int i = 0; i < 6; i++){
            if (i>3) {
                spotlight_direction = normalize(vec3(0,-0.7,-1));
                }

            if (i>1) {
               // spotlight_direction = normalize(vec3(0,-1,1));
                }
            vec3 light_pos = u_carBackLightsPosition[i];
            vec3 to_frag = normalize(realPos - light_pos);
            float angle_cos = dot(normalize(spotlight_direction), normalize(to_frag));
            vec4 colorOfLight = vec4(u_LightsPower,0.0,0.0,0.001);
            if (i>1) {
                colorOfLight = vec4(u_LightsPower,u_LightsPower,u_LightsPower,0.001);
            }

            if(angle_cos >= 0.4){
                gl_FragColor += pow(angle_cos,10.0) * vec4(objectColor,1) * colorOfLight;
            }
        }
   }


   spotlight_direction = vec3(0,-1,0);
   if (u_onLamps!= 1.0) {
       return;
   }
    for(int i = 0; i < 8; i++){
        vec3 light_pos = lights_position[i];
        light_pos.y = 10.0;
        light_pos.x -= sign(light_pos.x) * 4.5;
        vec3 to_frag = normalize(realPos - light_pos);
        float angle_cos = dot(normalize(spotlight_direction), normalize(to_frag));

        if(angle_cos >= 0.4){
            gl_FragColor += pow(angle_cos,10.0) * vec4(objectColor,1) * vec4(u_LightsPower,u_LightsPower,0.0,0.001);
        }
    }

}