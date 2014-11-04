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

  var uniforms, attributes;
  var uiOptions;

  var surfaceMarkers, orbitVisibilityAttributes, orbitalEllipses;

  function createMoon(textureMap, normalMap) {
    var radius = 100;
    var xSegments = 50;
    var ySegments = 50;
    var geo = new THREE.SphereGeometry(radius, xSegments, ySegments);

    var mesh;
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: textureMap }));
    } else {
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
      mesh = new THREE.Mesh(geo, mat);
    }
    mesh.geometry.computeTangents();
    mesh.position.set(0, 0, 0);
    // Hardcoded adjustments to match coordinate system of image map with
    // actual coordinate system.
    mesh.rotation.set(0, Math.PI*299.9/200, 0);
    scene.add(mesh);
    return mesh;
  }

  function createSurfaceObjects() {
    surfaceMarkers = [];
    for (var i=0; i < LUNAR_DATA.length; i++) {
      (function() {
        var datum = LUNAR_DATA[i];
        var vec3 = latLongToVector3(datum.y, datum.x, 100, 1);
        var material = (function() {
          var color = 0xFEE5AC;
          if (datum.state === 'CURRENT') {
            color = 0x00ff00;
          } else if (datum.state === 'FUTURE') {
            color = 0x0000ff;
          }
          return new THREE.MeshBasicMaterial({color: color});
        })();
        //material.depthTest = true;
        //material.depthWrite = true;
        //var geom = new THREE.CircleGeometry(1, 64);
        var geom =  new THREE.SphereGeometry(1,64,64);
        var marker = new THREE.Mesh(geom, material);
        /*
        geom.vertices.shift();  // remove center vertex
        var marker = new THREE.Line(geom, new THREE.LineBasicMaterial({color: 0xffff00 }));
       */
        addEventHandlersToObject(marker, datum);
        marker.position = vec3;
        scene.add(marker);
        surfaceMarkers.push({
          marker: marker,
          data: datum,
        });
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
    attributes = {
      a: { type: 'f', value: [] },
      e: { type: 'f', value: [] },
      i: { type: 'f', value: [] },
      o: { type: 'f', value: [] },
      ma: { type: 'f', value: [] },
      n: { type: 'f', value: [] },
      w: { type: 'f', value: [] },
      P: { type: 'f', value: [] },
      epoch: { type: 'f', value: [] },

      visible: { type: 'f', value: [] },
      size: { type: 'f', value: [] },
      value_color : { type: 'c', value: [] },
    };

    uniforms = {
      color: { type: 'c', value: new THREE.Color(0xffffff) },
      jed: { type: 'f', value: 2451545.0 },
      small_roid_texture:
        { type: 't', value: loadTexture('img/cloud4.png') },
    };

    var vertexshader = document.getElementById('orbit-vertex-shader').textContent;

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
    orbitVisibilityAttributes = [];
    orbitalEllipses = [];
    var particle_system_geometry = new THREE.Geometry();
    for (var i = 0; i < added_objects.length; i++) {
      var obj = added_objects[i];

      obj.a = Math.sqrt(obj.a / 1000 * 6);  // squish the semimajor axis
      obj.i = obj.i - 90; // rotate 90 degrees for this visualization;
      obj.o = obj.o || 0;
      if (obj.e > .5) {
        // Need to exaggerate scale for these, otherwise they pass through the moon object.
        obj.e = Math.min(.5, obj.e);
        obj.a *= 1.5;
      }
      obj.ma = obj.ma || 0;
      obj.w = obj.w || Math.random() * 360 - 180;
      obj.epoch = obj.epoch  || Math.random() * 100000;

      // Add elipse.
      var orb3d = new Orbit3D(obj, {color: 0xcccccc});
      var ellipse = orb3d.createOrbit();
      addEventHandlersToObject(ellipse, obj);
      ellipse.visible = false;
      scene.add(ellipse);
      orbitalEllipses.push(ellipse);

      // Add particle.
      attributes.size.value[i] = 25;

      attributes.a.value[i] = obj.a;
      attributes.e.value[i] = obj.e;
      attributes.i.value[i] = obj.i;
      attributes.o.value[i] = obj.om || 0;
      attributes.ma.value[i] = obj.ma;
      attributes.n.value[i] = obj.n || -1.0;
      attributes.w.value[i] = obj.w;
      attributes.P.value[i] = obj.p;
      attributes.epoch.value[i] = obj.epoch;

      attributes.value_color.value[i] = (function() {
        if (obj.state === 'CURRENT') {
          return new THREE.Color(0x00ff00);
        } else if (obj.state === 'FUTURE') {
          return new THREE.Color(0x0000ff);
        }
        return new THREE.Color(0xffffff);
      })();

      attributes.visible.value[i] = 1.0;

      orbitVisibilityAttributes.push({
        attributeIndex: i,
        data: obj,
      });

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
    var COUNTRIES = ['all', 'USA', 'Russia', 'EU', 'China', 'Japan', 'India'];

    var gui = new dat.GUI();
    uiOptions = {
      'Min year': 1950,
      'Max year': 2030,
      'Speed': 0.25,
      'Show orbits': false,
      'Past missions': true,
      'Current missions': true,
      'Planned missions': true,
      'Filter by country': 'all',
      'Human or robotic': 'both',
      'Private or public': 'both',
      'Reset camera': function() {
        camera.position.set(0,0,980);
        camera.rotation.set(0,0,0);
      },
    };
    // TODO prevent new filters from overriding old filter options...
    // TODO make sure min year < max year
    gui.add(uiOptions, 'Min year', 1950, 2029).onChange(function(value) {
      filterVisibility(function(obj) {
        return obj.data.year >= value;
      });
    });
    gui.add(uiOptions, 'Max year', 1951, 2030).onChange(function(value) {
      filterVisibility(function(obj) {
        return obj.data.year <= value;
      });
    });
    gui.add(uiOptions, 'Speed', 0.0, 1.0);
    gui.add(uiOptions, 'Past missions', true).onChange(filterPastCurrentPlanned);
    gui.add(uiOptions, 'Current missions', true).onChange(filterPastCurrentPlanned);
    gui.add(uiOptions, 'Planned missions', true).onChange(filterPastCurrentPlanned);

    gui.add(uiOptions, 'Filter by country', COUNTRIES).onChange(function(value) {
      filterVisibility(function(obj) {
        if (value === 'all')
          return true;
        return obj.data.country === value;
      });
    });

    gui.add(uiOptions, 'Human or robotic', ['both', 'human', 'robotic']).onChange(function(value) {
      filterVisibility(function(obj) {
        if (value === 'both') {
          return true;
        }
        if (value === 'human' && obj.data.manned) {
          return true;
        }
        if (value === 'robotic' && !obj.data.manned) {
          // Assumed robotic by default.
          return true;
        }
        return false;
      });
    });

    gui.add(uiOptions, 'Private or public', ['both', 'private', 'public']).onChange(function(value) {
      filterVisibility(function(obj) {
        if (value === 'both') {
          return true;
        }
        if (value === 'private' && obj.data.private) {
          return true;
        }
        if (value === 'public' && !obj.data.private) {
          // Assumed govt by default.
          return true;
        }
        return false;
      });
    });

    gui.add(uiOptions, 'Show orbits', false).onChange(function(value) {
      orbitalEllipses.forEach(function(ellipse) {
        ellipse.visible = value;
      });
    });

    gui.add(uiOptions, 'Reset camera');
  }

  function filterVisibility(predicate) {
    surfaceMarkers.forEach(function(obj) {
      obj.marker.visible = predicate(obj);
    });
    orbitVisibilityAttributes.forEach(function(obj) {
      attributes.visible.value[obj.attributeIndex] = predicate(obj);
    });
  }

  function filterPastCurrentPlanned() {
    var past = uiOptions['Past missions'];
    var current = uiOptions['Current missions'];
    var planned = uiOptions['Planned missions'];

    filterVisibility(function(obj) {
      if (past && !obj.data.state) {
        // No state data implies past mission.
        return true;
      }
      if (current && obj.data.state === 'CURRENT') {
        return true;
      }
      if (planned && obj.data.state === 'PLANNED') {
        return true;
      }
      return false;
    });
  };

  function addEventHandlersToObject(marker, datum) {
    domEvents.addEventListener(marker, 'click', function(e) {
      console.log(datum);
    }, false);
    domEvents.addEventListener(marker, 'mouseover', function(e) {
      if (!marker.visible) {
        return;
      }
      if (mouseTimeout !== null) {
        clearTimeout(mouseTimeout);
        mouseTimeout = null;
      }
      $('#info-container').html(tmpl('surfaceMouseover', {data: datum})).css({
        top: e.origDomEvent.clientY + 10,
        left: e.origDomEvent.clientX + 10,
      }).show();
    }, false);
    domEvents.addEventListener(marker, 'mouseout', function(e) {
      if (mouseTimeout !== null) {
        clearTimeout(mouseTimeout);
        mouseTimeout = null;
      }
      mouseTimeout = setTimeout(function() {
        $('#info-container').hide();
        mouseTimeout = null;
      }, 1000);
    }, false);
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
    uniforms.jed.value += uiOptions['Speed'];
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
        createSurfaceObjects();
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
