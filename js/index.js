(function () {
  'use strict';

  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
    return;
  }

  var hud = document.getElementById('hud');
  var container = document.getElementById('container');

  var loadingContainer = document.getElementById('loading-container');
  var loadingMessage = document.getElementById('loading-message');

  var normVertShader = document.getElementById('norm-vert-shader');
  var normFragShader = document.getElementById('norm-frag-shader');

  var scene;
  var renderer;
  var camera;
  var clock;
  var controls;
  var stats;

  window.moon = null;
  var starfield;
  var light = {
    speed: 0.1,
    distance: 1000,
    position: new THREE.Vector3(0, 0, 0),
    orbit: function (center, time) {
      this.position.x =
        (center.x + this.distance) * Math.sin(time * -this.speed);

      this.position.z =
        (center.z + this.distance) * Math.cos(time * this.speed);
    }
  };

  var domEvents;
  var mouseTimeout = null;

  var uniforms;
  var uiOptions;

  function createMoon(textureMap, normalMap) {
    var radius = 100;
    var xSegments = 50;
    var ySegments = 50;
    var geo = new THREE.SphereGeometry(radius, xSegments, ySegments);

    var mat = new THREE.ShaderMaterial({
      uniforms: {
        lightPosition: {
          type: 'v3',
          value: light.position
        },
        textureMap: {
          type: 't',
          value: textureMap
        },
        normalMap: {
          type: 't',
          value: normalMap
        },
        uvScale: {
          type: 'v2',
          value: new THREE.Vector2(1.0, 1.0)
        }
      },
      vertexShader: normVertShader.innerText,
      fragmentShader: normFragShader.innerText
    });

    var mesh = new THREE.Mesh(geo, mat);
    mesh.geometry.computeTangents();
    mesh.position.set(0, 0, 0);
    // Hardcoded adjustments to match coordinate system of image map with
    // actual coordinate system.
    mesh.rotation.set(0, Math.PI*299.9/200, 0);
    scene.add(mesh);
    return mesh;
  }

  function createObjects() {
    for (var i=0; i < LUNAR_DATA.length; i++) {
      (function() {
        var datum = LUNAR_DATA[i];
        var vec3 = latLongToVector3(datum.y, datum.x, 100, 1);
        var material = new THREE.MeshBasicMaterial({color: 0xFEE5AC});
        //material.depthTest = true;
        //material.depthWrite = true;
        //var geom = new THREE.CircleGeometry(1, 64);
        var geom =  new THREE.SphereGeometry(1,64,64);
        var cube = new THREE.Mesh(geom, material);
        /*
        geom.vertices.shift();  // remove center vertex
        var cube = new THREE.Line(geom, new THREE.LineBasicMaterial({color: 0xffff00 }));
       */
        domEvents.addEventListener(cube, 'click', function(e) {
          console.log(datum);
        }, false);
        domEvents.addEventListener(cube, 'mouseover', function(e) {
          if (mouseTimeout !== null) {
            clearTimeout(mouseTimeout);
            mouseTimeout = null;
          }
          document.getElementById('center-hud').innerHTML = datum.name;
        }, false);
        domEvents.addEventListener(cube, 'mouseout', function(e) {
          if (mouseTimeout !== null) {
            clearTimeout(mouseTimeout);
            mouseTimeout = null;
          }
          mouseTimeout = setTimeout(function() {
            document.getElementById('center-hud').innerHTML = '';
            mouseTimeout = null;
          }, 1000);
        }, false);
        cube.position = vec3;
        scene.add(cube);
      })();
    }
  }

  function createSkybox(texture) {
    var size = 15000;

    var cubemap = THREE.ShaderLib.cube;
    cubemap.uniforms.tCube.value = texture;

    var mat = new THREE.ShaderMaterial({
      fragmentShader: cubemap.fragmentShader,
      vertexShader: cubemap.vertexShader,
      uniforms: cubemap.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    });

    var geo = new THREE.CubeGeometry(size, size, size);

    var mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    return mesh;
  }

 function createParticleSystem() {
    var attributes = {
      a: { type: 'f', value: [] },
      e: { type: 'f', value: [] },
      i: { type: 'f', value: [] },
      o: { type: 'f', value: [] },
      ma: { type: 'f', value: [] },
      n: { type: 'f', value: [] },
      w: { type: 'f', value: [] },
      P: { type: 'f', value: [] },
      epoch: { type: 'f', value: [] },

      size: { type: 'f', value: [] },
      value_color : { type: 'c', value: [] },
    };

    uniforms = {
      color: { type: 'c', value: new THREE.Color( 0xffffff ) },
      jed: { type: 'f', value: 2451545.0 },
      small_roid_texture:
        { type: 't', value: loadTexture('img/cloud4.png') },
    };

    var vertexshader = document.getElementById('orbit-vertex-shader').textContent
                          .replace('{{PIXELS_PER_AU}}', 200.0); // moon diameter

    var particle_system_shader_material = new THREE.ShaderMaterial( {
      uniforms:       uniforms,
      attributes:     attributes,
      vertexShader:   vertexshader,
      fragmentShader: document.getElementById('orbit-fragment-shader').textContent
    });
    particle_system_shader_material.depthTest = true;
    particle_system_shader_material.depthWrite = false;
    particle_system_shader_material.vertexColor = true;
    particle_system_shader_material.transparent = true;
    particle_system_shader_material.blending = THREE.AdditiveBlending;

    var added_objects = LUNAR_ORBIT_DATA;

    var particle_system_geometry = new THREE.Geometry();
    for (var i = 0; i < added_objects.length; i++) {
      attributes.size.value[i] = 25;

      attributes.a.value[i] = Math.sqrt(added_objects[i].a / 1000 * 4);
      attributes.e.value[i] = added_objects[i].e;
      attributes.i.value[i] = added_objects[i].i - 90; // rotate 90 degrees for this visualization
      attributes.o.value[i] = added_objects[i].om || 0;
      attributes.ma.value[i] = added_objects[i].ma || 0;
      attributes.n.value[i] = added_objects[i].n || -1.0;
      attributes.w.value[i] = added_objects[i].w_bar ||
        (added_objects[i].w + added_objects[i].om) || Math.random() * 360 - 180;
      attributes.P.value[i] = added_objects[i].p;
      attributes.epoch.value[i] = added_objects[i].epoch || Math.random() * 100000;
      attributes.value_color.value[i] = new THREE.Color(0xffffff);
      particle_system_geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    }  // end added_objects loop

    var particleSystem = new THREE.ParticleSystem(
      particle_system_geometry,
      particle_system_shader_material
    );
    particleSystem.sortParticles = true;
    window.ps = particleSystem;

    // add it to the scene
    scene.add(particleSystem);
  }

  function createGui() {
    var COUNTRIES = ['all', 'USA', 'Russia', 'EU'];

    var gui = new dat.GUI();
    uiOptions = {
      'Min year': 1950,
      'Max year': 2100,
      'Time speed': 0.25,
      'Show orbits': false,
      'Past missions': true,
      'Current missions': true,
      'Planned missions': true,
      'Filter by country': 'all',
    };
    gui.add(uiOptions, 'Min year', 1950, 2099);
    gui.add(uiOptions, 'Max year', 1951, 2100);
    gui.add(uiOptions, 'Time speed', 0.0, 1.0).onChange(function(value) {

    });
    gui.add(uiOptions, 'Show orbits', false);
    gui.add(uiOptions, 'Past missions', true);
    gui.add(uiOptions, 'Current missions', true);
    gui.add(uiOptions, 'Planned missions', true);
    gui.add(uiOptions, 'Filter by country', COUNTRIES);
    // TODO commercial/gvt
    // TODO human/robotic
  }

  function init() {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true
    });

    renderer.setClearColor(0x000000, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    var fov = 35;
    var aspect = window.innerWidth / window.innerHeight;
    var near = 1;
    var far = 65536;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 980);

    scene = new THREE.Scene();
    scene.add(camera);

    window.cam = camera;
