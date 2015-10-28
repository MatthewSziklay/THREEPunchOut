/* Assignment 9 - THREE Punch Out! v1.0
Creates a boxer that can dodge, block, and throw punches. Dodge with A/D keys,
punch with U/I for jumping punches, and J/K for body blows. Hold S to block.
Utilizes tween.min.js to make animations easier.
Changes in v1.0: Fixed an issue where the player could throw a punch out while being hit by the enemy.
Added health bars, a game cycle, difficulty levels, a background, victory animations, a counter, flavor text, and more.
Known issues: If the player is punched to the left during a left dodge, the animation glitches out. Not sure what the cause is,
as all the relevant code is nearly identical in the right dodge version.
Holding down a punch button while being knocked down causes queued punches to still go through, causing the opponent to 
think you're still standing.
//The bulk of the code results from all models and animations being written in here as opposed to imported in through an external source.
Matthew Sziklay
*/

var head;
var lilBoxer, torso, leftLeg, rightLeg, leftArm, rightArmPivot, leftArmPivot, leftForearmPivot;
  var leftForearm, leftUpperArm, leftArm;
var enemy, enemyTorso, enemyTorso2, enemyLeftLeg, enemyRightLeg, enemyLeftArm, enemyLeftForeArm, enemyRightArm, enemyRightForeArm,
    enemyLeftBrow, enemyRightBrow;
var scene;
var camera;
var midAnimation = false;
var tweenA, tweenB, tweenC, tweenD, tweenE, tweenF, tweenG, tweenRot;
var tweenEnemyPos, tweenEnemyRot;
var playerStatus = 5; //1=neutral, 2=dodging left, 3=dodging right, 4=blocking, 5=hit/immobile, 6=knocked down
var enemyStatus = 1; //1=neutral(75% block chance), 2=vulnerable(can't block), 3=immune(won't flinch from attacks), 4 = knocked down
var gameState = 1; //1=not started, 2=mid-intro animation, 3= game has started
var enemyBlocking = false; //If true, enemy has blocked an attack and cannot be damaged.
var playerHealth = 100; var playerMaxHealth = 100;
var enemyHealth = 100; var enemyMaxHealth = 100;
var count = 0;
var difficulty = 0; //1=hard, 2=normal, 3=easy
var playerKDs = 0;
var enemyKDs = 0; //Knockdown count. If this reaches 3, the respective boxer loses by TKO.
var speedModifier = 1; //Easy mode = .9, Normal mode = 1, Hard mode = 1.1

function main() {
  
  // get the canvas and create a WebGL renderer for it
  var canvas = document.getElementById( "canvas" );
  var renderer = new THREE.WebGLRenderer( {canvas: canvas, alpha: true} );
  renderer.setSize( canvas.width, canvas.height );
    renderer.setClearColor(0xFF0000);
  //This is the point that the cannon arm will rotate around.
  rightArmPivot = new THREE.Object3D();
  rightArmPivot.position.set(-2.2,2.2,0.1);
  rightForearmPivot = new THREE.Object3D();
  rightForearmPivot.position.set(1,1,0);
  leftForearmPivot  = new THREE.Object3D();
  leftForearmPivot.position.set(0,-1.4,0);
  leftArmPivot = new THREE.Object3D();
  leftArmPivot.position.set(-2,2,-4.3);
  leftLegPivot = new THREE.Object3D();
  leftLegPivot.position.set(-2.5,-3,-3.5);
  rightLegPivot = new THREE.Object3D();
  rightLegPivot.position.set(-2.5,-3,-1.6);
  lilBoxer = new THREE.Object3D();
  leftForearm = createLeftArm(leftForearm);
  leftUpperArm = createUpperArm(leftUpperArm);
  torso = new THREE.Object3D();
  torso = createTorso();
  leftArm = new THREE.Object3D();
  leftArm.add(leftUpperArm);
    leftArm.add(rightForearmPivot);
  leftArm.position.set(-1,-2.6,-.7);
  rightArmPivot.add(leftArm);
  rightForearmPivot.add(leftForearm);
  leftArmPivot.add(createRightUpperArm());
  leftForearmPivot.add(createRightForeArm());
  leftArmPivot.add(leftForearmPivot);
  leftLegPivot.add(createLeg());
  rightLegPivot.add(createLeg());
  lilBoxer.add(rightArmPivot);
  lilBoxer.add(torso);
  lilBoxer.add(leftArmPivot);
  lilBoxer.add(leftLegPivot);
  lilBoxer.add(rightLegPivot);
  head = new THREE.Object3D();
  head.position.set(-2,3.3,-2.5);
  head.add(createHead());
  lilBoxer.add(head);
    rightArmPivot.rotateZ(Math.PI/8);
    rightForearmPivot.rotateZ(Math.PI/2);
    leftArmPivot.rotateZ(Math.PI/8);
    leftForearmPivot.rotateZ(Math.PI/2); 
  scene = new THREE.Scene();
    createHealthBars();
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.position.set( -5, 5, -2 );
  scene.add( directionalLight );
  var ambLight = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light );
  scene.add(lilBoxer);
  lilBoxer.position.set(0,0,1.5);
  //Create the enemy boxer.  
  enemy = new THREE.Object3D();
  enemy.add(createEnemy());
  enemy.position.set(15, 50, -1);
  scene.add(enemy);
    var text = drawText();
  scene.add(text);
  scene.add(drawBoxingRing());
  // create a perspective camera
  var fov = 60,
      aspect = canvas.width / canvas.height,
      near = 0.1,
      far = 1000;
  camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  var light = new THREE.AmbientLight( 0x555555 ); // soft white light
  scene.add( light );
    drawAudience();
  camera.position.set( -20, 6, -1 );
  camera.rotation.set(0,-Math.PI/2,0);
    renderer.setClearColor( 0x62626D, 1);
      renderer.render( scene, camera );
  // create the animation
  var animate = function () {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
    TWEEN.update();
}
    animate();
   // playIntroAnimation();
  //  showFightText();
  }

///////////////////////////////////////////////DRAWING ALL OBJECTS///////////////////////////////////////////////////////////

function drawAudience(){ //This was ultimately never called due to issues on other devices. Would normally draw a plane showing an audience.
    //http://3.bp.blogspot.com/-XKnZZ8hHjTg/UoKZu4aCcjI/AAAAAAAAFQM/0f8OEcmb4nQ/s1600/audience.png
        var material = new THREE.MeshLambertMaterial({
        color:0x333333
      });
    var geom = new THREE.PlaneGeometry(100,60);
    var audience = new THREE.Mesh(geom, material);
    audience.rotateY(-Math.PI/2);
    audience.position.set(40,10,0);
    scene.add(audience);
}

var textMat, textGeom, text;
function drawText(){ //Draw the word FIGHT at the start of the game.
    textMat = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 1});
    textGeom = new THREE.TextGeometry('FIGHT!',{font: 'gentilis', size: .5, height: 0.001});
    fightGeom = textGeom;
    text = new THREE.Mesh(textGeom, textMat);
    text.position.set(50,6,-2);
    text.rotateY(-Math.PI/2);
    createNumberGeom();
    return text;
}

var geom1, geom2, geom3, geom4, geom5, geom6, geom7, geom8, geom9, geom10, geom11, fightgeom;
var text = [];

