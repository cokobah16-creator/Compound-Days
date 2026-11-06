'use strict';

// Bake the new parts into the existing meshes, using the same low-poly primitives as the vehicles.
function shoreGearMeshes() {
  const frame = veh40Bag('shore-table-frame');
  const top = veh40Bag('shore-table-planks');
  const gear = veh40Bag('shore-table-gear');
  const indigo = ['#567586', '#415b70'];
  for (const x of [-1.38, 1.38]) {
    for (const z of [-.46, .46]) {
      veh40Box(frame, indigo, x - .08, x + .08, .02, .82, z - .075, z + .075, .02);
      veh40Box(frame, '#3f4644', x - .085, x + .085, .018, .085, z - .08, z + .08, .012);
    }
    veh40Box(frame, indigo, x - .065, x + .065, .25, .34, -.46, .46);
  }
  for (const z of [-.46, .46]) {
    veh40Box(frame, indigo, -1.44, 1.44, .69, .82, z - .048, z + .048);
    veh40Box(frame, '#79583c', -1.44, 1.44, .27, .32, z - .048, z + .048);
  }

  const planks = ['#b2885d', '#a97a51', '#bd9165', '#b6855c', '#a67a55'];
  planks.forEach((color, i) => {
    const z = -.55 + i * .22;
    veh40Box(top, [color, '#825a3c'], -1.54, 1.54, .81, .90, z, z + .212, .018);
  });
  veh40Box(top, '#99724c', -1.42, 1.42, .32, .37, -.43, .43);

  // Woven basket, an enamel bait tin and a coil of rope give the counter a recognisable use.
  veh40Add(gear, veh40CylTris(.29, .22, .26, 10), ['#9d703d', '#bc9456'], [-.91, 1.03, .05]);
  veh40Add(gear, veh40CylTris(.245, .23, .012, 10), '#6c482c', [-.91, 1.165, .05]);
  for (const y of [.96, 1.02, 1.09, 1.15]) {
    veh40Add(gear, veh40CylTris(.23 + (y - .96) * .32, .23 + (y - .96) * .32, .022, 10), '#d1ac6a', [-.91, y, .05]);
  }
  veh40Box(gear, '#b5c8b7', .83, 1.27, .90, 1.06, -.19, .13, .035);
  veh40Box(gear, '#52796f', .82, 1.28, 1.06, 1.09, -.20, .14, .025);
  veh40Box(gear, '#ede0b8', .91, 1.18, .94, 1.015, .131, .137, .004);

  const ropePoint = step => {
    const angle = step * .52, radius = .29 - step * .007;
    return [.05 + Math.cos(angle) * radius, .931 + step * .0006, .08 + Math.sin(angle) * radius];
  };
  for (let i = 0; i < 26; i++) {
    veh40Rod(gear, i % 3 === 0 ? '#c8a572' : '#d9bd88', ropePoint(i), ropePoint(i + 1), .041);
  }
  veh40Rod(gear, '#b68c57', [-.37, .935, -.36], [1.25, .935, -.36], .032);
  veh40Add(gear, veh40BallTris(.055, 8, 5), '#c75940', [.24, .955, -.30], null, [1, .76, .76]);
  return [frame, top, gear];
}

function suyaGrillMesh() {
  const grill = veh40Bag('suya-charcoal-grill');
  const tray = ['#5b5850', '#3c3833'];
  const rim = ['#858274', '#56514a'];
  veh40Box(grill, tray, -.58, .58, .90, .983, -.26, .26, .026);
  for (const x of [-.555, .555]) {
    veh40Box(grill, tray, x - .044, x + .044, .958, 1.147, -.273, .273, .02);
    veh40Box(grill, rim, x - .058, x + .058, 1.133, 1.165, -.282, .282, .012);
  }
  for (const z of [-.247, .247]) {
    veh40Box(grill, tray, -.555, .555, .958, 1.147, z - .037, z + .037, .018);
    veh40Box(grill, rim, -.58, .58, 1.133, 1.165, z - .05, z + .05, .01);
  }
  for (let i = 0; i < 9; i++) {
    const x = -.465 + i * .116;
    veh40Box(grill, '#8c8678', x - .013, x + .013, 1.135, 1.158, -.24, .24, .006);
  }
  const coal = veh40BallTris(1, 6, 4);
  for (let i = 0; i < 19; i++) {
    const x = -.47 + (i % 7) * .15, z = -.145 + Math.floor(i / 7) * .135;
    veh40Add(grill, coal, i % 3 ? '#383331' : '#514642', [x, 1.047, z], [0, i, .2], [.057 + (i % 4) * .008, .038, .052]);
  }
  for (let i = 0; i < 5; i++) {
    const x = -.39 + i * .183;
    veh40Rod(grill, '#d4a66b', [x, 1.176, -.326], [x + .049, 1.18, .326], .025);
    for (let j = 0; j < 3; j++) {
      const z = -.152 + j * .117;
      veh40Add(grill, veh40BevTris(.103, .065, .105, .023),
        (i + j) % 2 ? ['#ac6343', '#723e2a'] : ['#9b5538', '#643522'],
        [x + .014 + .009 * j, 1.19, z], [.12, (i - j) * .21, .08]);
    }
  }
  return grill;
}

