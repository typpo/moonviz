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
      // crater
      var vec3;
      vec3 = latLongToVector3(-0.7, -5.9, 100, 0);
      var cube = new THREE.Mesh( new THREE.CubeGeometry(2,2,2), new THREE.MeshNormalMaterial({wireframe: true}) );
      cube.position = vec3;
      scene.add(cube);

      // 0,0
      vec3 = latLongToVector3(0, 0, 100, 0);
      var cube = new THREE.Mesh( new THREE.CubeGeometry(2,2,2), new THREE.MeshNormalMaterial({wireframe: true}) );
      cube.position = vec3;
      scene.add(cube);

      // apollo 11
      vec3 = latLongToVector3(0.67408, 23.47297, 100, 0);
      var cube = new THREE.Mesh( new THREE.CubeGeometry(2,2,2), new THREE.MeshNormalMaterial({wireframe: true}) );
      cube.position = vec3;
      scene.add(cube);

      // apollo 12
      vec3 = latLongToVector3(-3.012389, -23.421569, 100, 0);
      var cube = new THREE.Mesh( new THREE.CubeGeometry(2,2,2), new THREE.MeshNormalMaterial({wireframe: true}) );
      cube.position = vec3;
      scene.add(cube);

      // apollo 14
      vec3 = latLongToVector3(-3.6453, -17.471361, 100, 0);
      var cube = new THREE.Mesh( new THREE.CubeGeometry(2,2,2), new THREE.MeshNormalMaterial({wireframe: true}) );
      cube.position = vec3;
      scene.add(cube);
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
        camera.position.set(0, 0, 800);

        scene = new THREE.Scene();
        scene.add(camera);

        controls = new THREE.TrackballControls(camera);
        controls.rotateSpeed = 0.5;
        controls.dynamicDampingFactor = 0.5;

        /*
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.bottom = '0px';
        hud.appendChild(stats.domElement);
        */

        clock = new THREE.Clock();
    }

    function animate() {
        requestAnimationFrame(animate);
        //light.orbit(moon.position, clock.getElapsedTime());
        light.orbit(moon.position, 0);
        controls.update(camera);
        //stats.update();
        renderer.render(scene, camera);
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
                loadingMessage.innerHTML = evt.name;
            },
            onComplete: function (evt) {
                loadingContainer.style.display = 'none';
                var textures = evt.textures;
                moon = createMoon(textures.moon, textures.moonNormal);
                starfield = createSkybox(textures.starfield);
                createObjects();
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