function createNumberGeom(){ //Create countdown number/text geometries and objects and add them to the scene.
    var coverGeom, coverMat, cover;
    coverGeom = new THREE.PlaneGeometry(3,3);
    coverMat = new THREE.MeshBasicMaterial({color: 0x62626D});
    cover = new THREE.Mesh(coverGeom, coverMat);
    cover.position.set(39,5.5,-.7);
    cover.rotateY(-Math.PI/2); //Used to cover up the numbers in the background.
    geom1 = new THREE.TextGeometry('1',{font: 'gentilis', size: .5, height: 0.001});
    //TODO: Figure out how to change to a for loop. This looks ugly.
    text[0] = new THREE.Mesh(geom1, textMat);
    text[0].position.set(50,6,-1.15);
    text[0].rotateY(-Math.PI/2);
    geom2 = new THREE.TextGeometry('2',{font: 'gentilis', size: .5, height: 0.001});
    text[1] = new THREE.Mesh(geom2, textMat);
    text[1].position.set(50,6,-1.15);
    text[1].rotateY(-Math.PI/2);
    geom3 = new THREE.TextGeometry('3',{font: 'gentilis', size: .5, height: 0.001});
    text[2] = new THREE.Mesh(geom3, textMat);
    text[2].position.set(50,6,-1.15);
    text[2].rotateY(-Math.PI/2);
    geom4 = new THREE.TextGeometry('4',{font: 'gentilis', size: .5, height: 0.001});
    text[3] = new THREE.Mesh(geom4, textMat);
    text[3].position.set(50,6,-1.15);
    text[3].rotateY(-Math.PI/2);
    geom5 = new THREE.TextGeometry('5',{font: 'gentilis', size: .5, height: 0.001});
    text[4] = new THREE.Mesh(geom5, textMat);
    text[4].position.set(50,6,-1.15);
    text[4].rotateY(-Math.PI/2);
    geom6 = new THREE.TextGeometry('6',{font: 'gentilis', size: .5, height: 0.001});
    text[5] = new THREE.Mesh(geom6, textMat);
    text[5].position.set(50,6,-1.15);
    text[5].rotateY(-Math.PI/2);
    geom7 = new THREE.TextGeometry('7',{font: 'gentilis', size: .5, height: 0.001});
    text[6] = new THREE.Mesh(geom7, textMat);
    text[6].position.set(50,6,-1.15);
    text[6].rotateY(-Math.PI/2);
    geom8 = new THREE.TextGeometry('8',{font: 'gentilis', size: .5, height: 0.001});
    text[7] = new THREE.Mesh(geom8, textMat);
    text[7].position.set(50,6,-1.15);
    text[7].rotateY(-Math.PI/2);
    geom9 = new THREE.TextGeometry('9',{font: 'gentilis', size: .5, height: 0.001});
    text[8] = new THREE.Mesh(geom9, textMat);
    text[8].position.set(50,6,-1.15);
    text[8].rotateY(-Math.PI/2);
    geom10 = new THREE.TextGeometry('10',{font: 'gentilis', size: .5, height: 0.001});
    text[9] = new THREE.Mesh(geom10, textMat);
    text[9].position.set(50,6,-1.3);
    text[9].rotateY(-Math.PI/2);
    geom11 = new THREE.TextGeometry('KO!!!',{font: 'gentilis', size: .9, height: 0.001});
    text[10] = new THREE.Mesh(geom11, textMat);
    text[10].position.set(50,6,-2.2);
    text[10].rotateY(-Math.PI/2);
    geom12 = new THREE.TextGeometry('TKO!!',{font: 'gentilis', size: .9, height: 0.001});
    text[11] = new THREE.Mesh(geom12, textMat);
    text[11].position.set(50,6,-2.3);
    text[11].rotateY(-Math.PI/2);
    scene.add(text[0]);
    scene.add(text[1]);
    scene.add(text[2]);
    scene.add(text[2]);
    scene.add(text[3]);
    scene.add(text[4]);
    scene.add(text[5]);
    scene.add(text[6]);
    scene.add(text[7]);
    scene.add(text[8]);
    scene.add(text[9]);
    scene.add(text[10]);
    scene.add(text[11]);
}

function showFightText(){ //Start the game; Show "FIGHT!!!" then let enemy chose their first attack
    textMat.opacity = 1;
    var textTween = new TWEEN.Tween(text.position);
    textTween.to({x:-18},800); //Tween the text towards the camera.
    textTween.start();
    setTimeout(function(){ //After 1.5 seconds, revert text to its original position and make invisible.
        textMat.opacity=0; 
        text.position.x=50;
    }, 1500);
    setTimeout(function(){ //Game is on, player may move, enemy is attacking.
        gameState=3;
        playerStatus=1;
        chooseEnemyAttack();
    }, 2200);
}

function displayTKO(){ //Similar to showFightText, but without game altering.
    textMat.opacity = 1;
    var textTween = new TWEEN.Tween(text[11].position);
    textTween.to({x:-18},800);
    textTween.start();
    setTimeout(function(){
        textMat.opacity=0;
        text.position.x=50;
    }, 2000);
}

function countUp(){ //Count up for either side.
    var curText = text[count];
    count++;
    textMat.opacity = 1;
    var textTween = new TWEEN.Tween(curText.position);
    textTween.to({x:-18},700);
    textTween.start();
    if(count < 11 && enemyStatus == 4) //If enemy is the one currently down, roll to see if he gets up.
        checkEnemyGetUp();
    var timeout = 1000;
    if(count==11)
        timeout =3000; //Wait 3 seconds if count finishes.
    setTimeout(function(){ //Reset the text's position, then repeat for next number.
        textMat.opacity=0;
        curText.position.x=50;
        if(count < 11 && (playerStatus == 6 || enemyStatus ==4)){ //If count hasn't hit 10, keep going. If count has displayed "KO!" end game. 
            countUp();
        }
        else if (count==11)
            endGame();
    }, timeout);
}

function drawBoxingRing(){ //Draw the mat, ropes, corner poles, and add them all to the scene.
    var ropeMat, ropeGeom, rope1, rope2, rope3,
        rope4, rope5, rope6, rope7, rope8, rope9;
    var groundMat, groundGeom, ground;
    var poleMat, poleGeom, pole;
    var floor, floorMat, floorGeom;
    floorGeom = new THREE.PlaneGeometry(50,44);
    floorMat = new THREE.MeshBasicMaterial({color:0x006666});
    floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotateX(-Math.PI/2);
    floor.position.set(0,-6,-4.5);
    ropeMat = new THREE.MeshPhongMaterial({color: 0xCCCCCC});
    ropeGeom = new THREE.BoxGeometry(.5,.5,40);
    rope1 = new THREE.Mesh(ropeGeom, ropeMat);
    rope2 = new THREE.Mesh(ropeGeom, ropeMat);
    rope3 = new THREE.Mesh(ropeGeom, ropeMat);
    rope4 = new THREE.Mesh(ropeGeom, ropeMat);
    rope5 = new THREE.Mesh(ropeGeom, ropeMat);
    rope6 = new THREE.Mesh(ropeGeom, ropeMat);
    rope7 = new THREE.Mesh(ropeGeom, ropeMat);
    rope8 = new THREE.Mesh(ropeGeom, ropeMat);
    rope9 = new THREE.Mesh(ropeGeom, ropeMat);
    rope1.position.set(20,0,-4);
    rope2.position.set(20,-2,-4);
    rope3.position.set(20,-4,-4);
    rope4.rotateY(Math.PI/2);
    rope5.rotateY(Math.PI/2);
    rope6.rotateY(Math.PI/2);
    rope4.position.set(0,0,16);
    rope5.position.set(0,-2,16);
    rope6.position.set(0,-4,16);
    rope7.rotateY(Math.PI/2);
    rope8.rotateY(Math.PI/2);
    rope9.rotateY(Math.PI/2);    
    rope7.position.set(0,0,-24);
    rope8.position.set(0,-2,-24);
    rope9.position.set(0,-4,-24);
    var poleGeom, poleMat, pole1, pole2;
    poleGeom = new THREE.BoxGeometry(1,6,1);
    poleMat = new THREE.MeshBasicMaterial({color: 0x000000});
    pole1 = new THREE.Mesh(poleGeom, poleMat);
    pole2 = new THREE.Mesh(poleGeom, poleMat);
    pole1.position.set(19,-2,-23);
    pole2.position.set(19, -2,15);
    var ring = new THREE.Object3D();
    ring.add(rope1);
    ring.add(rope2);
    ring.add(rope3);
    ring.add(rope4);
    ring.add(rope5);
    ring.add(rope6);
    ring.add(rope7);
    ring.add(rope8);
    ring.add(rope9);
    ring.add(pole1);
    ring.add(pole2);
    ring.add(floor);
    ring.position.set(15,0,0);
    return ring;
}

function createLeftArm(){ //Create the left forearm arm of the player character.
    var forearm;
    forearm = new THREE.Object3D();
    var leftForeArm, leftFist;
    var leftForeArmGeom, leftForeArmMat, leftFistGeom, leftFistMat;
    leftForeArmGeom = new THREE.BoxGeometry(.7,2,.7);
    leftForeArmMat = new THREE.MeshBasicMaterial({color: 0xFFDCB1});
    leftForeArm = new THREE.Mesh(leftForeArmGeom,leftForeArmMat);
    leftFistGeom = new THREE.BoxGeometry(-2,-2,-.8);
    forearm.add(leftForeArm);
    forearm.position.set(0,-1,0);
    var fistGeom, fistMat, fist;
    fistGeom = new THREE.BoxGeometry(1.2,1.2,1.2);
    fistMat = new THREE.MeshBasicMaterial({color: 0xFF0000});
    fist = new THREE.Mesh(fistGeom, fistMat);
    fist.position.set(0,-1,0);
        forearm.add(fist);
    return(forearm);
    
}

function createUpperArm(){ //Create left upper arm of boxer.
    var upperArm = new THREE.Object3D();
    var armMat, armGeom, arm;
    armMat = new THREE.MeshBasicMaterial({color: 0xFFDCB1});
    armGeom = new THREE.BoxGeometry(.7,2,.7);
    arm = new THREE.Mesh(armGeom, armMat);
    arm.position.set(1,2,0);
    upperArm.add(arm);
    return upperArm;
}

function createHead(){ //Create boxer's head
    var head = new THREE.Object3D();
    var headGeom, headMat, headShape;
    var hairGeom, hairMat, hairShape;
    hairGeom = new THREE.BoxGeometry(2.1,.75,2.1);
    hairMat = new THREE.MeshBasicMaterial({color: 0x000000});
    hairShape = new THREE.Mesh(hairGeom, hairMat);
    hairShape.position.set(0,1,0);
    headGeom = new THREE.BoxGeometry(2,2,2);
    headMat = new THREE.MeshBasicMaterial({color: 0xFFDCB1});
    headShape = new THREE.Mesh(headGeom, headMat);
    head.add(headShape);
    head.add(hairShape);
    var noseGeom = new THREE.BoxGeometry(.1, .3, .05);
    var nose = new THREE.Mesh(noseGeom, hairMat);
    var eyeGeom = new THREE.BoxGeometry(.1,.3,.3);
    var leftEye = new THREE.Mesh(eyeGeom, hairMat);
    var rightEye = new THREE.Mesh(eyeGeom, hairMat);
    leftEye.position.set(1,.3,.5);
    rightEye.position.set(1,.3,-0.5);
    nose.position.set(1,0,0);
    head.add(leftEye);
    head.add(rightEye);
    head.add(nose);
    return head;
}

