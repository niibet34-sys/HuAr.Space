import * as THREE from 'three'

type QualityPreset = {
  stars: number
  dust: number
  pixelRatio: number
}

type QuoteAnchor = {
  id: string
  position: THREE.Vector3
  phase: number
}

const TAU = Math.PI * 2

function seededRandom(seed: number) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function detectQuality(): QualityPreset {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const memory = nav.deviceMemory ?? 8
  const cores = nav.hardwareConcurrency ?? 8
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const shortEdge = Math.min(window.innerWidth, window.innerHeight)

  if (memory <= 4 || cores <= 4 || (coarse && shortEdge < 700)) {
    return { stars: 4200, dust: 900, pixelRatio: 1.35 }
  }

  if (coarse || memory <= 8 || cores <= 8) {
    return { stars: 7600, dust: 1500, pixelRatio: 1.7 }
  }

  return { stars: 12800, dust: 2600, pixelRatio: 2 }
}

export class UniverseEngine {
  private readonly container: HTMLElement
  private readonly quoteNodes = new Map<string, HTMLElement>()
  private readonly quoteAnchors: QuoteAnchor[]
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.PerspectiveCamera(58, 1, 0.1, 420)
  private readonly renderer: THREE.WebGLRenderer
  private readonly clock = new THREE.Clock()
  private readonly pointer = new THREE.Vector2()
  private readonly pointerTarget = new THREE.Vector2()
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  private readonly quality = detectQuality()
  private readonly nebulae: THREE.Mesh[] = []
  private animationFrame = 0
  private visible = true
  private focusId: string | null = null
  private resizeObserver: ResizeObserver

