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
import mask from './img/particle.jpg'
import t2 from './img/wafer_color.png';

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
    this.scene.background = new THREE.Color('rgb(17, 17, 60)');
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.point = new THREE.Vector2();

    this.textures = [
      new THREE.TextureLoader().load(t2)
    ];
    this.mask = new THREE.TextureLoader().load(mask)
    this.time = 0;
    this.move = 0.;

    // allows you to move the mask around with mouse
    //this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.addMesh();
    this.mouseEffects();
    this.render();
  }

  mouseEffects(){
    this.mouseMeshLayer = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(1000,1000),
      new THREE.MeshBasicMaterial()
    );
    this.mouseMeshLayer.rotateX(40);

    window.addEventListener('mousewheel', (e)=>{
      this.move += e.wheelDeltaY/4000;
    });

    window.addEventListener('mousedown', (e)=>{
      gsap.to(this.material.uniforms.mousePressed,{
        duration: 1,
        value: 1,
        ease: "elastic.out(1, 0.3)"
      });
    });

    window.addEventListener('mouseup', (e)=>{
      gsap.to(this.material.uniforms.mousePressed,{
        duration: 1,
        value: 0,
        ease: "elastic.out(1, 0.3)"
      });
    });

    window.addEventListener('mousemove', (e)=>{
      let currentZRotation = -this.mouseMeshLayer.rotation.z;
      let currentMouseX = ( e.clientX / window.innerWidth ) * 2 - 1;
      let currentMouseY = ( e.clientY / window.innerHeight ) * 2 - 1;
      this.mouse.x = ( currentMouseX * Math.cos(currentZRotation) -  currentMouseY  * Math.sin(currentZRotation));
      this.mouse.y = ( currentMouseX * Math.sin(currentZRotation) +  currentMouseY  * Math.cos(currentZRotation));


      this.raycaster.setFromCamera( this.mouse, this.camera );

      //this.mouse.x =  this.mouse.x;

      // calculate objects intersecting the picking ray
      let intersects = this.raycaster.intersectObjects( [this.mouseMeshLayer] );
      //console.log(this.mouse, currentZRotation);
      this.point.x = intersects[0].point.x;
      this.point.y = intersects[0].point.y;
      this.point.z = intersects[0].point.z;
    });
  }
  
  addMesh(){
    this.material = new THREE.ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms:{
        progress: {type:"f", value:0},
        t2:{type:"t",value:this.textures[0]},
        mask:{type:"t",value:this.mask},
        mouse:{type:"t",value:null},
        mousePressed:{type:"t",value:0},
        move:{type:"t",value:0},
        time:{type:"t",value:0},
        transition:{type:"t",value:0},
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
    this.speeds = new THREE.BufferAttribute(new Float32Array(number),1);
    this.offset = new THREE.BufferAttribute(new Float32Array(number),1);
    this.direction = new THREE.BufferAttribute(new Float32Array(number),1);
    this.press = new THREE.BufferAttribute(new Float32Array(number),1);
    function rand(a,b){
      return a + (b-a)*Math.random();
    }
    let index = 0;
    for (let i = 0; i < 512; i++) {
      let posX = i -256;
      for (let j = 0; j < 512; j++) {
        this.positions.setXYZ(index,posX*2, (j-256)*2, 0);
        this.coordinates.setXYZ(index,i,j,0);
        this.speeds.setX(index,rand(0.4, 1));
        this.offset.setX(index,rand(-1000, 1000));
        this.direction.setX(index,Math.random()>0.5? 1: -1);
        this.press.setX(index,rand(0.4, 1));
        index++;
      }      
    }
    this.geometry.setAttribute("position", this.positions);
    this.geometry.setAttribute("aCoordinates", this.coordinates);
    this.geometry.setAttribute("aSpeed", this.speeds);
    this.geometry.setAttribute("aOffset", this.offset);
    this.geometry.setAttribute("aDirection", this.direction);
    this.geometry.setAttribute("aPress", this.press);
    this.mesh = new THREE.Points( this.geometry, this.material );
    this.mesh.rotateX(40)
    // this.mesh.rotateY(40)
    this.scene.add(this.mesh);
  }



  render(){
    this.time++;
    // rotates mesh and mouse 
    let roation = 0.001;
    this.mouseMeshLayer.rotation.z += roation;
    this.mesh.rotation.z += roation;

    // let next = (Math.floor(this.move)+40)%2;
    // stuff for image shift
    // let prev = (Math.floor(this.move)+41)%2;
    // this.material.uniforms.t2.value = this.textures[next];
    // this.material.uniforms.t1.value = this.textures[prev];

    // console.log(this.material.uniforms.transition.value)
    if (this.time > 20 && this.material.uniforms.transition.value < 1.5) {
      this.material.uniforms.transition.value += .0111;
    } 

    // this.material.uniforms.t1.value = this.textures[1];
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.move.value = this.move;
    this.material.uniforms.mouse.value = this.point;
    this.renderer.render(this.scene,this.camera)
    window.requestAnimationFrame(this.render.bind(this));
  }

}

new Sketch({
  dom: document.getElementById("container"),
});