function createTorso(){ //Create boxer's torso.
    var boxerTorso = new THREE.Object3D();
    var torsoMat, torsoGeom, torso;
    var shortsMat, shortsGeom, shorts;
    
    torsoMat= new THREE.MeshBasicMaterial({color: 0x000000});
    torsoGeom = new THREE.BoxGeometry(2.5,5,3);
    torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.set(-2,0,-2.5);
    shortsMat = new THREE.MeshBasicMaterial({color: 0x3366FF});
    shortsGeom = new THREE.BoxGeometry(2.6,1.5,3.1);
    shorts = new THREE.Mesh(shortsGeom,shortsMat);
    shorts.position.set(-2,-2,-2.5);
    var shortsLegGeom = new THREE.BoxGeometry(2.6,1,1.2);
    var shortsLeftLeg = new THREE.Mesh(shortsLegGeom, shortsMat);
    shortsLeftLeg.position.set(-2,-3,-3.4);
    var shortsRightLeg = new THREE.Mesh(shortsLegGeom, shortsMat);
    shortsRightLeg.position.set(-2,-3,-1.5);
    boxerTorso.add(torso);
    boxerTorso.add(shorts);
    boxerTorso.add(shortsLeftLeg);
    boxerTorso.add(shortsRightLeg);
    return boxerTorso;
}

function createRightUpperArm(){ //Create boxer's right upper arm.
    var forearm;
    forearm = new THREE.Object3D();
    var leftForeArm, leftFist;
    var leftForeArmGeom, leftForeArmMat, leftFistGeom, leftFistMat;
    leftForeArmGeom = new THREE.BoxGeometry(.7,2,.7);
    leftForeArmMat = new THREE.MeshBasicMaterial({color: 0xFFDCB1});
    leftForeArm = new THREE.Mesh(leftForeArmGeom,leftForeArmMat);
    leftForeArm.position.set(0,-.5,0);
    leftFistGeom = new THREE.BoxGeometry(0,-2,-.8);
    forearm.add(leftForeArm);

    return(forearm);
}

function createRightForeArm(){ //Create boxer's right forearm.
  var upperArm, upperArmMat, upperArmGeom;
  var fistGeom, fistMat, fist;
    fistGeom = new THREE.BoxGeometry(1.2,1.2,1.2);
    fistMat = new THREE.MeshBasicMaterial({color: 0xFF0000});
    fist = new THREE.Mesh(fistGeom, fistMat);
  var uArm;
  var pivot, pivotMat, pivotGeom
  uArm = new THREE.Object3D();
    fist.position.set(0,-2,0);
        uArm.add(fist);
  upperArmMat = new THREE.MeshBasicMaterial({color: 0xFFDCB1});
 upperArmGeom = new THREE.BoxGeometry(.7,2,.7);
    upperArm = new THREE.Mesh(upperArmGeom, upperArmMat);
    upperArm.position.set(0,-1,0);
  uArm.add(upperArm);
  return uArm;
}

function createLeg(){ //Create boxer's leg. Called twice in different positions.
    var leg = new THREE.Object3D();
    var uLegGeom, uLegMat, uLeg;
    var footGeom, footMat, foot;
    uLegGeom = new THREE.BoxGeometry(.7,4,.7);
    uLegMat = new THREE.MeshBasicMaterial({color: 0xFFDCB1});
    uLeg = new THREE.Mesh(uLegGeom, uLegMat);
    uLeg.position.set(0,-1,0);
    leg.add(uLeg);
    footGeom = new THREE.BoxGeometry(1.5,1,1);
    footMat = new THREE.MeshBasicMaterial({color: 0x101010});
    foot = new THREE.Mesh(footGeom, footMat);
    foot.position.set(.3,-3,0);
    leg.add(foot);
    return leg;
}

function createEnemy(){ //Create all the object3Ds that make up our enemy.
    var enemy = new THREE.Object3D();
    var enemyTorsoGeom, enemySkinMat, enemyTorsoGeom2;
    enemyTorsoGeom = new THREE.BoxGeometry(6.8,7,9.7);
    enemySkinMat = new THREE.MeshLambertMaterial({color: 0x006600});
    enemyTorso = new THREE.Mesh(enemyTorsoGeom, enemySkinMat);
    enemyTorsoGeom2 = new THREE.BoxGeometry(7,6,9.7);
    enemyTorso2 = new THREE.Mesh(enemyTorsoGeom2, enemySkinMat);
    enemyTorso2.position.set(0,5,0);
    //enemy.rotateZ(-Math.PI/2);
    enemy.add(enemyTorso);
    enemy.add(enemyTorso2);
    var enemyPants, enemyPantsGeom, enemyPantsMat;
    enemyPantsGeom = new THREE.BoxGeometry(7,3.1,10);
    enemyPantsMat = new THREE.MeshBasicMaterial({color: 0x330033});
    enemyPants = new THREE.Mesh(enemyPantsGeom, enemyPantsMat);
    enemyPants.position.set(0,-2,0);
    var enemyPantLegGeom = new THREE.BoxGeometry(7,3,3.8);
    var enemyLeftPantLeg = new THREE.Mesh(enemyPantLegGeom, enemyPantsMat);
    var enemyRightPantLeg = new THREE.Mesh(enemyPantLegGeom, enemyPantsMat);
    enemyLeftPantLeg.position.set(0,-5,-3.1);
    enemyRightPantLeg.position.set(0,-5,3.1);
    var enemyHead = new THREE.Object3D();
    var enemyHeadMesh, enemyHeadGeom;
    enemyHeadGeom = new THREE.BoxGeometry(5,7,7);
    enemyHeadMesh = new THREE.Mesh(enemyHeadGeom,enemySkinMat);
    enemyHead.add(enemyHeadMesh);
    enemyHead.position.set(0,10,-.2);
    var enemyEyebrowGeom, enemyEyebrowMat;
    enemyEyebrowGeom = new THREE.BoxGeometry(.5,.5,2);
    enemyEyebrowMat = new THREE.MeshBasicMaterial({color: 0x000000});
    enemyLeftBrow = new THREE.Mesh(enemyEyebrowGeom, enemyEyebrowMat);
    enemyRightBrow = new THREE.Mesh(enemyEyebrowGeom, enemyEyebrowMat);
    enemyLeftBrow.position.set(-3,11,-2);
    enemyLeftBrow.rotateX(Math.PI/6);
    enemyRightBrow.position.set(-3,11,2);
    enemyRightBrow.rotateX(-Math.PI/6);
    var enemyFootGeom = new THREE.BoxGeometry(4,2,3.7);
    var enemyLeftFoot = new THREE.Mesh(enemyFootGeom,enemySkinMat);
    enemyLeftFoot.position.set(0,-7,-3.1);
    var enemyRightFoot = new THREE.Mesh(enemyFootGeom,enemySkinMat);
    enemyRightFoot.position.set(0,-7,3.1);
    var enemyHairMat, enemyHairGeom, enemyHair;
    enemyHairMat = new THREE.MeshLambertMaterial({color:0x001100});
    enemyHairGeom = new THREE.BoxGeometry(5.1,2,7.1);
    enemyHair = new THREE.Mesh(enemyHairGeom, enemyHairMat);
    enemyHair.position.set(0,13,-0.2);
    enemyLeftArm = new THREE.Object3D();
    var enemyLArm, enemyLArmGeom;
    enemyLArmGeom = new THREE.BoxGeometry(4,6,4);
    enemyLArm = new THREE.Mesh(enemyLArmGeom, enemySkinMat);
    enemyLArm.position.set(0,-3,0);
    var enemyLForearm, enemyLFGeom;
    enemyLFGeom = new THREE.BoxGeometry(4,6,4);
    enemyLForearm = new THREE.Mesh(enemyLFGeom, enemySkinMat);
    enemyLForearm.position.set(0,-3,0);
    enemyLeftForeArm = new THREE.Object3D();
    enemyLeftForeArm.add(enemyLForearm);
    enemyLeftForeArm.position.set(0,-4.5,-0.5);
    enemyRightArm = new THREE.Object3D();
    var enemyRArm, enemyRArmGeom;
    enemyRArmGeom = new THREE.BoxGeometry(4,6,4);
    enemyRArm = new THREE.Mesh(enemyRArmGeom, enemySkinMat);
    enemyRArm.position.set(0,-3,0);
    var enemyRForearm, enemyRFGeom;
    enemyRFGeom = new THREE.BoxGeometry(4,6,4);
    enemyRForearm = new THREE.Mesh(enemyRFGeom, enemySkinMat);
    enemyRForearm.position.set(0,-2.2,-2.2);
    enemyRForearm.rotateX(Math.PI/4);
    enemyRightForeArm = new THREE.Object3D();
    enemyRightForeArm.add(enemyRForearm);
    enemyRightForeArm.position.set(0,-4.5,.5);
    enemyRightArm.add(enemyRArm);
    enemyRightArm.add(enemyRightForeArm);
    enemyLeftForeArm.rotateX(-Math.PI/4);
    enemyLeftArm.add(enemyLArm);
    enemyLeftArm.add(enemyLeftForeArm);
    enemyLeftArm.position.set(0,6.4,-4);
    enemyLeftArm.rotateX(Math.PI/3);
    enemyRightArm.position.set(0,6.4,4);
    enemyRightArm.rotateX(-Math.PI/3);
    enemy.add(enemyLeftArm);
    enemy.add(enemyRightArm);
    enemy.add(enemyHair);
    enemy.add(enemyHead);
    enemy.add(enemyLeftBrow);
    enemy.add(enemyRightBrow);
    enemy.add(enemyPants);
    enemy.add(enemyLeftPantLeg);
    enemy.add(enemyRightPantLeg);
    enemy.add(enemyLeftFoot);
    enemy.add(enemyRightFoot);
    enemy.position.set(0,7,0);
    return enemy;
}