  constructor(container: HTMLElement, quoteIds: string[]) {
    this.container = container
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    })

    this.renderer.setClearColor(0x010208, 1)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.quality.pixelRatio))
    this.renderer.domElement.className = 'universe-canvas'
    this.renderer.domElement.setAttribute('aria-hidden', 'true')
    container.prepend(this.renderer.domElement)

    this.scene.background = new THREE.Color(0x010208)
    this.scene.fog = new THREE.FogExp2(0x02030a, 0.0065)
    this.camera.position.set(0, 0, 12)

    this.quoteAnchors = this.createQuoteAnchors(quoteIds)
    this.buildScene()
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(container)

    this.onPointerMove = this.onPointerMove.bind(this)
    this.onVisibilityChange = this.onVisibilityChange.bind(this)
    window.addEventListener('pointermove', this.onPointerMove, { passive: true })
    document.addEventListener('visibilitychange', this.onVisibilityChange)

    this.resize()
    this.start()
  }

  registerQuote(id: string, node: HTMLElement | null) {
    if (node) this.quoteNodes.set(id, node)
    else this.quoteNodes.delete(id)
  }

  focusQuote(id: string | null) {
    this.focusId = id
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame)
    this.resizeObserver.disconnect()
    window.removeEventListener('pointermove', this.onPointerMove)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)

    this.scene.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(material)) material.forEach((item) => item.dispose())
      else material?.dispose()
    })

    this.renderer.dispose()
    this.renderer.domElement.remove()
  }

  private buildScene() {
    this.createStarLayer(this.quality.stars, 0.085, 0.88, 17)
    this.createStarLayer(Math.floor(this.quality.stars * 0.32), 0.16, 0.7, 83)
    this.createDustLayer(this.quality.dust, 0.24, 211)
    this.createNebula(new THREE.Vector3(-22, 7, -95), 145, 0.19, 0.08)
    this.createNebula(new THREE.Vector3(31, -14, -135), 175, 0.13, 2.45)
  }

  private createStarLayer(count: number, size: number, opacity: number, seed: number) {
    const random = seededRandom(seed)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i += 1) {
      const spread = 46 + random() * 58
      positions[i * 3] = (random() - 0.5) * spread * 2.1
      positions[i * 3 + 1] = (random() - 0.5) * spread * 1.25
      positions[i * 3 + 2] = -4 - random() * 250

      const tint = random()
      colors[i * 3] = 0.72 + tint * 0.28
      colors[i * 3 + 1] = 0.78 + tint * 0.2
      colors[i * 3 + 2] = 0.92 + tint * 0.08
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    this.scene.add(new THREE.Points(geometry, material))
  }

  private createDustLayer(count: number, size: number, seed: number) {
    const random = seededRandom(seed)
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (random() - 0.5) * 115
      positions[i * 3 + 1] = (random() - 0.5) * 68
      positions[i * 3 + 2] = -18 - random() * 165
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      size,
      color: 0x7d8fb8,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const points = new THREE.Points(geometry, material)
    points.rotation.z = -0.08
    this.scene.add(points)
  }

  private createNebula(position: THREE.Vector3, size: number, opacity: number, seed: number) {
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uOpacity: { value: opacity },
        uSeed: { value: seed },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uOpacity;
        uniform float uSeed;
        uniform float uTime;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed * 31.7) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                     mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 5; i++) {
            value += amplitude * noise(p);
            p = p * 2.03 + 17.1;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          vec2 p = (vUv - 0.5) * vec2(2.2, 1.35);
          float radial = smoothstep(1.05, 0.05, length(p));
          float cloud = fbm(p * 2.4 + vec2(uTime * 0.006, -uTime * 0.004));
          cloud = smoothstep(0.38, 0.82, cloud) * radial;
          vec3 cold = vec3(0.08, 0.14, 0.31);
          vec3 violet = vec3(0.23, 0.08, 0.28);
          vec3 color = mix(cold, violet, smoothstep(-0.6, 0.8, p.x + cloud));
          gl_FragColor = vec4(color, cloud * uOpacity);
        }
      `,
    })

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size * 0.58), material)
    mesh.position.copy(position)
    mesh.rotation.z = seed * 0.31
    this.nebulae.push(mesh)
    this.scene.add(mesh)
  }

  private createQuoteAnchors(ids: string[]): QuoteAnchor[] {
    const random = seededRandom(731)
    return ids.map((id, index) => {
      const ring = index % 12
      const layer = Math.floor(index / 12)
      const angle = index * 2.399963229728653
      const radius = 7.5 + (ring % 5) * 2.6 + layer * 2.2
      const x = Math.sin(angle) * radius + (random() - 0.5) * 5
      const y = Math.cos(angle * 1.31) * (4.2 + (ring % 4) * 1.5) + (random() - 0.5) * 3
      const z = -10 - ring * 7.25 - layer * 4.5
      return { id, position: new THREE.Vector3(x, y, z), phase: random() * TAU }
    })
  }

  private onPointerMove(event: PointerEvent) {
    this.pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2
    this.pointerTarget.y = (event.clientY / window.innerHeight - 0.5) * 2
  }

  private onVisibilityChange() {
    this.visible = document.visibilityState === 'visible'
    if (this.visible) {
      this.clock.start()
      this.start()
    } else {
      cancelAnimationFrame(this.animationFrame)
    }
  }

  private resize() {
    const width = Math.max(this.container.clientWidth, 1)
    const height = Math.max(this.container.clientHeight, 1)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.quality.pixelRatio))
  }

  private start() {
    cancelAnimationFrame(this.animationFrame)
    const tick = () => {
      if (!this.visible) return
      this.renderFrame()
      this.animationFrame = requestAnimationFrame(tick)
    }
    this.animationFrame = requestAnimationFrame(tick)
  }

  private renderFrame() {
    const elapsed = this.clock.getElapsedTime()
    const motion = this.reducedMotion ? 0.18 : 1

    this.pointer.lerp(this.pointerTarget, 0.025)

    const focused = this.focusId ? this.quoteAnchors.find((item) => item.id === this.focusId) : null
    const focusX = focused ? THREE.MathUtils.clamp(focused.position.x * 0.075, -1.6, 1.6) : 0
    const focusY = focused ? THREE.MathUtils.clamp(focused.position.y * 0.075, -0.9, 0.9) : 0

    this.camera.position.x += ((this.pointer.x * 1.15 + focusX) * motion - this.camera.position.x) * 0.025
    this.camera.position.y += ((-this.pointer.y * 0.72 + focusY) * motion - this.camera.position.y) * 0.025
    this.camera.position.z = 12 + Math.sin(elapsed * 0.12) * 0.32 * motion
    this.camera.rotation.z = Math.sin(elapsed * 0.075) * 0.0025 * motion
    this.camera.lookAt(0, 0, -60)

    this.nebulae.forEach((mesh, index) => {
      const material = mesh.material as THREE.ShaderMaterial
      material.uniforms.uTime.value = elapsed
      mesh.rotation.z += (index === 0 ? 0.000018 : -0.000013) * motion
    })

    this.updateQuotes(elapsed, motion)
    this.renderer.render(this.scene, this.camera)
  }

  private updateQuotes(elapsed: number, motion: number) {
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    const projected = new THREE.Vector3()
    const world = new THREE.Vector3()

    this.quoteAnchors.forEach((anchor) => {
      const node = this.quoteNodes.get(anchor.id)
      if (!node) return

      const driftX = Math.sin(elapsed * 0.11 + anchor.phase) * 0.42 * motion
      const driftY = Math.cos(elapsed * 0.09 + anchor.phase * 1.7) * 0.24 * motion
      world.set(anchor.position.x + driftX, anchor.position.y + driftY, anchor.position.z)
      projected.copy(world).project(this.camera)

      const inFront = projected.z > -1 && projected.z < 1
      const inFrame = Math.abs(projected.x) < 1.18 && Math.abs(projected.y) < 1.18
      if (!inFront || !inFrame) {
        node.style.opacity = '0'
        node.style.pointerEvents = 'none'
        return
      }

      const cameraDistance = this.camera.position.distanceTo(world)
      const depthFade = THREE.MathUtils.smoothstep(115 - cameraDistance, 0, 88)
      const nearFade = THREE.MathUtils.smoothstep(cameraDistance, 8, 24)
      const opacity = Math.max(0, Math.min(1, depthFade * nearFade))
      const isFocused = this.focusId === anchor.id
      const isDimmed = Boolean(this.focusId && !isFocused)
      const scale = THREE.MathUtils.clamp(1.62 - cameraDistance / 110, 0.54, 1.12) * (isFocused ? 1.08 : 1)
      const blur = isFocused ? 0 : THREE.MathUtils.clamp((cameraDistance - 55) / 35, 0, 1.8)
      const x = (projected.x * 0.5 + 0.5) * width
      const y = (-projected.y * 0.5 + 0.5) * height

      node.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`
      node.style.opacity = String(opacity * (isDimmed ? 0.14 : 1))
      node.style.filter = `blur(${blur}px)`
      node.style.zIndex = String(Math.round(1000 - cameraDistance))
      node.style.pointerEvents = opacity > 0.28 && cameraDistance < 82 ? 'auto' : 'none'
      node.dataset.depth = cameraDistance < 42 ? 'near' : cameraDistance < 72 ? 'mid' : 'far'
      node.dataset.focused = String(isFocused)
    })
  }
}
