import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import galaxyVertexShader from './shaders/galaxy/vertex.glsl'
import galaxyFragmentShader from './shaders/galaxy/fragment.glsl'

THREE.ColorManagement.enabled = false

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {};
parameters.count = 200000;
parameters.size = 0.005;
parameters.radius = 5;
parameters.branches = 3;
parameters.spin = 1;
parameters.randomness = 0.2;
parameters.randomnessPower = 3;
parameters.insideColor = '#ff6030';
parameters.outsideColor = '#1b3984';
parameters.uTime = 0;
parameters.uSize = 35;


let geometry = null;
let material = null;
let points = null;

/**
 * Galaxy
 */
let isColliding = false;
let scaleDelta = 0.01;


const generateGalaxy = () => {
  if (points !== undefined && points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  const galaxy1 = createGalaxy();
  scene.add(galaxy1);
  galaxy1.position.y = 2;

  const galaxy2 = createGalaxy();
  scene.add(galaxy2);
  galaxy2.position.y = -6;

  const clock = new THREE.Clock();
  let oldElapsedTime = 0;

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    galaxy1.material.uniforms.uTime.value = -elapsedTime ;
    galaxy2.material.uniforms.uTime.value = -elapsedTime ;

    // Calculate forces between galaxies
    const distance = galaxy2.position.clone().sub(galaxy1.position);
    const forceMagnitude = 300 / 6.99; //The force of attraction
    const force = distance.normalize().multiplyScalar(forceMagnitude % 7 + 0.3);

    // Apply forces to galaxy positions
    galaxy1.position.add(force.clone().multiplyScalar(deltaTime));
    galaxy2.position.sub(force.clone().multiplyScalar(deltaTime));
    galaxy2.position.sub(force.clone().multiplyScalar(deltaTime));

    // Check collision
    const collisionThreshold = 0.01; // collision threshold
    if (distance.length() < collisionThreshold) {
      if (!isColliding) {
        // isColliding = true;
        // scaleDelta = -scaleDelta; 

   
      }
    } else {
        

        // Update galaxy scale
        galaxy1.scale.x -= scaleDelta;
        galaxy1.scale.y -= scaleDelta;
        galaxy1.scale.z -= scaleDelta;

        galaxy2.scale.x -= scaleDelta;
        galaxy2.scale.y -= scaleDelta;
        galaxy2.scale.z -= scaleDelta;

      isColliding = false;
    }

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();
};

const createGalaxy = () => {
  // Geometry
  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(parameters.count * 3);
  const randomness = new Float32Array(parameters.count * 3);

  const colors = new Float32Array(parameters.count * 3);
  const scales = new Float32Array(parameters.count * 1);

  const insideColor = new THREE.Color(parameters.insideColor);
  const outsideColor = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    // Position
    const radius = Math.random() * parameters.radius;

    const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

    positions[i3] = Math.cos(branchAngle) * radius; //cos
    positions[i3 + 1] = 0;
    positions[i3 + 2] = Math.sin(branchAngle) * radius;

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    randomness[i3] = randomX;
    randomness[i3 + 1] = randomY;
    randomness[i3 + 2] = randomZ;

    // Color
    const mixedColor = insideColor.clone();
    mixedColor.lerp(outsideColor, radius / parameters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    // Scale
    scales[i] = Math.random();
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3));

  const material = new THREE.ShaderMaterial({
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    vertexShader: galaxyVertexShader,
    fragmentShader: galaxyFragmentShader,
    uniforms: {
      uTime: { value: parameters.uTime },
      uSize: { value: parameters.uSize * renderer.getPixelRatio() },
    },
  });

  // Points
  const points = new THREE.Points(geometry, material);

  return points;
};


gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)
gui.add(parameters, 'uTime').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'uSize').min(0.01).max(50).step(0.01).onFinishChange(generateGalaxy)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 9
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Generate the first galaxy
 */ 
generateGalaxy()