/////////////////////////////////////////////////////////PLAYER ANIMATIONS/////////////////////////////////////////////////////

function dodgeLeft(){ //Dodge away from the opponent's attack.
    if(!midAnimation && playerStatus< 5 && enemyStatus !=4){ //Not in the middle of an animation, not knocked down, enemy not knocked down.
        midAnimation = true;
        playerStatus = 2; //2= left dodge
        setTimeout(function () {
            if(playerStatus!=5){
            playerStatus=1; //Player returned to neutral after dodge.  
            }
        }, 300); //Dodging leaves the user in dodge state for 300ms, then vulnerable for 150ms.
        setTimeout(function(){
            if(playerStatus!=5){
                midAnimation = false;  
            }
        }, 450);
        tweenA = new TWEEN.Tween(lilBoxer.position);
        tweenB = new TWEEN.Tween(lilBoxer.position);
        tweenA.to({z : -3.7, x: -5.3},150); //Move to the left (-z). -x is to compensate for rotation.
        tweenB.to({z : 1.5, x:0},150);
        tweenA.chain(tweenB);
        tweenRot = new TWEEN.Tween(lilBoxer.rotation);
        tweenRot.to({y: -3*Math.PI/8}, 150);
        tweenRot2 = new TWEEN.Tween(lilBoxer.rotation);
        tweenRot2.to({y: 0}, 150);
        tweenRot.chain(tweenRot2);
        tweenA.start();
        tweenRot.start();
    }
}


function dodgeRight(){ //Essentially the same as dodgeLeft, but moves differently.
    if(!midAnimation && playerStatus<5 && enemyStatus !=4){
        midAnimation = true;
        playerStatus=3;
        setTimeout(function () {
            if(playerStatus!=5){
            playerStatus=1; //Player returned to neutral after dodge.  
            }
        }, 300); //Dodging leaves the user in dodge state for 300ms, then vulnerable for 300ms.
        setTimeout(function(){
            if(playerStatus!=5){
                midAnimation = false;  
            }
        }, 450);
        tweenA = new TWEEN.Tween(lilBoxer.position);
        tweenB = new TWEEN.Tween(lilBoxer.position);
        tweenA.to({z : 2.5},150);
        tweenB.to({z : 1.5},150);
        tweenA.chain(tweenB);
        tweenRot = new TWEEN.Tween(lilBoxer.rotation);
        tweenRot.to({y: Math.PI/2}, 150);
        tweenRot2 = new TWEEN.Tween(lilBoxer.rotation);
        tweenRot2.to({y: 0}, 150);
        tweenRot.chain(tweenRot2);
        tweenA.start();
        tweenRot.start();
    }
}
var isBlocking = false;
function block(){ //Enters a blocking state, reducing the player's damage taken.
    if(!isBlocking && !midAnimation && playerStatus<5  && enemyStatus !=4){ //Play animation if not in another animation, not already blocking, and enemy is standing.
        midAnimation = true;
        playerStatus=4;
        var tweenA = new TWEEN.Tween(rightArmPivot.rotation);
        tweenA.to({x: -Math.PI/5, z : Math.PI/2}, 100);
        tweenA.start();
        var tweenB = new TWEEN.Tween(leftArmPivot.rotation);
        tweenB.to({x: Math.PI/5, z : Math.PI/2},100);
        tweenB.start();
        var tweenC = new TWEEN.Tween(lilBoxer.position);
        tweenC.to({y: -1}, 100);
        tweenC.start();
        isBlocking=true;
    }
}

function unblock(){ //Cease blocking, returning the player to a neutral state.
    if(isBlocking){
        midAnimation = false; //Player can act immediately out of blocking.
        playerStatus=1; //Player returned to neutral.
        var tweenA = new TWEEN.Tween(rightArmPivot.rotation);
        tweenA.to({x: 0, z : Math.PI/8}, 100);
        tweenA.start(); //Animate the boxer
        var tweenB = new TWEEN.Tween(leftArmPivot.rotation);
        tweenB.to({x: 0, z : Math.PI/8},100);
        tweenB.start();
        isBlocking = false;
        var tweenC = new TWEEN.Tween(lilBoxer.position);
        tweenC.to({y: 0}, 100);
        tweenC.start();
    }
    
}

function leftBodyBlow(){ //A lower left punch.
    if(!midAnimation && playerStatus <5 && enemyStatus !=4){ //Only play if not playing another animation and not knocked down.
    midAnimation = true;
    setTimeout(function () {
        midAnimation = false;
    }, 270); //Punching will lock the player's input until the last 30ms, allowing for some input buffering.
    tweenA = new TWEEN.Tween(lilBoxer.position); //Tween the left arm and the boxer accordingly.
    tweenB = new TWEEN.Tween(lilBoxer.position); //First tween extends the arm. Second tween returns it to neutral state.
    tweenA.to({x : 1},150);
    tweenB.to({x : 0},150);
    tweenA.chain(tweenB);
    var tweenC = new TWEEN.Tween(leftArmPivot.rotation);
    var tweenD = new TWEEN.Tween(leftArmPivot.rotation);
    tweenC.to({z: 2*Math.PI/3}, 150);
    tweenD.to({z: Math.PI/8}, 150);
    tweenC.chain(tweenD);
    var tweenE = new TWEEN.Tween(leftForearmPivot.rotation); 
    var tweenF = new TWEEN.Tween(leftForearmPivot.rotation);
    tweenE.to({z : 0}, 150);
    tweenF.to({z : Math.PI/2}, 150);
    tweenE.chain(tweenF);
    tweenA.start();
    tweenC.start();
    tweenE.start();
    setTimeout(function() {
        checkEnemyBlock();
    }, 150);
    }
    if(playerStatus==6 && playerKDs<3 && count <11){
        if(lilBoxer.position.y<0)
        lilBoxer.position.y+=.5;
        if(lilBoxer.position.y ==0)
            resumeFight();
    }
}

function rightBodyBlow(){ //Essentially the same as leftBodyBlow
    if(!midAnimation && playerStatus<5 && enemyStatus !=4){
    midAnimation = true;
    setTimeout(function () {
        midAnimation = false;    
    }, 270);
    setTimeout(function() {
        checkEnemyBlock();
    }, 150);
    tweenA = new TWEEN.Tween(lilBoxer.position);
    tweenB = new TWEEN.Tween(lilBoxer.position);
    tweenA.to({x : 1},150);
    tweenB.to({x : 0},150);
    tweenA.chain(tweenB);
    var tweenC = new TWEEN.Tween(rightArmPivot.rotation);
    var tweenD = new TWEEN.Tween(rightArmPivot.rotation);
    tweenC.to({z: 2*Math.PI/3}, 150);
    tweenD.to({z: Math.PI/8}, 150);
    tweenC.chain(tweenD);
    var tweenE = new TWEEN.Tween(rightForearmPivot.rotation);
    var tweenF = new TWEEN.Tween(rightForearmPivot.rotation);
    tweenE.to({z : 0}, 150);
    tweenF.to({z : Math.PI/2}, 150);
    tweenE.chain(tweenF);
    tweenA.start();
    tweenC.start();
    tweenE.start();
    }
    if(playerStatus==6 && playerKDs<3 && count<11){
        if(lilBoxer.position.y<0)
        lilBoxer.position.y+=.5;
        if(lilBoxer.position.y ==0)
            resumeFight();
    }
}

