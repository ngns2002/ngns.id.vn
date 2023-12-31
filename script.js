// ===== NAVBAR ===== //
$(window).scroll(function() {
  
  let position    =   $(this).scrollTop();
    if (position >= 100) {
      $('.nav-menu').addClass('costum-navbar');
    } else {
      $('.nav-menu').removeClass('costum-navbar');
    }
  
});


// ===== HAMBURGER BUTTON ===== //
$(document).ready(function() {
  
  $('.nav-button').click(function() {
    $('.nav-button').toggleClass('change');
  })
    
});

// animation

/*
	This pen cleverly utilizes SVG filters to create a "Morphing Text" effect. Essentially, it layers 2 text elements on top of each other, and blurs them depending on which text element should be more visible. Once the blurring is applied, both texts are fed through a threshold filter together, which produces the "gooey" effect. Check the CSS - Comment the #container rule's filter out to see how the blurring works!
*/

const elts = {
  text1: document.getElementById("text1"),
  text2: document.getElementById("text2") };


// The strings to morph between. You can change these to anything you want!
const texts = [
"welcome",
"to",
"my",
"web",
"site",
"to",
"NGNS.ID.VN"];


// Controls the speed of morphing.
const morphTime = 1;
const cooldownTime = 0.25;

let textIndex = texts.length - 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;

elts.text1.textContent = texts[textIndex % texts.length];
elts.text2.textContent = texts[(textIndex + 1) % texts.length];

function doMorph() {
  morph -= cooldown;
  cooldown = 0;

  let fraction = morph / morphTime;

  if (fraction > 1) {
    cooldown = cooldownTime;
    fraction = 1;
  }

  setMorph(fraction);
}

// A lot of the magic happens here, this is what applies the blur filter to the text.
function setMorph(fraction) {
  // fraction = Math.cos(fraction * Math.PI) / -2 + .5;

  elts.text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
  elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

  fraction = 1 - fraction;
  elts.text1.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
  elts.text1.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

  elts.text1.textContent = texts[textIndex % texts.length];
  elts.text2.textContent = texts[(textIndex + 1) % texts.length];
}

function doCooldown() {
  morph = 0;

  elts.text2.style.filter = "";
  elts.text2.style.opacity = "100%";

  elts.text1.style.filter = "";
  elts.text1.style.opacity = "0%";
}

// Animation loop, which is called every frame.
function animate() {
  requestAnimationFrame(animate);

  let newTime = new Date();
  let shouldIncrementIndex = cooldown > 0;
  let dt = (newTime - time) / 1000;
  time = newTime;

  cooldown -= dt;

  if (cooldown <= 0) {
    if (shouldIncrementIndex) {
      textIndex++;
    }

    doMorph();
  } else {
    doCooldown();
  }
}

// Start the animation.
animate();

// list learn
'use strict';

