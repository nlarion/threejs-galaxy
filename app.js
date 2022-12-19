// layers with colors
// understand shader
// add mouse
// add bg mesh

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import GUI from "lil-gui";
import gsap from "gsap";
import t1 from './img/t.png';
import t2 from './img/t1.png';
import particleTexture from "./particle.webp";

export default class Sketch {
  constructor(options) {

    this.container = options.dom;
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 3000 );
    this.camera.position.z = 1000;
    this.scene = new THREE.Scene();
    this.textures = [
      new THREE.TextureLoader().load(t1),
      new THREE.TextureLoader().load(t2)
    ];
    this.time = 0;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    

    this.addMesh();
    this.render();


  }

  render(){
    this.time++;
    console.log(this.time);
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.02;

    this.renderer.render(this.scene,this.camera)
    window.requestAnimationFrame(this.render.bind(this));
  }
  
  addMesh(){
    this.material = new THREE.ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms:{
        progress: {type:"f", value:0},
        t1:{type:"t",value:this.textures[0]},
        t2:{type:"t",value:this.textures[1]}
      },
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })
    let number = 512*512;
    this.geometry = new THREE.BufferGeometry();
    this.positions = new THREE.BufferAttribute(new Float32Array(number*3),3);
    this.coordinates = new THREE.BufferAttribute(new Float32Array(number*3),3);
    let index = 0;
    for (let i = 0; i < 512; i++) {
      let posX = i -256;
      for (let j = 0; j < 512; j++) {
        this.positions.setXYZ(index,posX*2, (j-256)*2, 0);
        this.coordinates.setXYZ(index,i,j,0);
        index++;
      }      
    }
    this.geometry.setAttribute("position", this.positions);
    this.geometry.setAttribute("aCoordinates", this.coordinates);
    this.mesh = new THREE.Points( this.geometry, this.material );
    this.scene.add(this.mesh);
  }

}

new Sketch({
  dom: document.getElementById("container"),
});