function leftPunch(){ //A higher version of leftBodyBlow
    if(!midAnimation && playerStatus<5 && enemyStatus !=4){
        midAnimation = true;
        setTimeout(function () {
            midAnimation = false;    
        }, 270);
        setTimeout(function() {
            checkEnemyBlock();
        }, 150);
        var tweenA = new TWEEN.Tween(lilBoxer.position);
        var tweenB = new TWEEN.Tween(lilBoxer.position);
        tweenA.to({y : 3},150);
        tweenB.to({y : 0},150);
        tweenA.chain(tweenB);
        var tweenC = new TWEEN.Tween(leftArmPivot.rotation);
        var tweenD = new TWEEN.Tween(leftArmPivot.rotation);
        tweenC.to({z: 2*Math.PI/3}, 150);
        tweenD.to({z: Math.PI/8}, 150);
        tweenC.chain(tweenD);
        var tweenE = new TWEEN.Tween(leftForearmPivot.rotation);
        var tweenF = new TWEEN.Tween(leftForearmPivot.rotation);
        tweenE.to({z : 0}, 150);
        tweenF.to({z : Math.PI/2}, 150);
        tweenE.chain(tweenF);
        tweenA.start();
        tweenC.start();
        tweenE.start();
    }
    if(playerStatus==6 && playerKDs<3 && count < 11){
        if(lilBoxer.position.y<0)
        lilBoxer.position.y+=.5;
        if(lilBoxer.position.y ==0)
            resumeFight();
    }
}

function rightPunch(){ //Essentially the same as leftPunch
    if(!midAnimation && playerStatus<5 && enemyStatus !=4){
        midAnimation = true;
        setTimeout(function () {
            midAnimation = false;    
        }, 270);
        setTimeout(function() {
            checkEnemyBlock();
        }, 150);
        var tweenA = new TWEEN.Tween(lilBoxer.position);
        var tweenB = new TWEEN.Tween(lilBoxer.position);
        tweenA.to({y : 3},150);
        tweenB.to({y : 0},150);
        tweenA.chain(tweenB);
        var tweenC = new TWEEN.Tween(rightArmPivot.rotation);
        var tweenD = new TWEEN.Tween(rightArmPivot.rotation);
        tweenC.to({z: 2*Math.PI/3}, 150);
        tweenD.to({z: Math.PI/8}, 150);
        tweenC.chain(tweenD);
        var tweenE = new TWEEN.Tween(rightForearmPivot.rotation);
        var tweenF = new TWEEN.Tween(rightForearmPivot.rotation);
        tweenE.to({z : 0}, 150);
        tweenF.to({z : Math.PI/2}, 150);
        tweenE.chain(tweenF);
        tweenA.start();
        tweenC.start();
        tweenE.start();
    }
    if(playerStatus==6 && playerKDs<3 && count<11){
        if(lilBoxer.position.y<0)
        lilBoxer.position.y+=.5;
        if(lilBoxer.position.y ==0)
            resumeFight();
    }
}

function checkPlayerKD(){
    if(playerHealth <=0){//Check if player is supposed to be knocked down.
        playerKDs++;
        var tweenKD = new TWEEN.Tween(lilBoxer.position);
        tweenKD.to({y:-10},400);
        tweenKD.start();
        setTimeout(function(){
            if(playerKDs==3)
                endGame();
            else
                countUp();
        },800);
    }
}

function playerHitRight(){ //Enemy punched player to the right.   
    checkPlayerKD();
    playerStatus=5;
    midAnimation=true;
    //Do the following: Move lilBoxer's body, rotate it, and rotate his head.
    if(typeof tweenA !=='undefined'){
        tweenA.stop();
        tweenB.stop();
        tweenA.stopChainedTweens();
        tweenB.stopChainedTweens();
    }
    if(typeof tweenRot !=='undefined'){
        tweenRot.stop();
        tweenRot.stopChainedTweens();
    }
    tweenA = new TWEEN.Tween(lilBoxer.position);
    var tweenA2 = new TWEEN.Tween(lilBoxer.position);
    tweenB = new TWEEN.Tween(lilBoxer.rotation);
    var tweenB2 = new TWEEN.Tween(lilBoxer.rotation);
    var tweenC = new TWEEN.Tween(head.rotation);
    var tweenC2 = new TWEEN.Tween(head.rotation);
    tweenA.to({z: 3, x:-6},200);
    tweenA2.to({z:1.5, x:0},400);
    tweenB.to({y:-Math.PI/4},200);
    tweenB2.to({y:0},200);
    tweenC.to({y:-Math.PI/4},200);
    tweenC2.to({y:0},200);
    tweenA.start();
    tweenB.start();
    tweenC.start();
    setTimeout(function (){
        tweenB2.start();
        tweenC2.start();
    }, 400);
    setTimeout(function () {
        tweenA2.start();
    }, 600);
    setTimeout(function () { //Player cannot act until hit animation completes.
        if(playerStatus!=6)
            playerStatus=1;
        midAnimation=false;
    }, 1400);
}

function playerHitLeft(){ //Enemy punched player to the left.
    checkPlayerKD();
    playerStatus=5;
    midAnimation=true;
    if(typeof tweenA !=='undefined'){
        tweenA.stop();
        tweenB.stop();
        tweenA.stopChainedTweens();
        tweenB.stopChainedTweens();
    }
    if(typeof tweenRot !=='undefined'){
        tweenRot.stop();
        tweenRot.stopChainedTweens();
    }
    //Do the following: Move lilBoxer's body, rotate it, and rotate his head.
    var tweenA = new TWEEN.Tween(lilBoxer.position);
    var tweenA2 = new TWEEN.Tween(lilBoxer.position);
    var tweenB = new TWEEN.Tween(lilBoxer.rotation);
    var tweenB2 = new TWEEN.Tween(lilBoxer.rotation);
    var tweenC = new TWEEN.Tween(head.rotation);
    var tweenC2 = new TWEEN.Tween(head.rotation);
    tweenA.to({z: -3, x:-3},200);
    tweenA2.to({z:1.5, x:0},200);
    tweenB.to({y:Math.PI/4},200);
    tweenB2.to({y:0},200);
    tweenC.to({y:Math.PI/4},200);
    tweenC2.to({y:0},200);
    tweenA.start();
    tweenB.start();
    tweenC.start();
    setTimeout(function (){
        tweenB2.start();
        tweenC2.start();
    }, 400);
    setTimeout(function () {
        tweenA2.start();
    }, 600);
    setTimeout(function () { //Player cannot act until hit animation completes.
        midAnimation=false;
        if(playerStatus!=6)
            playerStatus=1;
    }, 1400);
}

function playerBlocked(){
    if(playerHealth <=0){
        unblock();
        var tweenKD = new TWEEN.Tween(lilBoxer.position);
        tweenKD.to({y:-10},400);
        tweenKD.start();
        countUp();
    }
    var tweenA = new TWEEN.Tween(lilBoxer.position);
    var tweenA2 = new TWEEN.Tween(lilBoxer.position);
    tweenA.to({x:-1},100);
    tweenA2.to({x:0},100);
    tweenA.chain(tweenA2);
    tweenA.start();
}

function playerWinAnimation(){
    var tweenPos = new TWEEN.Tween(lilBoxer.position);
    var tweenRot = new TWEEN.Tween(lilBoxer.rotation);
    tweenPos.to({x:-5, z:-4},500);
    tweenRot.to({y:Math.PI},500);
    tweenRot.start();
    tweenPos.start();
    var tweenA = new TWEEN.Tween(rightArmPivot.rotation);
    var tweenA2 = new TWEEN.Tween(rightArmPivot.rotation);
    var tweenB = new TWEEN.Tween(leftArmPivot.rotation);
    var tweenB2 = new TWEEN.Tween(leftArmPivot.rotation);
    var tweenE = new TWEEN.Tween(lilBoxer.position);
    var tweenE2 = new TWEEN.Tween(lilBoxer.position);
    tweenA.to({z:3*Math.PI/4},200);
    tweenB.to({z:3*Math.PI/4},200);
    tweenA2.to({z:Math.PI/2},200);
    tweenB2.to({z:Math.PI/2},200);
    tweenA.chain(tweenA2);
    tweenB.chain(tweenB2);
    tweenA2.chain(tweenA);
    tweenB2.chain(tweenB);
    tweenE.to({y:.5},200);
    tweenE2.to({y:0},200);
    tweenE.chain(tweenE2);
    tweenE2.chain(tweenE);
    var tweenC = new TWEEN.Tween(rightForearmPivot.rotation);
    var tweenD = new TWEEN.Tween(leftForearmPivot.rotation);
    tweenC.to({z:Math.PI/3},200);
    tweenD.to({z:Math.PI/3},200);
    setTimeout(function(){
        tweenA.start();
        tweenB.start();
        tweenC.start();
        tweenD.start();
        tweenE.start();
    }, 700);
}
///////////////////////////////////////////ENEMY ANIMATIONS//////////////////////////////////////////////////////////