var Earth = function (el, data) {
  let camera, scene, renderer, composer, w, h;

  let lines = [],
  mouse = {
    x: 0,
    y: 0 },

  mouseOnDown = {
    x: 0,
    y: 0 },

  points = [],
  rotation = {
    x: Math.PI * 1.9,
    y: Math.PI / 6 },

  target = {
    x: Math.PI * 1.9,
    y: Math.PI / 6 },

  targetOnDown = {
    x: 0,
    y: 0 };


  const center = new THREE.Vector3(0, 0, 0),
  clock = new THREE.Clock(),
  distance = 350,
  PI_HALF = Math.PI / 2,
  pointRadius = 152,
  radius = 150;

  // Shaders
  // https://github.com/dataarts/webgl-globe

  const shaders = {
    'atmosphere': {
      uniforms: {},
      vertexShader: [
      'varying vec3 vNormal;',
      'void main() {',
      'vNormal = normalize( normalMatrix * normal );',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
      '}'].
      join('\n'),
      fragmentShader: [
      'varying vec3 vNormal;',
      'void main() {',
      'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 3.0 );',
      'gl_FragColor = vec4( 0.3, 0.4, 0.6, 0.075 ) * intensity;',
      '}'].
      join('\n') } };



  // -------------------------------------
  //   Init
  // -------------------------------------

  function init() {
    w = window.innerWidth;
    h = window.innerHeight;

    camera = new THREE.PerspectiveCamera(distance / 5, w / h, 1, distance * 2);
    scene = new THREE.Scene();
    scene.add(camera);

    // Stars
    // http://gielberkers.com/evenly-distribute-particles-shape-sphere-threejs/

    let starGeometry = new THREE.Geometry();

    for (let i = 0; i < 1000; i++) {
      let x = -1 + Math.random() * 2;
      let y = -1 + Math.random() * 2;
      let z = -1 + Math.random() * 2;
      const d = 1 / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
      x *= d;
      y *= d;
      z *= d;

      const vertex = new THREE.Vector3(
      x * distance,
      y * distance,
      z * distance);

      starGeometry.vertices.push(vertex);
    }

    const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({
      color: '#555555',
      size: 3 }));

    scene.add(stars);

    // Light

    let light = new THREE.PointLight('#ffffff', 0.5);
    camera.add(light);
    light.position.set(distance / 2, distance / 2, 0);
    light.target = camera;

    // Earth

    THREE.ImageUtils.crossOrigin = '';
    var earthLights = THREE.ImageUtils.loadTexture('//s3-us-west-2.amazonaws.com/s.cdpn.io/68727/earth-lights.jpg');
    var earthBump = THREE.ImageUtils.loadTexture('//s3-us-west-2.amazonaws.com/s.cdpn.io/68727/earth-bump.jpg');
    earthLights.minFilter = THREE.LinearFilter;
    earthBump.minFilter = THREE.LinearFilter;

    var earthGeometry = new THREE.SphereGeometry(radius, 50, 30);
    var earthMaterial = new THREE.MeshPhongMaterial({
      bumpMap: earthBump,
      bumpScale: 4,
      emissiveMap: earthLights,
      emissive: '#333333',
      map: earthLights,
      specular: '#010101' });


    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Atmosphere

    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: shaders['atmosphere'].vertexShader,
      fragmentShader: shaders['atmosphere'].fragmentShader,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true });


    const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial);
    atmosphere.scale.set(1.3, 1.3, 1.3);
    scene.add(atmosphere);

    // Points

    for (let i = 0; i < data.length; i++) {
      points.push(new point(data[i].lat, data[i].long, data[i].r, i));

      let newLine = drawCurve(points[0].position, points[i].position);

      new TWEEN.Tween(newLine).
      to({
        currentPoint: 200 },
      2000).
      delay(i * 350 + 1500).
      easing(TWEEN.Easing.Cubic.Out).
      onUpdate(function () {
        newLine.geometry.setDrawRange(0, newLine.currentPoint);
      }).
      start();
    }

    // Renderer

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true });

    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);

    // Composer

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));

    const effectBloom = new THREE.BloomPass(1.75);
    const effectFilm = new THREE.FilmPass(0.25, 0.5, 2048, 0);
    const effectShift = new THREE.ShaderPass(THREE.RGBShiftShader);

    effectShift.uniforms['amount'].value = 0.003;
    effectShift.renderToScreen = true;

    composer.addPass(effectBloom);
    composer.addPass(effectFilm);
    composer.addPass(effectShift);

    // Events

    el.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('resize', onWindowResize, false);

    // DOM

    el.appendChild(renderer.domElement);
  }

  // -------------------------------------
  //   Lat + Long to Vector
  // -------------------------------------

  function latLongToVector3(lat, lon, r) {
    // http://www.smartjava.org/content/render-open-data-3d-world-globe-threejs

    const phi = lat * Math.PI / 180;
    const theta = (lon - 180) * Math.PI / 180;

    const x = -r * Math.cos(phi) * Math.cos(theta);
    const y = r * Math.sin(phi);
    const z = r * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
  }

  // -------------------------------------
  //   Interactivity
  // -------------------------------------

  function onMouseDown(event) {
    event.preventDefault();

    el.addEventListener('mouseup', onMouseUp, false);
    el.addEventListener('mousemove', onMouseMove, false);
    el.addEventListener('mouseout', onMouseOut, false);

    mouseOnDown.x = -event.clientX;
    mouseOnDown.y = event.clientY;

    targetOnDown.x = target.x;
    targetOnDown.y = target.y;

    el.style.cursor = 'move';
  }

  function onMouseMove(event) {
    mouse.x = -event.clientX;
    mouse.y = event.clientY;

    target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005;
    target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005;

    target.y = target.y > PI_HALF ? PI_HALF : target.y;
    target.y = target.y < -PI_HALF ? -PI_HALF : target.y;
  }

  function onMouseUp(event) {
    el.removeEventListener('mousemove', onMouseMove, false);
    el.removeEventListener('mouseup', onMouseUp, false);
    el.removeEventListener('mouseout', onMouseOut, false);
    el.style.cursor = 'auto';
  }

  function onMouseOut(event) {
    el.removeEventListener('mouseup', onMouseUp, false);
    el.removeEventListener('mouseout', onMouseOut, false);
  }

  function onWindowResize(event) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // -------------------------------------
  //   Animate
  // -------------------------------------

  function animate(time) {
    render();
    TWEEN.update(time);
    requestAnimationFrame(animate);
  }

  // -------------------------------------
  //   Render
  // -------------------------------------

  function render() {
    if (el.style.cursor != 'move') target.x += 0.00075;

    rotation.x += (target.x - rotation.x) * 0.1;
    rotation.y += (target.y - rotation.y) * 0.1;

    camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
    camera.position.y = distance * Math.sin(rotation.y);
    camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);

    camera.lookAt(center);
    renderer.render(scene, camera);
    composer.render();
  }

  // -------------------------------------
  //   Point
  // -------------------------------------

  function point(lat, lng, r, i) {
    const position = latLongToVector3(lat, lng, radius);

    const pointGeometry = new THREE.SphereGeometry(r, 32, 32);
    const pointMaterial = new THREE.MeshBasicMaterial({
      color: '#bef0db',
      opacity: 0.4,
      side: THREE.DoubleSide,
      transparent: true });


    let point = new THREE.Mesh(pointGeometry, pointMaterial);
    point.position.set(position.x, position.y, position.z);
    point.scale.set(0.01, 0.01, 0.01);
    point.lookAt(center);
    scene.add(point);

    new TWEEN.Tween(point.scale).
    to({
      x: 1,
      y: 1,
      z: 1 },
    1000).
    delay(i * 350 + 1500).
    easing(TWEEN.Easing.Cubic.Out).
    start();

    const pointRingGeometry = new THREE.RingGeometry(r + 0.5, r + 1.5, 32);
    const pointRingMaterial = new THREE.MeshBasicMaterial({
      color: '#ff3600',
      opacity: 0.2,
      side: THREE.DoubleSide,
      transparent: true });


    let pointRing = new THREE.Mesh(pointRingGeometry, pointRingMaterial);
    pointRing.position.set(position.x, position.y, position.z);
    pointRing.scale.set(0.01, 0.01, 0.01);
    pointRing.lookAt(center);
    scene.add(pointRing);

    new TWEEN.Tween(pointRing.scale).
    to({
      x: 1,
      y: 1,
      z: 1 },
    1500).
    delay(i * 350 + 1500).
    easing(TWEEN.Easing.Cubic.Out).
    start();

    return point;
  }

  // http://armsglobe.chromeexperiments.com/js/visualize_lines.js

  function drawCurve(a, b, i) {
    const distance = a.clone().sub(b).length();

    let mid = a.clone().lerp(b, 0.5);
    const midLength = mid.length();
    mid.normalize();
    mid.multiplyScalar(midLength + distance * 0.25);

    let normal = new THREE.Vector3().subVectors(a, b);
    normal.normalize();

    const midStart = mid.clone().add(normal.clone().multiplyScalar(distance * 0.25));
    const midEnd = mid.clone().add(normal.clone().multiplyScalar(distance * -0.25));

    let splineCurveA = new THREE.CubicBezierCurve3(a, a, midStart, mid);
    let splineCurveB = new THREE.CubicBezierCurve3(mid, midEnd, b, b);

    let points = splineCurveA.getPoints(100);
    points = points.splice(0, points.length - 1);
    points = points.concat(splineCurveB.getPoints(100));
    points.push(center);

    let lineGeometry = new THREE.BufferGeometry();
    let positions = new Float32Array(points.length * 3);
    for (let ii = 0; ii < points.length; ii++) {
      positions[ii * 3 + 0] = points[ii].x;
      positions[ii * 3 + 1] = points[ii].y;
      positions[ii * 3 + 2] = points[ii].z;
    }
    lineGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    lineGeometry.setDrawRange(0, 0);

    var lineMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(0xffffff),
      linewidth: 3,
      opacity: 0.25,
      transparent: true });


    let line = new THREE.Line(lineGeometry, lineMaterial);
    line.currentPoint = 0;

    scene.add(line);
    return line;
  }

  // -------------------------------------
  //   Start
  // -------------------------------------

  init();
  animate();

  this.animate = animate;
  return this;
};

var data = [{
  long: -81.173,
  lat: 28.4,
  r: 8 },
{
  long: -81.1,
  lat: 32.084,
  r: 3 },
{
  long: -74.006,
  lat: 40.713,
  r: 5 },
{
  long: -0.128,
  lat: 51.507,
  r: 2 },
{
  long: -87.63,
  lat: 41.878,
  r: 2 },
{
  long: -122.419,
  lat: 37.775,
  r: 2 },
{
  long: -90.199,
  lat: 38.627,
  r: 3 },
{
  long: -77.042,
  lat: -12.046,
  r: 2 },
{
  long: -77.345,
  lat: 25.06,
  r: 5 },
{
  long: -117.783,
  lat: 33.542,
  r: 2 },
{
  long: -149.9,
  lat: 61.218,
  r: 2 },
{
  long: -123.121,
  lat: 49.283,
  r: 2 },
{
  long: 25.462,
  lat: 36.393,
  r: 2 },
{
  long: -122.676,
  lat: 45.523,
  r: 3 },
{
  long: -95.401,
  lat: 29.817,
  r: 2 }];


var container = document.getElementById('container');
var planet = new Earth(container, data);