//
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.5;
    controls.dynamicDampingFactor = 0.5;

    /*
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    hud.appendChild(stats.domElement);
    */

    clock = new THREE.Clock();
    domEvents = new THREEx.DomEvents(camera, renderer.domElement)
  }

  function animate() {
    requestAnimationFrame(animate);
    light.orbit(moon.position, clock.getElapsedTime());
    //light.orbit(moon.position, 0);
    controls.update(camera);
    //stats.update();
    renderer.render(scene, camera);

    // jed
    uniforms.jed.value += uiOptions['Time speed'];
  }

  function toggleHud() {
    hud.style.display = hud.style.display === 'none' ? 'block' : 'none';
  }

  /*
  function onDocumentKeyDown (evt) {
    switch (evt.keyCode) {
    case 'H'.charCodeAt(0):
      toggleHud();
      break;
    case 'F'.charCodeAt(0):
      if (screenfull.enabled) screenfull.toggle();
      break;
    case 'P'.charCodeAt(0):
      window.open(renderer.domElement.toDataURL('image/png'));
      break;
    }
  }
  */

  function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  function loadAssets(options) {
    var paths = options.paths;
    var onBegin = options.onBegin;
    var onComplete = options.onComplete;
    var onProgress = options.onProgress;
    var total = 0;
    var completed = 0;
    var textures = { };
    var key;

    for (key in paths)
      if (paths.hasOwnProperty(key)) total++;

    onBegin({
      total: total,
      completed: completed
    });

    for (key in paths) {
      if (paths.hasOwnProperty(key)) {
        var path = paths[key];
        if (typeof path === 'string')
          THREE.ImageUtils.loadTexture(path, null, getOnLoad(path, key));
        else if (typeof path === 'object')
          THREE.ImageUtils.loadTextureCube(path, null, getOnLoad(path, key));
      }
    }

    function getOnLoad(path, name) {
      return function (tex) {
        textures[name] = tex;
        completed++;
        if (typeof onProgress === 'function') {
          onProgress({
            path: path,
            name: name,
            total: total,
            completed: completed
          });
        }
        if (completed === total && typeof onComplete === 'function') {
          onComplete({
            textures: textures
          });
        }
      };
    }
  }

  /** When the window loads, we immediately begin loading assets. While the
    assets loading Three.JS is initialized. When all assets finish loading
    they can be used to create objects in the scene and animation begins */
  function onWindowLoaded() {
    loadAssets({
      paths: {
        moon: 'img/maps/moon.jpg',
        moonNormal: 'img/maps/normal.jpg',
        starfield: [
          'img/starfield/front.png',
          'img/starfield/back.png',
          'img/starfield/left.png',
          'img/starfield/right.png',
          'img/starfield/top.png',
          'img/starfield/bottom.png'
        ]
      },
      onBegin: function () {
        loadingContainer.style.display = 'block';
      },
      onProgress: function (evt) {
        //loadingMessage.innerHTML = evt.name;
      },
      onComplete: function (evt) {
        loadingContainer.style.display = 'none';
        var textures = evt.textures;
        moon = createMoon(textures.moon, textures.moonNormal);
        starfield = createSkybox(textures.starfield);
        createObjects();
        createParticleSystem();
        createGui();
        animate();
      }
    });

    init();
  }

  /** Window load event kicks off execution */
  window.addEventListener('load', onWindowLoaded, false);
  window.addEventListener('resize', onWindowResize, false);
  //document.addEventListener('keydown', onDocumentKeyDown, false);
})();

// convert the positions from a lat, lon to a position on a sphere.
function latLongToVector3(lat, lon, radius, height) {
  var phi = (lat)*Math.PI/180;
  var theta = (lon+90)*Math.PI/180;

  var x = -(radius+height) * Math.cos(phi) * Math.cos(theta);
  var y = (radius+height) * Math.sin(phi);
  var z = (radius+height) * Math.cos(phi) * Math.sin(theta);

  return new THREE.Vector3(x,y,z);
}

function loadTexture(path) {
  if (typeof passthrough_vars !== 'undefined' && passthrough_vars.offline_mode) {
    // same origin policy workaround
    var b64_data = $('img[data-src="' + path + '"]').attr('src');

    var new_image = document.createElement( 'img' );
    var texture = new THREE.Texture( new_image );
    new_image.onload = function()  {
      texture.needsUpdate = true;
    };
    new_image.src = b64_data;
    return texture;
  }
  return THREE.ImageUtils.loadTexture(path);
}