function playIntroAnimation(){
    gameState=2;
    enemy.position.y = 50;
    enemyRightArm.rotation.y = Math.PI;
    enemyLeftArm.rotation.y = -Math.PI;
    var tweenA = new TWEEN.Tween(enemy.position);
    tweenA.to({y:-5},700);
    tweenA.start();
    var tweenB = new TWEEN.Tween(enemy.position);
    var tweenB2 = new TWEEN.Tween(enemy.position);
    tweenB.to({y:-4.7},30);
    tweenB2.to({y:-5.3},30);
    tweenB.chain(tweenB2);
    tweenB2.chain(tweenB);
    
    setTimeout(function(){
        tweenB.start();
    },1000);
    
    setTimeout(function(){
        tweenB.stop();
        tweenB2.stop();
        enemyToNeutral(600);
    }, 2000);
    
    setTimeout(function(){
        var parsedOption = 0;
        do{
            var option = prompt("You enter the ring looking to make a name for yourself when suddenly, The Incredible Bulk reveals himself to be your opponent!\n\"BULK CRUSH PUNY HUMAN!!!\" the green giant bellows. How do you respond?\n" + "1: Pffft, whatever. (Hard Mode)\n" + "2: Bring it on! (Normal Mode)\n" + "3: I don't wanna die!!! (Easy Mode)");
            parsedOption = parseInt(option, 10);
        } while(parsedOption != 1 && parsedOption !=2 && parsedOption !=3);
        difficulty = parsedOption;
        showFightText();
        if(difficulty ==1)
            speedModifier = 1.13;
        if(difficulty ==2)
            speedModifier = 1;
        if(difficulty ==3)
            speedModifier = 0.9;
    }, 2600);
}

function enemyWinAnimation(){
    setTimeout(function(){
    var tweenA = new TWEEN.Tween(enemy.position);
    var tweenA2 = new TWEEN.Tween(enemy.position);
    var tweenA3 = new TWEEN.Tween(enemy.position);
    var tweenB = new TWEEN.Tween(enemyLeftArm.rotation);
    var tweenB2 = new TWEEN.Tween(enemyLeftArm.rotation);
    var tweenB3 = new TWEEN.Tween(enemyLeftArm.rotation);
    var tweenC = new TWEEN.Tween(enemyRightArm.rotation);
    var tweenC2 = new TWEEN.Tween(enemyRightArm.rotation);
    var tweenC3 = new TWEEN.Tween(enemyRightArm.rotation);
    var tweenD = new TWEEN.Tween(enemyLeftForeArm.rotation);
    var tweenE = new TWEEN.Tween(enemyRightForeArm.rotation);
    var tweenJ = new TWEEN.Tween(enemy.position);
    var tweenJ2 = new TWEEN.Tween(enemy.position);
    tweenA.to({x:enemy.position.x-3},600);
    tweenA2.to({y:enemy.position.y-.5},30);
    tweenA3.to({y:enemy.position.y+.5},30);
    tweenA.chain(tweenA2);
    tweenA2.chain(tweenA3);
    tweenA3.chain(tweenA2);
    tweenB.to({y: -Math.PI, x:Math.PI/2},300);
    tweenC.to({y: Math.PI, x:-Math.PI/2},300);
    tweenD.to({x: -Math.PI/3},70);
    tweenE.to({x: Math.PI/12},70);
    tweenA.start();
    tweenB.start();
    tweenC.start();
    tweenD.start();
    tweenE.start();
    tweenJ.to({y:enemy.position.y-1},600);
    tweenJ2.to({y:50},500);
    setTimeout(function(){
        tweenA2.stop();
        tweenA3.stop();
        tweenJ.start();
    }, 2000);
    setTimeout(function(){
        tweenJ2.start();
    }, 3000);
    },500);
}

function enemyLeftPunch(){
    enemyStatus=3; //Immune.
    var tweenA = new TWEEN.Tween(enemyLeftArm.rotation);
    var tweenA2 = new TWEEN.Tween(enemyLeftArm.rotation);
    var tweenB = new TWEEN.Tween(enemyLeftForeArm.rotation);
    var tweenB2 = new TWEEN.Tween(enemyLeftForeArm.rotation);
    tweenEnemyPos = new TWEEN.Tween(enemy.position);
    var tweenC2 = new TWEEN.Tween(enemy.position);
    var tweenE = new TWEEN.Tween(enemyLeftArm.position);
    var tweenE2 = new TWEEN.Tween(enemyLeftArm.position);
    var tweenD = new TWEEN.Tween(enemy.rotation);
    tweenA.to({y: -Math.PI, z:-Math.PI/2},220/speedModifier);
    tweenA2.to({y: Math.PI/12},220/speedModifier);
    tweenA.chain(tweenA2);
    tweenB.to({x: -Math.PI/2},220/speedModifier);
    tweenB2.to({x:0},220/speedModifier);
    tweenB.chain(tweenB2);
    tweenEnemyPos.to({x: 17, z:-3}, 220/speedModifier);
    tweenC2.to({x:13, z:-1},220/speedModifier);
    tweenD.to({y: Math.PI/4},440/speedModifier);
    tweenEnemyPos.chain(tweenC2);
    tweenE.to({y:7},220/speedModifier);
    tweenA.start();
    tweenB.start();
    tweenEnemyPos.start();
    setTimeout(function () { //Animations to start midway through.
        tweenD.start();   
        tweenE.start();
    }, 220/speedModifier);
    setTimeout(function(){
        checkPlayerDodge(1);
    }, 440/speedModifier);
    setTimeout(function () {
        enemyToNeutral(600/speedModifier); //Return enemy to neutral after a vulnerability period.
    }, 1040/speedModifier);
}

function enemyRightPunch(){
    enemyStatus=3;
    var tweenA = new TWEEN.Tween(enemyRightArm.rotation);
    var tweenA2 = new TWEEN.Tween(enemyRightArm.rotation);
    var tweenB = new TWEEN.Tween(enemyRightForeArm.rotation);
    var tweenB2 = new TWEEN.Tween(enemyRightForeArm.rotation);
    tweenEnemyPos = new TWEEN.Tween(enemy.position);
    var tweenC2 = new TWEEN.Tween(enemy.position);
    var tweenE = new TWEEN.Tween(enemyRightArm.position);
    var tweenE2 = new TWEEN.Tween(enemyRightArm.position);
    tweenEnemyRot = new TWEEN.Tween(enemy.rotation);
    tweenA.to({y: Math.PI, z:-Math.PI/2},220/speedModifier);
    tweenA2.to({y: -Math.PI/12},220/speedModifier);
    tweenA.chain(tweenA2);
    tweenB.to({x: 0},220/speedModifier);
    tweenB2.to({x:-Math.PI/8},220/speedModifier);
    tweenB.chain(tweenB2);
    tweenEnemyPos.to({x: 17, z:-3}, 220/speedModifier);
    tweenC2.to({x:13, z:-1},220/speedModifier);
    tweenEnemyRot.to({y: -Math.PI/4},440/speedModifier);
    tweenEnemyPos.chain(tweenC2);
    tweenE.to({y:7},220/speedModifier);
    tweenA.start();
    tweenB.start();
    tweenEnemyPos.start();
    setTimeout(function () {
        tweenEnemyRot.start();   
        tweenE.start();
    }, 220/speedModifier);
    setTimeout(function(){
        checkPlayerDodge(2);
    }, 440/speedModifier);
    setTimeout(function () {
        enemyToNeutral(600/speedModifier);
    }, 1040/speedModifier);
}

function enemyDelayedLeftPunch(){ //Still need to finish. Not implemented yet.
    enemyStatus=3; //Immune.
    
    //Have Bulk shake to telegraph the delay on the punch.
    var tweenP = new TWEEN.Tween(enemy.position);
    var tweenP2 = new TWEEN.Tween(enemy.position);
    tweenP.to({y:enemy.position.y-.3},30/speedModifier);
    tweenP2.to({y:enemy.position.y+.3},30/speedModifier);
    tweenP.chain(tweenP2);
    tweenP2.chain(tweenP);
    
    //Normal left punch tweens.
    var tweenA = new TWEEN.Tween(enemyLeftArm.rotation);
    var tweenA2 = new TWEEN.Tween(enemyLeftArm.rotation);
    var tweenB = new TWEEN.Tween(enemyLeftForeArm.rotation);
    var tweenB2 = new TWEEN.Tween(enemyLeftForeArm.rotation);
    tweenEnemyPos = new TWEEN.Tween(enemy.position);
    var tweenC2 = new TWEEN.Tween(enemy.position);
    var tweenE = new TWEEN.Tween(enemyLeftArm.position);
    var tweenE2 = new TWEEN.Tween(enemyLeftArm.position);
    var tweenD = new TWEEN.Tween(enemy.rotation);
    tweenP.start();
    
    setTimeout(function(){
        tweenP.stop();
        tweenP2.stop();
        tweenA.to({y: -Math.PI, z:-Math.PI/2},220/speedModifier);
        tweenA2.to({y: Math.PI/12},220/speedModifier);
        tweenB.to({x: -Math.PI/2},220/speedModifier);
        tweenB2.to({x:0},220/speedModifier);
        tweenEnemyPos.to({x: 17, z:-3}, 220/speedModifier);
        tweenC2.to({x:13, z:-1},220/speedModifier);
        tweenD.to({y: Math.PI/4},440/speedModifier);
        tweenE.to({y:7},220/speedModifier);
        tweenA.start();
        tweenB.start();
        tweenEnemyPos.start();
    }, 600/speedModifier);
    setTimeout(function () { //Animations to start midway through.
        tweenC2.start();
        tweenB2.start();
        tweenA2.start();
        tweenD.start();   
        tweenE.start();
    }, 1220/speedModifier);
    setTimeout(function(){
        checkPlayerDodge(1);
    }, 1440/speedModifier);
    setTimeout(function () {
        enemyToNeutral(600/speedModifier); //Return enemy to neutral after a vulnerability period.
    }, 2040/speedModifier);
}

