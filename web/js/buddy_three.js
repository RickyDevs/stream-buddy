/**
 * names:
 *   - pedrinho
 */
import * as THREE from './libs/Three.js';
import { GLTFLoader } from './libs/jsm/loaders/GLTFLoader.js';
;
var container, clock, mixer, actions, activeAction, previousAction;
var camera, scene, renderer, model, face;
var mainMaterial;
const api = { state: 'Idle' };
//const states = [ 'Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing', 'WalkJump'];
//const emotes = [ 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ];
var buddyStates = {
    'idle': {
        name: 'Idle',
        loopOnce: false
    },
    'walk': {
        name: 'Walking',
        loopOnce: false
    },
    'run': {
        name: 'Running',
        loopOnce: false
    },
    'dance': {
        name: 'Dance',
        loopOnce: false
    },
    'death': {
        name: 'Death',
        loopOnce: true
    },
    'sitting': {
        name: 'Sitting',
        loopOnce: true
    },
    'standing': {
        name: 'Standing',
        loopOnce: false
    },
    'walkjump': {
        name: 'WalkJump',
        loopOnce: false
    },
    // emotes
    'jump': {
        name: 'Jump',
        loopOnce: true
    },
    'yes': {
        name: 'Yes',
        loopOnce: true
    },
    'no': {
        name: 'No',
        loopOnce: true
    },
    'wave': {
        name: 'Wave',
        loopOnce: true
    },
    'punch': {
        name: 'Punch',
        loopOnce: true
    },
    'thumbsup': {
        name: 'ThumbsUp',
        loopOnce: true
    },
};
export function initBuddy(container) {
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.25, 100);
    camera.position.set(0, 2.2, 20);
    camera.lookAt(new THREE.Vector3(0, 2, 0));
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x00ff00);
    scene.fog = new THREE.Fog(0x00ff00, 10, 100);
    clock = new THREE.Clock();
    // lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);
    // ground
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x191919, depthWrite: false }));
    mesh.rotation.x = -Math.PI * 0.5;
    scene.add(mesh);
    const grid = new THREE.GridHelper(100, 40, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);
    // model
    const loader = new GLTFLoader();
    loader.load('./models/RobotExpressive.glb', function (gltf) {
        model = gltf.scene;
        scene.add(model);
        bindAnimations(model, gltf.animations);
        updateMaterials(model, gltf.parser);
    }, undefined, function (e) {
        console.error(e);
    });
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    animate();
}
export function isActionValid(name) {
    return buddyStates.hasOwnProperty(name.toLowerCase());
}
function bindAnimations(model, animations) {
    mixer = new THREE.AnimationMixer(model);
    actions = {};
    // manipulate some animations...
    for (let i = 0; i < animations.length; i++) {
        const clip = animations[i];
        const action = mixer.clipAction(clip);
        actions[clip.name] = action;
        //if ( emotes.indexOf( clip.name ) >= 0 || states.indexOf( clip.name ) >= 4 ) {
        var buddyState = { name: '', loopOnce: false };
        for (var state in buddyStates) {
            if (buddyStates[state].name == clip.name) {
                buddyState = buddyStates[state];
            }
        }
        if (buddyState.loopOnce) {
            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;
        }
    }
    activeAction = actions[api.state];
    activeAction.play();
}
function updateMaterials(model, parser) {
    var materialPromise = parser.getDependencies('material');
    materialPromise.then(function (materials) {
        mainMaterial = materials[1];
        var faceMesh = model.getObjectByName('Head_3');
        faceMesh.material = mainMaterial;
        //mainMaterial.color.setHex(0x358f97);
        // @ts-ignore
        //mainMaterial.color = new THREE.Color(0xd0322d);
        /*model.traverse(function(visit) {
            //console.log(visit.type, visit.name);

            //if (visit.name.startsWith('Head')) {
            //	var mesh  = visit as Three.Mesh;
            //	console.log(visit.name, JSON.stringify(mesh.material));
            //	//mesh.material.needsUpdate = true; // ainMaterial;
            //}

            if (visit.name == 'Head_3') {
                var mesh  = visit;
                
            }
        })*/
    });
}
// states
/*
                const statesFolder = gui.addFolder( 'States' );

                const clipCtrl = statesFolder.add( api, 'state' ).options( states );

                clipCtrl.onChange( function () {

                    fadeToAction( api.state, 0.5 );

                } );

                statesFolder.open();

                // emotes

                const emoteFolder = gui.addFolder( 'Emotes' );

                



                for ( let i = 0; i < emotes.length; i ++ ) {

                    createEmoteCallback( emotes[ i ] );

                }

                emoteFolder.open();

                // expressions

                face = model.getObjectByName( 'Head_4' );

                const expressions = Object.keys( face.morphTargetDictionary );
                const expressionFolder = gui.addFolder( 'Expressions' );

                for ( let i = 0; i < expressions.length; i ++ ) {

                    expressionFolder.add( face.morphTargetInfluences, i, 0, 1, 0.01 ).name( expressions[ i ] );

                }
                expressionFolder.open();
*/
function fadeToAction(name, duration) {
    if (!mixer) {
        return;
    }
    var actionName = buddyStates[name.toLowerCase()].name;
    previousAction = activeAction;
    activeAction = actions[actionName];
    if (previousAction !== activeAction) {
        previousAction.fadeOut(duration);
    }
    activeAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(duration)
        .play();
}
export function fadeToActionAndRestore(name, duration) {
    if (!mixer) {
        return;
    }
    fadeToAction(name, duration);
    mixer.addEventListener('finished', restoreState);
}
function restoreState() {
    mixer.removeEventListener('finished', restoreState);
    fadeToAction(api.state, 0.5);
}
// Animate callback
function animate() {
    const dt = clock.getDelta();
    if (mixer) {
        mixer.update(dt);
    }
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    //stats.update();
}
export function rotateBy(angle) {
    model.rotateY(angle * (Math.PI / 180));
}
var supportedColors = {
    'pink': 0xff3399,
    'blue': 0x3944bc,
    'red': 0xd0322d
};
export function changeColor(color) {
    var materialColor = 0;
    var sanitizedColor = color.trim().toLowerCase();
    if (supportedColors.hasOwnProperty(sanitizedColor)) {
        materialColor = supportedColors[sanitizedColor];
    }
    console.log(color, materialColor);
    if (materialColor > 0) {
        // @ts-ignore
        mainMaterial.color.setHex(materialColor);
    }
}