function softenGrillSmoke(material) {
  material.depthWrite = false;
  material.onBeforeCompile = shader => {
    const facing = '\n varying float smokeFacing;';
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>' + facing)
      .replace('#include <defaultnormal_vertex>', '#include <defaultnormal_vertex>\n smokeFacing = normalize(transformedNormal).z;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>' + facing)
      .replace('#include <alphatest_fragment>', 'diffuseColor.a *= smoothstep(0.08, 0.9, smokeFacing);\n #include <alphatest_fragment>');
  };
}

// Wrap world construction to redress the two static tables and the grill on their original footprints.
if (typeof veh40Fill === 'function' && typeof buildWorld === 'function') {
  const buildWaterfrontWorld = buildWorld;
  buildWorld = function () {
    const result = buildWaterfrontWorld.apply(this, arguments);
    const tables = [[-8, 14.6], [9, 15.1]].map(([x, z]) => scene.children.find(obj =>
      obj.isGroup && obj.position.x === x && obj.position.z === z && obj.children.length === 3)).filter(Boolean);
    const changed = new Set(tables.flatMap(table => table.children));
    const tableMeshes = shoreGearMeshes();
    for (const table of tables) {
      table.name = 'waterfront-gear-table';
      veh40Fill(table, tableMeshes);
    }
    // The old wood meshes are registered for preset repainting. The new ones carry their own colours.
    ENV23.surfaces = ENV23.surfaces.filter(({m}) => !changed.has(m));
    const grill = scene.children.find(obj => obj.isMesh && obj.position.x === -3 && obj.position.z === 12.3 &&
      obj.geometry.parameters?.width === 1.2);
    if (grill) {
      veh40Fill({children: [grill]}, [suyaGrillMesh()]);
      grill.position.set(-3, 0, 12.3);
    }
    for (const puff of smokes) softenGrillSmoke(puff.material);
    return result;
  };
}

// Wrap the existing glow mesh so embers show between the charcoal and grate.
if (typeof mallamGlowMesh40 === 'function') {
  const buildMallamGlow = mallamGlowMesh40;
  mallamGlowMesh40 = function () {
    const glow = buildMallamGlow.apply(this, arguments);
    glow.position.y = 1.019;
    glow.scale.set(.96, .96, 1);
    return glow;
  };
}

// Wrap the original rise cycle with gentler smoke, drifting away from the serving spot.
const animateGrillSmoke = animSmoke;
animSmoke = function (dt) {
  animateGrillSmoke(dt);
  const glow = typeof MALLAM40 !== 'undefined' ? MALLAM40.world.glow : null;
  const heat = glow?.parent ? clamp((glow.material.color.r - .16) / .84, 0, 1) : Number(!!S && S.time >= 17.5 && S.time < 22);
  smokes.forEach((puff, i) => {
    puff.visible = heat > 0;
    const rise = Math.max(0, puff.position.y - 1.3);
    puff.position.x = -3.12 - .36 * rise + i * .035;
    puff.position.z = 12.3 + .20 * rise;
    puff.scale.set(.56 + .62 * rise, .68 + .38 * rise, .56 + .62 * rise);
    puff.material.opacity *= .50 * heat * Math.min(1, rise * 6);
  });
};
