var scene, camera, renderer, clock, deltaTime, totalTime, rendererStats, stats;
var arToolkitSource, arToolkitContext;
var markerRoot1, markerRoot2;
var mesh1;
initialize();
animate();

function initialize()
{
    scene = new THREE.Scene();

    let ambientLight = new THREE.AmbientLight( 0xcccccc, 0.5 );
    scene.add( ambientLight );
    
    camera = new THREE.Camera();
	scene.add(camera);
	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
    });
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	renderer.setSize( 640, 480 );
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
    document.body.appendChild( renderer.domElement );

    rendererStats = new THREEx.RendererStats()
    rendererStats.domElement.style.position	= 'absolute'
    rendererStats.domElement.style.left	= '0px'
    rendererStats.domElement.style.bottom	= '0px'
    document.body.appendChild( rendererStats.domElement )

    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.domElement );

	clock = new THREE.Clock();
	deltaTime = 0;
    totalTime = 0;
    
    arToolkitSource = new THREEx.ArToolkitSource({
		sourceType : 'webcam',
    });
    
    function onResize()
	{
		arToolkitSource.onResizeElement()	
		arToolkitSource.copyElementSizeTo(renderer.domElement)	
		if ( arToolkitContext.arController !== null )
		{
			arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)	
		}	
    }
    
    arToolkitSource.init(function onReady(){
		onResize()
	});

	window.addEventListener('resize', function(){
		onResize()
    });
    
    // create atToolkitContext
	arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: 'assets/data/camera_para.dat',
        detectionMode: 'mono_and_matrix',
        matrixCodeType: '3x3',
	});
	
	arToolkitContext.init( function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
    });
	markerRoot1 = new THREE.Group();
	
	scene.add(markerRoot1);
	let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
        type: 'barcode', 
        barcodeValue: 6, 
        smooth: true, 
        smoothCount: 8, 
        smoothTolerance: 0.015, 
        smoothThreshold: 2
	})

	let geometry = new THREE.PlaneGeometry(5,5);
	var loader = new THREE.TextureLoader();
	var material = new THREE.MeshLambertMaterial({
		map: loader.load('/assets/img/photo.png')
	});
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.y = 0.5;
	mesh.rotation.x = -Math.PI / 2;
	markerRoot1.add(mesh);

	markerControls1.addEventListener("markerFound", e => {
        console.log("found")
		mesh.scale.x =  mesh.scale.y =  mesh.scale.z = 0.1;
		anime({
			targets: mesh.scale,
			x:1,
			y:1,
			z:1,
			easing:'easeInBounce',
			round:1
		})
	});
}

function update()
{
    // update artoolkit on every frame
	if ( arToolkitSource.ready !== false )
        arToolkitContext.update( arToolkitSource.domElement );     
}

function render()
{
    stats.begin();
    renderer.render( scene, camera );
    rendererStats.update(renderer);
    stats.end();
}

function animate()
{
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	render();
}