function enemyDelayedRightPunch(){ //Same as above.
    enemyStatus=3;
    var tweenP = new TWEEN.Tween(enemy.position);
    var tweenP2 = new TWEEN.Tween(enemy.position);
    tweenP.to({y:enemy.position.y-.3},30/speedModifier);
    tweenP2.to({y:enemy.position.y+.3},30/speedModifier);
    tweenP.chain(tweenP2);
    tweenP2.chain(tweenP);
    var tweenA = new TWEEN.Tween(enemyRightArm.rotation);
    var tweenA2 = new TWEEN.Tween(enemyRightArm.rotation);
    var tweenB = new TWEEN.Tween(enemyRightForeArm.rotation);
    var tweenB2 = new TWEEN.Tween(enemyRightForeArm.rotation);
    tweenEnemyPos = new TWEEN.Tween(enemy.position);
    var tweenC2 = new TWEEN.Tween(enemy.position);
    var tweenE = new TWEEN.Tween(enemyRightArm.position);
    var tweenE2 = new TWEEN.Tween(enemyRightArm.position);
    tweenEnemyRot = new TWEEN.Tween(enemy.rotation);
    tweenEnemyPos.start();
    tweenP.start();
    setTimeout(function(){
        tweenP.stop();
        tweenP2.stop();
       tweenA.to({y: Math.PI, z:-Math.PI/2},220/speedModifier);
    tweenA.to({y: Math.PI, z:-Math.PI/2},220/speedModifier);
    tweenA2.to({y: -Math.PI/12},220/speedModifier);
    tweenB.to({x: 0},220/speedModifier);
    tweenB2.to({x:-Math.PI/8},220/speedModifier);
    tweenEnemyPos.to({x: 17, z:0}, 220/speedModifier);
    tweenC2.to({x:13, z:-1},220/speedModifier);
    tweenEnemyRot.to({y: -Math.PI/4},440/speedModifier);
    tweenE.to({y:7},220/speedModifier);
    tweenA.start();
    tweenB.start();
    }, 600/speedModifier);
    setTimeout(function () { //Animations to start midway through.
        tweenC2.start();
        tweenB2.start();
        tweenA2.start();
        tweenEnemyRot.start();   
        tweenE.start();
    }, 1220/speedModifier);
    setTimeout(function(){
        checkPlayerDodge(2);
    }, 1440/speedModifier);
    setTimeout(function () {
        enemyToNeutral(600);
    }, 2040/speedModifier);
}

function enemySpecial(){
    enemyStatus=3;
    var tweenA = new TWEEN.Tween(enemy.position);
    var tweenA2 = new TWEEN.Tween(enemy.position);
    var tweenA3 = new TWEEN.Tween(enemy.position);
    var tweenB = new TWEEN.Tween(enemyLeftArm.rotation);
    var tweenB2 = new TWEEN.Tween(enemyLeftArm.rotation);
    var tweenC = new TWEEN.Tween(enemyRightArm.rotation);
    var tweenC2 = new TWEEN.Tween(enemyRightArm.rotation);
    var tweenD = new TWEEN.Tween(enemyLeftForeArm.rotation);
    var tweenD2 = new TWEEN.Tween(enemyLeftArm.rotation);
    var tweenE = new TWEEN.Tween(enemyRightForeArm.rotation);
    var tweenE2 = new TWEEN.Tween(enemyRightArm.rotation);
    
    tweenA.to({y:enemy.position.y-1},600/speedModifier);
    tweenB.to({y: -Math.PI, x:Math.PI/2},300/speedModifier);
    tweenC.to({y: Math.PI, x:-Math.PI/2},300/speedModifier);
    tweenD.to({x: -Math.PI/3},300/speedModifier);
    tweenE.to({x: Math.PI/12},300/speedModifier);
    tweenA2.to({y:50},500/speedModifier);
    tweenA.chain(tweenA2);
    tweenA.start();
    tweenB.start();
    tweenC.start();
    tweenD.start();
    tweenE.start();
    setTimeout(function () {
        tweenA3.to({y:-5, x:10},350/speedModifier);
        tweenA3.start();
        tweenB2.to({z: Math.PI/2},50/speedModifier);
        tweenC2.to({z: Math.PI/2},50/speedModifier);
        tweenB2.start();
        tweenC2.start();
    }, 2000/speedModifier);
    setTimeout(function () {
        tweenD2.to({y:-3*Math.PI/8},100/speedModifier);
        tweenE2.to({y:3*Math.PI/8},100/speedModifier);
        tweenD2.start();
        tweenE2.start();
    }, 2350/speedModifier);
    setTimeout(function(){
        checkPlayerDodge(3);
    }, 2450/speedModifier);
    setTimeout(function(){
        enemyToNeutral(600/speedModifier);
    }, 3450/speedModifier);
}

function enemyToNeutral(time){ //Return enemy to neutral position.
    //time in most scenario is .6 seconds. .0001 if blocking.
    if(enemyStatus!=40){
    enemyMidAttack=false;
        enemyLeftBrow.rotation.x = Math.PI/6;
    enemyRightBrow.rotation.x = -Math.PI/6;
    var tweenA = new TWEEN.Tween(enemyLeftArm.rotation);
    var tweenB = new TWEEN.Tween(enemyLeftForeArm.rotation);
    var tweenC = new TWEEN.Tween(enemy.position);
    var tweenE = new TWEEN.Tween(enemyLeftArm.position);
    var tweenD = new TWEEN.Tween(enemy.rotation);
    var tweenF = new TWEEN.Tween(enemyRightArm.rotation);
    var tweenG = new TWEEN.Tween(enemyRightForeArm.rotation);
    var tweenH = new TWEEN.Tween(enemyRightArm.position);
    tweenA.to({x: Math.PI/3, y:0, z:0},time);
    tweenB.to({x:-Math.PI/4, z:0},time);
    tweenC.to({x:15, y:-5, z:-1},time);
    tweenD.to({y:0, z:0},time);
    tweenE.to({y:6.4},time);
    tweenF.to({x: -Math.PI/3, y:0, z:0},time);
    tweenG.to({x:0, z:0},time);
    tweenH.to({y:6.4},time);
    tweenA.start();
    tweenB.start();
    tweenC.start();
    tweenD.start();
    tweenE.start();
    tweenF.start();
    tweenG.start();
    tweenH.start();
    setTimeout(function(){
        if(enemyStatus!=4 && time>100)
        enemyStatus=1;
    }, 1800); //
    
    setTimeout(function(){
        if(time>100)
        if(enemyStatus!=4 && gameState==3){
        enemyStatus=3;
        chooseEnemyAttack();
        }
    }, 2500);
    }
}

function enemyHit(){ //Bulk's hit animation.
    enemyHealth-=difficulty; //Normally 1. 20 for testing.
    updateHealthBars();
    enemyLeftBrow.rotation.x = -Math.PI/4; //BULK HURT EYEBROWS! Used to communnicate when Bulk has been hit and can continue being hit.
    enemyRightBrow.rotation.x = Math.PI/4;
    tweenEnemyPos = new TWEEN.Tween(enemy.position);
    var tweenEnemyPos2 = new TWEEN.Tween(enemy.position);
    tweenEnemyRot = new TWEEN.Tween(enemy.rotation);
    var tweenEnemyRot2 = new TWEEN.Tween(enemy.rotation);
    tweenEnemyPos.to({x:20},100);
    tweenEnemyPos2.to({x:15},100);
    tweenEnemyPos.chain(tweenEnemyPos2);
    tweenEnemyRot.to({y:Math.PI/6},50);
    tweenEnemyRot2.to({y:Math.PI/6},50);
    tweenEnemyRot.chain(tweenEnemyRot2);
    tweenEnemyPos.start();
   // tweenEnemyRot.start(); This one looks weird currently. Gonna figure it out for the finished ver.
}

function enemyBlock(){ //Bulk's blocking animation.
    enemyLeftBrow.rotation.x = Math.PI/6;
    enemyRightBrow.rotation.x = -Math.PI/6;
    enemyBlocking=true;
//    enemyLeftArm.rotation.y = -Math.PI/2;
    //enemyLeftArm.rotation.z = 3*Math.PI/4;
    //enemyLeftArm.rotation.y = 0;
    var tweenL = new TWEEN.Tween(enemyLeftArm.rotation);
    tweenL.to({z:-Math.PI/4},0);
    var tweenFL = new TWEEN.Tween(enemyLeftForeArm.rotation);
    tweenFL.to({z:-Math.PI/4,x:5*Math.PI/3.1},0);
    tweenL.start();
    tweenFL.start();
    var tweenR = new TWEEN.Tween(enemyRightArm.rotation);
    tweenR.to({z:-Math.PI/4},0);
    var tweenFR = new TWEEN.Tween(enemyRightForeArm.rotation);
    tweenFR.to({z:-Math.PI/2,y:-5*Math.PI/2.5},0);
    tweenR.start();
    tweenFR.start();
    
}

function enemyFallDown(){ //Bulk being knocked down animation.
    enemyKDs++;
    enemyToNeutral(100);
    var tweenEnemyPos = new TWEEN.Tween(enemy.position);
    var tweenEnemyPos2 = new TWEEN.Tween(enemy.position);
    var tweenEnemyRot = new TWEEN.Tween(enemy.rotation);
    var tweenEnemyRot2 = new TWEEN.Tween(enemy.rotation);
    tweenEnemyRot.to({z:-Math.PI/6},500);
    tweenEnemyRot2.to({z:-Math.PI/2},150);
    tweenEnemyRot.chain(tweenEnemyRot2);
    tweenEnemyPos.to({x: 20},500);
    tweenEnemyPos.easing(TWEEN.Easing.Elastic.InOut);
    tweenEnemyPos.start();
    tweenEnemyPos2.to({y:enemy.position.y+1},150);
    setTimeout(function(){
        tweenEnemyRot.start();
        tweenEnemyPos2.start();
    }, 600);
    setTimeout(function(){
        if(enemyKDs==3)
                endGame();
            else
                countUp();
    }, 1600);
    
}

function checkEnemyGetUp(){ //The higher the count, the more likely Bulk will rise. Very small chance he won't by 10.
    var r = Math.random();
    if ((r >=0.5 && count == 9 || count == 10)|| (count < 3 && r >= .9) || ((count ==4 || count == 5) && r >=.85) || (count == 6 && r >=.8) || ((count==7 || count==8) && r>0.75)){
        enemyStatus=1;
        count=0;
        console.log(count);
        textMat.opacity=0;
        enemyHealth = 85;
        updateHealthBars();
        enemyToNeutral(900);
        setTimeout(function(){
            showFightText();
        },1000);
    }
}

////////////////////////////////////////////////GAME LOGIC///////////////////////////////////////////////////////////////
function checkPlayerDodge(attack){ //General structure: Check attack's number against player's dodge status. If hit, take damage. If blocked, take damage.
    var modifier=0; //0 = easy
    if(difficulty == 2)
        modifier = 5;
    if(difficulty == 1)
        modifier =15;
    if(attack == 1){ //Attack 1: Left punch. Requires player to dodge left.
        if(playerStatus ==4){
            playerHealth-=5+modifier/1.5;
            playerBlocked();
            enemyStatus=2;
        }
        else if(playerStatus!=2){
            playerHealth-=15 + modifier; //15 for easy, 20 for normal, 30 for hard. 50 is for test
            playerHitRight();
            enemyStatus=1; //Player misses out on vulnerable period if they get hit.
        }
        else
            enemyStatus=2;
    }
    
    if(attack == 2){ //Attack 2: Right punch. Requires player to dodge right.
        if(playerStatus ==4){
            playerHealth-=5+modifier/1.5;
            playerBlocked();
            enemyStatus=2;
        }
        else if(playerStatus!=3){
            playerHealth-=15 + modifier;
            playerHitLeft();
            enemyStatus=1;
        }
        else
            enemyStatus=2;
    }
    
    if(attack == 3){ //Attack 3: Special. Requires player to dodge. Blocking will not work.
        if(playerStatus == 4) //Force unblock if attempting to block the attack.
            unblock();
        if(playerStatus != 2 && playerStatus != 3){
            playerHealth-=25+ modifier*3.5; //25 for easy, 42.5 for normal, 77.5 for hard
            playerHitLeft();
            enemyStatus=1;
        }
        else enemyStatus=2;
    }
    updateHealthBars();
}
var enemyMidAttack = false;
function chooseEnemyAttack(){ 
    if(playerStatus!=6 && enemyStatus!=4 && !enemyMidAttack){ //Only select an attack if both fighters are standing and enemy isn't already attacking.
    enemyToNeutral(0); //Immediately return to neutral.
    enemyMidAttack=true;
    enemyLeftBrow.rotation.x = Math.PI/6; //BULK ANGRY EYEBROWS!
    enemyRightBrow.rotation.x = -Math.PI/6;
    var r = Math.random(); //Randomly choose next attack.
    if(r<= 0.225)
        enemyDelayedLeftPunch();
    if(r> 0.225 && r<= 0.45)
        enemyLeftPunch();
    if(r> 0.45 && r <= 0.675)
        enemyRightPunch();
    if(r> 0.675 && r<=0.9)
        enemyDelayedRightPunch();
    if(r> 0.9)
        enemySpecial();
    }
}

function checkEnemyBlock(){
    if(playerStatus<5){ //Don't allow player to hit Bulk mid-knockdown.
    if(enemyStatus==1){ //If enemy is neutral, roll for hit.
        var r = Math.random();
        if(r <= .75)
            enemyBlock();
        else
            enemyHit();
    }
    if(enemyStatus==2) //If enemy is vulnerable, hit him.
        enemyHit();
    //If enemy is immune, do nothing.
    }
}
var playerHB, enemyHB, playerOutline, enemyOutline;
function createHealthBars(){ //Create healthbars and the black bars underneath them.
    var playerHBGeom, playerHBMat;
    var enemyHBGeom, enemyHBMat;
    var outlineGeom, outlineMat, playerOutline, enemyOutline;
    playerHBGeom = new THREE.PlaneGeometry(10,1,10);
    playerHBMat = new THREE.MeshBasicMaterial({color:0x0000aa});
    playerHB = new THREE.Mesh(playerHBGeom, playerHBMat);
    outlineGeom = new THREE.PlaneGeometry(10.4,1.5,10);
    outlineMat = new THREE.MeshBasicMaterial({color:0x000000});
    playerOutline = new THREE.Mesh(outlineGeom,outlineMat);
    enemyHBGeom = new THREE.PlaneGeometry(10,1,10);
    enemyHBMat = new THREE.MeshBasicMaterial({color:0xaa0000});
    enemyHB = new THREE.Mesh(enemyHBGeom,enemyHBMat);
    enemyOutline = new THREE.Mesh(outlineGeom, outlineMat);
    scene.add(playerHB);
    scene.add(playerOutline);
    scene.add(enemyHB);
    scene.add(enemyOutline);
    enemyHB.rotateY(-Math.PI/2);
    enemyOutline.rotateY(-Math.PI/2);
    playerOutline.rotateY(-Math.PI/2);
    playerHB.rotateY(-Math.PI/2);
    playerHB.position.set(0,15,-10);
    playerOutline.position.set(0.0001,15,-10);
    enemyHB.position.set(0,15, 8);
    enemyOutline.position.set(0.00001,15,8);
}

function updateHealthBars(){
    if(playerHealth <= 0){ //Eliminate "negaitve" health.
        playerStatus=6;
        playerHealth=0;
    }
    if(enemyHealth <=0){
        enemyStatus=4;
        enemyFallDown();
        enemyHealth=0;
    }
  playerHB.scale.x = playerHealth/playerMaxHealth;
    playerHB.position.set(0,15,-10-5*((playerMaxHealth-playerHealth)/playerMaxHealth));
    enemyHB.scale.x = enemyHealth/enemyMaxHealth;
    enemyHB.position.set(0,15,8+5*((enemyMaxHealth-enemyHealth)/enemyMaxHealth));
}

function resumeFight(){
    textMat.opacity=0;
    count=0;
    if(playerStatus!=1){
        playerStatus=1;
        midAnimation=true;
        playerHealth=75;
        updateHealthBars();
        setTimeout(function () {
            midAnimation=false;
            chooseEnemyAttack();
        }, 1000);
    }
}

function endGame(){ //End the game and inform player of their win/loss.
    if(playerKDs ==3 || enemyKDs == 3) //Show the appropriate text and animation
        displayTKO();
    if(playerStatus ==6)
        enemyWinAnimation();
    if(enemyStatus ==4)
        playerWinAnimation();
    setTimeout(function(){
    if(playerStatus==6){
        alert("You lose!");
    }
    else if (enemyStatus==4){
        alert("You win!\nCongratulations!");
        if(difficulty!=1)
            alert("Try again on a higher difficulty!");
        else if (difficulty ==1 && playerHealth !=100)
            alert("You won on the highest difficulty! Try to win without taking any damage!");
        else if (difficulty ==1 && playerHealth == 100)
            alert("A perfect fight! Incredible!");
    }
    }, 5000);
}

document.addEventListener('keydown',function(event){ //Take in inputs.
    if(event.keyCode == 65)
        dodgeLeft();
    if(event.keyCode == 68)
        dodgeRight();
    if(event.keyCode == 83)
        block();
    if(event.keyCode == 74)
        leftBodyBlow();
    if(event.keyCode == 75)
        rightBodyBlow();
    if(event.keyCode == 73)
        rightPunch();
    if(event.keyCode == 85)
        leftPunch();
    if(event.keyCode == 13 && gameState==1)
        playIntroAnimation();
}                   );


document.addEventListener('keyup',function(event){ //Key is released. Only used to undo blocking.
    if(event.keyCode == 83)
        unblock();
}                        );

